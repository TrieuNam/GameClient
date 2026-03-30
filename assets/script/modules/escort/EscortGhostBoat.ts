/** 幽灵船 */
import { BaseItem, BaseItemGL } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { EscortData, ESCORT_OPER_TYPE } from "./EscortData";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";
import { CfgItem } from "config/CfgCommon";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { EscortCtrl } from "./EscortCtrl";
import { COLORSTR } from "modules/common/ColorEnum";
import { RedPoint } from "modules/extends/RedPoint";
import { CfgEscortData } from "config/CfgEscort";
import { Language } from "modules/common/Language";
import { Timer } from "modules/time/Timer";
import { TimeHelper } from "../../helpers/TimeHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { math } from "cc";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";

export class EscortGhostBoatItem extends BaseItem {
    private over_time = 0;

    protected viewNode = {
        BtnChallenge: <CommonButtonBuy>null,
        Timer: <TimeMeter>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnChallenge.onClick(this.onChallenge.bind(this));
    }

    public FlushTime() {
        let today_time = TimeCtrl.Inst().todayStarTime;
        let over_time = today_time + EscortData.ghost_over_time;
        let cur_time = TimeCtrl.Inst().ServerTime;
        let sec = over_time - cur_time;
        if (sec > 0 && over_time != this.over_time) {
            this.over_time = over_time;
            this.viewNode.Timer.SetOutline(true, COLORSTR.Green2)
            this.viewNode.Timer.TotalTime(sec, TimeFormatType.TYPE_TIME_5, Language.Escort.GhostTimeDesc);
        }
    }

    public SetRed() {
        this.viewNode.BtnChallenge.GetRedPoint().SetNum(EscortData.Inst().GetGhostFirstRed());
    }

    private onChallenge() {
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.OPER_BOSS_FIGHT)
    }
}

export class EscortGhostRewardItem extends BaseItem {
    protected viewNode = {
        ListReward: <fgui.GList>null,
        BtnPreView: <fgui.GButton>null,
        GpPreView: <fgui.GGroup>null,
        IconBg: <fgui.GImage>null,
        Icon: <fgui.GImage>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnPreView.onClick(this.ChangePreView.bind(this));
    }

    public FlushList() {
        this.viewNode.ListReward.SetData(EscortData.Inst().GetGhostRewardList());
    }

    private list_scrollPane: fgui.ScrollPane;
    private max_pos_y: number;
    public FlushScrPoY() {
        if (!this.list_scrollPane)
            this.list_scrollPane = this.viewNode.ListReward.scrollPane;
        if (!this.max_pos_y)
            this.max_pos_y = CfgEscortData.harm_rank.length * 63 - 262
        let index = EscortData.Inst().GetGhostRewardScrIdx();
        let to_posY = Math.min(this.max_pos_y, index * 63);
        if (this.list_scrollPane)
            this.list_scrollPane.setPosY(to_posY)
    }

    private ChangePreView() {
        this.viewNode.GpPreView.visible = !this.viewNode.GpPreView.visible;
        this.viewNode.BtnPreView.rotation = this.viewNode.GpPreView.visible ? 0 : 90;
    }
}

export class EscortGhostRewardCell extends BaseItem {
    protected viewNode = {
        TxtDamage: <fgui.GTextField>null,
        RewardCell: <ItemCell>null,
        ImgLock: <fgui.GImage>null,
        ImgFetched: <fgui.GImage>null,
        Block: <fgui.GGraph>null,
        redPoint: <RedPoint>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Block.onClick(this.onFetch.bind(this));
    }

    public SetData(data: { seq: number, show_hart: number, win: CfgItem, is_lock: boolean, is_fetch: boolean }) {
        this._data = data;
        let desc: any = data.show_hart
        let mil = Math.floor(data.show_hart / 10000000);
        if (mil >= 1) {
            desc = mil + Language.Common.QianWan
        } else {
            let wan = Math.floor(data.show_hart / 10000);
            if (wan >= 1) {
                desc = wan + Language.Common.Wan
            }
        }
        UH.SetText(this.viewNode.TxtDamage, desc);
        this.viewNode.RewardCell.SetData(Item.Create(data.win, { is_num: true, mask_icon: data.is_lock || data.is_fetch, eff: -1 }));
        this.viewNode.ImgLock.visible = data.is_lock;
        this.viewNode.ImgFetched.visible = data.is_fetch;
        let is_reward = !data.is_fetch && !data.is_lock;
        this.viewNode.Block.visible = is_reward
        this.viewNode.redPoint.SetNum(is_reward ? 1 : 0)
    }

    private onFetch() {
        if (this._data)
            EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.OPER_HARM_REWARD, this._data.seq);
    }
}

export class GhostTimer extends BaseItem {
    private handle: any
    protected viewNode = {
        time: <fgui.GTextField>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.onStartTimer();
    }

    private time: number
    private onStartTimer() {
        Timer.Inst().CancelTimer(this.handle);
        let cur_time = Math.floor(TimeCtrl.Inst().ServerTime);
        let today_time = Math.floor(TimeCtrl.Inst().todayStarTime);
        let open_time = today_time + EscortData.ghost_open_time;
        let over_time = today_time + EscortData.ghost_over_time;
        let is_open = cur_time >= open_time && cur_time < over_time;
        let ghost_next_status_time: number;
        if (is_open) {
            ghost_next_status_time = over_time;
        } else {
            if (cur_time >= over_time) {
                ghost_next_status_time = open_time + 86400;
            } else
                ghost_next_status_time = open_time;
        }
        this.time = ghost_next_status_time - cur_time;
        if (is_open) {
            this.visible = false;
            this.handle = Timer.Inst().AddRunTimer(this.onStartTimer.bind(this), this.time, 1, false)
        } else {
            if (this.time > 0) {
                this.visible = true;
                this.handle = Timer.Inst().AddRunTimer(this.onTimer.bind(this), 1, -1)
            }
            else
                this.onStartTimer();
        }
    }

    private onTimer() {
        this.time--;
        if (this.time >= 0) {
            let time_t = TimeHelper.FormatDHMS(this.time)
            let t_str = ""
            if (time_t.minute != 0)
                t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr7, time_t.hour + (time_t.day * 24), time_t.minute);
            else
                t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr8, time_t.minute, time_t.second);
            UH.SetText(this.viewNode.time, t_str)
        } else {
            this.onStartTimer();
        }
    }

    onDestroy() {
        Timer.Inst().CancelTimer(this.handle);
    }
}


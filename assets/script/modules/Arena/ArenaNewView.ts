import { SpriteFrame } from "cc";
import { CfgArenaData } from "config/CfgArena";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { OTHER_ROLE_REQ_TYPE, OtherRoleCtrl } from "modules/OtherRole/OtherRoleCtrl";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { CommonId, ICON_TYPE, RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RankCtrl } from "modules/rank/RankCtrl";
import { ShopView } from "modules/shop/ShopView";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TYPE_TIMER, Timer } from "modules/time/Timer";
import { TrialRewardView } from "modules/trial/TrialRewardView";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ARENA_OP_TYPE, ArenaCtrl } from "./ArenaCtrl";
import { ArenaData } from "./ArenaData";
import { ArenaRecordView } from "./ArenaRecordView";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { PeakArenaCtrl, CROSS_AREN_OP_TYPE } from "modules/PeakArena/PeakArenaCtrl";

@BaseView.registView
export class ArenaNewView extends BaseView {
    private show_list: any
    private time_handle: any
    private realtime = 0
    private flush_need = 0
    private flush_item = 0

    private _timer_BtnRefresh: TYPE_TIMER = undefined;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PeakArena",
        ViewName: "PeakArenaView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "PeakMainCellNew", ExtendsClass: ArenaMainCellNew },
    ]
    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        Ticket: <fgui.GLabel>null,
        TicketIcon: <fgui.GLoader>null,
        Timer: <TimeMeter>null,

        PlusTicket: <fgui.GButton>null,
        BtnRecord: <fgui.GButton>null,
        BtnFlush: <CommonButtonBuy>null,
        //BtnDayReward: <fgui.GButton>null,

        HuoBiIcon: <fgui.GLoader>null,
        HuoBiNum: <fgui.GLabel>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(ArenaNewView, Language.PeakArena.EnterName[0], 8))

        this.viewNode.BtnRecord.onClick(this.OnClickRecord.bind(this));
        this.viewNode.BtnFlush.onClick(this.OnClickFlush.bind(this));
        this.viewNode.PlusTicket.onClick(this.OnClickPlusTicket.bind(this));
        //this.viewNode.BtnDayReward.onClick(this.OnClickDayReward.bind(this));

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushPanelInfo.bind(this), "OtherChange");
        this.AddSmartDataCare(ArenaData.Inst().result_info, this.flushPanelInfo.bind(this), "arena_info");

        // this.viewNode.List.setVirtual();
        this.viewNode.List.defaultItem = fgui.UIPackage.getItemURL("PeakArena", "PeakMainCellNew");
        UH.SetIcon(this.viewNode.TicketIcon, ArenaData.Inst().GetChallengeCostId(), ICON_TYPE.ITEM);
        UH.SetIcon(this.viewNode.HuoBiIcon, CommonId.Gold, ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.HuoBiNum, ArenaData.Inst().RefreshEqualCost());
        this.viewNode.HuoBiIcon.visible = true
        this.viewNode.HuoBiNum.visible = true
        //this.viewNode.BtnDayReward.visible = false


        this.viewNode.Timer.SetOutline(true, COLORSTR.Yellow2)
        this.viewNode.Timer.SetCallBack(this.FlushEndTime.bind(this));
        this.FlushEndTime();
        // this.viewNode.Timer.TotalTime(TimeCtrl.Inst().GetNextWeekMonTime() - TimeCtrl.Inst().ServerTime,
        //     TimeFormatType.TYPE_TIME_3, Language.PeakArena.WeekEndTimer);

        this.flushPanelInfo()
        this.FlushCd();
        ChannelAgent.Inst().OnMessage(GameToChannel.view_o_Arena);

    }
    OpenCallBack(): void {
        if (!ArenaData.Inst().result_info.arena_info || !ArenaData.Inst().result_info.arena_info.roleinfo)
            ArenaCtrl.Inst().SendArenaReq(ARENA_OP_TYPE.ARENA_OP_INFO);

    }
    CloseCallBack() {
        this.viewNode.Timer.CloseCountDownTime();
        if (this._timer_BtnRefresh != undefined) {
            Timer.Inst().CancelTimer(this._timer_BtnRefresh)
            this._timer_BtnRefresh = undefined;
        }
        RankCtrl.Inst().SendRankReq(RANK_TYPE.Arena);
    }
    private flushPanelInfo() {
        if (BattleCtrl.Inst().check(this, this.flushPanelInfo.bind(this))) {
            return
        }

        // let detail = PeakArenaData.Inst().GetMainDetail()
        UH.SetText(this.viewNode.Ticket, ArenaData.Inst().GetFightTimes());
        // this.viewNode.ImgTimesMax.visible = ArenaData.Inst().IsChallengeTimeMax();

        this.viewNode.List.SetData(ArenaData.Inst().GetEquilList())
        // // this.viewNode.BtnFlush.SetData({icon:detail.huobiIcon,num:detail.huobiNeed})

        // UH.SetIcon(this.viewNode.HuoBiIcon, detail.huobiIcon, ICON_TYPE.ITEM);
        // UH.SetText(this.viewNode.HuoBiNum, detail.huobiNeed);

        // UH.SetIcon(this.viewNode.TicketIcon, detail.ticketIcon, ICON_TYPE.ITEM);
        // UH.SetText(this.viewNode.Ticket, detail.ticketNum);

        // this.viewNode.BtnFlush.grayed = detail.temp_time > 0
        // this.flush_need = detail.huobiNeed
        // this.flush_item = detail.huobiIcon

        // if (detail.temp_time > 0) {
        //     Timer.Inst().CancelTimer(this.time_handle);
        //     this.time_handle = undefined
        //     this.realtime = 0;
        //     this.time_handle = Timer.Inst().AddCountDownTT(
        //         this.FlushUpdateTime.bind(this, detail.temp_time),
        //         this.FlushFlushTime.bind(this),
        //         detail.temp_time, 1);
        // }
        // else {
        //     this.viewNode.BtnFlush.title = Language.PeakArena.BtnFlush
        // }

        // RankCtrl.Inst().SendRankReq(RANK_TYPE.CrossArena);
    }

    private FlushEndTime() {
        let time = ArenaData.Inst().GetEndTime() - TimeCtrl.Inst().ServerTime;
        if (time < 0) {
            this.viewNode.Timer.CloseCountDownTime();
        } else {
            this.viewNode.Timer.TotalTime(time, TimeFormatType.TYPE_TIME_3, Language.PeakArena.WeekEndTimer);
        }
    }

    private FlushUpdateTime(total_time: number) {
        // let time = Math.max(total_time - this.realtime, 0);
        // let time_t = TimeHelper.FormatDHMS(time);

        // let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr9, time_t.minute, time_t.second);
        // this.viewNode.BtnFlush.title = t_str
        // this.realtime = this.realtime + 1
    }

    private FlushFlushTime() {
        this.flushPanelInfo()


        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined
    }

    private OnClickRecord() {
        ArenaCtrl.Inst().SendArenaReq(ARENA_OP_TYPE.REPORT);
        ViewManager.Inst().OpenView(ArenaRecordView);
    }
    private OnClickFlush() {
        if (Item.GetNum(CommonId.Gold) < ArenaData.Inst().RefreshEqualCost()) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(CommonId.Gold);
            return;
        }
        if (this._timer_BtnRefresh != undefined) {
            Timer.Inst().CancelTimer(this._timer_BtnRefresh)
        }
        let next_time = Math.floor(TimeCtrl.Inst().ServerTime) + ArenaData.Inst().RefreshEqualCd();
        LocalStorageHelper.PrefsInt(LocalStorageHelper.ArenaCd(), next_time);
        this.FlushCd();
        ArenaCtrl.Inst().SendArenaReq(ARENA_OP_TYPE.REFRESH);
    }


    public FlushCd() {
        let next_time = LocalStorageHelper.PrefsInt(LocalStorageHelper.ArenaCd()) ?? 0;
        let time = next_time - Math.floor(TimeCtrl.Inst().ServerTime);
        if (time >= 0) {
            let time_t = TimeHelper.FormatDHMS(time);
            let desc = TextHelper.Format(Language.UiTimeMeter.TimeStr8, time_t.minute, time_t.second)
            this.viewNode.BtnFlush.title = desc;
            this.viewNode.BtnFlush.grayed = true;
            this.viewNode.BtnFlush.enabled = false;
            // this.viewNode.BtnFlush.showIcon(false);
            if (!this._timer_BtnRefresh) {
                this._timer_BtnRefresh = Timer.Inst().AddRunTimer(() => {
                    this.FlushCd();
                }, 1, -1, false);
            }
        } else {
            if (this._timer_BtnRefresh != undefined) {
                Timer.Inst().CancelTimer(this._timer_BtnRefresh)
            }
            this.viewNode.BtnFlush.grayed = false;
            this.viewNode.BtnFlush.enabled = true;
            // this.viewNode.BtnFlush.showIcon(true);
            this.viewNode.BtnFlush.title = Language.OpenServer.NeoShopFlush;
        }
    }


    private OnClickPlusTicket() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(ShopView);
    }

    private OnClickDayReward() {
        ViewManager.Inst().OpenView(TrialRewardView, { title: Language.Arena.day_reward, tip: Language.Arena.day_reward_tip, list_data: ArenaData.Inst().GetDayRewardList() });
    }
}

// {item_id;}
export class ArenaMainCellNew extends fgui.GComponent {
    public avatar_out_texture: SpriteFrame | 0 | undefined = undefined;
    private time_handle: any
    private realtime: any
    private wait_time = 300
    private viewNode = {
        RoleAvatar: <AvatarCell>null,
        Name: <fgui.GLabel>null,
        Point: <fgui.GLabel>null,
        Level: <fgui.GLabel>null,
        BtnChange: <fgui.GButton>null,
        RedPoint: <RedPoint>null,
        Icon1: <fgui.GLoader>null,
        Icon2: <fgui.GLoader>null,
        Num1: <fgui.GTextField>null,
        Num2: <fgui.GTextField>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.BtnChange.onClick(this.OnClickChange.bind(this));
        this.viewNode.RoleAvatar.onClick(this.OtherRoleInfo.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetText(this.viewNode.Name, data.name)
        UH.SetText(this.viewNode.Point, data.score + Language.PeakArena.PointShow)
        // UH.SetText(this.viewNode.Server, TextHelper.Format(Language.PeakArena.ServerShow, DataHelper.Uid2ServerId(data.role_id)))
        UH.SetText(this.viewNode.Level, "Lv." + data.level);

        this.viewNode.RoleAvatar.SetData(new AvatarData(data.head_pic, null, data.headChar));

        // let temp_time = data.last_time + this.wait_time - TimeCtrl.Inst().ServerTime

        // // LogError("?ASf ",temp_time,data.last_time , this.wait_time , TimeCtrl.Inst().ServerTime)
        // Timer.Inst().CancelTimer(this.time_handle);
        // this.time_handle = undefined

        // this.viewNode.BtnChange.grayed = data.challenged || temp_time > 0

        // let num = Item.GetNum(CfgDFArena.df_arena_cfg[0].sarena_challenger_id)
        // let flag = num > 0 && !(data.challenged || temp_time > 0)
        // this.viewNode.RedPoint.SetNum(flag ? 1 : 0)

        let item1 = CfgArenaData.arena_cfg[0].succ[0];
        let item2 = CfgArenaData.arena_cfg[0].succ[1];
        UH.SetIcon(this.viewNode.Icon1, item1.item_id, ICON_TYPE.ITEM);
        UH.SetIcon(this.viewNode.Icon2, item2.item_id, ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.Num1, item1.num);
        UH.SetText(this.viewNode.Num2, item2.num)
    }

    public OnClickChange() {
        if (this.data) {
            ArenaData.Inst().sendChallenge(this.data, ARENA_OP_TYPE.FIGHT);
        }
    }


    onDestroy() {
        super.onDestroy();
        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined;
        this.realtime = 0;
    }

    private OtherRoleInfo() {
        if (this.data) {
            if (this.data.role_id < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(OTHER_ROLE_REQ_TYPE.ARENA, this.data.score, this.data.role_id);
        }
    }
}


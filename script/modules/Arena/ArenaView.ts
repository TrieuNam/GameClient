import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { OTHER_ROLE_REQ_TYPE, OtherRoleCtrl } from "modules/OtherRole/OtherRoleCtrl";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { CommonId, ICON_TYPE, RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { RoleData } from "modules/role/RoleData";
import { ShopView } from "modules/shop/ShopView";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TYPE_TIMER, Timer } from "modules/time/Timer";
import { TrialRewardView } from "modules/trial/TrialRewardView";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { ARENA_OP_TYPE, ArenaCtrl } from "./ArenaCtrl";
import { ArenaData, ArenaEqualData } from "./ArenaData";
import { ArenaRecordView } from "./ArenaRecordView";



@BaseView.registView
export class ArenaView extends BaseView {
    private lange = Language.Arena;
    private _timer_BtnRefresh: TYPE_TIMER = undefined;

    private time_handle: any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Arena",
        ViewName: "ArenaView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        ListPro: <fgui.GList>null,
        Pro: <fgui.GProgressBar>null,
        BtnDayReward: <fgui.GButton>null,
        BtnRecord: <fgui.GButton>null,
        BtnRefresh: <ButtonArena2>null,
        Equal0: <ArenaEqual>null,
        Equal1: <ArenaEqual>null,
        Equal2: <ArenaEqual>null,
        Timer: <TimeMeter>null,
        TxtChallengedTimes: <fgui.GTextField>null,
        TxtRank: <fgui.GTextField>null,
        TxtScore: <fgui.GTextField>null,
        TxtTimes: <fgui.GTextField>null,
        BtnAddTimes: <fgui.GButton>null,
        TxtName: <fgui.GTextField>null,
        TxtPower: <fgui.GTextField>null,
        Head: <AvatarCell>null,
        ImgTimesMax: <fgui.GImage>null,
        RankImg: <fgui.GLoader>null,
        ItemIcon: <fgui.GLoader>null,
        TxtRefreshCost: <fgui.GTextField>null,
        TxtLevel: <fgui.GTextField>null,
        equals: <fgui.GGroup>null,
    }

    protected extendsCfg = [
        { ResName: "ArenaRewardCell", ExtendsClass: ArenaRewardCell },
        { ResName: "ArenaEqual", ExtendsClass: ArenaEqual },
        { ResName: "ButtonArena2", ExtendsClass: ButtonArena2 },
    ];

    InitData() {
        ArenaData.Inst().rank_sm_info.flush_pos = !ArenaData.Inst().rank_sm_info.flush_pos;
        RankData.Inst().clearRankData(RANK_TYPE.Arena);
        this.viewNode.Head.SetData(new AvatarData(RoleData.Inst().GetRoleHeadPic(), null, RoleData.Inst().ResultData.roleinfo.headChar));
        UH.SetText(this.viewNode.TxtLevel, "Lv." + RoleData.Inst().GetRoleLevel());
        this.viewNode.Board.SetData(new BoardData(ArenaView, null, 8));
        this.viewNode.ListPro.setVirtual();
        this.viewNode.Pro.max = ArenaData.Inst().GetWeeklyJoinMaxValue();
        this.viewNode.BtnDayReward.onClick(this.onClickBtn.bind(this, "BtnDayReward"));
        this.viewNode.BtnRecord.onClick(this.onClickBtn.bind(this, "BtnRecord"));
        this.viewNode.BtnRefresh.onClick(this.onClickBtn.bind(this, "BtnRefresh"));
        this.viewNode.BtnAddTimes.onClick(this.onClickBtn.bind(this, "BtnAddTimes"));
        this.AddSmartDataCare(ArenaData.Inst().result_info, this.FlushMainInfo.bind(this), "arena_info");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCur.bind(this), "OtherChange");
        this.viewNode.Timer.SetCallBack(this.FlushEndTime.bind(this));
        this.viewNode.Timer.SetOutline(true, COLORSTR.Green2, 2);
        UH.SetIcon(this.viewNode.ItemIcon, ArenaData.Inst().GetChallengeCostId(), ICON_TYPE.ITEM);
        this.FlushEndTime();
        this.FlushMyInfo();
        this.FlushMainInfo();
        this.FlushCur();
        ChannelAgent.Inst().OnMessage(GameToChannel.view_o_Arena);
        this.FlushCd();
        UH.SetText(this.viewNode.TxtRefreshCost, ArenaData.Inst().RefreshEqualCost());
        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = Timer.Inst().AddRunFrameTimer(() => {
            this.viewNode.equals.visible = true;
        }, 3, 1, false)
    }

    InitUI() {
    }

    private FlushMainInfo() {
        if (BattleCtrl.Inst().check(this, this.FlushMainInfo.bind(this))) {
            return
        }
        let data = ArenaData.Inst().GetArenaMainData();
        if (data) {
            this.viewNode.Pro.value = data.weekBoxProgress;
            this.viewNode.ListPro.SetData(ArenaData.Inst().GetWeeklyJoinListData());
            let times = TextHelper.RichTextOutLine(TextHelper.ColorStr(data.weekBoxProgress, COLORSTR.White), COLORSTR.Yellow2, 2);
            UH.SetText(this.viewNode.TxtChallengedTimes, this.lange.challenged + times);
            if (data.nowRank == 0) {
                UH.SetText(this.viewNode.TxtRank, this.lange.no_rank);
                this.viewNode.RankImg.visible = false
            } else if (data.nowRank <= 3) {
                this.viewNode.RankImg.visible = true
                UH.SpriteName(this.viewNode.RankImg, "CommonAtlas", `ShiLianZhiTa${data.nowRank}`)
                UH.SetText(this.viewNode.TxtRank, "")
            } else {
                this.viewNode.RankImg.visible = false
                UH.SetText(this.viewNode.TxtRank, data.nowRank);
            }
            let score = TextHelper.RichTextOutLine(TextHelper.ColorStr(data.nowScore, COLORSTR.White), COLORSTR.Yellow2, 2);
            UH.SetText(this.viewNode.TxtScore, this.lange.cur_score + score);
            let list = ArenaData.Inst().GetEquilList();
            for (let i = 0; i < list.length; i++) {
                let item = (this.viewNode as any)["Equal" + i]
                if (item) {
                    item.SetData(list[i]);
                }
            }
        }
    }

    public FlushCur() {
        UH.SetText(this.viewNode.TxtTimes, ArenaData.Inst().GetFightTimes());
        this.viewNode.ImgTimesMax.visible = ArenaData.Inst().IsChallengeTimeMax();
    }

    public FlushMyInfo() {
        UH.SetText(this.viewNode.TxtName, RoleData.Inst().GetRoleName());
        UH.SetText(this.viewNode.TxtPower, RoleData.Inst().GetCapability());
    }

    private FlushEndTime() {
        let time = ArenaData.Inst().GetEndTime() - TimeCtrl.Inst().ServerTime;
        this.viewNode.Timer.TotalTime(time, TimeFormatType.TYPE_TIME_3);
    }

    private onClickBtn(name: string) {
        switch (name) {
            case "BtnDayReward":
                ViewManager.Inst().OpenView(TrialRewardView, { title: this.lange.day_reward, tip: this.lange.day_reward_tip, list_data: ArenaData.Inst().GetDayRewardList() });
                break;
            case "BtnRefresh":
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
                break;
            case "BtnRecord":
                ArenaCtrl.Inst().SendArenaReq(ARENA_OP_TYPE.REPORT);
                ViewManager.Inst().OpenView(ArenaRecordView);
                break;
            case "BtnAddTimes":
                AudioManager.Inst().Play(AudioTag.TongYongClick);
                ViewManager.Inst().OpenView(ShopView);
                break;
        }
    }

    public FlushCd() {
        let next_time = LocalStorageHelper.PrefsInt(LocalStorageHelper.ArenaCd()) ?? 0;
        let time = next_time - Math.floor(TimeCtrl.Inst().ServerTime);
        if (time >= 0) {
            let time_t = TimeHelper.FormatDHMS(time);
            let desc = TextHelper.Format(Language.UiTimeMeter.TimeStr8, time_t.minute, time_t.second)
            this.viewNode.BtnRefresh.title = desc;
            this.viewNode.BtnRefresh.grayed = true;
            this.viewNode.BtnRefresh.enabled = false;
            this.viewNode.BtnRefresh.showIcon(false);
            if (!this._timer_BtnRefresh) {
                this._timer_BtnRefresh = Timer.Inst().AddRunTimer(() => {
                    this.FlushCd();
                }, 1, -1, false);
            }
        } else {
            if (this._timer_BtnRefresh != undefined) {
                Timer.Inst().CancelTimer(this._timer_BtnRefresh)
            }
            this.viewNode.BtnRefresh.grayed = false;
            this.viewNode.BtnRefresh.enabled = true;
            this.viewNode.BtnRefresh.showIcon(true);
            this.viewNode.BtnRefresh.title = Language.OpenServer.NeoShopFlush;
        }
    }

    CloseCallBack() {
        Timer.Inst().CancelTimer(this.time_handle);
        this.viewNode.Timer.CloseCountDownTime();
        GuideCtrl.Inst().ForceStop();
        if (this._timer_BtnRefresh != undefined) {
            Timer.Inst().CancelTimer(this._timer_BtnRefresh)
            this._timer_BtnRefresh = undefined;
        }
        ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.arena);
        RankCtrl.Inst().SendRankReq(RANK_TYPE.Arena);
    }
}

class ArenaEqual extends BaseItem {
    protected viewNode = {
        TxtScore: <fgui.GTextField>null,
        TxtName: <fgui.GTextField>null,
        TxtBaseScore: <fgui.GTextField>null,
        TxtRank: <fgui.GTextField>null,
        BtnChallenge: <fgui.GButton>null,
        Head: <AvatarCell>null,
    };
    protected _data: ArenaEqualData = null;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnChallenge.onClick(this.onChallenge.bind(this));
        this.viewNode.Head.onClick(this.OtherRoleInfo.bind(this));
    }

    public SetData(data: ArenaEqualData) {
        if (data) {
            this._data = data;
            UH.SetText(this.viewNode.TxtScore, Language.Arena.score + data.score);
            UH.SetText(this.viewNode.TxtName, data.name);
            UH.SetText(this.viewNode.TxtRank, TextHelper.Format(data.rank == 0 ? Language.Arena.no_rank : Language.Arena.rank, data.rank));
            if (data.index == 2) {
                GuideCtrl.Inst().AddGuideUi("BtnEqual", this.viewNode.BtnChallenge);
            }
            UH.SetText(this.viewNode.TxtBaseScore, "+" + ArenaData.Inst().GetBaseScore()[data.index]);
            this.viewNode.Head.SetData(new AvatarData(data.head_pic, data.level, data.headChar));
        }
    }

    private onChallenge() {
        if (this._data) {
            ArenaData.Inst().sendChallenge(this.GetData(), ARENA_OP_TYPE.FIGHT);
        }
    }
    protected onDestroy() {
        if (this._data && this._data.index == 2)
            GuideCtrl.Inst().ClearGuideUi("BtnEqual");

    }

    private OtherRoleInfo() {
        if (this._data) {
            if (this._data.role_id < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(OTHER_ROLE_REQ_TYPE.ARENA, this._data.score, this._data.role_id);
        }
    }
}

class ArenaRewardCell extends fgui.GComponent {
    private viewNode = {
        TxtNum: <fgui.GTextField>null,
        Cell: <ItemCell>null,
        ImgFetch: <fgui.GImage>null,
        RedPoint: <RedPoint>null,
        Block: <fgui.GGraph>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Block.onClick(this.onCellClick.bind(this));
    }

    private _data: any;
    public SetData(data: any) {
        this._data = data;
        this.width = data.w;
        UH.SetText(this.viewNode.TxtNum, data.cfg.num);
        this.viewNode.ImgFetch.visible = data.flag == 1;
        UH.SetText(this.viewNode.TxtNum, data.cfg.num);
        this.viewNode.Cell.SetData(Item.Create(data.cfg.item_list[0], { is_num: false, is_click: true }));
        this.viewNode.RedPoint.SetNum(data.is_can_fetch ? 1 : 0);
        this.viewNode.Block.visible = data.is_can_fetch;
    }

    private onCellClick() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        if (this._data && this._data.is_can_fetch) {
            ArenaCtrl.Inst().SendArenaReq(ARENA_OP_TYPE.BOX_REWARD, this._data.cfg.seq);
        }
    }

}

class ButtonArena2 extends BaseItemGB {
    protected viewNode = {
        icon: <fgui.GImage>null,
        title: <fgui.GTextField>null,
    };
    public showIcon(is_show: boolean) {
        this.viewNode.icon.visible = is_show;
        if (is_show) {
            this.viewNode.title.width = 52;
            this.viewNode.title.x = 45;
            this.viewNode.title.color = COLORS.Yellow2;
        } else {
            this.viewNode.title.width = 120;
            this.viewNode.title.x = 0;
            this.viewNode.title.color = COLORS.Gray1;
        }
    }
}
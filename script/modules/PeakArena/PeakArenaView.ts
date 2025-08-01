import { assetManager, ImageAsset, SpriteFrame } from "cc";
import { CfgDFArena } from "config/CfgDFArena";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE, RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { HelpView } from "modules/common_help/CommonHelpView";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { RoleAvatarItem } from "modules/main/MainItems";
import { RANK_TO_OTHER, OtherRoleCtrl, OTHER_ROLE_REQ_TYPE } from "modules/OtherRole/OtherRoleCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { ShopView } from "modules/shop/ShopView";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { CROSS_AREN_OP_TYPE, PeakArenaCtrl } from "./PeakArenaCtrl";
import { PeakArenaData } from "./PeakArenaData";
import { PeakArenaRecordView } from "./PeakArenaRecord";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";

@BaseView.registView
export class PeakArenaView extends BaseView {
    private show_list: any
    private time_handle: any
    private realtime = 0
    private flush_need = 0
    private flush_item = 0
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PeakArena",
        ViewName: "PeakArenaView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "PeakMainCell", ExtendsClass: PeakMainCell },
        // { ResName: "BtnFlush", ExtendsClass: PeakMainBtnFlush },
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

        HuoBiIcon: <fgui.GLoader>null,
        HuoBiNum: <fgui.GLabel>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(PeakArenaView, Language.PeakArena.EnterName[1], 25))
        // this.viewNode.Board.SetHelpVisible(false);

        this.viewNode.BtnRecord.onClick(this.OnClickRecord.bind(this));
        this.viewNode.BtnFlush.onClick(this.OnClickFlush.bind(this));
        this.viewNode.PlusTicket.onClick(this.OnClickPlusTicket.bind(this));

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushPanelInfo.bind(this), "OtherChange");
        this.AddSmartDataCare(PeakArenaData.Inst().flush_info, this.flushPanelInfo.bind(this), "need_flush");

        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.MAIN_INFO, null)
        this.viewNode.List.setVirtual();
        this.viewNode.Timer.SetOutline(true, COLORSTR.Yellow2)
        this.viewNode.Timer.TotalTime(TimeCtrl.Inst().GetNextWeekMonTime() - TimeCtrl.Inst().ServerTime,
            TimeFormatType.TYPE_TIME_3, Language.PeakArena.WeekEndTimer);
        ChannelAgent.Inst().OnMessage(GameToChannel.view_o_Arena);
    }
    CloseCallBack() {
        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined;
        this.realtime = 0;
    }
    private flushPanelInfo() {
        if (BattleCtrl.Inst().check(this, this.flushPanelInfo.bind(this))) {
            return
        }

        let detail = PeakArenaData.Inst().GetMainDetail()

        this.viewNode.List.SetData(detail.playerList)
        // this.viewNode.BtnFlush.SetData({icon:detail.huobiIcon,num:detail.huobiNeed})

        UH.SetIcon(this.viewNode.HuoBiIcon, detail.huobiIcon, ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.HuoBiNum, detail.huobiNeed);

        UH.SetIcon(this.viewNode.TicketIcon, detail.ticketIcon, ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.Ticket, detail.ticketNum);

        this.viewNode.BtnFlush.grayed = detail.temp_time > 0
        this.flush_need = detail.huobiNeed
        this.flush_item = detail.huobiIcon

        if (detail.temp_time > 0) {
            Timer.Inst().CancelTimer(this.time_handle);
            this.time_handle = undefined
            this.realtime = 0;
            this.time_handle = Timer.Inst().AddCountDownTT(
                this.FlushUpdateTime.bind(this, detail.temp_time),
                this.FlushFlushTime.bind(this),
                detail.temp_time, 1);
        }
        else {
            this.viewNode.BtnFlush.title = Language.PeakArena.BtnFlush
        }

        RankCtrl.Inst().SendRankReq(RANK_TYPE.CrossArena);
    }

    private FlushUpdateTime(total_time: number) {
        let time = Math.max(total_time - this.realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr9, time_t.minute, time_t.second);
        this.viewNode.BtnFlush.title = t_str
        this.realtime = this.realtime + 1
    }

    private FlushFlushTime() {
        this.flushPanelInfo()


        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined
    }

    private OnClickRecord() {
        ViewManager.Inst().OpenView(PeakArenaRecordView)
    }
    private OnClickFlush() {
        if (this.time_handle != null) {
            PublicPopupCtrl.Inst().Center(Language.PeakArena.FlushWaiting);
            return
        }
        // let num = BagData.Inst().getItemNum(this.flush_item);
        // if (num < this.flush_need) {
        //     PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.PeakArena.FlushLack,
        //         Item.GetName(this.flush_item)));

        //     let show_call = Item.Create({ item_id: this.flush_item, num:this.flush_need - num })
        //     ViewManager.Inst().OpenView(ItemInfoView, show_call);
        //     return
        // }

        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.REFRESH, 0)
    }
    private OnClickPlusTicket() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(ShopView);
    }
}

export class PeakMainBtnFlush extends fgui.GButton {
    private viewNode = {
        icon: <fgui.GLoader>null,
        num: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetIcon(this.viewNode.icon, data.icon, ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.num, data.num);
    }
}

// {item_id;}
export class PeakMainCell extends fgui.GComponent {
    public avatar_out_texture: SpriteFrame | 0 | undefined = undefined;
    private time_handle: any
    private realtime: any
    private wait_time = 300
    private viewNode = {
        RoleAvatar: <AvatarCell>null,
        Name: <fgui.GLabel>null,
        Point: <fgui.GLabel>null,
        Server: <fgui.GLabel>null,
        BtnChange: <fgui.GButton>null,
        RedPoint: <RedPoint>null,
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
        UH.SetText(this.viewNode.Point, data.point + Language.PeakArena.PointShow)
        UH.SetText(this.viewNode.Server, data.server)

        this.viewNode.RoleAvatar.SetData(new AvatarData(data.headPicId, data.level, data.headChar));

        let temp_time = data.last_time + this.wait_time - TimeCtrl.Inst().ServerTime

        // LogError("?ASf ",temp_time,data.last_time , this.wait_time , TimeCtrl.Inst().ServerTime)
        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined

        this.viewNode.BtnChange.grayed = data.challenged || temp_time > 0
        if (temp_time > 0) {
            this.realtime = 0;
            this.time_handle = Timer.Inst().AddCountDownTT(
                this.FlushUpdateTime.bind(this, temp_time),
                this.FlushFlushTime.bind(this),
                temp_time, 1);
        }
        else {
            this.viewNode.BtnChange.title = Language.PeakArena.ChallengeBtn
        }

        let num = Item.GetNum(CfgDFArena.df_arena_cfg[0].sarena_challenger_id)
        let flag = num > 0 && !(data.challenged || temp_time > 0)
        this.viewNode.RedPoint.SetNum(flag ? 1 : 0)
    }

    public OnClickChange() {
        if (this.time_handle != null) {
            PublicPopupCtrl.Inst().Center(Language.PeakArena.ColdTips);
            return
        }

        // 已存在在战报内的对象不可挑战
        if (this.data.challenged) {
            PublicPopupCtrl.Inst().Center(Language.PeakArena.MainChallenged);
            return
        }

        let num = BagData.Inst().getItemNum(CfgDFArena.df_arena_cfg[0].sarena_challenger_id);
        if (num <= 0) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.PeakArena.FlushLack,
                Item.GetName(CfgDFArena.df_arena_cfg[0].sarena_challenger_id)));

            let show_call = Item.Create({ item_id: CfgDFArena.df_arena_cfg[0].sarena_challenger_id, num: 1 })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return
        }

        if (this.data.role_info.roleId == null) {
            return
        }

        PeakArenaData.Inst().SetSelData(PeakArenaData.Inst().FixArenaEqualData(this.data.role_info, this.data.point, 0, this.data.index))
        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.FIGHT, this.data.index)
    }

    private FlushFlushTime() {
        this.viewNode.BtnChange.grayed = false
        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.MAIN_INFO, null)


        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined
    }

    private FlushUpdateTime(total_time: number) {
        let time = Math.max(total_time - this.realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr9, time_t.minute, time_t.second);
        this.viewNode.BtnChange.title = t_str
        this.realtime = this.realtime + 1
    }

    onDestroy() {
        super.onDestroy();
        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined;
        this.realtime = 0;
    }

    private OtherRoleInfo() {

        if (this.data.roleId < 65535) {
            PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
        } else
            OtherRoleCtrl.Inst().SendGetOtherRoleInfo(OTHER_ROLE_REQ_TYPE.CrossArena, this.data.point, this.data.role_info.roleId);
    }
}


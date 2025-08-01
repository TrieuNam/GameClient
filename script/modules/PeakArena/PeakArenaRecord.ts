import { CfgDFArena } from "config/CfgDFArena";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { tabberInfo } from "modules/common_board/CommonBoard5";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { RoleAvatarItem } from "modules/main/MainItems";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ShopView } from "modules/shop/ShopView";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { CROSS_AREN_OP_TYPE, PeakArenaCtrl } from "./PeakArenaCtrl";
import { PeakArenaData } from "./PeakArenaData";

@BaseView.registView 
export class PeakArenaRecordView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PeakArenaRecord",
        ViewName: "PeakArenaRecordView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "PeakArenaRecordCell", ExtendsClass: PeakArenaRecordCell },
        { ResName: "BtnRed", ExtendsClass: CommonButtonBuy },
    ]
    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,

        PlusTicket: <fgui.GButton>null,
        Ticket: <fgui.GLabel>null,
        TicketIcon: <fgui.GLoader>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(PeakArenaRecordView, Language.PeakArena.RecordTitle))
        this.viewNode.Board.SetHelpVisible(false);
        this.viewNode.List.setVirtual();
        this.viewNode.PlusTicket.onClick(this.OnClickPlusTicket.bind(this));

        UH.SetIcon(this.viewNode.TicketIcon,Item.GetIconId(CfgDFArena.df_arena_cfg[0].sarena_challenger_id), ICON_TYPE.ITEM);

        this.AddSmartDataCare(PeakArenaData.Inst().flush_info, this.flushPanelInfo.bind(this), "need_r_flush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushPanelInfo.bind(this), "OtherChange");
        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.REPORT,null)
    }
    CloseCallBack(){

    }
    private flushPanelInfo() {
        let param = PeakArenaData.Inst().GetRecordDetail()

        this.viewNode.List.SetData(param.list)
        UH.SetText(this.viewNode.Ticket,param.numShow)
    }

    private OnClickPlusTicket() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(ShopView);
    }
}

// {item_id;}
export class PeakArenaRecordCell extends fgui.GComponent {

    private time_handle: any
    private realtime = 0
    
    private viewNode = {
        RoleAvatar: <AvatarCell>null,
        Name: <fgui.GLabel>null,
        Level: <fgui.GLabel>null,
        Point: <fgui.GLabel>null,
        P_Desc: <fgui.GLabel>null,
        Server: <fgui.GLabel>null,
        Time: <fgui.GLabel>null,
        BtnRevenge: <CommonButtonBuy>null,
        ShowProtect: <fgui.GGroup>null,
        P_Timer:<fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.BtnRevenge.onClick(this.OnClickRevenge.bind(this));
        this.viewNode.BtnRevenge.title = Language.PeakArena.BtnRevenge

        let btn_icon=this.viewNode.BtnRevenge.GetIcon();
        UH.SetIcon(btn_icon,Item.GetIconId(CfgDFArena.df_arena_cfg[0].sarena_challenger_id), ICON_TYPE.ITEM);
    }
    onDestroy() {
        super.onDestroy();

        Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = undefined;
        this.realtime = 0;
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        
        this.viewNode.RoleAvatar.SetData(new AvatarData(data.headPicId, data.level, data.headChar));
        UH.SetText(this.viewNode.Name,data.name)
        UH.SetText(this.viewNode.Level,Language.PeakArena.LevelShow+data.level)
        UH.SetText(this.viewNode.Server,data.server)
        UH.SetText(this.viewNode.Time,data.battle_time)
        
        UH.SetText(this.viewNode.Point,data.pointChange)
        UH.SetText(this.viewNode.P_Desc,data.recordShow)
        
        this.viewNode.BtnRevenge.visible = data.show_btn
        this.viewNode.ShowProtect.visible = data.show_time

        if(data.show_time)
        {
            Timer.Inst().CancelTimer(this.time_handle);
            this.time_handle = undefined
            this.realtime = 0;
            this.time_handle = Timer.Inst().AddCountDownTT(
                this.FlushUpdateTime.bind(this, data.temp_time),
                this.FlushFlushTime.bind(this),
                data.temp_time, 1);
        }
    }

    private FlushUpdateTime(total_time:number) {
        let time = Math.max(total_time - this.realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr9, time_t.minute, time_t.second);

        UH.SetText(this.viewNode.P_Timer,t_str)

        this.realtime = this.realtime + 1
    }

    private FlushFlushTime() {
        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.REPORT,null)
    }

    private OnClickRevenge() {
        let num = BagData.Inst().getItemNum(CfgDFArena.df_arena_cfg[0].sarena_challenger_id);
        if (num < 0) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.PeakArena.FlushLack,
                Item.GetName(CfgDFArena.df_arena_cfg[0].sarena_challenger_id)));

            let show_call = Item.Create({ item_id: CfgDFArena.df_arena_cfg[0].sarena_challenger_id , num:1 })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return
        }

        PeakArenaData.Inst().SetSelData(PeakArenaData.Inst().FixArenaEqualData(this.data.role_info,this.data.point,0,this.data.index))
        PeakArenaCtrl.Inst().SendCSCrossArenaReq(CROSS_AREN_OP_TYPE.REVENGE,this.data.index)
    }
}


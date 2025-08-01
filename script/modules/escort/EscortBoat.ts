import { CfgEscortShip } from "config/CfgEscort";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { tabberInfo } from "modules/common_board/CommonBoard5";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { EscortData, ESCORT_OPER_TYPE } from "./EscortData";
import { EscortQualityUp } from "./EscortQualityUp";
import { EscortCtrl } from "./EscortCtrl";
import { COLORS } from "modules/common/ColorEnum";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";



@BaseView.registView
export class EscortBoat extends BaseView {

    data: EscortData = EscortData.Inst()
    select_seq = 0;
    role_info: PB_SCEscortRoleInfo;
    guide_tag: string[] = [];

    protected viewRegcfg = {
        UIPackName: "EscortBoat",
        ViewName: "EscortBoat",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Escort.Title1,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard2>null,
        BtnUplevel: <fgui.GButton>null,
        BtnEscort: <fgui.GButton>null,
        Count: <fgui.GTextField>null,
        BoatList: <fgui.GList>null,
        Num: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
    };

    protected extendsCfg = [
        { ResName: "BoatItem", ExtendsClass: EscortBoatItem }
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(EscortBoat, Language.Escort.Title1))
        this.role_info = this.data.RoleData;
        this.AddSmartDataCare(this.data.FlushData, this.OnRoleDataChange.bind(this), "flush_role_info")
    }
    OnRoleDataChange() {
        if (this.select_seq != this.data.RoleData.ship
            && this.data.RoleData.ship != 0) {
            ViewManager.Inst().OpenView(EscortQualityUp, this.data.RoleData.ship)
        }
        if (this.select_seq != this.data.RoleData.ship && this.data.RoleData.ship == 0) {
            PublicPopupCtrl.Inst().Center(Format(Language.Escort.EscortStart, DataHelper.GetDaXie(this.select_seq + 1, false)))
        }
        this.select_seq = this.data.RoleData.ship
        this.viewNode.BoatList.OnSelectedItem(this.select_seq)
        this.role_info = this.data.RoleData;
        UH.SetText(this.viewNode.Count, Format(Language.Escort.ShengYu2, this.data.GetEscortTime() - this.data.RoleData.escortCount))
    }

    InitUI() {
        //this.viewNode.BoatList.enabled = false
        this.viewNode.BtnUplevel.onClick(this.OnClickUplevel, this)
        this.viewNode.BtnEscort.onClick(this.OnClickEscort, this)
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("EscortUplevel", this.viewNode.BtnUplevel))
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("EscortBtnEscort", this.viewNode.BtnEscort))
    }
    OnClickUplevel() {
        if (this.role_info.escortCount >= this.data.GetOther().escort_num) {
            PublicPopupCtrl.Inst().Center(Language.Escort.MaxCount)
            return
        }
        if (this.select_seq >= 5) {
            PublicPopupCtrl.Inst().Center(Language.Escort.MaxTip)
            return
        }
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.SHIP_UP);
    }
    OnClickEscort() {
        //this.viewNode.BoatList.selectedIndex = 0
        // this.select_seq = 0
        // this.viewNode.BoatList.OnSelectedItem(this.select_seq)
        if (this.select_seq == 0) {
            if (this.data.GetEscortTime() - this.data.RoleData.escortCount > 0) {
                PublicPopupCtrl.Inst().Center(Format(Language.Escort.EscortStart, DataHelper.GetDaXie(this.select_seq + 1)))
            }
        }
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.SET_SAIL)
        ViewManager.Inst().CloseView(EscortBoat)
    }
    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        this.viewNode.BoatList.SetData(this.data.GetBoatList())
        //this.viewNode.BoatList.SetData(this.data.GetBoatList(), this.OnSelectBoat.bind(this))
        this.viewNode.BoatList.on(fgui.Event.CLICK_ITEM, this.OnSelectBoat, this)
        this.role_info = this.data.RoleData;
        this.select_seq = this.role_info.ship
        this.viewNode.BoatList.OnSelectedItem(this.select_seq)
        UH.SetText(this.viewNode.Count, Format(Language.Escort.ShengYu2, this.data.GetEscortTime() - this.data.RoleData.escortCount))
    }
    OnSelectBoat(item: EscortBoatItem, evt: fgui.Event,) {
        //evt.propagationStopped = true;//狗屎虽然停止了冒泡但是List空白仍然会触发父对象事件
        //正常怎么可以写这种逻辑
        if (this.viewNode.BoatList.selectedIndex != this.select_seq) {
            this.viewNode.BoatList.selectedIndex = this.select_seq
            return
        }

        let data = item.GetData()
        //this.select_seq = this.viewNode.BoatList.selectedIndex;
        if (data.refresh_item == 0) {
            UH.GoldIcon(this.viewNode.Icon, CommonId.Diamond)
            UH.SetText(this.viewNode.Num, Language.Escort.MaxLevel)
            this.viewNode.Num.color = COLORS.White
        } else {
            UH.SetText(this.viewNode.Num, data.refresh_num)
            UH.GoldIcon(this.viewNode.Icon, data.refresh_item)
            this.viewNode.Num.color = Item.GetNum(data.refresh_item) >= data.refresh_num ? COLORS.White : COLORS.Red1
        }
    }

    CloseCallBack() {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
        GuideCtrl.Inst().ForceStop()
        ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.Escort)
    }
}

export class EscortBoatItem extends BaseItemGB {
    escort_data = EscortData.Inst()
    protected viewNode = {
        Select: <fgui.GObject>null,
        TitleSp: <fgui.GLoader>null,
        BoatSp: <fgui.GLoader>null,
        RewardList: <fgui.GList>null,
        Name: <fgui.GTextField>null,
        Time: <fgui.GTextField>null,
    };

    public SetData(data: CfgEscortShip) {
        this._data = data
        let level = data.ship + 1
        UH.SpriteName(this.viewNode.TitleSp, "Escort", `${level}JiBie`)
        let name = TextHelper.Format(Language.Escort.Level, DataHelper.GetDaXie(level, false))
        UH.SetText(this.viewNode.Name, name)
        this.viewNode.Name.color = this.escort_data.name_color[data.ship]
        UH.SetText(this.viewNode.Time, TextHelper.Format(Language.Escort.Time, data.time))
        let rewards = [];
        let rewad_list = data.escort_reward
        for (let i = 0; i < rewad_list.length; i++) {
            rewards.push(Item.Create(rewad_list[i], { is_num: true }))
        }
        this.viewNode.RewardList.SetData(rewards)
        UH.SpriteName(this.viewNode.BoatSp, "Escort", Format("ChuanXiao{0}", level))
    }
}
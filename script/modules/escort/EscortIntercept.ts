import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language, TextHelperUnits } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { MainCapItem } from "modules/main/MainItems";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { EscortCtrl } from "./EscortCtrl";
import { EscortData, ESCORT_OPER_TYPE } from "./EscortData";

@BaseView.registView
export class EscortIntercept extends BaseView {
    data = EscortData.Inst()
    select_seq = 0;
    cur_ship: PB_SCEscortInterceptData;
    protected viewRegcfg = {
        UIPackName: "EscortIntercept",
        ViewName: "EscortIntercept",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard3>null,
        Count: <fgui.GTextField>null,
        List: <fgui.GList>null,
        CapItem: <MainCapItem>null,
        Icon: <fgui.GLoader>null,
        NameIcon: <fgui.GLoader>null,
        RoleName: <fgui.GTextField>null,
        BoatName: <fgui.GTextField>null,
        BtnIntercept: <fgui.GButton>null,
        Level: <fgui.GTextField>null,

    };

    /* protected extendsCfg = [
        { ResName: "InterceptItem", ExtendsClass: EscortInterceptItem }
    ]; */

    InitData(ship: PB_SCEscortInterceptData) {
        this.viewNode.Board.SetData(new BoardData(EscortIntercept, Language.Escort.Title7))
        this.select_seq = ship.ship.ship
        this.cur_ship = ship
    }
    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        let boat = this.data.GetBoatData(this.select_seq)
        let level = this.select_seq + 1
        UH.SetText(this.viewNode.RoleName, DataHelper.BytesToString(this.cur_ship.roleInfo.name))
        UH.SetText(this.viewNode.Level,Format(Language.Common.LevelShow, this.cur_ship.roleInfo.level))
        UH.SetText(this.viewNode.BoatName, Format(Language.Escort.BoatName, DataHelper.GetDaXie(level)))
        this.viewNode.BoatName.color = this.data.name_color[this.select_seq]
        this.viewNode.CapItem.SetData(this.cur_ship.roleInfo.cap)
        UH.SpriteName(this.viewNode.Icon, "Escort", "ChuanDa" + (level))
        UH.SpriteName(this.viewNode.NameIcon, "Escort", `${level}JiBie`)
        let rewards = []
        for (let index = 0; index < boat.intercept_reward.length; index++) {
            rewards.push(Item.Create(boat.intercept_reward[index], { is_num: true }))
        }
        this.viewNode.List.SetData(rewards)
        UH.SetText(this.viewNode.Count, Format(Language.Escort.ShengYu1, this.data.GetInterceptTime() - this.data.RoleData.interceptCount, this.data.GetInterceptTime()))
        this.viewNode.BtnIntercept.onClick(this.OnClickIntercept, this)
    }
    OnClickIntercept() {
        let boat = this.data.GetBoatData(this.select_seq)
        if (this.cur_ship.ship.beIntercept >= boat.intercept_num) {
            PublicPopupCtrl.Inst().Center(Language.Escort.InterTip)
            return
        }
        EscortCtrl.Inst().SendEcsortReq(ESCORT_OPER_TYPE.INTERCEPT, this.cur_ship.ship.shipKey)
        ViewManager.Inst().CloseView(EscortIntercept)
    }

    CloseCallBack() {
    }
}

import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { BoardData } from "modules/common_board/BoardData";
import { UH } from "../../helpers/UIHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { Item } from "modules/bag/ItemData";
import { CfgStarMapData } from "config/CfgStarmap";
import { CommonId, ICON_TYPE } from "modules/common/CommonEnum";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { StarMapCtrl, STAR_MAP_REQ_TYPE} from "modules/star_map/StarMapCtrl";
import { LogError } from 'core/Debugger';
import { StarMapData } from "./StarMapData";
import { StarMapSuperData } from "./StarMapSuperData";
import { DataHelper } from "../../helpers/DataHelper";

@BaseView.registView 
export class SuperResetView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "StarMapExtra",
        ViewName: "ResetConfirmView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        // Cell: <ItemCell>null,
        IconCost: <fgui.GLoader>null,
        TxtCost: <fgui.GTextField>null,
        BtnReset: <fgui.GButton>null,
        TxtDesc: <fgui.GTextField>null,
        item_list:<fgui.GList>null,
    }
    InitData(){
        this.viewNode.Board.SetData(new BoardData(SuperResetView,Language.StarMap.ResetTitle));

        let item_list = StarMapSuperData.Inst().GetSuperStarResetItem()
        this.viewNode.item_list.SetData(item_list)
        // this.viewNode.Cell.SetData(Item.Create(
        //     {item_id: CommonId.Gold,num:CfgStarMapData.other[0].reset_back_big}
        //     , { is_num: true, is_click: false }));


        let item = CfgStarMapData.other[0].reset_big[0]

        // LogError("?sss",Item.GetIconId(item.item_id))
        UH.SetIcon(this.viewNode.IconCost, item.item_id,ICON_TYPE.ITEM);
        // UH.SetText(this.viewNode.TxtDesc, Item.GetDesc(CommonId.Gold));
        this.viewNode.BtnReset.onClick(this.onReset.bind(this));

        let color = Item.GetNum(item.item_id) < item.num ? COLORS.Red1 : COLORS.White;
        UH.SetText(this.viewNode.TxtCost,item.num, color);
    }

    private onReset() {
        let item = CfgStarMapData.other[0].reset_big[0]
        let num = Item.GetNum(item.item_id)
        if (num < item.num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(item.item_id)
            return
        }

        StarMapCtrl.Inst().SendCSStarMapReq(STAR_MAP_REQ_TYPE.NEW_BIG_RESET, {});
        ViewManager.Inst().CloseView(SuperResetView)
    }
}
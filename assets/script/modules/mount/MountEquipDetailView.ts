import { TouchBarOtherItemsProxy } from "electron";
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { MountData } from "./MountData";
import { MountEquipWashAttrShow } from "./MountEquipWashView";


@BaseView.registView
export class MountEquipDetailView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipSure",
        ViewName: "MountEquipDetailView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "WashViewShow", ExtendsClass: MountEquipWashAttrShow },
    ]
    protected viewNode = {
        Board:<CommonBoard4>null,
        ItemCell:<ItemCell>null,
        ItemName:<fgui.GLabel>null,
        MainAttrStr:<fgui.GLabel>null,
        attr_list:<fgui.GList>null,
    }
    private show_index:number
    InitData(param:{bag_index:number}) {
        this.show_index = param.bag_index

        this.viewNode.Board.SetData(new BoardData(MountEquipDetailView, null));

        this.flushInfoPanel()
    }
    CloseCallBack() {

    }
    flushInfoPanel()
    {
        let detail = MountData.Inst().GetEquipDeatil(this.show_index)

        let item_cell = Item.Create(detail.item_info,{is_click:false,is_num:false})
        this.viewNode.ItemCell.SetData(item_cell)
        UH.SetText(this.viewNode.ItemName,item_cell.QuaName())

        UH.SetText(this.viewNode.MainAttrStr,detail.main_attr_str)
        this.viewNode.attr_list.SetData(detail.attr_list)
    }
}
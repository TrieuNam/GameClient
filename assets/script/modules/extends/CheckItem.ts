import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
// import { Item } from "modules/bag/ItemData";
import { ItemCell } from "modules/extends/ItemCell";

export class CheckItem extends fgui.GButton {
    private viewNode = {
        title: <fgui.GRichTextField>null,
        cell: <ItemCell>null,
    };

    public constructor() {
        super();
    }

    protected onConstruct() {
        let self = this;
        ViewManager.Inst().RegNodeIofo(self.viewNode, self)
    }

    public SetBagItem() {
        // this.viewNode.cell.SetData(Item.Create(bagGrid.itemData,{is_name:true,is_click:false}));
    }

    protected onDestroy() {

    }
}
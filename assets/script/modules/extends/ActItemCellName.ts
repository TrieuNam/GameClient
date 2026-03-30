import { BaseItem } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { ItemCell } from "./ItemCell";
import { Item } from "modules/bag/ItemData";
import { UH } from "../../helpers/UIHelper";

export class ActItemCellName extends BaseItem {
    protected viewNode = {
        Name: <fgui.GTextField>null,
        Cell: <ItemCell>null
    };

    public SetData(data: any) {
        this.viewNode.Cell.SetData(data);
        let name = Item.GetName(data.item_id)
        UH.SetText(this.viewNode.Name, name)
    }
}

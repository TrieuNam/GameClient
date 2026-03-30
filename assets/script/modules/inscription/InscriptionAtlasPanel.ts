import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { Item } from "modules/bag/ItemData";
import { BasePanel } from "modules/common/BasePanel";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { InscriptionData } from "./InscriptionData";


export class InscriptionAtlasPanel extends BasePanel {

    protected viewNode: { [key: string]: any } = {
        Board: <CommonBoard2>null,
        atlas_list: <fgui.GList>null,
    }
    protected extendsCfg = [
        { ResName: "AtlasShow", ExtendsClass: InscriptionAtlasShow },
        { ResName: "CoreAtlasShow", ExtendsClass: InscriptionCoreAtlasShow },
    ]
    InitPanelData() {
        this.viewNode.atlas_list.setVirtual()
        let atlas_list = InscriptionData.Inst().GetAtlasList()
        this.viewNode.atlas_list.SetData(atlas_list)
    }
    CloseCallBack() { }
}

export class InscriptionCoreAtlasShow extends fgui.GComponent {
    private viewNode = {
        ItemCell: <ItemCell>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        this.viewNode.ItemCell.SetData(data)
    }
}

export class InscriptionAtlasShow extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        title: <fgui.GLabel>null,
        list: <fgui.GList>null,
        n1: <fgui.GImage>null,
        core_list: <fgui.GList>null,
    }

    private base_height = 191
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetText(this.viewNode.title, data.title);
        let list = []
        for (var index in data.list) {
            let item = Item.Create({ item_id: data.list[index].id }, { is_num: false })
            list.push(item)
        }
        this.viewNode.core_list.visible = data.is_core
        this.viewNode.list.visible = !data.is_core
        if (data.is_core) {
            this.viewNode.core_list.SetData(list)
            this.height = 240
        }
        else {
            this.viewNode.list.SetData(list)

            let add_height_num = Math.floor(data.list.length / 5)
            add_height_num = add_height_num == 0 ? 1 : add_height_num

            this.viewNode.n1.width = this.data.unlock == 0 ? 217 : 300

            this.height = this.base_height + (add_height_num - 1) * 104 + (add_height_num > 1 ? 17 : 0)
        }


    }

}
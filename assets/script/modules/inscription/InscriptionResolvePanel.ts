import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BasePanel } from "modules/common/BasePanel";
import { QualityColorStr } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";

export class InscriptionResolvePanel extends BasePanel {
    private resolve_list: any

    protected viewNode: { [key: string]: any } = {
        // Board: <CommonBoard2>null,
        ItemList: <fgui.GList>null,
        Toggle0: <fgui.GButton>null,
        Toggle1: <fgui.GButton>null,
        Toggle2: <fgui.GButton>null,
        Toggle3: <fgui.GButton>null,
        Toggle4: <fgui.GButton>null,
        Toggle5: <fgui.GButton>null,
        StuffItem: <ItemCell>null,
        StuffName: <fgui.GLabel>null,
        back_list: <fgui.GList>null,
        BtnCatch: <fgui.GButton>null,
        Empty: <fgui.GLabel>null,
    }

    protected extendsCfg = [
        { ResName: "ResolveItem", ExtendsClass: InscriptionResolveItem },
        { ResName: "ResolveBackItem", ExtendsClass: InscriptionResolveBackItem },
    ]

    InitPanelData() {
        // this.viewNode.Board.SetData(new BoardData(InscriptionResolveView, Language.Inscription.ResolveTitle, 21))
        this.viewNode.ItemList.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this);
        this.viewNode.ItemList.setVirtual()

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoPanel.bind(this), "flushneed");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "OtherChange");

        this.viewNode.BtnCatch.onClick(this.OnClickCatch.bind(this));

        for (let i = 0; i < 6; i++) {
            this.viewNode["Toggle" + i].onClick(this.OnClickToggle.bind(this, i));
        }

        this.flushInfoPanel()
        this.InitToggle()
        InscriptionData.Inst().ResolveMark()
    }

    // InitUI()
    // {
    //     this.InitToggle()
    // }
    CloseCallBack() {

    }

    public InitToggle() {
        this.viewNode.Toggle0.selected = true
        for (var p_index in this.resolve_list) {
            if (this.resolve_list[p_index].color == 3) {
                this.viewNode.ItemList.addSelection(p_index)
            }
        }
        this.flushResolveEnd()
    }
    public flushInfoPanel() {
        this.resolve_list = InscriptionData.Inst().GetResolveList()
        this.viewNode.ItemList.SetData(this.resolve_list)
        this.flushResolveEnd()

        this.viewNode.Empty.visible = this.resolve_list.length == 0
    }

    public flushResolveEnd() {
        let selects = this.viewNode.ItemList.getSelection()
        let back_list = InscriptionData.Inst().GetResolveBackList(selects)
        this.viewNode.back_list.SetData(back_list)

    }

    private OnClickCatch() {
        let selects = this.viewNode.ItemList.getSelection()
        if (selects.length < 1) {
            PublicPopupCtrl.Inst().Center(Language.Inscription.ResolveEmpty)
            return
        }

        let p1_list = [] // 背包格子
        let p2_list = [] // 物品id（水晶）
        for (var index in selects) {
            let list_index = selects[index]
            let oper = this.resolve_list[list_index]
            if (!oper.is_item) {
                let bag_index = oper.index
                p1_list.push(bag_index)
            }
            else {
                let item_id = oper.id
                p2_list.push(item_id)
            }
        }

        InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.DECOMPOSE, p1_list.length, p2_list.length, p1_list, p2_list)
        this.viewNode.ItemList.clearSelection()

    }

    // 0→3 1→4 2→5 3→6 4→7 5→8
    private OnClickToggle(index: number) {
        let flag = this.viewNode["Toggle" + index].selected
        for (var p_index in this.resolve_list) {
            if (this.resolve_list[p_index].color == (index + 3)) {
                if (!flag) {
                    this.viewNode.ItemList.removeSelection(p_index)
                }
                else {
                    this.viewNode.ItemList.addSelection(p_index)
                }
            }
        }

        this.flushResolveEnd()
    }

    private OnClickItem(item: InscriptionResolveItem) {
        this.flushResolveEnd()
    }
}

export class InscriptionResolveItem extends fgui.GButton {
    private viewNode: { [key: string]: any } = {
        ItemCell: <ItemCell>null,
        Name: <fgui.GLabel>null,
        item_level: <fgui.GLabel>null,
        AttrShow: <fgui.GLabel>null,
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

        UH.SetText(this.viewNode.Name, TextHelper.ColorStr(data.name, QualityColorStr[data.color]));
        if (!data.is_item) {
            this.viewNode.ItemCell.SetData(Item.Create({ item_id: data.id }, { is_click: false }))
        }
        else {
            let item_num = Item.GetNum(data.id)
            this.viewNode.ItemCell.SetData(Item.Create({ item_id: data.id, num: item_num }, { is_click: false, is_num: true }))
        }

        UH.SetText(this.viewNode.AttrShow, data.attr_str)
        UH.SetText(this.viewNode.item_level, (data.level != undefined && data.level > 0) ? (Language.GemAtelier.LvShow + data.level) : "")
    }
}

export class InscriptionResolveBackItem extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        ItemCell: <ItemCell>null,
        Name: <fgui.GLabel>null,
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
        UH.SetText(this.viewNode.Name, data.name);
        this.viewNode.ItemCell.SetData(Item.Create({ item_id: data.id, num: data.num }, { is_click: false, is_num: true }))
    }
}
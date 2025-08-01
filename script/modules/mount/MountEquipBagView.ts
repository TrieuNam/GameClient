import { LogError } from "core/Debugger";
import { TouchBarScrubber } from "electron";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonBoard5Tab } from "modules/common_board/CommonBoard5";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { MountData } from "./MountData";
import { MountEquipOpView } from "./MountEquipOpView";


@BaseView.registView
export class MountEquipBagView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipBag",
        ViewName: "MountEquipBagView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "ButtonTab3", ExtendsClass: CommonBoard5Tab },
        { ResName: "BagItem", ExtendsClass: MountEquipBagItem },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        TabList:<fgui.GList>null,
        BagList:<fgui.GList>null,
        empty:<fgui.GGroup>null,
        emptytitle:<fgui.GLabel>null,
    }
    private select_type = 0
    InitData() {
        this.viewNode.Board.SetData(new BoardData(MountEquipBagView, Language.Mount.EquipBagTitle));
        this.viewNode.TabList.SetData(MountData.Inst().GetEquipBagTabList())
        this.viewNode.TabList.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);

        this.viewNode.TabList.selectedIndex = this.select_type

        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this, false), "needflush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "OtherItemChange");

        this.viewNode.BagList.on(fgui.Event.CLICK_ITEM, this.ClickEquip, this);
        this.flushInfoPanel()
    }
    CloseCallBack() {

    }
    flushInfoPanel()
    {
        let list = MountData.Inst().GetEquipBagList(this.select_type)
        this.viewNode.BagList.SetData(list)
        this.viewNode.empty.visible = list.length == 0
        UH.SetText(this.viewNode.emptytitle,Language.Mount.EmptyEquip+Language.Mount.EquipTypeName[this.select_type])
    }

    private OnClickListItem(item: CommonBoard5Tab) 
    {
        this.select_type = item._data.index
        this.flushInfoPanel()
    }

    private ClickEquip(item: MountEquipBagItem) {

        let param = {index:0,oper_type:0,pos:{x:0,y:0},show_type:0}
        param.index = item.data.index
        param.oper_type = 1
        param.pos.x = item.x + this.viewNode.BagList.x
        param.pos.y = item.y + this.viewNode.BagList.y
        
        let check = (item.data.index_num+1) % 4
        if(check == 1 || check == 2)
        {
            param.show_type = 1
        }
        ViewManager.Inst().OpenView(MountEquipOpView, param);
    }
}

export class MountEquipBagItem extends fgui.GButton {
    private viewNode = {
        ItemCell:<ItemCell>null,
        ItemName:<fgui.GLabel>null,
    };
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data:any) {
        if(data == null)
        {
            return 
        }
        this.data = data
        let item_cell = Item.Create(data.item_info,{is_click:false,is_num:false})
        this.viewNode.ItemCell.SetData(item_cell)
        UH.SetText(this.viewNode.ItemName,Item.GetName(data.item_info.item_id))
    }
}
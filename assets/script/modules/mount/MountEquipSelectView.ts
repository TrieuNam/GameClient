import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";
import { MountData } from "./MountData";
import { MountEquipBagItem } from "./MountEquipBagView";
import { MountEquipOpView } from "./MountEquipOpView";

@BaseView.registView
export class MountEquipSelectView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipBag",
        ViewName: "MountEquipSelectView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "BagItem", ExtendsClass: MountEquipBagItem },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        BagList:<fgui.GList>null,
        empty:<fgui.GGroup>null,
        emptytitle:<fgui.GLabel>null,
    }
    private select_type = 0
    InitData(param:{bag_index:number}) {
        this.viewNode.Board.SetData(new BoardData(MountEquipSelectView, Language.Mount.EquipSelectTitle));

        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "FragItemChange");

        this.viewNode.BagList.on(fgui.Event.CLICK_ITEM, this.ClickEquip, this);
        this.select_type = param.bag_index


        this.flushInfoPanel()
    }
    CloseCallBack() {

    }
    flushInfoPanel()
    {
        let list = MountData.Inst().GetEquipSelectList(this.select_type)
        this.viewNode.BagList.SetData(list)

        this.viewNode.empty.visible = list.length == 0
        UH.SetText(this.viewNode.emptytitle,Language.Mount.EmptyEquip+Language.Mount.EquipTypeName[this.select_type])
    }
    
    private ClickEquip(item: MountEquipBagItem) {
        
        let param = {index:0,oper_type:0,pos:{x:0,y:0},show_type:0}
        param.index = item.data.index
        param.oper_type = 2
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
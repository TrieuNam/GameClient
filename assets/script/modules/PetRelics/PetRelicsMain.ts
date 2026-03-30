import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { PetRelicsData } from "./PetRelicsData";
import { PetRelicsAttrShow, PetRelicsBagItem, PetRelicsIconBase, PetRelicsInfoBase, PetRelicsNameBase } from "./PetRelicsView";

export class PetRelicsMain extends BaseItem {
    // 注意声明类型！
    protected viewNode = {
        model_show: <PetRelicsMainShow>null,
        attr_show: <PetRelicsAttrShow>null,
        list: <fgui.GList>null,
        BtnOper: <fgui.GButton>null,
        empty_show: <fgui.GLabel>null,
    }
    private handleCollector: HandleCollector;
    private select_index = 0
    InitData() {
        this.handleCollector = HandleCollector.Create();
        this.addSmartDataCare(PetRelicsData.Inst().flush_info, this.flushList.bind(this), "need_flush");
        
        // this.addSmartDataCare(PetRelicsData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");

        this.viewNode.list.on(fgui.Event.CLICK_ITEM, this.OnClickBagItem, this);
        this.viewNode.BtnOper.onClick(this.OnClickOper.bind(this));

        this.flushList()
        this.flushInfoPanel()
    }
    protected onDestroy(): void {
        super.onDestroy();

        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    flushList()
    {
        let bag_list = PetRelicsData.Inst().GetMainBag()
        this.viewNode.list.SetData(bag_list)
        this.viewNode.empty_show.visible = bag_list.length == 0

        this.viewNode.list.selectedIndex = this.select_index
    }

    flushInfoPanel()
    {
        let bag_list = PetRelicsData.Inst().GetMainBag()
        let oper = bag_list.length > 0 ? bag_list[this.select_index].index : -1

        let param = PetRelicsData.Inst().GetMainParam(oper)
        
        this.viewNode.model_show.SetData(param.model_info)
        this.viewNode.attr_show.SetData(param.attr_info)
    }

    OnClickOper()
    {

    }

    OnClickBagItem(item:PetRelicsBagItem)
    {
        this.select_index = item.data.index
        this.flushInfoPanel()
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

}

export class PetRelicsMainShow extends fgui.GComponent {
    private viewNode = {
        IconBase:<PetRelicsIconBase>null,
        InfoBase:<PetRelicsInfoBase>null,
        NameBase:<PetRelicsNameBase>null,
    }
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
        
        this.viewNode.IconBase.SetData(data.icon_info)
        this.viewNode.InfoBase.SetData(data.level_info)
        this.viewNode.NameBase.SetData(data.name_info)
    }
}
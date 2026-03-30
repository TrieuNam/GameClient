import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { PetRelicsData } from "./PetRelicsData";
import { PetRelicsAttrShow, PetRelicsBagItem, PetRelicsIconBase, PetRelicsInfoBase, PetRelicsNameBase } from "./PetRelicsView";

export class PetRelicsLevel extends BaseItem {

    // 注意声明类型！
    protected viewNode = {
        model_show: <PetRelicsLevelShow>null,
        attr_show: <PetRelicsAttrShow>null,
        list: <fgui.GList>null,
        BtnOper: <fgui.GButton>null,
        empty_show: <fgui.GLabel>null,
    }
    private handleCollector: HandleCollector;
    InitData() {
        this.handleCollector = HandleCollector.Create();
        this.addSmartDataCare(PetRelicsData.Inst().flush_info, this.flushList.bind(this), "need_flush");
        this.addSmartDataCare(PetRelicsData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");
        // this.addSmartDataCare(MountData.Inst().flush_info, this.PlayEff.bind(this), "equiped");

        this.viewNode.list.on(fgui.Event.CLICK_ITEM, this.OnClickBagItem, this);
        this.viewNode.BtnOper.onClick(this.OnClickOper.bind(this));
        // this.flushList()
        // this.flushInfoPanel()
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
        let bag_list = PetRelicsData.Inst().GetLevelBag()
        this.viewNode.list.SetData(bag_list)
        this.viewNode.empty_show.visible = bag_list.length == 0
    }

    flushInfoPanel()
    {
        let param = PetRelicsData.Inst().GetLevelParam()

        this.viewNode.model_show.SetData(param.model_info)
        this.viewNode.attr_show.SetData(param.attr_info)
    }

    OnClickOper()
    {

    }

    OnClickBagItem(item:PetRelicsBagItem)
    {
        
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
    

}

export class PetRelicsLevelShow extends fgui.GComponent {
    private viewNode = {
        IconBase:<PetRelicsIconBase>null,
        NameBase:<PetRelicsNameBase>null,
        InfoBase:<PetRelicsInfoBase>null,
        PreProg:<PetRelicsLevelProg>null,
        Prog:<PetRelicsLevelProg>null,
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
        this.viewNode.PreProg.SetData(data.pre_prog)
        this.viewNode.Prog.SetData(data.prog)
    }
}

export class PetRelicsLevelProg extends fgui.GProgressBar {
    private viewNode = {
        plus:<fgui.GImage>null,
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

        this.max = data.max
        this.value = data.value

        // this.plus
    }
}
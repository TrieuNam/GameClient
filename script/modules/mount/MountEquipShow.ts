import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { COLORSTR } from "modules/common/ColorEnum";
import { AttrListName } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { HarnessBuyView } from "./HarnessBuyView";
import { MountEquipTypeIcon } from "./MountConfig";
import { MountData } from "./MountData";
import { MountEquipBagView } from "./MountEquipBagView";
import { MountEquipOpView } from "./MountEquipOpView";
import { MountEquipSelectView } from "./MountEquipSelectView";

export class MountEquipShow extends BaseItem {

    // 注意声明类型！
    protected viewNode = {
        Equip_0:<MountEquipPosShow> null,
        Equip_1:<MountEquipPosShow> null,
        Equip_2:<MountEquipPosShow> null,
        Equip_3:<MountEquipPosShow> null,
        mount_name:<fgui.GLabel> null,
        BtnBag:<fgui.GButton> null,
        BtnBuyEquip:<fgui.GButton> null,
        attr_list:<fgui.GList> null,
        UiModelShow: <UIModelShow>null,
        RedPoint0: <RedPoint>null,
        RedPoint1: <RedPoint>null,
        RedPoint2: <RedPoint>null,
        RedPoint3: <RedPoint>null,
        Eff_0:<UIEffectShow>null, 
        Eff_1:<UIEffectShow>null,
        Eff_2:<UIEffectShow>null,
        Eff_3:<UIEffectShow>null,
        empty:<fgui.GLabel> null,
    }
    
    private handleCollector: HandleCollector;
    InitData() {
        this.handleCollector = HandleCollector.Create();
        this.viewNode.BtnBag.onClick(this.OnClickBag.bind(this));
        this.viewNode.BtnBuyEquip.onClick(this.onClickBuyEquip.bind(this));

        this.addSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this, false), "needflush");
        this.addSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "FragItemChange");

        this.addSmartDataCare(MountData.Inst().flush_info, this.PlayEff.bind(this), "equiped");
        
        this.viewNode.Equip_0.onClick(this.OnClickEquipPos.bind(this,0));
        this.viewNode.Equip_1.onClick(this.OnClickEquipPos.bind(this,1));
        this.viewNode.Equip_2.onClick(this.OnClickEquipPos.bind(this,2));
        this.viewNode.Equip_3.onClick(this.OnClickEquipPos.bind(this,3));

        GuideCtrl.Inst().AddGuideUi("MountEquipBuyEquip", this.viewNode.BtnBuyEquip);
        GuideCtrl.Inst().AddGuideUi("MountEquipClick0", this.viewNode.Equip_0);

        this.flushInfoPanel()
    }
    protected onDestroy(): void {
        super.onDestroy();

        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }

        GuideCtrl.Inst().ClearGuideUi("MountEquipBuyEquip");
        GuideCtrl.Inst().ClearGuideUi("MountEquipClick0");
    }

    ClearData()
    {
        this.viewNode.Eff_0.StopEff(4164142)
        this.viewNode.Eff_1.StopEff(4164142)
        this.viewNode.Eff_2.StopEff(4164142)
        this.viewNode.Eff_3.StopEff(4164142)
    }
    flushInfoPanel()
    {
        let param = MountData.Inst().GetEquipParam()
        this.viewNode.UiModelShow.setPath(ResPath.Ride(param.mount_res));

        this.viewNode.Equip_0.SetData(param.equips[0])
        let red_1num = MountData.Inst().GetTypeEquipRed(0) + MountData.Inst().GetTypeWashRed(0)
        this.viewNode.RedPoint0.SetNum(red_1num>0?1:0)
        this.viewNode.Equip_1.SetData(param.equips[1])
        let red_2num = MountData.Inst().GetTypeEquipRed(1) + MountData.Inst().GetTypeWashRed(1)
        this.viewNode.RedPoint1.SetNum(red_2num>0?1:0)
        this.viewNode.Equip_2.SetData(param.equips[2])
        let red_3num = MountData.Inst().GetTypeEquipRed(2) + MountData.Inst().GetTypeWashRed(2)
        this.viewNode.RedPoint2.SetNum(red_3num>0?1:0)
        this.viewNode.Equip_3.SetData(param.equips[3])
        let red_4num = MountData.Inst().GetTypeEquipRed(3) + MountData.Inst().GetTypeWashRed(3)
        this.viewNode.RedPoint3.SetNum(red_4num>0?1:0)
        
        UH.SetText(this.viewNode.mount_name, param.mount_name)

        this.viewNode.attr_list.SetData(param.attr_list)
        this.viewNode.empty.visible = param.attr_list.length == 0
    }

    PlayEff()
    {
        let pos = MountData.Inst().GetEquipEffPos()
        if(pos == 0)
        {
            this.viewNode.Eff_0.PlayEff(4164147)
        }
        else if(pos == 1)
        {
            this.viewNode.Eff_1.PlayEff(4164147)
        }
        else if(pos == 2)
        {
            this.viewNode.Eff_2.PlayEff(4164147)
        }
        else if(pos == 3)
        {
            this.viewNode.Eff_3.PlayEff(4164147)
        }
    }

    OnClickBag()
    {
        ViewManager.Inst().OpenView(MountEquipBagView);
    }

    onClickBuyEquip()
    {
        ViewManager.Inst().OpenView(HarnessBuyView);
    }

    OnClickEquipPos(pos:number)
    {
        //viewNode的声明不能索引any，作罢
        let param = {index:0,oper_type:0,pos:{x:0,y:0},show_type:0,ex_param:false}
        if(pos == 0)
        {
            param.pos.x = this.viewNode.Equip_0.x
            param.pos.y = this.viewNode.Equip_0.y
            param.index = 0//this.viewNode.Equip_0.data.index
            param.show_type = 1
            param.ex_param = this.viewNode.Equip_0.data.item_info.item_id >0
            // LogError("?? ",this.viewNode.Equip_0.data)
        }
        if(pos == 1)
        {
            param.pos.x = this.viewNode.Equip_1.x
            param.pos.y = this.viewNode.Equip_1.y
            param.index = 1//this.viewNode.Equip_1.data.index
            param.show_type = 0
            param.ex_param = this.viewNode.Equip_1.data.item_info.item_id >0
            // LogError("?? ",this.viewNode.Equip_1.data)
        }
        if(pos == 2)
        {
            param.pos.x = this.viewNode.Equip_2.x
            param.pos.y = this.viewNode.Equip_2.y
            param.index = 2//this.viewNode.Equip_2.data.index
            param.show_type = 1
            param.ex_param = this.viewNode.Equip_2.data.item_info.item_id >0
            // LogError("?? ",this.viewNode.Equip_2.data)
        }
        if(pos == 3)
        {
            param.pos.x = this.viewNode.Equip_3.x
            param.pos.y = this.viewNode.Equip_3.y
            param.index = 3//this.viewNode.Equip_3.data.index
            param.show_type = 0
            param.ex_param = this.viewNode.Equip_3.data.item_info.item_id >0
            // LogError("?? ",this.viewNode.Equip_3.data)
        }

        
        ViewManager.Inst().OpenView(MountEquipOpView, param);
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

}

export class MountEquipPosShow extends fgui.GComponent {
    private viewNode = {
        type_name:<fgui.GLabel>null,
        attr_show:<fgui.GGroup>null,
        ItemCell:<ItemCell>null,
        attr_1_str:<fgui.GLabel>null,
        attr_2_str:<fgui.GLabel>null,
        empty_show:<fgui.GLoader>null,
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
        UH.SpriteName(this.viewNode.empty_show, "MountMain",MountEquipTypeIcon[data.harness_type])
        let item_cell = Item.Create(data.item_info,{is_click:false,is_num:false})
        this.viewNode.ItemCell.SetData(item_cell)
        UH.SetText(this.viewNode.attr_1_str,data.attr_1_str)
        UH.SetText(this.viewNode.attr_2_str,data.attr_2_str)

        UH.SetText(this.viewNode.type_name,data.type_name)

        this.viewNode.empty_show.visible = data.is_empty
        this.viewNode.attr_show.visible = !data.is_empty
    }
}

export class MountEquipMainAttr extends fgui.GComponent {
    private viewNode = {
        attr_type:<fgui.GLabel>null,
        attr_add:<fgui.GLabel>null,
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
        UH.SetText(this.viewNode.attr_type,AttrListName[data.type])
        UH.SetText(this.viewNode.attr_add, AttrHelper.Percent(data.type, data.add))
    }
}
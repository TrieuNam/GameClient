import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { UH } from "../../helpers/UIHelper";
import { PetRelicsData } from "./PetRelicsData";
import { PetRelicsIconBase, PetRelicsInfoBase } from "./PetRelicsView";

export class PetRelicsGrade extends BaseItem {

    // 注意声明类型！
    protected viewNode = {
        mode_left: <PetRelicsGradeShow>null,
        model_right: <PetRelicsGradeShow>null,
        empty: <fgui.GLabel>null,
        BtnOper: <fgui.GButton>null,
        GradeUpShow: <fgui.GGroup>null,
        GradeUpText: <fgui.GLabel>null,
        LevelDesc: <fgui.GLabel>null,
        SkillDesc: <fgui.GLabel>null,
    }
    private handleCollector: HandleCollector;
    InitData() {
        this.handleCollector = HandleCollector.Create();
        this.addSmartDataCare(PetRelicsData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");

        this.viewNode.BtnOper.onClick(this.OnClickOper.bind(this));

        this.flushInfoPanel()
    }
    protected onDestroy(): void {
        super.onDestroy();

        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }

    }
    flushInfoPanel()
    {
        let param = PetRelicsData.Inst().GetGradeParam()
        this.viewNode.mode_left.SetData(param.select_item)
        this.viewNode.model_right.SetData(param.stuff_item)
        let is_empty = param.stuff_item == null || param.select_item == null
        this.viewNode.GradeUpShow.visible = !is_empty
        this.viewNode.empty.visible = is_empty

        if(!is_empty)
        {
            UH.SetText( this.viewNode.GradeUpText,param.up_text)
            UH.SetText( this.viewNode.LevelDesc,param.level_desc)
            UH.SetText( this.viewNode.SkillDesc,param.skill_desc)
        }
        
        // this.viewNode.GradeUpShow
    }
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    OnClickOper()
    {

    }

}

export class PetRelicsGradeShow extends fgui.GComponent {
    private viewNode = {
        IconBase:<PetRelicsIconBase>null,
        InfoBase:<PetRelicsInfoBase>null,
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
    }
}
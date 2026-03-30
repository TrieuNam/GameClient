import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { PetRelicsData } from "./PetRelicsData";
import { PetRelicsGrade, PetRelicsGradeShow } from "./PetRelicsGrade";
import { PetRelicsLevel, PetRelicsLevelProg, PetRelicsLevelShow } from "./PetRelicsLevel";
import { PetRelicsMain, PetRelicsMainShow } from "./PetRelicsMain";
import { AttrListName } from '../common/Language';
import { AttrHelper } from "../../helpers/AttrHelper";
import { PetRelicsQuaCfg } from "./PetRelicsConfig";
import { Mod } from "modules/common/ModuleDefine";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { LogError } from "core/Debugger";

@BaseView.RegisterView
export class PetRelicsView extends BaseView {
    select_model = Mod.PetRelics.Base
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.PetRelics.MainTag[0], index: 0, modKey: Mod.PetRelics.Base, isRemind: true },
        { panel: null, viewName: "", titleName: Language.PetRelics.MainTag[1], index: 1, modKey: Mod.PetRelics.Level, isRemind: true },
        { panel: null, viewName: "", titleName: Language.PetRelics.MainTag[2], index: 2, modKey: Mod.PetRelics.Grade, isRemind: true }
    ]
    protected viewRegcfg = {
        UIPackName: "PetRelics",
        ViewName: "PetRelicsView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "LevelPreProg", ExtendsClass: PetRelicsLevelProg },
        { ResName: "LevelProg", ExtendsClass: PetRelicsLevelProg },
        { ResName: "RelicsAttrItem", ExtendsClass: PetRelicsAttrItem },
        { ResName: "RelicsAttrLevelShow", ExtendsClass: PetRelicsAttrShow },
        { ResName: "RelicsAttrShow", ExtendsClass: PetRelicsAttrShow },
        { ResName: "RelicsBagItem", ExtendsClass: PetRelicsBagItem },
        { ResName: "RelicsGrade", ExtendsClass: PetRelicsGrade },
        { ResName: "RelicsGradeShow", ExtendsClass: PetRelicsGradeShow },
        { ResName: "RelicsIconBase", ExtendsClass: PetRelicsIconBase },
        { ResName: "RelicsInfoBase", ExtendsClass: PetRelicsInfoBase },
        { ResName: "RelicsLevel", ExtendsClass: PetRelicsLevel },
        { ResName: "RelicsLevelShow", ExtendsClass: PetRelicsLevelShow },
        { ResName: "RelicsMain", ExtendsClass: PetRelicsMain },
        { ResName: "RelicsMainShow", ExtendsClass: PetRelicsMainShow },
        { ResName: "RelicsNameBase", ExtendsClass: PetRelicsNameBase },        
        { ResName: "ButtonTab", ExtendsClass: CommonBoard5Tab },        
    ]

    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        main_part: <PetRelicsMain>null,
        level_part: <PetRelicsLevel>null,
        grade_part: <PetRelicsGrade>null,
        TabList: <fgui.GList>null,
    }
    
    InitData(param:any) {
        PetRelicsData.Inst().SetOperCloth(param.cloth_id)

        this.viewNode.Board.SetData(new BoardData(PetRelicsView,Language.PetRelics.MainTitle,29))
        this.AddSmartDataCare(PetRelicsData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");

        this.viewNode.TabList.SetData(this.tabbarCfg);        
        this.viewNode.TabList.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        for (var i in this.tabbarCfg) {
            if (this.tabbarCfg[i].modKey == Mod.PetRelics.Base) {
                this.viewNode.TabList.OnSelectedItem(Number(i))
            }
        }

        this.viewNode.main_part.InitData();
        this.viewNode.level_part.InitData();
        this.viewNode.grade_part.InitData();

        this.flushInfoPanel()
        this.FlushShow();
    }
    flushInfoPanel() {

    }
    CloseCallBack(){
        PetRelicsData.Inst().SetOperCloth(null)
    }

    OnClickListItem(item: CommonBoard5Tab) {
        if (this.select_model !=  item._data.modKey) {
            this.select_model = item._data.modKey
            this.FlushShow();
        }
    }

    /**刷新展示界面 */
    public FlushShow() {
        this.viewNode.main_part.visible = this.select_model == Mod.PetRelics.Base;
        this.viewNode.level_part.visible = this.select_model == Mod.PetRelics.Level;
        this.viewNode.grade_part.visible = this.select_model == Mod.PetRelics.Grade;

        this.FlushData();
    }

    /**刷新数据 */
    public FlushData() {

    }
}

export class PetRelicsNameBase extends fgui.GLabel {
    private viewNode = {
        title:<fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        LogError("?rf +++name++",this.data)
        UH.SetText(this.viewNode.title,data.name)
    }
}

export class PetRelicsIconBase extends fgui.GComponent {
    private viewNode = {
        with_bg:<fgui.GImage>null,
        empty_type0:<fgui.GGroup>null,
        empty_type1:<fgui.GGroup>null,
        model_icon:<fgui.GLoader>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        LogError("?rf +++icon++",this.data)
        this.viewNode.with_bg.visible = !data.is_empty

        this.viewNode.empty_type0.visible = data.is_empty && data.empty_type == 0
        this.viewNode.empty_type1.visible = data.is_empty && data.empty_type == 1

        if(data.id> 0){
            UH.SetIcon(this.viewNode.model_icon, data.id, ICON_TYPE.ITEM);
        }
        
    }
}

export class PetRelicsInfoBase extends fgui.GComponent {
    private viewNode = {
        base_info:<fgui.GGroup>null,
        level_info:<fgui.GGroup>null,
        grade_info:<fgui.GGroup>null,

        level:<fgui.GLabel>null,
        grade:<fgui.GLabel>null,

        level_pre_level:<fgui.GLabel>null,
        level_next:<fgui.GLabel>null,
        level_grade:<fgui.GLabel>null,

        grade_left:<fgui.GLabel>null,
        grade_right:<fgui.GLabel>null,

        empty:<fgui.GGroup>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        LogError("?rf +++info++",this.data)
        // 注意三种情况下的构造是不一样的
        this.viewNode.base_info.visible = data.type == 0 && !data.is_empty
        this.viewNode.level_info.visible = data.type == 1 && !data.is_empty
        this.viewNode.grade_info.visible = data.type == 2 && !data.is_empty
        this.viewNode.empty.visible = data.is_empty

        if(data.type == 0)
        {
            UH.SetText(this.viewNode.level,data.level_show)
            UH.SetText(this.viewNode.grade,data.grade_show)
        }
        else if(data.type == 1)
        {
            UH.SetText(this.viewNode.level_pre_level,data.pre_level)
            UH.SetText(this.viewNode.level_next,data.next_level)
            UH.SetText(this.viewNode.level_grade,data.grade_show)
        }
        else if(data.type == 2)
        {
            this.viewNode.grade_left.visible = data.is_left
            this.viewNode.grade_right.visible = !data.is_left
        }
    }
}

export class PetRelicsBagItem extends fgui.GComponent {
    private viewNode = {
        title:<fgui.GLabel>null,
        ItemCell:<ItemCell>null,
        grade:<fgui.GLabel>null,
        selected_self:<fgui.GImage>null,
        selected_other:<fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data
        let item_info = Item.Create({item_id:data.item_id},{is_click:false,is_num:false})
        this.viewNode.ItemCell.SetData(item_info)
        UH.SetText(this.viewNode.title,data.name)
        UH.SetText(this.viewNode.grade,Language.PetRelics.GradeShow +data.grade)

        let oper_cloth = PetRelicsData.Inst().GetOperCloth()
        this.viewNode.selected_self.visible = oper_cloth == data.cloth_id
        this.viewNode.selected_other.visible = data.cloth_id > 0
    }
}

export class PetRelicsAttrItem extends fgui.GComponent {
    private viewNode = {
        attr_type:<fgui.GLabel>null,
        attr_value:<fgui.GLabel>null,
        pre_value:<fgui.GLabel>null,
        pre_show:<fgui.GGroup>null,
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
        this.viewNode.pre_show.visible = data.pre_show
        UH.SetText(this.viewNode.attr_type,AttrListName[data.type])
        UH.SetText(this.viewNode.attr_value,AttrHelper.Percent(data.type, data.add))
        UH.SetText(this.viewNode.pre_value,AttrHelper.Percent(data.type, data.change))
    }
}

export class PetRelicsAttrShow extends fgui.GComponent {
    private viewNode = {
        attrList:<fgui.GList>null,
        skill_desc:<fgui.GLabel>null,
        empty:<fgui.GGroup>null,
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
        this.viewNode.attrList.SetData(data.attr_list)
        LogError("?Rtg ",data)
        UH.SetText(this.viewNode.skill_desc,data.skill_desc)

        this.viewNode.empty.visible = data.attr_list.length == 0
    }
}

export class PetRelicsEnter extends fgui.GButton {
    private viewNode = {
        QuaIcon:<fgui.GLoader>null,
        ItemIcon:<fgui.GLoader>null,
        Equiped:<fgui.GGroup>null,
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
        this.viewNode.Equiped.visible = !data.is_empty
        UH.SpriteName(this.viewNode.QuaIcon, "PetHuanHua", PetRelicsQuaCfg["qua_"+data.qua]);
        UH.SetIcon(this.viewNode.ItemIcon, Item.GetIconId(data.item_id), ICON_TYPE.ITEM);

        // UH.SpriteName(this.viewNode.QuaIcon, "PetHuanHua", PetRelicsQuaCfg["qua_"+data.qua]);
    }
}
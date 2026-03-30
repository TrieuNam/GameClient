import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard5Tab, tabberInfo } from 'modules/common_board/CommonBoard5';
import { RedPoint } from 'modules/extends/RedPoint';
import { MountConfigQuaBgName } from "modules/mount/MountConfig";
import { MountData } from "modules/mount/MountData";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { MountBase } from './MountBaseShow';
import { HuanHuaAttCell, MountHuanHuaShow, MountResCell } from './MountHuanHuaShow';
import { CommonBoardCC, CoreCrisisBgShow, CoreCrisisNameShow } from '../common_board/CommonBoardCC';
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { LogError } from "core/Debugger";
import { HelpView } from "modules/common_help/CommonHelpView";
import { MountEquipMainAttr, MountEquipPosShow, MountEquipShow } from "./MountEquipShow";

@BaseView.registView
export class MountMainView extends BaseView {
    select_index = 0;
    select_model = Mod.Mount.Up
    HuanHuaBg: fgui.GImage;
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.Mount.MainTag[1], index: 0, modKey: Mod.Mount.Up, isRemind: true },
        { panel: null, viewName: "", titleName: Language.Mount.MainTag[0], index: 1, modKey: Mod.Mount.Equip, isRemind: true ,guide:"MountMainTabEquip"},
        { panel: null, viewName: "", titleName: Language.Mount.MainTag[2], index: 2, modKey: Mod.Mount.HuanHua, isRemind: true }
    ]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountMain",
        ViewName: "MountMainView",
        RelyOnPack: ["StarMap"],
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        BtnClose:<fgui.GButton> null,
        BtnTips:<fgui.GButton> null,

        MonutBase: <MountBase>null,
        MountHuanHua: <MountHuanHuaShow>null,
        MountEquip: <MountEquipShow>null,
        ListTab: <fgui.GList>null,
        // Board: <CommonBoardCC>null,
        cc_bgshow:<CoreCrisisBgShow> null,
        cc_nameshow:<CoreCrisisNameShow> null,
    };

    protected extendsCfg = [
        { ResName: "AttrChange", ExtendsClass: AttrChange },
        { ResName: "MountShowCellMain", ExtendsClass: MountShowCellMain },
        { ResName: "HuanHuaComp", ExtendsClass: MountHuanHuaShow },
        { ResName: "MountBase", ExtendsClass: MountBase },
        { ResName: "MountResCell", ExtendsClass: MountResCell },
        // { ResName: "HuanHuaComp", ExtendsClass: MountShowCellMain },
        { ResName: "HuanHuaAttCell", ExtendsClass: HuanHuaAttCell },
        { ResName: "MountEquip", ExtendsClass: MountEquipShow },
        { ResName: "EquipShow", ExtendsClass: MountEquipPosShow },
        { ResName: "EquipMainAttr", ExtendsClass: MountEquipMainAttr },
    ];

    InitData() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));
        this.viewNode.BtnTips.onClick(this.OnClickTips.bind(this));
        this.viewNode.cc_bgshow.SetData({core_mark:CoreCrisisType.Mount})
        this.viewNode.cc_nameshow.SetData({core_mark:CoreCrisisType.Mount})

        // this.viewNode.Board.SetData(new BoardData(MountMainView, Language.Mount.Title[0], 19))
        // this.viewNode.Board.SetCoreMark(CoreCrisisType.Mount)
        this.viewNode.ListTab.SetData(this.tabbarCfg);
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        // ;

        for(var i in this.tabbarCfg)
        {
            if(this.tabbarCfg[i].modKey == Mod.Mount.Up)
            {
                this.viewNode.ListTab.OnSelectedItem(Number(i))
            }
        }

        this.viewNode.MountHuanHua.InitData();
        this.viewNode.MonutBase.InitData();
        this.viewNode.MountEquip.InitData();
        this.AddSmartDataCare(MountData.Inst().flush_info, this.FlushData.bind(this), "needflush");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.FlushView.bind(this), "need_flush");
        this.FlushShow();
    }
    CloseCallBack() {

    }
    OnClickListItem(item: CommonBoard5Tab) {
        if (this.select_index != item._data.index) {
            this.select_index = item._data.index
            this.select_model = item._data.modKey
            this.FlushShow();
        }
    }

    /**刷新展示界面 */
    public FlushShow() {
        this.viewNode.MountEquip.visible = this.select_model == Mod.Mount.Equip;
        this.viewNode.MonutBase.visible = this.select_model == Mod.Mount.Up;
        this.viewNode.MountHuanHua.visible = this.select_model == Mod.Mount.HuanHua;

        this.FlushData();
    }

    /**刷新数据 */
    public FlushData() {
        // if (this.select_index == 0) {
        //     // this.viewNode.MountBaseComp.FlushAll();
        // } else {
        //     this.viewNode.MountHuanHua.FlushData();
        // }
        if(this.select_model == Mod.Mount.HuanHua)
        {
            this.viewNode.MountHuanHua.FlushData();
        }

        if(this.select_model != Mod.Mount.Equip)
        {
            this.viewNode.MountEquip.ClearData();
        }
    }

    public FlushView(){
        this.viewNode.cc_bgshow.FlushData()  
        // this.viewNode.Board.FlushCore()
    }
    private CloseView(){
        ViewManager.Inst().CloseView(MountMainView)
    }
    private OnClickTips() {
        ViewManager.Inst().OpenView(HelpView, 19);
    }
}


export class AttrChange extends fgui.GComponent {
    private viewNode = {
        attr_max: <fgui.GGroup>null,
        attr_change: <fgui.GGroup>null,

        attr_name_max: <fgui.GLabel>null,
        attr_value_max: <fgui.GLabel>null,

        attr_name_1: <fgui.GLabel>null,
        attr_value_1: <fgui.GLabel>null,

        attr_name_2: <fgui.GLabel>null,
        attr_value_2: <fgui.GLabel>null,
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
        this.viewNode.attr_max.visible = data.is_max
        this.viewNode.attr_change.visible = !data.is_max

        if (data.is_max == true) {
            UH.SetText(this.viewNode.attr_name_max, AttrListName[data.att_type]);
            UH.SetText(this.viewNode.attr_value_max, AttrHelper.Percent(data.att_type, data.att_1_value));
        }
        else {
            UH.SetText(this.viewNode.attr_name_1, AttrListName[data.att_type]);
            UH.SetText(this.viewNode.attr_name_2, AttrListName[data.att_type]);

            UH.SetText(this.viewNode.attr_value_1, AttrHelper.Percent(data.att_type, data.att_1_value));
            UH.SetText(this.viewNode.attr_value_2, AttrHelper.Percent(data.att_type, data.att_2_value));
        }

    }
}


export class MountShowCellMain extends fgui.GButton {
    private viewNode = {
        QuaIcon: <fgui.GLoader>null,
        MountIcon: <fgui.GLoader>null,
        Selected: <fgui.GImage>null,
        locked: <fgui.GGroup>null,
        TST: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
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
        this.viewNode.locked.visible = true
        UH.SetText(this.viewNode.TST, "")//data.id);
        this.viewNode.locked.visible = this.data.grade == 0
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", MountConfigQuaBgName[data.color]);

        var cfg = MountData.Inst().GetHeChengCfg(this.data.id);
        UH.SetIcon(this.viewNode.MountIcon, cfg.hecheng_item_id, ICON_TYPE.ITEM)

        let num1 = data.main_red_num != null ? data.main_red_num : 0
        let num2 = data.awake_red_num != null ? data.awake_red_num : 0
        this.viewNode.RedPoint.SetNum((num1 > 0 || num2 > 0) ? 1 : 0)
    }
}

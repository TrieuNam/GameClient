import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ViewManager } from "manager/ViewManager";
import { SuperStarMapView } from "modules/star_map/SuperStarMapView";
import { StarMapPointUpView } from "modules/star_map/StarMapPointUp";
import { StarMapData } from "modules/star_map/StarMapData";
import { StarMapLineCfg, StarMapAttrIcon, StarMapBgName } from "modules/star_map/StarMapConifg";
import { UH } from "../../helpers/UIHelper";
import { Language } from 'modules/common/Language';
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { HelpView } from 'modules/common_help/CommonHelpView';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { StarMapLineMapFix, StarMapShowFix } from './StarMapShowFix';
import { UIEffectShow } from '../scene_obj_spine/UIEffectShow';
import { Item } from 'modules/bag/ItemData';
import { Mod } from 'modules/common/ModuleDefine';
import { FunOpen } from 'modules/guide/FunOpen';
import { RedPoint } from 'modules/extends/RedPoint';
import { AttrHelper } from '../../helpers/AttrHelper';
import { StarMapBtnFes, StarMapFesView } from 'modules/StarMapFes/StarMapFesView';
import { StarMapFesData } from 'modules/StarMapFes/StarMapFesCtrl';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { CoreCrisisBgShow, CoreCrisisNameShow } from 'modules/common_board/CommonBoardCC';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisView } from 'modules/CoreCrisis/CoreCrisisView';
import { TextHelper } from '../../helpers/TextHelper';
import { StarMapOneKeyView } from './StarMapOneKeyView';
import { StarMapSuperNew } from './StarMapSuperNew';
import { StarMapSuperData } from './StarMapSuperData';

@BaseView.registView
export class StarMapMainView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "StarMap",
        ViewName: "StarMapMainView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnTips: <fgui.GButton>null,
        BtnSuper: <fgui.GButton>null,
        // MapGroup:<StarMapGroup> null,

        MapShow: <StarMapShowFix>null,

        taglist: <fgui.GList>null,
        attr_list: <fgui.GList>null,
        grade_list: <fgui.GList>null,
        EmptyAttr: <fgui.GLabel>null,
        SuperStarRedPoint: <RedPoint>null,
        BtnFes: <StarMapBtnFes>null,

        cc_bgshow: <CoreCrisisBgShow>null,
        cc_nameshow: <CoreCrisisNameShow>null,

        OneKeyCheck: <fgui.GButton>null,
    }

    protected extendsCfg = [
        { ResName: "map1_1", ExtendsClass: StarMapGroupSingle },
        { ResName: "map1_2", ExtendsClass: StarMapGroupSingle },
        { ResName: "map1_3", ExtendsClass: StarMapGroupSingle },
        { ResName: "map1_4", ExtendsClass: StarMapGroupSingle },
        { ResName: "map1_5", ExtendsClass: StarMapGroupSingle },
        { ResName: "map1_6", ExtendsClass: StarMapGroupSingle },
        { ResName: "map2_1", ExtendsClass: StarMapGroupSingle },
        { ResName: "map2_2", ExtendsClass: StarMapGroupSingle },
        { ResName: "map2_3", ExtendsClass: StarMapGroupSingle },
        { ResName: "map2_4", ExtendsClass: StarMapGroupSingle },
        { ResName: "map2_5", ExtendsClass: StarMapGroupSingle },
        { ResName: "map2_6", ExtendsClass: StarMapGroupSingle },

        { ResName: "map_show", ExtendsClass: StarMapShowFix },
        { ResName: "LineMapFix", ExtendsClass: StarMapLineMapFix },

        { ResName: "MapGroup", ExtendsClass: StarMapGroup },


        { ResName: "NP_Star", ExtendsClass: NomalPointStar },
        { ResName: "LineMap", ExtendsClass: LineMap },
        { ResName: "line", ExtendsClass: StarLineCell },
        { ResName: "sm_twice_attr", ExtendsClass: StarTwiceAttr },

        { ResName: "TypeBtn", ExtendsClass: StarMapTypeBtn },
        { ResName: "BtnTagGrade", ExtendsClass: StarMapGradeBtn },

        { ResName: "BtnFes", ExtendsClass: StarMapBtnFes },
    ];

    private selected_grade: number
    private selected_type: number
    private tag_list: any
    private grade_list: any
    InitData() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));
        this.viewNode.BtnSuper.onClick(this.OnClickSuperStar.bind(this));
        this.viewNode.OneKeyCheck.onClick(this.OnClickOneKeyCheck.bind(this));
        this.viewNode.cc_bgshow.SetData({ core_mark: CoreCrisisType.StarMap })
        this.viewNode.cc_nameshow.SetData({ core_mark: CoreCrisisType.StarMap })

        this.viewNode.taglist.on(fgui.Event.CLICK_ITEM, this.ClickTag, this);
        this.viewNode.grade_list.on(fgui.Event.CLICK_ITEM, this.ClickGrade, this);

        this.viewNode.BtnTips.onClick(this.OnClickTips.bind(this));
        this.viewNode.BtnFes.onClick(this.onClickFes.bind(this));
        StarMapFesData.Inst().CheckTime()
        this.AddSmartDataCare(StarMapFesData.Inst().flush_info, this.FlushFes.bind(this), "show_time");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");

        this.flushFixList(true)
        // this.selected_grade = 1
        // this.selected_type = 1

        // this.viewNode.taglist.selectedIndex = 0
        // this.viewNode.grade_list.selectedIndex = 0

        this.AddSmartDataCare(StarMapData.Inst().flush_info, this.flushFixList.bind(this), "needflush");
        this.AddSmartDataCare(StarMapData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");
        this.AddSmartDataCare(StarMapFesData.Inst().flush_info, this.FlushFes.bind(this), "flush_need");

        GuideCtrl.Inst().AddGuideUi("StarMapMainBtnSuper", this.viewNode.BtnSuper);

        this.flushInfoPanel()
        this.FlushFes()
    }

    CloseCallBack() {
        GuideCtrl.Inst().ClearGuideUi("StarMapMainBtnSuper");
        GuideCtrl.Inst().ForceStop();
    }
    /* 展示盛典界面 */
    public FlushFes() {
        // LogError("?Fes",FunOpen.Inst().GetFunIsOpen(Mod.StarMapFes.Main).is_open,StarMapFesData.Inst().flush_info.show_time,ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.StarMapGala) )
        this.viewNode.BtnFes.visible = FunOpen.Inst().GetFunIsOpen(Mod.StarMapFes.Main).is_open && StarMapFesData.Inst().flush_info.show_time == 1
            && ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.StarMapGala)

        //
    }


    private flushFixList(init_flag: boolean) {
        this.tag_list = StarMapData.Inst().GetStarMapTagList()
        this.viewNode.taglist.SetData(this.tag_list);

        if (init_flag) {
            this.viewNode.taglist.selectedIndex = 0
            this.selected_type = 1
        }
        else {
            this.selected_type = this.tag_list[this.viewNode.taglist.selectedIndex].show_type
        }

        this.grade_list = StarMapData.Inst().GetStarMapGradeList(this.tag_list[this.viewNode.taglist.selectedIndex].type)
        this.viewNode.grade_list.SetData(this.grade_list);

        if (init_flag) {
            this.viewNode.grade_list.selectedIndex = 0
            this.selected_grade = 1
        }
        else {
            this.selected_grade = this.grade_list[this.viewNode.grade_list.selectedIndex].show_grade
        }
    }

    private flushInfoPanel() {
        let attr_list = StarMapData.Inst().GetStarMapAttr(this.selected_type - 1, this.selected_grade - 1)
        this.viewNode.attr_list.SetData(attr_list)

        this.viewNode.MapShow.TryShowMap(this.selected_type, this.selected_grade)
        // this.viewNode.MapGroup.TryShowMap(this.selected_type,this.selected_grade)

        this.viewNode.EmptyAttr.visible = attr_list.length == 0
        let red_num = StarMapSuperData.Inst().GetSuperRemind()
        this.viewNode.SuperStarRedPoint.SetNum(red_num)

        this.viewNode.cc_bgshow.FlushData()
    }

    private ClickTag(item: StarMapTypeBtn) {
        let open_t = FunOpen.Inst().GetFunIsOpen(item.data.mod);
        if (!open_t.is_open) {
            PublicPopupCtrl.Inst().Center(open_t.content);
            this.viewNode.taglist.selectedIndex = this.selected_type - 1
            return
        }

        for (let i = this.grade_list.length - 1; i > -1; i--) {
            if (StarMapData.Inst().CheckGradeUnLock(item.data.type, i)) {
                this.viewNode.grade_list.selectedIndex = i
                this.selected_grade = this.grade_list[i].show_grade
                break
            }

        }

        this.selected_type = item.data.show_type
        this.flushInfoPanel()
        this.flushFixList(false)
    }

    private ClickGrade(item: StarMapGradeBtn) {
        if (!item.data.unlock) {
            this.viewNode.grade_list.selectedIndex = this.selected_grade - 1
            PublicPopupCtrl.Inst().Center(Language.StarMap.GradeLock);
            return
        }

        this.selected_grade = item.data.show_grade
        this.flushInfoPanel()
    }

    private OnClickSuperStar() {
        //ViewManager.Inst().OpenView(SuperStarMapView)
        ViewManager.Inst().OpenView(StarMapSuperNew)
    }
    private CloseView() {
        ViewManager.Inst().CloseView(StarMapMainView)
    }
    private OnClickTips() {
        ViewManager.Inst().OpenView(HelpView, 5);
    }
    public onClickFes() {
        ViewManager.Inst().OpenView(StarMapFesView)
    }
    private OnClickOneKeyCheck() {
        let param = StarMapData.Inst().StarMapOneKeyCheck(this.selected_type, this.selected_grade)
        if (param.point_list.length == 0 && param.is_limit) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips,
                Language.CoreCrisis.CoreName[CoreCrisisType.StarMap]))
            ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.StarMap })
            return
        }

        if (StarMapData.Inst().GetIsMaxLevel(this.selected_type, this.selected_grade)) {
            PublicPopupCtrl.Inst().Center(Language.StarMap.MaxLevel)
            return
        }

        ViewManager.Inst().OpenView(StarMapOneKeyView, { type: this.selected_type, grade: this.selected_grade })
        // StarMapData.Inst().StarMapOneKeyCheck(this.selected_type,this.selected_grade)
    }
}

export class StarLineCell extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        rot: <fgui.GGroup>null,
        bg: <fgui.GImage>null,
        ready: <fgui.GImage>null,
        acted: <fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public ShowReady(flag: boolean) { this.viewNode.ready.visible = flag }
    public ShowActed(flag: boolean) { this.viewNode.acted.visible = flag }

    public RotLine(rot: number) {
        // LogError("?jpiowefrphjnioafdesw ",this.viewNode.rot,this.viewNode)
        // this.viewNode.rot.rotation = rot
        this.viewNode.bg.rotation = rot
        this.viewNode.ready.rotation = rot
        this.viewNode.acted.rotation = rot
    }
}

export class LineMap extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {}

    private Lines: { [key: string]: any } = []
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    // point{is_act,x,y,pos}
    public AddNewLine(Point1: any, Point2: any) {
        let lineItem = <StarLineCell>fgui.UIPackage.createObject("StarMap", "line").asCom;
        let child = this.addChild(lineItem);
        child.setPosition(Point1.x, Point1.y);
        child.width = Math.sqrt((Point1.y - Point2.y) * (Point1.y - Point2.y) + (Point1.x - Point2.x) * (Point1.x - Point2.x))

        let corn = Math.atan((Point1.y - Point2.y) / (Point1.x - Point2.x)) * (180 / Math.PI)
        child.rotation = ((Point1.x - Point2.x) < 0) ? corn : corn + 180

        this.Lines[Point1.pos + "|" + Point2.pos] = lineItem

    }

    public FlushLine(Point1: any, Point2: any) {
        if (this.Lines[Point1.pos + "|" + Point2.pos] != null) {
            let oper = this.Lines[Point1.pos + "|" + Point2.pos]
            oper.ShowReady(Point1.is_act || Point2.is_act)
            oper.ShowActed(Point1.is_act && Point2.is_act)
        }
    }
}


export class StarMapGroup extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        map1_1: <StarMapGroupSingle>null,
        map1_2: <StarMapGroupSingle>null,
        map1_3: <StarMapGroupSingle>null,
        map1_4: <StarMapGroupSingle>null,
        map1_5: <StarMapGroupSingle>null,
        map1_6: <StarMapGroupSingle>null,
        map2_1: <StarMapGroupSingle>null,
        map2_2: <StarMapGroupSingle>null,
        map2_3: <StarMapGroupSingle>null,
        map2_4: <StarMapGroupSingle>null,
        map2_5: <StarMapGroupSingle>null,
        map2_6: <StarMapGroupSingle>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        for (let i = 1; i < 3; i++) {
            for (let j = 1; j < 7; j++) {
                if (StarMapLineCfg["map" + i + "_" + j] != null) {

                    this.viewNode["map" + i + "_" + j].InitLine(StarMapLineCfg["map" + i + "_" + j])
                }
            }
        }

        for (let i = 1; i < 3; i++) {
            for (let j = 1; j < 7; j++) {
                this.viewNode["map" + i + "_" + j].SetData(StarMapData.Inst().GetStarMapGroupInfo(i, j))
            }
        }
    }

    public TryShowMap(Tag1: number, Tag2: number) {
        let flag = false
        for (let i = 1; i < 3; i++) {
            for (let j = 1; j < 7; j++) {
                flag = Tag1 == i && Tag2 == j
                this.viewNode["map" + i + "_" + j].visible = flag
                this.viewNode["map" + i + "_" + j].flushInfo()
            }
        }
    }
}

export class StarMapGroupSingle extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        node_0: <NomalPointStar>null,
        node_1: <NomalPointStar>null,
        node_2: <NomalPointStar>null,
        node_3: <NomalPointStar>null,
        node_4: <NomalPointStar>null,
        node_5: <NomalPointStar>null,
        node_6: <NomalPointStar>null,
        node_7: <NomalPointStar>null,
        node_8: <NomalPointStar>null,
        node_9: <NomalPointStar>null,
        LineMap: <LineMap>null,
        loader: <fgui.GLoader>null,
    }
    private node_offset = { x: 34, y: 35 }
    private view_param: any
    private init_done = false
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.node_0.onClick(this.ClickNode.bind(this, 0));
        this.viewNode.node_1.onClick(this.ClickNode.bind(this, 1));
        this.viewNode.node_2.onClick(this.ClickNode.bind(this, 2));
        this.viewNode.node_3.onClick(this.ClickNode.bind(this, 3));
        this.viewNode.node_4.onClick(this.ClickNode.bind(this, 4));
        this.viewNode.node_5.onClick(this.ClickNode.bind(this, 5));
        this.viewNode.node_6.onClick(this.ClickNode.bind(this, 6));
        this.viewNode.node_7.onClick(this.ClickNode.bind(this, 7));
        this.viewNode.node_8.onClick(this.ClickNode.bind(this, 8));
        this.viewNode.node_9.onClick(this.ClickNode.bind(this, 9));
    }

    public SetData(data: any) {
        this.view_param = data

        // LogError("?cetdata ",this.view_param.type , this.view_param.grade )

        // for(let i = 0;i<10;i++){
        //     LogError(i,this.view_param.show_type+"_"+this.view_param.show_grade,this.viewNode["node_"+i].x,this.viewNode["node_"+i].y)
        // }

        this.viewNode.loader.SetIcon("loader/star_map/" + StarMapBgName[this.view_param.show_type + "_" + this.view_param.show_grade],
            () => { })

    }

    public InitLine(data: any) {
        for (let i = 0; i < data.length; i++) {
            let pos_1_mark = (data[i][0])
            let pos_2_mark = (data[i][1])

            let point1 = {
                x: this.viewNode["node_" + pos_1_mark].x + this.node_offset.x,
                y: this.viewNode["node_" + pos_1_mark].y + this.node_offset.y,
                pos: pos_1_mark
            }
            let point2 = {
                x: this.viewNode["node_" + pos_2_mark].x + this.node_offset.x,
                y: this.viewNode["node_" + pos_2_mark].y + this.node_offset.y,
                pos: pos_2_mark
            }
            this.viewNode.LineMap.AddNewLine(point1, point2)
        }
    }

    public flushInfo() {//this.viewNode.LineMap.
        let point_list = StarMapData.Inst().GetStarMapNetInfo(this.view_param.type, this.view_param.grade)
        for (let i = 0; i < point_list.length; i++) {
            this.viewNode["node_" + i].SetData(point_list[i])
        }

        let line_list = StarMapData.Inst().GetStarMapLineInfo(this.view_param.type, this.view_param.grade)
        for (let i = 0; i < line_list.length; i++) {
            this.viewNode.LineMap.FlushLine(line_list[i].p1, line_list[i].p2)
        }

        if (!this.init_done && this.view_param.type == 0 && this.view_param.grade == 0) {
            // GuideCtrl.Inst().AddGuideUi("StarMapMainType0Grade0Node0", this.viewNode.node_0);
            this.init_done = true
        }

    }

    private ClickNode(pos: number) {
        let check_level = this.viewNode["node_" + pos].data.level + 1
        if (check_level > 10) {
            PublicPopupCtrl.Inst().Center(Language.StarMap.LevelMax);
            return
        }

        if (!StarMapData.Inst().GetStarMapPointCanOper(this.view_param.type, this.view_param.grade, pos)) {
            PublicPopupCtrl.Inst().Center(Language.StarMap.LinkError);
            return
        }

        let param = StarMapData.Inst().GetStarMapPointUpParam(this.view_param.type, this.view_param.grade, pos, this.viewNode["node_" + pos].data.level)

        ViewManager.Inst().OpenView(StarMapPointUpView, param)
    }
}

export class NomalPointStar extends fgui.GButton {
    private viewNode = {
        attr_icon: <fgui.GLoader>null,
        bg: <fgui.GImage>null,
        acted: <fgui.GImage>null,
        selected: <fgui.GImage>null,
        LevelShow: <fgui.GLabel>null,
        Eff: <UIEffectShow>null,
        Effect: <fgui.GGraph>null,
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

        this.viewNode.acted.visible = data.level > 0
        let check_level = data.level == 10 ? 10 : data.level + 1
        let cfg = StarMapData.Inst().GetStarMapRoleStar(data.type, data.grade, data.id, check_level)
        // LogError("?sssss",cfg.jihuo_att[0].type,StarMapAttrIcon[cfg.jihuo_att[0].type])
        UH.SpriteName(this.viewNode.attr_icon, "StarMap", StarMapAttrIcon[cfg.jihuo_att[0].type])
        let flag = StarMapData.Inst().GetStarMapPointCanOper(data.type, data.grade, data.id)
        // for(var index in cfg.cost_item) {
        //     let with_num = Item.GetNum(cfg.cost_item[index].item_id)
        //     if(with_num < cfg.cost_item[index].num){
        //         flag = false
        //         break
        //     }
        // }
        this.viewNode.Effect.visible = false//flag
        if (flag) {
            this.viewNode.Eff.PlayEff("4164040")
        }
        else {
            this.viewNode.Eff.StopEff("4164040")
        }

        UH.SetText(this.viewNode.LevelShow, data.level + "/10");
    }

    public GetLevel() { return this.data.level }
    public SetSelect(flag: boolean) { this.viewNode.selected.visible = flag }
}

export class StarMapTypeBtn extends fgui.GButton {
    private viewNode = {
        Name: <fgui.GLabel>null,
        SelectName: <fgui.GLabel>null,
        nomal: <fgui.GImage>null,
        selected: <fgui.GImage>null,
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

        UH.SetText(this.viewNode.Name, data.name);
        UH.SetText(this.viewNode.SelectName, data.name);

        if (data.mod != null) {
            let is_open = FunOpen.Inst().GetFunIsOpen(data.mod);
            this.viewNode.nomal.grayed = !is_open.is_open
            this.viewNode.selected.grayed = !is_open.is_open
        }

        let is_red = StarMapData.Inst().GetTagIsRed(data.type)
        this.viewNode.RedPoint.SetNum(is_red ? 1 : 0)
    }

}

export class StarMapGradeBtn extends fgui.GButton {
    private viewNode = {
        name: <fgui.GLabel>null,
        Lock: <fgui.GGroup>null,
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

        UH.SetText(this.viewNode.name, data.name);
        this.viewNode.Lock.visible = !data.unlock


        let is_red = StarMapData.Inst().GetGradeIsRed(data.type, data.grade)
        this.viewNode.RedPoint.SetNum(is_red ? 1 : 0)
    }

}

export class StarTwiceAttr extends fgui.GComponent {
    private viewNode = {
        attr_1_name: <fgui.GLabel>null,
        attr_2_name: <fgui.GLabel>null,
        attr_1_value: <fgui.GLabel>null,
        attr_2_value: <fgui.GLabel>null,
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

        UH.SetText(this.viewNode.attr_1_name, data[0].name);
        UH.SetText(this.viewNode.attr_1_value, AttrHelper.Percent(data[0].type, data[0].value));
        if (data[1]) {
            UH.SetText(this.viewNode.attr_2_name, data[1].name);
            UH.SetText(this.viewNode.attr_2_value, AttrHelper.Percent(data[1].type, data[1].value));
        }
        else {
            UH.SetText(this.viewNode.attr_2_name, "");
            UH.SetText(this.viewNode.attr_2_value, "");
        }
    }
}




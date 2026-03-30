import { LogError } from 'core/Debugger';
import { setDisplayStats, _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from 'modules/common_board/BoardData';
import { Language } from 'modules/common/Language';
import { SuperStarMapLineCfg,StarMapAttrIcon } from "modules/star_map/StarMapConifg";
import { StarMapData } from "modules/star_map/StarMapData";
import { UH } from "../../helpers/UIHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { StarMapPointUpView } from "modules/star_map/StarMapPointUp";
import { SuperResetView } from "modules/star_map/SuperResetView";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { HelpView } from "modules/common_help/CommonHelpView";
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { SuperStarMapFix } from './SuperStarMapFix';
import { StarLineCell } from './StarMapMainView';
import { Item } from 'modules/bag/ItemData';
import { UIEffectShow } from 'modules/scene_obj_spine/UIEffectShow';

@BaseView.registView 
export class SuperStarMapView extends BaseView {
    protected OffectPos = {x:280,y:601}
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "StarMapSuper",
        ViewName: "SuperStarMap",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board:<CommonBoard3>null,
        BtnReset:<fgui.GButton> null,
        BtnFangDa:<fgui.GButton> null,
        BtnSuoXiao:<fgui.GButton> null,
        BtnShowLevel:<fgui.GButton> null,
        BtnAttrShow:<fgui.GButton> null,
        BtnTips:<fgui.GButton> null,
        FullMap:<MapScale> null,
    }

    private is_show_level = true
    protected extendsCfg = [
        { ResName: "MapScale", ExtendsClass: MapScale },
        { ResName: "SuperStarMapDi", ExtendsClass: SuperStarMap },
        { ResName: "N_Star", ExtendsClass: SuperPointStar },
        { ResName: "SuperStarLineMap", ExtendsClass: SuperLineMap },
        { ResName: "SuperStarLine", ExtendsClass: SuperStarLineCell },
        { ResName: "SuperStarMapDiFix", ExtendsClass: SuperStarMapFix },
    ];

    InitData(){
        this.viewNode.Board.SetData(new BoardData(SuperStarMapView,Language.StarMap.SuperStarTitle,6));
    
        this.viewNode.BtnReset.onClick(this.OnClickReset.bind(this));
        this.viewNode.BtnFangDa.onClick(this.OnClickFangDa.bind(this));
        this.viewNode.BtnSuoXiao.onClick(this.OnClickSuoXiao.bind(this));
        this.viewNode.BtnShowLevel.onClick(this.OnClickShowLevel.bind(this));
        this.viewNode.BtnAttrShow.onClick(this.OnClickAttrShow.bind(this));
        this.viewNode.BtnTips.onClick(this.OnClickTips.bind(this));

        this.AddSmartDataCare(StarMapData.Inst().flush_info, this.flushInfoPanel.bind(this), "needflush");

        this.flushInfoPanel()

        this.viewNode.FullMap.GetOper().scrollPane.posX = 1410 - 280
        this.viewNode.FullMap.GetOper().scrollPane.posY = 890 - 601
    }
    private flushInfoPanel() {
        this.viewNode.FullMap.GetOper().flushInfo()
    }
    private OnClickTips() {
        ViewManager.Inst().OpenView(HelpView, 6);
    }
    private OnClickReset() {
        ViewManager.Inst().OpenView(SuperResetView)
        // LogError("?click reset!",this.viewNode.FullMap.scrollPane.scrollingPosY,
        // this.viewNode.FullMap.scrollPane.posY,this.viewNode.FullMap.scrollPane.percY)

    }
    private OnClickAttrShow() {
        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: StarMapData.Inst().GetSuperStarAllAttr()
        })
    }
    private OnClickShowLevel() {
        this.is_show_level = !this.is_show_level
        this.viewNode.FullMap.GetOper().ShowNodeLevel(this.is_show_level)
    }
    private OnClickFangDa() {
        this.viewNode.FullMap.ScaleUp()

        this.viewNode.BtnSuoXiao.visible = true
        this.viewNode.BtnFangDa.visible = false
    }

    private OnClickSuoXiao() {
        this.viewNode.FullMap.ScaleDown()

        this.viewNode.BtnSuoXiao.visible = false
        this.viewNode.BtnFangDa.visible = true
    }
    CloseCallBack() {
        GuideCtrl.Inst().ForceStop();
    }
}

export class MapScale extends fgui.GComponent {
    private viewNode = {
        oper:<SuperStarMapFix> null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }

    public ScaleUp(){
        this.viewNode.oper.setScale(2,2)
    }

    public ScaleDown(){
        this.viewNode.oper.setScale(1,1)
    }

    public GetOper(){
        return  this.viewNode.oper
    }
}

export class SuperStarLineCell extends fgui.GComponent {
    private viewNode:{[key:string]:any} = {
        ready: <fgui.GImage> null,
        acted: <fgui.GImage> null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public ShowReady(flag:boolean) { this.viewNode.ready.visible = flag }
    public ShowActed(flag:boolean) { this.viewNode.acted.visible = flag }
}

export class SuperLineMap extends fgui.GComponent {
    private viewNode:{[key:string]:any} = {}

    private Lines:{[key:string]:any} = []
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    // point{is_act,x,y,pos}
    public AddNewLine(Point1:any,Point2:any) {
        let lineItem = <StarLineCell>fgui.UIPackage.createObject("StarMap", "line").asCom;
        let child = this.addChild(lineItem);
        child.setPosition( Point1.x ,Point1.y );
        child.width = Math.sqrt((Point1.y - Point2.y)*(Point1.y - Point2.y) + (Point1.x - Point2.x)*(Point1.x - Point2.x))

        let corn = Math.atan((Point1.y-Point2.y)/(Point1.x-Point2.x))*(180/Math.PI) 
        
        let rot = ((Point1.x-Point2.x)<0) ? corn : corn + 180
        // rot = rot == -0 ? 0:rot
        // lineItem.rotation = rot
        // LogError("?check corn!",Point1.pos,Point2.pos,((Point1.x-Point2.x)<0) ? corn : corn + 180,rot)
        // lineItem.rotation = 180
        // lineItem.rotation = 180
        lineItem.RotLine(rot)
        this.Lines[Point1.pos+"|"+Point2.pos] = lineItem

    }

    public FlushLine(Point1:any,Point2:any){
        if(this.Lines[Point1.pos+"|"+Point2.pos]!= null)
        {
            let oper = this.Lines[Point1.pos+"|"+Point2.pos]
            oper.ShowReady(Point1.is_act || Point2.is_act)
            oper.ShowActed(Point1.is_act && Point2.is_act)
        }
    }
}

export class SuperStarMap extends fgui.GComponent {
    // 合计165行
    private viewNode:{[key:string]:any} = {
        SuperLineMap:<SuperLineMap>null,
        loader : <fgui.GLoader>null,

        node_0 : <SuperPointStar>null,
        node_1 : <SuperPointStar>null,
        node_2 : <SuperPointStar>null,
        node_3 : <SuperPointStar>null,
        node_4 : <SuperPointStar>null,
        node_5 : <SuperPointStar>null,
        node_6 : <SuperPointStar>null,
        node_7 : <SuperPointStar>null,
        node_8 : <SuperPointStar>null,
        node_9 : <SuperPointStar>null,
        node_10 : <SuperPointStar>null,
        node_11 : <SuperPointStar>null,
        node_12 : <SuperPointStar>null,
        node_13 : <SuperPointStar>null,
        node_14 : <SuperPointStar>null,
        node_15 : <SuperPointStar>null,
        node_16 : <SuperPointStar>null,
        node_17 : <SuperPointStar>null,
        node_18 : <SuperPointStar>null,
        node_19 : <SuperPointStar>null,
        node_20 : <SuperPointStar>null,
        node_21 : <SuperPointStar>null,
        node_22 : <SuperPointStar>null,
        node_23 : <SuperPointStar>null,
        node_24 : <SuperPointStar>null,
        node_25 : <SuperPointStar>null,
        node_26 : <SuperPointStar>null,
        node_27 : <SuperPointStar>null,
        node_28 : <SuperPointStar>null,
        node_29 : <SuperPointStar>null,
        node_30 : <SuperPointStar>null,
        node_31 : <SuperPointStar>null,
        node_32 : <SuperPointStar>null,
        node_33 : <SuperPointStar>null,
        node_34 : <SuperPointStar>null,
        node_35 : <SuperPointStar>null,
        node_36 : <SuperPointStar>null,
        node_37 : <SuperPointStar>null,
        node_38 : <SuperPointStar>null,
        node_39 : <SuperPointStar>null,
        node_40 : <SuperPointStar>null,
        node_41 : <SuperPointStar>null,
        node_42 : <SuperPointStar>null,
        node_43 : <SuperPointStar>null,
        node_44 : <SuperPointStar>null,
        node_45 : <SuperPointStar>null,
        node_46 : <SuperPointStar>null,
        node_47 : <SuperPointStar>null,
        node_48 : <SuperPointStar>null,
        node_49 : <SuperPointStar>null,
        node_50 : <SuperPointStar>null,
        node_51 : <SuperPointStar>null,
        node_52 : <SuperPointStar>null,
        node_53 : <SuperPointStar>null,
        node_54 : <SuperPointStar>null,
        node_55 : <SuperPointStar>null,
        node_56 : <SuperPointStar>null,
        node_57 : <SuperPointStar>null,
        node_58 : <SuperPointStar>null,
        node_59 : <SuperPointStar>null,
        node_60 : <SuperPointStar>null,
        node_61 : <SuperPointStar>null,
        node_62 : <SuperPointStar>null,
        node_63 : <SuperPointStar>null,
        node_64 : <SuperPointStar>null,
        node_65 : <SuperPointStar>null,
        node_66 : <SuperPointStar>null,
        node_67 : <SuperPointStar>null,
        node_68 : <SuperPointStar>null,
        node_69 : <SuperPointStar>null,
        node_70 : <SuperPointStar>null,
        node_71 : <SuperPointStar>null,
        node_72 : <SuperPointStar>null,
        node_73 : <SuperPointStar>null,
        node_74 : <SuperPointStar>null,
        node_75 : <SuperPointStar>null,
        node_76 : <SuperPointStar>null,
        node_77 : <SuperPointStar>null,
        node_78 : <SuperPointStar>null,
        node_79 : <SuperPointStar>null,
        node_80 : <SuperPointStar>null,
        node_81 : <SuperPointStar>null,
        node_82 : <SuperPointStar>null,
        node_83 : <SuperPointStar>null,
        node_84 : <SuperPointStar>null,
        node_85 : <SuperPointStar>null,
        node_86 : <SuperPointStar>null,
        node_87 : <SuperPointStar>null,
        node_88 : <SuperPointStar>null,
        node_89 : <SuperPointStar>null,
        node_90 : <SuperPointStar>null,
        node_91 : <SuperPointStar>null,
        node_92 : <SuperPointStar>null,
        node_93 : <SuperPointStar>null,
        node_94 : <SuperPointStar>null,
        node_95 : <SuperPointStar>null,
        node_96 : <SuperPointStar>null,
        node_97 : <SuperPointStar>null,
        node_98 : <SuperPointStar>null,
        node_99 : <SuperPointStar>null,
        node_100 : <SuperPointStar>null,
        node_101 : <SuperPointStar>null,
        node_102 : <SuperPointStar>null,
        node_103 : <SuperPointStar>null,
        node_104 : <SuperPointStar>null,
        node_105 : <SuperPointStar>null,
        node_106 : <SuperPointStar>null,
        node_107 : <SuperPointStar>null,
        node_108 : <SuperPointStar>null,
        node_109 : <SuperPointStar>null,
        node_110 : <SuperPointStar>null,
        node_111 : <SuperPointStar>null,
        node_112 : <SuperPointStar>null,
        node_113 : <SuperPointStar>null,
        node_114 : <SuperPointStar>null,
        node_115 : <SuperPointStar>null,
        node_116 : <SuperPointStar>null,
        node_117 : <SuperPointStar>null,
        node_118 : <SuperPointStar>null,
        node_119 : <SuperPointStar>null,
        node_120 : <SuperPointStar>null,
        node_121 : <SuperPointStar>null,
        node_122 : <SuperPointStar>null,
        node_123 : <SuperPointStar>null,
        node_124 : <SuperPointStar>null,
        node_125 : <SuperPointStar>null,
        node_126 : <SuperPointStar>null,
        node_127 : <SuperPointStar>null,
        node_128 : <SuperPointStar>null,
        node_129 : <SuperPointStar>null,
        node_130 : <SuperPointStar>null,
        node_131 : <SuperPointStar>null,
        node_132 : <SuperPointStar>null,
        node_133 : <SuperPointStar>null,
        node_134 : <SuperPointStar>null,
        node_135 : <SuperPointStar>null,
        node_136 : <SuperPointStar>null,
        node_137 : <SuperPointStar>null,
        node_138 : <SuperPointStar>null,
        node_139 : <SuperPointStar>null,
        node_140 : <SuperPointStar>null,
        node_141 : <SuperPointStar>null,
        node_142 : <SuperPointStar>null,
        node_143 : <SuperPointStar>null,
        node_144 : <SuperPointStar>null,
        node_145 : <SuperPointStar>null,
        node_146 : <SuperPointStar>null,
        node_147 : <SuperPointStar>null,
        node_148 : <SuperPointStar>null,
        node_149 : <SuperPointStar>null,
        node_150 : <SuperPointStar>null,
        node_151 : <SuperPointStar>null,
        node_152 : <SuperPointStar>null,
        node_153 : <SuperPointStar>null,
        node_154 : <SuperPointStar>null,
        node_155 : <SuperPointStar>null,
        node_156 : <SuperPointStar>null,
        node_157 : <SuperPointStar>null,
        node_158 : <SuperPointStar>null,
        node_159 : <SuperPointStar>null,
        node_160 : <SuperPointStar>null,
        node_161 : <SuperPointStar>null,
        node_162 : <SuperPointStar>null,
        node_163 : <SuperPointStar>null,
        node_164 : <SuperPointStar>null,
        node_165 : <SuperPointStar>null,
    }
    private node_offset = {x:50,y:50}

    private selected = 0
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        // line 注册
        this.InitLine(SuperStarMapLineCfg)
        this.InitNode()

        this.viewNode.loader.SetIcon("loader/star_map/ChaoXingXiBeiJing",() => {})
        
    }
    public InitLine(data:any){
        for(let i = 0;i<data.length;i++)
        {
            let pos_1_mark = (data[i][0])
            let pos_2_mark = (data[i][1])

            let point1 = {
                x:this.viewNode["node_"+pos_1_mark].x + this.node_offset.x,
                y:this.viewNode["node_"+pos_1_mark].y + this.node_offset.y,
                pos:pos_1_mark
            }
            let point2 = {
                x:this.viewNode["node_"+pos_2_mark].x + this.node_offset.x,
                y:this.viewNode["node_"+pos_2_mark].y + this.node_offset.y,
                pos:pos_2_mark
            }
            this.viewNode.SuperLineMap.AddNewLine(point1,point2)
        } 
    }

    public InitNode(){
        for(let i = 0;i<166;i++){
            this.viewNode["node_"+i].onClick(this.ClickNode.bind(this,i));
        }

        
        this.viewNode["node_"+this.selected].SetSelect(true)

        // GuideCtrl.Inst().AddGuideUi("SuperStarMapNode0",  this.viewNode.node_0);
    }
    public flushInfo(){
        for(let i = 0;i<166;i++){
            this.viewNode["node_"+i].SetData(StarMapData.Inst().GetSuperStarPointInfo(i))
        }


        let line_list = StarMapData.Inst().GetSuperStarLineInfo()
        for(let i = 0;i<line_list.length;i++){
            this.viewNode.SuperLineMap.FlushLine(line_list[i].p1,line_list[i].p2)
        }
    }

    private ClickNode(pos:number) {
        let check_level = this.viewNode["node_"+pos].data.level+1
        if(check_level > 10){
            PublicPopupCtrl.Inst().Center(Language.StarMap.LevelMax);
            return 
        }

        if(!StarMapData.Inst().GetSuperStarPointCanOper(pos)){
            PublicPopupCtrl.Inst().Center(Language.StarMap.LinkError);
            return 
        }

        let param = StarMapData.Inst().GetSuperStarPointUpParam(pos)
        ViewManager.Inst().OpenView(StarMapPointUpView,param)   

        this.viewNode["node_"+this.selected].SetSelect(false)
        this.selected = pos
        this.viewNode["node_"+this.selected].SetSelect(true)
    }

    public ShowNodeLevel(flag:boolean) {
        for(let i = 0;i<166;i++){
            this.viewNode["node_"+i].SetShowLevek(flag)
        }
    }
}

export class SuperPointStar extends fgui.GButton {
    private viewNode = {
        attr_icon:<fgui.GLoader>null,

        bg_nomal:<fgui.GImage>null,
        bg_special:<fgui.GImage>null,

        selected:<fgui.GImage>null,
        LevelShow:<fgui.GLabel>null,
        Eff: <UIEffectShow> null,

        ex_special:<fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data:any){
        if (data == null) {
            return;
        }
        this.data = data;
        this.viewNode.bg_nomal.grayed = data.level == 0
        this.viewNode.bg_special.grayed = data.level == 0

        this.viewNode.bg_nomal.visible = !data.is_special 
        this.viewNode.bg_special.visible = data.is_special 

        UH.SpriteName(this.viewNode.attr_icon, "StarMap",StarMapAttrIcon[data.att_type])
        UH.SetText(this.viewNode.LevelShow, data.level_show);

        let check_level = data.level == 10 ? 10 : data.level+1
        let cfg = StarMapData.Inst().GetStarMapSuperStar(data.index,check_level)

        let flag = StarMapData.Inst().GetSuperStarPointCanOper(data.index) && data.level < 10
        // for(var index in cfg.cost_item) {
        //     let with_num = Item.GetNum(cfg.cost_item[index].item_id)
        //     if(with_num < cfg.cost_item[index].num){
        //         flag = false
        //         break
        //     }
        // }
        
        // if(false || cfg.jihuo_att)
        // {
        //     this.viewNode.ex_special.visible = cfg.jihuo_att[0].type >=6 && cfg.jihuo_att[0].type <=17
        // }
        // else 
        // {
        //     this.viewNode.ex_special.visible = false
        // }
        this.viewNode.ex_special.visible = false
        
        if(flag){
            this.viewNode.Eff.visible = true
            this.viewNode.Eff.PlayEff("4164040")
        }
        else{
            this.viewNode.Eff.visible = false
            this.viewNode.Eff.StopEff("4164040")
        }
    }


    public SetSelect(flag:boolean){this.viewNode.selected.visible = flag}
    public SetShowLevek(flag:boolean){ this.viewNode.LevelShow.visible = flag }
}

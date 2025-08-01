import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { StarMapBgName, StarMapLineCfg } from './StarMapConifg';
import { LineMap, NomalPointStar, StarLineCell } from "./StarMapMainView";
import { EGLoader } from "modules/extends/EGLoader";
import { UH } from "../../helpers/UIHelper";
import { StarMapData } from './StarMapData';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { Language } from 'modules/common/Language';
import { StarMapPointUpView } from './StarMapPointUp';
import { LogError } from 'core/Debugger';
import { TextHelper } from '../../helpers/TextHelper';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisView } from 'modules/CoreCrisis/CoreCrisisView';
import { ExStarMapPointUp } from './ExStarMapPointUp';

export class StarMapShowFix extends fgui.GComponent {
    protected viewNode:{[key:string]:any} = {
        LineMapFix:<StarMapLineMapFix> null,
        loader:<fgui.GLoader> null,
    }    
    private Points:{[key:string]:any} = []
    private show_type:number
    private show_grade:number
    private net_type:number
    private net_grade:number
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.InitPoint()
    }

    private InitPoint() {
        for (let i = 0; i < 10; i++) {
            let NP_Point = <NomalPointStar>fgui.UIPackage.createObject("StarMap", "NP_Star").asCom;
            let child = this.addChild(NP_Point);
            child.onClick(this.ClickNode.bind(this,i))
            this.Points.push(NP_Point)    

            if(i == 0){
                GuideCtrl.Inst().AddGuideUi("StarMapMainType0Grade0Node0", NP_Point);
            }
        }
    }

    onDestroy(){
        GuideCtrl.Inst().ClearGuideUi("StarMapMainType0Grade0Node0");
        GuideCtrl.Inst().ForceStop();
    }

    private FlushPoint() {
        let pos_list = StarMapData.Inst().GetPointPosFromStarMap(this.show_type,this.show_grade)
        let pointData = StarMapData.Inst().GetStarMapNetInfo(this.net_type,this.net_grade)
        for(var index in pos_list){
            if(this.Points[pos_list[index].pos]!= null){
                this.Points[pos_list[index].pos].setPosition(pos_list[index].x,pos_list[index].y)
                if(pointData[pos_list[index].pos]!= null){
                    this.Points[pos_list[index].pos].SetData(pointData[pos_list[index].pos])
                }
            }
        }
    }
    private ChangeLine() {
        // 位点位置改变
        for(var index in this.Points){
            this.Points[index].SetSelect(false)
        }
        this.viewNode.LineMapFix.ChangeLineGroup(this.show_type,this.show_grade)
        this.FlushLine()
    }

    private FlushLine() {
        this.viewNode.LineMapFix.FlushLine(this.net_type,this.net_grade)
    }

    // 变换星图
    public TryShowMap(Tag1:number,Tag2:number){        
        if(this.show_type == Tag1 && this.show_grade == Tag2){
            this.flushInfo()
            return 
        }

        this.show_type = Tag1
        this.show_grade = Tag2

        this.net_type = Tag1 -1
        this.net_grade = Tag2 -1

        // 刷底图
        this.viewNode.loader.SetIcon("loader/star_map/"+StarMapBgName[Tag1+"_"+Tag2],
        () => {})
        // 刷点位(注入)
        this.FlushPoint()
        // 布线（注入）
        this.ChangeLine()
    }

    // 刷新星图（本动作消耗较低
    public flushInfo()
    {
        this.FlushPoint()
        this.FlushLine()
    }

    private ClickNode(pos:number) {
        
        for(var index in this.Points){
            this.Points[index].SetSelect(false)
        }
        let check_level = this.Points[pos].data.level+1
        if(check_level > 10){
            PublicPopupCtrl.Inst().Center(Language.StarMap.LevelMax);
            return 
        }

        if(!StarMapData.Inst().GetStarMapPointCanOper(this.net_type,this.net_grade,pos)){
            PublicPopupCtrl.Inst().Center( pos == 0 ? TextHelper.Format(Language.StarMap.PointUpLevelError,this.Points[pos].data.level):
            TextHelper.Format(Language.StarMap.LinkLevelError,check_level));
            return 
        }

        if(CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level))
        {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips,Language.CoreCrisis.CoreName[CoreCrisisType.StarMap]))
            ViewManager.Inst().OpenView(CoreCrisisView,{mark_type:CoreCrisisType.StarMap})
            return 
        }

        AudioManager.Inst().Play(AudioTag.TongYongClick)
        let param = StarMapData.Inst().GetStarMapPointUpParam(this.net_type,this.net_grade,pos,this.Points[pos].data.level)
        ViewManager.Inst().OpenView(ExStarMapPointUp,param)   
        this.Points[pos].SetSelect(true)
    }
}


export class StarMapLineMapFix extends fgui.GComponent {
    private viewNode:{[key:string]:any} = {}
    private Lines:{[key:string]:any} = []
    private LinesData:{[key:string]:any} = []
    private node_offset = {x:34,y:35}

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    // 悖论：不获取整体的信息就没办法进行整体的处理
    // 直接获取所有的点线信息，并进行位置刷新
    public ChangeLineGroup(type:number,grade:number) {
        let lines = StarMapLineCfg["map"+type+"_"+grade]
        let poses = StarMapData.Inst().GetPointPosFromStarMap(type,grade)
        
        for(var check in this.Lines){
            this.Lines[check].visible  = false
        }

        for(var k_l in lines){
            let pos_1_mark = (lines[k_l][0])
            let pos_2_mark = (lines[k_l][1])

            let point1 = {
                x:poses[pos_1_mark].x + this.node_offset.x,
                y:poses[pos_1_mark].y + this.node_offset.y,
                pos:pos_1_mark
            }

            let point2 = {
                x:poses[pos_2_mark].x + this.node_offset.x,
                y:poses[pos_2_mark].y + this.node_offset.y,
                pos:pos_2_mark
            }

            if(this.Lines[k_l] == null)
            {
                let lineItem = <StarLineCell>fgui.UIPackage.createObject("StarMap", "line").asCom;
                let child = this.addChild(lineItem);
                child.setPosition( point1.x ,point1.y );
                child.width = Math.sqrt((point1.y - point2.y)*(point1.y - point2.y) + (point1.x - point2.x)*(point1.x - point2.x))
                let corn = Math.atan((point1.y-point2.y)/(point1.x-point2.x))*(180/Math.PI) 
                
                // LogError("?S",k_l)
                lineItem.RotLine(((point1.x-point2.x)<0) ? corn : corn + 180)

                this.Lines[k_l] = lineItem
                this.LinesData[k_l] = point1.pos+"|"+point2.pos
            }
            else 
            {
                this.Lines[k_l].visible = true
                this.Lines[k_l].setPosition( point1.x ,point1.y );
                this.Lines[k_l].width = Math.sqrt((point1.y - point2.y)*(point1.y - point2.y) + (point1.x - point2.x)*(point1.x - point2.x))
                let corn = Math.atan((point1.y-point2.y)/(point1.x-point2.x))*(180/Math.PI) 
                // this.Lines[k_l].rotation = ((point1.x-point2.x)<0) ? corn : corn + 180

                this.Lines[k_l].RotLine(((point1.x-point2.x)<0) ? corn : corn + 180)

                this.LinesData[k_l] = point1.pos+"|"+point2.pos
            }

        }
    }

    // 线段位置与线段点亮与否相互独立
    public FlushLine(type:number,grade:number){
        
        let line_list = StarMapData.Inst().GetStarMapLineInfo(type,grade)
        for(var ll in line_list){
            let line_mark = line_list[ll].p1.pos + "|" + line_list[ll].p2.pos
            for(var ld in this.LinesData){
                if(this.LinesData[ld] == line_mark){
                    this.Lines[ld].ShowReady(line_list[ll].p1.is_act || line_list[ll].p2.is_act)
                    this.Lines[ld].ShowActed(line_list[ll].p1.is_act && line_list[ll].p2.is_act)
                }
            }
        }
    }
}

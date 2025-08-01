import { LogError } from 'core/Debugger';
import { setDisplayStats, _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { SuperLineMap, SuperPointStar } from './SuperStarMapView';
import { ViewManager } from 'manager/ViewManager';
import { SuperStarMapLineCfg, SuperStarMapPointPos } from './StarMapConifg';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { StarMapData } from './StarMapData';
import { NomalPointStar } from './StarMapMainView';
import { GuideCtrl } from 'modules/guide/GuideCtrl';
import { Language } from 'modules/common/Language';
import { StarMapPointUpView } from './StarMapPointUp';
import { TextHelper } from '../../helpers/TextHelper';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { CoreCrisisView } from 'modules/CoreCrisis/CoreCrisisView';
import { ExStarMapPointUp } from './ExStarMapPointUp';

export class SuperStarMapFix extends fgui.GComponent {
    private viewNode:{[key:string]:any} = {
        SuperLineMap:<SuperLineMap>null,
        loader : <fgui.GLoader>null,
    }   
    private node_offset = {x:50,y:50}
    private selected = 0

    private Nodes:{[key:string]:any} = []
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        // line 注册
        this.InitNode()
        this.InitLine(SuperStarMapLineCfg)

        this.viewNode.loader.SetIcon("loader/star_map/ChaoXingXiBeiJing",() => {})
    }

    public InitLine(data:any){
        for(let i = 0;i<data.length;i++)
        {
            let pos_1_mark = (data[i][0])
            let pos_2_mark = (data[i][1])

            let pos_1_cfg =  StarMapData.Inst().GetStarMapSuperStar(pos_1_mark,1)
            let pos_2_cfg =  StarMapData.Inst().GetStarMapSuperStar(pos_2_mark,1)
            //LogError("?d ",pos_1_mark,pos_1_cfg)

            let point1 = {
                x:this.Nodes[pos_1_mark].x + (pos_1_cfg.icon_size > 1 ? this.node_offset.x * pos_1_cfg.icon_size : this.node_offset.x),
                y:this.Nodes[pos_1_mark].y + (pos_1_cfg.icon_size > 1 ? this.node_offset.y * pos_1_cfg.icon_size : this.node_offset.y),
                pos:pos_1_mark
            }
            let point2 = {
                x:this.Nodes[pos_2_mark].x + (pos_2_cfg.icon_size > 1 ? this.node_offset.x * pos_2_cfg.icon_size : this.node_offset.x),
                y:this.Nodes[pos_2_mark].y + (pos_2_cfg.icon_size > 1 ? this.node_offset.y * pos_2_cfg.icon_size : this.node_offset.y),
                pos:pos_2_mark
            }
            this.viewNode.SuperLineMap.AddNewLine(point1,point2)
        } 
    }

    public InitNode(){
        let poses = SuperStarMapPointPos
        for(var key in poses){
            let S_Point = <SuperPointStar>fgui.UIPackage.createObject("StarMapSuper", "N_Star").asCom;
            let child = this.addChild(S_Point);
            let cfg = StarMapData.Inst().GetStarMapSuperStar(poses[key].pos,1)
            child.onClick(this.ClickNode.bind(this,Number(key)))
            if(cfg.icon_size > 1)
            {
                let offset_x =  this.node_offset.x  * (cfg.icon_size - 1)
                let offset_y =  this.node_offset.y  * (cfg.icon_size - 1)
                S_Point.setPosition(poses[key].x-offset_x ,poses[key].y-offset_y)
            }
            else 
            {
                S_Point.setPosition(poses[key].x,poses[key].y)
            }
            S_Point.scaleX = cfg.icon_size
            S_Point.scaleY = cfg.icon_size
            this.Nodes.push(S_Point)    
            

            if(Number(key) == 0){
                GuideCtrl.Inst().AddGuideUi("SuperStarMapNode0", S_Point);
            }
        }
    }
    onDestroy(){
        GuideCtrl.Inst().ClearGuideUi("SuperStarMapNode0");        
        GuideCtrl.Inst().ForceStop();
    }
    public flushInfo(){
        for(var key in this.Nodes){
            this.Nodes[key].SetData(StarMapData.Inst().GetSuperStarPointInfo(Number(key)))
        }

        let line_list = StarMapData.Inst().GetSuperStarLineInfo()
        for(let i = 0;i<line_list.length;i++){
            this.viewNode.SuperLineMap.FlushLine(line_list[i].p1,line_list[i].p2)
        }
    }

    private ClickNode(pos:number) {
        let check_level = this.Nodes[pos].data.level+1
        if(check_level > 10){
            PublicPopupCtrl.Inst().Center(Language.StarMap.LevelMax);
            return 
        }

        if(CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level))
        {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips,Language.CoreCrisis.CoreName[CoreCrisisType.StarMap]))
            ViewManager.Inst().OpenView(CoreCrisisView,{mark_type:CoreCrisisType.StarMap})
            return 
        }

        // if(!StarMapData.Inst().GetSuperStarPointCanOper(pos)){
        //     PublicPopupCtrl.Inst().Center(TextHelper.Format(
        //         Language.StarMap.LinkLevelError,check_level));
        //     return 
        // }

        AudioManager.Inst().Play(AudioTag.TongYongClick)
        let param = StarMapData.Inst().GetSuperStarPointUpParam(pos)
        ViewManager.Inst().OpenView(ExStarMapPointUp,param)   

        this.Nodes[this.selected].SetSelect(false)
        this.selected = pos
        this.Nodes[this.selected].SetSelect(true)
    }

    public ShowNodeLevel(flag:boolean) {
        for(var key in this.Nodes){
            this.Nodes[key].SetShowLevek(flag)
        }
    }
}
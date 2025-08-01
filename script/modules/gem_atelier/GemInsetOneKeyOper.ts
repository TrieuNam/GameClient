import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { UH } from "../../helpers/UIHelper";
import { GemIconCfg } from "./GemAtelierConfig";
import { GemAtelierData } from "./GemAtelierData";

export class GemInsetOneKeyOper extends fgui.GComponent {
    private show_timer: any
    private time_pass = 0
    private time_step = 1
    private time_going = 0
    private time_checker = 5
    private total_time = 0
    private play_param:any
    private start_y = 792
    private startEff_wait = 30
    private EndEff_wait = 100
    private show_pos = {x:-12,y:-42 }
    private viewNode:{[key:string]:any} = {
        pic_1: <fgui.GLoader>null,
        pic_2: <fgui.GLoader>null,
        pic_3: <fgui.GLoader>null,
        pic_4: <fgui.GLoader>null,
        pic_5: <fgui.GLoader>null,
        pic_6: <fgui.GLoader>null,
        DownEff: <UIEffectShow>null,
        CenterEff: <UIEffectShow>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }

    onDestroy() {
        super.onDestroy();
    }

    PlayEff(draw_id:number,level:number)
    {
        this.viewNode.DownEff.PlayEff(4164132,this.StartFly.bind(this,draw_id,level));
        
    }

    StartFly(draw_id:number,level:number)
    {
        this.play_param = GemAtelierData.Inst().GetOneKeyOperDetail(draw_id,level)
        this.total_time = this.play_param.jump_group.length*this.time_checker + this.EndEff_wait + this.startEff_wait
        this.time_going = 0
        this.time_pass = -1 // 数组是从0开始
        this.show_timer = Timer.Inst().AddRunFrameTimer(
            this.updateTime.bind(this),
            this.time_step,this.total_time);
    }

    updateTime()
    {
        let checker = this.time_going - this.startEff_wait
        let play_part = Math.floor(checker / this.time_checker)
        let param = this.play_param.jump_group[play_part]

        if(param && this.time_pass < play_part && checker > 0)
        {
            let end_pos = {
                x:param.pos_x + this.show_pos.x,
                y:param.pos_y + this.show_pos.y
            }
            this.time_pass = play_part
            if(play_part+1 == this.play_param.jump_group.length)
            {
                this.FlyPic(param.item_id,play_part+1,end_pos.x,this.start_y,end_pos.y
                    ,this.completeCallBack.bind(this))
            }
            else 
            {
                this.FlyPic(param.item_id,play_part+1,end_pos.x,this.start_y,end_pos.y)
            }
            
        }

        this.time_going = this.time_going + 1

        if(this.time_going == this.total_time){
            this.EndEff()
        }

        // if(this.time_going == this.total_time - this.EndEff_wait ){
        //     this.completeCallBack()
        // }
    }

    completeCallBack()
    {
        this.viewNode.CenterEff.PlayEff(4164133);
        // for(let i = 1;i< 7;i++){
        //     this.viewNode["pic_"+i].visible = false
        // }
    }

    EndEff()
    {
        GemAtelierData.Inst().ChangeLock(false)
        GemAtelierData.Inst().UnShiftPicUp()
    }

    FlyPic(item_id:number,index:number,x:number,start_y:number,end_y:number,nextCall:Function = null)
    {
        let oper = this.viewNode["pic_"+index]
        oper.visible = true

        let item_cfg = Item.GetConfig(item_id)
        let gem_str = GemIconCfg["id_"+item_cfg.param]
        UH.SpriteName(oper, "GemAtelierInset", gem_str)
        oper.x = x

        // 距离 / （基础速度+距离补正）
        let time = (start_y - end_y)/( 400 + (start_y - end_y)/100 * 120 )
        // LogError("?check ",end_y ,start_y,time)
        fgui.GTween.to(start_y, end_y, time)
                .setEase(fgui.EaseType.Linear)
                .onUpdate((tweener: fgui.GTweener) => {
                    oper.y = tweener.value.x
                }).onComplete(() => {
                    if(nextCall!=null)
                    {
                        nextCall()
                    }
                })
    }

    
}
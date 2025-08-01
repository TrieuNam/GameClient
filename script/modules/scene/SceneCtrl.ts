//  import { Singleton } from "core/Singleton";

import { error, Vec2 } from "cc";
import { Debugger } from "core/Debugger";
import { BaseCtrl } from "modules/common/BaseCtrl"
import { SceneRoleVo } from "modules/scene_obj/SceneObjVo";
import { MapDisplayer } from "./MapDisplayer";
import { SceneData } from "./SceneData";
import { SceneObjHolder } from "./SceneObjHolder";





export class SceneCtrl  extends BaseCtrl {
    
    objHolder : SceneObjHolder;

    vec2Cache :Vec2 = new Vec2();

    constructor(){
        super();
    }

    MsgCfg(){
        return [
            {msgType:PB_SCEnterScene,func : this.onSCEnterScene},
            {msgType:PB_SCVisibleObjEnterRole,func : this.onSCVisibleObjEnterRole},
            {msgType:PB_SCVisibleObjLeave,func:this.onSCVisibleObjLeave},
            {msgType:PB_SCResetPost,func:this.onSCResetPost},
            {msgType:PB_SCObjMove,func:this.onSCObjMove},
        ]
    }

    OnInit(){
        super.OnInit();
        this.objHolder = new SceneObjHolder();
    }

    onDestroy(){
         this.objHolder.Destroy();
         this.objHolder = null;
        super.onDestroy();
    }

    private onSCEnterScene(proto: PB_SCEnterScene){
        //  console.error(`onSCEnterScene=${proto}`);
        let mainRoleVo = SceneData.Inst().MainRoleVo;
        mainRoleVo.objId = proto.objId;
        mainRoleVo.sceneId = proto.sceneid;
        let cp = MapDisplayer.ServerToClientPos(proto.posX,proto.posY);
        mainRoleVo.pos.SetJumpToPos(cp.x,cp.y);
        SceneData.Inst().Base.sceneId = proto.sceneid;
    }

    private onSCVisibleObjEnterRole(proto : PB_SCVisibleObjEnterRole){
        // console.error(`onSCVisibleObjEnterRole=${Debugger.ObjectToString(proto)}`);
        // console.error(`onSCVisibleObjEnterRole=${proto.toJSON()}!!`);
       
        let vo = SceneRoleVo.Create();
        vo.objId = proto.objId;
        vo.sceneId = proto.sceneId;
        vo.roleId = proto.roleId;
        let cp = MapDisplayer.ServerToClientPos(proto.posX,proto.posY);
        vo.pos.SetJumpToPos(cp.x,cp.y);
        vo.drawer.SetProto(proto.appearance);
        SceneData.Inst().AddNetVo(vo);
    }

    private onSCVisibleObjLeave(proto:PB_SCVisibleObjLeave){
        //console.error(`onSCVisibleObjLeave=${Debugger.ObjectToString(proto)}`);
        SceneData.Inst().DeleteNetVo(proto.objId);
    }

    private onSCResetPost(proto:PB_SCResetPost){
		//console.error(`onSCResetPost=${Debugger.ObjectToString(proto)}`);
        if(SceneData.Inst().Base.sceneId != proto.sceneId){
            Debugger.LogError(`onSCResetPost sceneId NMatch,c_sceneId=${SceneData.Inst().Base.sceneId},s_sceneId=${proto.sceneId}`,this);
            return;
        }
        let mainRoleVo = SceneData.Inst().MainRoleVo;
        mainRoleVo.sceneId = proto.sceneId;
        let cp = MapDisplayer.ServerToClientPos(proto.x,proto.y);
        mainRoleVo.pos.SetJumpToPos(cp.x,cp.y);
    }


    private onSCObjMove(proto:PB_SCObjMove){
        //console.error(`onSCObjMove=${Debugger.ObjectToString(proto)}`);
        let vo = SceneData.Inst().GetNetVo(proto.objId);
        if(!vo){
            Debugger.LogError(`onSCObjMove cant find objVo,proto=${proto.objId}`,this)
            return;
        }
        this.vec2Cache.set(proto.posX,proto.posY);
        if(proto.distance !== 0){
            this.vec2Cache.x += Math.cos(proto.dir) * proto.distance;
            this.vec2Cache.y += Math.sin(proto.dir) * proto.distance;
        }

        MapDisplayer.ServerToClientPos(this.vec2Cache.x,this.vec2Cache.y,this.vec2Cache);
        vo.pos.SetMoveToPos(this.vec2Cache.x,this.vec2Cache.y);
    }
    

    public MainRoleMoveReq(toX:number,toY:number){
        let proto = PB_CSObjMove.create();
        let mrVo = SceneData.Inst().MainRoleVo;
        this.vec2Cache.set(mrVo.pos.Pos);
        MapDisplayer.ClientToServerPos(this.vec2Cache.x,this.vec2Cache.y,this.vec2Cache);
        proto.posX = this.vec2Cache.x;
        proto.posY = this.vec2Cache.y;
        MapDisplayer.ClientToServerPos(toX,toY,this.vec2Cache);
        proto.targetPosX = this.vec2Cache.x;
        proto.targetPosY = this.vec2Cache.y;
        proto.curSceneId = mrVo.sceneId;
        //console.error(`MainRoleMoveReq=${Debugger.ObjectToString(proto)}|${SceneData.Inst().MainRoleVo.objId}`);
        this.SendToServer(proto);
    }

    public OnEnterBattle(){
        this.objHolder.Visible = false;
    }

    public OnQuitBattle(){
        this.objHolder.Visible = true;
    }

}

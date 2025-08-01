// import { math, Node, Vec2, Vec3 } from "cc";
// import { NodePools } from "core/NodePools";
// import { HandleCollector } from "core/HandleCollector";
// import { Looper } from "manager/Looper";
// import { SceneManager } from "modules/scene/SceneManager";
// import { MainBodyOnlyDrawer } from "./MainBodyOnlyDrawer";
// import { SceneObjRootCom } from "./SceneObjRootCom";
// import { SceneObjDrawerData, SceneObjLoopState, SceneObjVo, SceneObjVoBase, SceneRoleDrawerData } from "./SceneObjVo";
// import {  SceneRoleDrawer } from "./SceneRoleDrawer";
// import { LooperHandle, SMDHandle } from "data/HandleCollectorCfg";
// import { DEBUG } from "cc/env";

// let rootPath = "actors/common/root_node"

// let handleKeys ={
//     MoveTo : "MoveTo"
// }

// const rotateStep = 500;//每秒转多少度
// const rotateStartVec = new Vec2(0,-1);


// function vecToAngleY(vec:Vec2){
//     let ang = rotateStartVec.signAngle(vec);
//     let eulerY = 180/Math.PI*ang;
//     if(eulerY < 0){
//         eulerY += 360;
//     }
//     return eulerY;
// }

// export class SceneObj {
//     static Create(data:SceneObjVoBase){
//         // return new SceneObj(data);
//     }

//     static Destroy(obj :SceneObj){
//         obj.onDestroy();
//     }

//     private drawer : SceneRoleDrawer | MainBodyOnlyDrawer;
//     private vo : SceneObjVoBase
//     private root :Node;
//     private rootCom : SceneObjRootCom;
//     private handles :HandleCollector;

//     private moveTargetPos = new Vec2();

//     private targetRot : number = 0;
    

    
//     private constructor(data:SceneObjVoBase){
//         this.root = NodePools.Inst().GetSync(rootPath,SceneManager.Inst().SceneObjRoot);
//         this.handles = HandleCollector.Create();
//         this.vo = data;
//         if(DEBUG){
//             this.root.name = `${data.objId}_${data.sceneId}`;
//             this.flushInspectorName();
//             this.handles.Add(SMDHandle.Create(this.vo,this.flushInspectorName.bind(this),"sceneId","objId"));
//         }
//         this.rootCom = this.root.getComponent(SceneObjRootCom);
//         this.rootCom.SetOffRot(SceneManager.ROT_X_OFF);
//         // this.rootCom.RotNode.eulerAngles = new Vec3(0,45,0);

//         this.vo.pos.SetPosFunc(()=>{
//             return this.rootCom.Pos;
//         })
//         // console.error(`rootpos=${this.rootCom.node.position}|${this.rootCom.node.parent}|${this.rootCom.node.worldPosition}`);
//         this.createDrawer();

//         this.init();
//         this.initListeners();

//     }

//     private flushInspectorName(){
//         this.root.name = `${this.vo.objId}_${this.vo.sceneId}`;
//     }

//     private createDrawer(){
//         if(this.vo.drawer instanceof SceneRoleDrawerData){
//             this.drawer = SceneRoleDrawer.Create(this.vo.drawer,this.rootCom.AttachNode);
//         }
//         else if (this.vo.drawer instanceof SceneObjDrawerData){
//             this.drawer = MainBodyOnlyDrawer.Create(this.vo.drawer,this.rootCom.AttachNode);
//         }
//     }



//     private initListeners(){
//         this.handles.Add(SMDHandle.Create(this.vo.pos,this.onJumpPosChange.bind(this),"jumpToPos"));
//         this.handles.Add(SMDHandle.Create(this.vo.pos,this.onMoveToPosChange.bind(this),"moveToPos"));
//     }
    


//     private onJumpPosChange(){
//         let jp = this.vo.pos.jumpToPos;
//         this.rootCom.SetPos(jp.x,jp.y);

//         this.rootCom.PosNode.position.set(jp.x,jp.y,0);
//         this.stopMove();
//     }

//     private onMoveToPosChange(){
//         this.moveTargetPos.set(this.vo.pos.moveToPos.x,this.vo.pos.moveToPos.y);
//         this.vo.drawer.anim.loopState = SceneObjLoopState.Run;
//         this.handles.KeyAdd(handleKeys.MoveTo,LooperHandle.Create(this.onMoveLoop.bind(this)));
//     }

//     private onMoveLoop(){
//         let moveVec =  new Vec2(this.moveTargetPos.x - this.rootCom.Pos.x,this.moveTargetPos.y - this.rootCom.Pos.y);
//         moveVec.normalize();
//         //旋转
//         this.targetRot = vecToAngleY(moveVec);
//         let nowRot = this.rootCom.Rot;
//         if(Math.abs(this.targetRot - nowRot)>10){
//             let stepAngle = rotateStep * Looper.Inst().DeltaTime;
//             let rotDiff = this.targetRot - nowRot;
//             if(rotDiff > 180 || rotDiff <-180){
//                 rotDiff += -360 * Math.sign(rotDiff);
//             }
//             if(Math.abs(rotDiff) <= stepAngle){
//                 this.rootCom.SetRot(this.targetRot);
//             }
//             else{
//                 this.rootCom.SetRot(Math.sign(rotDiff) * stepAngle + nowRot);
//             }
//         }

//         //位移
//         let moveSpeed = this.vo.moveSpeed;
//         let remnantDis = Vec2.distance(this.rootCom.Pos,this.moveTargetPos);
//         moveVec.set(moveVec.x * moveSpeed* Looper.Inst().DeltaTime,moveVec.y * moveSpeed* Looper.Inst().DeltaTime);
//         if(remnantDis <= moveVec.length()){
//             this.rootCom.SetPos(this.moveTargetPos.x,this.moveTargetPos.y);
//             this.stopMove();
//             return;
//         }
//         this.rootCom.SetPos(this.rootCom.Pos.x + moveVec.x,this.rootCom.Pos.y + moveVec.y);
//     }


//     private stopMove(){
//         this.vo.drawer.anim.loopState = SceneObjLoopState.Idle;
//         this.handles.KeyRemove(handleKeys.MoveTo);
//     }
//     private init(){
//         this.onJumpPosChange();
//         // let jp = this.vo.pos.jumpToPos;
//         // this.rootCom.PosNode.position.set(jp.x,jp.y,0);
//     }

//     private onDestroy(){
//         HandleCollector.Destory(this.handles);
//         this.handles = null;
//         this.drawer.Destroy();
//         this.drawer = null;
//         // this.vo.pos.SetPosFunc(null);
//         this.rootCom = null;
//         NodePools.Inst().Put(this.root);
//         this.root = null;
//     }

//     public get Vo(){
//         return this.vo;
//     }
// }
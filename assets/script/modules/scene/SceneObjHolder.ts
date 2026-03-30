// import { HandleCollector } from "core/HandleCollector";
// import { LooperHandle, SMDHandle } from "data/HandleCollectorCfg";
// import { SceneObj } from "modules/scene_obj/SceneObj";
// import { SceneObjVoBase } from "modules/scene_obj/SceneObjVo";
// import { SceneData } from "./SceneData";
// import { SceneManager } from "./SceneManager";

// let objStepCreateCount = 1; //一帧创建几个角色

// let handleKeys ={
//     AsyncCreat : "asyncCreate",
// }
// export class SceneObjHolder{
//     private mainRole :SceneObj = null;

//     private netObjs = new Map<number,SceneObj>();

//     private handles : HandleCollector;

//     private needDelObjIds = new Set<number>();
//     private needAddObjVos = new Set<SceneObjVoBase>();

//     constructor(){
//         this.mainRole = SceneObj.Create(SceneData.Inst().MainRoleVo);
//         this.handles = HandleCollector.Create();
//         this.handles.Add(SMDHandle.Create(SceneData.Inst().NetVos,this.onNetVoChange.bind(this)))
//     }

//     Destroy() : void{
//         HandleCollector.Destory(this.handles);
//         this.handles = null;
//         SceneObj.Destroy(this.mainRole);
//         this.mainRole = null;
//         for(let obj of this.netObjs.values()){
//             SceneObj.Destroy(obj);
//         }
//         this.netObjs.clear();
//     }

//     // Update(){
//     //     this.mainRole.Update();
//     //     for(let obj of this.netObjs){
//     //         obj.Update();
//     //     }
//     // }

//     onNetVoChange(){


//         // console.error(`VOS==${SceneData.Inst().NetVos}`)
//         this.needAddObjVos.clear();
//         let voData = SceneData.Inst().NetVos;
//         for(let vo of voData.values()){
//             if(!this.netObjs.has(vo.objId)){
//                 this.needAddObjVos.add(vo);
//             }
//             else{
//                 let exitedObj = this.netObjs.get(vo.objId);
//                 if(exitedObj.Vo !== vo){        //obj_id的位置被占用，则需要先删除再添加
//                     this.needDelObjIds.add(vo.objId);
//                     this.needAddObjVos.add(vo);
//                 }
//             }
//         }
//         for(let objId of this.netObjs.keys()){
//             if(!voData.has(objId)){
//                 this.needDelObjIds.add(objId);
//             }
//         }

//         for(let delId of this.needDelObjIds){
//             let obj = this.netObjs.get(delId);
//             SceneObj.Destroy(obj);
//             this.netObjs.delete(delId);
//         }
//         this.needDelObjIds.clear();

//         if(this.needAddObjVos.size > 0){
//             this.handles.KeyAdd(handleKeys.AsyncCreat,LooperHandle.Create(this.asyncCreateObj.bind(this)));
//             this.space = 10;
//         }
//         // for(let vo of this.needAddObjVos){
//         //     let obj = SceneObj.Create(vo);
//         //     this.netObjs.set(vo.objId,obj);
//         // }
//         // this.needAddObjVos.clear();
//     }

//  space = 10;
//     asyncCreateObj(){
//         if(this.space < 5){
// ++this.space;
//             return;
//         }
//         this.space = 0;
//         let forCount = this.needAddObjVos.size > objStepCreateCount ? objStepCreateCount : this.needAddObjVos.size;
//         let i = 0;
//         for(let vo of this.needAddObjVos){
//             ++i;
//             let obj = SceneObj.Create(vo);
//             this.netObjs.set(vo.objId,obj);
//             this.needAddObjVos.delete(vo);
//             if(i >= forCount){
//                 break;
//             }
//         }
//         if(this.needAddObjVos.size === 0){
//             // console.error(`ObjCount===${this.netObjs.size}`);10
//             this.handles.KeyRemove(handleKeys.AsyncCreat);
//         }
//     }

//     set Visible(value : boolean){
//         SceneManager.Inst().SceneObjRoot.active = value;
//     }
// }
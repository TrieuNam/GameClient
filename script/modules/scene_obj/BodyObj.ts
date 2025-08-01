// import { instantiate, Prefab, Node, NodePool, TERRAIN_NORTH_INDEX } from "cc";
// import { LogError } from "core/Debugger";
// import { HandleCollector } from "core/HandleCollector";
// import { NodePools } from "core/NodePools";
// import { SMDHandle } from "data/HandleCollectorCfg";
// import { BodyObjCom } from "./BodyObjCom";
// import { BodyAttachPart } from "./SceneObjConst";
// import { SceneObjAnimData } from "./SceneObjVo";

// export class BodyObj {

//     private resPath :string;
//     private parObj : BodyObj = null;
//     private chObjs : Map<BodyObj,BodyAttachPart> = null;
//     protected node : Node = null;
//     protected root : Node = null;
//     private bodyCom: BodyObjCom = null;
//     private animData :SceneObjAnimData = null;
//     protected invalid = false;

    
//     private handle :HandleCollector;

//     public static Create(r:Node,data:SceneObjAnimData) : BodyObj{
//         return new BodyObj(r,data);
//     }
    
//     protected constructor(r:Node,data:SceneObjAnimData){
//         this.handle = HandleCollector.Create();
//         this.root = r;
//         this.animData = data;
//         if(this.node){
//             this.node.setParent(this.root);
//         }
//         this.handle.Add(SMDHandle.Create(this.animData,this.onLoopAnimChange.bind(this),"loopState"));
//     }

//     public SetPath(path:string){
//         if(this.resPath !== path){
//             this.resPath = path;
//             NodePools.Inst().Get(this.resPath,(obj)=>{
//                 if(this.resPath !== path){      //在加载的时候外部请求了其它加载
//                     NodePools.Inst().Put(obj);
//                     return;
//                 }
//                 this.onLoaded(obj);
//             });
//         }
//     }
    
//     protected onLoaded(data: Node){
//         if(this.invalid){
//             NodePools.Inst().Put(this.node);
//             return;
//         }
//         this.node = data;
//         if(this.root){
//             this.node.setParent(this.root);
//         }
//         this.bodyCom = this.node.getComponent(BodyObjCom);
//         if(this.parObj){
//             this.parObj.onChildNodeLoaded(this);
//         }
//         if(this.chObjs != null){
//             this.chObjs.forEach((part,obj)=>{
//                 if(obj.node){
//                     obj.node.setParent(this.bodyCom.GetPartNode(part));
//                 }
//             })
//         }
//     }

//     public Destroy(){
//         HandleCollector.Destory(this.handle);
//         this.handle = null;
//         this.invalid = true;
//         this.Clear();
//         this.root = null;
//     }

//     public Clear(){
//         if(this.chObjs){
//             this.chObjs.forEach((path,obj)=>{
//                 obj.dettachFromParent();
//             })        
//             this.chObjs = null;
//         }
//         this.dettachFromParent();
//         if(this.node){
//             this.node.setParent(null);
//             NodePools.Inst().Put(this.node);
//             this.node = null;
//             this.bodyCom = null;
//         }
//     }

//     public AttachChild(child:BodyObj,part:BodyAttachPart){
//         child.dettachFromParent();
//         child.parObj = this;
//         if(this.node && child.node){
//             child.node.setParent(this.node);
//         }
//         if(this.chObjs == null){
//             this.chObjs = new Map<BodyObj,BodyAttachPart>();
//         }
//         this.chObjs.set(child,part);
//     }

//     private onChildNodeLoaded(child:BodyObj){
//         if(!this.node){
//             return;
//         }
//         let part = this.chObjs.get(child);
//         child.node.setParent(this.bodyCom.GetPartNode(part));
//     }

//     private dettachFromParent(){
//         if(this.parObj){
//             if(this.parObj.chObjs.has(this)){
//                 this.parObj.chObjs.delete(this); 
//                 if(this.node){
//                     this.node.setParent(null);
//                 }
//             }
//             this.parObj = null;
//         }    
//     }

//     private onLoopAnimChange(){
//         if(!this.bodyCom){
//             return;
//         }
//         this.bodyCom.Anim.setValue("state",this.animData.loopState);
//     }
// }
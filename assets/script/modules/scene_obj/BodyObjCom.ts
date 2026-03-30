
// import { _decorator, Component, Node,   ccenum,__private, animation } from 'cc';
// import { ByteBuffer } from 'fairygui-cc';
// import { SerializableMap } from 'utils/SerializableMap';
// import { BodyAttachPart } from './SceneObjConst';
// const { ccclass, property } = _decorator;


// @ccclass('BodyPartMap')
// class BodyPartMap extends SerializableMap<BodyAttachPart,Node>{
//     @property({type:[BodyAttachPart]})
//     set parts(value){
//          this._keys = value;
//     }
//     get parts() : BodyAttachPart[]{
//         return this._keys;
//     }

//     @property({type:[Node]})
//     set nodes(value){
//          this._values = value;
//     }
//     get nodes() : Node[]{
//         return this._values;
//     }
// }


// @ccclass('BodyObjCom')
// export class BodyObjCom extends Component {

//     @property({type:BodyPartMap})
//     private partNodeMap:BodyPartMap = new BodyPartMap();

//     // @property({type:animation.AnimationController})
//     private anim : animation.AnimationController;

//     public GetPartNode(part: BodyAttachPart){
//         return this.partNodeMap.Get(part);
//     }

    
//     public get Anim(){

//         if(!this.anim){
//             this.anim = this.getComponent(animation.AnimationController);
//             if(this.anim == null){
//                 for(let ch of this.node.children){
//                     this.anim = ch.getComponent(animation.AnimationController);
//                     if(this.anim){
//                         break;
//                     }
//                 }
//             }
//         }
//         return this.anim;
//     } 
    
// }


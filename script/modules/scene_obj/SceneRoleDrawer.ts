// import {  Node } from "cc";
// import { ResPath } from "utils/ResPath";
// import { BodyObj } from "./BodyObj";
// import { BodyAttachPart } from "./SceneObjConst";
// import { SceneRoleDrawerData } from "./SceneObjVo";






// export class SceneRoleDrawer{
//     private data : SceneRoleDrawerData;

//     private mainBody:BodyObj;
//     private rideBody:BodyObj;
//     private weaponBody:BodyObj;


//     public static Create(data : SceneRoleDrawerData,root:Node){
//         let re = new SceneRoleDrawer(data,root);
//         return re;
//     }

//     private constructor(data:SceneRoleDrawerData,root:Node)
//     {
//         this.data = data;
//         this.mainBody = BodyObj.Create(root,data.anim);
//         this.rideBody = BodyObj.Create(root,data.anim);
//         this.weaponBody = BodyObj.Create(root,data.anim);
//         this.rideBody.AttachChild(this.mainBody,BodyAttachPart.RideBack);
//         this.mainBody.AttachChild(this.weaponBody,BodyAttachPart.HandR);
//         this.flushMain();
//         this.flushRide();
//         this.flushWeapon();
//     }

//     static readonly tmpRideId = 1001;
//     static readonly tmpSkinId = 3001;
//     static readonly tmpWeaponId = 2001;



//     private flushMain(){
//         let skinId = SceneRoleDrawer.tmpSkinId;
//         this.mainBody.SetPath(ResPath.ActorRole(skinId));
//     }

//     private flushRide(){
//         let rideId = SceneRoleDrawer.tmpRideId;
//         this.rideBody.SetPath(ResPath.Ride(rideId));
//     }

//     private flushWeapon(){
//         let weaponId = SceneRoleDrawer.tmpWeaponId;
//         this.weaponBody.SetPath(ResPath.ActorWeapon(weaponId));
//     }

//     public Destroy(){
//         this.mainBody.Destroy();
//         this.rideBody.Destroy();
//         this.weaponBody.Destroy();
//         this.mainBody = null;
//         this.rideBody = null;
//         this.weaponBody = null;
//     }
// }
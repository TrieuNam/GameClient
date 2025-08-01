// import { Node } from "cc";
// import { BodyObj } from "./BodyObj";
// import { SceneObjDrawerData } from "./SceneObjVo";

// export class MainBodyOnlyDrawer{
//     private body:BodyObj;
//     public static Create(data : SceneObjDrawerData,root:Node){
//         let re = new MainBodyOnlyDrawer(root);
//         re.SetData(data);
//         return re;
//     }

//     constructor(root:Node){
//        this.body = BodyObj.Create(root,null); 
//     }


//     public SetData(data:SceneObjDrawerData){
//         // this.body.SetPath(path);
//     }

//     public Destroy(){
//         this.body.Destroy();
//         this.body = null;
//     }
// }
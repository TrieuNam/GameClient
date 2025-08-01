
// import { _decorator, Node } from 'cc';
// import { HandleCollector } from 'core/HandleCollector';
// import { SingletonCom } from 'core/SingletonCom';
// import { SMDHandle } from 'data/HandleCollectorCfg';
// // import { CameraManager } from 'manager/CameraManager';

// import { MapDisplayer } from 'modules/scene/MapDisplayer';
// import { SceneData } from './SceneData';
// const { ccclass, property } = _decorator;

// /**
//  * Predefined variables
//  * Name = CommonScene
//  * DateTime = Thu Mar 17 2022 11:43:19 GMT+0800 (中国标准时间)
//  * Author = julius911022
//  * FileBasename = CommonScene.ts
//  * FileBasenameNoExtension = CommonScene
//  * URL = db://assets/script/modules/scene/CommonScene.ts
//  * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
//  *
//  */
 

// // class CfgMap{
// //     name:string;
// //     width:number;
// //     height:number;
// //     path:Vec2[];
// // }


// let defaultMap = "SN_1";
// let sceneCfgTmp = {
//     [1] : "SN_1",
//     [2] : "XH_1_gai2",
// }

// // let SceneCfg = {
// //     [100001] : {
// //         map:"SN_1",
// //         mapId:200001,
// //         bornPoint:"born",
// //         hangPoint:["hang1","hang2","hang3"]
// //     }
// // }

// //场景显示层
// @ccclass('SceneManager')
// export class SceneManager extends SingletonCom {
    
//     static readonly ROT_X_OFF = 35;

//     @property({type:MapDisplayer})
//     map : MapDisplayer;

//     @property({type:Node})
//     sceneObjRoot : Node;

//     @property({type:Node})
//     battleObjRoot : Node;
    
//     @property({type:Node})
//     battleScene : Node;

//     handler :HandleCollector;

//     get SceneObjRoot(){
//         return this.sceneObjRoot;
//     }

//     get BattleScene(){
//         return this.battleScene;
//     }

//     start () {
//         this.handler = HandleCollector.Create();
//         this.handler.Add(SMDHandle.Create(SceneData.Inst().Base,this.onSceneIdChanged.bind(this),"sceneId"));

//         // [3]

//         // CameraManager.Inst().FollowMode(()=>{
//         //     return SceneData.Inst().MainRoleVo.pos.Pos;
//         // })
//         // let a = CfgNativeDataA._data;
//         // console.error(`AAA===${a}`);
//         // ResManager.Inst().Load<JsonAsset>("config/map_auto",(err,jsonAss)=>{
            
//         //     let testJJ : {[index:string]:CfgMap;}  = {};
//         //     testJJ = <{[index:string]:CfgMap;}>jsonAss.json;
//         //     // testJJ["SN_1"] = jsonAss.json["SN_1"];

//         //     let data = testJJ["SN_1"];
//         //     console.error(`${data.name}\n${data.width},${data.height},${typeof(data.width)}\n${data.path[0]},${typeof(data.path[0])}`);
//         //     // for (let key in jsonAss.json){
//         //     //     testJJ[key] = jsonAss.json[key];
//         //     // }
            
//         //     // let mapdata :CfgMap[] = json.map;
//         // })
//     }

    
//     OnSceneIdChanged()
//     {
//         // JsonAsset
//         // let sceneId = SceneData.Inst().SceneId;
        
//     }

//     update(){
//         // if (CfgMap.IsReady){
//         //     console.error(CfgMap.Data);
//         // }
//         // if (CfgMap != null){
//         //     console.error(CfgMap["SN_1"]);
//         // }
//         // if(CfgVip != null){

//         //     // console.error(`vip0=${CfgVip.vip[0]},param_0=${CfgVip.vip[0].param_0},type_P0=${typeof(CfgVip.vip[0].param_0)}`);
//         //     console.error(CfgVip.other[0].privilege_extra_reward);
//         // }
//     }

//     onDestroy(){
//         HandleCollector.Destory(this.handler);
//         this.handler = null;
//         super.onDestroy();
//     }
    

//     onSceneIdChanged(){
//         let si = SceneData.Inst().Base.sceneId;
//         let mapName = (<any>sceneCfgTmp)[si];
//         if(!mapName){
//             mapName = defaultMap;
//         }
//         this.map.Display(mapName);
//     }

//     // update (deltaTime: number) {
//     //     // [4]
//     // }
// }
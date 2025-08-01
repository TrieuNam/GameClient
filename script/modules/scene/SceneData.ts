
import { DataBase } from 'data/DataBase';
import { CreateSMD, smartdata } from 'data/SmartData';
import { SMDMap } from 'data/SMDMap';
import { SceneObjVoBase, SceneRoleVo } from 'modules/scene_obj/SceneObjVo';


class BaseSceneData{
    @smartdata
    public sceneId : number;


    // public netVosChanged : boolean;
    
}




export class SceneData extends DataBase {

    Base : BaseSceneData = CreateSMD(BaseSceneData);

    // @smartdata
    //key obj_id,value vo
    NetVos = CreateSMD<SMDMap<number,SceneObjVoBase>>(SMDMap); 

    MainRoleVo : SceneRoleVo = SceneRoleVo.Create();


    AddNetVo(vo:SceneObjVoBase){
        let oldVo = this.NetVos.get(vo.objId);
        this.NetVos.set(vo.objId,vo);
        if(oldVo){
            SceneObjVoBase.Destroy(oldVo);
        }
    }

    DeleteNetVo(objId:number){
        if(!this.NetVos.has(objId)){
            return;
        }
        let vo = this.NetVos.get(objId);
        this.NetVos.delete(objId)
        SceneObjVoBase.Destroy(vo);
    }

    GetNetVo(objId:number){
        return this.NetVos.get(objId);
    }
    

}




import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/starmap_auto";

export function _CreateCfgStarMap(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgStarMapData = <_CfgStarMapData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgRoleStar {
    type:number;
    grade:number;
    star_id:number;
    star_name:string;
    star_level:number;
    cost_item:any;
    up_item:any;
    jihuo_att:any;
}
 
class CfgRoleStarCondition {
    type:number;
    grade:number;
    star_id:number;
    cehua_grade:number;
    cehua_start_id:number;
    map_type:number;
    adjoin:string;
    condition:number;
}

class CfgSuperStar {
    star_id:number;
    star_name:string;
    star_level:number;
    cost_item:any;
    target:string;
    jihuo_att:any;
    icon_size:number;
}

class CfgSuperStarCondition {
    star_id:number;
    condition:number;
    map_type:number;
    adjoin:string;
}

class CfgLevel {
    star_level:number;
    icon:number
}

class CfgOther {
    reset_back:number;
    reset_back_big:number
    reset:any
    reset_big:any
}

export class CfgNewSuperStar{
    star_id:number;
    route:number;
    star_skill_id:number;
    star_txt:number;
    star_skill_icon:number;
    jihuo_att:CfgAttrUp[];
    icon_size:number;
    cost_item:CfgItem[];
    star_name:string;
}

class _CfgStarMapData {
    role_star:CfgRoleStar[];
    role_star_condition:CfgRoleStarCondition[];
    superstar:CfgSuperStar[];
    superstar_condition:CfgSuperStarCondition[];
    level:CfgLevel[];
    other:CfgOther[];
    new_superstar:CfgNewSuperStar[];
}

export let CfgStarMapData: _CfgStarMapData = null;

import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/other_auto";

export function _CreateCfgOther(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgOtherData = < { [item_id: number]: CfgOther } >jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgOtherData);
        func(err == null);
    })
}

export class CfgOther {
   id:number;
   name:number;
   item_type:number;
   is_virtual:number;
   color:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   param:number;
   item_level:number;
   description:number;
   use_msg:number;
   icon_id:number;
   get_way:string;
   show_red:number;
   mod_key:number;
   get_the_source:number;  
   use:string; 
   special_effects:string; 
}

export let CfgOtherData:{[item_id:number]:CfgOther} = null;
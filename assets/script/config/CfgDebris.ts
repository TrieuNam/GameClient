import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/debris_auto";

export function _CreateCfgDebris(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgDebrisData = <{[item_id: number]: CfgDebrisItemData }>jsonAss.json;
        // Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgGemDrawData);
        func(err == null);
    })
} 

export class CfgDebrisItemData {
   id:number;
   name:string;
   item_type:number;
   is_virtual:number;
   color:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   param_0:number;
   param_1:number;
   item_level:number;
   description:string;
   use_msg:string;
   icon_id:number;
   get_way:number;
   show_red:number;
   mod_key:number;
   get_the_source:number;
   use:number;
}


export let CfgDebrisData: { [item_id: number]:CfgDebrisItemData} = null;
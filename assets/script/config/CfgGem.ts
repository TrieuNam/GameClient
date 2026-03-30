import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/gemstone_auto";

export function _CreateCfgGem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGemData = <{[item_id: number]: CfgGemItemData }>jsonAss.json;
        // Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgGemDrawData);
        func(err == null);
    })
} 

export class CfgGemItemData {
   id:number;
   name:string;
   item_type:number;
   up:number;
   ts_gem:number;
   color:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   param:number;
   gem_level:number;
   description:string;
   use_msg:string;
   icon_id:number;
   get_way:number;
   show_red:number;
   mod_key:number;
   get_the_source:number;
   use:number;
   ori_id:number;
}


export let CfgGemData: { [item_id: number]:CfgGemItemData} = null;
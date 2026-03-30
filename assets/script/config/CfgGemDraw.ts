import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/gemstone_drawing_auto";

export function _CreateCfgGemDraw(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGemDrawData = <{[item_id: number]: CfgGemDrawItemData }>jsonAss.json;
        // Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgGemDrawData);
        func(err == null);
    })
} 

export class CfgGemDrawItemData {
   id:number;
   name:string;
   item_type:number;
   color:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   param:number;
   description:string;
   use_msg:string;
   icon_id:number;
   get_way:number;
   show_red:number;
   mod_key:number;
   get_the_source:number;
   use:number;
}


export let CfgGemDrawData: { [item_id: number]:CfgGemDrawItemData} = null;
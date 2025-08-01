import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/inscription_item_auto";

export function _CreateCfgInscriptionItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgInscriptionItemData = <{[item_id: number]: CfgInscriptionItem }>jsonAss.json;
        func(err == null);
    })
} 

export class CfgInscriptionItem {
   id:number;
   name:string;
   item_type:number;
   is_virtual:number;
   color:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   param:number;
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


export let CfgInscriptionItemData: { [item_id: number]:CfgInscriptionItem} = null;
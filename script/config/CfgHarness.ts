import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/harness_item_auto";

export function _CreateCfgHarness(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgHarnessData = <{[item_id: number]: CfgHarnessItemData }>jsonAss.json;
        func(err == null);
    })
} 

export class CfgHarnessItemData {
   id:number;
   name:string;
   harness_type:number;
   att:any;
   harness_own_att_num:number;
   harness_att_num_max:number;
   item_type:number;
   show_type:number;
   color:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   description:string;
   use_msg:string;
   icon_id:number;
   get_way:number;
   show_red:number;
   mod_key:number;
   get_the_source:number;
   use:number;
   special_effects:number;
}


export let CfgHarnessData: { [item_id: number]:CfgHarnessItemData} = null;
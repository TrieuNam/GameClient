import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/wabao_cfg_auto";

export function _CreateCfgWaBao(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgWaBaoData = <{[item_id: number]: CfgWaBaoItemData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgWaBaoData", CfgWaBaoData);
        func(err == null);
    })
} 

export class CfgWaBaoItemData {
   id:number;
   name:string;
   wabao_type:number;
   item_type:number;
   quality:number;
   integrity_min:number;
   integrity_max:number;
   frist_att:number;
   second_att:number;
   sell_item_type:number;
   sfb_price:number;
   icon_id:number;
   sellprice:number;
   pile_limit:number;
   isdroprecord:number;
   invalid_time:number;
   test:string;
}


export let CfgWaBaoData: { [item_id: number]:CfgWaBaoItemData} = null;
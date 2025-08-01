import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/item/equipment_shilian_auto";

export function _CreateCfgEquipShiLian(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgEquipShiLianData = <{ [item_id: number]: _CfgEquipShiLianData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgEquipShiLianData", CfgEquipShiLianData);
        func(err == null);
    })
}

export class _CfgEquipShiLianData {
    id:number;
    name:string;
    item_type:number;
    quality:number;
    icon_id:number;
    sellprice:number;
    pile_limit:number;
    isdroprecord:number;
    invalid_time:number;
    stage_att:CfgAttrUp[];
}


export let CfgEquipShiLianData : { [item_id: number]: _CfgEquipShiLianData } = null;
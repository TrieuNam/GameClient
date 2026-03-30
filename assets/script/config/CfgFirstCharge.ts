import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/shouchong_auto";

export function _CreateCfgFirstCharge(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgFirstCharge = <_CfgFirstCharge>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgFirstCharge", CfgFirstCharge);
        func(err == null);
    })
}

 class CfgFirstChargeData {
    reward_item:CfgItem[];
    item_show:number;
    desc:string;
}


class _CfgFirstCharge {
    other: CfgFirstChargeData[];
}

export let CfgFirstCharge: _CfgFirstCharge = null;
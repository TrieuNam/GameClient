import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/xinfubipin_auto";

export function _CreateCfgXinFuBiPin(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgXinFuBiPinData = <_CfgXinFuBiPinData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgXinFuBiPinData", CfgXinFuBiPinData);
        func(err == null);
    })
}

class CfgXinFuBiPinDataGiftConfigure {
    type: number;
    version: number;
    start_time: number;
    continuou_times: number;
    rank_type: number;
    seq: number;
    reward_type: number;
    parameter_1: number;
    parameter_2: number;
    parameter_3: number;
    reward_item: CfgItem[];
}

class CfgXinFuBiPinDataTimestamp {
    version: number;
    ver_timestamp: number;
}

class _CfgXinFuBiPinData {
    gift_configure: CfgXinFuBiPinDataGiftConfigure[];
    timestamp: CfgXinFuBiPinDataTimestamp[];
}

export let CfgXinFuBiPinData: _CfgXinFuBiPinData = null;
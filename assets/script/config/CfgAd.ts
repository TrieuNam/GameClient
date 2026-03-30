import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/ad_cfg_auto";

export function _CreateCfgAd(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgAdData = <_CfgAdData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgAdData", CfgAdData);
        func(err == null);
    })
}

class CfgAdDataAdType {
    seq: number;
    ad_type: number;
    ad_name: string;
    ad_award: CfgItem[];
    interval: number;
    ad_param: number;
    level: string;
    up_ad: number;
    param: number;
    is_open: number;
}
class CfgAdDataAdOther {
    cd_time: number;
}
class _CfgAdData {
    ad_type: CfgAdDataAdType[];
    other: CfgAdDataAdOther[];
}

export let CfgAdData: _CfgAdData = null;
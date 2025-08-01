import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/richanglibao_auto"; 

export function _CreateCfgDailyGift(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgDailyGift = <_CfgDailyGift>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgDailyGift", CfgDailyGift);
        func(err == null);
    })
}

export class CfgDailyGiftData {
    seq: number;
    start_level: number;
    end_level: number;
    type: number;
    reward_item: CfgItem[];
    limit_type: number;
    limit_convert_count: number;
    price_type: number;
    price: number;
    gift_color: number;
    gift_value:number;
    gift_name:string;
}

export class CfgDailyGiftOtherData {
    is_open:number;
}
class _CfgDailyGift {
    reward: CfgDailyGiftData[];
    other: CfgDailyGiftOtherData[];
}

export let CfgDailyGift: _CfgDailyGift = null;
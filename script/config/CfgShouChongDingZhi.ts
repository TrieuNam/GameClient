import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/shouchongzhuanshu_auto";

export function _CreateCfgShouChongDingZhiData(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShouChongDingZhiData = <_CfgShouChongDingZhiData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgShouChongDingZhiData);
        func(err == null);
    })
}

class CfgBuyConfiguration{
    type: number;
    start_level: number;
    end_level: number;
    price: number;
    value: number;

}
export class CfgGiftConfiguration{
    seq: number;
    start_level: number;
    end_level: number;
    active_times: number;
    reward_item: CfgItem[];
}
class CfgOrther{
    is_open: number;
    res_id: number;
}

class _CfgShouChongDingZhiData {
    gift_configure: CfgGiftConfiguration[];
    buy_configure: CfgBuyConfiguration[];
    other: CfgOrther[];
}



export let CfgShouChongDingZhiData: _CfgShouChongDingZhiData = null;
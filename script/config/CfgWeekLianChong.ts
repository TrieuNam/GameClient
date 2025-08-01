import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/zhoumolianchong_auto";

export function _CreateCfgWeekLianChong(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgWeekLianChongData = <_CfgWeekLianChongData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgWeekLianChongData);
        func(err == null);
    })
}

class CfgWeekLianChongGiftConfigure {
    seq: number;
    start_level: number;
    end_level: number;
    type: number;
    acc_price:number;
    reward1_item: CfgItem[];
    reward2_item: CfgItem[];
    reward3_item: CfgItem[];
    reward4_item: CfgItem[];
}



class _CfgWeekLianChongData {
    gift_configure: CfgWeekLianChongGiftConfigure[];
}

export let CfgWeekLianChongData: _CfgWeekLianChongData = null;
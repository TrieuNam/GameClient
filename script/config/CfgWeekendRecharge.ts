import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/zhoumoleichong_auto";

export function _CreateCfgWeekendRecharge(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgWeekendRechargeData = <_CfgWeekendRechargeData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgWeekendRechargeData);
        func(err == null);
    })
}

class CfgWeekendRechargeGiftConfigure {
    seq: number;
    start_level: number;
    end_level: number;
    diamond: number;
    reward_item: CfgItem[];
}



class _CfgWeekendRechargeData {
    gift_configure: CfgWeekendRechargeGiftConfigure[];
}

export let CfgWeekendRechargeData: _CfgWeekendRechargeData = null;
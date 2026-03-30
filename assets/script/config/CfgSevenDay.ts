import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/qiriqiandao_auto";

export function _CreateCfgSevenDays(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgSevenDaysData = <_CfgSevenDaysData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgSevenDaysReward {
    seq:number;
    login_days:number;
    reward_item:any;
 }

class CfgOther {
    time:number;
    is_open:number
}

class _CfgSevenDaysData {
    reward:CfgSevenDaysReward[];
    other:CfgOther[];
}

export let CfgSevenDaysData: _CfgSevenDaysData = null;

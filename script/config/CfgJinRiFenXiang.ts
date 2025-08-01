import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem, CfgAttrUp } from "./CfgCommon";

const resPath = "config/jinrifenxiang_auto";

export function _CreateCfgJinRiFenXiang(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgJinRiFenXiang = <_CfgJinRiFenXiang>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgReward {
    seq: number;
    start_level: number;
    end_level: number;
    reward_item: any;
}

class CfgOther {
    share_times: number;
    is_open:number;
}

class _CfgJinRiFenXiang {
    reward: CfgReward[];
    other: CfgOther[];
}

export let CfgJinRiFenXiang: _CfgJinRiFenXiang = null;

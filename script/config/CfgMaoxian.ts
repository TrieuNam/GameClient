import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/maoxian_auto";

export function _CreateCfgMaoXian(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgMaoXianData = <_CfgMaoXianData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgMaoXianData);
        func(err == null);
    })
}

export class CfgMaoXianClearance {
    stage: number;
    level: number;
    name: number;
    monster_group: number;
    score: number;
    win: CfgItem[];
    res_id: number;
    now_box: number;
    next_show: number;
    quick_num: number;
    quick_expend: string;
}

class CfgMaoXianJieduanReward {
   stage: number;
   chapter: number;
   clearance_condition: number;
   win: CfgItem[];
}

class CfgMaoXianOther {
    max_time:number;
    start_level:number;
}


class _CfgMaoXianData {
    clearance: CfgMaoXianClearance[];
    jieduan_reward: CfgMaoXianJieduanReward[];
    other: CfgMaoXianOther[];
}

export let CfgMaoXianData: _CfgMaoXianData = null;

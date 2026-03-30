import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/knights_auto";

export function _CreateCfgKnights(func: (suc: boolean) => void) {

    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgKnightsData = <_CfgKnightsData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgKnightsData);
        func(err == null);
    })
}

export class CfgKnightsBook {
    level: number;
    seq: number;
    condition: number;
    param_1: number;
    att_type: number;
    att_num: number;
    dec: string;
}

class CfgKnightsReward {
    level: number;
    jihuo_att: CfgAttrUp[];
    reward: CfgItem[];
    icon_up: number;
}

class _CfgKnightsData {
    knights_book: CfgKnightsBook[];
    knights_reward: CfgKnightsReward[];
}

export let CfgKnightsData: _CfgKnightsData = null;
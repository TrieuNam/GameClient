import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/gumochengjiu_auto";

export function _CreateCfgGuMoChengJiu(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGuMoChengJiuData = <_CfgGuMoChengJiuData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgGuMoChengJiuData);
        func(err == null);
    })
}

class CfgGuMoChengJiuGiftConfigure {
    reward_seq: number;
    phase: number;
    star_num: number;
    reward: CfgItem[];
    higher_reward:CfgItem[];
}

class CfgGuMoChengJiuPhaseConfigure {
    phase: number;
    buy_money: number;
}

class CfgGuMoChengJiuOther {
    phase: number;
}

class CfgGuMoChengJiuItemReward {
    seq: number;
    sort_seq: number;
    item_reward: CfgItem[];
}

class _CfgGuMoChengJiuData {
    gift_configure: CfgGuMoChengJiuGiftConfigure[];
    phase_configure: CfgGuMoChengJiuPhaseConfigure[];
    other: CfgGuMoChengJiuOther[];
    item_reward: CfgGuMoChengJiuItemReward[];
    
}



export let CfgGuMoChengJiuData: _CfgGuMoChengJiuData = null;
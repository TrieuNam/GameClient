import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/mingwenchengjiu_auto";

export function _CreateCfgInscriptionChengJiu(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgInscriptionChengJiuData = <_CfgInscriptionChengJiuData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgInscriptionChengJiuData);
        func(err == null);
    })
}

class CfgInscriptionChengJiuGiftConfigure {
    seq: number;
    phase: number;
    num: number;
    reward: CfgItem[];
    higher_reward:CfgItem[];
}

class CfgInscriptionChengJiuPhaseConfigure {
    phase: number;
    buy_money: number;
}

class CfgInscriptionChengJiuOther {
    phase: number;
}

class CfgInscriptionChengJiuItemReward {
    seq: number;
    sort_seq: number;
    item_reward: CfgItem[];
}

class _CfgInscriptionChengJiuData {
    gift_configure: CfgInscriptionChengJiuGiftConfigure[];
    phase_configure: CfgInscriptionChengJiuPhaseConfigure[];
    other: CfgInscriptionChengJiuOther[];
    item_reward: CfgInscriptionChengJiuItemReward[];
    
}



export let CfgInscriptionChengJiuData: _CfgInscriptionChengJiuData = null;
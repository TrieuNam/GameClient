import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/inscription_tower_auto";

export function _CreateCfgInscriptionTower(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgInscriptionTowerData = <_CfgInscriptionTowerData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgInscriptionTowerData", CfgInscriptionTowerData);
        func(err == null);
    })
}

class CfgInscriptionTowerDataClearance {
    level: number;
    monster_group: number;
    score: number;
    win: CfgItem[];
    res_id: number;
}

class CfgInscriptionTowerDataDayReward {
    level_clear: number;
    reward: CfgItem[];
    reward_chap: CfgItem[];
}

class CfgInscriptionTowerDataTurntable {
    cur_round: number;
    cur_index: number;
    win: CfgItem[];
}

class CfgInscriptionTowerDataRate {
    eight_grid: number;
    rate: number;
    cur_prize: number;
}

class CfgInscriptionTowerDataOther {
    level_clear: number;
    tips: string;
}

class CfgInscriptionTowerDataPrice {
    cost: CfgItem[];
    price1: number;
    price2: number;
}

class CfgInscriptionTowerDataBox {
    type: number
    rate: number
    win: CfgItem[]
    sort: number
}

class _CfgInscriptionTowerData {
    clearance: CfgInscriptionTowerDataClearance[];
    day_reward: CfgInscriptionTowerDataDayReward[];
    turntable: CfgInscriptionTowerDataTurntable[];
    rate: CfgInscriptionTowerDataRate[];
    other: CfgInscriptionTowerDataOther[];
    price: CfgInscriptionTowerDataPrice[];
    box: CfgInscriptionTowerDataBox[];
}

export let CfgInscriptionTowerData: _CfgInscriptionTowerData = null;
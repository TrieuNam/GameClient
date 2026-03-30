import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgGuideStep } from "./CfgGuide";
import { CfgItem } from "./CfgCommon";
import { EscortData } from "modules/escort/EscortData";

const resPath = "config/escort_auto";

export function _CreateCfgEscortData(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgEscortData = <_CfgEscortData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgEscortData", CfgEscortData);
        EscortData.InitGhostTime();
        func(err == null);
    })
}
//要使用属性需提前声明
export class CfgEscortShip {
    ship: number;
    ship_color: number;
    intercept_num: number;
    time: number;
    escort_reward: CfgItem[];
    intercept_reward: CfgItem[];
    help_reward: number;//奖励组
    escort_integral: number;
    intercept_integral: number;
    refresh_item: number
    refresh_num: number
}

export class CfgEscortRank {
    rank_type: number;
    seq: number;
    paihang_1: number;
    paihang_2: number;
    paihang_reward: CfgItem[];
}
export class CfgEscortOther {
    escort_num: number;
    escort_record: number;
    escort_rank: number;
    intercept_rank: number;
    refresh_item: number;
    refresh_num: number;
    refresh_time: number;//拦截记录刷新间隔秒
    intercept_time: number;
    help_time: number;
    open_tiem:number;
    continue_time_min:number;
}

class CfgEscortHarmRank{
    win:CfgItem[];
    show_hart:number;
}

class _CfgEscortData {
    ship: CfgEscortShip[];
    rank: CfgEscortRank[];
    other: CfgEscortOther[];
    harm_rank: CfgEscortHarmRank[];
}

export let CfgEscortData: _CfgEscortData = null;
import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/pingfenjijin_auto";

export function _CreateCfgScoreFund(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgScoreFund = <_CfgScoreFund>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgScoreFund", CfgScoreFund);
        func(err == null);
    })
}

export class CfgScoreFundReward {
    seq: number;
    phase: number;
    score: number;
    ordinary_item: CfgItem;
    senior_item: CfgItem[];
}

export class CfgScoreFundPhase{
    phase:number;
    reward_multiple:number;
    buy_money:number;
    show_level:number;
    seg_name:string;
}

export class CfgScoreFundRewardShow{
    phase:number;
    seq:number;
    sort_seq:number;
    item_reward:CfgItem[];
}

class _CfgScoreFund {
    gift_configure: CfgScoreFundReward[];
    phase_configure: CfgScoreFundPhase[];
    item_reward: CfgScoreFundRewardShow[];
}

export let CfgScoreFund: _CfgScoreFund = null;
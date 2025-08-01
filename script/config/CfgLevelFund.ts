import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/dengjijijin_auto";

export function _CreateCfgLevelFund(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLevelFundData = <_CfgLevelFundData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgLevelFundData);
        func(err == null);
    })
}

class CfgLevelFundGiftConfigure {
    type: number;
    phase: number;
    seq: number;
    level: number;
    ordinary_item: CfgItem[];
    diamond_num:number;
    senior_item:CfgItem[];
    senior_bind_diamond: number;
}

class CfgLevelFundPhaseConfigure {
    phase: number;
    reward_multiple: number;
    buy_money: number;
    show_level: number;
    seg_name:string;
}

class CfgLevelFundRewardShow {
    phase:number;
    seq:number;
    sort_seq:number;
    item_reward:CfgItem[];
}

class CfgLevelFundOther {
    phase:number;
    cfg_ver:number;
    is_open:number;
}

class _CfgLevelFundData {
    gift_configure: CfgLevelFundGiftConfigure[];
    phase_configure: CfgLevelFundPhaseConfigure[];
    item_reward:CfgLevelFundRewardShow[];
    other:CfgLevelFundOther[];
}



export let CfgLevelFundData: _CfgLevelFundData = null;
import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/baoxiangjijin_auto";

export function _CreateCfgBoxFund(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgBoxFundData = <_CfgBoxFundData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgBoxFundData);
        func(err == null);
    })
}

class CfgBoxFundGiftConfigure {
    type: number;
    phase: number;
    seq: number;
    level: number;
    ordinary_item: CfgItem[];
    diamond_num:number;
    senior_item:CfgItem[];
    senior_bind_diamond: number;
}

class CfgBoxFundPhaseConfigure {
    phase: number;
    reward_multiple: number;
    buy_money: number;
    show_level: number;
    seg_name:string;
}

class CfgBoxFundRewardShow {
    phase:number;
    seq:number;
    sort_seq:number;
    item_reward:CfgItem[];
}

class CfgBoxFundOther {
    phase:number;
    multiple_Ordinary_reward:number;
    accumulate_recharge_show:number;
    is_open:number;
}

class _CfgBoxFundData {
    gift_configure: CfgBoxFundGiftConfigure[];
    phase_configure: CfgBoxFundPhaseConfigure[];
    item_reward:CfgBoxFundRewardShow[];
    other:CfgBoxFundOther[];
}

export let CfgBoxFundData: _CfgBoxFundData = null;
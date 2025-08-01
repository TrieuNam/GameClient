import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/fumo_auto";

export function _CreateCfgEnchant(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgEnchantData = <_CfgEnchantData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgEnchantData);
        func(err == null);
    })
}

class CfgEnchantEquip {
    part: number;
    fumo_level: number;
    fumo_exp: number;
    time: number;
    cost1: number;
    num1: number;
    cost2: number;
    num2: number;
    cost3: number;
    num3: number;
    cost4: number;
    num4: number;
    parm: number;
    is_own: number;
    att_type:string;
    dec: string;
    dec2: string;
}

class CfgEnchantFenJie {
    quality: number;
    item1: number;
    num1: number;
    rate1: number;
    item2: number;
    num2: number;
    rate2: number;
    item3: number;
    num3: number;
    rate3: number;
    item4: number;
    num4: number;
    rate4: number;
}

class CfgEnchantChange {
    seq: number;
    target_item: number;
    target_num: number;
    item: number;
    item_num: number;
}

class _CfgEnchantData {
    equip_fumo: CfgEnchantEquip[];
    equip_fenjie: CfgEnchantFenJie[];
    change: CfgEnchantChange[];
    
}



export let CfgEnchantData: _CfgEnchantData = null;
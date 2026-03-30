import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/lingzhu_auto";

export function _CreateCfgLingZhu(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLingZhuData = <_CfgLingZhuData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

export class CfgClearance {
    seq:number;
    front_seq:number;
    stage:number;
    level:number;
    unlock_level:number;
    name:string;
    monster_group:number;
    score:number;
    win:any;
    saodang:any;
    saodang_item_id:number;
    saodang_price_0:number;
    saodang_price_1:number;
    saodang_price_2:number;
    saodang_price_3:number;
    saodang_price_4:number;
 }
 
 class CfgOther {
    saodang_max:number;
 }

class _CfgLingZhuData {
    clearance: CfgClearance[];
    other: CfgOther[];
}

export let CfgLingZhuData: _CfgLingZhuData = null;
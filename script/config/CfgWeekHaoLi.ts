import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/zhoumohaoli_auto";

export function _CreateCfgWeekHaoLi(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgWeekHaoLiData = <_CfgWeekHaoLiData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgWeekHaoLiData);
        func(err == null);
    })
}

class CfgWeekHaoLiGiftConfigure {
    type: number;
    start_level: number;
    end_level: number;
    seq: number;
    reward_item: CfgItem[];
    limit_type:number;
    limit_convert_count:number;
    price_type:number;
    price:number;
    gift_name:string;
    tips:string;
    bg_color:number;
}



class _CfgWeekHaoLiData {
    gift_configure: CfgWeekHaoLiGiftConfigure[];
}

export let CfgWeekHaoLiData: _CfgWeekHaoLiData = null;
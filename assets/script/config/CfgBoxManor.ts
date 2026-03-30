import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/baoxiangzhuangyuan_auto";

export function _CreateCfgBoxManor(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgBoxManorData = <_CfgBoxManorData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgBoxManorData);
        func(err == null);
    })
}

class CfgBoxManorReward {
    type:number;
    start_level:number;
    end_level:number;
    seq:number;
    reward_item:CfgItem[];
    price_type:number;
    limit_type:number;
    buy_times:number;
    buy_money:number;
    original_price:number;
    gift_name:string;
    gift_color:number;
    refresh_every_day:number;
}

class _CfgBoxManorData {
    reward:CfgBoxManorReward[];
}

export let CfgBoxManorData: _CfgBoxManorData = null;
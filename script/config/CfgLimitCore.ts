import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/limit_core_auto";

export function _CreateCfgLimitCore(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLimitCore = <_CfgLimitCore>jsonAss.json;
        func(err == null);
    })
}

class CfgCore {
    limit_tpye:number;
    limit_level:number;
    parm:number;
    need_item_id:number;
    need_core_num:number;
}
 
class CfgCoreBox {
    box_type:number;
    box_item:number;
    box_item_num:number;
    box_rate:number;
}

class Other {
    price1:number;
    price2:number;
    reward_num:number;
    level_open:number;
}

class _CfgLimitCore {
    core:CfgCore[];
    corebox:CfgCoreBox[];
    other:Other[];
}

export let CfgLimitCore: _CfgLimitCore = null;

import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/xinfutehui_auto";

export function _CreateCfgNeoServer(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgNeoServerData = <_CfgNeoServerData>jsonAss.json;
        func(err == null);
    })
}

class CfgNeoServerReward {
    type:number;
    level_min:number;
    level_max:number;
    seq:number;
    reward_item:any;
    limit_type:number;
    buy_times:number;
    price_type:number;
    buy_money:number;
    name_box:string;
 }

class CfgOther {
    time:number;
    is_open:number
}

class _CfgNeoServerData {
    reward:CfgNeoServerReward[];
    other:CfgOther[];
}

export let CfgNeoServerData: _CfgNeoServerData = null;

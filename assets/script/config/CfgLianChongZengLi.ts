import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/lianchongzengli_auto";

export function _CreateCfgLianChongZengLi(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLianChongZengLi = <_CfgLianChongZengLi>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgEscortData", CfgEscortData);
        func(err == null);
    })
}

class CfgLianChongZengLiGiftCfg {
    start_level: number;
    end_level: number;
    seq: number;
    day: number;
    reward2_item: any;
    reward1_item: any;
    inv_friend_num: number;
    price: number;
    mark: number
    task_type: number
}

class CfgLianChongZengLiOther {
    desc:number
}

class _CfgLianChongZengLi {
    gift_configure: CfgLianChongZengLiGiftCfg[];
    other:CfgLianChongZengLiOther[]
}

export let CfgLianChongZengLi: _CfgLianChongZengLi = null;
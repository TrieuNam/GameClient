import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/chaozhixianli_auto";

export function _CreateCfgChaoZhiXianLi(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgChaoZhiXianLi = <_CfgChaoZhiXianLi>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgEscortData", CfgEscortData);
        func(err == null);
    })
}

class CfgChaoZhiXianLiGiftCfg {
    type: number;
    start_level: number;
    end_level: number;
    seq: number;
    active_times: number;
    item_id: number;
    is_bind: number;
    num_down: number;
    num_up: number
}

class CfgChaoZhiXianLiBuyCfg {
    type: number;
    start_level: number;
    end_level: number;
    buy_reward_item: any;
    price: number
}

class CfgChaoZhiXianLiOther {
    buy_times:number
}

class _CfgChaoZhiXianLi {
    gift_configure: CfgChaoZhiXianLiGiftCfg[];
    buy_configure: CfgChaoZhiXianLiBuyCfg[];
    other:CfgChaoZhiXianLiOther[]
}

export let CfgChaoZhiXianLi: _CfgChaoZhiXianLi = null;
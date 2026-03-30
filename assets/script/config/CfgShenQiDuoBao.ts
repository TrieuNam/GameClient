import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/shenqiduobao_auto";

export function _CreateCfgShenQiDuoBao(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShenQiDuoBao = <_CfgShenQiDuoBao>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgEscortData", CfgEscortData);
        func(err == null);
    })
}

class CfgShenQiDuoBaoRewardCfg {
    seq: number;
    start_level: number;
    end_level: number;
    task_type: number;
    parameter: number;
    reward_item: any;
    is_refresh: number;
    describe: number;
}

class CfgShenQiDuoBaoGiftCfg {
    start_level: number;
    end_level: number;
    seq: number;
    reward_item: any;
    limit_type: number;
    limit_convert_count: number;
    price_type: number;
    price: number;
    value: number;
}

class _CfgShenQiDuoBao {
    reward: CfgShenQiDuoBaoRewardCfg[];
    gift_configuration: CfgShenQiDuoBaoGiftCfg[];
}

export let CfgShenQiDuoBao: _CfgShenQiDuoBao = null;
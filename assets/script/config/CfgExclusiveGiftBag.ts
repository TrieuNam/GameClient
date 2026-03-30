import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/zhuanshulibao_auto";

export function _CfgExclusiveGiftBag(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgExclusiveGiftBagData = <_CfgExclusiveGiftBagData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgExclusiveGiftBagData", CfgExclusiveGiftBagData);
        func(err == null);
    })
}

class CfgExclusiveGiftBagDataGiftConfiguration {
    type: number;
    seq: number;
    reward_item: CfgItem[];
    limit_num: number;
    buy_money: number;
    recharge_equal_diamond_num: number;
    value: number;
}

class _CfgExclusiveGiftBagData {
    gift_configuration: CfgExclusiveGiftBagDataGiftConfiguration[];
}

export let CfgExclusiveGiftBagData: _CfgExclusiveGiftBagData = null;
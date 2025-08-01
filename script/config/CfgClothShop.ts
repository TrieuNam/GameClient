import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/cloth_shop_auto";

export function _CfgClothShop(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgClothShopData = <_CfgClothShopData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgClothShopDataData", CfgClothShopData);
        func(err == null);
    })
}

export class CfgClothShopDatashop {
    shop_type: number;
    level: number;
    seq: number;
    group_id: number;
    item_id: number;
    item_num: number;
    buy_item: number;
    buy_item_num: number;
    discount: number;
}

class _CfgClothShopData {
    shop: CfgClothShopDatashop[];
}

export let CfgClothShopData: _CfgClothShopData = null;
import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/shop_shenmi_auto";

export function _CreateCfgShenMi(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShenMiData = <_CfgShenMiData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgShenMiData);
        func(err == null);
    })
}

export class CfgShenMiShop {
    index: number;
    item_id: number;
    item_num: number;
    exchange_item_id: number;
    exchange_item_num: number;
    permanent_buy: number;
    discount:number;
}

class CfgShenMiOther {
    shuaxinjuan_id: number;
    shuaxinjuan_num: number;
    shuaxin_item_num: number;

}
export class _CfgShenMiData {
    shop: CfgShenMiShop[];
    other: CfgShenMiOther[];
}

export let CfgShenMiData: _CfgShenMiData = null;
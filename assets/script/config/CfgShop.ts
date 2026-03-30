import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/shop_cfg_auto";

export function _CreateCfgShop(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShopData = <_CfgShopData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgShopData);
        func(err == null);
    })
}

export class CfgShop {
    index: number;
    seq: number;
    page: number;
    page_1: number;
    item_id: number;
    item_num: number;
    exchange_item_id: number;
    exchange_item_num: number;
    quota_type: number;
    param: number;
    show_level: number;
    level: number;
}

export class CfgShopLabel {
    seq: number;
    name: string;
    shop_type: number;
    mod_key:number;
}

export class CfgShopLabel_1 {
    seq: number;
    name: string;
}

export class CfgShopskip {
    mod_key: number;
    page: string;
    name:string;
}

class _CfgShopData {
    shop: CfgShop[];
    shop_label: CfgShopLabel[];
    shop_label_1: CfgShopLabel_1[];
    skip: CfgShopskip[]
}

export let CfgShopData: _CfgShopData = null;
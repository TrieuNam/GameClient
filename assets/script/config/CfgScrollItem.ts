

import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/scroll_item_auto";

export function _CreateCfgScrollItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgScrollItemData = <{ [item_id: number]: CfgScrollItem }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgScrollItemData", CfgScrollItemData);
        func(err == null);
    })
}

export class CfgScrollItem {
    id: number;
    name: string;
    type: number;
    sell_item_id: number;
    sell_item_num: number
    item_type: number;
    color: number;
    icon_id: number;
    sellprice: number;
    pile_limit: number;
    isdroprecord: number;
    invalid_time: number;
}

export let CfgScrollItemData: { [item_id: number]: CfgScrollItem } = null;
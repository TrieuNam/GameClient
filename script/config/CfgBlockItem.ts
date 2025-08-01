import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";

const resPath = "config/item/block_item_auto";

export function _CreateCfgBlockItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgBlockItemData = <{ [item_id: number]: _CfgBlockItemData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgBlockItemData", CfgBlockItemData);
        func(err == null);
    })
}

export class _CfgBlockItemData {
    id: number;
    name: string;
    item_type: number;
    color: number;
    block_range: string;
    shape: number;
    sellprice: number;
    pile_limit: number;
    isdroprecord: number;
    invalid_time: number;
    description: string;
    icon_id: number;
    get_way: number;
    get_the_source: number;
}


export let CfgBlockItemData: { [item_id: number]: _CfgBlockItemData } = null;
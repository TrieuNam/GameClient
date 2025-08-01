import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/item/model_item_auto";

export function _CreateCfgBlockModelItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgBlockModelItemData = <{ [item_id: number]: _CfgBlockModelItemData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgBlockModelItemData", CfgBlockModelItemData);
        func(err == null);
    })
}

export class _CfgBlockModelItemData {
    id: number;
    name: string;
    item_type: number;
    color: number;
    model: CfgAttrUp[];
    model_after: CfgAttrUp[];
    block_color_min: number;
    sellprice: number;
    pile_limit: number;
    isdroprecord: number;
    invalid_time: number;
    description: string;
    use_msg: number;
    icon_id: number;
    get_way: number;
    show_red: number;
    mod_key: number;
    get_the_source: number;
    use: number;
}


export let CfgBlockModelItemData: { [item_id: number]: _CfgBlockModelItemData } = null;
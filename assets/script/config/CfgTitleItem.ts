import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp, CfgItemGift } from "./CfgCommon";

const resPath = "config/item/title_item_auto";

export function _CreateCfgTitleItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgTitleItemData = < { [item_id: number]: CfgTitleItem } >jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgTitleItemData", CfgTitleItemData);
        func(err == null);
    })
}

export class CfgTitleItem {
    id:number;
    name:string;
    item_type:number;
    quality:number;
    icon_id:number;
    sellprice:number;
    pile_limit:number;
    isdroprecord:number;
    invalid_time:number;
    title_att:CfgAttrUp[];
    show_icon_txt:string;
}

export let CfgTitleItemData:{[item_id:number]:CfgTitleItem} = null;
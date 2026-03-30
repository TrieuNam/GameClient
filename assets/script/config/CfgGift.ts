import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItemGift } from "./CfgCommon";

const resPath = "config/item/gift_auto";

export function _CreateCfgGift(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGiftData = <{ [item_id: number]: CfgGift }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgGiftData);
        func(err == null);
    })
}

export class CfgGift {
    id: number;
    name: number;
    daily_use_time: number;
    item_type: number;
    color: number;
    candiscard: number;
    pile_limit: number;
    isdroprecord: number;
    time_length: number;
    invalid_time: number;
    need_num: number;
    item_num: number;
    rand_num: number;
    gift: CfgItemGift[];
    description: number;
    icon_id: number;
    get_way: number;
    is_congratulations: number;
    special_effects: string;
    show_type: number;
}

export let CfgGiftData: { [item_id: number]: CfgGift } = null;
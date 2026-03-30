import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/shangpinhanghui_auto";

export function _CreateCfgCommodityGuild(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgCommodityGuildData = <_CfgCommodityGuildData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgCommodityGuildData);
        func(err == null);
    })
}

class CfgCommodityGuildGiftConfigure {
    seq: number;
    start_level: number;
    end_level: number;
    type: number;
    reward_item: CfgItem[];
    limit_type:number;
    limit_convert_count: number;
    price_type: number;
    original_price: number;
}

class CfgCommodityGuildGiftDiscount {
    seq: number;
    proportion: number;
    weight: number;
}

class _CfgCommodityGuildData {
    gift_configure: CfgCommodityGuildGiftConfigure[];
    discount: CfgCommodityGuildGiftDiscount[];
}

export let CfgCommodityGuildData: _CfgCommodityGuildData = null;

import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";
import { CfgTerritoryOther } from "./CfgTerritory";

const resPath = "config/lingdilibao_auto";

export function _CreateCfgTerritoryGift(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgTerritoryGift = <_CfgTerritoryGift>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

export class CfgTerritoryGiftCfg {
    seq: number
    start_level: number
    item: CfgItem[]
    limit_convert_count: number
    price_type: number
    price: number
    gift_value: number
    gift_name: string
    desc: string
}

class _CfgTerritoryGift {
    gift_configure: CfgTerritoryGiftCfg[]
}

export let CfgTerritoryGift: _CfgTerritoryGift = null
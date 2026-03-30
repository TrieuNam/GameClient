import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/knight_card_auto";

export function _CreateCfgKnightCard(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgKnightCardData = <_CfgKnightCardData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgKnightCardData", CfgKnightCardData);
        func(err == null);
    })
}

class CfgKnightCardDataKnightCard {
    first_buy_reward_item: CfgItem;
    buy_money: number;
    time: number;
}

class CfgKnightCardDataKnightZheng {
    level_min: number;
    level_max: number;
    seq: number;
    guanggao_item: CfgItem[];
}

class _CfgKnightCardData {
    knight_card: CfgKnightCardDataKnightCard[];
    knight_zheng: CfgKnightCardDataKnightZheng[];
}

export let CfgKnightCardData: _CfgKnightCardData = null;
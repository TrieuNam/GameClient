import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/month_card_auto";

export function _CreateCfgMonthlyCard(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgMonthlyCard = <_CfgMonthlyCard>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgMonthlyCard", CfgMonthlyCard);
        func(err == null);
    })
}

export class CfgMonthlyCardData {
    card_type: number;
    card_days: number;
    first_buy_reward_item: CfgItem;
    buy_reward_item: any;
    day_reward_item: any[];
    buy_money: number;
    mod_key: number;
}

class _CfgMonthlyCard {
    month_card_configuration: CfgMonthlyCardData[];
}

export let CfgMonthlyCard: _CfgMonthlyCard = null;
import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/xingyunliyu_auto";

export function _CreateCfgLuckyGift(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLuckyGift = <_CfgLuckyGift>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgLuckyGift", CfgLuckyGift);
        func(err == null);
    })
}

export class CfgLuckyGiftConfig {
    seq:number;
    start_level:number;
    end_level:number;
    monitor_item_id:number;
    item_num:number;
    cd_time:number;
    reward_item:CfgItem[];
    diamond_num:number;
    price_type:number;
    buy_money:number;
    original_price:number;
    show_style:number;
    desc1: string;
    desc2: string;
    desc3: string;
    icon:string;
    name:string;
}

class CfgLuckyGiftOther {
    duration_time:number;
}

class _CfgLuckyGift {
    gift_configure: CfgLuckyGiftConfig[];
    other: CfgLuckyGiftOther[];
}

export let CfgLuckyGift: _CfgLuckyGift = null;
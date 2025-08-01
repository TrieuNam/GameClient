import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/dongxueduobao_auto";

export function _CreateCfgCaveLoot(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgCaveLootData = <_CfgCaveLootData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgCaveLootData);
        func(err == null);
    })
}

class CfgCaveLootGiftreward {
    type: number;
    start_level: number;
    end_level: number;
    seq:number;
    task_id: number;
    task_type: number;
    describe: string;
    parameter:number;
    reward_item:CfgItem[];
    pretaskid: number;
    is_refresh: number;
}

class CfgCaveLootRecharge {
    type: number;
    start_level: number;
    end_level: number;
    seq:number;
    diamond: number;
    reward_item: CfgItem[];

}

class CfgCaveLootGiftConfig {
    type: number;
    start_level: number;
    end_level: number;
    seq: number;
    reward_item: CfgItem[];
    diamond_num: number;
    limit_type: number;
    limit_convert_count: number;
    price_type: number;
    cfg_or: number;
    price: number;
    discount: number;
}

class CfgCaveLootLuckOther {
    item_id:number;
    first_consume_item_num:number;
    ten_consume_item_num:number;
    can_cumulative_bao_di:number;
    bao_di_times:number;
    bao_di_group:number;
    discount_show:number;
}

class CfgCaveLootFloorReward{
    type: number;
    bao_di_group: number;
    seq: number;
    reward: CfgItem[];
    weight: number;
}

class CfgCaveLootRareItemShow {
    seq:number;
    reward_id:CfgItem[];
}

class CfgCaveLootRareShow {
    start_level:number;
    end_level:number;
    seq:number;
    name_id: number;
    rate:number;
    reward_id:CfgItem[];
}

class _CfgCaveLootData {
    reward: CfgCaveLootGiftreward[];
    recharge: CfgCaveLootRecharge[];
    gift_configuration:CfgCaveLootGiftConfig[];
    luck_draw_configuration:CfgCaveLootLuckOther[];
    floor_reward:CfgCaveLootFloorReward[];
    rare_item_show:CfgCaveLootRareItemShow[];
    rate_show:CfgCaveLootRareShow[];
}

export let CfgCaveLootData: _CfgCaveLootData = null;
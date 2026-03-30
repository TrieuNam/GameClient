import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/jifenzhuanpan_auto";

export function _CfgIntegralTurntable(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgIntegralTurntableData = <_CfgIntegralTurntableData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgIntegralTurntableData", CfgIntegralTurntableData);
        func(err == null);
    })
}

class CfgIntegralTurntableDataLevelConfiguration {
    type: number;
    start_level: number;
    end_level: number;
    reward_group: number;
}

class CfgIntegralTurntableDataLuckDrawReward {
    seq: number;
    reward_group: number;
    bao_di_id: number;
    reward: CfgItem[];
}

class CfgIntegralTurntableDataLuckDrawConfiguration {
    first_consume_score: number;
    ten_consume_score: number;
    can_cumulative_bao_di: number;
    bao_di_times: number;
}

class CfgIntegralTurntableDataItemConfiguration {
    type: number;
    consume_item: number;
    consume_num: number;
    get_score: number;
}

class CfgIntegralTurntableDataRateShow {
    start_level: number;
    end_level: number;
    seq: number;
    name_id: number;
    rate: number;
    reward_id: CfgItem[];
}

class CfgIntegralTurntableDataDrawLabel {
    seq: number;
    location: number;
    desc: number;
}

class _CfgIntegralTurntableData {
    level_configuration: CfgIntegralTurntableDataLevelConfiguration[];
    luck_draw_reward: CfgIntegralTurntableDataLuckDrawReward[];
    luck_draw_configuration: CfgIntegralTurntableDataLuckDrawConfiguration[];
    item_configuration: CfgIntegralTurntableDataItemConfiguration[];
    rate_show: CfgIntegralTurntableDataRateShow[];
    draw_label: CfgIntegralTurntableDataDrawLabel[];
}

export let CfgIntegralTurntableData: _CfgIntegralTurntableData = null;
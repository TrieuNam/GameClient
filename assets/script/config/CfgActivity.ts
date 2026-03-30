import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { ActivityRandData } from "modules/activity/ActivityRandData";

const resPath = "config/activity_main_auto";

export function _CreateCfgActivity(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgActivityData = <_CfgActivityData>jsonAss.json;
        ActivityRandData.Inst().InitActivityRandList();
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgActivityData);
        func(err == null);
    })
}

export class CfgActivityRand {
    seq: number;
    text: string;
    sprite: string;
    view_name: string;
    red_dot: number;
    mod_key: number;
    is_open: number;
    mod: any;
    act_type: number;
    lower_special_effect_id: number | string;
    lower_special_effect_time: number;
    over_special_effect_id: number | string;
    over_special_effect_time: number;
    is_special_gift: number;
}

class CfgActivityGather {
    mod_key: number;
    act_type: number;
}
class CfgSpriteChange {
    text: string;
    sprite: string;
    over_special_effect_id: number;
    time: string;
}
class _CfgActivityData {
    rand: CfgActivityRand[];
    daily: CfgActivityRand[];
    new_sever_carnival: CfgActivityRand[];
    more_activity: CfgActivityRand[];
    ceshi: CfgActivityRand[];
    add_recharge_activity: CfgActivityRand[];
    right_activity: CfgActivityRand[];
    gather: CfgActivityGather[];
    sprite_change: CfgSpriteChange[];
}

export let CfgActivityData: _CfgActivityData = null;
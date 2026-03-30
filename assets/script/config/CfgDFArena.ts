import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/df_arena_auto";

export function _CreateCfgDFArena(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgDFArena = <_CfgDFArena>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgDfArena {
    initial_num:number;
    award_level_min:number;
    daily_rank_num:number;
    weekly_rank_num:number;
    combat_log_max:number;
    refresh_interval_s:number;
    everyday_time:number;
    jiesuan_tiem:number;
    refresh_score:number;
    sarena_challenger_id:number;
    win_score:number;
    lose_score:number;
    re_win_score:number;
    re_lose_score:number;
    succ:any;
    diamond_expend:number;
}
 
class CfgDfDailyAward {
    seq:number;
    paihang_1:number;
    paihang_2:number;
    item_list:any;
}

class CfgDfWeeklyAward {
    seq:number;
    paihang_1:number;
    paihang_2:number;
    item_list:any;
}

class _CfgDFArena {
    df_arena_cfg:CfgDfArena[];
    df_everyday_award:CfgDfDailyAward[];
    df_weekly_award:CfgDfWeeklyAward[];
}

export let CfgDFArena: _CfgDFArena = null;

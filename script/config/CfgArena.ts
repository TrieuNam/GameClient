import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/arena_auto";

export function _CreateCfgArena(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgArenaData = <_CfgArenaData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgArenaData);
        func(err == null);
    })
}

 class CfgArena {
    initial_num:number;
    award_level_min:number;
    weekly_rank_num:number;
    combat_log_max:number;
    refresh_interval_s:number;
    everyday_time:number;
    jiesuan_tiem:number;
    refresh_score:number;
    challenge_min:number;
    challenge_max:number;
    arena_challenge_id:number;
    succ_score_min:number;
    succ_score_max:number;
    succ:CfgItem[];
    lose_score_min:number;
    lose_score_max:number;
    lose: CfgItem[];
    left_score: number;
    centre_score: number;
    right_score:number;
    gold_expend:number;
     lose_score:number;
}

class CfgEverydayAward {
    seq: number;
    paihang_1: number;
    paihang_2: number;
    item_list: CfgItem[];
}

class CfgWeeklyAward {
    seq: number;
    paihang_1: number;
    paihang_2: number;
    item_list: CfgItem[];
}

export class CfgWeeklyJoinAward {
    seq: number;
    num: number;
    item_list: CfgItem[];
}

export class CfgArenaMonster {
    seq:number;
    monster_group:number;
    monster_score:number;
    monstor_icon:number;
    monster_fight:number;
    name_name:string;
    monster_level: number;
}

class _CfgArenaData {
    arena_cfg: CfgArena[];
    everyday_award: CfgEverydayAward[];
    weekly_award: CfgWeeklyAward[];
    weekly_join_award: CfgWeeklyJoinAward[];
    arena_monster: CfgArenaMonster[];
}

export let CfgArenaData: _CfgArenaData = null;
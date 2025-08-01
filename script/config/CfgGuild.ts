import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/guild_auto";

export function _CreateCfgGuild(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGuildData = <_CfgGuildData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgGuildData", CfgGuildData);
        func(err == null);
    })
}

class CfgGuildDataGuildBossProperty {
    boss_seq: number;
    monster_group: number;
    res_id: number;
    win: CfgItem[];
}

class CfgGuildDataGuildBossItem {
    fight_time: number;
    fight_item_id: number;
    fight_item_num: number;
}

class CfgGuildDataPlayerExercise {
    part_type: number;
    part_id: number;
    part_level: number;
    part_att: CfgAttrUp[];
    part_limit_level: number;
    exercise: CfgItem[];
}

class CfgGuildDataOther {
    win: CfgItem[];
    found: CfgItem[];
    leader_change_day: number;
    rebuild: CfgItem[];
    adavnced_build_open_level: number;
    boss_round_limit: number;
    guild_pop_num: number;
}

class CfgGuildDataHelp {
    help_type: number;
    level: number;
    help_num: number;
    help_time: number;
    help: CfgItem[];
}

class _CfgGuildData {
    guild_boss_property: CfgGuildDataGuildBossProperty[];
    guild_boss_item: CfgGuildDataGuildBossItem[];
    player_exercise: CfgGuildDataPlayerExercise[];
    other: CfgGuildDataOther[];
    help: CfgGuildDataHelp[];
}

export let CfgGuildData: _CfgGuildData = null;
import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/territory_auto";

export function _CreateCfgTerritory(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgTerritoryData = <_CfgTerritoryData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}


export class CfgTerritoryOther {
    max_refresh: number
    max_rizhi: number
    min_refresh_time: number
    max_refresh_time: number
    other_territory: number
    other_territory_refresh: number
    grid_max: number
    grid_centre: number
    bug_monster_item: number
    monster_num: number
    meat_id: number
    stone_id: number
    max_num: number
    own_box: number
    re_item: number
    re_item_num1: number
    re_item_num2: number
    re_time: number
}
export class CfgTerritoryItemInfo {
    seq: number
    item_id: number
    item_name: string
    item_num: number
    item_level: number
    max_monster: number
    speed: number
    myself_decrease_time: number
    enemy_decrease_time: number
    refresh_min: number
    refresh_max: number
    icon: number
}
export class CfgTerritoryBuyMonster {
    buy_monster: number
    bug_price: number
}
export class CfgTerritoryMonsterEfficiency {
    seq: number
    num: number
    efficiency: number
}
export class CfgTerritoryUp {
    seq: number
    up_item: number
    up_expend: number
}

export class _CfgTerritoryData {
    other: CfgTerritoryOther[]
    item_information: CfgTerritoryItemInfo[]
    buy_monster: CfgTerritoryBuyMonster[]
    monster_efficiency: CfgTerritoryMonsterEfficiency[]
    territory_up: CfgTerritoryUp[]
}


export let CfgTerritoryData: _CfgTerritoryData = null
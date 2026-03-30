import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/pet_auto";

export function _CreateCfgPet(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPetData = <_CfgPetData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgPetData);
        func(err == null);
    })
}

export class CfgPet {
    pet_id: number;
    pet_type: number;
    pet_res: number;
    pet_name: number;
    pet_icon: number;
    pet_color: number;
    pet_att: CfgAttrUp[];
    skill_grid_max: number;
    skill_grid_unlock: number;
    desc: string;
}

export class CfgPetUp {
    pet_type: number;
    pet_level: number;
    up_exp: number;
    up_att: CfgAttrUp[];
    abandon: CfgItem[];
}

export class CfgPetAdvance {
    pet_id: number;
    pet_order: number;
    need_myself: number;
    need_myself_num: number;
    up_order_item_id: number;
    item_id_num: number;
    up_att: CfgAttrUp[];
}

export class CfgPetSkill {
    skill_seq: number;
    skill_color: number;
    skill_page: number;
    skill_id: number;
    skill_item_id: number;
    skill_name: string;
    skill_decs: string;
}

export class CfgPetGem {
    gem_id: number;
    gem_type: number;
    level: number;
    up_att: CfgAttrUp[];
    up_need_same_class: number;
    gem_num: number;
    gem_level1: number;
}

export class CfgPetTsGem {
    ts_gem_level: number;
    up_need_same_class: number;
    gem_num: number;
    up_att: CfgAttrUp[];
    to_item_id: number;
    gem_level1: number;
    up_att_num: number;
}

class CfgPetGemUse {
    seq: number;
    use_item_id: number;
    use_item_num: number;
}

class CfgPetOther {
    bag_max: number;
    pet_exp_item_0: number;
    pet_exp_item_1: number;
    pet_exp_item_2: number;
    pet_exp_0: number;
    pet_exp_1: number;
    pet_exp_2: number;
    ts_gem_id: number;
    ts_gem_add: CfgAttrUp[];
    lock_skill_num: number;
    use_item_id: number;
    lock_1: number;
    lock_2: number;
    pet_abandon: number;
    price1: number;
    price2: number;
    pet_position: number;
    pet_position2: number;
    pet_evo_level: number;
    pet_evo_level_up: number;
    pet_level_max: number;
}
class CfgAdd_min_max {
    add_type: number;
    add_min: number;
    add_max: number;
    rate: number;
    range_a: any;
    range_b: any;
    range_c: any;
    range_d: any;
    range_e: any;
}

class CfgPetEvo {
    pet_type: number;
    evo_item_id: number;
    item_id_num: number;
    pet_type_after: number;
    pet_res_before: number;
    pet_res_after: number;
}
export class CfgPetTreasure {
    level_min: number
    level_max: number
    type: number
    rate: number
    win: CfgItem[]
    sort: number
}

class CfgPetCellUnlock{
    seq: number;
    rate: number;
    open: CfgItem[];
}
class _CfgPetData {
    pet: CfgPet[];
    pet_up: CfgPetUp[];
    pet_advance: CfgPetAdvance[];
    pet_skill: CfgPetSkill[];
    pet_gem: CfgPetGem[];
    pet_ts_gem: CfgPetTsGem[];
    pet_gem_use: CfgPetGemUse[];
    add_min_max: CfgAdd_min_max[];
    pet_evo: CfgPetEvo[];
    other: CfgPetOther[];
    pet_treasure: CfgPetTreasure[];
    kaigezi_rate: CfgPetCellUnlock[];
}

export let CfgPetData: _CfgPetData = null;
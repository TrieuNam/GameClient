import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
const resPath = "config/shenyiwu_auto";

export function _CreateCfgPetWeapon(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPetWeapon = <_CfgPetWeaponData>jsonAss.json;
        func(err == null);
    })
}

class CfgPetWeaponCfg {
    seq:number;
    name:string;
    type:number;
    quality:any;
    level_max:number;
    pet_att:any;
    pet_weapon_skill:number;
    pet_weapon_item:number;
    levels_1_pet_weapon_exp:number;
    pet_weapon_type:number;
    pet_weapon_pet_id:number;
    skill_txt:string;
}

class CfgPetWeaponLevel {
    quality:number;
    levels:number;
    need_steps:number;
    exps:number;
}

class CfgPetWeaponAttr {
    seq:number;
    levels:number;
    up_att:any;
}

class CfgPetWeaponStage {
    seq:number;
    steps:number;
    max_level:number;
    id:number;
    petcloth_count:number;
    skill_type:number;
    skill_id_type:number;
}

class _CfgPetWeaponData {
    pet_weapon_cfg:CfgPetWeaponCfg[];
    pet_weapon_level:CfgPetWeaponLevel[];
    pet_weapon_attribute:CfgPetWeaponAttr[];
    pet_weapon_stage:CfgPetWeaponStage[];
}

export let CfgPetWeapon: _CfgPetWeaponData = null;

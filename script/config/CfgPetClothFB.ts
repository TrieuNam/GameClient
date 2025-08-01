import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/pet_cloth_game_auto";

export function _CreateCfgPetClothFB(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPetClothFB = <_CfgPetClothFB>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgPetClothFB", CfgPetClothFB);
        func(err == null);
    })
}

class CfgPetGame{
    level : number;
    level_stage : number;
    level_stage_game : number;
    monster_id : number;
    monster_icon : number;
    game_name :string;
    win : any;
    rule_count: number;
    rule_id: string;
    level_icon_id: number;
    level_txt:string;
}

class CfgChallengeRule{
    rule_id : number;
    rule_desc : string;
    rule_value : number;
    rule_type : number;
}

class _CfgPetClothFB{
    pet_game : CfgPetGame[];
    challenge_rule : CfgChallengeRule[];
}

export let CfgPetClothFB : _CfgPetClothFB = null;
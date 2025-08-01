import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/passive_skill_auto";

export function _CreateCfgPassiveSkill(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPassiveSkillData = <_CfgPassiveSkillData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgPassiveSkillData);
        func(err == null);
    })
}

export class CfgPassiveSkill {
    skill_id: number;
    target: number;
    skill_icon: number;
    skill_color: number;
    skill_desc: number;
    skill_att_type: number;
    att_type: number;
    att_num: number;
    skill_name: string;
    skill_level: number;
}

export class CfgSpecialEffects {
    id: string;
    skill_effect_type: string;
    skill_effect_id1: string;
    skill_effect_end: string;
    skill_effect_id2: string;
    skill_effect_id3: string;
}

class _CfgPassiveSkillData {
    passive_cfg: CfgPassiveSkill[];
    special_effects: { [key: string]: CfgSpecialEffects };
}

export let CfgPassiveSkillData: _CfgPassiveSkillData = null;
import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";

const resPath = "config/single_skill_auto";

export function _CreateCfgSingleSkill(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgSingleSkillData = <_CfgSingleSkillData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSingleSkillData", CfgSingleSkillData);
        func(err == null);
    })
}

export class CfgSingleSkill {
    skill_id: number;
    skill_level: number;
    skill_name: string;
    target_side_type: number;
    target_num: number;
    is_shanbi: number;
    is_baoji: number;
    is_lianji: number;
    is_xixue: number;
    is_jiyun: number;
    is_fanji: number;
}

class _CfgSingleSkillData {
    skill_cfg: CfgSingleSkill[];
}

export let CfgSingleSkillData: _CfgSingleSkillData = null;


import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { BATTLE_ATTR } from "modules/common/CommonEnum";

const resPath = "config/score_cfg_auto";

export function _CreateCfgScore(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgScoreData = <_CfgScoreData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgScoreData);
        func(err == null);
    })
}

export class CfgAttScore {
    role_level:number;
    speed_score:number;
    hp_score:number;
    att_score:number;
    def_score:number;
    xixue_score:number;
    fanji_score:number;
    lianji_score:number;
    shanbi_score:number;
    baoji_score:number;
    jiyun_score:number;
    de_xixue_score:number;
    de_fanji_score:number;
    de_lianji_score:number;
    de_shanbi_score:number;
    de_baoji_score:number;
    de_jiyun_score:number;
    baonue_score:number;
    renai_score:number;
    nining_score:number;
    jinliao_score:number;
    huifu_score:number;
    qiling_score:number;
    luecai_score:number;
    jiaodoushi_score:number;
    zuizhongshanghai_score: number;
}

class _CfgScoreData {
    att_score: CfgAttScore[];
}

export let CfgScoreData: _CfgScoreData = null;

export let CfgAttScore_type: { [key: number]: string } = {
    [BATTLE_ATTR.ATTACK]:"att_score",
}
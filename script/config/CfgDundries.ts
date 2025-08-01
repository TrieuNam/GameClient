import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/sundries_auto";

export function _CreateCfgDundries(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgDundriesData = <_CfgDundriesData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

 class CfgDundriesOther {
   minimum_quality:number;
   recovery_need_gold:number;
   treasure_map_notice_item:number;
   give_up_battle:number;
   patrol_open_level:number;
   star_team:number;
     novice_reward_item: CfgItem[]
    pet_use_limit: number;
}

class CfgDundriesLose {
    seq:number;
    mod_key:number;
    show_icon:number;
    show_txt: number;
    act_type:number;
}

class CfgDundriesShowAtt {
    att_type:number;
    is_show:number;
}

class _CfgDundriesData {
    other: CfgDundriesOther[];
    lose: CfgDundriesLose[];
    show_att : CfgDundriesShowAtt[];
}

export let CfgDundriesData: _CfgDundriesData = null;
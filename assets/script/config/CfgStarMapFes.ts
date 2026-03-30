import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/xingtushengdian_auto";

export function _CreateCfgStarMapFes(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgStarMapFesData = <_CfgStarMapFesData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgTaskCfg {
    type: number;
    start_level: number;
    end_level: number;
    task_id: number;
    task_type: number;
    parameter: number;
    reward_item: any;
    describe: string;
    task_order: number;
    task_show: number;
}

class CfgGiftCfg {
    seq: number;
    start_level: number;
    end_level: number;
    type: number;
    reward_item: any;
    limit_type: number;
    limit_convert_count: number;
    price_type: number;
    price: number;
    discount: number;
}

class CfgOther {
    duration_time: number;
}

class _CfgStarMapFesData {
    task_configuration: CfgTaskCfg[];
    gift_configuration: CfgGiftCfg[];
    other: CfgOther[];
}

export let CfgStarMapFesData: _CfgStarMapFesData = null;
import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/task_cfg_auto";

export function _CreateCfgTask(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgTaskData = <_CfgTaskData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgTaskData);
        func(err == null);
    })
}

export class CfgTaskList {
    task_id: number;
    condition: number;
    param: number;
    task_des: string;
    task_plan: number;
    reward: CfgItem[];
    is_auto: number;
    next_task_id: number;
    guide_id: number;
}

class _CfgTaskData {
    task_list: CfgTaskList[];
}

export let CfgTaskData: _CfgTaskData = null;
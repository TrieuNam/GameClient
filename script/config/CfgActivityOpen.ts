import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { ActivityRandData } from "modules/activity/ActivityRandData";

const resPath = "config/randactivityopencfg_auto";

export function _CreateCfgActivityOpen(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgActivityOpenData = <_CfgActivityOpenData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgActivityOpenData);
        func(err == null);
    })
}

export class CfgActivityOpen {
    activity_type:number;
    begin_day:string;
    end_day:string;
    level:number;
    version:number;

}


class _CfgActivityOpenData {
    base_on_day_cfg: CfgActivityOpen[];
}

export let CfgActivityOpenData: _CfgActivityOpenData = null;
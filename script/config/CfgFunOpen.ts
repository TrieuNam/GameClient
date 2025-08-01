import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { ActivityRandData } from "modules/activity/ActivityRandData";

const resPath = "config/funopen_auto";

export function _CreateCfgFunOpen(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgFunOpen = <_CfgFunOpenData>jsonAss.json;
        //ExportGlobalForDebug("CfgFunOpen", CfgFunOpen);
        func(err == null);
    })
}

class CfgFunOpenData {
    seq: number;
    client_id: number | string;
    level: number;
    task: number;
    class_name: string
    name: string
    level_min: number
    level_max: number
    client_icon: string
    level_open: number
    server_id: number;
    time_stamp: number | string
    old_level: number
    old_task: number
}

class _CfgFunOpenData {
    funopen: CfgFunOpenData[];
}

export let CfgFunOpen: _CfgFunOpenData = null;
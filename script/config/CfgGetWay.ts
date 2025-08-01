import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";

const resPath = "config/getway_cfg_auto";

export function _CreateCfgGetWay(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGetWayData = <_CfgGetWayData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgGetWay {
    id: number;
    desc: string;
    open_panel: number;
    act_type: number;
}


class _CfgGetWayData {
    get_way: CfgGetWay[];
}

export let CfgGetWayData: _CfgGetWayData = null;

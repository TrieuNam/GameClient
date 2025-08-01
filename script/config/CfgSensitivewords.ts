import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";

const resPath = "other/config_sensitivewords";

export function _CreateCfgSensitivewords(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgSensitivewordsData = <_CfgSensitivewordsData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSensitivewordsData", CfgSensitivewordsData);
        func(err == null);
    })
}

class _CfgSensitivewordsData {
    Config_SensitiveWords_list: string[];
}

export let CfgSensitivewordsData: _CfgSensitivewordsData = null;
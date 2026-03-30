import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/language_cfg_auto";

export function _CreateCfgLanguage(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLanguageData = <_CfgLanguageData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgLanguageData);
        func(err == null);
    })
}

class CfgDesc{
    seq:number;
    desc:string;
    title:string;
}


class _CfgLanguageData {
    textdesc: CfgDesc[];
}

export let CfgLanguageData: _CfgLanguageData = null;
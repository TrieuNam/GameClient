import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";

export function _CreateError(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>("config/errornum", (err, jsonAss) => {
        ErrorInfo = <any>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgError", jsonAss);
        func(err == null);
    });
}

export let ErrorInfo : any = null;
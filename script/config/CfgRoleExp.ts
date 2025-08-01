import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/roleexp_auto";

export function _CreateCfgRoleExp(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgRoleExpData = <_CfgRoleExpData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgRoleExpData", CfgRoleExpData);
        func(err == null);
    })
}

class CfgRoleExpDataExpConfig{
    level : number;
    exp : number;
}

class CfgRoleExpDataBaseAttr{
    speed : number;
    hp : number;
    gongji : number;
    fangyu : number;
}

class _CfgRoleExpData{
    exp_config : CfgRoleExpDataExpConfig[];
    base_att : CfgRoleExpDataBaseAttr[];
}

export let CfgRoleExpData : _CfgRoleExpData = null;
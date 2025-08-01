import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/shenqi_auto";

export function _CreateCfgShenQi(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShenQiData = <_CfgShenQiData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgShenQiData", CfgShenQiData);
        func(err == null);
    })
}

class CfgShenQiDataShenQiType {
    id: number;
    name: string;
    level: number;
    quality: number;
    exp: number;
    skill_id: number;
    skill_level: number;
    dec: string;
    icon: number;
}

class CfgShenQiDataTurntable {
    cell: number;
    type: number;
    pram: number;
    color: number;
    shenqi_energy: number;
    rate: number;
    icon: number;
}

class CfgShenQiDataActivationAtt {
    type: number;
    jihuo_att: CfgAttrUp[];
    up_att: CfgAttrUp[];
    level_interval: number;
}

class CfgShenQiDataOther {
    shenqi_energy_id: number;
    shenqi_chip: number;
    lottery_cost: number;
    free_raffle: number;
    level_num: number
}

class _CfgShenQiData {
    shenqi_type: CfgShenQiDataShenQiType[];
    turntable: CfgShenQiDataTurntable[];
    activation_att: CfgShenQiDataActivationAtt[];
    other: CfgShenQiDataOther[];
}

export let CfgShenQiData: _CfgShenQiData = null;
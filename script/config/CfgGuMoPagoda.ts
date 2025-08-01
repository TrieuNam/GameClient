import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/gumo_pagoda_auto";

export function _CreateCfgGuMoPagoda(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShiLianGuMoData = <_CfgShiLianGuMoData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgShiLianGuMoData", CfgShiLianGuMoData);
        func(err == null);
    })
}

class CfgShiLianGuMoDataLayer{
    layer : number;
    layer_level : number;
    level : number;
    monster_group : number;
    score : number;
    win : CfgItem[];;
    res_id : number;
    stars : number;
    icon_id : number;
    day : CfgItem[];
}

class CfgShiLianGuMoDataStars{
    seq : number;
    order_num : number;
    condition_type : number;
    param_1 : number;
    txt : string;
}

class CfgShiLianGuMoDataStarsReward{
    layer : number;
    stars_num : number;
    stars_reward : CfgItem[];
}

class _CfgShiLianGuMoData{
    layer : CfgShiLianGuMoDataLayer[];
    stars : CfgShiLianGuMoDataStars[];
    stars_reward : CfgShiLianGuMoDataStarsReward[];
}

export let CfgShiLianGuMoData : _CfgShiLianGuMoData = null;
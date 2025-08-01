import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/shilian_pagoda_auto";

export function _CreateCfgShiLianPagoda(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgShiLianPagodaData = <_CfgShiLianPagodaData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgShiLianPagodaData", CfgShiLianPagodaData);
        func(err == null);
    })
}

class CfgShiLianPagodaDataClearance{
    level : number;
    monster_group : number;
    score : number;
    win : CfgItem[];
    res_id : number;
    random_group : number;
}

class CfgShiLianPagodaDataRandomGroup{
    seq : number;
    zhanlipin_id : number;
    rate : number;
}

class CfgShiLianPagodaDataPaiHangReward{
    seq : number;
    paihang_1 : number;
    paihang_2 : number;
    paihang_reward : CfgItem[];
}

class CfgShiLianPagodaDataOpen{
    seq : number;
    open_item_id : number;
    open_item_num : number;
}

class CfgShiLianPagodaDataOther{
    max_level : number;
    time : number;
    bag_max : number;
    shilian_coin_id : number;
}

class _CfgShiLianPagodaData{
    clearance : CfgShiLianPagodaDataClearance[];
    random_group : CfgShiLianPagodaDataRandomGroup[];
    paihang_reward : CfgShiLianPagodaDataPaiHangReward[];
    open : CfgShiLianPagodaDataOpen[];
    other : CfgShiLianPagodaDataOther[];
}

export let CfgShiLianPagodaData : _CfgShiLianPagodaData = null;
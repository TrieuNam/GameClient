import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/duobao_auto";

export function _CreateCfgDuoBao(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgDuoBaoData = <_CfgDuoBaoData>jsonAss.json;
        func(err == null);
    })
}

class CfgDuoBaoRate {
    duobao_type:number;
    eight_grid:number;
    rate:number;
 }
 
class CfgDuoBao {
    eight_grid:number;
    index:number;
    win:any;
    acquire_num:number;
    rate_grid:number;
    integral:number;
    id_record:number;
 }

class CfgJiFenJiangLi {
    duobao_type:number;
    level:number;
    integral:number;
    win:any;
 }

class CfgOther {
    chuji_id:number;
    gaoji_id:number;
    mianfei_refresh:number;
    refresh_time:number;
}

class _CfgDuoBaoData {
    duobao_rate:CfgDuoBaoRate[];
    duobao:CfgDuoBao[];
    jifen_jiangli:CfgJiFenJiangLi[];
    other:CfgOther[];
}

export let CfgDuoBaoData: _CfgDuoBaoData = null;

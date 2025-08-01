import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/kaixiangdaji_auto";

export function _CreateCfgServerBoxOpen(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgServerBoxOpenData = <_CfgServerBoxOpenData>jsonAss.json;
        func(err == null);
    })
}

class CfgServerBoxOpenReward {
    type:number;
    type_box_num:number;
    type_num:number;
    reward_item:any;
 }

class CfgOther {
    time:number;
    is_open:number
}

class _CfgServerBoxOpenData {
    reward:CfgServerBoxOpenReward[];
    other:CfgOther[];
}

export let CfgServerBoxOpenData: _CfgServerBoxOpenData = null;

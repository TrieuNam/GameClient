import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgItem } from "./CfgCommon";

const resPath = "config/leichong_auto";

export function _CreateCfgLeiChong(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgLeiChong = <_CfgLeiChong>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgLeiChong", CfgLeiChong);
        func(err == null);
    })
}

export class CfgLeiChongReward {
    seq:number;
    diamond:number;
    reward_item:CfgItem[];
}

class CfgLeiChongShow {
    seq:number;
    reward_id:CfgItem[];
}

class _CfgLeiChong {
    reward: CfgLeiChongReward[];
    item_show: CfgLeiChongShow[];
}

export let CfgLeiChong: _CfgLeiChong = null;
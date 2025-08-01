import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem, CfgAttrUp } from "./CfgCommon";

const resPath = "config/item_retrieve_auto";

export function _CreateCfgItemRetrieve(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgItemRetrieve = <_CfgItemRetrieve>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}
class CfgItemReLevel {
    retrieve_level: number
    up_exp: number
    up_att: CfgAttrUp[]
}
class CfgRetrieve {
    seq: number
    type: number
    condition_1: number
    condition_2: number
    experience_retrieve: number
}
class _CfgItemRetrieve {
    retrieve: CfgRetrieve[]
    level: CfgItemReLevel[]
}

export let CfgItemRetrieve: _CfgItemRetrieve = null;
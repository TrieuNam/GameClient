import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem, CfgAttrUp } from "./CfgCommon";

const resPath = "config/inscription_auto";

export function _CreateCfgInscription(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgInscriptionData = <_CfgInscriptionData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgHole {
    index: number;
    type: number;
    unlock: number;
}

class CfgCollect {
    id: number;
    type: number;
    att_type: number;
    color: number;
    up_max_level :number;
    unlock: number;
    base_att:any;
    up_att: any;
}

class CfgUpgrade {
    type : number;
    color : number;
    level : number;
    exp : number;
    itemback: number;
}

class CfgTsCollect {
    id : number;
    level : number;
    skill_id : number;
    skill_level : number;
    up_item_id : number;
    up_item_num: number;
    up_max_level :number;
    color:number;
}

class CfgOther {
    exp_id_0: number;
    exp_id_1 : number;
    exp_id_2: number;
    exp_id_3: number;
    exp_0 : number;
    exp_1 : number;
    exp_2 : number;
    exp_3 : number;
    max_level : number;
    max_bag : number;
    up_item_id : number;
}

class _CfgInscriptionData {
    hole: CfgHole[];
    collect: CfgCollect[];
    ts_mingwen: CfgTsCollect[];
    upgrade: CfgUpgrade[];
    other: CfgOther[];
}

export let CfgInscriptionData: _CfgInscriptionData = null;

import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/monster_group_auto";

export function _CreateCfgMonsterGroup(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgMonsterGroupData = <{ [monster_group_id: number]: _CfgMonsterGroupData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgMonsterGroupData", CfgMonsterGroupData);
        func(err == null);
    })
}

export class _CfgMonsterGroupData {
    monster_group_id:number;
    name:string;
    monster_id_0:number;
    monster_id_1:number;
    monster_id_2:number;
}

export let CfgMonsterGroupData : { [monster_group_id: number]: _CfgMonsterGroupData } = null;
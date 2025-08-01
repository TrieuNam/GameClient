import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/monster_auto";

export function _CreateCfgMonster(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgMonsterData = <{ [monster_id: number]: _CfgMonsterData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgMonsterData", CfgMonsterData);
        func(err == null);
    })
}

export class _CfgMonsterData {
    monster_id:number;
    monster_level:number;
    icon_id:number;
    name:string;
    res_id:number;
    speed:number;
    hp:number;
    attack:number;
    defense:number;
    xixue:number;
    fanji:number;
    lianji:number;
    shanbi:number;
    baoji:number;
    jiyun:number;
    de_xixue:number;
    de_fanji:number;
    de_lianji:number;
    de_shanbi:number;
    de_baoji:number;
    de_jiyun:number;
}

export let CfgMonsterData : { [monster_id: number]: _CfgMonsterData } = null;
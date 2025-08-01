import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/item/equipment_angle_cfg_auto";

export function _CreateCfgEquipAngle(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgEquipAngleData = <{ [item_id: number]: CfgEquipAngleItemData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgEquipAngleData);
        func(err == null);
    })
}

export class CfgEquipAngleItemData {
    id:number;
    name:number;
    shengzhuang_type:number;
    up:number;
    item_type:number;
    quality:number;
    stage_att:CfgAttrUp[];
    icon:number;
    sellprice:number;
    pile_limit:number;
    isdroprecord:number;
    invalid_time: number; 
    up_item_id_0:number;
    up_item_num_0:number;
    up_item_id_1:number;
    up_item_num_1: number;
}


export let CfgEquipAngleData: { [item_id: number]: CfgEquipAngleItemData } = null;
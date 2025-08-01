import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/equipment_auto";

export function _CreateCfgEquip(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgEquipData = <{[item_id: number]: CfgEquipItemData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgEquipData);
        func(err == null);
    })
} 

export class CfgEquipItemData {
    id:number;
    name:string;
    part:number;
    level:number;
    quality:number;
    speed_min:number;
    speed_max:number;
    hp_min:number;
    hp_max:number;
    att_min:number;
    att_max:number;
    def_min:number;
    def_max:number;
    exp:number;
    coin:number;
    icon:number;
    frist_att:number;
    second_att: number;
    is_special:number;
}


export let CfgEquipData: { [item_id: number]:CfgEquipItemData} = null;
import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/item/pet_item_auto";

export function _CreateCfgPetItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPetItemData = <{ [item_id: number]: CfgPetItemItemData }>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgPetItemData);
        func(err == null);
    })
}

export class CfgPetItemItemData {
    id:number;
    name: string;;
    item_type:number;
    is_virtual:number;
    color:number;
    sellprice:number;
    pile_limit:number;
    isdroprecord:number;
    invalid_time:number;
    param:number;
    item_level:number;
    description: string;
    use_msg:number;
    icon_id:number;
    get_way:number;
    show_red:number;
    mod_key:number;
    get_the_source:number;
    use:string;
}


export let CfgPetItemData: { [item_id: number]: CfgPetItemItemData } = null;
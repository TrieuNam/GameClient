import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
const resPath = "config/item/pet_weapon_item_auto";

export function _CreateCfgPetWeaponItem(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgPetWeaponItem = <{[item_id: number]: CfgPetWeaponItemData }>jsonAss.json;
        func(err == null);
    })
}

export class CfgPetWeaponItemData {
    id:number;
    name:string;
    item_type:number;
    show_type:number;
    is_virtual:number;
    color:number;
    sellprice:number;
    pile_limit:number;
    isdroprecord:number;
    invalid_time:number;
    param:number;
    item_level:number;
    description:string;
    use_msg:string;
    icon_id:number;
    get_way:string;
    show_red:number;
    mod_key:string;
    get_the_source:number;
    use:string;
    special_effects:string;
}


export let CfgPetWeaponItem: { [item_id: number]:CfgPetWeaponItemData} = null;
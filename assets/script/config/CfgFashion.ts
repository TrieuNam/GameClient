import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/model_clothes_auto";

export function _CreateCfgFashion(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgFashion = <_CfgFashion>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgEscortData", CfgEscortData);
        func(err == null);
    })
}
//要使用属性需提前声明
export class CfgFashionClothes {
    clothes_id: number;
    clothes_item: number;
    clothes_type: number;
    jihuo_att: CfgAttrUp[];
    res_id: number;
    is_show: number;
    effect_id: string;
    suit_id: number;
    suit_icon: number;
    suit_name: string;
    jihuo: CfgItem[];
}

export class CfgFashionClothesUp {
    clothes_id: number;
    level: number;
    up_item: number;
    up_item_num: number;
    dangqian_att: CfgAttrUp[];
    score: number
}

class _CfgFashion {
    clothes: CfgFashionClothes[];
    clothes_up: CfgFashionClothesUp[];
}

export let CfgFashion: _CfgFashion = null;
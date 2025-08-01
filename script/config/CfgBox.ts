import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/unpack_auto";

export function _CreateCfgBox(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgBoxData = <_CfgBoxData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgBoxData);
        func(err == null);
    })
}

export class CfgBoxRandomColor {
    box_level: number;
    equipment_color_1: number;
    equipment_color_2: number;
    equipment_color_3: number;
    equipment_color_4: number;
    equipment_color_5: number;
    equipment_color_6: number;
    equipment_color_7: number;
    equipment_color_8: number;
    up_buy_num: number;
    price: number;
    up_time_minute: number;
    box_num: number;
    reward: CfgItem[];
}

class CfgBoxOther {
    additional_attribute_num: number;
    box_num_max: number;
    currency_type: number;
    accelerate_id: number;
    unpack_item_id: number;
    get_num: number;
    max_challenge: number;
    max_shizhuang: number;
}

export class CfgBoxColorAtt {
    att_group: number;
    att_type: number;
    att_num_min: number;
    att_num_max: number;
}

export class CfgAutoUnpack {
    seq: number;
    param_1: number;
    dec: string;
}
export class CfgBoxGetWay {
    index: number
    name: string
    icon: string
    level: number
    open_panel: number
}

class _CfgBoxData {
    random_color: CfgBoxRandomColor[];
    other: CfgBoxOther[];
    color_att: CfgBoxColorAtt[];
    auto_unpack: CfgAutoUnpack[];
    getway: CfgBoxGetWay[];
}

export let CfgBoxData: _CfgBoxData = null;
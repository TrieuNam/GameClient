import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/orb_auto";

export function _CreateCfgOrb(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgOrbData = <_CfgOrbData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgOrbData", CfgOrbData);
        func(err == null);
    })
}

class CfgOrbDataMapCfg {
    orb_map: number;
    item_group: number;
    condition_id: number;
    name: string;
    resources: number;
}

class CfgOrbDataMapUnlock {
    orb_map: number;
    condition: number;
    param: number;
}

class CfgOrbDataItemGroup {
    seq: number;
    item_id_map: number;
    rate: number;
}

class CfgOrbDataAttNum {
    att_group: number;
    att_type: number;
    att_num_min: number;
    att_num_max: number;
}

class CfgOrbDataUpgrade {
    item_seq: number;
    item_name: string;
    item_icon: number;
    item_color: number;
    item_level: number;
    item_type: number;
    item_att_num: number;
    up_item: CfgItem[];
}

class CfgOrbDataAdvance {
    item_seq: number;
    advance: number;
    advance_need: number;
    item_type: number;
    item_att_num: number;
    condition: number;
    param: number;
}

class CfgOrbDataGather {
    level: number;
    num_1: number;
    num_2: number;
    num_3: number;
    num_4: number;
    up_time_minute: number;
    price: number;
    up_num: number;
    reward: CfgItem[];
}

class CfgOrbDataPicture {
    orb_map: number;
    handbook_type: number;
    handbook_name: string;
    handbook_treasure: string;
    jihuo_att: CfgAttrUp[];
}

class CfgOrbDataCollectibleHandbook {
    handbook_type: number;
    level: number;
    up_item_id: number;
    up_item_num: number;
    up_att: CfgAttrUp[];
}

class CfgOrbDataTask {
    seq: number;
    color: number;
    condition: number;
    param_0: number;
    param_1: number;
    task_item: CfgItem[];
    rate: number;
}

class CfgOrbDataOther {
    shuaxin_item: number;
    up_time_item: number;
    box_up_item: number;
    max_level: number;
    max_advance: number;
    task_num: number;
    tili_item: number;
    tili_item_max: number;
    tili_item_time: number;
    up_item_id: number;
}

class CfgOrbDataAttTxt {
    att_type: number;
    att_txt: string;
}

class _CfgOrbData {
    map_cfg: CfgOrbDataMapCfg[];
    map_unlock: CfgOrbDataMapUnlock[];
    item_group: CfgOrbDataItemGroup[];
    att_num: CfgOrbDataAttNum[];
    upgrade: CfgOrbDataUpgrade[];
    advance: CfgOrbDataAdvance[];
    gather: CfgOrbDataGather[];
    picture: CfgOrbDataPicture[];
    collectible_handbook: CfgOrbDataCollectibleHandbook[];
    task: CfgOrbDataTask[];
    other: CfgOrbDataOther[];
    att_txt: CfgOrbDataAttTxt[];
}

export let CfgOrbData: _CfgOrbData = null;
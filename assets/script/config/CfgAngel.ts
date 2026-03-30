import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/angel_auto";

export function _CreateCfgAngel(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgAngelData = <_CfgAngelData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgAngelData);
        func(err == null);
    })
}

export class CfgAngel {
    level: number;
    show_angle_level: number;
    angle_level: number;
    up_att: CfgAttrUp[];
    up_item_id: number;
    up_item_num: number;
}

export class CfgAngelGrade {
    angle_stage: number;
    angle_level: number;
    stage_att: CfgAttrUp[];
    stage_item_id: number;
    stage_item_num: number;
}
class CfgAngelEquip {
    position: number;
    level_show: number;
    equipment_id: number;
    // up_item_id_0: number;
    // up_item_num_0: number;
    // up_item_id_1: number;
    // up_item_num_1: number;
}
export class CfgAngelRes {
    angle_skin_seq: number;
    angle_res_id: number;
    jihuo_item_id: number;
    jihuo_att: CfgAttrUp[];
    is_show: number;
    name: string;
    icon_id: number;
    res_size: number;
    fazhen_show: string;
    jihuo: CfgItem[];
}
export class CfgAngelResUp {
    angle_skin_seq: number;
    skin_level: number;
    up_item_id: number;
    up_item_num: number;
    jihuo_att: CfgAttrUp[];
}
class _CfgAngelData {
    angel_cfg: CfgAngel[];
    angel_up: CfgAngelGrade[];
    equipment_up: CfgAngelEquip[];
    angel_res: CfgAngelRes[];
    angel_res_up: CfgAngelResUp[];
}

export let CfgAngelData: _CfgAngelData = null;
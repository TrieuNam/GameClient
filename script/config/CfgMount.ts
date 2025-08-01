import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp, CfgItem } from "./CfgCommon";

const resPath = "config/mount_auto";

export function _CreateCfgMount(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgMountData = <_CfgMountData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgMountLevel {
    mount_id: number;
    level: number;
    show_mount_level: number;
    mount_level: number;
    up_att: CfgAttrUp[];
    up_item_id: number;
    up_item_num: number;
}

export class CfgMountJiHuo {
    name: string;
    color: number;
    mount_id: number;
    level: number;
    up_id: number;
    up_num: number;
    explore_item_id: number;
    explore_item_num: number;
    up_att: CfgAttrUp[];
    mount_res: number;
    icon_id: number;
}

class CfgMountHeCheng {
    mount_id: number;
    hecheng_id: number;
    hecheng_num: number;
    hecheng_item_id: number;
}

export class CfgMountRes {
    mount_skin_seq: number;
    res_id: number;
    jihuo_item_id: number;
    jihuo_att: CfgAttrUp[];
    is_show: number;
    name: string;
    icon_id: number;
    res_size: number;
    mount_show: number;
    jihuo: CfgItem[];
}

export class CfgMountResUp {
    mount_skin_seq: number;
    skin_level: number;
    up_item_id: number;
    up_item_num: number;
    jihuo_att: CfgAttrUp[];
}

class CfgHarness {
    harness_type: number;
    harness_id: number;
    att: any;
    harness_own_att_num: number;
    harness_att_num_max: number;
}

class CfgHarnessGemUse {
    seq: number;
    use_item_id: number;
    use_item_num: number;
    use_item_id2: number;
    use_item_num2: number;
}

class CfgHarnessAdd {
    harness_id: number;
    seq: number;
    add_type: number;
    range_a: string;
    range_1: string;
    rate_1: number;
    range_2: string;
    rate_2: number;
    range_3: string;
    rate_3: number;
    range_4: string;
    rate_4: number;
    range_5: string;
    rate_5: number;
    range_6: string;
    rate_6: number;
    range_7: string;
    rate_7: number;
}

class CfgHarnessBuy {
    item_seq: number;
    harness_item: number;
    buy_item_id: number;
    buy_item_num: number;
    rate1: number;
    rate2: number;
}

class CfgOther {
    tansuo_max_time: number;
    auto_mount_id: number;
    unlock_item_id: number;
    unlock_item_num: number;
    re_item_id1: number;
    re_item_num1: number;
    re_time_max1: number;
    free_time: number;
    re_item_id2: number;
    re_item_num2: number;
    re_item_num_change: number;
    re_time_max2: number;
}

class _CfgMountData {
    mount_cfg: CfgMountLevel[];
    mount_jihuo: CfgMountJiHuo[];
    hecheng: CfgMountHeCheng[];
    other: CfgOther[];
    mount_res: CfgMountRes[];
    mount_res_up: CfgMountResUp[];
    harness: CfgHarness[];
    harness_gem_use: CfgHarnessGemUse[];
    harness_add: CfgHarnessAdd[]
    harness_buy: CfgHarnessBuy[];
}

export let CfgMountData: _CfgMountData = null;

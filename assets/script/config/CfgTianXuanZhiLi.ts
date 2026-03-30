import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/tianxuanzhili_auto";

export function _CreateCfgTianXuanZhiLiData(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgTianXuanZhiLiData = <_CfgTianXuanZhiLiData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgTianXuanZhiLiData);
        func(err == null);
    })
}

class CfgBaseConfiguration{
    gift_num: number;
    item_group: number;
    level_min: number;
    level_max: number;

}
export class CfgGiftConfiguration{
    group_id: number;
    seq: number;
    item: CfgItem[];
    price_type: number;
    price: number;
    limit_convert_count: number;
    gift_value: number;
    discount: number;
    name: string;
}
class CfgOrther{
    accumulate_recharge_show: number;
    duration_time: number;
    cd_time: number;
    free_reward_item: CfgItem[];
    desc: string;
}

class _CfgTianXuanZhiLiData {
    base_configuration: CfgBaseConfiguration[];
    gift_configuration: CfgGiftConfiguration[];
    other: CfgOrther[];
}



export let CfgTianXuanZhiLiData: _CfgTianXuanZhiLiData = null;
import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/chongzhireward_spid_auto";

export function _CreateCfgRecharge(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgRechargeData = <_CfgRechargeData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgRechargeData", CfgRechargeData);
        func(err == null);
    })
}

class CfgRechargeReward {
    seq: number;
    chongzhi: number;
    cehua: number;
    reward_type: number;
    reward_times: number;
    show_zhengshi: number;
    extra_jade: number;
    extra_gold: number;
    extra_coin: number;
    rmb_show: number;
    twd_show: number;
    dollar_show: number;
    discretion: number;
}
class _CfgRechargeData {
    reward_0: CfgRechargeReward[];
}

export let CfgRechargeData: _CfgRechargeData = null;
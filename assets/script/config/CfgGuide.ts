import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";

const resPath = "config/function_guide_auto";

export function _CreateCfgGuideData(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGuideData = <_CfgGuideData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgGuideData", CfgGuideData);
        func(err == null);
    })
}
//要使用属性需提前声明
export class CfgGuideConfig{
    id : number;
    guide_name : string;
    trigger_type : number;
    trigger_param_1 : number;
    trigger_param_2 : number;
    trigger_param_3 : number;
}

export class CfgGuideStep{
    step_id : number;
    index : number;
    audio : string;
    step_type : number;
    step_param_1: string;
    step_param_2 : string;
    step_param_3 : string;
    arrow_dir : number;
    arrow_tip: string;
    is_finger_effect : 1;
    offset_x : number;
    offset_y : number;
}

class _CfgGuideData{
    guide_list : CfgGuideConfig[];
    guide : CfgGuideStep[];
}

export let CfgGuideData : _CfgGuideData = null;
import { JsonAsset } from "cc";
import { Debugger } from "core/Debugger";
import { ResManager } from "manager/ResManager";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/block_auto";

export function _CreateCfgBlock(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgBlockData = <_CfgBlockData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgBlockData", CfgBlockData);
        func(err == null);
    })
}

class CfgBlockDataBlockModel {
    model_id: number;
    model_name: string;
    block_type: number;
    block: CfgAttrUp[];
}

class CfgBlockDataModelLevel {
    seq: number;
    model_num: number;
    achieve: CfgAttrUp[];
}

class CfgBlockDataBlockShape {
    shape_id: number;
    x_axle: number;
    y_0: number;
    y_1: number;
    y_2: number;
}

class CfgBlockDataBlockUp {
    block_type: number;
    block_type_after: number;
    block_num: number;
    rate: number;
    return_num: number;
}

class CfgBlockDataOther {
    jimuquan_id: number;
}


class _CfgBlockData {
    block_model: CfgBlockDataBlockModel[];
    model_level: CfgBlockDataModelLevel[];
    block_shape: CfgBlockDataBlockShape[];
    block_up: CfgBlockDataBlockUp[];
    other: CfgBlockDataOther[];
}

export let CfgBlockData: _CfgBlockData = null;
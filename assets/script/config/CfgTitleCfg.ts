import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgAttrUp } from "./CfgCommon";

const resPath = "config/titile_cfg_auto";

export function _CreateCfgTitleCfg(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgTitleCfgData = <_CfgTitleCfgData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgTitleCfgData", CfgTitleCfgData);
        func(err == null);
    })
}

class CfgTitleCfgDataTitle{
    seq : number;
    name : string;
    title_color : number;
    title_att : CfgAttrUp[];
    for_item_id : number;
    desc : string;
}

class _CfgTitleCfgData{
    titile : CfgTitleCfgDataTitle[];
}

export let CfgTitleCfgData : _CfgTitleCfgData = null;
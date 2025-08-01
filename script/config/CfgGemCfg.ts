import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";
import { CfgMountData } from "./CfgMount";
import { CfgOther } from "./CfgOther";

const resPath = "config/gem_cfg_auto";

export function _CreateCfgGemCfg(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgGemCfgData = <_CfgGemCfgData>jsonAss.json;
        //Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgDundriesData);
        func(err == null);
    })
}

class CfgDrawingUp {
    gem_drawing_id:number;      // 图纸id
    gem_drawing_level:number;   // 图纸等级
    is_ts_drawing:number;       // 是否特殊图纸
    gem_drawing:any;            // 升级属性
    gem_level:number;           // 需要宝石等级
    color:number;               // 图纸品质显示
 }
 
class CfgDrawing {
    [key:string]:any;

    gem_drawing_id:number;    // 图纸id
    x_axle:number;            // X轴
    y_0:number;               // 构成 （x,0）
    y_1:number;               // 构成 （x,1）
    y_2:number;               // 构成 （x,2）
    y_3:number;               // 构成 （x,3）
    y_4:number;               // 构成 （x,4）
    y_5:number;               // 构成 （x,5）
    y_6:number;               // 构成 （x,6）
    y_7:number;               // 构成 （x,7）
    y_8:number;               // 构成 （x,8）
    y_9:number;               // 构成 （x,9）
 }

class CfgGem {
    [key:string]:any;

    gem_id:number;
    x_axle:number;
    y_0:number;               // 构成 （x,0）
    y_1:number;               // 构成 （x,1）
    y_2:number;               // 构成 （x,2）
    y_3:number;               // 构成 （x,3）
    y_4:number;               // 构成 （x,4）
    y_5:number;               // 构成 （x,5）
}

class CfgCompound {
    gem_type:number;          // 宝石类型
    level:number;             // 宝石等级
    need_gem_type:number;     // 需求合成宝石类型
    compound_num:number;      // 合成需要数量
    price:number;             // 购买货币
    price_count:number;       // 数量
}

export class CfgDrawingSet{
    id:number;
    name:string;
    gem_drawing_level:number;
    item_id_1:number;
    position_1:string;
    item_id_2:number;
    position_2:string;
    item_id_3:number;
    position_3:string;
    item_id_4:number;
    position_4:string;
    item_id_5:number;
    position_5:string;
    item_id_6:number;
    position_6:string;
}

class _CfgGemCfgData {
    drawing_up:CfgDrawingUp[];
    drawing:{[key:string]:CfgDrawing};
    gem:{[key:string]:CfgGem};
    compound:CfgCompound[];
    drawing_set:CfgDrawingSet[];
}

export let CfgGemCfgData: _CfgGemCfgData = null;

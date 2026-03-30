import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/wuxianzhanling_auto";

export function _CreateCfgWarOrder(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgWarOrderData = <_CfgWarOrderData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgWarOrderData);
        func(err == null);
    })
}

/**
 * 时间戳
 */
class CfgWarOrderReset_time {
    seq: number;
    reset_time: number;
}
/**
 * 等级奖励
 */
class CfgWarOrderGrade_reward {
    //时间戳索引
    time_seq: number;
    //开启角色等级
    open_level: number;
    //结束角色等级
    end_level: number;
    //索引
    seq: number;
    //激活经验
    open_exp: number;
    //激活等级
    open_grade: number;
    //普通道具
    ordinary_item:CfgItem[];
    //高级道具
    senior_item:CfgItem[];
}
/**
 * 每日任务
 */
class CfgWarOrderDailytask {
    time_seq:number;
    //开始等级
    grade_start:number;
    //结束等级
    grade_end:number;
    seq: number;
    //任务描述
    describe: string;
    //跳转
    open_panel: number;
    //任务类型
    type: number;
    //参数
    parameter: number;
    //激活经验
    open_exp: number;
}
/**
 * 每周任务
 */
class CfgWarOrderWeeklytasks {
    time_seq:number;
    //开始等级
    grade_start:number;
    //结束等级
    grade_end:number;
    seq: number;
    //任务描述
    describe: string;
    //跳转
    open_panel: number;
    //任务类型
    type: number;
    //参数
    parameter: number;
    //激活经验
    open_exp: number;
}
/**其他 */
class CfgWarOrderOther {
    //购买经验钻石消耗
    buy_exp: number;
    //购买进阶战令
    buy_senior: number;
    //战令最高等级
    grade_time: number;
    //消耗钻石活动经验
    get_experience: number;
}
/**奖励预览 1 = 普通奖励， 2= 进阶奖励 */
class CfgWarOrderItem_reward {
    seq: number;
    //开始等级
    grade_start: number;
    //结束等级
    grade_end: number;
    sort_seq: number;
    item_reward: CfgItem[];
}
class _CfgWarOrderData {
    reset_time: CfgWarOrderReset_time[];
    grade_reward: CfgWarOrderGrade_reward[];
    dailytask: CfgWarOrderDailytask[];
    weeklytasks: CfgWarOrderWeeklytasks[];
    other: CfgWarOrderOther[];
    item_reward: CfgWarOrderItem_reward[];
}



export let CfgWarOrderData: _CfgWarOrderData = null;
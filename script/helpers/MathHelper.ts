import { KeyFunction } from "modules/common/CommonType";

export let MathHelper: KeyFunction = {};

//获取保留小数点几位 不进行四合五入
MathHelper.PreciseDecimal = function (num: number, n: number): number {
    let decimal = Math.pow(10, n);
    return Math.floor(num * decimal) / decimal;
}


/**
 * 生成范围随机数
 * Min 最小值
 * Max 最大值
 */
MathHelper.GetRandomNum = function (Min: number, Max: number): number {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}
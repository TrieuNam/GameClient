
export enum CoreCrisisType{
    Mount = 1,//坐骑
    Angel = 2,//法阵
    Gem = 3,//宝石
    StarMap = 4,//星图
    Inscription = 5,//铭文
    ShenQi = 6,//神器
}

export var CoreSpCfg: {[key:string]:string} = {
    mark_1:"1ZuoQiZhiXin",
    mark_2:"3FaZhenZhiXin",
    mark_3:"2BaoShiZhiXin",
    mark_4:"5XingTuZhiXin",
    mark_5:"4FuWenZhiXin",
    mark_6:"6ShenQiZhiXin",
}

export var CoreNameSpCfg: {[key:string]:string} = {
    mark_1:"MingChen-ZuoQiZhiXin",
    mark_2:"MingChen-FaZhenZhiXin",
    mark_3:"MingChen-BaoShiZhiXin",
    mark_4:"MingChen-XingTuZhiXin",
    mark_5:"MingChen-MingWenZhiXin",
    mark_6:"MingChen-ShenQiZhiXin",
}


export var CoreIconSpCfg: {[key:string]:string} = {
    mark_1:"HuiZhang-ZuoQi",
    mark_2:"HuiZhang-FaZhen",
    mark_3:"HuiZhang-BaoShi",
    mark_4:"HuiZhang-XingTu",
    mark_5:"HuiZhang-MingWen",
    mark_6:"HuiZhang-ShenQi",
}

export var CoreCardSpCfg: {[key:string]:string} = {
    mark_1:"Ka-ZuoQi",
    mark_2:"Ka-FaZhen",
    mark_3:"Ka-BaoShi",
    mark_4:"Ka-XingTu",
    mark_5:"Ka-FuWen",
    mark_6:"Ka-ShenQi",
}

export var CoreWenZiSpCfg: {[key:string]:string} = {
    mark_1:"WenZi1",
    mark_2:"WenZi2",
    mark_3:"WenZi3",
    mark_4:"WenZi4",
    mark_5:"WenZi6",
    mark_6:"WenZi5",
}

//宝箱品质
export enum CoreCrisisBoxType{
    Normal = 0,
    Middle,
    High,
}

export let CoreCrisisChipToType :{[key:number]:CoreCrisisType}= {
    [40500] : CoreCrisisType.Mount,
    [40501] : CoreCrisisType.Angel,
    [40502] : CoreCrisisType.Gem,
    [40503] : CoreCrisisType.StarMap,
    [40504] : CoreCrisisType.Inscription,
    [40505] : CoreCrisisType.ShenQi,
}
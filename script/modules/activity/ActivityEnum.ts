import { Mod } from "modules/common/ModuleDefine"
import { LuckyGiftData } from "modules/LuckyGift.ts/LuckyGiftCtrl"
import { ActivityData } from "./ActivityData"
import { ActivityRandData } from "./ActivityRandData"

//活动状态
export enum ActStatusType {
    Close = 0,		// 活动未开启或关闭状态
    Standy = 1,     //活动准备状态
    Open = 2,       //活动进行中
    Finish = 3,     //活动已结束
}

//活动id
//活动id
export enum ACTIVITY_TYPE {
    BoxFund = 2049, //宝箱基金
    LevelFund = 2050, //等级基金
    CommodityGuild = 2051, //商品行会
    FirstCharge = 2052, //首充
    LeiChong = 2053, //累充
    DailyGift = 2054, //日常礼包
    MonthlyCard = 2055, //月卡
    LuckyGift = 2056,//幸运礼遇
    InviteFriend = 2057,//邀请好友
    WeekendRecharge = 2058,//周末累充
    CaveLoot = 2059,//洞穴夺宝
    BoxManor = 2060,//宝箱庄园
    ScoreFund = 2061,// 评分基金
    TodayShare = 2062,// 今日分享
    FaZhenGala = 2063,// 法阵盛典
    GuMoChengJiu = 2064,// 锢魔之塔成就
    InscripeChengJiu = 2065,// 铭文之塔成就
    StarMapGala = 2066,// 星图盛典
    ChaoZhiXianLi = 2067,// 超值献礼
    NewServerCompetition = 2068,// 新服比拼
    WeekHaoLi = 2069,//周末豪礼
    LianChongZengLi = 2070,//连充赠礼
    WarOrder = 2071,//无限战令
    WeekLianChong = 2072,//周末连充
    AdEquity = 2073,//广告权益
    ShenQiDuoBao = 2074,//神器夺宝
    TianXuanZhiLi = 2075, //天选之礼
    TerritoryGift = 2076,//领地礼包
    JiFenChouJiang = 2077, //积分转盘
    ShouChongDingZhi = 2078, //首充定制
    ZhuanShuLiBaoRuKou = 2079, //专属礼包
}

/**多个活动入口类型 */
export enum ACTIVITY_ENTER_TYPE {
    RAND = 0,
    DAILY = 1,
    OPEN_SERVER = 2,
    MORE = 3,
    LeiChong = 4,
    Right = 5,
}

//主界面活动mod_key对应的图标、名称、图标特效显示配置
export let MainActIconTitle: { [mod_key: number]: { origin_data?: any, func: Function } } = {
    [Mod.LuckyGift.View]: { origin_data: LuckyGiftData.Inst().ResultData, func: LuckyGiftData.Inst().ActIconTitleShow.bind(LuckyGiftData.Inst()) },
    [Mod.MoreServer.view]: { func: LuckyGiftData.Inst().GetMoreServerShow.bind(LuckyGiftData.Inst()) },
}

/**累充活动资源配置 */
export let LeiChongPanelRes: { [act_type: number]: string } = {
    [ACTIVITY_TYPE.LeiChong]: "PanelLeiChongYouLi", 
    [ACTIVITY_TYPE.LianChongZengLi]: "ContinuePresentView",  //[ACTIVITY_TYPE.LianChongZengLi]: "ContinuePresentView",  TianXuanZhiLiView
    [ACTIVITY_TYPE.TianXuanZhiLi]: "TianXuanZhiLiView",
    [ACTIVITY_TYPE.ShouChongDingZhi]: "ShouChongDingZhiView",
    // [21111]: "test", 
}

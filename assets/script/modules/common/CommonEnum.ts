//-----------------------------------------------------
// 游戏中的枚举
//-----------------------------------------------------
export enum ItemColor {
    None = 0,
    Grey = 1,
    Green = 2,
    Blue = 3,
    Purple = 4,
    Yellow = 5,
    Orange = 6,
    Red = 7,
    Pink = 8,
    Color = 9,
}

//图标类型
export enum ICON_TYPE {
    ITEM = 0,   //物品
    SKILL = 1,  //技能
    SUIT = 2,   //套装
    TITLE = 3,   //称号
    ACT = 4,    //活动
    Role = 5,   //头像
    Enter = 6, //入口
    KaoGu = 7,  //考古
    FaZhen = 8,  //法阵
    ShenQi = 9, //神器
}

export enum BagType {
    // EQUIP_ROLE = 1,         //角色装备
    // EQUIP_CHITA = 2,        //凶兽装备
    // EQUIP_FIT = 3,          //合体装备
    // EQUIP_PHANTOM = 4,      //幻灵装备
    // EQUIP_KING = 5,         //王者装备
    // ITEM = 6,               //道具
    // GEMSTONE = 7,           //宝石
    // ADVANCED = 8,           //进阶
    // PET = 9,                //宠物背包

    // XUNBAO = 9,             //次级背包--寻宝
}

// export enum BagSortType {
//     CAPABILITY = 0,        //战力
//     ITEMID = 1,            //道具id
// }

// export enum MailType {
//     NORMAL_MAIL = 1,       //普通邮件
//     ACTIVITY_MAIL = 2,     //活动邮件
// }

export enum TimeType {
    TIME_MINUTE_SECOND_NUM = 60,   //一分钟
    TIME_HOUR_SECOND_NUM = 3600,   //一小时
    TIME_DAY_SECOND_NUM = 86400,   //一天
    TIME_WEEK_SECOND_NUM = 604800  //一周
}

// 与ItemData all_item_config对应
export enum ITEM_BIG_TYPE {
    EQUIP = 0,
    OTHER = 1,
    EQUIP_SHILIAN = 2,
    EQUIP_ANGEL = 3,
    Gift = 4,
    GEM = 5,
    GEMDRAW = 6,
    WA_BAO = 7,
    TITLE_ITEM = 8,
    DEBRIS = 9,
    PET = 10,
    Inscription = 11,
    Harness = 13,
    Scroll = 14,
    BlockModel = 15,
    Block = 16,
}

// 装备部位 也是装备类型
export enum EQUIP_TYPE {
    INVALID = -1,   // 无效
    ER_HUAN = 0,    // 耳环
    XIANG_LIAN = 1, // 项链
    TOU_KUI = 2,    // 头盔  
    HU_WAN = 3,     // 护腕
    JIAN_BANG = 4,  // 肩膀
    KAI_JIA = 5,    // 铠甲
    YAO_DAI = 6,    // 腰带
    JIE_ZHI = 7,    // 戒指
    WU_QI = 8,      // 武器
    KU_ZI = 9,      // 裤子
    XIE_ZI = 10,    // 鞋子
    DUN_PAI = 11,   // 盾牌
    Max = 12,
}

export let ITEM_BIG_TYPE_SORT: { [key: number]: number } = {
    [0]: 4,
    [1]: 2,
    [2]: 1,
    [3]: 0,

    [4]: 8,
    [5]: 5,
    [6]: 11,
    [7]: 7,

    [8]: 10,
    [9]: 6,
    [10]: 3,
    [11]: 9,
}


// //货币类型
// export enum MoneyType {
//     Diamond = 0,    //钻石
//     Gold = 1,       //金币
// }

// //货币物品类型
// export let HuoBi: { [key: number]: number } = {
//     [MoneyType.Gold]: 40000,
//     [MoneyType.Diamond]: 40001,
// }

export enum CommonId {
    Gold = 40000,       //金币
    Diamond = 40001,    //钻石
    WaBaoTiLiItem = 40093, //挖宝体力道具
    WaBaoBoxUpItem = 40087, //挖宝升级藏品柜道具
    WaBaoUpItemId = 40088, //挖宝升级锄头道具
    WaBaoShuaXinItem = 40091,   //挖宝订单刷新消耗道具
    WanNengKa = 40692, //万能卡道具
    Box = 40004, //宝箱
    Horsewhip = 41100, //马鞭
    ShiLianCoin = 40065, //试炼币
}

export let CommonIdAdd: { [key: number]: boolean } = {
    [CommonId.WaBaoTiLiItem]: true,
    [CommonId.WaBaoBoxUpItem]: true,
    [CommonId.WaBaoUpItemId]: true,
    [CommonId.WaBaoShuaXinItem]: true,
    [CommonId.Horsewhip]: true,
}


// export enum SHOW_TYPE {
//     NORMAL = 0,  //普通道具
//     MATERIAL = 1, //材料
//     BOX = 2,     //宝箱  
// }

//SSR
// export enum SSR_TYPE {
//     SR = 0,
//     SSR = 1,
//     SSSR = 2,
//     KR = 3,
//     UR = 4,
//     FR = 5,
// }

// export let SSRName: { [key: number]: string } = {
//     [SSR_TYPE.SR]: "qulity_sr",
//     [SSR_TYPE.SSR]: "qulity_ssr",
//     [SSR_TYPE.SSSR]: "qulity_sssr",
//     [SSR_TYPE.KR]: "qulity_ur",
//     [SSR_TYPE.UR]: "qulity_kr",
//     [SSR_TYPE.FR]: "qulity_fr",
// }

// 玩家属性
export enum BATTLE_ATTR {
    BATTLE_ATTR_MIN = 0,
    HP,            // 生命 一般情况下， 生命值降为0时，战斗失败
    ATTACK,          // 攻击 提高造成的伤害
    ARMOR,          // 防御 减少受到的伤害
    SPEED,          // 速度 速度较高的玩家会在回合内先发起攻击
    TRUE_DAMAGE,      // 最终伤害 

    VAMPIRIC,        // 吸血//根据伤害，按吸血百分比回复自己生命//吸血量 = 造成的伤害 * （a吸血 - b忽视吸血）
    COUNTER,        // 反击//反击 : 被攻击时有概率立即发起攻击，可打断对方连击，被击晕时无法反击//反击率 = a反击 - b忽视反击
    COMBO,          // 连击//攻击时，有概率再次攻击，每次连击后概率都会衰减//连击率 = a连击 - b忽视连击
    EVASION,        // 闪避//有概率完全不受伤害
    CRITICAL,        // 暴击//攻击有概率攻击造成2倍伤害，暴击无法被闪避
    STUN,          // 击晕//攻击时有概率打晕对手，使其无法行动//击晕率 = a击晕 - b忽视击晕

    VAMPIRIC_IMMUNITY,    // 忽视吸血//减少对方的吸血百分比
    COUNTER_IMMUNITY,    // 忽视反击//减少对方的反击几率
    COMBO_IMMUNITY,      // 忽视连击//减少对方的连击几率
    EVASION_IMMUNITY,    // 忽视闪避//减少对方的闪避几率
    CRITICAL_IMMUNITY,    // 忽视暴击//减少对方的暴击几率
    STUN_IMMUNITY,      // 忽视击晕//减少对方的击晕几率

    TYRANNY,        // 暴虐//暴击伤害倍率增加，10%即为暴击造成2.1倍伤害
    BENEVOLENCE,      // 仁爱//仁爱 : 减少你受到暴击时的额外伤害，与对方的暴虐相互抵消
    MUDDY,          // 泥泞//减少对方速度//战斗开始生效，使对方变为当前速度*（1 - 泥泞）
    INTERDICTION,      // 禁疗//减少对方所有生命回复效果的百分比，到达100%时对方无法获得任何生命回复
    REJUVENATION,      // 回复//第五回合时，按最大生命值百分比回复生命
    BULLYING,        // 欺凌//对方生命低于50%时，造成额外伤害
    PILLAGE,        // 掠财//在竞技场获得更多金币
    GLADIATUS,        // 角斗士//增加可携带挑战券数量
    MONEY_ADD,  //装备出售金钱增加

    HP_PER, //生命万分比
    ATTACK_PER, //攻击万分比
    ARMOR_PER, //防御万分比
    SPEED_PER, //速度万分比
    BATTLE_ATTR_MAX,


    FISH_ATTR_1 = 101,
    FISH_ATTR_2 = 102,
    FISH_ATTR_3 = 103,
    FISH_ATTR_4 = 104,
    FISH_ATTR_5 = 105,
}

export let BATTLE_ATTR_CFG: { [key: string]: number } = {
    ["speed"]: BATTLE_ATTR.SPEED,
    ["hp"]: BATTLE_ATTR.HP,
    ["attack"]: BATTLE_ATTR.ATTACK,
    ["defense"]: BATTLE_ATTR.ARMOR,

    ["xixue"]: BATTLE_ATTR.VAMPIRIC,
    ["fanji"]: BATTLE_ATTR.COUNTER,
    ["lianji"]: BATTLE_ATTR.COMBO,
    ["shanbi"]: BATTLE_ATTR.EVASION,
    ["baoji"]: BATTLE_ATTR.CRITICAL,
    ["jiyun"]: BATTLE_ATTR.STUN,

    ["de_xixue"]: BATTLE_ATTR.VAMPIRIC_IMMUNITY,
    ["de_fanji"]: BATTLE_ATTR.COUNTER_IMMUNITY,
    ["de_lianji"]: BATTLE_ATTR.COMBO_IMMUNITY,
    ["de_shanbi"]: BATTLE_ATTR.EVASION_IMMUNITY,
    ["de_baoji"]: BATTLE_ATTR.CRITICAL_IMMUNITY,
    ["de_jiyun"]: BATTLE_ATTR.STUN_IMMUNITY,
}

export let IsPercent: { [key: number]: boolean } = {
    [BATTLE_ATTR.TRUE_DAMAGE]: true,
    [BATTLE_ATTR.VAMPIRIC]: true,
    [BATTLE_ATTR.COUNTER]: true,
    [BATTLE_ATTR.COMBO]: true,
    [BATTLE_ATTR.EVASION]: true,
    [BATTLE_ATTR.CRITICAL]: true,
    [BATTLE_ATTR.STUN]: true,

    [BATTLE_ATTR.VAMPIRIC_IMMUNITY]: true,
    [BATTLE_ATTR.COUNTER_IMMUNITY]: true,
    [BATTLE_ATTR.COMBO_IMMUNITY]: true,
    [BATTLE_ATTR.EVASION_IMMUNITY]: true,
    [BATTLE_ATTR.CRITICAL_IMMUNITY]: true,
    [BATTLE_ATTR.STUN_IMMUNITY]: true,

    [BATTLE_ATTR.TYRANNY]: true,
    [BATTLE_ATTR.BENEVOLENCE]: true,
    [BATTLE_ATTR.MUDDY]: true,
    [BATTLE_ATTR.INTERDICTION]: true,
    [BATTLE_ATTR.REJUVENATION]: true,
    [BATTLE_ATTR.BULLYING]: true,
    [BATTLE_ATTR.PILLAGE]: true,
    [BATTLE_ATTR.MONEY_ADD]: true,
    [BATTLE_ATTR.HP_PER]: true,
    [BATTLE_ATTR.ATTACK_PER]: true,
    [BATTLE_ATTR.ARMOR_PER]: true,
    [BATTLE_ATTR.SPEED_PER]: true,
    [BATTLE_ATTR.FISH_ATTR_1]: true,
    [BATTLE_ATTR.FISH_ATTR_2]: true,
    [BATTLE_ATTR.FISH_ATTR_3]: true,
    [BATTLE_ATTR.FISH_ATTR_4]: true,
    [BATTLE_ATTR.FISH_ATTR_5]: true,
}

export let AttrTypeForName: { [key: string]: number } = {
    // ["gongji"]: BATTLE_ATTR.ATTACK,
    // ["fangyu"]: BATTLE_ATTR.DEFENSE,
    // ["maxhp"]: BATTLE_ATTR.MAX_HP,
    // ["speed"]: BATTLE_ATTR.SPEED,
    // ["extra_real_damage"]: BATTLE_ATTR.EXTRA_REAL_DAMAGE,
    // ["hit"]: BATTLE_ATTR.HIT,
    // ["dodge"]: BATTLE_ATTR.DODGE,
    // ["crit"]: BATTLE_ATTR.CRIT,
    // ["anti_crit"]: BATTLE_ATTR.ANTI_CRIT,
    // ["proportion_fairy_hit"]: BATTLE_ATTR.PROPORTION_FAIRY_HIT,
    // ["proportion_anti_fairy_hit"]: BATTLE_ATTR.PROPORTION_ANTI_FAIRY_HIT,

    // ["ignore_defense"]: BATTLE_ATTR.IGNORE_DEFENSE,
    // ["dec_ignore_defense"]: BATTLE_ATTR.DEC_IGNORE_DEFENSE,
    // ["inc_damage"]: BATTLE_ATTR.INC_DAMAGE,
    // ["dec_damage"]: BATTLE_ATTR.DEC_DAMAGE,
    // ["inc_crit_damage"]: BATTLE_ATTR.INC_CRIT_DAMAGE,
    // ["dec_crit_damgae"]: BATTLE_ATTR.DEC_CRIT_DAMGAE,

    // ["proportion_fatal_blow"]: BATTLE_ATTR.PROPORTION_FATAL_BLOW,
    // ["proportion_anti_fatal_blow"]: BATTLE_ATTR.PROPORTION_ANTI_FATAL_BLOW,
    // ["proportion_pvp_inc_damage"]: BATTLE_ATTR.PROPORTION_PVP_INC_DAMAGE,
    // ["proportion_pvp_dec_damage"]: BATTLE_ATTR.PROPORTION_PVP_DEC_DAMAGE,
    // ["proportion_pve_inc_damage"]: BATTLE_ATTR.PROPORTION_PVE_INC_DAMAGE,
    // ["proportion_pve_dec_damage"]: BATTLE_ATTR.PROPORTION_PVE_DEC_DAMAGE,

    // ["element_gold_attack"]: BATTLE_ATTR.ELEMENT_GOLD_ATTACK,
    // ["element_gold_defense"]: BATTLE_ATTR.ELEMENT_GOLD_DEFENSE,
    // ["element_wood_attack"]: BATTLE_ATTR.ELEMENT_WOOD_ATTACK,
    // ["element_wood_defense"]: BATTLE_ATTR.ELEMENT_WOOD_DEFENSE,
    // ["element_water_attack"]: BATTLE_ATTR.ELEMENT_WATER_ATTACK,
    // ["element_water_defense"]: BATTLE_ATTR.ELEMENT_WATER_DEFENSE,
    // ["element_fire_attack"]: BATTLE_ATTR.ELEMENT_FIRE_ATTACK,
    // ["element_fire_defense"]: BATTLE_ATTR.ELEMENT_FIRE_DEFENSE,
    // ["element_earth_attack"]: BATTLE_ATTR.ELEMENT_EARTH_ATTACK,
    // ["element_earth_defense"]: BATTLE_ATTR.ELEMENT_EARTH_DEFENSE,

    // ["element_gold_attack_inc_damage"]: BATTLE_ATTR.ELEMENT_GOLD_ATTACK_INC_DAMAGE,
    // ["element_gold_defense_dec_damage"]: BATTLE_ATTR.ELEMENT_GOLD_DEFENSE_DEC_DAMAGE,
    // ["element_wood_attack_inc_damage"]: BATTLE_ATTR.ELEMENT_WOOD_ATTACK_INC_DAMAGE,
    // ["element_wood_defense_dec_damage"]: BATTLE_ATTR.ELEMENT_WOOD_DEFENSE_DEC_DAMAGE,
    // ["element_water_attack_inc_damage"]: BATTLE_ATTR.ELEMENT_WATER_ATTACK_INC_DAMAGE,
    // ["element_water_defense_dec_damage"]: BATTLE_ATTR.ELEMENT_WATER_DEFENSE_DEC_DAMAGE,
    // ["element_fire_attack_inc_damage"]: BATTLE_ATTR.ELEMENT_FIRE_ATTACK_INC_DAMAGE,
    // ["element_fire_defense_dec_damage"]: BATTLE_ATTR.ELEMENT_FIRE_DEFENSE_DEC_DAMAGE,
    // ["element_earth_attack_inc_damage"]: BATTLE_ATTR.ELEMENT_EARTH_ATTACK_INC_DAMAGE,
    // ["element_earth_defense_dec_damage"]: BATTLE_ATTR.ELEMENT_EARTH_DEFENSE_DEC_DAMAGE,

    // ["element_all_attack"]: BATTLE_ATTR.ELEMENT_ALL_ATTACK,
    // ["element_all_defense"]: BATTLE_ATTR.ELEMENT_ALL_DEFENSE,
    // ["element_all_attack_inc_damage"]: BATTLE_ATTR.ELEMENT_ALL_ATTACK_INC_DAMAGE,
    // ["element_all_defnese_dec_damage"]: BATTLE_ATTR.ELEMENT_ALL_DEFNESE_DEC_DAMAGE,

    // ["proportion_real_hit"]: BATTLE_ATTR.PROPORTION_REAL_HIT,
    // ["proportion_real_crit"]: BATTLE_ATTR.PROPORTION_REAL_CRIT,
}

export let AttrNameForType: { [key: number]: string } = {
    // [BATTLE_ATTR.MAX_HP]:"maxhp",
    // [BATTLE_ATTR.ATTACK]:"gongji",
    // [BATTLE_ATTR.DEFENSE]:"fangyu",
}

export let RoleBaseConfig: { [key: string]: number } = {
    // ["maxhp"]: BATTLE_ATTR.MAX_HP,//生命
    // ["gongji"]: BATTLE_ATTR.ATTACK,//攻击
    // ["fangyu"]: BATTLE_ATTR.DEFENSE,//防御
}

export let ItemEquipBaseConfig: { [key: string]: number } = {
    // ["blood"]: BATTLE_ATTR.MAX_HP,
    // ["attack"]: BATTLE_ATTR.ATTACK,
    // ["defense"]: BATTLE_ATTR.DEFENSE,
}

export enum CARD_TYPE {
    CARD_FAIRY = 1,         //七仙女
    CARD_BEAUTY = 2,        //十二美人
    CARD_SHENQI = 3,          //十大神器
    CARD_SHENSHOU = 4,      //十二神兽
}

export enum ITEM_CHANGE_NOTICE_REASON {
    DATE_CHANGE = 0,        //数据改变
    PUT = 1,                //外部活动
    CONSUME = 2,            //内部消耗
    MOVE = 3,               //内部转移
    SEND = 4,               //数据通知
}

export enum ATLASEXT {
    ".atlas",
    ".png",
    ".skel",
}

export enum BATTLE_STATE_DATA {
    SIDEROLE = 3,
}

export enum RANK_TYPE {
    init = 0,
    TRIAL = 1,//试炼之塔
    Arena = 2,//竞技场
    EscortScore = 3,//护送积分
    InterceptScore = 4,//拦截积分

    BiPinGuMo = 6,
    BiPinMaoXian = 7,
    BiPinChongWu = 8,
    BiPinFaZhen = 9,
    BiPinXingTu = 10,
    BiPinZuoJi = 11,
    BiPinShiZhuang = 12,
    BiPinFaZhenZhuangBei = 13,
    BiPinJingJiChang = 14,
    BiPinDengJi = 15,

    CrossArena = 16,   // 跨服竞技场
}


export let ExtraItemIcon: { [item_id: number]: { min: number, max: number, icon: string }[] } = {
    [CommonId.Gold]: [
        { min: 0, max: 2999, icon: "40000" },
        { min: 3000, max: 9999, icon: "40000_2" },
        { min: 10000, max: 19999, icon: "40000_3" },
        { min: 20000, max: 39999, icon: "40000_4" },
        { min: 40000, max: 99999, icon: "40000_5" },
        { min: 100000, max: 0, icon: "40000_6" }
    ],
    [CommonId.Diamond]: [
        { min: 0, max: 9, icon: "40001" },
        { min: 10, max: 49, icon: "40001_2" },
        { min: 50, max: 99, icon: "40001_3" },
        { min: 100, max: 299, icon: "40001_4" },
        { min: 300, max: 599, icon: "40001_5" },
        { min: 600, max: 0, icon: "40001_6" }
    ],
}

export enum ROLE_SETTING_TYPE {
    SettingMusic = 0,      //音乐
    SettingAudio = 1,      //音效
    SettingVibrate = 2,      //音效
    NoticeEscortFinish = 10,    //护送商船完成
    NoticeBoxUpReduceTime = 11, //宝箱升级可减少时间
    NoticeBoxUpFinish = 12,     //宝箱升级完成
    NoticeBoxAutoFinish = 13,   //自动开箱
    NoticeArenaCalc = 14,       //竞技场结算
    NoticeFishEnergyMax = 15,   //考古体力已满
    NoticeTrialCalc = 16,       //试炼之塔结算
    NoticeGuMoReward = 17,      //锢魔之塔奖励
    NoticeFishAutoFinish = 18,  //自动挖宝条件达成
    NoticeLoopMineFree = 19,    //夺宝免费次数已满
    NoticeMountForageMax = 20,  //坐骑探索粮草已满
    TerritoryBeRobbed = 21,        //领地资源被抢
    TerritoryRobBedef = 22,     //领地抢夺资源遭到抵抗
    Max = 60,
}

export enum AdType {
    daily = 1,          //每日福利
    box_speed_up = 2,   //宝箱升级加速卷福利
    fish_speed_up = 3,  //藏品升级加速
    // inscription_tower_draw = 4, //铭文转盘抽奖次数
    weekend_rechagre = 5,   //周末累充增加额度
    canvas_ling = 6,    //送夺宝令
    today_share_twice = 7, // 本日分享双倍
    knight_card = 8,    //骑士之证
    pet_draw = 9,         //宠物抽奖
    level_fun = 10,     //等级基金 --暂无
    box_fun = 11,     //宝箱基金 --暂无
    box_choujiang = 12,  //宝箱抽奖
    daily_free_gift = 13,  //日常免费礼包
    inscription_tower_draw = 14,//铭文宝箱抽奖
    territory_refresh = 15,//领地刷新
}

export let CheckSeqAdCard: { [key: number]: boolean } = {
    [AdType.box_speed_up]: true,
    [AdType.fish_speed_up]: true,
    [AdType.weekend_rechagre]: true,
}
//开放域发送信息结构
export class OPEM_PARAM {
    public type: string
    public event: string
    public value: any
    public strValue: string
    public numValue: number
}

export enum msgType {
    void = "void",
    openid = "openid",
    score = "score",
    draw = "draw",
    setScore = "setScore",
    getScore = "getScore",
    friendScore = "friendScore",
    level = "level",
    //引擎部分命令
    clear = "clear",
    destroyAll = "destroyAll",
    off = "off",
    on = "on",
    emit = "emit",
    once = "once",
    bindEvents = "bindEvents",
    eventHandler = "eventHandler",
    repaint = "repaint",
    initRepaint = "initRepaint"
}
export enum msgEvent {
    void = "void"
}

export enum CmdToClientCmd {
    update = 1
}

export enum ERRORCODE {
    /**sdk登录失败 */
    err1 = 1,
    /**登录界面报错 */
    err2 = 2,
}
import { ArenaData } from "modules/Arena/ArenaData";
import { FightAccountDamage } from "modules/common_account/FightAccountDamage";
import { FightPvPFailView } from "modules/common_account/FightPvPFailView";
import { FightPvPWinView } from "modules/common_account/FightPvPWinView";
import { PeakArenaData } from "modules/PeakArena/PeakArenaData";


/**战斗事件类型 */
export enum ENUM_BATTLE_EVENT {
    /** 回合开始 1
     * @param p1 回合数             */
    ROUND_BEGIN = 1,

    /** 对象信息 2
     * @param p1：位置 @param p2 类型 @param p3 id */
    CHARACTER_INFO = 2,

    /** 技能 3
     * @param p1 位置 @param p2 技能id */
    SKILL = 3,

    /** 被动 4
     * @param p1 位置 @param p2 技能id @param p3 0:结束 1:开始 */
    PASSIVE = 4,

    /** 收到伤害 5
     * @param p1 位置 @param p2 伤害 @param p3 是否爆击 @param p4 来源 */
    INJURED = 5,

    /** 获得护盾 6
     * @param p1 位置 @param p2 护盾值 @param p3 来源 */
    ADD_SHIELD = 6,

    /** 血量变化 7
     * @param p1 位置 @param p2 血量 @param p3 最大血量 @param p4 护盾 */
    HP_CHANGE = 7,

    /** 回合结束 8
     * */
    ROUND_END = 8,

    /** 战斗结束 9
     * @param p1 结果 */
    FIGHT_OVER = 9,

    /** 奖励 10
     * @param p1 物品id @param p2 物品数量 */
    REWARD = 10,

    /** 获得buff 11
     * @param p1 位置 @param p2 buff类型 @param p3 buff参数 @param p4 0:失去buff 1:获得buff  */
    ADD_BUFF = 11,

    /** 触发无敌 12
     * @param p1 位置 */
    IMMUNE_DAMAGE = 12,

    /** 角色外观 13
     * @param p1 位置 @param p2 武器 @param p3 盾牌 @param p4 盔甲 @param p5 头盔 */
    ROLE_APPEARANCE_1 = 13,

    /** 角色外观 14
     * @param p1 位置 @param p2 坐骑 @param p2 法阵*/
    ROLE_APPEARANCE_2 = 14,

    /** 操作开始 15
     * @param p1 位置 @param p2 1：开始 0：结束 */
    EVENT_ATTACK = 15,

    /** 宠物皮肤 16
     * @param p1 位置 @param p2 ID */
    EVENT_PET_CLOTH = 16,

    /** 宠物特效结束 17
    * @param p1 位置 @param p2 ID @param p3*/
    EVENT_PASSIVE_EFFECT = 17,

    /** 复活 999
     * @param p1 位置 @param p2 1：开始 0：结束 */
    EVENT_ALIVE = 999,
}

export var ENUM_BATTLE_STATE = {
    speed: 2,
}

export enum ENUM_BATTLE_EVENT_ATTACK {
    NORMAL = 0,
    FANJI = 1,
    LIANJI = 2,
    /**重击 */
    THUMP = 3,
}

/**战斗结果类型 */
export enum ENUM_BATTLE_END {
    WIN = 1,
    LOSE = 2,
    OVERTIME = 3,
}

/**战斗角色类型 */
export enum ENUM_BATTLE_CHARACTER {
    /**主角 */
    ROLE = 0,
    /**怪物 */
    MONSTER,
    /**宠物 */
    PET,
}

export type TYPE_BATTLE_TARGET = {
    name: string;
    p1?: string;
}

/**战斗基础配置 */
export type TYPE_BATTLE_INFO = {
    readonly isPvP?: Boolean,
    resultView?: (new () => any)[/**0:win 1:fail */];
    target?: () => any;
    /**战斗 协议号 */
    readonly proto: new () => any,
}

//--------------------------新增战斗必须配置--------------------------

/**战斗类型 */
export enum ENUM_BATTLE {
    /**战役      common_pve */
    HERO_BATTLE_TYPE_MAIN_FB = 0,
    /**竞技场      common_pvp */
    HERO_BATTLE_TYPE_PVP = 1,
    /**领主      common_pve */
    HERO_BATTLE_TYPE_LINGZHU = 2,
    /**试炼之塔      common_pve */
    HERO_BATTLE_TYPE_SHI_LIAN_PAGODA = 3,
    /**锢魔之塔      common_pve */
    HERO_BATTLE_TYPE_GU_MO_PAGODA = 4,
    /* 护送拦截 */
    ESCORT_INTERCEPT = 5,
    /**铭文之塔      common_pve */
    HERO_BATTLE_TYPE_INSCRIPTION_TOWER = 7,

    /* 测试GM */
    TEST = 6,
    /**幽灵船 */
    ESCORT_BOSS = 8,
    /* 跨服竞技场 */
    CROSS_ARENA = 9,
    /* 宠物守护挑战 */
    PET_FB = 10,
    /* 公会BOSS */
    GUILD_BOSS = 11,
}

/**战斗基础配置 */
export const BATTLE_INFO: { [key: number]: TYPE_BATTLE_INFO } = {}
export const BATTLE_INFO_INIT = () => {
    BATTLE_INFO[ENUM_BATTLE.HERO_BATTLE_TYPE_MAIN_FB] =
        { proto: PB_CSMainFbReq };
    BATTLE_INFO[ENUM_BATTLE.HERO_BATTLE_TYPE_PVP] =
    {
        proto: PB_CSArenaReq,
        isPvP: true,
        target: () => {
            let data = ArenaData.Inst().sel_data;
            return data
        },
        resultView: [FightPvPWinView, FightPvPFailView],
    };
    BATTLE_INFO[ENUM_BATTLE.HERO_BATTLE_TYPE_LINGZHU] =
        { proto: PB_CSLingZhuReq };
    BATTLE_INFO[ENUM_BATTLE.HERO_BATTLE_TYPE_SHI_LIAN_PAGODA] =
        { proto: PB_CSShiLianPagodaReq };
    BATTLE_INFO[ENUM_BATTLE.HERO_BATTLE_TYPE_GU_MO_PAGODA] =
        { proto: PB_CSGuMoPagodaReq };
    BATTLE_INFO[ENUM_BATTLE.HERO_BATTLE_TYPE_INSCRIPTION_TOWER] =
        { proto: PB_CSRuneReq };
    BATTLE_INFO[ENUM_BATTLE.ESCORT_INTERCEPT] =
        { proto: PB_CSEscortReq, isPvP: true };
    BATTLE_INFO[ENUM_BATTLE.TEST] =
        { proto: undefined };
    BATTLE_INFO[ENUM_BATTLE.ESCORT_BOSS] =
        { proto: PB_CSEscortReq, isPvP: false, resultView: [FightAccountDamage, FightAccountDamage], };
    BATTLE_INFO[ENUM_BATTLE.CROSS_ARENA] =
    {
        proto: PB_CSCrossArenaReq,
        isPvP: true,
        target: () => {
            let data = PeakArenaData.Inst().sel_data;
            return data
        },
        resultView: [FightPvPWinView, FightPvPFailView],
    };
    BATTLE_INFO[ENUM_BATTLE.PET_FB] =
        { proto: PB_CSPetFbReq, isPvP: false, };
    BATTLE_INFO[ENUM_BATTLE.GUILD_BOSS] =
        { proto: PB_CSGuildReq, isPvP: false, };
}

//----------------------end 新增战斗必须配置 end----------------------


/**战斗伤害飘字类型 */
export enum ENUM_BATTLE_FONT {
    /**普通 */
    N = "BattleFont-N",
    /**爆击 */
    K = "BattleFont-K",
    /**回血 */
    A = "BattleFont-A",
    /**反击 */
    F = "f",
    /**连击 */
    L = "l",
    /**闪避 */
    S = "s",
    /**重击 */
    Z = "z",
}

export enum ENUM_BATTLE_BUFF {
    BUFF_TYPE_MIN = 0,

    BUFF_TYPE_CHANGE_ATTR = 1,    // 改变属性      参数对应属性枚举 +为加属性 -为减属性
    BUFF_TYPE_STUN = 2,        // 眩晕
    BUFF_TYPE_DOT = 3,        // 普通的持续伤害  1为持续回血 -1为持续掉血

    BUFF_TYPE_INC_DAMAGE = 4,    // +-自身造成伤害  +为自身伤害up -down
    BUFF_TYPE_DEC_DAMAGE = 5,    // +-自身受到伤害  +为自身受到伤害down -up

    BUFF_TYPE_IMMUNE_DAMAGE = 6,  //免疫伤害

    BUFF_TYPE_MAX,
}

export enum BATTLE_STATE {
    LOAD = 0,
    PLAY = 1,
    END = 2,
}
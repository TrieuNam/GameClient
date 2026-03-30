import { ViewManager } from "manager/ViewManager";
import { BoxDrawData } from "modules/BoxDraw/BoxDrawData";
import { CoreCrisisBoxData } from 'modules/CoreCrisisBox/CoreCrisisBoxData';
import { PetData } from 'modules/Pet/PetData';
import { BlockData } from "modules/block/BlockData";
import { BoxData } from "modules/box/BoxData";
import { ITEM_BIG_TYPE } from "modules/common/CommonEnum";
import { CommonRewardView } from "modules/common_account/CommonRewardView";
import { GemOnceGetView } from 'modules/common_account/GemOnceGetView';
import { GemAtelierData } from 'modules/gem_atelier/GemAtelierData';
import { InscriptionData } from 'modules/inscription/InscriptionData';
import { LoopMineData } from "modules/loopmine/LoopMineData";
import { MountData } from "modules/mount/MountData";
import { Item } from "./ItemData";

export enum GET_TYPE {
    common = 0,                //!< 0 无效

    PUT_REASON_NO_NOTICE = 1,              //!< 不通知
    PUT_REASON_GM = 2,                  //!< GM
    PUT_REASON_MAIN_FB = 3,                //!< 冒险
    PUT_REASON_LING_ZHU = 4,              //!< 领主
    PUT_REASON_SHI_LIAN_PAGODA = 5,            //!< 试炼之塔
    PUT_REASON_BOX_SELL = 6,              //!< 宝箱装备出售
    PUT_REASON_SHOP = 7,                //!<商城购买

    PUT_REASON_DUO_BAO_DRAW_PRIMIRY = 21,  // 夺宝初级抽奖
    PUT_REASON_DUO_BAO_DRAW_SENIOR = 22,  // 夺宝高级抽奖

    PUT_REASON_DEBRIS_ITEM = 33,          // 碎片合成
    PUT_REASON_BOX = 36,          // 宝箱下发的挑战券
    PUT_REASON_INSCRIPTION_TURNTABLE = 58, // 铭文转盘
    PUT_REASON_BOX_ENCHANT = 79,        //宝箱装备分解
    PET_PET_TREASURE = 89,//宠物宝箱抽奖 
    PET_GEM_ONCE = 92,//宠物宝石一键合成
    PUT_REASON_CORECRISIS_BOX = 93,//限制核心宝箱获取
    OPEN_BOX_SHI_ZHUANG = 64,  //开箱子随机获得时装
    BOX_FIXED_SHI_ZHUANG = 95,  //开箱子固定获得时装
    PUT_REASON_GEM_BUY = 103,   // 宝石系统一键购买宝石
    PUT_REASON_INSCRIPTION_BOX = 111,   // 铭文宝箱抽奖
    PUT_REASON_MAX,                    // 最大原因

    PUT_REASON_CUSTOM_BLOCK = 1000,     //自定义积木

}
export enum PUT_REASON_TYPE {
    PUT_REASON_INVALID = 0,								//!< 0 无效

    PUT_REASON_NO_NOTICE = 1,							//!< 不通知
    PUT_REASON_GM = 2,									//!< GM
    PUT_REASON_MAIN_FB = 3,								//!< 冒险
    PUT_REASON_LING_ZHU = 4,							//!< 领主
    PUT_REASON_SHI_LIAN_PAGODA = 5,						//!< 试炼之塔
    PUT_REASON_BOX_SELL = 6,							//!< 宝箱装备出售
    PUT_REASON_SHOP = 7,								//!< 市集购买
    PUT_REASON_GU_MO_PAGODA = 8,						//!< 锢魔之塔
    PUT_REASON_KNIGHTS = 9,								//!< 骑士手册等级奖励
    PUT_REASON_MESTERY_SHP = 10,						//!< 神秘商店
    PUT_REASON_MOUNT_EXPLORE = 11,						//!< 坐骑探索
    PUT_REASON_STAR_MAP_UP = 12,						//!< 星图升级
    PUT_REASON_STAR_MAP_RESET = 13,						//!< 星图重置
    PUT_REASON_TASK_REWARD = 14,						//!< 任务奖励
    PUT_REASON_WA_BAO_ITEM_SELL = 15,					//!< 挖宝出售
    PUT_REASON_WA_BAO_TI_LI = 16,						//!< 挖宝恢复体力
    PUT_REASON_WA_BAO_TASK_FETCH = 17,					//!< 挖宝领取订单奖励
    PUT_REASON_ARENA_FIGHT = 18,						//!< 竞技场战斗
    PUT_REASON_ARENA_WEEK_BOX = 19,						//!< 竞技场每周宝箱
    PUT_REASON_ARENA_RANK_REWARD = 20,					//!< 竞技场排行榜奖励
    PUT_REASON_DUO_BAO_DRAW_PRIMIRY = 21,				//!< 夺宝初级抽奖
    PUT_REASON_DUO_BAO_DRAW_SENIOR = 22,				//!< 夺宝高级抽奖
    PUT_REASON_DUO_BAO_INTEGRAL = 23,					//!< 夺宝积分奖励
    PUT_REASON_PET_GEM_TAKE_OFF = 24,					//!< 宠物宝石脱下
    PUT_REASON_PET_GEM_LEVEL_UP = 25,					//!< 宠物宝石升级
    PUT_REASON_GEM_REMOVE = 26,							//!< 卸下宝石
    PUT_REASON_GEM_COMPOST = 27,						//!< 宝石合成
    PUT_REASON_CHONG_ZHI = 28,							//!< 充值
    PUT_REASON_ESCORT = 29,								//!< 护送
    PUT_REASON_CMD_BUY = 30,							//!< 直购
    PUT_REASON_RA_BOX_FUND = 31,						//!< 宝箱基金
    PUT_REASON_RA_LEVEL_FUND = 32,						//!< 等级基金
    PUT_REASON_DEBRIS_ITEM = 33,						//!< 碎片合成
    PUT_REASON_RA_COMMODITY_GUILD = 34,					//!< 商品行会
    PUT_REASON_GIFT_ITEM = 35,							//!< 礼包物品
    PUT_REASON_OPEN_BOX_GET_ARENE = 36,					//!< 开箱子获得挑战券
    PUT_REASON_RA_FIRST_CHONG = 37,						//!< 首充活动
    PUT_REASON_RA_LEI_CHONG = 38,						//!< 累充活动
    PUT_REASON_RA_DAILY_GIFT_CMD = 39,					//!< 日常礼包直购
    PUT_REASON_RA_DAILY_GIFT = 40,						//!< 日常礼包购买
    PUT_REASON_SEVEN_DAS_SIGN = 41,						//!< 新服狂欢-七日登录
    PUT_REASON_LUCK_UNPACKING = 42,						//!< 新服狂欢-开箱大吉
    PUT_REASON_NEW_AREA_PREFERENTIAL = 43,				//!< 新服狂欢-新服特惠
    PUT_REASON_MARKET_SHOP = 44,						//!< 新服狂欢-集市商店
    PUT_REASON_MONTH_CARD_BUY = 45,						//!< 月卡购买奖励
    PUT_REASON_MONTH_CARD_DAILY = 46,					//!< 月卡每日奖励
    PUT_REASON_ADVERTISEMENT = 47,						//!< 广告
    PUT_REASON_LUCK_COURTESY = 48,						//!< 随机活动-幸运礼遇
    PUT_REASON_FRIEND = 49,								//!< 随机活动-邀请好友
    PUT_REASON_WEEKEND_RECHARGE = 50,					//!< 随机活动-周末累充
    PUT_REASON_CAVE_LOOT = 51,							//!< 随机活动-洞穴夺宝
    PUT_REASON_CAVE_LOOT_LOTTERY = 52,					//!< 随机活动-洞穴夺宝抽奖
    PUT_REASON_CHEST_MANOR = 53,						//!< 随机活动-宝箱庄园
    PUT_REASON_SERVER_MAIL = 54,						//!< 全服邮箱
    PUT_REASON_EQUIP_BAG_SELL = 55,						//!< 装备背包出售
    PUT_REASON_WA_BAO_COLLECTION_BOOK = 56,				//!< 挖宝放入收藏品图鉴
    PUT_REASON_RA_DAILY_SHARING = 57,					//!< 随机活动-每日分享
    PUT_REASON_RUNE_TOWER_TURNTABLE = 58,				//!< 符文塔转盘
    PUT_REASON_RUNE_DECOMPOSE = 59,						//!< 符文分解
    PUT_REASON_RA_FA_ZHEN_GALA = 60,					//!< 法阵盛典
    PUT_REASON_ESCORT_BOSS = 61,						//!< 幽灵船
    PUT_REASON_RA_CAPACITY_FUND = 62,					//!< 评分基金
    PUT_REASON_COST_PET = 63,							//!< 分解宠物
    PUT_REASON_OPEN_BOX_GET_SHI_ZHUANG = 64,			//!< 开箱子获得时装
    PUT_REASON_KNIGHTS_REISSUE = 65,					//!< 补发骑士手册等级奖励
    PUT_REASON_RA_GUMO_TOWER_FUND = 66,					//!< 锢魔之塔-成就奖励
    PUT_REASON_RA_RUNE_TOWER_FUND = 67,					//!< 铭文之塔-成就奖励
    PUT_REASON_RA_STAR_MAP_GALA = 68,					//!< 星图盛典
    PUT_REASON_RA_CHAO_ZHI_XIAN_LI = 69,				//!< 超值献礼
    PUT_REASON_RA_NEW_SERVER = 70,						//!< 随机活动-新服比拼
    PUT_REASON_RA_WEEKEND_HAO_LI = 71,					//!< 随机活动-周末豪礼
    PUT_REASON_RA_LIAN_CHONG_ZENG_LI = 72,				//!< 随机活动-连充赠礼
    PUT_REASON_RA_WAR_ORDER = 73,						//!< 无限战令
    PUT_REASON_RA_WEEKEND_LIAN_CHONG = 74,				//!< 随机活动-周末连充
    PUT_REASON_RA_ADVERTISEMENT_EQUITY = 75,			//!< 随机活动-广告权益（骑士福利）
    PUT_REASON_TERRITORY_REWARD = 76,					//!< 领地
    PUT_REASON_MOUNT_RESET = 77,						//!< 坐骑回退
    PUT_REASON_FU_MO_TRANSFORM = 78,					//!< 装备附魔材料转换
    PUT_REASON_BOX_DECOMPOSE = 79,						//!< 宝箱装备分解
    PUT_REASON_SHEN_QI_DRAW = 80,						//!< 神器抽奖
    PUT_REASON_SHI_ZHUANG_RESET = 81,					//!< 时装回退
    PUT_REASON_AGNLE_RESET = 82,						//!< 法阵回退
    PUT_REASON_GEM_TRANSFORM = 83,						//!< 宝石转换
    PUT_REASON_GEM_LEVEL_UP = 84,						//!< 宝石升级
    PUT_REASON_MAIN_FB_FETCH_GAU_JI = 85,				//!< 冒险挂机领取
    PUT_REASON_MAIN_FB_FETCH_GAU_JI_QUICK = 86,			//!< 冒险挂机快速领取
    PUT_REASON_CROSS_ARENA_RANK_REWARD = 87,			//!< 跨服竞技场排行榜奖励
    PUT_REASON_BOX_LEVEL_REWRAD = 88,					//!< 宝箱等级奖励
    PUT_REASON_PET_TREASURE = 89,						//!< 宠物抽奖
    PUT_REASON_GEM_ONEKEY_LEVEL_UP = 90,				//!< 宝石一键升级
    PUT_REASON_RA_CAP_FUND_RESET = 91,					//!< 战力比拼补偿
    PUT_REASON_PET_GEM_ONEKEY_LEVEL_UP = 92,			//!< 宠物宝石一键升级
    PUT_REASON_LIMIT_CORE_BOX = 93,						//!< 限制核心抽奖
    PUT_REASON_CROSS_ARENA_DAY_SEND = 94,				//!< 跨服竞技场每日下发
    PUT_REASON_OPEN_BOX_FIXED_SHI_ZHUANG = 95,			//!< 开箱子固定获得时装
    PUT_REASON_WA_BAO_COLLECTION_LEVEL_REWRAD = 96,		//!< 挖宝收藏柜等级奖励
    PUT_REASON_RUNE_TOWER = 97,							//!< 符文塔
    PUT_REASON_PET_FB = 98,								//!< 宠物副本
    PUT_REASON_GUILD_BOSS_FIGHT = 99,					//!< 公会boss参与
    PUT_REASON_GUILD_BOSS_WIN = 100,					//!< 公会boss胜利
    PUT_REASON_CREATE_GUILD_ERROR = 101,				//!< 创建公会错误
    PUT_REASON_GUILD_HELP = 102,						//!< 互助奖励
    PUT_REASON_GEM_BUY = 103,							//!< 宝石购买

    PUT_REASON_MAX,										// 最大原因
};

export const BagNoticeFun: { [key: number]: Function } = {
    [GET_TYPE.common]: (data: PB_SCGetItemNotice) => {
        let has_block = false
        for (let element of data.itemList) {
            if (ITEM_BIG_TYPE.Block == Item.GetBigType(element.itemId)) {
                has_block = true
                break
            }
        }
        if (has_block) {
            let list = []
            for (let element of data.itemList) {
                if (ITEM_BIG_TYPE.Block != Item.GetBigType(element.itemId)) {
                    list.push(element)
                }
            }
            BlockData.Inst().AddItems = list
            return
        }
        ViewManager.Inst().OpenView(CommonRewardView, { reward_data: data.itemList, call_back: null, get_type: data.getType })
    },
    [GET_TYPE.PUT_REASON_DUO_BAO_DRAW_PRIMIRY]: (data: PB_SCGetItemNotice) => {
        LoopMineData.Inst().MarkItemNotice({ reward_data: data.itemList })
        // ViewManager.Inst().OpenView(CommonRewardView, { reward_data: data.itemList })
    },
    [GET_TYPE.PUT_REASON_DUO_BAO_DRAW_SENIOR]: (data: PB_SCGetItemNotice) => {
        LoopMineData.Inst().MarkItemNotice({ reward_data: data.itemList })
        // ViewManager.Inst().OpenView(CommonRewardView, { reward_data: data.itemList })
    },
    [GET_TYPE.PUT_REASON_DEBRIS_ITEM]: (data: PB_SCGetItemNotice) => {
        // 目前碎片合成只有坐骑，需要追加再拓展
        MountData.Inst().TryOpenFixGetMountAwake(data.itemList[0])
    },
    [GET_TYPE.PUT_REASON_BOX]: (data: PB_SCGetItemNotice) => {
        BoxData.Inst().ShowArenaItem = true;
    },
    [GET_TYPE.PUT_REASON_INSCRIPTION_TURNTABLE]: (data: PB_SCGetItemNotice) => {
        InscriptionData.Inst().PutTurntableRewards(data.itemList, data.getType)
    },
    [GET_TYPE.PUT_REASON_BOX_ENCHANT]: (data: PB_SCGetItemNotice) => {
        BoxData.Inst().SetEnchantInfo(data.itemList)
    },

    [GET_TYPE.PET_GEM_ONCE]: (data: PB_SCGetItemNotice) => {
        PetData.Inst().once_result_data.flush = !PetData.Inst().once_result_data.flush;
        if (data.itemList.length != 0) {
            ViewManager.Inst().OpenView(GemOnceGetView, { reward_data: data.itemList })
            PetData.Inst().ResultData.flush_gem_red = !PetData.Inst().ResultData.flush_gem_red;
        }
    },
    [GET_TYPE.PUT_REASON_CORECRISIS_BOX]: (data: PB_SCGetItemNotice) => {
        CoreCrisisBoxData.Inst().SetBoxRet(data);
    },
    [GET_TYPE.PET_PET_TREASURE]: (data: PB_SCGetItemNotice) => {
        BoxDrawData.Inst().SetBoxRet(data);
    },
    [GET_TYPE.OPEN_BOX_SHI_ZHUANG]: (data: PB_SCGetItemNotice) => {
        BoxData.Inst().SetShiZhuang(data.itemList[0].itemId);
    },
    [GET_TYPE.BOX_FIXED_SHI_ZHUANG]: (data: PB_SCGetItemNotice) => {
        BoxData.Inst().SetShiZhuang(data.itemList[0].itemId);
    },

    [GET_TYPE.PUT_REASON_INSCRIPTION_BOX]: (data: PB_SCGetItemNotice) => {
        BoxDrawData.Inst().SetBoxRet(data);
    },

    [GET_TYPE.PUT_REASON_GEM_BUY]: (data: PB_SCGetItemNotice) => {
        GemAtelierData.Inst().flush_info.onekey_change = GemAtelierData.Inst().flush_info.onekey_change + 1
    },
    [GET_TYPE.PUT_REASON_SHOP]: (data: PB_SCGetItemNotice) => {
        let has_block = false
        for (let element of data.itemList) {
            if (ITEM_BIG_TYPE.Block == Item.GetBigType(element.itemId)) {
                has_block = true
                break
            }
        }
        if (has_block) {
            let list = []
            for (let element of data.itemList) {
                if (ITEM_BIG_TYPE.Block != Item.GetBigType(element.itemId)) {
                    list.push(element)
                }
            }
            BlockData.Inst().AddItems = list
            return
        }
        ViewManager.Inst().OpenView(CommonRewardView, { reward_data: data.itemList, call_back: null, get_type: data.getType })
    },
}

export let UnNoticeCommon: { [key: number]: boolean } = {
    [GET_TYPE.PUT_REASON_NO_NOTICE]: true,
    [GET_TYPE.PUT_REASON_GM]: true,
    [GET_TYPE.PUT_REASON_DUO_BAO_DRAW_PRIMIRY]: true,
    [GET_TYPE.PUT_REASON_DUO_BAO_DRAW_SENIOR]: true,
    [GET_TYPE.PUT_REASON_BOX]: true,
}
//总共13个广告位置 这里使用了10个 47 用两次 31 用两次
export let NeedCheckAdCard: { [key: number]: boolean } = {
    [PUT_REASON_TYPE.PUT_REASON_ADVERTISEMENT]: true,
    [PUT_REASON_TYPE.PUT_REASON_RUNE_TOWER_TURNTABLE]: true,
    [PUT_REASON_TYPE.PUT_REASON_RA_DAILY_SHARING]: true,
    [PUT_REASON_TYPE.PUT_REASON_RA_ADVERTISEMENT_EQUITY]: true,
    [PUT_REASON_TYPE.PUT_REASON_PET_TREASURE]: true,
    [PUT_REASON_TYPE.PUT_REASON_RA_BOX_FUND]: true,
    [PUT_REASON_TYPE.PUT_REASON_LIMIT_CORE_BOX]: true,
    [PUT_REASON_TYPE.PUT_REASON_RA_DAILY_GIFT]: true,
    [PUT_REASON_TYPE.PUT_REASON_RA_LEVEL_FUND]: true,
}
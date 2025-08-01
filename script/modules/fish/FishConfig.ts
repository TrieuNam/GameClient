
export var FishConfig = {
   BOX_TYPE_MAX: 4,
   BOX_ITEMS_PER: 3,
   BOX_ITEMS_MAX: 6,

   WaBaoReqType: {
      unlock_map: 1,         // 解锁地图 p1:map
      enter_map: 2,          // 进入地图 p1:map
      wa_bao: 3,             // 挖宝
      sell: 4,               // 出售
      put_collection: 5,     // 放入收藏柜 p1:item_type p2:index[0-5]
      collection_sell: 6,    // 收藏柜出售 p1:item_type p2:index[0-5]
      collection_buy: 7,     // 收藏柜升级购买
      collection_up: 8,      // 收藏柜升级
      collection_quicken: 9, // 收藏柜升级加速 p1:num
      fresh_task: 10,        // 刷新订单 p1:index
      fetch_task: 11,        // 领取订单奖励 p1:index
      tool_up_level: 12,     // 工具升级 p1:tool_type
      tool_up_grade: 13,     // 工具升阶 p1:tool_type
      put_collection_book: 14,        // 放入收藏品图鉴
      collection_book_level_up: 15,   // 收藏品图鉴升级 p1:handbook_type
      activate_book: 16,     // 图鉴激活 p1:orb_map p2:handbook_type
      fetch_collection_level_reward: 17,  //领取收藏柜购买升级奖励 p1:num从1开始
   },

   // 挖宝物品类型
   WaBaoItemType: {
      invalid: -1,
      mineral: 0,   // 矿石
      fossil: 1,    // 化石
      treasure: 2,  // 宝物
      biology: 3,   // 生物
      sundrise: 4,  // 杂物
      max: 5,
   },

   // 挖宝地图解锁条件类型
   WaBaoMapConditionType: {
      invalid: -1,
      level: 0,     // 等级达到
      mineral: 1,   // 挖到矿石
      fossil: 2,    // 挖到化石
      treasure: 3,  // 挖到宝物
      biology: 4,   // 挖到生物
      mao_xian: 5,  // 通关冒险关卡数量
      max: 6,
   },

   // 挖宝工具类型
   WaBaoToolType: {
      invalid: -1,
      hat: 0,       // 矿工帽
      shovel: 1,    // 矿铲
      light: 2,     // 探照灯
      basket: 3,    // 矿工背篓
      glove: 4,     // 矿工手套
      max: 5,
   },

   // 挖宝工具进阶条件类型
   WaBaoToolGradeConditionType: {
      invalid: -1,
      level: 0,     // 等级达到
      mineral: 1,   // 挖到矿石
      fossil: 2,    // 挖到化石
      treasure: 3,  // 挖到宝物
      biology: 4,   // 挖到生物
      max: 5,
   },

   // 挖宝订单任务类型
   WaBaoTaskType: {
      treasure: 0,  //获得(类型)宝物(x个)
      given: 1,     //获得(物品id)物品(x个)
      max: 2,
   },

   // 挖宝结果类型
   WaBaoResultType: {
      init: -4,           // 初始化
      no_unlucky: -3,     // 没有挖宝宝贝(没挖到)
      no_robben: -2,      // 被别人抢先挖走了(没挖到)
      no_lose: -1,        // 挖到的东西上交了国家(没挖到)
      yes: 0,             // 挖到了
      yes_new_get: 1,     // 新获得
      yes_new_record: 2,  // 新纪录
      max: 3,
   },

   MapSpName: {
      [1]: "HaiDiDongXue",
      [2]: "SenLinDongXue",
      [3]: "HuiShengDongXue",
      [4]: "JingQingQiDai",
      [5]: "JingQingQiDai",
   },
   HandbookSpName: {
      [0]: "ShouCangPin",
      [1]: "HaiDiDongXue",
      [2]: "SenLinDongXue",
      [3]: "HuiShengDongXue",
      [4]: "ShouCangPin",
      [5]: "ShouCangPin",
   },

   WaBaoEff1: {
      [1]: 4164029,
      [2]: 4164030,
      [3]: 4164031,
      [4]: 4164032,
      [5]: 4164033,
   },
   WaBaoEff2: {
      [1]: 4164034,
      [2]: 4164035,
      [3]: 4164036,
      [4]: 4164037,
      [5]: 4164038,
   },
   WaBaoEff3: {
      [1]: 4169023,
      [2]: 4169024,
      [3]: 4169025,
      [4]: 4169026,
      [5]: 4169027,
      [6]: 4169028,
   },
}
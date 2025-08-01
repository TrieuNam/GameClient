
export var TrialConfig = {
   TRIAL_SPOIL_LEVEL_MAX: 5,
   TRIAL_SPOIL_NUM_MAX: 8,
   GUMO_LAYER_STAR_MAX: 15,
   GUMO_LEVEL_STAR_MAX: 3,
   GUMO_LEVEL_MAX: 5,

   TrialReqType: {
      fight: 0,  // 战斗
      choice: 1, // 选择战利品 p1:index[0,2]
      open: 2,   // 开启战利品槽 p1:index[0,11]
      use: 3,    // 装备战利品 p1:index p2:item_id
      reset: 4,  // 重置
   },

   GuMoReqType: {
      list: 0,      //请求列表 p1:layer(发-1时会返回上一次请求的那一层)
      info: 1,      //请求层信息 p1:layer
      fight: 2,     //挑战 p1:level
      fetch_box: 3, //领取宝箱 p1:layer p2:index[0,2]
      day_reward: 4,//每日奖励 p1:level
   },
}
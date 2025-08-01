
export var GuildConfig = {
   ICON_NUM_MAX: 5,

   ReqType: {
      guild_info: 0,          // 请求公会信息
      guild_list: 1,          // 发送公会列表	
      search_guild: 2,        // 搜索公会 str_param:搜索框
      create_guild: 3,        // 创建公会 param:图标 str_param:公会名
      join_guild: 4,          // 申请加入公会 param:guild_id
      apply_guild: 5,         // 审批入会申请 param:uid 0|1
      help: 6,                // 请求帮助	param:0宝箱 1收藏柜
      help_ret: 7,            // 砍一刀 param:report_key
      set_guild: 8,           // 设置公会信息 param:等级限制 自动审核 搜索限制 
      set_notice: 9,          // 设置公告 str_param:公告内容
      appoint: 10,            // 职位管理 param:目标uid 职位
      fight_boss: 11,         // 打boss
      report_list: 12,        // 下发互助界面
      member_list: 13,        // 下发成员列表
      exercise: 14,           // 锻炼 param:part_type part_id
      quit: 15,               // 退出公会
      kick_out: 16,           // 踢人 param:目标uid
      fetch_pass_reward: 17,  // 领取通关奖励 param:boss_seq
      exercise_reset: 18,     // 锻炼重置 param:part_type
      dismiss: 19,            // 解散
   },

   PositionType: {
      president: 0,
      vice_president: 1,
      member: 2,
   },

   ReportType: {
      min: 0,
      join: 1,                // 加入公会 玩家name_a加入骑士团
      quit: 2,                // 退出公会 玩家name_a退出骑士团
      abdicate1: 3,           // 转让团长 玩家name_a将团长转让给name_b
      abdicate2: 4,           // 任命副团长 玩家name_a将副团长转让给name_b
      help: 5,                // 请求帮助	玩家信息role_info 请求帮助param_1:0宝箱 1收藏柜 param_2:宝箱等级 param_3:进度 param_4:我是否帮过
      abdicate3: 6,           // 转让副团长 玩家name_a任命name_b为副团长
   },

   MemberOperType: {
      exit: 0,                // 退出
      kick_out: 1,            // 踢出
      appoint_up: 2,          // 任命
      appoint_down: 3,        // 降职
      appoint_to: 4,          // 转让团长
      appoint_tov: 5,         // 转让副团长
   },

   HelpType: {
      box: 0,
      fish_box: 1,
   },

   PositionIcon: ["TuanChangTuBiao", "FuTuanChangTuBiao"]
}
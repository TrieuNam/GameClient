import { COLORS } from "modules/common/ColorEnum";

export var ShenQiConfig = {
   ReqType: {
      record_info: 0,         // 请求记录信息
      level_up: 1,            // 升级 p1:id p2:[0-1]是否使用神器碎片
      wearing: 2,             // 穿戴 p1:id
      draw: 3,                // 抽奖
   },
   OutlineColor: {
      [2]: COLORS.Green2,
      [3]: COLORS.Blue3,
      [6]: COLORS.Yellow2,
   }
}
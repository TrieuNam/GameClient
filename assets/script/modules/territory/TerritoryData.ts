import { math, sys, System } from "cc";
import { CfgTerritoryData } from "config/CfgTerritory";
import { CfgTerritoryGift, CfgTerritoryGiftCfg } from "config/CfgTerritoryGift";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata, SMDTriggerNotify } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { FishData } from "modules/fish/FishData";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TerritoryGift } from "./TerritoryGift";
import { TerritoryLog } from "./TerritoryLog";
import { TerritorySnatch } from "./TerritorySnatch";
import { ActivityRandData } from "modules/activity/ActivityRandData";
export enum TERRITORY_REQ {
    INFO,//领地界面信息 p1, uid
    NEIGHBOUR,//抢夺界面
    FETCH_ITEM,//开始拉货 p1 目标uid , p2 货箱index p3：工具人数量
    FETCH_REWARD,//领取奖励
    BUY,//购买工具人
    LEVEL_UP,//升级领地
    BOT_STATUS,//工具人派遣
    REFRESH_NEIGHBOUR,//刷新邻居
    Log,//日志
    REFRESH_CONTAINER,//刷新货箱
}
export class STerritoryFlush {
    @smartdata
    flush_info: boolean = false//切换
    @smartdata
    flush_snatch: boolean = false
    @smartdata
    flush_bot: boolean = false
    @smartdata
    flush_log: boolean = false
    @smartdata
    flush_red: boolean = false
    @smartdata
    flush_gift: boolean = false
}

export class TerritoryData extends DataBase {
    FlushData: STerritoryFlush = null

    show_mine: boolean = true
    my_territory: IPB_SCTerritoryInfo = undefined
    other_territory: IPB_SCTerritoryInfo = undefined

    neighbour_list: IPB_SCTerritoryNeighbourRole[] = undefined
    enemy_list: IPB_SCTerritoryNeighbourRole[] = undefined
    bot_list: IPB_SCTerritoryBotNode[] = undefined
    neighbour_time = 0
    report_list: IPB_SCTerritoryReportNode[] = undefined
    reward_flag = 0
    gift_type = 0
    buy_count = 0
    gift_btn_remind = 1
    end_time = 0;

    constructor() {
        super();
        this.createSmartData();
    }
    private createSmartData() {
        this.FlushData = CreateSMD(STerritoryFlush);
    }
    protected onSwitch(): void {
        //SMDTriggerNotify(TerritoryData.Inst().FlushData, "flush_red")
    }
    SetTerritoryInfo(info: IPB_SCTerritoryInfo) {
        LogError("我的id = ", RoleData.Inst().GetRoleId());
        if (info.roleInfo.roleId == RoleData.Inst().GetRoleId()) {
            this.my_territory = info
            this.show_mine = true
            /* if(ViewManager.Inst().IsOpen(TerritorySnatch)){
                ViewManager.Inst().CloseView(TerritorySnatch)
            } */
            /* if(ViewManager.Inst().IsOpen(TerritoryLog)){
                ViewManager.Inst().CloseView(TerritoryLog)
            } */
        } else {
            this.other_territory = info
            this.show_mine = false
            /* if(ViewManager.Inst().IsOpen(TerritorySnatch)){
                ViewManager.Inst().CloseView(TerritorySnatch)
            } */
            /* if(ViewManager.Inst().IsOpen(TerritoryLog)){
                ViewManager.Inst().CloseView(TerritoryLog)
            } */
        }
        this.FlushData.flush_info = !this.FlushData.flush_info
    }
    //切换的时候有个动画
    //购买次数
    BuyCount(): number {
        return this.my_territory.botBuyCount ?? 0
    }
    //购买配置
    BuyCfg(count: number) {
        return CfgTerritoryData.buy_monster[count]
    }
    //获取物品配置
    GetItemCfg(seq: number) {
        return CfgTerritoryData.item_information[seq - 1]
    }
    //根据拉货次数获取百分比配置
    GetEfficiency(count: number) {
        let index = 1
        CfgTerritoryData.monster_efficiency.forEach(element => {
            if (count >= element.num) {
                index = Math.max(index, element.seq)
            }
        });
        return CfgTerritoryData.monster_efficiency[index - 1]
    }
    //领地等级配置
    GetTerritoryCfg(level: number) {
        return CfgTerritoryData.territory_up[level - 1]
    }
    GetOtherCfg() {
        return CfgTerritoryData.other[0]
    }
    //抢夺界面 设置相邻和仇人
    SetTerritoryNeighbourInfo(data: IPB_SCTerritoryNeighbourInfo) {
        this.neighbour_time = data.neighbourTime
        this.enemy_list = data.enemyList
        let temp_list: IPB_SCTerritoryNeighbourRole[] = []
        this.enemy_list.forEach(element => {
            if (element.itemSeq.length > 0 || element.roleInfo != null) {
                temp_list.push(element)
            }
        });
        this.enemy_list = temp_list
        this.neighbour_list = data.neighbourList
        temp_list = []
        this.neighbour_list.forEach(element => {
            if (element.itemSeq.length > 0 || element.roleInfo != null) {
                temp_list.push(element)
            }
        });
        this.neighbour_list = temp_list
        this.FlushData.flush_snatch = !this.FlushData.flush_snatch
    }
    //领地界面 工具人的干活列表
    SetTerritoryBotInfo(data: IPB_SCTerritoryBotInfo) {
        this.bot_list = data.botList
        this.FlushData.flush_bot = !this.FlushData.flush_bot
    }
    SetTerritoryReportInfo(data: IPB_SCTerritoryReportInfo) {
        this.report_list = data.reportList
        this.FlushData.flush_log = !this.FlushData.flush_log
    }
    GetTerrtoryRedPoint() {
        let num = 0
        num = FishData.Inst().GetWabaoRedPoint()
        if (num == 1) {
            //console.log("挖宝");
            return num
        }
        if(this.GetGiftShowRedPoint() > 0){
            return 1
        }
        //console.log(this.GetBotRedPoint(), this.GetAddLogRedPoint(), this.GetRewardRedPoint());

        return this.GetBotRedPoint() || this.GetAddLogRedPoint() || this.GetRewardRedPoint();
    }
    //可获取工具人红点
    GetBotRedPoint() {
        if (this.my_territory == undefined) {
            return 0
        }
        //let cur = this.my_territory.botNum
        let max = CfgTerritoryData.buy_monster.length
        //只能买20次
        let buy_count = this.my_territory.botBuyCount
        if (buy_count >= max) {
            return 0
        }
        let item_id = this.GetOtherCfg().bug_monster_item
        let num = Item.GetNum(item_id)
        let config = this.BuyCfg(buy_count)
        if (config && config.bug_price <= num) {
            return 1
        }
        return 0
    }
    //新增log红点
    GetAddLogRedPoint() {
        if (this.report_list) {
            if (!sys.localStorage.getItem("TerritoryRed") && this.report_list.length >= 1) {
                return 1;
            } else if (+sys.localStorage.getItem("TerritoryRed") < this.report_list.length) {
                return 1;
            }
        }
        return 0;
    }
    //新增可获得奖励红点
    GetRewardRedPoint() {
        /* let num = 0
        if (this.my_territory && this.my_territory.itemList) {
            this.my_territory.itemList.forEach(element => {
                if (element.endTime > 0 && element.endTime - TimeCtrl.Inst().ClientTime < 0) {
                    num = 1
                }
            });
        } */
        return this.reward_flag
    }


    // 礼包按钮首次出现红点
    GetGiftShowRedPoint(){
        if(this.GetGiftShow() == null){
            return 0;
        }
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.TerritoryGift);
        let old_time = ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.TerritoryGift)
        if (act_start != old_time) {
            return 1;
        }
        return 0;
    }

    public ClearFirstRemind() {
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.TerritoryGift);
        if (act_start != ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.TerritoryGift)) {
            ActivityRandData.Inst().SetRemind(ACTIVITY_TYPE.TerritoryGift, act_start);
            SMDTriggerNotify(this.FlushData, "flush_gift")
        }
    }

    SetGiftShowRedPoint(num:number){
        this.gift_btn_remind = num;
        SMDTriggerNotify(this.FlushData, "flush_red")
        // SMDTriggerNotify(this.FlushData, "flush_gift")
    }

    public getGiftEndTime(){
        return this.end_time;
    }

    //获取当前领地礼包显示
    GetGiftShow(): CfgTerritoryGiftCfg {
        if (!ActivityData.Inst().IsOpen(ACTIVITY_TYPE.TerritoryGift)) {
            console.log("活动未开启");
            if (ViewManager.Inst().IsOpen(TerritoryGift)) {
                ViewManager.Inst().CloseView(TerritoryGift)
            }
            return
        }
        let level = RoleData.Inst().GetRoleLevel()
        let res
        CfgTerritoryGift.gift_configure.forEach(element => {
            if (element.seq == this.gift_type && this.buy_count < element.limit_convert_count && level >= element.start_level) {
                res = element
                return res
            }
        })
        if (!res && ViewManager.Inst().IsOpen(TerritoryGift)) {
            ViewManager.Inst().CloseView(TerritoryGift)
        }
        if(!res){
            console.log("当前无可用礼包");
        }
        return res
    }
}
import { Color, color, ERigidBodyType, math } from "cc";
import { CfgEscortData, CfgEscortRank } from "config/CfgEscort";
import { CreateSMD, smartdata, SMDTriggerNotify } from "data/SmartData";
import { ActivityData } from "modules/activity/ActivityData";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { DataBase } from "../../data/DataBase";
import { DataHelper } from "../../helpers/DataHelper";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";

export enum ESCORT_OPER_TYPE {
    SHIP_UP,//升级
    SET_SAIL,//启航
    INTERCEPT,//打劫 p1船的Key
    HELP,//救火 p1船的key
    SHIP_LIST_INFO_REQ,//请求船道信息
    REPORT_LIST_INFO_REQ,//请求记录列表
    INTERCEPT_LIST_INFO_REQ,//请求拦截列表
    SHIP_INFO_REQ,//请求船的信息， p1 船的key
    RETCH_REWARD,//领取奖励
    OPER_BOSS_FIGHT,//挑战幽灵船
    OPER_HARM_REWARD,//领取伤害奖励 pq:seq
}
export enum ESCORT_RET_TYPE {
    SHIP_UP,//升级 p1 0失败1成功
    SET_SAIL,//启航 p1船只等级 p2结束时间
    TARGET_INTERCEPT,//目标被拦截 p1 船只的key p2 被拦截的次数
    HELP,//救火 p1 船只的key
    ADD_REPORT,//新记录
    DAMAGE_CHANGE,//伤害变化 p1:伤害
    HARM_REWARD,//领取伤害奖励 p1:index
}
/* export class SEcsortRet {
    type: number;
    p1: number
    p2: number
}
export class SEcsortRoleInfo {
    ship: number;
    escortCount: number;
    interceptCount: number;
    helpCount: number;
} */
export class SEcsortFlush {
    @smartdata
    flush_role_info: boolean
    @smartdata
    flush_ret: boolean
    @smartdata
    flush_report: boolean
    @smartdata
    flush_intercept: boolean
    @smartdata
    flush_ship_list: boolean
    @smartdata
    click_posion: boolean
    @smartdata
    escort_finish: boolean
    @smartdata
    flush_ghost: boolean
    @smartdata
    flush_ghost_reward_index: boolean
    @smartdata
    is_ghost_open: boolean
}

class SBoatInfo {
    @smartdata
    boat_seq: number;
}
export class SEscortReport {
    report_desc: string
    report_time: number
    result: RegExpMatchArray
    result_str: string
}

export class EscortData extends DataBase {
    FlushData: SEcsortFlush = null;
    ResultData: PB_SCEscortRet = null;
    RoleData: PB_SCEscortRoleInfo = null;

    MyShip: IPB_SCEscortShipData[] = [];//草泥马不实例化就不能用是吧 孩他妈不报错
    ShipList: IPB_SCEscortShipData[] = [];

    ReportData: SEscortReport[];
    InterceptData: PB_SCEscortInterceptListInfo;

    ShipInfoList: IPB_SCEscortInterceptData[] = []

    //public ResultData : LoginResultData;
    //bbcode没法用诡异的很
    // name_color: string[] = [COLORSTR.Yellow1, COLORSTR.Green4, COLORSTR.Blue4, COLORSTR.Purple3, COLORSTR.Red6, COLORSTR.Yellow8]
    name_color: Color[] = [COLORS.Yellow1, COLORS.Green4, COLORS.Blue4, COLORS.Purple3, COLORS.Red6, COLORS.Yellow8]
    reward_list: CfgEscortRank[][]
    intercpeted_count: number = 0
    attacked_count: number = 0
    new_report: boolean = false

    board_road:number[] = [3,6,4,1,5,10,8,11,2,12,9,7]

    public static ghost_open_time: number = 0;
    public static ghost_over_time: number = 0;
    ghost_next_status_time:number=0;
    public ghost_timer: any;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.FlushData = CreateSMD(SEcsortFlush)
        //this.ResultData = CreateSMD(SEcsortRet);
        //this.RoleData = CreateSMD(SEcsortRoleInfo)
    }


    GetBoatList() {
        return CfgEscortData.ship
    }
    GetBoatData(ship: number) {
        return CfgEscortData.ship[ship];
    }
    GetOther() {
        return CfgEscortData.other[0];
    }
    GetRankReward(rank_type: number) {
        if (!this.reward_list) {
            this.reward_list = []
        }
        if (!this.reward_list[rank_type]) {
            this.reward_list[rank_type] = []
            CfgEscortData.rank.forEach(cfg => {
                if (cfg.rank_type == rank_type) {
                    this.reward_list[rank_type].push(cfg)
                }
            })
        }
        return this.reward_list[rank_type]
    }
    //总拦截次数
    GetInterceptTime() {
        return this.GetOther().intercept_time
    }
    //总护送次数
    GetEscortTime() {
        return this.GetOther().escort_num
    }
    //总救援次数
    GetHelpTime() {
        return this.GetOther().help_time
    }
    //可被攻击次数 根据你的船的可拦截次数累加
    GetCanInterceptedTime() {
        this.intercpeted_count = 0
        for (let index = 0; index < this.MyShip.length; index++) {
            const element = this.MyShip[index];
            this.intercpeted_count = this.intercpeted_count + this.GetBoatData(element.ship).intercept_num
        }
        return this.intercpeted_count
    }
    //已被攻击次数
    GetAttackedTime() {
        this.attacked_count = 0
        for (let index = 0; index < this.MyShip.length; index++) {
            const element = this.MyShip[index];
            this.attacked_count = this.attacked_count + element.beIntercept
        }
        return this.attacked_count
    }
    //获取船只信息
    GetShipInfo(shipKey: number) {
        return this.ShipInfoList[shipKey]
    }

    GetRewardRedPoint() {
        let num = 0
        let data = FunOpen.Inst().GetFunIsOpen(Mod.Escort.View)
        if (!data.is_open) {
            return num
        }
        if (this.MyShip != null) {
            this.MyShip.forEach(element => {
                if (element.overTime - TimeCtrl.Inst().ClientTime < 0) {
                    num = 1
                }
            });
        }
        return num
    }
    GetEscortRedPoint() {
        let num = 0
        if (this.MyShip != null && this.MyShip.length > 0) {
            return num
        }
        if (this.RoleData.escortCount - this.GetEscortTime() < 0) {
            num = 1
        }
        return num
    }
    //获取红点
    GetRedPoint() {
        let num = 0
        let data = FunOpen.Inst().GetFunIsOpen(Mod.Escort.View)
        if (!data.is_open) {
            return num
        }
        num = this.GetRewardRedPoint()
        if (num == 1) {
            return num
        }
        num = this.GetEscortRedPoint();
        if (num == 1) {
            return num
        }
        num = this.GetGhostRed();
        return num
    }

    /** 幽灵船伤害奖励列表 */
    public GetGhostRewardList() {
        let list = [];
        let flag = DataHelper.ToBinary(this.RoleData.rewardIndex)
        if (this.RoleData) {
            let cfgs = CfgEscortData.harm_rank;
            for (let i = 0; i < cfgs.length; i++) {
                let info: any = {}
                info.seq = i;
                info.show_hart = cfgs[i].show_hart;
                info.win = cfgs[i].win[0];
                info.is_lock = this.RoleData.maxDamage < info.show_hart;
                info.is_fetch =flag[info.seq]==1
                list.push(info);
            }
        }
        return list;
    }

    /** 幽灵船伤害奖励滑动index */
    public GetGhostRewardScrIdx() {
        let index = -1;
        let fetch_index = 0;
        let flag = DataHelper.ToBinary(this.RoleData.rewardIndex)
        if (this.RoleData) {
            let cfgs = CfgEscortData.harm_rank;
            for (let i = 0; i < cfgs.length; i++) {
                let is_lock = this.RoleData.maxDamage < cfgs[i].show_hart;
                let is_fetch = flag[i] == 1;
                if (is_fetch){
                    fetch_index=i;
                }else if (!is_lock){
                    index = i;
                    break;
                }
            }
        }
        return index != -1 ? index : fetch_index;
    }

    /**幽灵船倒计时 */
    public static GhostTimer() {
        let cur_time = Math.floor(TimeCtrl.Inst().ServerTime) ;
        let today_time = Math.floor(TimeCtrl.Inst().todayStarTime);
        let open_time = today_time + EscortData.ghost_open_time;
        let over_time = today_time + EscortData.ghost_over_time;
        let is_open = cur_time > open_time && cur_time < over_time;
        EscortData.Inst().FlushData.is_ghost_open = is_open
        let ghost_next_status_time: number;
        if (is_open) {
            ghost_next_status_time = over_time ;
        } else {
            if (cur_time > over_time) {
                ghost_next_status_time = open_time  + 86400;
            } else
                ghost_next_status_time = open_time ;
        }
        EscortData.Inst().ghost_next_status_time = ghost_next_status_time;
        Timer.Inst().CancelTimer(EscortData.Inst().ghost_timer);
        EscortData.Inst().ghost_timer = Timer.Inst().AddRunTimer(this.GhostTimer.bind(this), ghost_next_status_time-cur_time, 1, false)
    }

    public static InitGhostTime() {
        let cfg_open_time = CfgEscortData.other[0].open_tiem.toString();
        EscortData.ghost_open_time = +cfg_open_time.slice(0, 2) * 3600 + +cfg_open_time.slice(2) * 60;
        EscortData.ghost_over_time = this.ghost_open_time + 60 * CfgEscortData.other[0].continue_time_min;
    }

    /**幽灵船红点 */
    public GetGhostRed() {
        if (!this.FlushData.is_ghost_open)
            return 0;
        if (this.GetGhostFirstRed()==1)
            return 1;
        if (this.GetGhostRewardRed()==1)
            return 1;
        return 0;
    }

    /**幽灵船奖励红点 */
    public GetGhostRewardRed(){
        if (this.RoleData) {
            let cfgs = CfgEscortData.harm_rank;
            let flag = DataHelper.ToBinary(this.RoleData.rewardIndex)
            for (let i = 0; i < cfgs.length; i++) {
                let is_damge = this.RoleData.maxDamage >= cfgs[i].show_hart;
                let is_fetch = flag[i] == 1;
                if (is_damge && !is_fetch) {
                    return 1;
                }
            }
        }
        return 0;
    }
    /**幽灵船开启首次挑战红点 */
    public GetGhostFirstRed() {
        let old_time = LocalStorageHelper.PrefsInt(LocalStorageHelper.EscortGhostIsRemind());
        let today_time = Math.floor(TimeCtrl.Inst().todayStarTime);
        let open_time = today_time + EscortData.ghost_open_time;
        if (old_time != open_time)
            return 1;
        return 0;
    }

    public ClearFirstRemind() {
        let old_time = LocalStorageHelper.PrefsInt(LocalStorageHelper.EscortGhostIsRemind());
        let today_time = Math.floor(TimeCtrl.Inst().todayStarTime) ;
        let open_time = today_time + EscortData.ghost_open_time;
        if (old_time != open_time) {
            LocalStorageHelper.PrefsInt(LocalStorageHelper.EscortGhostIsRemind(), open_time);
        }
    }
}

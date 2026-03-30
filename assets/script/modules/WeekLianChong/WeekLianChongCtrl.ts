import { Camera } from 'cc';
import { CfgItem } from 'config/CfgCommon';
import { CfgWeekLianChongData } from 'config/CfgWeekLianChong';
import { LogError } from 'core/Debugger';
import { DataBase } from 'data/DataBase';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { CreateSMD, smartdata } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ActivityData } from 'modules/activity/ActivityData';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { ActivityFuncsData } from 'modules/activity/ActivityFuncsData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { TimeHelper } from '../../helpers/TimeHelper';

export class WeekLianChongCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaWeekendLianChongInfo, func: this.OnWeekendLianChongInfo }
        ]
    }

    private OnWeekendLianChongInfo(data: PB_SCRaWeekendLianChongInfo) {
        WeekLianChongData.Inst().SetWeekendLianChongInfo(data)
        LogError("3034 周末连充-------》 " , data)
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.WeekLianChong, WeekLianChongData.Inst().WeekLianChongSmartData, WeekLianChongData.Inst().GetRedNum.bind(WeekLianChongData.Inst())));
    }

}


class WeekLianChongInfo {
    @smartdata
    WeekLianChongInfo: PB_SCRaWeekendLianChongInfo;

}

export enum ZMLC_RewardState{
    UnGet = 1,  //不可领
    CanGet = 2,//可领
    HasGet = 3,//已领
}

export class WeekLianChongData extends DataBase {
    public WeekLianChongSmartData: WeekLianChongInfo
    public WeekLianChongInfo:PB_SCRaWeekendLianChongInfo
    public chongZhiNum = [500,0,0]

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.WeekLianChongSmartData = CreateSMD(WeekLianChongInfo);
        // this.flush_info.need_flush = 0
    }

    public SetWeekendLianChongInfo(protocol:PB_SCRaWeekendLianChongInfo){
        this.WeekLianChongInfo = protocol
        this.WeekLianChongSmartData.WeekLianChongInfo = protocol
    }

    public GetDailyRewardList(){
        let cfg :any = CfgWeekLianChongData.gift_configure.filter(cfg => {
            return cfg.start_level <= this.WeekLianChongInfo.level && cfg.end_level >= this.WeekLianChongInfo.level;
        });
        let day1:any[] = [];
        let day2:any[] = [];
        let day3:any[] = [];
        let all:any[] = [];

        for (let i = 0 ; i < cfg.length ; i ++){
            day1.push({day : 1 ,reward_list:cfg[i].reward1_item})
            day2.push({day : 2 ,reward_list:cfg[i].reward2_item})
            day3.push({day : 3 ,reward_list:cfg[i].reward3_item})
        }
        all.push(day1)
        all.push(day2)
        all.push(day3)
        return all
    }

    public GetSpecialRewardData(){
        let cfg :any = CfgWeekLianChongData.gift_configure.filter(cfg => {
            return cfg.start_level <= this.WeekLianChongInfo.level && cfg.end_level >= this.WeekLianChongInfo.level;
        });
        let special : any[] = [];
        for (let i = 0 ; i < cfg.length ; i ++){
            special.push({reward_list:cfg[i].reward4_item})
        }
        return special
    }

    public GetDailyCost(day:number){
        let cfg :any = CfgWeekLianChongData.gift_configure.filter(cfg => {
            return cfg.start_level <= this.WeekLianChongInfo.level && cfg.end_level >= this.WeekLianChongInfo.level;
        });
        return cfg[day].acc_price / 10
    }

    public GetRewardState(day:number,seq:number){
        // LogError("day = "+ day + " seq = " + seq)
        // LogError("this.WeekLianChongInfo.dayCanFetchFlagList[day] = ",this.WeekLianChongInfo.dayCanFetchFlagList[day].flag)
        let can_get = this.WeekLianChongInfo.dayCanFetchFlagList[day].flag[seq ] == 1
        let has_get = this.WeekLianChongInfo.dayFecthFlagList[day].flag[seq ] == 1
        let state = ZMLC_RewardState.UnGet
        if (has_get){
            state = ZMLC_RewardState.HasGet
        }else{
            if (can_get){
                state = ZMLC_RewardState.CanGet
            }
        }
        return state
    }

    public GetSpecialState(day:number){
        let state = ZMLC_RewardState.UnGet
        let can_get = true
        for (let i = 0 ; i < 3 ; i++){
            if (this.WeekLianChongInfo.dayCanFetchFlagList[i].flag[day] != 1){
                can_get = false
            }
        }
        let has_get = this.WeekLianChongInfo.extraRewardFlag.flag[day] == 1
        // let leichong_day = this.GetLeiJiday()
        // LogError("day = " + day + " + has_get = " + has_get.toString() +" + leichong_day = "+leichong_day)
        if (has_get){
            state = ZMLC_RewardState.HasGet
        }else{
            if (can_get){
            state = ZMLC_RewardState.CanGet
            }
        }
        return state
    }   

    // public GetLeiJiday(){
    //     let day = 0
    //     for (let i = 0 ; i < 3 ; i++){
    //         if (this.WeekLianChongInfo.dayCanFetchFlagList[day].flag[day * 2] == 1){
    //             day = day + 1
    //         }
    //     }
    //     return day
    // }

    public GetFunOpenDay(){
        let day = TimeHelper.FormatDHMS(TimeCtrl.Inst().ServerTime - TimeCtrl.Inst().GetTimeDayStart(ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.WeekLianChong))).day
        return day + 1
    }
    
    public SendWeekLianChongBuy(day:number,seq :number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WeekLianChong,1,day,seq)
    }

    public SendWeekLianChongSpecialBuy(seq :number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WeekLianChong,2,seq)
    }

    public GetTodayRechargeNum(){
        return this.WeekLianChongInfo.dayChongZhiNum / 10
    }

    public GetRedNum(){
        let red = 0
        for ( let i = 0 ; i < 3 ; i ++){
            if (this.GetSpecialState(i) == ZMLC_RewardState.CanGet){
                red ++
            }
        }

        for ( let i = 0 ; i < 3 ; i ++){
            for ( let j = 0 ; j < 3 ; j ++){
                if (this.GetRewardState(i,j) == ZMLC_RewardState.CanGet){
                    red ++
                }
            }
        }
        // LogError("red = " + red)
        return red > 0 ? 1 : 0
    }

    public GetFunIsClose(){
        let is_open = true 
        for ( let i = 0 ; i < 3 ; i ++){
            if (this.GetSpecialState(i) != ZMLC_RewardState.HasGet){
                is_open = false 
            }
        }

        for ( let i = 0 ; i < 3 ; i ++){
            for ( let j = 0 ; j < 3 ; j ++){
                if (this.GetRewardState(i,j) != ZMLC_RewardState.HasGet){
                    is_open = false 
                }
            }
        }
        return is_open
    }

}
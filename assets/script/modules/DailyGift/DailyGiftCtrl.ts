import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { CfgDailyGift, CfgDailyGiftData } from 'config/CfgDailyGift';
import { ActivityFuncsData } from 'modules/activity/ActivityFuncsData';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { RoleData } from 'modules/role/RoleData';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { LogError } from 'core/Debugger';

export enum DailyGift_OP_TYPE {
    info = 0,
    Buy = 1
}
export class DailyGiftCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaDailyGiftInfo, func: this.recvSCDailyGiftInfo }
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.DailyGift, DailyGiftData.Inst().ResultData, DailyGiftData.Inst().GetRed.bind(DailyGiftData.Inst())));
    }

    private recvSCDailyGiftInfo(data: PB_SCRaDailyGiftInfo) {
        DailyGiftData.Inst().setDailyGiftInfo(data);
    }

    public SendDailyGiftReq(type: DailyGift_OP_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.DailyGift, type, p1);
    }
}

export class DailyGiftResultData {
    @smartdata
    info: PB_SCRaDailyGiftInfo;
}

export class DailyGiftData extends DataBase {
    private result_info: DailyGiftResultData;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_info = CreateSMD(DailyGiftResultData);
    }

    public get ResultData() {
        return this.result_info;
    }

    public setDailyGiftInfo(data: PB_SCRaDailyGiftInfo) {
        this.result_info.info = data;
    }

    public GetDailyGiftList() {
        let list = [];
        if (ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.DailyGift)) {
            if (this.result_info.info) {
                let cfg = ActivityFuncsData.GetLevelCfg(CfgDailyGift.reward, this.result_info.info.level);
                for(let i=0;i<cfg.length;i++){
                    let buy_count =  this.result_info.info.buyCount[cfg[i].type];
                    let is_sell_out = buy_count >= cfg[i].limit_convert_count;
                    let limit_times = cfg[i].limit_convert_count - buy_count;
                    limit_times < 0 && (limit_times = 0);
                    list.push({ cfg: cfg[i], buy_count: buy_count, is_sell_out: is_sell_out, limit_times: limit_times })
                }
            }
        }
        list.sort((a,b)=>{
            return +a.is_sell_out - +b.is_sell_out;
        })
        return list;
    }

    public GetRed(){
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.DailyGift)) {
            return 0;
        } 
        if (!this.result_info.info) {
            DailyGiftCtrl.Inst().SendDailyGiftReq(DailyGift_OP_TYPE.info);
            return 0;
        } 
        let cfg = ActivityFuncsData.GetLevelCfg(CfgDailyGift.reward, this.result_info.info.level);
        for(let i=0;i<cfg.length;i++){
            if (cfg[i].price==0&&this.result_info.info.buyCount[cfg[i].type]==0){
                return 1;
            }
        }
        return 0;
    }

    public IsDailyGidtOpen(){
        return ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.DailyGift);
    }

    /**通过看广告领取免费礼包 */
    public IsAdFree(){
        let createTime = RoleData.Inst().ResultData.createTime;
        let cur_time = Math.floor(TimeCtrl.Inst().ServerTime) ;
        let day_two_time = TimeCtrl.Inst().GetTimeDayStart(createTime) +86400;
        return cur_time >= day_two_time && CfgDailyGift.other[0].is_open==1;
    }
}




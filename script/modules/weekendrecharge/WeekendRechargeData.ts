import { CfgWeekendRechargeData } from "config/CfgWeekendRecharge";
import { bit } from "core/net/bit";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { RoleData } from "modules/role/RoleData";
import { DataBase } from "../../data/DataBase";

export class WeekendRechargedSmartData {
    @smartdata
    WeekendRechargedInfo: PB_SCRaWeekendRechargeInfo;
}

export class WeekendRechargedData extends DataBase {
    //public ResultData : LoginResultData;
    public WeekendRechargedSmartData: WeekendRechargedSmartData;
    private WeekendRechargedInfo: PB_SCRaWeekendRechargeInfo;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        this.WeekendRechargedSmartData = CreateSMD(WeekendRechargedSmartData);
    }

    public OnWeekendRechargeInfo(data: PB_SCRaWeekendRechargeInfo) {
        this.WeekendRechargedInfo = data
        this.WeekendRechargedSmartData.WeekendRechargedInfo = data
    }

    public GetWeekendRechargeList() {
        let role_level = this.WeekendRechargedInfo.openLevel || 1//RoleData.Inst().GetRoleLevel()
        let cfg = CfgWeekendRechargeData.gift_configure.filter(cfg => {
            return cfg.start_level <= role_level && cfg.end_level >= role_level;
        });

        let data = [];
        let info
        for (const cards of cfg) {
            let num = (cards.diamond <= this.GetHasRechargeNum() && this.GetIsGetBySeq(cards.seq)) ? cards.seq : 1000 - cards.seq
            info = {
                seq: cards.seq,
                pai: num,
                start_level: cards.start_level,
                end_level: cards.end_level,
                reward_item: cards.reward_item,
                // stuff_num:cards.stuff_num,
                diamond: cards.diamond,
            }
            data.push(info);
        }
        data.sort((a: any, b: any) => {
            let sortNumber = 0
            if (a.pai < b.pai) {
                sortNumber = 1;
            }
            if (a.pai > b.pai) {
                sortNumber = -1;
            }
            return sortNumber
        });
        return data
    }

    //是否已领取
    public GetIsGetBySeq(seq: number) {
        return bit.d2b(this.WeekendRechargedInfo.receiveFlag)[32 - seq] == 1
        // return false
    }

    public GetHasRechargeNum() {
        return this.WeekendRechargedInfo ? this.WeekendRechargedInfo.totalChongzhi : 0
        // return 549
    }

    //如果领完文字显示啥
    public GetNextNeedRecharge() {
        let data = this.GetWeekendRechargeList()
        let now = this.GetHasRechargeNum()
        for (const info of data) {
            if (info.diamond > now) {
                return info.diamond - now
            }
        }
        return 0
    }

    //总红点
    public GetAllRed() {
        if (this.WeekendRechargedInfo) {
            let recharge_num = this.GetHasRechargeNum()
            let data = this.GetWeekendRechargeList()
            for (const info of data) {
                if (recharge_num >= info.diamond && !this.GetIsGetBySeq(info.seq)) {
                    return 1
                }
            }
        }
        return 0
    }

    public SendGetInfo() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WeekendRecharge, 0)
    }

    public SendGetWeekendReward(seq: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WeekendRecharge, 1, seq)
    }

}

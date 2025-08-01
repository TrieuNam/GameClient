import { CfgIntegralTurntableData } from "config/CfgIntegralTurntable";
import { CreateSMD, smartdata, SMDTriggerNotify } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { DataBase } from "../../data/DataBase";
import { IntegralTurntableView } from "./IntegralTurntableView";
class IntegralInfoData {
    @smartdata
    Info: PB_SCRaJifenZhuanpan;
}

class IntegralTurntableResultData {
    @smartdata
    TurntableInfoFlush: boolean = false;
}

export class IntegralTurntableData extends DataBase {
    public ResultData: IntegralTurntableResultData;
    private TurntableInfo: IntegralInfoData;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.ResultData = CreateSMD(IntegralTurntableResultData);
        this.TurntableInfo = new IntegralInfoData();
    }

    public OnTurntableInfo(data: PB_SCRaJifenZhuanpan) {
        this.TurntableInfo.Info = data;
        this.ResultData.TurntableInfoFlush = !this.ResultData.TurntableInfoFlush;
    }

    
    public get Info() {
        return this.TurntableInfo.Info
    }

    //总红点
    public GetAllRed() {
        let red = 0;
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.JiFenChouJiang);
        let old_time = ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.JiFenChouJiang)
        if (act_start != old_time) {
            return 1;
        }
        red += this.GetScoreRed(1);
        return red;
    }

    //积分红点
    public GetScoreRed(type: number) {
        let info = this.GetLuckDrawConfig();
        let item_num = this.GetScoreNum();
        if (type == 1 && item_num >= info.first_consume_score) {
            return 1;
        } else if (type == 10 && item_num >= info.ten_consume_score) {
            return 1;
        }
        return 0;
    }

    public ClearFirstRemind() {
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.JiFenChouJiang);
        if (act_start != ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.JiFenChouJiang)) {
            ActivityRandData.Inst().SetRemind(ACTIVITY_TYPE.JiFenChouJiang, act_start);
            SMDTriggerNotify(this.ResultData)
        }
    }

    public getLuckydrawConfig() {
        let type = this.getRewardType();
        let data = CfgIntegralTurntableData.luck_draw_reward.filter(cfg => {
            return cfg.reward_group == type;
        });
        return data;
    }

    public GetSeqReward(rewardSeqs: any[]) {
        let data = this.getLuckydrawConfig();
        let reward = [];
        for (let i = 0; i < rewardSeqs.length; i++) {
            reward.push(data[rewardSeqs[i] % 14].reward);
        }
        return reward;
    }

    public SendChouJiang(num: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.JiFenChouJiang, 1, num);
        IntegralTurntableView.IsDrawing = true;
    }

    public SendGetAward() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.JiFenChouJiang, 2);
    }

    //奖励是组
    public getRewardType() {
        return this.Info ? this.Info.rewardGroup : 1;
    };

    //抽奖配置
    public GetLuckDrawConfig() {
        return CfgIntegralTurntableData.luck_draw_configuration[0];
    }

    //保底奖励
    public GetMinimumGuarantee() {
        let type = this.getRewardType();
        let data = CfgIntegralTurntableData.luck_draw_reward.filter(cfg => {
            return cfg.reward_group == type && cfg.bao_di_id == 1;
        });
        return data[0];
    }

    //积分
    public GetScoreNum() {
        return this.Info ? this.Info.jifen : 0;
    }

    //距离下次保底剩余次数
    public GetMustNum() {
        return this.Info ? this.Info.timesToBigPrize : 0;
    }

    // 1 珍稀 2 其他
    public GetRewardPreviewShowData(type: number) {
        return CfgIntegralTurntableData.rate_show.filter(cfg => {
            return cfg.start_level <= this.Info.roleLevel && cfg.end_level >= this.Info.roleLevel && cfg.name_id == type;
        });
    }

    //道具消耗配置
    public GetIntegralSourceShowData() {
        return CfgIntegralTurntableData.item_configuration;
    }

    //是否为大奖
    public getIsBigPrize(seq: number) {
        let bigPrize = [0, 3, 7, 10];
        return bigPrize.indexOf(seq) != -1;
    }


}

import { CfgMonthlyCard, CfgMonthlyCardData } from 'config/CfgMonthlyCard';
import { DataBase } from 'data/DataBase';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { CreateSMD, smartdata, SMDTriggerNotify } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ActivityData } from 'modules/activity/ActivityData';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { ActivityFuncsData } from 'modules/activity/ActivityFuncsData';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RoleData } from 'modules/role/RoleData';
import { CfgHelper } from '../../helpers/CfgHelper';

export enum MonthlyCard_OP_TYPE {
    INFO = 0, //请求信息
    FETCH = 1 //请求领取
}

export class MonthlyCardCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaMonthCardInfo, func: this.recvSCMonthCardInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.MonthlyCard, MonthlyCardData.Inst().ResultData, MonthlyCardData.Inst().GetRed.bind(MonthlyCardData.Inst())));
    }

    private recvSCMonthCardInfo(data: PB_SCRaMonthCardInfo) {
        MonthlyCardData.Inst().SetMonthlyCardInfo(data);
    }

    public SendReq(type: MonthlyCard_OP_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.MonthlyCard, type, p1);
    }
}

export class MonthlyCardResultData {
    @smartdata
    info: PB_SCRaMonthCardInfo;
}
export class MonthlyCardData extends DataBase {
    private result_data: MonthlyCardResultData;
    constructor() {
        super();
        this.createSmartData();
    }

    public get ResultData() {
        return this.result_data;
    }

    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(MonthlyCardResultData);
    }

    public SetMonthlyCardInfo(data: PB_SCRaMonthCardInfo) {
        this.result_data.info = data;
    }

    private card_cfg: { [type: number]: CfgMonthlyCardData[] };
    public GetMonthlyCardCfg() {
        if (!this.card_cfg) {
            this.card_cfg = CfgHelper.reSetdatas(CfgMonthlyCard.month_card_configuration, ["card_type"], true);
        }
        return this.card_cfg;
    }

    public GetMonthlyCardInfo(type: number) {
        let cfgs = this.GetMonthlyCardCfg();
        let level = this.result_data.info.cardList[type].buyLevel;
        if (!level) {
            level = RoleData.Inst().GetRoleLevel();
        }
        let cfg = ActivityFuncsData.GetLevelCfg(cfgs[type], level);
        if (cfg[0])
            return cfg[0];
    }

    public GetMonthlyCardInfo2(type: number) {
        return this.result_data.info.cardList[type];
    }


    /**红点 */
    public GetRed() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.MonthlyCard)) {
            return 0;
        }
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.MonthlyCard);
        let old_time = ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.MonthlyCard)
        if (act_start != old_time) {
            return 1;
        }
        if (!this.result_data.info) {
            MonthlyCardCtrl.Inst().SendReq(MonthlyCard_OP_TYPE.INFO);
            return 0;
        }
        let red = 0;
        red += this.GetFetchMarkRed(0);
        red += this.GetFetchMarkRed(1);
        return red;
    }

    public GetFetchMarkRed(index: number) {
        let info = this.result_data.info.cardList[index];
        if (info.haveDays > 0 && !info.fetchMark) {
            return 1;
        }
        return 0;
    }

    public ClearFirstRemind() {
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.MonthlyCard);
        if (act_start != ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.MonthlyCard)) {
            ActivityRandData.Inst().SetRemind(ACTIVITY_TYPE.MonthlyCard, act_start);
            SMDTriggerNotify(this.result_data)
        }
    }

    public IsDailyGidtOpen() {
        return ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.MonthlyCard);
    }
}
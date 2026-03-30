import { CreateSMD, smartdata, SMDTriggerNotify } from "data/SmartData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { DataBase } from "../../data/DataBase";
import { LogError } from "core/Debugger";
import { CfgExclusiveGiftBagData } from "config/CfgExclusiveGiftBag";
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { ActivityData } from "modules/activity/ActivityData";
import { ExclusiveGiftBagView } from "./ExclusiveGiftBagView";
import { ViewManager } from "manager/ViewManager";
import { Timer } from "modules/time/Timer";
import { CfgActivityData } from "config/CfgActivity";

class ExclusiveResultData {
    @smartdata
    ExclusiveInfoFlush: boolean = false;
}

export class ExclusiveGiftBagData extends DataBase {
    public result_data: ExclusiveResultData;
    private ExclusiveInfo: PB_SCRaExclusiveGift;
    private gift_data: any = [];
    private gift_old_data: any;
    private timer_handle_draw: any = null;

    constructor() {
        super();
        this.createSmartData();
    }
    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(ExclusiveResultData);
    }
    public OnExclusiveInfo(data: PB_SCRaExclusiveGift) {
        this.gift_data = [];
        let check_new = 1;
        if (!this.gift_old_data) {
            this.gift_old_data = [];
            check_new = 0;
        }
        for (let i = 0; i < data.gifts.length; i++) {
            let seq = data.gifts[i].seq;
            if (data.gifts[i].endTimestamp <= Math.floor(TimeCtrl.Inst().ServerTime)) {
                LogError("礼包已结束")
                continue;
            };
            this.gift_data.push(seq);
            if (check_new && this.gift_old_data.indexOf(seq) == -1) {
                if (ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou) && !ViewManager.Inst().IsOpen(ExclusiveGiftBagView) && 
                ActivityRandData.Inst().CheckRightActivity(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou)) {
                    ViewManager.Inst().OpenView(ExclusiveGiftBagView, i);
                }
            }
        }

        this.gift_old_data = this.gift_data;
        this.ExclusiveInfo = data;
        this.result_data.ExclusiveInfoFlush = !this.result_data.ExclusiveInfoFlush;
        LogError("PB_SCRaExclusiveGift", data)
    }

    public get ResultData() {
        return this.result_data;
    }

    /**是否显示入口图标 */
    public IsGiftBagActShow() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou)) {
            return false;
        }
        let gift = this.getGiftBag();
        if (gift.length > 0) {
            return true;
        }
        return false;
    }
    /**按钮倒计时 */
    public ActTimeShow() {
        let gift = this.getGiftBag();
        LogError("当前时间",TimeCtrl.Inst().ServerTime);
        if (gift.length > 0) {
            let data = gift[0];
            let time = data.endTimestamp - Math.floor(TimeCtrl.Inst().ServerTime);

            Timer.Inst().CancelTimer(this.timer_handle_draw)
            this.timer_handle_draw = Timer.Inst().AddRunTimer(() => {
                  ActivityData.Inst().CheckRandOpenData();
            }, time, 1, false)
            return time;
        }
        return null;
    }

    //礼包列表
    public getGiftBag() {
        let giftArr = [];
        let num = this.ExclusiveInfo.gifts ? this.ExclusiveInfo.gifts.length : 0;
        let time = Math.floor(TimeCtrl.Inst().ServerTime);
        for (let i = 0; i < num; i++) {
            let data = this.ExclusiveInfo.gifts[i];
            if (data.endTimestamp > time) {
                giftArr.push(data);
            }
        }
        return giftArr;
    }

    //礼包数量
    public getGiftBagNum() {
        let gift = this.getGiftBag();
        return gift.length;
    }

    public getGiftBagConfig(type: number) {
        let data = CfgExclusiveGiftBagData.gift_configuration.filter(cfg => {
            return cfg.type == type;
        });
        return data[0];
    }

    //礼包
    public getGiftBagData(index: number) {
        let gift = this.getGiftBag();
        return gift[index];
    }

    //总红点
    public GetAllRed() {
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou);
        let old_time = ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou)
        if (act_start != old_time) {
            return 1;
        }
        return 0;
    }

    public ClearFirstRemind() {
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou);
        if (act_start != ActivityRandData.Inst().GetRemind(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou)) {
            ActivityRandData.Inst().SetRemind(ACTIVITY_TYPE.ZhuanShuLiBaoRuKou, act_start);
            SMDTriggerNotify(this.result_data)
        }
    }
}

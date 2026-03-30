import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { DataBase } from 'data/DataBase';
import { CreateSMD, smartdata } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ACTIVITY_ENTER_TYPE, ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { ViewManager } from 'manager/ViewManager';
import { LuckyGiftView } from './LuckyGiftView';
import { CfgLuckyGift } from 'config/CfgLuckyGift';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { LogError } from 'core/Debugger';
import { CfgActivityData } from 'config/CfgActivity';

export enum LuckyGift_OP_TYPE {
    INFO = 0, //请求信息
    Buy = 1 //购买礼包seq
}

export class LuckyGiftCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaLuckCourtesyInfo, func: this.recvSCLuckyGiftInfo }
        ]
    }

    protected initCtrl() {
    }

    private recvSCLuckyGiftInfo(data: PB_SCRaLuckCourtesyInfo) {
        LuckyGiftData.Inst().SetLuckyGiftInfo(data);
        LogError("幸运礼遇",data)
    }

    public SendReq(type: LuckyGift_OP_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.LuckyGift, type, p1);
    }
}

export class LuckyGiftResultData {
    @smartdata
    is_gift_change: boolean;
}
export class LuckyGiftData extends DataBase {
    private result_data: LuckyGiftResultData;
    private gift_old_data: { [key: string]: number };//礼包是否是旧礼包
    private gift_data: { info: IPB_RaLuckCouttesyGiftDef, index: number, key: string }[];
    private open_level: number = 1;
    constructor() {
        super();
        this.createSmartData();
        this.initData;
    }

    public get ResultData() {
        return this.result_data;
    }

    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(LuckyGiftResultData);
    }

    private initData() {
        this.gift_data = null;
        this.gift_old_data = null;
        this.open_level = 1;
    }

    public SetLuckyGiftInfo(data: PB_SCRaLuckCourtesyInfo) {
        let check_new = 1;
        this.gift_data = [];
        if (!this.gift_old_data) {
            this.gift_old_data = {};
            check_new = 0;
        }
        for (let i = 0; i < data.giftInfo.length; i++) {
            let gift_info = data.giftInfo[i];
            let key = gift_info.endTimestamp + "-" + gift_info.giftSeq;
            if (check_new && !this.gift_old_data[key] && gift_info.isValid) {
                if (ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.LuckyGift) && !ViewManager.Inst().IsOpen(LuckyGiftView))
                    ViewManager.Inst().OpenView(LuckyGiftView, key);
            }
            this.gift_old_data[key] = 1;
            if (gift_info.isValid)
                this.gift_data.push({ index: i, info: gift_info, key: key });
        }
        this.open_level = data.openLevel;
        this.result_data.is_gift_change = !this.result_data.is_gift_change;
    }

    public GetGiftData() {
        return this.gift_data;
    }

    public GetGiftOpenLevel() {
        return this.open_level;
    }


    /**是否显示入口图标 */
    public IsLuckyGiftShow() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.LuckyGift)) {
            return false;
        }
        if (!this.gift_data) {
            LuckyGiftCtrl.Inst().SendReq(LuckyGift_OP_TYPE.INFO);
            return false;
        }
        return this.gift_data.length > 0;
    }

    /**入口图标 */
    public ActIconTitleShow() {
        if (this.gift_data&&this.gift_data.length > 0) {
            let data = this.gift_data[0];
            let cfg = CfgLuckyGift.gift_configure[data.info.giftSeq];
            let icon = "XingYunLiYu" + cfg.icon
            let title =  cfg.name
            let time=data.info.endTimestamp;
            return { icon: icon, title: title, time: time };
        }
        return null;
    }

    /**按钮倒计时 */
    public ActTimeShow() {
        if (this.gift_data && this.gift_data.length > 0) {
            let data = this.gift_data[0];
            let time = data.info.endTimestamp;
            return time - Math.floor(TimeCtrl.Inst().ServerTime) ;
        }
        return null;
    }
    //获取更多按钮的显示逻辑
    public GetMoreServerShow() {
        let rand_list = ActivityRandData.Inst().GetActBtnList(ACTIVITY_ENTER_TYPE.MORE);
        if(rand_list.length == 1){
            return {type: ACTIVITY_ENTER_TYPE.MORE, icon: rand_list[0].sprite, title: rand_list[0].text};
        }
        let week = TimeCtrl.Inst().GetWeek()
        let data = CfgActivityData.sprite_change[0]
        let index = data.time.indexOf(week.toString())
        if (index >= 0) {
            return { icon: data.sprite, title: data.text, over_effect: data.over_special_effect_id };
        }
        data = CfgActivityData.sprite_change[1]
        index = data.time.indexOf(week.toString())
        if (index >= 0) {
            return { icon: data.sprite, title: data.text, over_effect: data.over_special_effect_id };
        }
        return null
    }
}
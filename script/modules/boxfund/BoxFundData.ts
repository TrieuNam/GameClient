import { CfgBoxFundData } from "config/CfgBoxFund";
import { bit } from "core/net/bit";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BoxData } from "modules/box/BoxData";
import { RechargeData } from "modules/recharge/RechargeData";
import { RoleData } from "modules/role/RoleData";
import { DataBase } from "../../data/DataBase";


export class BoxFundSmartData {
    @smartdata
    BoxFundInfo: PB_SCRaBoxFundInfo;

    // GuMoLayerInfo: PB_SCGuMoPagodaLayerInfo;
    // @smartdata
    // RedFlush : boolean = false;
}

export class BoxFundData extends DataBase {
    //public ResultData : LoginResultData;
    public BoxFundSmartData: BoxFundSmartData;
    private BoxFundInfo: PB_SCRaBoxFundInfo = null;
    private sel_index = 1;
    constructor() {
        super();
        this.createSmartData();
    }


    private createSmartData() {
        // let self = this;
        this.BoxFundSmartData = CreateSMD(BoxFundSmartData);
    }

    public OnBoxFundInfo(data: PB_SCRaBoxFundInfo) {
        this.BoxFundInfo = data
        this.BoxFundSmartData.BoxFundInfo = data
    }

    //展示列表
    public GetBoxFundShowList(phase: number) {
        return CfgBoxFundData.gift_configure.filter(cfg => {
            return cfg.phase == phase;
        });
    }

    //展示奖励列表 1 普通 2 高级
    public GetBoxFundRewardShowList(sort_seq: number, phase: number) {
        return CfgBoxFundData.item_reward.filter(cfg => {
            return cfg.sort_seq == sort_seq && cfg.phase == phase;
        });
    }

    public GetListLength(pause: number) {
        // let pause = this.GetNowPhase();
        let data = this.GetBoxFundShowList(pause);
        return data[data.length - 1].seq
    }
    //宝箱等级
    public GetBoxLevel(): number {
        return RoleData.Inst().GetRoleLevel()
    }

    //当前索引是否领取 1 普通 2 高级
    public GetRewardGet(seq: number, type: number) {
        if (type == 1 && this.BoxFundInfo != null) {
            return bit.d2b(this.BoxFundInfo.commonFetchFlag)[32 - seq] == 1
        } else if (type == 2 && this.BoxFundInfo != null) {
            // return this.LevelFundInfo.seniorFetchFlag.toString(2).split("").reverse().map(Number)[seq]==1;
            return bit.d2b(this.BoxFundInfo.seniorFetchFlag)[32 - seq] == 1
        }
        return false
    }

    //当前阶段
    public GetNowPhase() {
        return 1
    }

    //是否购买
    public GetIsBuyBoxFund(pause: number) {
        if (this.BoxFundInfo && this.BoxFundInfo.phaseBuyFlag != undefined) {
            return bit.d2b(this.BoxFundInfo.phaseBuyFlag)[32 - pause] == 1
        }
        return false
    }

    public GetMaxPause() {
        return CfgBoxFundData.other[0].phase
    }

    public GetPaseIsOver(pause: number) {
        // if (pause == 2 ){return true}
        let is_buy = this.GetIsBuyBoxFund(pause)
        if (!is_buy) { return false }
        let data = this.GetBoxFundShowList(pause)
        for (const info of data) {
            if (!this.GetRewardGet(info.seq, 1) || !this.GetRewardGet(info.seq, 2)) {
                return false
            }
        }
        return true
    }

    //活动是否显示入口
    public GetIsActiveOver() {
        // let historyChongzhiCount = RechargeData.Inst().GetHistoryChongzhi()
        // if (historyChongzhiCount / 10 < CfgBoxFundData.other[0].accumulate_recharge_show) {
        //     return false
        // }
        let max = this.GetMaxPause()
        let is_over = false
        for (let i = 1; i <= max; i++) {
            if (!this.GetPaseIsOver(i)) {
                is_over = true
            }
        }
        return is_over
    }

    public GetPauseData() {
        let max = this.GetMaxPause()
        let info
        let data = []
        for (const v of CfgBoxFundData.phase_configure) {
            // if (!this.GetPaseIsOver(v.phase)){
            info = {
                phase: v.phase,
                reward_multiple: v.reward_multiple,
                buy_money: v.buy_money,
                show_level: v.show_level,
                seg_name: v.seg_name,
                type: 1
            }
            data.push(info);
            // }
        }
        // for (let i = 1 ; i <= max ; i ++){
        // }
        return data
    }

    //阶段红点
    public GetPauseRed(pause: number) {
        let data = this.GetBoxFundShowList(pause)
        let box_level = BoxData.Inst().GetBoxLevel()
        for (const info of data) {
            if (info.level <= box_level) {
                if (!this.GetRewardGet(info.seq, 1)) {
                    return 1
                }
                if (!this.GetRewardGet(info.seq, 2) && this.GetIsBuyBoxFund(pause)) {
                    return 1
                }
            }
        }
        return 0
    }

    public GetAllRed() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.BoxFund)) {
            return 0;
        }
        if (!this.GetIsActiveOver())
            return 0;
        // let max = this.GetMaxPause()
        let max = 1
        let red = 0
        for (let i = 1; i <= max; i++) {
            red = red + this.GetPauseRed(i)
        }
        red = red == 0 ? 0 : 1
        return red
    }

    public GetPauseMoney(pause: number) {
        return CfgBoxFundData.phase_configure.filter(cfg => {
            return cfg.phase == pause;
        });
    }

    public SendGetBoxFundReward(type: number, seq: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.BoxFund, 1, type, seq)
    }

    public SendGetBoxFundIndo() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.BoxFund, 0)
    }

    public SetNowSelPhase(phase: number) {
        this.sel_index = phase
    }
    public GetNowSelPhase() {
        return this.sel_index
    }

    public ClearData() {
        this.sel_index = 1
    }
}


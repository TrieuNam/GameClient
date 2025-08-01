import { CfgLevelFundData } from "config/CfgLevelFund";
import { bit } from "core/net/bit";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { RoleData } from "modules/role/RoleData";
import { DataBase } from "../../data/DataBase";


export class LevelFundSmartData {
    @smartdata
    LevelFundInfo: PB_SCRaLevelFundInfo;

    // GuMoLayerInfo: PB_SCGuMoPagodaLayerInfo;
    // @smartdata
    // GuMoLayerFlush : boolean = false;
}

export class LevelFundData extends DataBase {
    //public ResultData : LoginResultData;
    public LevelFundSmartData: LevelFundSmartData;
    private LevelFundInfo: PB_SCRaLevelFundInfo = null;
    private ceshi = true
    private sel_index = 1
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        // let self = this;
        this.LevelFundSmartData = CreateSMD(LevelFundSmartData);
    }

    public OnLevelFundInfo(data: PB_SCRaLevelFundInfo) {
        this.LevelFundInfo = data;
        this.LevelFundSmartData.LevelFundInfo = data;
        // ServerActivityData.Inst().FlushRedPoint()
    }

    //展示列表
    public GetLevelFundShowList(phase: number) {
        return CfgLevelFundData.gift_configure.filter(cfg => {
            return cfg.phase == phase;
        });
    }

    //展示奖励列表 1 普通 2 高级
    public GetLevelFundRewardShowList(sort_seq: number, phase: number) {
        return CfgLevelFundData.item_reward.filter(cfg => {
            return cfg.sort_seq == sort_seq && cfg.phase == phase;
        });
    }

    public GetListLength(pause: number) {
        // let pause = this.GetNowPhase();
        let data = this.GetLevelFundShowList(pause);
        return data[data.length - 1].seq
    }
    //人物等级
    public GetRoleLevel(): number {
        return RoleData.Inst().GetRoleLevel();
    }

    //当前索引是否领取 1 普通 2 高级
    public GetRewardGet(seq: number, type: number) {
        if (type == 1 && this.LevelFundInfo != null) {
            return bit.d2b(this.LevelFundInfo.commonFetchFlag)[32 - seq] == 1
        } else if (type == 2 && this.LevelFundInfo != null) {
            // return this.LevelFundInfo.seniorFetchFlag.toString(2).split("").reverse().map(Number)[seq]==1;
            return bit.d2b(this.LevelFundInfo.seniorFetchFlag)[32 - seq] == 1
        }
        return false
    }

    //当前阶段
    public GetNowPhase() {
        return 1
    }

    //是否购买
    public GetIsBuyLevelFund(pause: number) {
        if (this.LevelFundInfo && this.LevelFundInfo.phaseBuyFlag != undefined) {
            return bit.d2b(this.LevelFundInfo.phaseBuyFlag)[32 - pause] == 1
        }
        return false
    }

    public GetMaxPause() {
        return CfgLevelFundData.other[0].phase
    }

    public GetPaseIsOver(pause: number) {
        let is_buy = this.GetIsBuyLevelFund(pause)
        if (!is_buy) { return false }
        let data = this.GetLevelFundShowList(pause)
        for (const info of data) {
            if (!this.GetRewardGet(info.seq, 1) || !this.GetRewardGet(info.seq, 2)) {
                return false
            }
        }
        return true
    }

    //活动是否结束
    public GetIsActiveOver() {
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
        for (const v of CfgLevelFundData.phase_configure) {
            // if (!this.GetPaseIsOver(v.phase)){
            info = {
                phase: v.phase,
                reward_multiple: v.reward_multiple,
                buy_money: v.buy_money,
                show_level: v.show_level,
                seg_name: v.seg_name,
                type: 0
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
        let data = this.GetLevelFundShowList(pause)
        let box_level = this.GetRoleLevel()
        // let red = 0
        for (const info of data) {
            if (info.level <= box_level) {
                if (!this.GetRewardGet(info.seq, 1)) {
                    return 1
                }
                if (!this.GetRewardGet(info.seq, 2) && this.GetIsBuyLevelFund(pause)) {
                    return 1
                }
            }
        }

        return 0
    }

    public GetAllRed() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.LevelFund)) {
            return 0;
        }
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
        return CfgLevelFundData.phase_configure.filter(cfg => {
            return cfg.phase == pause;
        });
    }

    public SendGetLevelFundReward(type: number, seq: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.LevelFund, 1, type, seq)
    }

    public SendGetLevelFundIndo() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.LevelFund, 0)
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

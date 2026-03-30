
import { CfgKnightCardData } from "config/CfgKnightCard";
import { bit } from "core/net/bit";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";

export class KnightCardResultData {
    @smartdata
    Info: PB_SCRaAdvertisementEquityInfo = new PB_SCRaAdvertisementEquityInfo();
}

export class KnightCardData extends DataBase {
    public ResultData: KnightCardResultData;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(KnightCardResultData);
    }

    public SetRaAdvertisementEquityInfo(protocol: PB_SCRaAdvertisementEquityInfo) {
        this.ResultData.Info = protocol
    }

    public CfgKnightCardBuyMoney() {
        return CfgKnightCardData.knight_card[0].buy_money
    }

    public CfgKnightCardFirstBuyRewardItem() {
        return CfgKnightCardData.knight_card[0].first_buy_reward_item
    }


    public GetKnightCardShowList() {
        let role_level = RoleData.Inst().GetRoleLevel();
        let show_list = CfgKnightCardData.knight_zheng.filter(cfg => cfg.level_min <= role_level && cfg.level_max >= role_level);
        return show_list.reverse()
    }

    public GetKnightCardGet(seq: number) {
        let is_get = false
        let can_get = false
        if (TimeCtrl.Inst().ServerTime > this.ResultData.Info.refreshTime) {
            is_get = false
            can_get = 1 == seq
        } else {
            is_get = bit.hasflag(this.ResultData.Info.fetchFlag, seq)
            can_get = !is_get && (1 == seq || bit.hasflag(this.ResultData.Info.fetchFlag, seq - 1))
        }
        return { is_get, can_get }
    }

    public GetKnightCardIsBuy() {
        return 1 == this.ResultData.Info.isBuy
    }

    public GetKnightCardRedPoint() {
        if (!FunOpen.Inst().GetFunIsOpen(Mod.KnightCard.Main).is_open) {
            return 0
        }
        return TimeCtrl.Inst().ServerTime > this.ResultData.Info.refreshTime ? 1 : 0
    }
}

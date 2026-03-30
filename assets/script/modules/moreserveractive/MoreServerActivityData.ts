import { CfgActivityData } from "config/CfgActivity";
import { LogError } from "core/Debugger";
import { CreateSMD, smartdata } from "data/SmartData";
import { ACTIVITY_ENTER_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { AffordPresentCtrl, AffordPresentData } from "modules/AffordPresent/AffordPresentCtrl";
import { CaveLootData } from "modules/caveloot/CaveLootData";
import { CommodityGuildData } from "modules/CommodityGuild/CommodityGuildData";
import { IntegralTurntableData } from "modules/integralTurntable/IntegralTurntableData";
import { ShenQiDrawData } from "modules/ShenQiDraw/ShenQiDrawCtrl";
import { WeekendRechargedData } from "modules/weekendrecharge/WeekendRechargeData";
import { DataBase } from "../../data/DataBase";

class MoreServerAvtivityResultData {
    @smartdata
    flush: boolean;
    // result:number;
}

export class MoreServerActivityData extends DataBase {
    public ResultData: MoreServerAvtivityResultData;
    constructor() {
        super();
        this.createSmartData();
    }
    private open_name: string;
    private ce = false;
    private createSmartData() {
        // let self = this;
        this.ResultData = CreateSMD(MoreServerAvtivityResultData);
    }

    public GetOpenActivityList() {
        // return CfgActivityData.ceshi
        // return CfgActivityData.more_activity
        return ActivityRandData.Inst().GetActBtnList(ACTIVITY_ENTER_TYPE.MORE)
    }

    public SetNowViewName(name: string) {
        this.open_name = name
    }

    public GetNowViewName() {
        return this.open_name
    }

    public FlushRedPoint() {
        this.ResultData.flush = !this.ResultData.flush
    }

    public GetAllRed() {
        let red1 = CaveLootData.Inst().GetAllRed()
        let red2 = WeekendRechargedData.Inst().GetAllRed()
        let red3 = CommodityGuildData.Inst().GetAllRed()
        let red4 = AffordPresentData.Inst().GetRedNum()
        let red5 = ShenQiDrawData.Inst().GetRedNum()
        let red6 = IntegralTurntableData.Inst().GetAllRed()
        let red = (red1 + red2 + red3 + red4 + red5 + red6) > 0 ? 1 : 0
        // LogError("red = "+red)
        return red
    }

    public GetMoreServerIsOPen() {
        let data = this.GetOpenActivityList()
        return data.length != 0
    }

    public Showceshi() {
        this.ce = !this.ce
        LogError(this.ce)
    }

    public GetDataCe() {
        return this.ce
    }
}

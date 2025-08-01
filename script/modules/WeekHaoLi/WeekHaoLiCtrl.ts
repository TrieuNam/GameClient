import { CfgWeekHaoLiData } from "config/CfgWeekHaoLi";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { CfgChaoZhiXianLi } from '../../config/CfgChaoZhiXianLi';
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";

export class WeekHaoLiCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaWeekendHaoLiInfo, func: this.onSCRaWeekendHaoLiInfo },
        ]
    }
    
    // protected initCtrl() {
    //     this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.WeekHaoLi,
    //         WeekHaoLiData.Inst().flush_info,
    //         WeekHaoLiData.Inst().GetRedNum.bind(WeekHaoLiData.Inst())));
    // }

    private onSCRaWeekendHaoLiInfo(protocol:PB_SCRaWeekendHaoLiInfo)
    {
        // LogError("3030?周末豪礼下发",protocol)
        WeekHaoLiData.Inst().SetAffordPresentInfo(protocol)
    }

    
    
}

class WeekHaoLiInfo {
    @smartdata
    WeekHaoLiInfo: PB_SCRaWeekendHaoLiInfo;

}

export class WeekHaoLiData extends DataBase {
    public WeekHaoLiSmartData: WeekHaoLiInfo
    private WeekHaoLiInfo:PB_SCRaWeekendHaoLiInfo

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.WeekHaoLiSmartData = CreateSMD(WeekHaoLiInfo);
        // this.flush_info.need_flush = 0
    }

    public SetAffordPresentInfo(protocol:PB_SCRaWeekendHaoLiInfo){
        this.WeekHaoLiInfo = protocol
        this.WeekHaoLiSmartData.WeekHaoLiInfo = protocol
    }

    public GetShowRewardList(){
        let cfg = CfgWeekHaoLiData.gift_configure.filter(cfg => {
            return cfg.start_level <= this.WeekHaoLiInfo.level && cfg.end_level >= this.WeekHaoLiInfo.level;
        });
        cfg.sort((a: any, b: any) => {
            let sortNumber = 0
            let a_sort = a.limit_convert_count <= this.GetGiftBuyTime(a.seq) ? a.seq : 1000 - a.seq;
            let b_sort = b.limit_convert_count <= this.GetGiftBuyTime(b.seq) ? b.seq : 1000 - b.seq;
            if (a_sort < b_sort) {
                sortNumber = 1;
            }
            if (a_sort > b_sort) {
                sortNumber = -1;
            }
            return sortNumber
        });
        return cfg
    }

    public GetGiftBuyTime(seq:number){
        return this.WeekHaoLiInfo.buyTimes[seq]
    }

    public SendWeekHaoLiBuy(seq:number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WeekHaoLi,1,seq)
    }

}
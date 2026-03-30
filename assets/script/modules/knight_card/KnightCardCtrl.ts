
import { RemindRegister } from 'data/HandleCollectorCfg';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { KnightCardData } from './KnightCardData';

export class KnightCardCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaAdvertisementEquityInfo, func: this.OnRaAdvertisementEquityInfo },
        ]
    }

    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.KnightCard.Main, KnightCardData.Inst().ResultData, KnightCardData.Inst().GetKnightCardRedPoint.bind(KnightCardData.Inst(), "Info")));
    }

    public OnRaAdvertisementEquityInfo(protocol: PB_SCRaAdvertisementEquityInfo) {
        KnightCardData.Inst().SetRaAdvertisementEquityInfo(protocol);
    }

    public SendRandActivityOperaReq(operaType?: number, param1?: number, param2?: number, param3?: number,) {
        let protocol = this.GetProtocol(PB_CSRandActivityOperaReq);
        protocol.randActivityType = ACTIVITY_TYPE.AdEquity;
        protocol.operaType = operaType;
        protocol.param1 = param1 ?? 0;
        protocol.param2 = param2 ?? 0;
        protocol.param3 = param3 ?? 0;
        this.SendToServer(protocol);
    }

    public SendRandActivityOperaReqInfo() {
        this.SendRandActivityOperaReq(0);
    }

    public SendRandActivityOperaReqFetch() {
        this.SendRandActivityOperaReq(1);
    }
}


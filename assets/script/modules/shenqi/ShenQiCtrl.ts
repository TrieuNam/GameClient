
import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BagData } from 'modules/bag/BagData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { ShenQiConfig } from './ShenQiConfig';
import { ShenQiData } from './ShenQiData';

export class ShenQiCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCShenQiListInfo, func: this.OnShenQiListInfo },
            { msgType: PB_SCShenQiOneInfo, func: this.OnShenQiOneInfo },
            { msgType: PB_SCShenQiOtherInfo, func: this.OnShenQiOtherInfo },
            { msgType: PB_SCShenQiDrawInfo, func: this.OnShenQiDrawInfo },
            { msgType: PB_SCShenQiRecordInfo, func: this.OnShenQiRecordInfo },
        ]
    }

    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ShenQi.Main,
            ShenQiData.Inst().ResultData,
            ShenQiData.Inst().GetShenQiRedNum.bind(ShenQiData.Inst()),"flush_info"));

        this.handleCollector.Add(RemindRegister.Create(Mod.ShenQi.Main, ShenQiData.Inst().ResultData, ShenQiData.Inst().GetShenQiRedNum.bind(ShenQiData.Inst(), "OtherInfo")));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));
    }

    public OnShenQiListInfo(protocol: PB_SCShenQiListInfo) {
        LogError("OnShenQiListInfo", protocol)
        ShenQiData.Inst().SetShenQiListInfo(protocol);
    }

    public OnShenQiOneInfo(protocol: PB_SCShenQiOneInfo) {
        LogError("OnShenQiOneInfo", protocol)
        ShenQiData.Inst().SetShenQiOneInfo(protocol);
    }

    public OnShenQiOtherInfo(protocol: PB_SCShenQiOtherInfo) {
        LogError("OnShenQiOtherInfo", protocol)
        ShenQiData.Inst().SetShenQiOtherInfo(protocol);
    }

    public OnShenQiDrawInfo(protocol: PB_SCShenQiDrawInfo) {
        LogError("OnShenQiDrawInfo", protocol)
        ShenQiData.Inst().SetShenQiDrawInfo(protocol);
    }

    public OnShenQiRecordInfo(protocol: PB_SCShenQiRecordInfo) {
        LogError("OnShenQiRecordInfo", protocol)
        ShenQiData.Inst().SetShenQiRecordInfo(protocol);
    }

    public SendShenQiReq(type?: number, param1?: number, param2?: number) {
        let protocol = this.GetProtocol(PB_CSShenQiReq);
        protocol.reqType = type;
        protocol.param1 = param1 ?? 0;
        protocol.param2 = param2 ?? 0;
        this.SendToServer(protocol);
    }

    public SendShenQiReqRecordInfo() {
        this.SendShenQiReq(ShenQiConfig.ReqType.record_info);
    }

    public SendShenQiReqLevelUp(id: number, use_chip: boolean) {
        this.SendShenQiReq(ShenQiConfig.ReqType.level_up, id, use_chip ? 1 : 0);
    }

    public SendShenQiReqWearing(id: number) {
        this.SendShenQiReq(ShenQiConfig.ReqType.wearing, id);
    }

    public SendShenQiReqDraw() {
        this.SendShenQiReq(ShenQiConfig.ReqType.draw);
    }

    private BagNumChange() {
        SMDTriggerNotify(ShenQiData.Inst().ResultData, "OtherInfo")
    }
}



import { GetCfgValue } from 'config/CfgCommon';
import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { ViewManager } from 'manager/ViewManager';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { RANK_TYPE } from 'modules/common/CommonEnum';
import { Mod } from 'modules/common/ModuleDefine';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { NewServerCompetitionData, NewServerCompetitionRankType } from './NewServerCompetitionData';
import { NewServerCompetitionView } from './NewServerCompetitionView';

export class NewServerCompetitionCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaNewServerInfo, func: this.OnRaNewServerInfo },
            { msgType: PB_SCRaNewServerGlobalInfo, func: this.OnRaNewServerGlobalInfo },
            { msgType: PB_SCRANewServerRankList, func: this.OnRANewServerRankList },
        ]
    }

    initCtrl() {
        ActivityRandData.Inst().CustomClickHandle(ACTIVITY_TYPE.NewServerCompetition, () => {
            ViewManager.Inst().OpenView(NewServerCompetitionView)
        })
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.NewServerCompetition,
            NewServerCompetitionData.Inst().ResultData,
            NewServerCompetitionData.Inst().GetNewServerCompetitionRedNum.bind(NewServerCompetitionData.Inst()), "FlushRank", "Info"));
    }

    private onRoleData() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.NewServerCompetition)) {
            return
        }
        let rank_types = NewServerCompetitionData.Inst().GetRankTypesSort(NewServerCompetitionData.Inst().CfgRankTypes());
        let server_time = TimeCtrl.Inst().ServerTime
        rank_types.forEach(element => {
            let end_time = NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(element.rank_type)
            let not_open = (end_time - server_time) > (element.continuou_times * 86400)
            if (!not_open) {
                NewServerCompetitionCtrl.Inst().SendRandActivityOperaReqRankInfo(GetCfgValue(NewServerCompetitionRankType, element.rank_type))
            }
        });
    }

    public OnRaNewServerInfo(protocol: PB_SCRaNewServerInfo) {
        LogError("OnRaNewServerInfo", protocol)
        NewServerCompetitionData.Inst().SetRaNewServerInfo(protocol);
    }

    public OnRaNewServerGlobalInfo(protocol: PB_SCRaNewServerGlobalInfo) {
        LogError("OnRaNewServerGlobalInfo", protocol)
        NewServerCompetitionData.Inst().SetRaNewServerGlobalInfo(protocol);

        this.onRoleData()
    }

    public OnRANewServerRankList(protocol: PB_SCRANewServerRankList) {
        LogError("OnRANewServerRankList", protocol)
        NewServerCompetitionData.Inst().SetRANewServerRankList(protocol);
    }

    public SendRandActivityOperaReq(operaType?: number, param1?: number, param2?: number, param3?: number,) {
        let protocol = this.GetProtocol(PB_CSRandActivityOperaReq);
        protocol.randActivityType = ACTIVITY_TYPE.NewServerCompetition;
        protocol.operaType = operaType;
        protocol.param1 = param1 ?? 0;
        protocol.param2 = param2 ?? 0;
        protocol.param3 = param3 ?? 0;
        this.SendToServer(protocol);
    }

    public SendRandActivityOperaReqGetReward(rank_type: RANK_TYPE, seq: number) {
        this.SendRandActivityOperaReq(0, rank_type, seq);
    }

    public SendRandActivityOperaReqEndTimes() {
        this.SendRandActivityOperaReq(1);
    }

    public SendRandActivityOperaReqRankInfo(rank_type: number) {
        this.SendRandActivityOperaReq(2, rank_type);
    }
}


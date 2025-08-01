import { LogError } from "core/Debugger";
import { RemindRegister } from "data/HandleCollectorCfg";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { PeakArenaData } from "./PeakArenaData";

export enum CROSS_AREN_OP_TYPE{
    FIGHT = 0,       // 挑战 p1[0,5]
    REFRESH = 1,     // 刷新
    REVENGE = 2,     // 复仇 p1[0,49]
    REPORT = 3,      // 请求战报
    MAIN_INFO = 4,   // 请求信息
}

export class PeakArenaCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCCrossArenaInfo, func: this.onSCCrossArenaInfo },
            { msgType: PB_SCCrossArenaReportList, func: this.onSCCrossArenaReportList },
            { msgType: PB_SCCrossArenaFightRet, func: this.onSCCrossArenaCount },
        ]
    }

    // 竞技场信息
    private onSCCrossArenaInfo(protocol: PB_SCCrossArenaInfo) {
        LogError("9614? 跨服竞技场信息?onSCCrossArenaInfo", protocol)
        PeakArenaData.Inst().SetCrossArenaInfo(protocol)
    }

    
    // 竞技场战报信息
    private onSCCrossArenaReportList(protocol: PB_SCCrossArenaReportList) {
        LogError("9615? 跨服竞技场战报?onSCCrossArenaReportList", protocol)
        PeakArenaData.Inst().SetCrossArenaReportInfo(protocol)
    }


    // 请求竞技场
    public SendCSCrossArenaReq(type: CROSS_AREN_OP_TYPE,param1:number){
        LogError("9613?跨服竞技场请求?SendCSCrossArenaReq",type,param1)

        if (type == CROSS_AREN_OP_TYPE.FIGHT || type == CROSS_AREN_OP_TYPE.REVENGE) {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.CROSS_ARENA, type, param1 ?? 0)
        }else{
            let protocol = this.GetProtocol(PB_CSCrossArenaReq);
            protocol.type = type;
            protocol.p1 = param1 == null ? 0 : param1;
            this.SendToServer(protocol);
        }
    }

    // 竞技场结算
    private onSCCrossArenaCount(protocol: PB_SCCrossArenaFightRet) {
        LogError("9616? 跨服竞技场结算?onSCCrossArenaReportList", protocol)
        PeakArenaData.Inst().SetCrossArenaCount(protocol)
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.PeakArena.Main,
            PeakArenaData.Inst().flush_info,
            PeakArenaData.Inst().GetRedNum.bind(PeakArenaData.Inst())));
    }
}

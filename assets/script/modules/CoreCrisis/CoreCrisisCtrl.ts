import { LogError } from "core/Debugger";
import { RemindRegister } from "data/HandleCollectorCfg";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { CROSS_AREN_OP_TYPE } from "modules/PeakArena/PeakArenaCtrl";
import { PeakArenaData } from "modules/PeakArena/PeakArenaData";
import { CoreCrisisData } from "./CoreCrisisData";

export enum LIMIT_CORE_OP_TYPE{
    LEVEL_UP = 0,       // 升级 p1 limit_type
    DRAW = 1,           // 抽奖 p1 box_type
}

export class CoreCrisisCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCLimitCoreInfo, func: this.onSCLimitCoreInfo },
        ]
    }

    // 核心信息
    private onSCLimitCoreInfo(protocol: PB_SCLimitCoreInfo) {
        LogError("1468? 核心信息?PB_SCLimitCoreInfo", protocol)
        CoreCrisisData.Inst().SetCoreInfo(protocol)
    }

    // 核心请求
    public SendCSLimitCoreReq(type: LIMIT_CORE_OP_TYPE,param1:number){
        LogError("1467?核心请求?SendCSLimitCoreReq",type,param1)
        let protocol = this.GetProtocol(PB_CSLimitCoreReq);
        protocol.type = type;
        protocol.p1 = param1 == null ? 0 : param1;
        this.SendToServer(protocol);
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.CoreCrisis.Main,
            CoreCrisisData.Inst().flush_info,
            CoreCrisisData.Inst().GetRedNum.bind(CoreCrisisData.Inst())));
    }
}
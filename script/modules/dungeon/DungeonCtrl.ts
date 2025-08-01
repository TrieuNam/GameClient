import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { ENUM_BATTLE } from 'modules/battle/BattleConf';
import { BattleCtrl } from 'modules/battle/BattleCtrl';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { DungeonData } from './DungeonData';

export enum LINGZHU_OP_TYPE {
    Fight = 0,     // p:stage
    Mop = 1,       // p:stage p2 count
    QuickMop = 2,
    Info = 3,
}

export class DungeonCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCLingZhuInfo, func: this.onSCLingZhuInfo },
        ]
    }

    // 领主副本 信息
    private onSCLingZhuInfo(protocol: PB_SCLingZhuInfo) {
        LogError("?日常副本信息？2009", protocol)
        DungeonData.Inst().SetSCLingZhuInfo(protocol)
    }

    public SendCSLingZhuReq(type: LINGZHU_OP_TYPE, param: number, param2: number) {
        // let protocol = PB_CSLingZhuReq.create();

        LogError("?日常副本请求？2008", type, param)
        if (type == LINGZHU_OP_TYPE.Fight) {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.HERO_BATTLE_TYPE_LINGZHU, type, param);
        } else {
            let protocol = this.GetProtocol(PB_CSLingZhuReq);
            protocol.type = type;
            protocol.p1 = param;
            protocol.p2 = param2;
            this.SendToServer(protocol);
        }
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Chief.View,
            DungeonData.Inst().chief_flush_info,
            DungeonData.Inst().GetRedNum.bind(DungeonData.Inst())));
    }
}

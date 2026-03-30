import { RemindRegister } from 'data/HandleCollectorCfg';
import { ENUM_BATTLE } from 'modules/battle/BattleConf';
import { BattleCtrl } from 'modules/battle/BattleCtrl';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { ArenaData } from './ArenaData';

export enum ARENA_OP_TYPE {
    FIGHT, //挑战 p1:[0,2]
    REFRESH, //刷新
    REPORT, //请求战斗记录
    BOX_REWARD, //领取宝箱奖励 p1:seq
    REVEBGE, //复仇 p1:[0,19]
    ARENA_OP_INFO, //打开请求信息
}
export class ArenaCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCArenaInfo, func: this.recvArenaInfo },
            { msgType: PB_SCArenaReportList, func: this.recvArenaReportList },
        ]
    }

    private recvArenaInfo(data: PB_SCArenaInfo) {
        ArenaData.Inst().setArenaInfo(data);
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Arena.View, ArenaData.Inst().result_info, ArenaData.Inst().GetRed.bind(ArenaData.Inst())));
    }

    private recvArenaReportList(data: PB_SCArenaReportList) {
        ArenaData.Inst().setArenaReportList(data);
    }
    public SendArenaReq(type: ARENA_OP_TYPE, param?: number) {
        if (type == ARENA_OP_TYPE.FIGHT || type == ARENA_OP_TYPE.REVEBGE) {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.HERO_BATTLE_TYPE_PVP, type, param ?? 0)
        } else {
            let protocol = this.GetProtocol(PB_CSArenaReq);
            protocol.type = type;
            protocol.p1 = param ?? 0;
            this.SendToServer(protocol);
        }
    }
}

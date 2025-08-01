import { RemindRegister } from 'data/HandleCollectorCfg';
import { ENUM_BATTLE } from 'modules/battle/BattleConf';
import { BattleCtrl } from 'modules/battle/BattleCtrl';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { AdventureData } from './AdventureData';

export enum ADVENTURE_OP_TYPE {
    CHALLENGE = 0,
    RECEIVE = 1,
    FETCH_GUAJI=2,//领取挂机奖励
    QUICK_FETCH_GUAJI=3,//快速领取挂机奖励
}
export class AdventureCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCMainFbInfo, func: this.recvSCMainFbInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Adventure.View, AdventureData.Inst().ResultData, AdventureData.Inst().GetRedNum.bind(AdventureData.Inst())));
    }

    private recvSCMainFbInfo(data: PB_SCMainFbInfo) {
        AdventureData.Inst().SetSCMainFbInfo(data)
    }

    public SendAdventureReq(type: ADVENTURE_OP_TYPE) {
        if (type == ADVENTURE_OP_TYPE.CHALLENGE) {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.HERO_BATTLE_TYPE_MAIN_FB, type);
        } else {
            let protocol = this.GetProtocol(PB_CSMainFbReq);
            protocol.type = type;
            this.SendToServer(protocol);
        }
    }
}
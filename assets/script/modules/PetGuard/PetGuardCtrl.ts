import { LogError } from "core/Debugger";
import { RemindRegister } from "data/HandleCollectorCfg";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { PetGuardData } from "./PetGuardData";

export enum PET_GUARD_OP_TYPE{
    FIGHT = 1,       // 挑战 p1[0,5]
    REWARD = 2,      // 领取奖励
}

export class PetGuardCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCPetFbInfo, func: this.onSCPetFBInfo },
        ]
    }
    
    private onSCPetFBInfo(data:PB_SCPetFbInfo)
    {
        LogError("?宠物守护信息?1691",data)
        PetGuardData.Inst().SetFbInfo(data)
    }

    public SendPetFbReq(type:number,level:number)
    {
        LogError("1690?宠物守护请求?PB_CSPetFbReq",type,level)
        if(type == PET_GUARD_OP_TYPE.FIGHT)
        {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.PET_FB, type, level ?? 0)
        }
        else
        {
            let protocol = this.GetProtocol(PB_CSPetFbReq);
            protocol.type = type;
            protocol.p1 = level ;
            this.SendToServer(protocol);
        }
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.PetGuard.Main,
            PetGuardData.Inst().flush_info,
            PetGuardData.Inst().GetRedNum.bind(PetGuardData.Inst())));
    }
}
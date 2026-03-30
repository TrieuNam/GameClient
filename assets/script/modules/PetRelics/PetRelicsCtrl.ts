import { LogError } from "core/Debugger";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { PetRelicsData } from "./PetRelicsData";

export class PetRelicsCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCPetRemainsList, func: this.onSCPetRemainsList },
        ]
    }

    private onSCPetRemainsList(data:PB_SCPetRemainsList)
    {
        LogError("?宠物圣遗物信息?2107",data)
        PetRelicsData.Inst().SetPetRelicsInfo(data)
    }


    protected initCtrl() {
        // this.handleCollector.Add(RemindRegister.Create(Mod.PetGuard.Main,
        //     PetGuardData.Inst().flush_info,
        //     PetGuardData.Inst().GetRedNum.bind(PetGuardData.Inst())));
    }
}
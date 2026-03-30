import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { IntegralTurntableData } from './IntegralTurntableData';
import { LogError } from "core/Debugger";

export class IntegralTurntableCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaJifenZhuanpan, func: this.OnTurntableInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.JiFenChouJiang, IntegralTurntableData.Inst().ResultData, IntegralTurntableData.Inst().GetAllRed.bind(IntegralTurntableData.Inst())));
    }

    private OnTurntableInfo(data: PB_SCRaJifenZhuanpan) {
        IntegralTurntableData.Inst().OnTurntableInfo(data);
    }


}


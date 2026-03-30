import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { CaveLootData } from './CaveLootData';

export class CaveLootCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaCaveLootInfo, func: this.OnCaveLootInfo }
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.CaveLoot, CaveLootData.Inst().ResultData, CaveLootData.Inst().GetAllRed.bind(CaveLootData.Inst())));
    }

    private OnCaveLootInfo(data: PB_SCRaCaveLootInfo) {
        // LoginData.Inst().resultData.result = data.result;
        // LogError("3019 洞穴探险信息?PB_SCRaCaveLootInfo",data)
        CaveLootData.Inst().OnCaveLootInfo(data);
    }

}


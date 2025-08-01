import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RoleData } from 'modules/role/RoleData';
import { WarOrderData } from './WarOrderData';

export class WarOrderCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaWarOrderInfo, func: this.OnWarOrderInfo }
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.WarOrder, WarOrderData.Inst().WarOrderSmartData, WarOrderData.Inst().GetAllRed.bind(WarOrderData.Inst())));
       // this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().ResultData, this.OnLevelChange.bind(this), "roleLevel"));
    }

    private OnWarOrderInfo(data: PB_SCRaWarOrderInfo) {
        WarOrderData.Inst().OnWarOrderInfo(data);
    }
    
    // public OnWarOrderChange(){
    //     SMDTriggerNotify(WarOrderData.Inst().WarOrderSmartData);
    // }
}


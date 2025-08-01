import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RoleData } from 'modules/role/RoleData';
import { LevelFundData } from './LevelFundData';

export class LevelFundCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaLevelFundInfo, func: this.OnLevelFundInfo }
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.LevelFund, LevelFundData.Inst().LevelFundSmartData, LevelFundData.Inst().GetAllRed.bind(LevelFundData.Inst())));
        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().ResultData, this.OnLevelChange.bind(this), "roleLevel"));
    }

    private OnLevelFundInfo(data: PB_SCRaLevelFundInfo) {
        // LoginData.Inst().resultData.result = data.result;
        // LogError("3011 等级基金信息?PB_SCRaLevelFundInfo", data)
        LevelFundData.Inst().OnLevelFundInfo(data);
    }
    
    public OnLevelChange(){
        SMDTriggerNotify(LevelFundData.Inst().LevelFundSmartData);
    }
}


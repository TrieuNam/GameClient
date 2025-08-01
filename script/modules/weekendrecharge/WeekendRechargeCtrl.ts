import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { WeekendRechargedData } from './WeekendRechargeData';

export class WeekendRechargeCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaWeekendRechargeInfo, func: this.OnWeekendRechargeInfo }
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.WeekendRecharge, WeekendRechargedData.Inst().WeekendRechargedSmartData, WeekendRechargedData.Inst().GetAllRed.bind(WeekendRechargedData.Inst())));
    }
    private OnWeekendRechargeInfo(data: PB_SCRaWeekendRechargeInfo) {
        // LoginData.Inst().resultData.result = data.result;
        // LogError("3018 周末累充信息?PB_SCRaWeekendRechargeInfo",data)
        WeekendRechargedData.Inst().OnWeekendRechargeInfo(data);
    }

}


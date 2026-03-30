import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BoxData } from 'modules/box/BoxData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { BoxFundData } from './BoxFundData';

export class BoxFundCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaBoxFundInfo, func: this.OnBoxFundInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.BoxFund, BoxFundData.Inst().BoxFundSmartData, BoxFundData.Inst().GetAllRed.bind(BoxFundData.Inst())));
        this.handleCollector.Add(SMDHandle.Create(BoxData.Inst().box_result_data, this.OnLevelChange.bind(this), "box_level_data"));
    }

    private OnBoxFundInfo(data: PB_SCRaBoxFundInfo) {
        // LoginData.Inst().resultData.result = data.result;
        // LogError("3010 宝箱基金信息?PB_SCRaBoxFundInfo",data)
        BoxFundData.Inst().OnBoxFundInfo(data);
    }
    
    public OnLevelChange(){
        SMDTriggerNotify(BoxFundData.Inst().BoxFundSmartData);
    }
}


import { LogError } from 'core/Debugger';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { BoxManorData } from './BoxManorData';

export class BoxManorCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaChestManorInfo, func: this.OnBoxManorInfo }
        ]
    }

    private OnBoxManorInfo(data: PB_SCRaChestManorInfo) {
        // LogError("3020 宝箱庄园 信息?PB_SCRaChestManorInfo",data)
        BoxManorData.Inst().OnBoxManorInfo(data)
    }

}

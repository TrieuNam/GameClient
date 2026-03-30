import { LogError } from 'core/Debugger';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { EnChantData } from './EnchantData';

export class EnchantCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCEquipFuMoListInfo, func: this.OnEquipFuMoListInfo },
            { msgType: PB_SCEquipFuMoOneInfo, func: this.OnEquipFuMoOneInfo }

        ]
    }

    private OnEquipFuMoListInfo(protocol: PB_SCEquipFuMoListInfo) {
        EnChantData.Inst().SetEquipFuMoListInfo(protocol)
        // LogError("1603---------------->装备附魔信息",protocol)
    }

    private OnEquipFuMoOneInfo(protocol: PB_SCEquipFuMoOneInfo) {
        EnChantData.Inst().SetEquipFuMoOneInfo(protocol)
        // LogError("1604----------------->装备附魔单个信息",protocol)
    }

}


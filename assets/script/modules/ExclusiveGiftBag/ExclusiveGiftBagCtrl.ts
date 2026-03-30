import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { ExclusiveGiftBagData } from './ExclusiveGiftBagData';

export class ExclusiveGiftBagCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaExclusiveGift, func: this.OnExclusiveInfo }
        ]
    }
   
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ExclusiveGiftBag.View, ExclusiveGiftBagData.Inst().result_data, ExclusiveGiftBagData.Inst().GetAllRed.bind(ExclusiveGiftBagData.Inst())));
    }
    private OnExclusiveInfo(data: PB_SCRaExclusiveGift) {
        ExclusiveGiftBagData.Inst().OnExclusiveInfo(data);
    }
    

}


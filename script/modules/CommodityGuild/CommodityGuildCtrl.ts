import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { CommodityGuildData } from './CommodityGuildData';

export class CommodityGuildCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaCommodityGuildInfo, func: this.OnCommdityGuildInfo }
        ]
    }
    
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.CommodityGuild, CommodityGuildData.Inst().CommodityGuildSmartData, CommodityGuildData.Inst().GetAllRed.bind(CommodityGuildData.Inst())));
    }
    
    private OnCommdityGuildInfo(data: PB_SCRaCommodityGuildInfo) {
        // LoginData.Inst().resultData.result = data.result;
        // LogError("3015 商品行会信息?PB_SCRaCommodityGuildInfo",data)
        CommodityGuildData.Inst().OnCommdityGuildInfo(data);
    }

}


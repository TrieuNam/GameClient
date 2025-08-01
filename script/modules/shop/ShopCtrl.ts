import { CfgShop } from 'config/CfgShop';
import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RoleData } from 'modules/role/RoleData';
import { ShopData } from './ShopData';

export class ShopCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCShopInfo, func: this.recvSCShopInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Shop.View, RoleData.Inst().AdFlush, ShopData.Inst().GetRed.bind(ShopData.Inst()), "flush_info"));
    }

    private recvSCShopInfo(data: PB_SCShopInfo) {
        ShopData.Inst().SetSCShopInfo(data);
    }

    public SendBuyReq(index: number, num = 1) {
        let protocol = this.GetProtocol(PB_CSShopBuyReq);
        protocol.index = index;
        protocol.num = num;
        this.SendToServer(protocol);
    }
}
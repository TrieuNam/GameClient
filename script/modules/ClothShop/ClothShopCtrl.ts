import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { ClothShopData } from './ClothShopData';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';

export class ClothShopCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            // { msgType: PB_CSClothShopBuyReq, func: this.onClothShopInfo }
        ]
    }

    // protected initCtrl() {
    //     this.handleCollector.Add(RemindRegister.Create(Mod.ClothShopView.View, ClothShopData.Inst().ResultData, ClothShopData.Inst().GetAllRed.bind(ClothShopData.Inst())));
    // }

    private onClothShopInfo(data: PB_CSClothShopBuyReq) {
        // ClothShopData.Inst().onClothShopInfo(data);
    }

    public SendBuyReq(seq: number, num = 1) {
        let protocol = this.GetProtocol(PB_CSClothShopBuyReq);
        protocol.seq = seq;
        protocol.num = num;
        this.SendToServer(protocol);
    }


}


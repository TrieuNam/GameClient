import { LogError } from 'core/Debugger';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { EquipBagData } from './EquipBagData';

export enum EQUIP_OP_TYPE {
    WEAR = 1, //穿戴
    SELL = 2, //卖掉
    Enchant = 3,    //附魔
    CancelEnchant = 4, //   取消附魔
    CHange = 5, //转换材料

}


export class EquipBagCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
    return [
        { msgType: PB_SCEquipBagListInfo, func: this.recvEquipBagListInfo },
        { msgType: PB_SCEquipBagOneInfo, func: this.recvEquipBagOneInfo },
    ]
    }

    private recvEquipBagListInfo(data: PB_SCEquipBagListInfo) {
        EquipBagData.Inst().SetEquipBagListInfo(data);
    }

    private recvEquipBagOneInfo(data: PB_SCEquipBagOneInfo){
        EquipBagData.Inst().SetEquipBagOneInfo(data);
    }

    public SendEquipReq(type: EQUIP_OP_TYPE,param1?:number,param2?:number,param3?:number) {
        let protocol = this.GetProtocol(PB_CSEquipReq);
        protocol.reqType = type;
        protocol.param1 = param1 ?? 0;
        protocol.param2 = param2 ?? 0;
        protocol.param3 = param3 ?? 0;
        LogError("protocol = ",protocol)
        this.SendToServer(protocol);
    }
}
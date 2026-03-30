import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { BagData } from 'modules/bag/BagData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { AngelData } from './AngelData';
export enum AngelReqType {
    LEVEL_UP,//升级
    GRADE_UP,//升阶
    EQUIP_LEVEL_UP,//装备升级 p：index[0,3]
    APPEARANCE_LEVEL_UP,//皮肤升级 p:seq p2:0消耗物品 1:消耗钻石
    USE_APPEARANCE,//使用皮肤 p:seq
}

export class AngelCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCAngelInfo, func: this.recvAngelInfo },
            { msgType: PB_SCAngelOpRet, func: this.recvAngelOpRet },
        ]
    }

    protected initCtrl() {
        let angel_data = AngelData.Inst();
        this.handleCollector.Add(RemindRegister.Create(Mod.Angel.Res, angel_data.result_info, angel_data.GetAngelResAllRed.bind(angel_data), "is_red_change"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Angel.Up, angel_data.result_info, angel_data.GetAngelUpAllRed.bind(angel_data), "is_red_change"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));
    }

    private recvAngelInfo(data: PB_SCAngelInfo) {
        AngelData.Inst().setAngelInfo(data);
    }

    private recvAngelOpRet(data: PB_SCAngelOpRet) {
        AngelData.Inst().setAngelOpRet(data);
    }

    public SendAngelReq(rep_type: AngelReqType, param?: number, param2?: number) {
        let protocol = this.GetProtocol(PB_CSAngelReq);
        protocol.reqType = rep_type; rep_type
        protocol.param = param ?? 0;
        protocol.param2 = param2 ?? 0
        this.SendToServer(protocol);
    }


    private BagNumChange() {
        AngelData.Inst().result_info.is_red_change = !AngelData.Inst().result_info.is_red_change;
    }

}
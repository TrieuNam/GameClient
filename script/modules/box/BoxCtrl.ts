import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BagData } from 'modules/bag/BagData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RoleData } from 'modules/role/RoleData';
import { BoxData } from './BoxData';

export enum BoxReqType {
    OPEN_BOX = 1,				// 开箱子 param 0 单次 1五连
    WEAR_EQUIP = 2,			    //穿戴装备
    SELL = 3,			        // 售卖
    LEVEL_BUY = 4,			    // 购买
    LEVEL_UP = 5,			    // 升级
    SPEED_UP = 6,			    // 加速
    Enchant = 7,                //分解
    FETCH_LEVEL_REWARD=8,       //领取购买升级次数的奖励 param-num 从1开始
}

export class BoxCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCBoxEquipInfo, func: this.recvBoxEquipInfo },
            { msgType: PB_SCBoxInfo, func: this.recvBoxInfo },
            { msgType: PB_SCBoxSetingInfo, func: this.recvBoxSetingInfo },
            { msgType: PB_SCBoxSellInfo, func: this.recvBoxSellInfo },
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.BoxInfo.View, BoxData.Inst().GetboxResultData(), BoxData.Inst().GetBoxInfoRedNum.bind(BoxData.Inst()), "box_level_data"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));
        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().AdFlush, this.AdChange.bind(this), "flush_info"));
    }

    public SendBoxReq(req_type: BoxReqType, param?: number) {
        let protocol = this.GetProtocol(PB_CSBoxReq);
        protocol.reqType = req_type;
        protocol.param = param ?? 0;
        this.SendToServer(protocol);
    }

    public SendBoxSetReq(info: PB_BoxSet) {
        let protocol = this.GetProtocol(PB_CSBoxSetReq);
        protocol.boxSet = info;
        this.SendToServer(protocol);
    }

    private recvBoxEquipInfo(data: PB_SCBoxEquipInfo) {
        BoxData.Inst().setBoxEquip(data);
    }

    private recvBoxInfo(data: PB_SCBoxInfo) {
        BoxData.Inst().setBoxLevel(data);
    }

    private recvBoxSetingInfo(data: PB_SCBoxSetingInfo) {
        BoxData.Inst().setSettingInfo(data);
    }
    private recvBoxSellInfo(data: PB_SCBoxSellInfo) {
        BoxData.Inst().SetSellInfo(data.sellCoin, data.sellExp);
    }

    private BagNumChange() {
        SMDTriggerNotify(BoxData.Inst().GetboxResultData(),"box_level_data")
    }

    private AdChange() {
        SMDTriggerNotify(BoxData.Inst().GetboxResultData(), "flush_ad")
    }
}
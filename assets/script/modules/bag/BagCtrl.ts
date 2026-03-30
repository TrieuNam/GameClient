import { LogError } from 'core/Debugger';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { BagData } from './BagData';
import { BagNoticeFun, GET_TYPE, UnNoticeCommon } from './BagEnum';

export enum KNAPSACK_REQ_TYPE {
    USE = 0,    // 使用 p1:id p2：num
    SELL = 1,   // 出售 P1:id p2：num
    SHI_ZHUANG_LEVEL_UP = 2,//时装升级 p1:id p2:0消耗物品1消耗钻石
    SHI_ZHUANG_USE = 3,//穿戴时装 p1:id
}

export class BagCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCGetItemNotice, func: this.recvGetItemNotice },
            { msgType: PB_SCKnapsackAllInfo, func: this.recvAllInfo },
            { msgType: PB_SCKnapsackSingleInfo, func: this.recvSingleInfo },
            { msgType: PB_SCEquipListInfo, func: this.OnEquipListInfo },
            { msgType: PB_SCEquipOneInfo, func: this.OnEquipOneInfo },
        ]
    }

    private recvGetItemNotice(data: PB_SCGetItemNotice) {
        LogError("?gvffg", data)
        if (BagNoticeFun[data.getType]) {
            BagNoticeFun[data.getType](data);
        } else if (!UnNoticeCommon[data.getType]) {
            BagNoticeFun[GET_TYPE.common](data);
        }
    }

    private recvAllInfo(data: PB_SCKnapsackAllInfo) {
        BagData.Inst().setAllItemInfo(data);
    }

    private recvSingleInfo(data: PB_SCKnapsackSingleInfo) {
        BagData.Inst().setSingleItemInfo(data);
    }
    private OnEquipListInfo(protocol: PB_SCEquipListInfo) {
        for (let i = 0; i < protocol.equipList.length; i++) {
            const element = protocol.equipList[i];
            BagData.Inst().SetEquipListInfo(element.equipType, element);
        }
    }

    private OnEquipOneInfo(protocol: PB_SCEquipOneInfo) {
        const element = protocol.equipData;
        BagData.Inst().SetEquipListInfo(element.equipType, element);
    }

    // 物品使用请求
    // param是一个数字数组，使用物品的场合是 id。数量，参数（目前是0）
    public SendCSKnapsackReq(type: KNAPSACK_REQ_TYPE, param: number[]) {
        LogError("?1500!SendCSKnapsackReq", type, param)
        let protocol = this.GetProtocol(PB_CSKnapsackReq);
        protocol.reqType = type;
        protocol.param = param
        this.SendToServer(protocol);
    }
}
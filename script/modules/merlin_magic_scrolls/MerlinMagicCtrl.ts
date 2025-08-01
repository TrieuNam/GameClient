import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { MerlinMagicData } from "./MerlinMagicData";

export class MerlinMagicCtrl extends BaseCtrl {
    data = MerlinMagicData.Inst()
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCScrollInfo, func: this.recvScrollInfo },
            { msgType: PB_SCScrollListInfo, func: this.recvScrollListInfo },
            { msgType: PB_SCScrollOneInfo, func: this.recvScrollOneInfo },

        ]
    }
    initCtrl() {
    }

    recvScrollInfo(protocol: IPB_SCScrollInfo) {
        console.log(protocol);
    }
    recvScrollListInfo(protocol: IPB_SCScrollListInfo) {
        console.log(protocol);
        this.data.scroll_list = protocol.scrollList
        this.data.FlushData.flush_list = !this.data.FlushData.flush_list
    }
    recvScrollOneInfo(protocol: IPB_SCScrollOneInfo) {
        console.log(protocol);
        if (protocol.reason == 0) {
            if (this.data.scroll_list) {
                this.data.scroll_list.push(protocol.scrollData)
            } else {
                this.data.scroll_list = []
                this.data.scroll_list.push(protocol.scrollData)
            }
        } else {
            let index = this.data.scroll_list.findIndex((value) => { return value.itemId = protocol.scrollData.itemId })
            if (index >= 0) {
                this.data.scroll_list[index] = protocol.scrollData
            }
        }
        this.data.FlushData.flush_list = !this.data.FlushData.flush_list
    }
    //0 升级 1 佩戴 2 卸下 3抽奖
    SendScrollInfo(req_type: number, p1: number) {
        let protocol = this.GetProtocol(PB_CSScrollReq);
        protocol.reqType = req_type ?? 0
        protocol.param1 = p1 ?? 0
        this.SendToServer(protocol);
    }
}
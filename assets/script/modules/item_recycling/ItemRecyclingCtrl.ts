import { LogError } from "core/Debugger";
import { RemindRegister, SMDHandle } from "data/HandleCollectorCfg";
import { SMDTriggerNotify } from "data/SmartData";
import { BagData } from "modules/bag/BagData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { FishData } from "modules/fish/FishData";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { ItemRecyclingData } from "./ItemRecyclingData";

export class ItemRecyclingCtrl extends BaseCtrl {
    data = ItemRecyclingData.Inst()
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCItemRecycleInfo, func: this.recvItemRecycleInfo },
            { msgType: PB_SCItemRecycleListInfo, func: this.recvItemRecycleListInfo },
            { msgType: PB_SCItemRecycleOneInfo, func: this.recvItemRecycleOneInfo },
        ]
    }
    initCtrl() {
        let func = ItemRecyclingData.Inst().GetRedPoint.bind(ItemRecyclingData.Inst())
        this.handleCollector.Add(RemindRegister.Create(Mod.ItemRecycling.Main, ItemRecyclingData.Inst().FlushData, func));
        // //this.handleCollector.Add(RemindRegister.Create(Mod.Territory.Main, FishData.Inst().ResultData, func, "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo"));
        // //this.handleCollector.Add(RemindRegister.Create(Mod.Territory.Main, BagData.Inst().BagItemData, func, "OtherChange"))
        // this.handleCollector.Add(SMDHandle.Create(FishData.Inst().ResultData, this.BagNumChange.bind(this), "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));
    }
    BagNumChange() {
        SMDTriggerNotify(ItemRecyclingData.Inst().FlushData, "flush_red")
    }
    recvItemRecycleInfo(data: IPB_SCItemRecycleInfo) {
        console.log("可回收信息 ", data)
        this.data.SetInfo(data)
    }
    recvItemRecycleListInfo(data: IPB_SCItemRecycleListInfo) {
        this.data.SetAllInfo(data)
        console.log("可回收列表", data);
        
    }
    recvItemRecycleOneInfo(data: IPB_SCItemRecycleOneInfo) {
        this.data.SetOneInfo(data)
        console.log("可回收单个", data);
    }
    public SendItemRecycleLevelUpReq(itemIds: number[]) {
        console.log("发送回收协议", itemIds);
        let protocol = this.GetProtocol(PB_CSItemRecycleLevelUpReq);
        protocol.itemIds = itemIds ?? [];
        this.SendToServer(protocol);
    }
}
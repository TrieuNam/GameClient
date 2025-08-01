import { LogError } from "core/Debugger";
import { RemindRegister, SMDHandle } from "data/HandleCollectorCfg";
import { SMDTriggerNotify } from "data/SmartData";
import { protocol } from "electron";
import { BagData } from "modules/bag/BagData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { FishData } from "modules/fish/FishData";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { TerritoryData, TERRITORY_REQ } from "./TerritoryData";

export class TerritoryCtrl extends BaseCtrl {
    data = TerritoryData.Inst()
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCTerritoryInfo, func: this.recvTerritoryInfo },
            { msgType: PB_SCTerritoryNeighbourInfo, func: this.recvTerritoryNeighbourInfo },
            { msgType: PB_SCTerritoryBotInfo, func: this.recvTerritoryBotInfo },
            { msgType: PB_SCTerritoryReportInfo, func: this.recvTerritoryReportInfo },
            { msgType: PB_SCTerritoryRedInfo, func: this.recvTerritoryRedInfo },
            { msgType: PB_SCRaTerritoryGift, func: this.recvRaTerritoryGift },
        ]
    }
    initCtrl() {
        EventCtrl.Inst().on(CommonEvent.LOGIN_SUCC_ROLEDATA, this.onCon, this);
        let func = TerritoryData.Inst().GetTerrtoryRedPoint.bind(TerritoryData.Inst())
        this.handleCollector.Add(RemindRegister.Create(Mod.Territory.Main, TerritoryData.Inst().FlushData, func));
        //this.handleCollector.Add(RemindRegister.Create(Mod.Territory.Main, FishData.Inst().ResultData, func, "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo"));
        //this.handleCollector.Add(RemindRegister.Create(Mod.Territory.Main, BagData.Inst().BagItemData, func, "OtherChange"))
        this.handleCollector.Add(SMDHandle.Create(FishData.Inst().ResultData, this.BagNumChange.bind(this), "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));
    }
    onCon() {
        let result = FunOpen.Inst().GetFunIsOpen(Mod.Territory.Main);
        if (result.is_open)
            TerritoryCtrl.Inst().SendTerritoryInfo(RoleData.Inst().GetRoleId());
    }
    private BagNumChange() {
        SMDTriggerNotify(TerritoryData.Inst().FlushData, "flush_red")
    }
    recvTerritoryInfo(protocol: IPB_SCTerritoryInfo) {
        let data = FunOpen.Inst().GetFunIsOpen(Mod.Territory.Main)
        if (data.is_open) {
            TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.Log);
        }
        console.log("领地信息", protocol);
        // protocol.reason == 0 全部信息 == 1单个数据变化
        if (protocol.reason == 0) {
            this.data.SetTerritoryInfo(protocol)
            //保持最新
            TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.BOT_STATUS)

            // let data = FunOpen.Inst().GetFunIsOpen(Mod.Territory.Main)
            // if (data.is_open) {
            //     TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.Log);
            //  }
        } else if (protocol.reason == 1) {
            if (this.data.show_mine) {
                TerritoryCtrl.Inst().SendTerritoryInfo(RoleData.Inst().GetRoleId())
            } else {
                if (protocol.botRunNum > 0) {
                    this.data.my_territory.botRunNum = protocol.botRunNum
                }
                if (this.data.other_territory) {
                    TerritoryCtrl.Inst().SendTerritoryInfo(this.data.other_territory.roleInfo.roleId)
                }
            }
            // if(protocol.botRunNum){
            //     this.data.my_territory.botRunNum = protocol.botRunNum
            // }else if(protocol.botNum){
            //     this.data.my_territory.botNum = protocol.botNum
            // }
            // this.data.FlushData.flush_info = !this.data.FlushData.flush_info
        }
    }
    SendTerritoryInfo2() {
        if (this.data.show_mine) {
            TerritoryCtrl.Inst().SendTerritoryInfo(RoleData.Inst().GetRoleId())
        } else {
            if (this.data.other_territory) {
                TerritoryCtrl.Inst().SendTerritoryInfo(this.data.other_territory.roleInfo.roleId)
            }
        }
    }
    recvTerritoryNeighbourInfo(protocol: IPB_SCTerritoryNeighbourInfo) {
        // console.log("邻居信息", protocol);
        //邻居列表 和仇人列表
        this.data.SetTerritoryNeighbourInfo(protocol)
    }
    recvTerritoryBotInfo(protocol: IPB_SCTerritoryBotInfo) {
        //console.log("工具人信息", protocol)
        this.data.SetTerritoryBotInfo(protocol)
    }
    recvTerritoryReportInfo(protocol: IPB_SCTerritoryReportInfo) {
        //console.log("日志信息 ", protocol)
        this.data.SetTerritoryReportInfo(protocol)
    }
    public SendTerritoryReq(type: number, param?: number[]) {
        //console.log("请求领地信息", type, param);
        let protocol = this.GetProtocol(PB_CSTerritoryReq);
        protocol.type = type;
        protocol.param = param ?? [];
        this.SendToServer(protocol);
    }
    //请求对应领地信息
    SendTerritoryInfo(uid: number) {
        this.SendTerritoryReq(TERRITORY_REQ.INFO, [uid])
    }
     //请求刷新货箱
     SendRefreshContainerInfo(type:number) {
        this.SendTerritoryReq(TERRITORY_REQ.REFRESH_CONTAINER,[type])
    }
    SendTerritoryNeighbour() {
        this.SendTerritoryReq(TERRITORY_REQ.NEIGHBOUR)
    }
    //开始拉货
    SendFetchItem(uid: number, index: number, count: number) {
        this.SendTerritoryReq(TERRITORY_REQ.FETCH_ITEM, [uid, index, count])
    }
    //打开界面时领取或者界面打开时完成领取
    SendFetchReward() {
        this.SendTerritoryReq(TERRITORY_REQ.FETCH_REWARD)
        this.data.reward_flag = 0
    }
    recvTerritoryRedInfo(protocol: IPB_SCTerritoryRedInfo) {
        console.log("红点协议 ", protocol);

        this.data.reward_flag = protocol.rewardFlag ?? 0
        this.BagNumChange()
    }

    recvRaTerritoryGift(protocol: IPB_SCRaTerritoryGift) {
        console.error("领地礼包 ：", protocol);
        this.data.gift_type = protocol.nowType
        this.data.buy_count = protocol.buyCount
        this.data.end_time = protocol.nextTime
        SMDTriggerNotify(TerritoryData.Inst().FlushData, "flush_gift")
        //this.data.FlushData.flush_gift = !this.data.FlushData.flush_gift
    }
}
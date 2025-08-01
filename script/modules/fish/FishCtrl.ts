
import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BagData } from 'modules/bag/BagData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { FishConfig } from './FishConfig';
import { FishData } from './FishData';

export class FishCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCWaBaoInfo, func: this.OnWaBaoInfo },
            { msgType: PB_SCWaBaoMapInfo, func: this.OnWaBaoMapInfo },
            { msgType: PB_SCWaBaoItemInfo, func: this.OnWaBaoItemInfo },
            { msgType: PB_SCWaBaoIntegrityInfo, func: this.OnWaBaoIntegrityInfo },
            { msgType: PB_SCWaBaoCollectionListInfo, func: this.OnWaBaoCollectionListInfo },
            { msgType: PB_SCWaBaoToolInfo, func: this.OnWaBaoToolInfo },
            { msgType: PB_SCWaBaoTaskInfo, func: this.OnWaBaoTaskInfo },
            { msgType: PB_SCWaBaoSetingInfo, func: this.OnWaBaoSetingInfo },
            { msgType: PB_SCWaBaoCollectionBookInfo, func: this.OnWaBaoCollectionBookInfo },
            { msgType: PB_SCWaBaoBookListInfo, func: this.OnWaBaoBookListInfo },
        ]
    }

    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Fish.View, FishData.Inst().ResultData, FishData.Inst().GetWabaoRedPoint.bind(FishData.Inst(), "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo", "WaBaoBookListInfo")));
        this.handleCollector.Add(RemindRegister.Create(Mod.FishBox.Main, FishData.Inst().ResultData, FishData.Inst().GetWabaoBoxUpRedPoint.bind(FishData.Inst(), "WaBaoTaskInfo", "WaBaoCollectionBookInfo", "WaBaoToolInfo", "WaBaoBookListInfo")));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "WaBaoItemChange", "OtherChange"));
    }

    public OnWaBaoInfo(protocol: PB_SCWaBaoInfo) {
        LogError("OnWaBaoInfo", protocol)
        FishData.Inst().SetWaBaoInfo(protocol);
    }

    public OnWaBaoMapInfo(protocol: PB_SCWaBaoMapInfo) {
        LogError("OnWaBaoMapInfo", protocol)
        FishData.Inst().SetWaBaoMapInfo(protocol);
    }

    public OnWaBaoItemInfo(protocol: PB_SCWaBaoItemInfo) {
        LogError("OnWaBaoItemInfo", protocol)
        FishData.Inst().SetWaBaoItemInfo(protocol);
    }

    public OnWaBaoIntegrityInfo(protocol: PB_SCWaBaoIntegrityInfo) {
        LogError("OnWaBaoIntegrityInfo", protocol)
        FishData.Inst().SetWaBaoIntegrityInfo(protocol);
    }

    public OnWaBaoCollectionListInfo(protocol: PB_SCWaBaoCollectionListInfo) {
        LogError("OnWaBaoCollectionListInfo", protocol)
        FishData.Inst().SetWaBaoCollectionListInfo(protocol);
    }

    public OnWaBaoToolInfo(protocol: PB_SCWaBaoToolInfo) {
        LogError("OnWaBaoToolInfo", protocol)
        FishData.Inst().SetWaBaoToolInfo(protocol);
    }

    public OnWaBaoTaskInfo(protocol: PB_SCWaBaoTaskInfo) {
        LogError("OnWaBaoTaskInfo", protocol)
        FishData.Inst().SetWaBaoTaskInfo(protocol);
    }

    public OnWaBaoSetingInfo(protocol: PB_SCWaBaoSetingInfo) {
        LogError("OnWaBaoSetingInfo", protocol)
        FishData.Inst().SetWaBaoSetingInfo(protocol);
    }

    public OnWaBaoCollectionBookInfo(protocol: PB_SCWaBaoCollectionBookInfo) {
        LogError("OnWaBaoCollectionBookInfo", protocol)
        FishData.Inst().SetWaBaoCollectionBookInfo(protocol);
    }

    public OnWaBaoBookListInfo(protocol: PB_SCWaBaoBookListInfo) {
        LogError("OnWaBaoBookListInfo", protocol)
        FishData.Inst().SetWaBaoBookListInfo(protocol);
    }

    public SendWaBaoReq(type: number, param1?: number, param2?: number) {
        let protocol = this.GetProtocol(PB_CSWaBaoReq);
        protocol.opType = type;
        protocol.param1 = param1 ?? 0;
        protocol.param2 = param2 ?? 0;
        this.SendToServer(protocol);
    }

    public SendWaBaoReqUnlockMap(map: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.unlock_map, map);
    }

    public SendWaBaoReqEnterMap(map: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.enter_map, map);
    }

    public SendWaBaoReqWaBao() {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.wa_bao);
    }

    public SendWaBaoReqSell() {
        let item_id = FishData.Inst().ResultData.WaBaoItemInfo.itemData.itemId
        FishData.Inst().WaBaoSellEffect(item_id);
        this.SendWaBaoReq(FishConfig.WaBaoReqType.sell);
    }

    public SendWaBaoReqPutCollection(item_type: number, index: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.put_collection, item_type, index);
    }

    public SendWaBaoReqCollectionSell(item_type: number, index: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.collection_sell, item_type, index);
    }

    public SendWaBaoReqCollectionBuy() {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.collection_buy);
    }

    public SendWaBaoReqCollectionUp() {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.collection_up);
    }

    public SendWaBaoReqCollectionQuicken(num: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.collection_quicken, num);
    }

    public SendWaBaoReqFreshTask(index: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.fresh_task, index);
    }

    public SendWaBaoReqFetchTask(index: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.fetch_task, index);
    }

    public SendWaBaoReqToolUpLevel(tool_type: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.tool_up_level, tool_type);
    }

    public SendWaBaoReqToolUpGrade(tool_type: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.tool_up_grade, tool_type);
    }

    public SendWaBaoReqPutCollectionBook(tool_type: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.put_collection_book, tool_type);
    }

    public SendWaBaoReqCollectionBookLevelUp(handbook_type: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.collection_book_level_up, handbook_type);
    }

    public SendWaBaoReqActivateBook(orb_map: number, handbook_type: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.activate_book, orb_map, handbook_type);
    }

    public SendWaBaoReqFetchCollectionLevelReward(num: number) {
        this.SendWaBaoReq(FishConfig.WaBaoReqType.fetch_collection_level_reward, num);
    }

    public SendWaBaoSetReq(info: IPB_WaBaoSet) {
        let protocol = this.GetProtocol(PB_CSWaBaoSetReq);
        protocol.wabaoSet = info
        this.SendToServer(protocol);
    }

    private BagNumChange() {
        SMDTriggerNotify(FishData.Inst().ResultData, "WaBaoCollectionBookInfo")
    }
}


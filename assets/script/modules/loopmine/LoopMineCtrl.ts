import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { MountData } from 'modules/mount/MountData';
import { LoopMineData } from './LoopMineData';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { BagData } from 'modules/bag/BagData';

export enum DUO_BAO_REQ_TYPE{
    RECORD_INFO = 0, // 全服记录      paraml_doubao_type[0,1]  
    REFRESH = 1,     // 刷新道具      paraml_doubao_type[0,1]  
    DRAW = 2,        // 抽奖          paraml_doubao_type[0,1]  param2-抽奖次数1 or 10
    FETCH = 3,       // 领取积分奖励  paraml_doubao_type[0,1]   param2-level
}

export class LoopMineCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCDuoBaoInfo, func: this.onSCDuoBaoInfo },
            { msgType: PB_SCDuoBaoItemInfo, func: this.onSCDuoBaoItemInfo },
            { msgType: PB_SCDuoBaoRecordInfo, func: this.onSCDuoBaoRecordInfo },

        ]
    }

    // 夺宝信息
    private onSCDuoBaoInfo(protocol: PB_SCDuoBaoInfo) {
        LogError("1656?夺宝信息?onSCDuoBaoInfo",protocol)
        LoopMineData.Inst().SetSCDuoBaoInfo(protocol)
    }

    
    // 夺宝道具列表信息
    private onSCDuoBaoItemInfo(protocol: PB_SCDuoBaoItemInfo) {
        LogError("1657?夺宝道具列表信息?onSCDuoBaoItemInfo",protocol)
        LoopMineData.Inst().SetSCDuoBaoItemInfo(protocol)
    }

    
    // 夺宝全服记录信息
    private onSCDuoBaoRecordInfo(protocol: PB_SCDuoBaoRecordInfo) {
        LogError("1658?夺宝全服记录信息?onSCDuoBaoRecordInfo",protocol)
        LoopMineData.Inst().SetSCDuoBaoRecordInfo(protocol)
    }

    // 夺宝请求
    public SendCSDuoBaoReq(type: DUO_BAO_REQ_TYPE,param:any){
        LogError("1655?夺宝请求?SendCSDuoBaoReq",type,param)
        let protocol = this.GetProtocol(PB_CSDuoBaoReq);
        protocol.opType = type;
        protocol.param1 = param.param1;
        protocol.param2 = param.param2;
        this.SendToServer(protocol);
    }

    // // 坐骑请求
    // public SendCSMountReq(type: MOUNR_REQ_TYPE,param:number){
    //     LogError("2141?坐骑请求?SendCSMountReq",type,param)
    //     let protocol = this.GetProtocol(PB_CSMountReq);
    //     protocol.reqType = type;
    //     protocol.param = param;
    //     this.SendToServer(protocol);
    // }

    // // 坐骑回调信息（单独下发)
    // private onSCMountOpRet(protocol: PB_SCMountOpRet) {
    //     LogError("2142?坐骑回调信息?onSCMountOpRet",protocol)
    //     MountData.Inst().SetSCMountOpRet(protocol)
    // }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.LoopMine.View, 
            BagData.Inst().BagItemData, 
            LoopMineData.Inst().GetRedNum.bind(LoopMineData.Inst())));

        this.handleCollector.Add(RemindRegister.Create(Mod.LoopMine.View, 
            LoopMineData.Inst().flush_info, 
            LoopMineData.Inst().GetRedNum.bind(LoopMineData.Inst())));
    }
}
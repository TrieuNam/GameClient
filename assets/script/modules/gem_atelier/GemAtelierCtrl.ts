import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { GemAtelierData } from './GemAtelierData';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';

export enum GEM_ATELIER_REQ_TYPE{
    INLAY = 1,       // 镶嵌 p1 图纸id p2：item_id p3:x p4:y
    REMOVE = 2,      // 取下 P1 图纸id p2：图纸镶嵌列表index
    COMPOSE = 3,     // 合成 p1 主宝石item_id p2 p3 材料宝石item_id
    MOVE = 4,        // 移动 p1 图纸id p2 index[0,5] p3 x p4 y
    TRANSFORM = 5,   // 转换 p1 材料宝石id p2 目标宝石id
    LEVEL_UP = 6,    // 升级 p1 升级宝石id 

}

export class GemAtelierCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCGemInfo, func: this.onSCGemInfo },
        ]
    }
    
     // 宝石信息
     private onSCGemInfo(protocol: PB_SCGemInfo) {
        LogError("1661?宝石信息?onSCGemInfo",protocol)
        GemAtelierData.Inst().SetSCGemInfo(protocol)
    }

    // 宝石请求
    public SendCSGemReq(type: GEM_ATELIER_REQ_TYPE,param:any){
        LogError("1660?宝石请求?SendCSGemReq",type,param)
        let protocol = this.GetProtocol(PB_CSGemReq);
        protocol.opType = type;
        protocol.param1 = param.param1;
        protocol.param2 = param.param2;
        protocol.param3 = param.param3;
        protocol.param4 = param.param4;
        this.SendToServer(protocol);
    }

    // 宝石一键升级请求
    public SendCSGemOneKeyUpLevelReq(param:any){
        LogError("1666?宝石一键合成请求?SendCSGemOneKeyUpLevelReq",param)
        let protocol = this.GetProtocol(PB_CSGemOneKeyUpLevelReq);
        protocol.itemIds = param;

        this.SendToServer(protocol);
    }

    // 宝石购买请求
    public SendCSGemBuyReq(param:any){
        LogError("1667?宝石购买请求?PB_CSGemBuyReq",param)
        let protocol = this.GetProtocol(PB_CSGemBuyReq);
        protocol.itemIds = param;

        this.SendToServer(protocol);
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.GemAtelier.View, 
            GemAtelierData.Inst().flush_info, 
            GemAtelierData.Inst().GetRedNum.bind(GemAtelierData.Inst())));

        this.handleCollector.Add(RemindRegister.Create(Mod.GemAtelier.View, 
            CoreCrisisData.Inst().flush_info, 
            GemAtelierData.Inst().GetCoreRedNum.bind(GemAtelierData.Inst())));
    }
}

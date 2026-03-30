import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { StarMapData, STAR_MAP_RET_TYPE } from "modules/star_map/StarMapData";
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { OpenServerData } from 'modules/open_server/OpenServerData';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { BagData } from 'modules/bag/BagData';
import { RoleData } from 'modules/role/RoleData';
import { StarMapSuperData } from './StarMapSuperData';
import { ViewManager } from 'manager/ViewManager';
import { StarMapSuperNodeShow } from './StarMapSuperNodeShow';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';

export enum STAR_MAP_REQ_TYPE{
    LEVEL_UP = 0, // p1 类型 p2 阶段 p3 id
    BIG_LEVEL_UP = 1, // p1 id  
    RESET = 2,  // p1 类型 p2 阶段
    BIG_RESET = 3,  // 
    LEVEL_UP_ONE_KEY = 4, // P1 类型 p2 阶段 p4 购买seq p5 购买数量 paramlist id列表
    BIG_LEVEL_UP_ONE_KEY = 5, // paramlist id列表

    NEW_BIG_UP,     // 升级超星系 p1:路线
    NEW_BIG_RESET,  // 重置超星系
}

export class StarMapCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCStarMapInfo, func: this.onSCStarMapInfo },
            { msgType: PB_SCStarMapOpRet, func: this.onSCStarMapOpRet },
        ]
    }

    // 星图信息
    private onSCStarMapInfo(protocol: PB_SCStarMapInfo) {
        LogError("2151?星图信息?onSCStarMapInfo",protocol)
        StarMapData.Inst().SetSCStarMapInfo(protocol);
        StarMapSuperData.Inst().SetStarSuperInfo(protocol);
    }

    // 星图请求
    public SendCSStarMapReq(type: STAR_MAP_REQ_TYPE,param:any){
        LogError("2150?星图请求?SendCSStarMapReq",type,param)
        let protocol = this.GetProtocol(PB_CSStarMapReq);
        protocol.reqType = type;
        protocol.param1 = param.param1;
        protocol.param2 = param.param2;
        protocol.param3 = param.param3;
        protocol.paramList = param.paramlist == null ? [] : param.paramlist;
        protocol.param4 = param.param4;
        protocol.param5 = param.param5;
        this.SendToServer(protocol);
    }

    // 星图回调信息（单独下发)
    private onSCStarMapOpRet(protocol: PB_SCStarMapOpRet) {
        LogError("2152?星图回调信息?onSCStarMapOpRet",protocol)
        StarMapData.Inst().SetSCStarMapOpRet(protocol);

        let type = protocol.retType;
        if(type == STAR_MAP_RET_TYPE.NEW_SUPER_LEVEL_UP){
            StarMapSuperData.Inst().SetRouteLevel(protocol.param1, protocol.param2);
            let cfg = StarMapSuperData.Inst().GetNodeLevelCfg(protocol.param1, protocol.param2);
            if(cfg != null){
                if(cfg.icon_size == 1.2){
                    //ViewManager.Inst().OpenView(StarMapSuperNodeShow, {node : cfg});
                    StarMapSuperData.Inst().selNodeInfo.star_node = cfg;
                }else{
                    PublicPopupCtrl.Inst().CenterAttr2(cfg.jihuo_att[0],1);
                }
            }
        }else if(type == STAR_MAP_RET_TYPE.NEW_SUPER_RESET){
            StarMapSuperData.Inst().SetStarSuperInfo(null);
        }
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.StarMap.View, 
            StarMapData.Inst().flush_info, 
            StarMapData.Inst().GetRedNum.bind(StarMapData.Inst())));

            // this.handleCollector.Add(RemindRegister.Create(Mod.StarMap.View, 
            // CoreCrisisData.Inst().flush_info,
            // StarMapData.Inst().GetRedNum.bind(StarMapData.Inst())));

            
            // this.handleCollector.Add(RemindRegister.Create(Mod.StarMap.View, 
            // BagData.Inst().BagItemData,
            // StarMapData.Inst().GetRedNum.bind(StarMapData.Inst())));

        this.handleCollector.Add(SMDHandle.Create(CoreCrisisData.Inst().flush_info, 
            StarMapData.Inst().FlushCoreCrisis.bind(StarMapData.Inst()), "need_flush"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, 
            StarMapData.Inst().FlushItemChange.bind(StarMapData.Inst()), "OtherChange"));
    }
    
}

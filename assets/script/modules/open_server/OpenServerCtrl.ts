import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { ViewManager } from 'manager/ViewManager';
import { BaseCtrl, regMod, regMsg } from 'modules/common/BaseCtrl';
import { Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { RemindCtrl } from 'modules/remind/RemindCtrl';
import { OpenServerData } from './OpenServerData';
import { OpenServerView } from './OpenServerView';
import { OpenServerNeoServer } from './OpenServerNeoServer';

export enum SEVEN_DAY_REQ_TYPE {
    INFO = 0,      // 请求信息
    RECEIVE = 1,   // 领取 P1:seq
}

export enum BOX_OPEN_REQ_TYPE {
    INFO = 0,      // 请求信息
    RECEIVE = 1,   // 领取 P1:seq
}

export enum NEO_SERVER_REQ_TYPE {
    INFO = 0,       // 请求信息
    BUY_GIFT = 1,   // 购买礼包（直购除外） P1:seq
}

export enum NEO_SHOP_REQ_TYPE {
    INFO = 0,         // 请求信息
    REFRESH = 1,      // 请求商店
    BUY_GIFT = 2,     // 购买礼包（直购除外） P1:seq[shop_goods_seq]
}


export class OpenServerCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCSevenDaySignInfo, func: this.onSCSevenDaysInfo },
            { msgType: PB_SCLuckUnpackingInfo, func: this.onSCLuckUnpackingInfo },
            { msgType: PB_SCNewAreaPreferentialInfo, func: this.onSCNewAreaPreferentialInfo },
            { msgType: PB_SCMarketShopInfo, func: this.onSCMarketShopInfo },
        ]
    }

    ModCfg(): regMod[] {
        return [
            { modKey: Mod.OpenServer.View, vClass: OpenServerView },
            { modKey: Mod.OpenServer.NeoServer, vClass: OpenServerView },
        ]
    }

    // 七日签到信息
    private onSCSevenDaysInfo(protocol: PB_SCSevenDaySignInfo) {
        LogError("?七日签到信息 2161", protocol)
        OpenServerData.Inst().SetSevenDaysInfo(protocol)
    }

    // 七日签到请求
    public SendCSSevenDaySignReq(type: SEVEN_DAY_REQ_TYPE, param: number) {
        LogError("?七日签到请求 2160", type, param)
        let protocol = this.GetProtocol(PB_CSSevenDaySignReq);
        protocol.operaType = type;
        protocol.param1 = param;
        this.SendToServer(protocol);
    }

    // 开箱大吉 信息
    private onSCLuckUnpackingInfo(protocol: PB_SCLuckUnpackingInfo) {
        LogError("?开箱大吉 2163", protocol)
        OpenServerData.Inst().SetBoxOpenInfo(protocol)
    }

    // 开箱大吉请求
    public SendCSLuckUnpackingReq(type: BOX_OPEN_REQ_TYPE, param: number) {
        LogError("?开箱大吉请求 2162", type, param)
        let protocol = this.GetProtocol(PB_CSLuckUnpackingReq);
        protocol.operaType = type;
        protocol.param1 = param;
        this.SendToServer(protocol);
    }

    // 新服特惠 信息
    private onSCNewAreaPreferentialInfo(protocol: PB_SCNewAreaPreferentialInfo) {
        LogError("?新服特惠 2165", protocol)
        OpenServerData.Inst().SetNeoServerInfo(protocol)
    }

    // 新服特惠请求
    public SendCSNewAreaPreferentialReq(type: NEO_SERVER_REQ_TYPE, param: number) {
        LogError("?新服特惠请求 2164", type, param)
        let protocol = this.GetProtocol(PB_CSNewAreaPreferentialReq);
        protocol.operaType = type;
        protocol.param1 = param;
        this.SendToServer(protocol);
    }

    // 集市商店 信息
    private onSCMarketShopInfo(protocol: PB_SCMarketShopInfo) {
        LogError("?集市商店 2167", protocol)
        OpenServerData.Inst().SetNeoShopInfo(protocol)
    }

    // 集市商店请求
    public SendCSMarketShopReq(type: NEO_SHOP_REQ_TYPE, param: number) {
        LogError("?集市商店请求 2166", type, param)
        let protocol = this.GetProtocol(PB_CSMarketShopReq);
        protocol.operaType = type;
        protocol.param1 = param;
        this.SendToServer(protocol);
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.OpenServer.View,
            OpenServerData.Inst().flush_info,
            OpenServerData.Inst().GetRedNum.bind(OpenServerData.Inst())));
    }
}

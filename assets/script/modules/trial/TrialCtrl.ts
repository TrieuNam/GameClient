import { RemindRegister } from "data/HandleCollectorCfg";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { TrialConfig } from "./TrialConfig";
import { TrialData } from "./TrialData";
import { LogError } from "core/Debugger";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";

export enum Trail_CJ_TYPE {
    INFO = 0, //请求信息
    FETCH = 1, //请求领取 p1:seq
    YIJIAN = 2,//一键领取
}

export class TrialCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCShiLianPagodaInfo, func: this.OnShiLianPagodaInfo },

            { msgType: PB_SCGuMoPagodaListInfo, func: this.OnGuMoPagodaListInfo },
            { msgType: PB_SCGuMoPagodaLayerInfo, func: this.OnGuMoPagodaLayerInfo },
            { msgType: PB_SCRaGuMoTowerFundInfo, func: this.OnRaGuMoTowerFundInfo },

        ]
    }

    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Dungeon.GuMo, TrialData.Inst().ResultData, TrialData.Inst().GetGuMoRedPoint.bind(TrialData.Inst(), "GuMoLayerInfo")));
        this.handleCollector.Add(RemindRegister.Create(Mod.Dungeon.GuMo, TrialData.Inst().ResultData, TrialData.Inst().GetTrailChengJiuAllRed.bind(TrialData.Inst(), "TrialChengJiuInfo", "GuMoLayerInfo")));

    }

    public OnShiLianPagodaInfo(protocol: PB_SCShiLianPagodaInfo) {
        TrialData.Inst().SetShiLianPagodaInfo(protocol);
    }

    public OnGuMoPagodaListInfo(protocol: PB_SCGuMoPagodaListInfo) {
        TrialData.Inst().SetGuMoPagodaListInfo(protocol);
    }

    public OnGuMoPagodaLayerInfo(protocol: PB_SCGuMoPagodaLayerInfo) {
        TrialData.Inst().SetGuMoPagodaLayerInfo(protocol);
    }

    public OnRaGuMoTowerFundInfo(protocol: PB_SCRaGuMoTowerFundInfo) {
        TrialData.Inst().SetGuMoTowerFundInfo(protocol);
    }

    public SendShiLianPagodaReq(type: number, param1?: number, param2?: number) {
        let protocol = this.GetProtocol(PB_CSShiLianPagodaReq);
        protocol.type = type;
        protocol.p1 = param1 ?? 0;
        protocol.p2 = param2 ?? 0;
        this.SendToServer(protocol);
    }

    public SendShiLianPagodaReqFight() {
        BattleCtrl.Inst().reqFight(ENUM_BATTLE.HERO_BATTLE_TYPE_SHI_LIAN_PAGODA, TrialConfig.TrialReqType.fight)
        // this.SendShiLianPagodaReq(TrialReqType.fight);
    }

    public SendShiLianPagodaReqChoice(index: number) {
        this.SendShiLianPagodaReq(TrialConfig.TrialReqType.choice, index);
    }

    public SendShiLianPagodaReqOpen(index: number) {
        this.SendShiLianPagodaReq(TrialConfig.TrialReqType.open, index);
    }

    public SendShiLianPagodaReqUse(index: number, item_id: number) {
        this.SendShiLianPagodaReq(TrialConfig.TrialReqType.use, index, item_id);
    }

    public SendShiLianPagodaReqReset() {
        this.SendShiLianPagodaReq(TrialConfig.TrialReqType.reset);
    }

    public SendGuMoPagodaReq(type: number, param1?: number, param2?: number) {
        let protocol = this.GetProtocol(PB_CSGuMoPagodaReq);
        protocol.type = type;
        protocol.p1 = param1 ?? 0;
        protocol.p2 = param2 ?? 0;
        this.SendToServer(protocol);
    }

    public SendGuMoPagodaReqList(layer: number) {
        this.SendGuMoPagodaReq(TrialConfig.GuMoReqType.list, layer);
    }

    public SendGuMoPagodaReqInfo(layer: number) {
        this.SendGuMoPagodaReq(TrialConfig.GuMoReqType.info, layer);
    }

    public SendGuMoPagodaReqFight(level: number) {
        BattleCtrl.Inst().reqFight(ENUM_BATTLE.HERO_BATTLE_TYPE_GU_MO_PAGODA, TrialConfig.GuMoReqType.fight, level)
        // this.SendGuMoPagodaReq(TrialConfig.GuMoReqType.fight, level);
    }

    public SendGuMoPagodaReqFetchBox(layer: number, index: number) {
        this.SendGuMoPagodaReq(TrialConfig.GuMoReqType.fetch_box, layer, index);
    }

    public SendGuMoPagodaReqDayReward(level: number) {
        this.SendGuMoPagodaReq(TrialConfig.GuMoReqType.day_reward, level);
    }

    public SendChengJiuReq(type: Trail_CJ_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.GuMoChengJiu, type, p1);
    }
}


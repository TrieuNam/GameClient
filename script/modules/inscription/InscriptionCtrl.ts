import { LogError } from "core/Debugger";
import { RemindRegister, SMDHandle } from "data/HandleCollectorCfg";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { BagData } from "modules/bag/BagData";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseCtrl, regMod, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { RoleData } from "modules/role/RoleData";
import { InscriptionData } from "./InscriptionData";

// 请求类型
export enum RUNE_REQ_TYPE {
    FIGHT = 0,                 // 挑战
    FETCHDAYREWARD = 1,        // 领取每日奖励
    TURNTABLE = 2,             // 转盘      p1:次数
    WEARRUNE = 3,              // 穿戴铭文    p1:装备格子index[0,9]  p2:背包格子index[0,299]
    OFFRUNE = 4,               // 脱下铭文    p1:装备格子index[0,9]
    UPRUNE = 5,                // 铭文升级    p1:背包格子index[0,299]
    DECOMPOSE = 6,             // 分解铭文    p1 分解铭文数量 p2 分解水晶数量 p1_list 背包格子index[0,299] p2_list 物品id(水晶分解)
    PASS_REWARD = 7,           // 通关奖励
    RUNE_BOX = 8,              // 宝箱抽奖 p1:type
}

// 回调类型
export enum RUNE_RET_INFO_TYPE {
    DAILY_REWARD = 0,       // 每日奖励    p1:0或1
    PASS_LEVEL = 1,         // 通关等级    p1:等级
    TURNTABLE_NUM = 2,      // 转盘次数    p1:剩余次数
    TURNTABLE_RET = 3,      // 转盘奖励    p1:二进制标记转的格子(如果抽到大奖就在播完动画后把轮次+1)
    RUNE_CHANGE = 4,        // 铭文变化    p1:背包index    p2:id    p3:level
    RUNE_WEAR = 5,          // 铭文穿戴    p1:穿戴index    p2:背包index
    PASS_REWARD = 6,        // 通关奖励    p1:初始为0 领了第一个后变成1
}

export enum Inscription_CJ_TYPE {
    INFO = 0, //请求信息
    FETCH = 1, //请求领取 p1:seq
    YIJIAN = 2,//一键领取
}


export class InscriptionCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRuneInfo, func: this.onSCRuneInfo },
            { msgType: PB_SCRuneRet, func: this.onSCRuneRet },
            { msgType: PB_SCRaRuneTowerFundInfo, func: this.onSCRaRuneTowerFundInfo },
        ]
    }

    ModCfg(): regMod[] {
        return [
            // { modKey: Mod.ServerActivity.Atlas, vClass: InscriptionMainView },
            // { modKey: Mod.ServerActivity.Resolve, vClass: InscriptionMainView },
            // { modKey: Mod.ServerActivity.Turntable, vClass: InscriptionMainView },
            // { modKey: Mod.ServerActivity.Center, vClass: InscriptionMainView },
        ]
    }

    // 铭文信息
    private onSCRuneInfo(protocol: PB_SCRuneInfo) {
        LogError("1670?铭文信息?onSCDuoBaoInfo", protocol)
        InscriptionData.Inst().SetInscriptionInfo(protocol)
    }

    // 铭文请求
    public SendCSRuneReq(type: RUNE_REQ_TYPE, param1: number = 0, param2: number = 0, p1_list: number[] = [], p2_list: number[] = []) {
        LogError("1672?铭文请求?PB_CSRuneReq", type, param1, param2, p1_list, p2_list)
        if (type == RUNE_REQ_TYPE.FIGHT) {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.HERO_BATTLE_TYPE_INSCRIPTION_TOWER, type, param1, param2)
        } else {
            let protocol = this.GetProtocol(PB_CSRuneReq);
            protocol.operType = type;
            protocol.p1 = param1;
            protocol.p2 = param2;
            protocol.p1List = p1_list ?? [];
            protocol.p2List = p2_list ?? [];
            this.SendToServer(protocol);
        }
    }

    // 铭文回调
    private onSCRuneRet(protocol: PB_SCRuneRet) {
        LogError("1672?铭文信息?onSCDuoBaoInfo", protocol)
        InscriptionData.Inst().SetInscriptionRetInfo(protocol)
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Inscription.Main,
            InscriptionData.Inst().flush_info,
            InscriptionData.Inst().GetRedNum.bind(InscriptionData.Inst())));

        this.handleCollector.Add(RemindRegister.Create(Mod.Inscription.Center,
            InscriptionData.Inst().flush_info,
            InscriptionData.Inst().GetCenterRed.bind(InscriptionData.Inst())));

        this.handleCollector.Add(RemindRegister.Create(Mod.Inscription.Turntable,
            RoleData.Inst().AdFlush,
            InscriptionData.Inst().GetAdRed.bind(InscriptionData.Inst())));

        // this.handleCollector.Add(RemindRegister.Create(Mod.Inscription.Main,
        //     CoreCrisisData.Inst().flush_info,
        //     InscriptionData.Inst().GetRedNum.bind(InscriptionData.Inst())));

        // this.handleCollector.Add(RemindRegister.Create(Mod.Inscription.Main,
        //     RoleData.Inst().AdFlush,
        //     InscriptionData.Inst().GetRedNum.bind(InscriptionData.Inst())));

        this.handleCollector.Add(SMDHandle.Create(CoreCrisisData.Inst().flush_info,
            InscriptionData.Inst().FlushCoreCrisis.bind(InscriptionData.Inst()), "need_flush"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData,
            InscriptionData.Inst().FlushItemChange.bind(InscriptionData.Inst()), "OtherChange"));
        // this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().AdFlush,
        //     InscriptionData.Inst().FlushItemChange.bind(InscriptionData.Inst()), "flush_info"));

        this.handleCollector.Add(RemindRegister.Create(Mod.InscriptionTower.Main, InscriptionData.Inst().flush_info, InscriptionData.Inst().GetTowerRedPoint.bind(InscriptionData.Inst(), "inscription_info_flush", "tower_reward_flush", "turntable_num_flush", "tower_level_flush", "tower_chapter_flush")));
        this.handleCollector.Add(RemindRegister.Create(Mod.InscriptionTower.Main, InscriptionData.Inst().flush_info, InscriptionData.Inst().GetChengJiuAllRed.bind(InscriptionData.Inst(), "inscription_info_flush", "tower_reward_flush", "turntable_num_flush", "tower_level_flush", "tower_chapter_flush", "chengjiu_info")));

    }

    private onSCRaRuneTowerFundInfo(protocol: PB_SCRaRuneTowerFundInfo) {
        LogError("3027?铭文成就?onSCRaRuneTowerFundInfo", protocol)
        InscriptionData.Inst().SetInscriptionChengJiuInfo(protocol)
    }

    public SendChengJiuReq(type: Inscription_CJ_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.InscripeChengJiu, type, p1);
    }
}
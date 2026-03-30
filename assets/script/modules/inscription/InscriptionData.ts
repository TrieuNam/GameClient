import { CfgInscriptionData } from "config/CfgInscription";
import { CfgInscriptionChengJiuData } from "config/CfgInscriptionChengJiu";
import { CfgInscriptionTowerData } from "config/CfgInscriptionTower";
import { CfgPassiveSkillData } from "config/CfgPassiveSkill";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { Item } from "modules/bag/ItemData";
import { AdType } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonRewardView } from "modules/common_account/CommonRewardView";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { RUNE_RET_INFO_TYPE } from "./InscriptionCtrl";
import { InscriptionTurntableAdView } from "./InscriptionTurntableAdView";

class InscriptionInfo {
    @smartdata
    flushneed: number;

    @smartdata
    mainoper: number;

    @smartdata
    mainExEff: number;

    @smartdata
    tower_level_flush: boolean = false

    @smartdata
    tower_reward_flush: boolean = false

    @smartdata
    turntable_num_flush: boolean = false

    @smartdata
    turntable_flag_flush: boolean = false

    @smartdata
    inscription_info_flush: boolean = false

    @smartdata
    tower_chapter_flush: boolean = false

    @smartdata
    chengjiu_info: PB_SCRaRuneTowerFundInfo

    @smartdata
    ad_auto_draw1: boolean = false
}

export class InscriptionData extends DataBase {
    public flush_info: InscriptionInfo;
    private rune_info: any
    private resolve_mark = false
    private chengjiu_phase = 1
    private turntable_rewards: any[]
    public turntable_drawing: boolean
    constructor() {
        super();
        this.createSmartData();

        this.rune_info = {}
    }

    private createSmartData() {
        this.flush_info = CreateSMD(InscriptionInfo);
        this.flush_info.flushneed = 0
        this.flush_info.mainExEff = 0
    }

    public RuneInfo() {
        return this.rune_info
    }

    public SetInscriptionInfo(data: PB_SCRuneInfo) {
        this.rune_info.tower_level = data.towerLevel
        this.rune_info.turntable_num = data.turntableNum
        this.rune_info.turntable_flag = data.turntableFlag
        this.rune_info.turntable_round = data.turntableRound
        this.rune_info.daily_reward = data.dailyReward
        this.rune_info.rune_wear_list = data.runeWearList
        this.rune_info.rune_knapsack_list = []
        this.rune_info.pass_reward_index = data.passRewardIndex
        for (var index in data.runeKnapsackList) {
            let info = {
                index: data.runeKnapsackList[Number(index)].index,
                id: data.runeKnapsackList[Number(index)].id,
                level: data.runeKnapsackList[Number(index)].level,

            }
            this.rune_info.rune_knapsack_list.push(info)
        }
        this.flush_info.flushneed = this.flush_info.flushneed + 1
        this.flush_info.inscription_info_flush = !this.flush_info.inscription_info_flush
    }

    // ret_type param
    public SetInscriptionRetInfo(data: PB_SCRuneRet) {
        if (data.retType == RUNE_RET_INFO_TYPE.DAILY_REWARD) {
            this.rune_info.daily_reward = data.param[0]
            this.flush_info.tower_reward_flush = !this.flush_info.tower_reward_flush
        }
        else if (data.retType == RUNE_RET_INFO_TYPE.PASS_LEVEL) {
            this.rune_info.tower_level = data.param[0]
            this.flush_info.tower_level_flush = !this.flush_info.tower_level_flush
        }
        else if (data.retType == RUNE_RET_INFO_TYPE.TURNTABLE_NUM) {
            // let num_pre = this.rune_info.turntable_num
            this.rune_info.turntable_num = data.param[0]
            this.flush_info.turntable_num_flush = !this.flush_info.turntable_num_flush
            // if (1 == (data.param[0] - num_pre)) {
            //     InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.TURNTABLE, 1);
            // }
        }
        else if (data.retType == RUNE_RET_INFO_TYPE.TURNTABLE_RET) {
            this.rune_info.turntable_flag = data.param[0]
            this.flush_info.turntable_flag_flush = !this.flush_info.turntable_flag_flush
        }
        else if (data.retType == RUNE_RET_INFO_TYPE.RUNE_CHANGE) {
            let with_oper = false
            for (var check in this.rune_info.rune_knapsack_list) {
                if (this.rune_info.rune_knapsack_list[check].index == Number(data.param[0])) {
                    this.rune_info.rune_knapsack_list[check].id = data.param[1]
                    this.rune_info.rune_knapsack_list[check].level = data.param[2]
                    with_oper = true
                }
            }
            if (!with_oper) {
                let info = {
                    index: data.param[0],
                    id: data.param[1],
                    level: data.param[2],
                }
                this.rune_info.rune_knapsack_list.push(info)
            }
        }
        else if (data.retType == RUNE_RET_INFO_TYPE.RUNE_WEAR) {
            this.rune_info.rune_wear_list[data.param[0]] = data.param[1]
        } else if (data.retType == RUNE_RET_INFO_TYPE.PASS_REWARD) {
            this.rune_info.pass_reward_index = data.param[0]
            this.flush_info.tower_chapter_flush = !this.flush_info.tower_chapter_flush
        }
        this.flush_info.flushneed = this.flush_info.flushneed + 1
    }

    // 1~18  普通
    // 19~20 核心
    public SetOperPos(index: number) {
        this.flush_info.mainoper = index
    }

    public GetOperPos() {
        return this.flush_info.mainoper
    }

    public GetBagPosFromOper() {
        if (this.flush_info.mainoper > -1) {
            return this.rune_info.rune_wear_list[this.flush_info.mainoper]
        }
        return -1
    }
    public GetSpCfgById(item_id: number, level: number) {
        let cfg = CfgInscriptionData.ts_mingwen
        for (var index in cfg) {
            if (cfg[index].id == item_id && cfg[index].level == level) {
                return cfg[index]
            }
        }

        return null
    }

    public GetRedNum() {
        if (!FunOpen.Inst().GetFunIsOpen(Mod.Inscription.Main).is_open) {
            return 0
        }

        if (CoreCrisisData.Inst().GetCoreRed(CoreCrisisType.Inscription) == 1) {
            // LogError("red 0")
            return 1
        }

        for (var index in this.rune_info.rune_wear_list) {
            let oper = this.rune_info.rune_wear_list[index]
            let pos = Number(index)
            let list = this.GetSelectList(pos)
            let hole_cfg = CfgInscriptionData.hole[Number(index)]

            for (var check in list) {
                let check_oper = list[check]
                // 检查空孔位
                if (this.rune_info.tower_level >= hole_cfg.unlock) {
                    if (oper == -1) {
                        if (!check_oper.is_equiped && !check_oper.with_same && check_oper.is_lock) {
                            return 1
                        }
                    }
                    else {
                        // 检查非空孔位（高品）
                        let info = this.GetBagPosInfo(oper)
                        let collect_cfg = this.GetCollectCfg(info.id)
                        let ts_cfg = this.GetSpCfgById(info.id, info.level)
                        if (collect_cfg != null || ts_cfg != null) {
                            let color = ts_cfg == null ? collect_cfg.color : ts_cfg.color
                            let upgrade_cfg = this.GetUpgradeCfg(ts_cfg == null ? collect_cfg.type : 2, info.level, color)
                            let item_num = Item.GetNum(CfgInscriptionData.other[0].up_item_id);
                            let is_max = (ts_cfg == null && collect_cfg.up_max_level == info.level) || (ts_cfg != null && ts_cfg.up_max_level == info.level)
                            let check_level = info.level + 1
                            let is_limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Inscription, check_level)

                            if (check_oper.color > color && check_oper.is_lock && !check_oper.with_same) {
                                return 1
                            }
                            if (ts_cfg != null) {
                                let cur_num = 0
                                let select_list = this.GetSelectList(pos)
                                for (var index in select_list) {
                                    if (!select_list[index].is_equiped && select_list[index].id == info.id) {
                                        cur_num = cur_num + 1
                                    }
                                }

                                item_num = cur_num
                            }

                            //检查可否升级
                            if (upgrade_cfg && upgrade_cfg.exp <= item_num && !is_max && !is_limit) {
                                // LogError("red 3")
                                return 1
                            }
                        }
                    }
                }
            }
        }

        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let show_ad = (RoleData.Inst().GetRoleLevel() >= +co.level && (!info || ((co.ad_param > info.todayCount) && TimeCtrl.Inst().ServerTime > info.nextFetchTime)))
        if (show_ad) {
            // LogError("red 4")
            return 1
        }
        // this.viewNode.RedPointShowTurntable.SetNum(info.turntable_num >= 1 ? 1 : 0);

        return 0
    }

    public GetCenterRed() {
        if (!FunOpen.Inst().GetFunIsOpen(Mod.Inscription.Main).is_open) {
            return 0
        }

        if (CoreCrisisData.Inst().GetCoreRed(CoreCrisisType.Inscription) == 1) {
            LogError("red 0")
            return 1
        }

        for (var index in this.rune_info.rune_wear_list) {
            let oper = this.rune_info.rune_wear_list[index]
            let pos = Number(index)
            let list = this.GetSelectList(pos)
            let hole_cfg = CfgInscriptionData.hole[Number(index)]

            for (var check in list) {
                let check_oper = list[check]
                // 检查空孔位
                if (this.rune_info.tower_level >= hole_cfg.unlock) {
                    if (oper == -1) {
                        if (!check_oper.is_equiped && !check_oper.with_same && check_oper.is_lock) {
                            return 1
                        }
                    }
                    else {
                        // 检查非空孔位（高品）
                        let info = this.GetBagPosInfo(oper)
                        let collect_cfg = this.GetCollectCfg(info.id)
                        let ts_cfg = this.GetSpCfgById(info.id, info.level)
                        if (collect_cfg != null || ts_cfg != null) {
                            let color = ts_cfg == null ? collect_cfg.color : ts_cfg.color
                            let upgrade_cfg = this.GetUpgradeCfg(ts_cfg == null ? collect_cfg.type : 2, info.level, color)
                            let item_num = Item.GetNum(CfgInscriptionData.other[0].up_item_id);
                            let is_max = (ts_cfg == null && collect_cfg.up_max_level == info.level) || (ts_cfg != null && ts_cfg.up_max_level == info.level)
                            let check_level = info.level + 1
                            let is_limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Inscription, check_level)

                            if (check_oper.color > color && check_oper.is_lock && !check_oper.with_same) {
                                return 1
                            }
                            if (ts_cfg != null) {
                                let cur_num = 0
                                let select_list = this.GetSelectList(pos)
                                for (var index in select_list) {
                                    if (!select_list[index].is_equiped && select_list[index].id == info.id) {
                                        cur_num = cur_num + 1
                                    }
                                }

                                item_num = cur_num
                            }

                            //检查可否升级
                            if (upgrade_cfg && upgrade_cfg.exp <= item_num && !is_max && !is_limit) {
                                LogError("red 3")
                                return 1
                            }
                        }
                    }
                }
            }
        }

        return 0
    }

    public GetAdRed() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let show_ad = (RoleData.Inst().GetRoleLevel() >= +co.level && (!info || ((co.ad_param > info.todayCount) && TimeCtrl.Inst().ServerTime > info.nextFetchTime)))
        return show_ad ? 1 : 0
    }

    public GetLevelRed(pos: number, id: number, level: number) {
        let collect_cfg = this.GetCollectCfg(id)
        if (collect_cfg == null) {
            return 0
        }
        let ts_cfg = this.GetSpCfgById(id, level)
        let is_max = (ts_cfg == null && collect_cfg.up_max_level == level) || (ts_cfg != null && ts_cfg.up_max_level == level)
        let need_id = ts_cfg == null ? CfgInscriptionData.other[0].up_item_id : ts_cfg.up_item_id
        let color = ts_cfg == null ? collect_cfg.color : ts_cfg.color
        let upgrade_cfg = this.GetUpgradeCfg(ts_cfg == null ? collect_cfg.type : 2, level, color)
        let need_num = ts_cfg == null ? (upgrade_cfg ? upgrade_cfg.exp : 0) : ts_cfg.up_item_num
        let item_num = 0 // Item.GetNum(need_id);

        let check_level = level + 1
        let is_limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Inscription, check_level)
        if (ts_cfg == null) {
            item_num = Item.GetNum(need_id);
        }
        else {
            let cur_num = 0
            let select_list = this.GetSelectList(pos)
            for (var index in select_list) {
                if (!select_list[index].is_equiped && select_list[index].id == id) {
                    cur_num = cur_num + 1
                }
            }

            item_num = cur_num
        }


        //


        if (upgrade_cfg && need_num <= item_num && !is_max && !is_limit) {
            return 1
        }
        return 0
    }

    public GetExColorRed(pos: number) {
        let oper = this.rune_info.rune_wear_list[pos]
        if (oper == -1) { return 0 }
        let list = this.GetSelectList(pos)
        let target = this.GetKnapsackItem(oper)
        for (var check in list) {
            let check_oper = list[check]

            let collect_cfg = this.GetCollectCfg(target.id)
            let ts_cfg = this.GetSpCfgById(target.id, target.level)
            // 检查空孔位
            let check_cfg = this.GetCollectCfg(check_oper.id)
            if (ts_cfg == null || collect_cfg != null) {
                let color = ts_cfg == null ? collect_cfg.color : ts_cfg.color
                if (check_oper.color > color && check_oper.is_lock && !check_oper.with_same) {
                    return 1
                }
                if (collect_cfg != null && check_cfg.att_type == collect_cfg.att_type && check_oper.color > collect_cfg.color && check_oper.is_lock) {
                    return 1
                }
            }
            // 特殊类型仅有自己，不存在品质
            // else if(ts_cfg != null)
            // {
            //     return 1
            // }
        }
        return 0
    }

    public GetEmptyRed(pos: number) {
        let hole_cfg = CfgInscriptionData.hole[pos]
        if (this.rune_info.tower_level < hole_cfg.unlock) {
            return 0
        }

        let oper = this.rune_info.rune_wear_list[pos]
        if (oper > -1) { return 0 }
        let list = this.GetSelectList(pos)
        for (var check in list) {
            let check_oper = list[check]
            // 检查空孔位
            if (!check_oper.is_equiped && !check_oper.with_same && check_oper.is_lock) {
                return 1
            }
        }
        return 0
    }

    public ResolveMark() {
        if (this.GetResolveRed() == 1) {
            this.resolve_mark = true
        }
    }

    public GetResolveRed() {
        if (this.resolve_mark) {
            return 0
        }

        for (var index in this.rune_info.rune_knapsack_list) {
            let oper = this.rune_info.rune_knapsack_list[index]
            let collect_cfg = this.GetCollectCfg(oper.id)
            let ts_cfg = this.GetSpCfgById(oper.id, oper.level)
            let is_equiped = false // oper.index == this.rune_info.rune_wear_list[this.flush_info.mainoper]
            for (var check in this.rune_info.rune_wear_list) {
                if (this.rune_info.rune_wear_list[check] == oper.index) {
                    is_equiped = true
                }
            }

            if (!is_equiped && (collect_cfg != null || ts_cfg != null)) {
                return 0 // 红点去除
            }
        }

        return 0
    }
    public GetExchangeRed() {
        return this.GetExColorRed(this.GetOperPos()) + this.GetEmptyRed(this.GetOperPos())
    }

    public GetBagPosInfo(index: number) {
        return this.GetKnapsackItem(index)
    }

    public GetMainEquipList() {
        let list = []
        for (var index in this.rune_info.rune_wear_list) {
            // if(this.rune_info.rune_wear_list[index] != -1)
            // {
            let param = this.GetKnapsackItem(this.rune_info.rune_wear_list[index])
            let item_cfg = (param != null && param.id != null && param.id > 0) ? Item.GetConfig(param.id) : null;
            let hole_cfg = CfgInscriptionData.hole[Number(index)]

            let info = {
                index: Number(index),
                id: (param == null) ? 0 : param.id,
                level: (param == null) ? 0 : param.level,
                name: item_cfg == null ? "" : item_cfg.name,
                lock_level: hole_cfg.unlock,
                is_lock: this.rune_info.tower_level >= hole_cfg.unlock,
            }
            list[Number(index)] = info
            // }

        }

        let result = {
            list: list,
        }

        return result
    }

    public GetMainDetail() {
        let attr_list: any[] = []
        let ts_skill = {
            cur_skill: "",
            next_skill: "",
            is_max: false
        }
        let result = {
            index: -1,
            is_empty: true,
            id: 0,
            level: 0,
            name: 0,
            need: 0,
            stuff: 0,
            attr_list: attr_list,
            is_ts: false,
            ts_skill: ts_skill,
            cur_num: 0,
            is_max: false,
        }

        let target = this.GetKnapsackItem(this.rune_info.rune_wear_list[this.flush_info.mainoper])
        // 不存在
        if (target == null || target.id == null) {
            return result
        }

        // 不存在
        if (target.id == 0) {
            return result
        }

        let item_cfg = Item.GetConfig(target.id)
        let collect_cfg = this.GetCollectCfg(target.id)
        let ts_cfg = this.GetSpCfgById(target.id, target.level)

        let need_num = 0
        let cur_num = 0
        let is_max = false
        if (ts_cfg == null && collect_cfg != null) {
            let upgrade_cfg = this.GetUpgradeCfg(collect_cfg.type, target.level, collect_cfg.color)
            need_num = upgrade_cfg ? upgrade_cfg.exp : 0
            is_max = collect_cfg.up_max_level == target.level

            for (var index in collect_cfg.up_att) {
                let info = {
                    is_max: is_max,
                    att_type: collect_cfg.up_att[index].type,
                    att_value: collect_cfg.base_att[index].add + collect_cfg.up_att[index].add * (target.level - 1),
                    next_value: is_max ? 0 : collect_cfg.base_att[index].add + collect_cfg.up_att[index].add * (target.level),
                }
                attr_list.push(info)
            }
            cur_num = Item.GetNum(CfgInscriptionData.other[0].up_item_id)
        }
        else if (ts_cfg != null) {
            is_max = ts_cfg.up_max_level == target.level
            let ts_next_cfg = this.GetSpCfgById(target.id, target.level + 1)
            let skill_cfg = this.GetSkillCfgForTs(ts_cfg.skill_id, ts_cfg.skill_level);
            let next_skill_cfg = is_max ? null : this.GetSkillCfgForTs(ts_next_cfg.skill_id, ts_next_cfg.skill_level);
            need_num = ts_cfg.up_item_num
            ts_skill.cur_skill = skill_cfg.skill_desc.toString()
            ts_skill.next_skill = is_max ? "" : next_skill_cfg.skill_desc.toString()
            ts_skill.is_max = is_max

            let select_list = this.GetSelectList(-1)
            for (var index in select_list) {
                if (!select_list[index].is_equiped && select_list[index].id == target.id) {
                    cur_num = cur_num + 1
                }
            }
        }

        result.is_empty = false
        result.id = target.id
        result.level = item_cfg != null ? target.level : ""
        result.name = item_cfg != null ? item_cfg.name : ""
        result.attr_list = attr_list

        result.is_ts = ts_cfg != null

        result.need = need_num
        result.stuff = ts_cfg != null ? ts_cfg.up_item_id : CfgInscriptionData.other[0].up_item_id
        result.cur_num = cur_num
        result.ts_skill = ts_skill
        result.is_max = is_max

        return result
    }

    public GetCollectCfg(id: number) {
        let cfg = CfgInscriptionData.collect
        for (var index in cfg) {
            if (cfg[index].id == id) {
                return cfg[index]
            }
        }

        return null
    }

    public GetUpgradeCfg(type: number, level: number, color: number) {
        let cfg = CfgInscriptionData.upgrade

        for (var index in cfg) {
            if (cfg[index].type == type && cfg[index].level == level && cfg[index].color == color) {
                return cfg[index]
            }
        }

        return null
    }

    public GetNextCollectCfg(attr_type: number, color: number) {
        let cfg = CfgInscriptionData.collect
        for (var index in cfg) {
            if (cfg[index].att_type == attr_type && color + 1 == cfg[index].color) {
                return cfg[index]
            }
        }

        return null
    }

    public MarkShowEff() {
        // LogError("?trye?")
        this.flush_info.mainExEff = 1
    }

    public CancelMarkShowEff() {
        // LogError("?trye?cancel!")
        this.flush_info.mainExEff = 0
    }

    public GetSelectList(pos: number) {
        let oper_type = pos > -1 ? (pos < 18 ? 1 : 2) : (this.GetOperPos() < 18 ? 1 : 2)

        let oper_pos = pos > -1 ? pos : this.GetOperPos()
        let list = []
        for (var index in this.rune_info.rune_knapsack_list) {
            let oper = this.rune_info.rune_knapsack_list[index]
            let item_cfg = Item.GetConfig(oper.id)
            let collect_cfg = this.GetCollectCfg(oper.id)
            let ts_cfg = this.GetSpCfgById(oper.id, oper.level)
            let is_ts = ts_cfg != null

            if (is_ts) {
                // 特殊铭文强制操作位2
                if (oper_type == 2) {
                    let is_same = this.CheckIsSameForTs(oper.id, oper.level, oper_pos)
                    let is_lock = true
                    let is_equiped = oper.index == this.rune_info.rune_wear_list[oper_pos]
                    let skill_cfg = this.GetSkillCfgForTs(ts_cfg.skill_id, ts_cfg.skill_level);

                    let attr_str = skill_cfg.skill_name + " " + Language.GemAtelier.LvShow + skill_cfg.skill_level

                    let att_list: any[] = []
                    let info = {
                        id: oper.id,
                        index: oper.index,
                        name: item_cfg.name,
                        with_same: is_same,
                        level: oper.level,
                        color: ts_cfg.color,
                        unlock_level: 0,
                        is_lock: is_lock,
                        attr_str: attr_str,
                        is_equiped: is_equiped,
                        is_ts: true,
                        atts: att_list,
                    }

                    list.push(info)
                }
            }
            else {
                if (collect_cfg != null && oper_type == collect_cfg.type) {
                    let is_same = this.CheckIsSame(collect_cfg.att_type, collect_cfg.type, collect_cfg.color, oper_pos)
                    let is_lock = this.rune_info.tower_level >= collect_cfg.unlock
                    let is_equiped = oper.index == this.rune_info.rune_wear_list[oper_pos]
                    let attr_str = ""
                    let att_list = []

                    for (var p_index in collect_cfg.up_att) {
                        let b_t_oper = collect_cfg.base_att[p_index]
                        let t_oper = collect_cfg.up_att[p_index]
                        let temp = AttrListName[t_oper.type] + " +" + AttrHelper.Percent(t_oper.type, b_t_oper.add + (Number(t_oper.add) * Number(oper.level - 1))) + " "
                        attr_str = temp + attr_str
                        att_list.push({ type: t_oper.type, add: b_t_oper.add + (Number(t_oper.add) * Number(oper.level - 1)) })
                    }

                    let info = {
                        id: oper.id,
                        index: oper.index,
                        name: item_cfg.name,
                        with_same: is_same,
                        level: oper.level,
                        color: collect_cfg.color,
                        unlock_level: collect_cfg.unlock,
                        is_lock: is_lock,
                        attr_str: attr_str,
                        is_equiped: is_equiped,
                        is_ts: false,
                        atts: att_list,
                    }

                    list.push(info)
                }
            }

        }
        list.sort((a, b) => { return b.color - a.color })
        return list
    }

    public GetCurSelectItem(pos: number) {
        let select_list = this.GetSelectList(pos)
        for (var index in select_list) {
            if (select_list[index].is_equiped) {
                return select_list[index]
            }
        }

        return null
    }

    public CheckIsSame(att_type: number, type: number, color: number, pos: number) {
        for (var index in this.rune_info.rune_wear_list) {
            let check = this.rune_info.rune_wear_list[index]
            if (check > -1) {
                let param = this.GetKnapsackItem(check)
                let collect_cfg = this.GetCollectCfg(param.id)
                // 受检查
                if (pos == Number(index)) {
                    // 不能是完全相同
                    if (collect_cfg != null && collect_cfg.att_type == att_type && collect_cfg.type == type && collect_cfg.color == color) {
                        return true
                    }
                }
                else {
                    // 只需要属性不相同
                    if (collect_cfg != null && collect_cfg.att_type == att_type && collect_cfg.type == type) {
                        return true
                    }
                }

            }
        }

        return false
    }

    public CheckIsSameForTs(item_id: number, level: number, pos: number) {
        for (var index in this.rune_info.rune_wear_list) {
            let check = this.rune_info.rune_wear_list[index]
            if (check > -1) {
                let param = this.GetKnapsackItem(check)
                let ts_cfg = this.GetSpCfgById(param.id, param.level)
                let check_ts_cfg = this.GetSpCfgById(item_id, level)
                if (pos == Number(index)) {
                    if (param.id == item_id || (ts_cfg != null && check_ts_cfg != null && ts_cfg.skill_id == check_ts_cfg.skill_id)) {
                        return true
                    }
                }
                else {
                    if (param.id == item_id || (ts_cfg != null && check_ts_cfg != null && ts_cfg.skill_id == check_ts_cfg.skill_id)) {
                        return true
                    }
                }
            }
        }

        return false
    }

    public CheckIsEquiped() { }

    public CfgTowerClearanceLevel(level: number) {
        return CfgInscriptionTowerData.clearance.find(cfg => cfg.level == level);
    }

    public CfgTowerDayRewardLevel(level: number) {
        return CfgInscriptionTowerData.day_reward.find(cfg => cfg.level_clear >= level);
    }

    public CfgTowerDayRewardIndex(index: number) {
        return CfgInscriptionTowerData.day_reward[index];
    }

    public CfgTowerTurntableShow(turntable_round: number) {
        return CfgInscriptionTowerData.turntable.filter(cfg => cfg.cur_round == turntable_round);
    }

    public CfgTowerRatePrizeGrid() {
        let co = CfgInscriptionTowerData.rate.find(cfg => cfg.cur_prize == 1);
        return co ? co.eight_grid : 1
    }

    public CfgTowerPriceCost() {
        // let cost = `${CfgInscriptionTowerData.price[0].cost}`.split(":")
        // return { item_id: +cost[0], num: +cost[1] };
        return CfgInscriptionTowerData.price[0].cost[0]
    }

    public CfgTowerPricePrice1() {
        return CfgInscriptionTowerData.price[0].price1
    }

    public CfgTowerPricePrice2() {
        return CfgInscriptionTowerData.price[0].price2
    }

    public GetBoxDrawRateShow(index: number) {
        let list: any[] = []
        CfgInscriptionTowerData.box.forEach(element => {
            if (index == element.type && element.rate > 0) {
                list.push(element)
            }
        });
        list.sort((a: any, b: any) => { return a.sort - b.sort })
        return list
    }


    public GetAtlasList() {
        let core_list: { list: { id: number; type: number; unlock: number; }[]; }[] = []
        let nomal_list: { list: { id: number; type: number; unlock: number; }[]; }[] = []
        let cfg = CfgInscriptionData.collect
        let ts_cfg = CfgInscriptionData.ts_mingwen
        for (var index in cfg) {
            let info = {
                id: cfg[index].id,
                type: cfg[index].type,
                unlock: cfg[index].unlock,
            }

            if (cfg[index].type == 1) {
                if (nomal_list[cfg[index].unlock] == null) {
                    let base_list: any[] = []
                    let tog_info = {
                        title: cfg[index].unlock == 0 ? Language.Inscription.AtlasNomalDefaultTitle :
                            TextHelper.Format(Language.Inscription.AtlasNomalTowerTitle, cfg[index].unlock),//Language.Inscription.AtlasCoreItemTitle,
                        list: base_list,
                        unlock: cfg[index].unlock,
                        is_core: false,
                    }
                    nomal_list[cfg[index].unlock] = tog_info
                }
                nomal_list[cfg[index].unlock].list.push(info)
            }
            else if (cfg[index].type == 2) {
                if (core_list[0] == null) {
                    let base_list: any[] = []
                    let tog_info = {
                        title: Language.Inscription.AtlasCoreItemTitle,
                        list: base_list,
                        unlock: cfg[index].unlock,
                        is_core: true,
                    }
                    core_list[0] = tog_info
                }
                core_list[0].list.push(info)
            }
        }

        for (var index in ts_cfg) {
            let info = {
                id: ts_cfg[index].id,
                type: 2,
                unlock: 0,
            }

            if (core_list[0] == null) {
                let base_list: any[] = []
                let tog_info = {
                    title: Language.Inscription.AtlasCoreItemTitle,
                    list: base_list,
                    unlock: cfg[index].unlock,
                }
                core_list[0] = tog_info
            }

            let is_with = true
            for (var checks in core_list[0].list) {
                if (core_list[0].list[checks].id == info.id) {
                    is_with = false
                }
            }

            if (is_with) {
                core_list[0].list.push(info)
            }

        }

        let result = []
        for (var index in nomal_list) {
            result.push(nomal_list[index])
        }

        result.unshift(core_list[0])

        return result
    }

    public GetResolveList() {
        let list = []
        for (var index in this.rune_info.rune_knapsack_list) {
            let oper = this.rune_info.rune_knapsack_list[index]
            let item_cfg = Item.GetConfig(oper.id)
            let collect_cfg = this.GetCollectCfg(oper.id)
            let ts_cfg = this.GetSpCfgById(oper.id, oper.level)
            let is_ts = ts_cfg == null
            let is_equiped = false //  Number(index) == this.rune_info.rune_wear_list[this.flush_info.mainoper]
            for (var check in this.rune_info.rune_wear_list) {
                if (this.rune_info.rune_wear_list[check] == oper.index) {
                    is_equiped = true
                }
            }

            if ((!is_equiped)) {
                if (ts_cfg != null) {
                    let skill_cfg = this.GetSkillCfgForTs(ts_cfg.skill_id, ts_cfg.skill_level);
                    let attr_str = skill_cfg.skill_name + " " + Language.GemAtelier.LvShow + skill_cfg.skill_level

                    let info = {
                        index: oper.index,
                        name: item_cfg.name,
                        id: oper.id,
                        color: ts_cfg.color,
                        attr_str: attr_str,
                        level: oper.level,
                        is_item: false,
                    }
                    list.push(info)
                }
                else if (collect_cfg != null) {
                    {
                        let attr_str = ""
                        for (var index in collect_cfg.up_att) {
                            let b_t_oper = collect_cfg.base_att[index]
                            let t_oper = collect_cfg.up_att[index]
                            let temp = AttrListName[t_oper.type] + "+" + AttrHelper.Percent(t_oper.type, b_t_oper.add + (oper.level - 1) * t_oper.add) + " "
                            attr_str = temp + attr_str
                        }

                        let info = {
                            index: oper.index,
                            name: item_cfg.name,
                            id: oper.id,
                            color: collect_cfg.color,
                            level: oper.level,
                            attr_str: attr_str,
                            is_item: false,
                        }
                        list.push(info)
                    }
                }
            }
        }

        let oper_0_id = CfgInscriptionData.other[0].exp_id_0
        let item_0_cfg = Item.GetConfig(oper_0_id)
        let item_0_num = Item.GetNum(oper_0_id)
        let info0 = {
            index: -1,
            id: oper_0_id,
            name: item_0_cfg.name,
            color: item_0_cfg.color,
            attr_str: "",
            is_item: true,
        }
        if (item_0_num > 0) { list.push(info0) }

        let oper_1_id = CfgInscriptionData.other[0].exp_id_1
        let item_1_cfg = Item.GetConfig(oper_1_id)
        let item_1_num = Item.GetNum(oper_1_id)
        let info1 = {
            index: -1,
            id: oper_1_id,
            name: item_1_cfg.name,
            color: item_1_cfg.color,
            attr_str: "",
            is_item: true,
        }
        if (item_1_num > 0) { list.push(info1) }

        let oper_2_id = CfgInscriptionData.other[0].exp_id_2
        let item_2_cfg = Item.GetConfig(oper_2_id)
        let item_2_num = Item.GetNum(oper_2_id)
        let info2 = {
            index: -1,
            id: oper_2_id,
            name: item_2_cfg.name,
            color: item_2_cfg.color,
            attr_str: "",
            is_item: true,
        }
        if (item_2_num > 0) { list.push(info2) }

        let oper_3_id = CfgInscriptionData.other[0].exp_id_3
        let item_3_cfg = Item.GetConfig(oper_3_id)
        let item_3_num = Item.GetNum(oper_3_id)
        let info3 = {
            index: -1,
            id: oper_3_id,
            name: item_3_cfg.name,
            color: item_3_cfg.color,
            attr_str: "",
            is_item: true,
        }
        if (item_3_num > 0) { list.push(info3) }

        return list
    }

    public GetTotalInscriptionAttr() {
        let attr_list = []
        for (var index in this.rune_info.rune_wear_list) {
            let rune_index = this.rune_info.rune_wear_list[index]
            let oper = this.GetKnapsackItem(rune_index)
            if (oper != null && oper.id > -1) {
                let collect_cfg = this.GetCollectCfg(oper.id)
                if (collect_cfg != null) {
                    for (var att_index in collect_cfg.up_att) {
                        let base_attr_info = collect_cfg.base_att[att_index]
                        let attr_info = collect_cfg.up_att[att_index]

                        let flag = true
                        for (var checker in attr_list) {
                            if (attr_list[checker].attrType == attr_info.type) {
                                attr_list[checker].attrValue = base_attr_info.add + (attr_info.add * (oper.level - 1)) + attr_list[checker].attrValue
                                flag = false
                                break
                            }
                        }

                        if (flag) {
                            let info = {
                                attrType: attr_info.type,
                                attrValue: base_attr_info.add + (attr_info.add * (oper.level - 1)),
                            }
                            attr_list.push(info)
                        }
                    }
                }
            }
        }

        return attr_list
    }

    public GetResolveItems(id: number, level: number) {
        let cfg = this.GetCollectCfg(id)
        if (cfg != null) {
            let up_cfg = this.GetUpgradeCfg(cfg.type, level, cfg.color)

            let info = {
                id: CfgInscriptionData.other[0].up_item_id,
                num: up_cfg.itemback //+ (level - 1) * up_cfg.exp,
            }

            return [info]
        }
        let ts_cfg = this.GetSpCfgById(id, level)
        if (ts_cfg != null) {
            let up_cfg = this.GetUpgradeCfg(2, level, ts_cfg.color)

            let info = {
                id: CfgInscriptionData.other[0].up_item_id,
                num: up_cfg.itemback //+ (level - 1) * up_cfg.exp,
            }

            return [info]
        }
        return []
    }

    public GetResolveItemsByItem(item_id: number) {
        let item_num = Item.GetNum(item_id)
        if (item_id == CfgInscriptionData.other[0].exp_id_0) {
            return [{ id: CfgInscriptionData.other[0].up_item_id, num: item_num * CfgInscriptionData.other[0].exp_0 }]
        }
        else if (item_id == CfgInscriptionData.other[0].exp_id_1) {
            return [{ id: CfgInscriptionData.other[0].up_item_id, num: item_num * CfgInscriptionData.other[0].exp_1 }]
        }
        else if (item_id == CfgInscriptionData.other[0].exp_id_2) {
            return [{ id: CfgInscriptionData.other[0].up_item_id, num: item_num * CfgInscriptionData.other[0].exp_2 }]
        }
        else if (item_id == CfgInscriptionData.other[0].exp_id_3) {
            return [{ id: CfgInscriptionData.other[0].up_item_id, num: item_num * CfgInscriptionData.other[0].exp_3 }]
        }
    }

    public GetResolveBackList(list: any) {

        let check_list = []
        let item_list = []
        let resolve_list = InscriptionData.Inst().GetResolveList()
        for (var index in list) {
            if (resolve_list[Number(list[index])].index >= 0) {
                check_list.push(resolve_list[Number(list[index])].index)
            }
            else {
                item_list.push(resolve_list[Number(list[index])].id)
            }
        }

        let total_back_list = []
        for (var index in check_list) {
            let oper = this.GetKnapsackItem(check_list[index])
            let back_list = this.GetResolveItems(oper.id, oper.level)

            for (var check in back_list) {
                let item_cfg = Item.GetConfig(back_list[check].id)
                let info = {
                    id: back_list[check].id,
                    num: back_list[check].num,
                    name: item_cfg.name,
                }
                let flag = true
                for (var checker in total_back_list) {
                    if (total_back_list[checker].id == info.id) {
                        total_back_list[checker].num = info.num + total_back_list[checker].num
                        flag = false
                        break
                    }
                }

                if (flag) {
                    total_back_list.push(info)
                }
            }
        }

        for (var index in item_list) {
            let item_id = item_list[index]
            let back_list = this.GetResolveItemsByItem(item_id)
            for (var check in back_list) {
                let item_cfg = Item.GetConfig(item_id)
                let info = {
                    id: back_list[check].id,
                    num: back_list[check].num,
                    name: item_cfg.name,
                }
                let flag = true
                for (var checker in total_back_list) {
                    if (total_back_list[checker].id == info.id) {
                        total_back_list[checker].num = info.num + total_back_list[checker].num
                        flag = false
                        break
                    }
                }

                if (flag) {
                    total_back_list.push(info)
                }
            }
        }

        return total_back_list
    }

    public GetTowerRedPoint() {
        if (!FunOpen.Inst().GetFunIsOpen(Mod.InscriptionTower.Main).is_open) {
            return 0
        }
        let info = InscriptionData.Inst().RuneInfo();
        let co_reward = InscriptionData.Inst().CfgTowerDayRewardIndex(info.pass_reward_index);
        let can_get = info.tower_level >= co_reward.level_clear
        return can_get || (info.tower_level > 0 && 0 == info.daily_reward) || (1 == this.GetAdRed()) ? 1 : 0
    }

    public GetKnapsackItem(index: number) {
        for (var check in this.rune_info.rune_knapsack_list) {
            if (this.rune_info.rune_knapsack_list[check].index == index) {
                return this.rune_info.rune_knapsack_list[check]
            }
        }

        return {
            index: index,
            id: 0,
            level: 0,
        }
    }

    public GetMaxColor() {
        let total_max = 1
        for (var index in this.rune_info.rune_wear_list) {
            let p_index = this.rune_info.rune_wear_list[index]
            if (p_index > -1) {
                let oper = this.GetKnapsackItem(p_index)
                let collect_cfg = this.GetCollectCfg(oper.id)
                let ts_cfg = this.GetSpCfgById(oper.id, oper.level)
                if (ts_cfg == null && collect_cfg != null && collect_cfg.color > total_max) {
                    total_max = collect_cfg.color
                }

                if (ts_cfg != null && ts_cfg.color > total_max) {
                    total_max = ts_cfg.color
                }

            }
        }

        return total_max
    }

    public GetSkillCfgForTs(skill_id: number, skill_level: number) {
        for (var index in CfgPassiveSkillData.passive_cfg) {
            if (CfgPassiveSkillData.passive_cfg[index].skill_level == skill_level &&
                CfgPassiveSkillData.passive_cfg[index].skill_id == skill_id) {
                return CfgPassiveSkillData.passive_cfg[index]
            }
        }

        return null
    }

    /////////////////////////铭文成就///////////////////////////////
    public SetInscriptionChengJiuInfo(data: PB_SCRaRuneTowerFundInfo) {
        this.flush_info.chengjiu_info = data;
    }

    public GetChengJiuRewardData(phase: number) {
        let cfg = CfgInscriptionChengJiuData.gift_configure.filter(cfg => {
            return cfg.phase == phase;
        });
        cfg.sort((a: any, b: any) => {
            let sortNumber = 0
            let a_sort = this.GetChengJiuPhaseBuy(a.phase) && this.GetChengJiuCommonGet(a.seq) &&
                this.GetChengJiuHigherGet(a.seq) ? a.seq : 1000 - a.seq;
            let b_sort = this.GetChengJiuPhaseBuy(b.phase) && this.GetChengJiuCommonGet(b.seq) &&
                this.GetChengJiuHigherGet(b.seq) ? b.seq : 1000 - b.seq;
            if (a_sort < b_sort) {
                sortNumber = 1;
            }
            if (a_sort > b_sort) {
                sortNumber = -1;
            }
            return sortNumber
        });
        return cfg
    }

    public GetChengJiuCommonGet(seq: number) {
        let common_flag = DataHelper.ToBinary(this.flush_info.chengjiu_info.commonFetchFlag);
        return common_flag[seq] == 1;
    }
    public GetChengJiuHigherGet(seq: number) {
        let higher_flag = DataHelper.ToBinary(this.flush_info.chengjiu_info.seniorFetchFlag);
        return higher_flag[seq] == 1;
    }
    public GetChengJiuPhaseBuy(phase: number) {
        let phase_flag = DataHelper.ToBinary(this.flush_info.chengjiu_info.phaseBuyFlag);
        return phase_flag[phase] == 1;
    }

    public GetChengJiuCost(phase: number) {
        return CfgInscriptionChengJiuData.phase_configure.filter(cfg => {
            return cfg.phase == phase;
        });
    }

    public GetInscriptionChengJiuIsOpen() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.InscripeChengJiu)) {
            return false
        }
        let reward_data = this.GetChengJiuRewardData(this.chengjiu_phase)
        if (this.GetPassLevel() >= reward_data[reward_data.length - 1].num && this.GetChengJiuPhaseBuy(this.chengjiu_phase)) {
            for (let i = 0; i < reward_data.length; i++) {
                if (!this.GetChengJiuHigherGet(reward_data[i].seq) || !this.GetChengJiuCommonGet(reward_data[i].seq)) {
                    return true
                }
            }
        } else {
            return true
        }
        return true
    }

    public GetPassLevel() {
        return this.rune_info.tower_level
    }

    public GetRewardPreviewShowData(seq: number) {
        return CfgInscriptionChengJiuData.item_reward.filter(cfg => {
            return cfg.sort_seq == seq;
        });
    }

    public ClearTurntableRewards() {
        this.turntable_rewards = []
        this.turntable_drawing = true
    }

    public TurntableRewardsShow() {
        ViewManager.Inst().OpenView(CommonRewardView, {
            reward_data: this.turntable_rewards, call_back: () => {
                this.turntable_drawing = false
            },
            get_type: this.get_type
        })
    }
    get_type = -1
    public PutTurntableRewards(item_list: any, get_type: number) {
        this.get_type = get_type
        if (!this.turntable_drawing) {
            this.ClearTurntableRewards()
            this.AdAutoDraw1();
            if (ViewManager.Inst().IsOpen(InscriptionTurntableAdView)) {
                ViewManager.Inst().CloseView(InscriptionTurntableAdView);
            }
        }
        for (let i = 0; i < item_list.length; i++) {
            this.turntable_rewards.push(item_list[i]);
        }
    }

    public AdAutoDraw1() {
        this.flush_info.ad_auto_draw1 = !this.flush_info.ad_auto_draw1
    }

    public GetChengJiuAllRed() {
        let red = 0
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.InscripeChengJiu) || !this.GetInscriptionChengJiuIsOpen()) {
            return 0
        }
        let reward_data = this.GetChengJiuRewardData(this.chengjiu_phase)
        for (let i = 0; i < reward_data.length; i++) {
            if (reward_data[i].num <= this.GetPassLevel()) {
                if (this.GetChengJiuPhaseBuy(reward_data[i].phase)) {
                    if (!this.GetChengJiuHigherGet(reward_data[i].seq) || !this.GetChengJiuCommonGet(reward_data[i].seq)) {
                        red = red + 1
                    }
                } else {
                    if (!this.GetChengJiuCommonGet(reward_data[i].seq)) {
                        red = red + 1
                    }
                }
            }
        }
        // LogError("red = " + red)
        return red > 0 ? 1 : 0
    }

    public FlushCoreCrisis() {
        this.flush_info.flushneed = this.flush_info.flushneed + 1
    }

    public FlushItemChange() {
        this.flush_info.flushneed = this.flush_info.flushneed + 1
    }

    public FlushAdFlush() {
        this.flush_info.flushneed = this.flush_info.flushneed + 1
    }
}
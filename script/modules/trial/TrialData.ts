import { CfgGuMoChengJiuData } from "config/CfgGuMoChengJiu";
import { CfgShiLianGuMoData } from "config/CfgGuMoPagoda";
import { CfgShiLianPagodaData } from "config/CfgShiLianPagoda";
import { bit } from "core/net/bit";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { ITEM_BIG_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TrialConfig } from "./TrialConfig";

export class TrialResultData {
    @smartdata
    TrialInfo: PB_SCShiLianPagodaInfo = new PB_SCShiLianPagodaInfo();

    @smartdata
    GuMoListInfo: PB_SCGuMoPagodaListInfo = new PB_SCGuMoPagodaListInfo();

    GuMoLayerInfo: PB_SCGuMoPagodaLayerInfo = new PB_SCGuMoPagodaLayerInfo();

    @smartdata
    GuMoLayerFlush: boolean = false;

    @smartdata
    TrialChengJiuInfo: PB_SCRaGuMoTowerFundInfo = new PB_SCRaGuMoTowerFundInfo();
}

export class TrialData extends DataBase {

    public ResultData: TrialResultData;
    public GuMoViewInfo = { layerSel: 1, levelSel: 1 }
    public FinishStarFunc: any;
    public AllStarNum: number;
    public ChengJiuPhase = 1

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(TrialResultData);
    }

    public SetShiLianPagodaInfo(protocol: PB_SCShiLianPagodaInfo) {
        this.ResultData.TrialInfo = protocol
    }

    public GetTrialInfoPassLevel(): number {
        return this.ResultData.TrialInfo.passLevel;
    }

    public GetTrialInfoCurLevel(): number {
        let pass_level = this.ResultData.TrialInfo.passLevel;
        return CfgShiLianPagodaData.clearance.length == pass_level ? pass_level : pass_level + 1
    }

    public GetTrialInfoSeasonEndTime(): number {
        return this.ResultData.TrialInfo.seasonEndTime;
    }

    public GetTrialInfoUseItem() {
        return this.ResultData.TrialInfo.useItem;
    }

    public GetTrialInfoBestLevel(): number {
        return this.ResultData.TrialInfo.bestLeve;
    }

    public GetTrialInfoRandomId() {
        return this.ResultData.TrialInfo.randomId;
    }

    public GetTrialBagList() {
        let items = BagData.Inst().getItemMap(ITEM_BIG_TYPE.EQUIP_SHILIAN)
        let use_item = this.GetTrialInfoUseItem()
        let list: any[] = []
        for (let [key, value] of items) {
            if (value > 0 && -1 == use_item.indexOf(key)) {
                list.push({ itemId: key, num: value });
            }
        }
        for (let i = 1; i <= (this.CfgShiLianOtherBagMax() - items.size); i++) {
            list.push({ itemId: 0 })
        }
        return list
    }

    public GetTrialInfoUseItemShow() {
        let use_item = this.GetTrialInfoUseItem();
        let list: any[] = []
        for (let i = 0; i < TrialConfig.TRIAL_SPOIL_NUM_MAX; i++) {
            let itemId = use_item[i]
            list.push({ itemId: itemId, num: itemId > 0 ? BagData.Inst().getItemNum(itemId) : 0 })
        }
        return list;
    }

    public GetTrialInfoRandomIdShow() {
        let randomId = this.GetTrialInfoRandomId();
        let list: any[] = []
        for (let i = 0; i < randomId.length; i++) {
            let itemId = randomId[i]
            list.push({ itemId: itemId, num: 1 })
        }
        return list;
    }

    public GetTrialLockEnough() {
        let is_succ = false
        let use_item = this.GetTrialInfoUseItem();
        let lock_index = use_item.indexOf(-1)
        if (lock_index > 0) {
            let co = this.CfgShiLianOpen(lock_index + 1)
            let have_num = BagData.Inst().getItemNum(co.open_item_id)
            is_succ = have_num >= co.open_item_num
            if (!is_succ) {
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Trial.TrialTower.LockTips, co.open_item_num, Item.GetName(co.open_item_id)))
            }
        }
        return is_succ;
    }


    public CfgShiLianOtherShiLianCoinId(): number {
        return CfgShiLianPagodaData.other[0].shilian_coin_id ?? 0;
    }

    public CfgShiLianOtherBagMax(): number {
        return CfgShiLianPagodaData.other[0].bag_max ?? 0;
    }

    public CfgShiLianClearance(level: number) {
        return CfgShiLianPagodaData.clearance.find(cfg => cfg.level == level);
    }

    public CfgShiLianPaiHangReward() {
        let cfg = CfgShiLianPagodaData.paihang_reward;
        return cfg ? cfg : []
    }

    public CfgShiLianOpen(seq: number) {
        return CfgShiLianPagodaData.open.find(cfg => {
            return cfg.seq == seq;
        });
    }



    public CfgGuMoLayerShowList() {
        return CfgShiLianGuMoData.layer.filter(cfg => {
            return cfg.layer_level == 1;
        });
    }

    public CfgGuMoLevelShowList(layer: number) {
        return CfgShiLianGuMoData.layer.filter(cfg => {
            return cfg.layer == layer;
        });
    }

    public CfgGuMoRewardShowList() {
        let list = []
        let length = CfgShiLianGuMoData.layer.length
        let count = 0
        for (let element of CfgShiLianGuMoData.layer) {
            if (1 == element.level || 10 == count || list[list.length - 1].element.day[0].num != element.day[0].num) {
                count = 0
                if (list[list.length - 1]) {
                    list[list.length - 1].end = element.level - 1
                }
                list.push({
                    element: element,
                    start: element.level,
                    end: length
                });
            }
            count++
        }
        return list
    }

    public SetGuMoPagodaListInfo(protocol: PB_SCGuMoPagodaListInfo) {
        this.ResultData.GuMoListInfo = protocol
    }

    public SetGuMoPagodaLayerInfo(protocol: PB_SCGuMoPagodaLayerInfo) {
        if (-1 == protocol.layer) {
            this.ResultData.GuMoLayerInfo = protocol
        } else {
            for (let i = protocol.layer - 1, index = 0; index < protocol.layerInfo.length; i++) {
                this.ResultData.GuMoLayerInfo.layerInfo[i] = protocol.layerInfo[index]
                index++;
            }
        }
        this.ResultData.GuMoLayerFlush = !this.ResultData.GuMoLayerFlush
        this.SetTrailAllStarNum()
    }

    public GetGuMoPagodaLayerInfo(layer: number) {
        return this.ResultData.GuMoLayerInfo.layerInfo[layer - 1]
    }

    public GetGuMoPagodaLayerStars(layer: number) {
        let info = this.ResultData.GuMoLayerInfo.layerInfo[layer - 1]
        let stars = 0
        if (info) {
            for (let i = 0; i < TrialConfig.GUMO_LAYER_STAR_MAX; i++) {
                if (bit.hasflag(info.starFlag, i)) {
                    stars++;
                }
            }
        }
        return stars
    }

    public GetGuMoPagodaLevelStars(layer: number, level: number) {
        let info = this.ResultData.GuMoLayerInfo.layerInfo[layer - 1]
        let stars = 0
        if (info) {
            let start = (level - 1) * TrialConfig.GUMO_LEVEL_STAR_MAX
            for (let i = start; i < start + TrialConfig.GUMO_LEVEL_STAR_MAX; i++) {
                if (bit.hasflag(info.starFlag, i)) {
                    stars++;
                }
            }
        }
        return stars
    }

    public GetGuMoPagodaLevelConditionPass(layer: number, level: number, condition_type: number) {
        let info = this.ResultData.GuMoLayerInfo.layerInfo[layer - 1]
        let is_pass = false
        if (info) {
            let start = (level - 1) * TrialConfig.GUMO_LEVEL_STAR_MAX
            is_pass = bit.hasflag(info.starFlag, start + condition_type - 1)
        }
        return is_pass
    }

    public GetGuMoPagodaRewardGet(stars_num: number, layer: number = TrialData.Inst().GuMoViewInfo.layerSel) {
        let info = this.ResultData.GuMoLayerInfo.layerInfo[layer - 1]
        let stars = this.GetGuMoPagodaLayerStars(layer)
        let is_get = info ? bit.hasflag(info.boxFlag, stars_num / 5 - 1) : false
        let can_get = stars >= stars_num
        return { is_get, can_get }
    }

    public GetGuMoPagodaSel() {
        let layer = this.ResultData.GuMoLayerInfo.layerInfo.length
        let level = TrialConfig.GUMO_LEVEL_MAX
        if (this.GetGuMoPagodaLevelConditionPass(layer, TrialConfig.GUMO_LEVEL_MAX, 1)) {
            layer = layer + 1
            level = 1
        } else {
            for (let i = TrialConfig.GUMO_LEVEL_MAX; i >= 1; i--) {
                if (!this.GetGuMoPagodaLevelConditionPass(layer, i, 1)) {
                    level = i
                }
            }
        }
        layer = Math.min(layer, CfgShiLianGuMoData.layer.length / TrialConfig.GUMO_LEVEL_MAX)
        return { layer, level }
    }

    public CfgGuMoLevelShowInfo(layer: number, level: number) {
        return CfgShiLianGuMoData.layer.find(cfg => {
            return cfg.layer == layer && cfg.layer_level == level;
        });
    }

    public CfgGuMoLevelShowLevel(level: number) {
        return CfgShiLianGuMoData.layer.find(cfg => {
            return cfg.level == level;
        });
    }

    public CfgGuMoStarShowConditions(stars: number) {
        return CfgShiLianGuMoData.stars.filter(cfg => {
            return cfg.seq == stars;
        });
    }
    public CfgGuMoStarShowRewards(layer: number) {
        return CfgShiLianGuMoData.stars_reward.filter(cfg => {
            return cfg.layer == layer;
        });
    }

    public GetGuMoRedPoint() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Dungeon.GuMo));
        if (!open_t.is_open) {
            return 0
        }
        let listInfo = this.ResultData.GuMoListInfo
        if (listInfo && 0 == listInfo.dayReward && listInfo.lastdayLevel > 0) {
            return 1
        }
        let layer_list = this.CfgGuMoLayerShowList()
        for (let i = 0; i < layer_list.length; i++) {
            let layer = layer_list[i]
            for (let i = 1; i <= 3; i++) {
                let info = TrialData.Inst().GetGuMoPagodaRewardGet(i * 5, layer.layer);
                if (info.can_get && !info.is_get) {
                    return 1
                }
            }
        }
        return 0
    }

    public GetDayRewardShow() {
        let level = this.ResultData.GuMoListInfo.lastdayLevel
        let succ = level > 0
        let rewards
        if (succ) {
            let co = this.CfgGuMoLevelShowLevel(level)
            rewards = co ? co.day : []
        }
        return {
            succ, rewards
        }
    }

    ///////////////////锢魔之塔成就奖励
    public SetGuMoTowerFundInfo(data: PB_SCRaGuMoTowerFundInfo) {
        // LogError("锢魔之塔 3026 ",data);
        this.ResultData.TrialChengJiuInfo = data;
    }

    public GetTrailChengJiuRewardData(phase: number) {
        let cfg = CfgGuMoChengJiuData.gift_configure.filter(cfg => {
            return cfg.phase == phase;
        });
        cfg.sort((a: any, b: any) => {
            let sortNumber = 0
            let a_sort = this.GetTrailChengJiuPhaseBuy(a.phase) && this.GetTrailChengJiuCommonGet(a.reward_seq) &&
                this.GetTrailChengJiuHigherGet(a.reward_seq) ? a.reward_seq : 1000 - a.reward_seq;
            let b_sort = this.GetTrailChengJiuPhaseBuy(b.phase) && this.GetTrailChengJiuCommonGet(b.reward_seq) &&
                this.GetTrailChengJiuHigherGet(b.reward_seq) ? b.reward_seq : 1000 - b.reward_seq;
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

    public GetTrailChengJiuCost(phase: number) {
        return CfgGuMoChengJiuData.phase_configure.filter(cfg => {
            return cfg.phase == phase;
        });
    }

    public GetTrailChengJiuCommonGet(reward_seq: number) {
        let common_flag = DataHelper.ToBinary(this.ResultData.TrialChengJiuInfo.commonFetchFlag);
        return common_flag[reward_seq] == 1;
    }
    public GetTrailChengJiuHigherGet(reward_seq: number) {
        let higher_flag = DataHelper.ToBinary(this.ResultData.TrialChengJiuInfo.seniorFetchFlag);
        return higher_flag[reward_seq] == 1;
    }
    public GetTrailChengJiuPhaseBuy(phase: number) {
        let phase_flag = DataHelper.ToBinary(this.ResultData.TrialChengJiuInfo.phaseBuyFlag);
        return phase_flag[phase] == 1;
    }

    public SetTrailAllStarNum() {
        let num = 0
        let layer_data = this.CfgGuMoLayerShowList()
        for (let i = 1; i <= layer_data.length; i++) {
            num = num + this.GetGuMoPagodaLayerStars(i);
        }
        this.AllStarNum = num;
    }

    public GetTrailAllStarNum() {
        return this.AllStarNum;
    }

    public GetTrailChengJiuAllRed() {
        let red = 0
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.GuMoChengJiu) || !this.GetTrailChengJiuIsOpen()) {
            return 0
        }
        let reward_data = this.GetTrailChengJiuRewardData(this.ChengJiuPhase)
        for (let i = 0; i < reward_data.length; i++) {
            if (reward_data[i].star_num <= this.AllStarNum) {
                if (this.GetTrailChengJiuPhaseBuy(reward_data[i].phase)) {
                    if (!this.GetTrailChengJiuHigherGet(reward_data[i].reward_seq) || !this.GetTrailChengJiuCommonGet(reward_data[i].reward_seq)) {
                        red = red + 1
                    }
                } else {
                    if (!this.GetTrailChengJiuCommonGet(reward_data[i].reward_seq)) {
                        red = red + 1
                    }
                }
            }
        }
        return red > 0 ? 1 : 0
    }

    public GetTrailChengJiuIsOpen() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.GuMoChengJiu)) {
            return false
        }
        let reward_data = this.GetTrailChengJiuRewardData(this.ChengJiuPhase)
        if (this.AllStarNum >= reward_data[reward_data.length - 1].star_num && this.GetTrailChengJiuPhaseBuy(this.ChengJiuPhase)) {
            for (let i = 0; i < reward_data.length; i++) {
                if (!this.GetTrailChengJiuHigherGet(reward_data[i].reward_seq) || !this.GetTrailChengJiuCommonGet(reward_data[i].reward_seq)) {
                    return true
                }
            }
        } else {
            return true
        }
        return false
    }

    public GetRewardPreviewShowData(seq: number) {
        return CfgGuMoChengJiuData.item_reward.filter(cfg => {
            return cfg.sort_seq == seq;
        });
    }

}
import { Vec2 } from "cc";
import { GetCfgValue } from "config/CfgCommon";
import { CfgOrbData } from "config/CfgOrb";
import { bit } from "core/net/bit";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { MonthlyCardData } from "modules/MonthlyCard/MonthlyCardCtrl";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { QualityColorStr } from "modules/common/ColorEnum";
import { AdType, BATTLE_ATTR, ItemColor } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { ConstValue } from "modules/common/ConstValue";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { DataHelper } from "../../helpers/DataHelper";
import { FishConfig } from "./FishConfig";
import { FishCtrl } from "./FishCtrl";
import { FishGetMonoView } from "./FishGetMonoView";
import { FishGetView } from "./FishGetView";

export class FishResultData {
    @smartdata
    WaBaoInfo: PB_SCWaBaoInfo = new PB_SCWaBaoInfo();

    @smartdata
    WaBaoMapInfo: PB_SCWaBaoMapInfo = new PB_SCWaBaoMapInfo();

    @smartdata
    WaBaoItemInfo: PB_SCWaBaoItemInfo = new PB_SCWaBaoItemInfo();

    @smartdata
    WaBaoIntegrityInfo: Map<number, IPB_WaBaoIntegrityNode> = new Map();

    @smartdata
    WaBaoCollectionListInfo: Map<number, Map<number, IPB_WaBaoCollectionNode>> = new Map();

    @smartdata
    WaBaoToolInfo: PB_SCWaBaoToolInfo = new PB_SCWaBaoToolInfo();

    @smartdata
    WaBaoTaskInfo: PB_SCWaBaoTaskInfo = new PB_SCWaBaoTaskInfo();

    @smartdata
    WaBaoSetingInfo: PB_SCWaBaoSetingInfo = new PB_SCWaBaoInfo();

    @smartdata
    WaBaoCollectionBookInfo: PB_SCWaBaoCollectionBookInfo = new PB_SCWaBaoCollectionBookInfo();

    @smartdata
    WaBaoBookListInfo: PB_SCWaBaoBookListInfo = new PB_SCWaBaoBookListInfo();

    @smartdata
    WaBaoState = 0;

    @smartdata
    WaBaoEffect = { color: 0, itemId: 0 };

    @smartdata
    WaBaoSellEffect = { itemId: 0 };

    @smartdata
    WaBaoCollectionFlush: boolean = false;

    @smartdata
    WaBaoIntegrityFlush: boolean = false;

    @smartdata
    WaBaoGetAnim: { itemData: IPB_WaBaoItemData, pos: Vec2, cbe?: Function, cbs?: Function } = { itemData: undefined, pos: undefined, cbe: undefined, cbs: undefined };
}

export class FishData extends DataBase {
    public ResultData: FishResultData;
    public autoWaBao: boolean = false;
    private timer_handle: any = null;
    public FishViewInfo = { itemSeq: 0 }
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(FishResultData);
    }

    public SetWaBaoInfo(protocol: PB_SCWaBaoInfo) {
        this.ResultData.WaBaoInfo = protocol
    }

    public SetWaBaoMapInfo(protocol: PB_SCWaBaoMapInfo) {
        this.ResultData.WaBaoMapInfo = protocol
    }

    public SetWaBaoItemInfo(protocol: PB_SCWaBaoItemInfo) {
        this.ResultData.WaBaoItemInfo = protocol
        if (undefined != GetCfgValue(Language.Fish.WaBaoFailReason, protocol.result)) {
            PublicPopupCtrl.Inst().Center(GetCfgValue(Language.Fish.WaBaoFailReason, protocol.result))
            this.IsAutoWabao()
            EventCtrl.Inst().emit(CommonEvent.SPINE_ANI, ConstValue.ANI_PARAM.PLAY)
            return
        }
        let item_id = FishData.Inst().ResultData.WaBaoItemInfo.itemData.itemId
        if (item_id > 0) {
            if (this.IsAutoSell(item_id, FishData.Inst().ResultData.WaBaoItemInfo.result)) {
                this.ResultData.WaBaoEffect = { itemId: item_id, color: Item.GetColor(item_id) }
                FishCtrl.Inst().SendWaBaoReqSell()
                this.WaBaoStart()
            } else {
                this.ResultData.WaBaoEffect = { itemId: item_id, color: Item.GetColor(item_id) }
                if (4 == Item.GetWaBaoType(item_id)) {
                    ViewManager.Inst().OpenView(FishGetMonoView)
                } else {
                    if (!ViewManager.Inst().IsOpen(FishGetView)) {
                        ViewManager.Inst().OpenView(FishGetView)
                    }
                }
            }
        }
    }

    public GetAdRed() {
        let data_ad = RoleData.Inst().AdInfo
        let box_ad = data_ad.get(AdType.fish_speed_up)

        if (!box_ad) {
            return 1;
        }
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.fish_speed_up)
        if (+co.ad_param - box_ad.todayCount <= 0) {
            return 0;
        }
        if (box_ad.nextFetchTime > 0)
            return 0;
        return 1;
    }

    public SetWaBaoIntegrityInfo(protocol: PB_SCWaBaoIntegrityInfo) {
        if (1 == protocol.isLogin) {
            this.ResultData.WaBaoIntegrityInfo = new Map();
        }
        for (let i = 0; i < protocol.dataList.length; i++) {
            let info = protocol.dataList[i]
            this.ResultData.WaBaoIntegrityInfo.set(info.itemId, info);
        }
        this.ResultData.WaBaoIntegrityFlush = !this.ResultData.WaBaoIntegrityFlush
    }

    public SetWaBaoCollectionListInfo(protocol: PB_SCWaBaoCollectionListInfo) {
        // this.ResultData.WaBaoCollectionListInfo = protocol
        if (1 == protocol.isLogin) {
            this.ResultData.WaBaoCollectionListInfo = new Map();
        }
        for (let i = 0; i < protocol.dataList.length; i++) {
            let info = protocol.dataList[i]
            this.ResultData.WaBaoCollectionListInfo.get(info.itemType);
            let map = this.ResultData.WaBaoCollectionListInfo.get(info.itemType);
            map = map ? map : new Map();
            map.set(info.index, info);
            this.ResultData.WaBaoCollectionListInfo.set(info.itemType, map);
        }
        this.ResultData.WaBaoCollectionFlush = !this.ResultData.WaBaoCollectionFlush
    }

    public SetWaBaoToolInfo(protocol: PB_SCWaBaoToolInfo) {
        this.ResultData.WaBaoToolInfo = protocol
    }

    public SetWaBaoTaskInfo(protocol: PB_SCWaBaoTaskInfo) {
        this.ResultData.WaBaoTaskInfo = protocol
    }

    public SetWaBaoSetingInfo(protocol: PB_SCWaBaoSetingInfo) {
        this.ResultData.WaBaoSetingInfo = protocol
    }

    public SetWaBaoCollectionBookInfo(protocol: PB_SCWaBaoCollectionBookInfo) {
        this.ResultData.WaBaoCollectionBookInfo = protocol
    }

    public SetWaBaoBookListInfo(protocol: PB_SCWaBaoBookListInfo) {
        this.ResultData.WaBaoBookListInfo = protocol
    }

    public GetWaBaoInfoTiLiTime() {
        return this.ResultData.WaBaoInfo.tiLiItme
    }

    public GetWaBaoInfoCollectionLevel() {
        return this.ResultData.WaBaoInfo.collectionLevel
    }

    public GetWaBaoMapInfoCurMap() {
        return this.ResultData.WaBaoMapInfo.curMap
    }


    public GetWaBaoMapInfoCurMapResource(orb_map?: number) {
        let co = this.CfgMap(orb_map ?? this.ResultData.WaBaoMapInfo.curMap)
        return co ? co.resources : 1
    }

    public GetWaBaoMapInfoUnlockedMap() {
        return this.ResultData.WaBaoMapInfo.unlockedMap
    }

    public GetWaBaoMapInfoMapConditionNum(index: number) {
        return this.ResultData.WaBaoMapInfo.mapConditionNum[index] ?? 0;
    }

    public GetWaBaoCollectionListInfoItem(itemType: number, index: number) {
        let info = this.ResultData.WaBaoCollectionListInfo
        if (info.has(itemType)) {
            return info.get(itemType).get(index)
        }
    }

    public GetWaBaoTaskListShow() {
        let list = []
        if (this.ResultData.WaBaoTaskInfo) {
            let taskFlag = this.ResultData.WaBaoTaskInfo.taskFlag
            let taskList = this.ResultData.WaBaoTaskInfo.taskList
            let taskTypeNum = this.ResultData.WaBaoTaskInfo.taskTypeNum
            for (let i = 0; i < taskList.length; i++) {
                let seq = taskList[i]
                let co = this.CfgTask(seq)
                if (undefined != co) {
                    list.push({
                        index: i,
                        flag: 1 == bit.hasflag(taskFlag, i),
                        progress: taskTypeNum[i],
                        co: co,
                    })
                }
            }
        }
        return list;
    }

    public GetWaBaoSetingInfo() {
        return this.ResultData.WaBaoSetingInfo.boxSet
    }

    public GetWaBaoCollectNums(orb_map: number) {
        let list = this.CfgPictureInfo(orb_map)
        let nums = 0
        for (let i = 0; i < list.length; i++) {
            // let strs = list[i].handbook_treasure.toString().split("|")
            let is_avtive = orb_map > 0 ? (this.GetWaBaoCollectionBookActived(list[i].orb_map, list[i].handbook_type)) : (0 != FishData.Inst().GetWaBaoCollectionBookInfoItem(list[i].handbook_type));
            // for (let j = 0; j < strs.length; j++) {
            //     let is_gray = orb_map > 0 ? (undefined == FishData.Inst().GetWaBaoIntegrityInfoItem(+strs[j])) : (0 == FishData.Inst().GetWaBaoCollectionBookInfoItem(list[i].handbook_type));
            //     has_gray = has_gray || is_gray
            // }
            if (is_avtive) {
                nums = nums + 1;
            }
        }
        return nums
    }

    public GetWaBaoToolsShow() {
        let tool_level = this.ResultData.WaBaoToolInfo.toolLevel
        let list = []
        for (let i = 0; i < tool_level.length; i++) {
            list.push(this.CfgUpgradInfo(i, tool_level[i]));
        }
        return list
    }

    public GetWaBaoIntegrityInfoItem(itemId: number) {
        return this.ResultData.WaBaoIntegrityInfo.get(itemId);
    }


    public GetWaBaoCollectionBookInfoItem(type: number) {
        return this.ResultData.WaBaoCollectionBookInfo.level[type];
    }

    public GetWaBaoCollectionBookActived(orb_map: number, handbook_type: number) {
        return 1 == bit.hasflag(this.ResultData.WaBaoBookListInfo.activateFlag[orb_map], handbook_type)
    }

    public CfgOtherTiLiItem() {
        return CfgOrbData.other[0].tili_item ?? 0;
    }

    public CfgOtherShuaXinItem() {
        return CfgOrbData.other[0].shuaxin_item ?? 0;
    }

    public CfgOtherUpTimeItem() {
        return CfgOrbData.other[0].up_time_item ?? 0;
    }

    public CfgOtherBoxUpItem() {
        return CfgOrbData.other[0].box_up_item ?? 0;
    }

    public CfgOtherUpItemId() {
        return CfgOrbData.other[0].up_item_id ?? 0;
    }

    public CfgMapNum() {
        return CfgOrbData.map_cfg.length;
    }

    public CfgMap(map: number) {
        return CfgOrbData.map_cfg.find(cfg => cfg.orb_map == map);
    }

    public CfgMapConditions(map: number) {
        return CfgOrbData.map_unlock.filter(cfg => cfg.orb_map == map);
    }

    public CfgTask(seq: number) {
        return CfgOrbData.task.find(cfg => cfg.seq == seq);
    }

    public CfgPictureTypeShow() {
        return CfgOrbData.picture.filter(cfg => cfg.handbook_type == 1 && cfg.orb_map <= 3);
    }

    public CfgPictureInfo(orb_map: number) {
        return CfgOrbData.picture.filter(cfg => cfg.orb_map == orb_map);
    }

    public CfgGatherInfo(level: number) {
        return CfgOrbData.gather.find(cfg => cfg.level == level);
    }

    public CfgGatherInfoNext(type: number, num: number) {
        return CfgOrbData.gather.find(cfg => GetCfgValue(cfg, "num_" + type) == num);
    }

    public CfgUpgradInfo(seq: number, level: number) {
        return CfgOrbData.upgrade.find(cfg => cfg.item_seq == seq && cfg.item_level == level);
    }

    public CfgAdvanceInfo(seq: number, advance: number) {
        return CfgOrbData.advance.find(cfg => cfg.item_seq == seq && cfg.advance == advance);
    }

    public CfgCollectibleHandbookInfo(handbook_type: number, level: number) {
        return CfgOrbData.collectible_handbook.find(cfg => cfg.handbook_type == handbook_type && cfg.level == level);
    }

    public CfgAttTxt(att_type: number) {
        return CfgOrbData.att_txt.find(cfg => cfg.att_type == att_type);
    }

    public GetAutoQualityDesc() {
        let list = [];
        for (let i = ItemColor.Green; i <= ItemColor.Pink; i++) {
            list.push(GetCfgValue(Language.Fish.FishSetting.QuaDesc, i - 2))
        }
        return list;
    }

    public GetAutoQualityColor() {
        let list: string[] = [];
        for (let i = ItemColor.Green; i <= ItemColor.Pink; i++) {
            list.push(QualityColorStr[i]);
        }
        return list;
    }

    public GetAutoQualityParam() {
        let list: string[] = [];
        for (let i = ItemColor.Green; i <= ItemColor.Pink; i++) {
            list.push(i.toString());
        }
        return list;
    }

    public GetFishUpProListData(curcfg: any) {
        let list: { is_buy: number, width: number }[] = [];
        const gap = 5;
        const total = 245;
        let num = curcfg.up_num;
        let width = (total - (num - 1) * gap) / num;
        for (let i = 0; i < curcfg.up_num; i++) {
            let is_buy = this.ResultData.WaBaoInfo.collectionBuyTimes - 1 >= i ? 1 : 0;
            list.push({ is_buy: is_buy, width: width })
        }
        return list;
    }

    public GetFishBoxUpPro(curcfg: any) {
        let max = curcfg.up_num * 96;
        let val = Math.max(this.ResultData.WaBaoInfo.collectionBuyTimes * 96, 0);
        return { max: max, val: val };
    }

    public GetFishBoxUpReward(curcfg: any) {
        let list = [];
        let flag = DataHelper.ToBinary(this.ResultData.WaBaoInfo.collectionLevelFetchFlag);
        for (let i = 0; i < curcfg.reward.length; i++) {
            list.push({
                item: curcfg.reward[i],
                is_fetch: flag[i + 1],
                can_fetch: this.ResultData.WaBaoInfo.collectionBuyTimes >= i + 1 && flag[i + 1] != 1,
                seq: i + 1
            });
        }
        return list;
    }


    public GetEquipAttrListShow() {
        let tool_info = this.ResultData.WaBaoToolInfo
        let tool_level = tool_info.toolLevel
        let tool_grade = tool_info.toolGrade
        let list = []
        for (let i = 0; i < tool_level.length; i++) {
            let co_upgrade = this.CfgUpgradInfo(i, tool_level[i])
            let co_advance = this.CfgAdvanceInfo(i, tool_grade[i])
            let co_att = this.CfgAttTxt(co_upgrade.item_type)
            let attr = {
                attrType: co_upgrade.item_type + BATTLE_ATTR.FISH_ATTR_1,
                attrValue: (co_upgrade ? co_upgrade.item_att_num : 0) + (co_advance ? co_advance.item_att_num : 0),
                attrDesc: co_att ? co_att.att_txt : ""
            }
            list.push(attr);
            //let co_att = this.CfgAttTxt(co_upgrade.item_type)
            // list.push({
            //     attrType: co_upgrade.item_type + BATTLE_ATTR.FISH_ATTR_1,
            //     attrDesc: co_att ? co_att.att_txt : ""
            // })
        }
        return list
    }

    public GetCollectAttrListShow() {
        let list1 = new Map()
        let list2 = []
        function AddAttr(attr: any) {
            list1.set(attr.type, attr.add + (list1.has(attr.type) ? attr.add : 0))
        }
        CfgOrbData.picture.forEach(element => {
            let strs = element.handbook_treasure.toString().split("|")
            let has_gray = false
            for (let i = 0; i < strs.length; i++) {
                let itemId = + strs[i]
                let is_gray = element.orb_map > 0 ? (undefined == FishData.Inst().GetWaBaoIntegrityInfoItem(itemId)) : (0 == FishData.Inst().GetWaBaoCollectionBookInfoItem(element.handbook_type));
                has_gray = has_gray || is_gray
            }
            if (!has_gray) {
                for (let i = 0; i < element.jihuo_att.length; i++) {
                    AddAttr(element.jihuo_att[i])
                }
                if (0 == element.orb_map) {
                    let cur_level = FishData.Inst().GetWaBaoCollectionBookInfoItem(element.handbook_type)
                    let co_ch = FishData.Inst().CfgCollectibleHandbookInfo(element.handbook_type, cur_level > 0 ? cur_level : 1)
                    for (let i = 0; i < co_ch.up_att.length; i++) {
                        AddAttr(co_ch.up_att[i])
                    }
                }
            }
        });
        for (let [key, value] of list1) {
            list2.push({
                attrType: key,
                attrValue: value,
            });
        }
        return list2
    }


    public GetMapIsLock(map: number) {
        let co_map = FishData.Inst().CfgMap(map);
        let conditions = FishData.Inst().CfgMapConditions(co_map.condition_id);
        let can_unlock = true
        for (let i = 0; i < conditions.length; i++) {
            let condition_num = FishData.Inst().GetWaBaoMapInfoMapConditionNum(i)
            if (condition_num < conditions[i].param) {
                can_unlock = false
                break
            }
        }
        let is_lock = map > FishData.Inst().GetWaBaoMapInfoUnlockedMap();
        return { is_lock, can_unlock }
    }

    public WaBaoSellEffect(itemId: number) {
        this.ResultData.WaBaoSellEffect = { itemId: itemId };
    }

    public AutoWabao(auto_wabao: boolean) {
        this.autoWaBao = auto_wabao
        if (this.autoWaBao) {
            this.WaBaoStart()
        }
    }

    public IsAutoWabao() {
        if (this.autoWaBao) {
            this.WaBaoStart()
        }
    }

    public IsAutoSell(item_id: number, result: number) {
        if (!this.autoWaBao) {
            return false
        }
        let color = Item.GetColor(item_id)
        let wabao_type = Item.GetWaBaoType(item_id)
        if (4 == wabao_type && 6 == color) {
            return false
        } else {
            let info = FishData.Inst().GetWaBaoSetingInfo()
            return this.AutoSellEqality(color, info) && this.AutoSellNewBook(info.newBook, result) && this.AutoSellNewRecord(info.newRecord, result)
        }
    }

    public IsBuyMonthlyCard() {
        let info = MonthlyCardData.Inst().GetMonthlyCardInfo2(1)
        return info && info.endTimestamp > TimeCtrl.Inst().ServerTime;
    }

    public GetWaBaoAnimSpeed() {
        return this.IsBuyMonthlyCard() ? 2 : 1
    }


    public AutoSellEqality(color: number, info: IPB_WaBaoSet) {
        return (0 == info.eqalityMark) || color < info.eqality
    }

    public AutoSellNewBook(new_book: number, result: number) {
        return 0 == new_book || FishConfig.WaBaoResultType.yes_new_get != result
    }

    public AutoSellNewRecord(new_record: number, result: number) {
        return 0 == new_record || FishConfig.WaBaoResultType.yes_new_record != result
    }

    public WaBaoStart() {
        if (null == this.timer_handle) {
            this.timer_handle = Timer.Inst().AddRunTimer(() => {
                if (ViewManager.Inst().IsOpen(FishGetView) || ViewManager.Inst().IsOpen(FishGetMonoView)) {
                    return
                }
                this.ResultData.WaBaoState++;
                if (this.ResultData.WaBaoState > (this.IsBuyMonthlyCard() ? 2 : 3)) {
                    this.ResultData.WaBaoState = 0
                    FishCtrl.Inst().SendWaBaoReqWaBao()
                    // if(!this.autoWaBao){
                    Timer.Inst().CancelTimer(this.timer_handle)
                    this.timer_handle = null
                    // }
                }
            }, 1, -1, true)
        } else {
            this.autoWaBao = false
            PublicPopupCtrl.Inst().Center(Language.Fish.WaBaoingTips)
        }
    }

    public SetWabaoGetAnim(itemData: IPB_WaBaoItemData, pos: Vec2, cbe?: Function, cbs?: Function) {
        this.ResultData.WaBaoGetAnim = {
            itemData: itemData,
            pos: pos,
            cbe: cbe,
            cbs: cbs,
        }
    }

    public GetWabaoBoxMaxColor() {
        let info = this.ResultData.WaBaoCollectionListInfo
        let color = 1
        if (info) {
            for (let value of info.values()) {
                for (let value2 of value.values()) {
                    let item_color = Item.GetColor(value2.itemData.itemId)
                    color = item_color > color ? item_color : color

                }
            }
        }
        return color
    }


    public GetWabaoRedPoint() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Fish.View));
        if (!open_t.is_open) {
            return 0
        }
        return (1 == this.GetWabaoTaskRedPoint() || 1 == this.GetWabaoCollectUpRedPoint()) || 1 == this.GetWabaoToolUpRedPoint() || 1 == this.GetWabaoCollectionBookActiveRedPoint() || 1 == this.GetWabaoBoxUpRedPoint() || 1 == this.GetWabaoMapRedPoint() ? 1 : 0;
    }

    public GetWabaoTaskRedPoint() {
        let task_list = this.GetWaBaoTaskListShow()
        let rp = 0
        task_list.forEach(element => {
            if (!element.flag && element.progress >= element.co.param_1) {
                rp = 1
                return
            }
        });
        return rp
    }

    public GetWabaoCollectUpRedPoint() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Fish.View));
        if (!open_t.is_open) {
            return 0
        }
        let collections = FishData.Inst().CfgPictureInfo(0)
        let rp = 0
        collections.forEach(element => {
            let cur_level = FishData.Inst().GetWaBaoCollectionBookInfoItem(element.handbook_type)
            let co_ch = FishData.Inst().CfgCollectibleHandbookInfo(element.handbook_type, cur_level > 0 ? cur_level : 1)
            let have_num = BagData.Inst().getItemNum(co_ch.up_item_id);
            let is_enough = have_num >= co_ch.up_item_num
            let is_max = 0 == co_ch.up_item_id
            if (is_enough && !is_max) {
                rp = 1
                return
            }
        });
        return rp
    }

    public GetWabaoToolUpRedPoint() {
        let rp = 0
        let tool_level = this.ResultData.WaBaoToolInfo.toolLevel
        for (let i = 0; i < tool_level.length; i++) {
            if (this.GetWabaoToolUpRedPointByItemSeq(i)) {
                rp = 1
                break
            }
        }
        return rp
    }

    public GetWabaoToolUpRedPointByItemSeq(item_seq: number) {
        let rp = 0
        let tool_level = this.ResultData.WaBaoToolInfo.toolLevel
        let tool_grade = this.ResultData.WaBaoToolInfo.toolGrade
        let condition_num = this.ResultData.WaBaoToolInfo.conditionNum
        let info = FishData.Inst().CfgUpgradInfo(item_seq, tool_level[item_seq]);
        let info_advance = FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq])
        let can_up = tool_level[item_seq] >= info_advance.advance_need
        if ((info != undefined && info.up_item != undefined && !can_up && BagData.Inst().getItemNum(info.up_item[0].item_id) >= info.up_item[0].num) && (can_up && condition_num[item_seq] >= info_advance.param)) {
            rp = 1
        } else if (can_up && condition_num[item_seq] >= info_advance.param) {
            rp = 2
        } else if (info != undefined && info.up_item != undefined && !can_up && BagData.Inst().getItemNum(info.up_item[0].item_id) >= info.up_item[0].num) {
            rp = 3
        }

        return rp
    }

    public GetWabaoBoxUpRedPoint() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Fish.View));
        if (!open_t.is_open) {
            return 0
        }
        let rp = 0
        let info = FishData.Inst().ResultData.WaBaoInfo
        let gather_cur = FishData.Inst().CfgGatherInfo(info.collectionLevel)
        let gather_next = FishData.Inst().CfgGatherInfo(info.collectionLevel + 1)
        let is_max = undefined == gather_next
        let is_uping = TimeCtrl.Inst().ServerTime < info.collectionLevelUpTime
        if (!is_max && !is_uping) {
            let is_enough = BagData.Inst().getItemNum(FishData.Inst().CfgOtherBoxUpItem()) >= gather_cur.price
            if (info.collectionBuyTimes < gather_cur.up_num) {
                rp = is_enough ? 1 : 0
                if (is_enough) {
                    rp = 1
                } else {
                    let flag = DataHelper.ToBinary(this.ResultData.WaBaoInfo.collectionLevelFetchFlag);
                    for (let i = 0; i < gather_cur.reward.length; i++) {
                        let can_fetch = this.ResultData.WaBaoInfo.collectionBuyTimes >= i + 1 && flag[i + 1] != 1
                        if (can_fetch) {
                            rp = 1
                            break
                        }
                    }
                }
            } else {
                rp = 1
            }
        }
        return rp
    }

    public GetWabaoMapRedPoint() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Fish.View));
        if (!open_t.is_open) {
            return 0
        }
        for (let map of CfgOrbData.map_cfg) {
            let info = FishData.Inst().GetMapIsLock(map.orb_map)
            if (info.is_lock && info.can_unlock) {
                return 1
            }
        }
    }
    // //可突破红点
    // public GetWabaoToolGradeRedPointByItemSeq(item_seq: number) {
    //     let rp = 0
    //     let tool_level = this.ResultData.WaBaoToolInfo.toolLevel
    //     let tool_grade = this.ResultData.WaBaoToolInfo.toolGrade
    //     let condition_num = this.ResultData.WaBaoToolInfo.conditionNum
    //     let info_advance = FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq])
    //     let can_up = tool_level[item_seq] >= info_advance.advance_need
    //     if (can_up && condition_num[item_seq] >= info_advance.param) {
    //         rp = 1
    //         console.log("------突破-----");
    //     }

    //     return rp
    // }
    public GetWabaoCollectionBookActiveRedPoint(orb_map?: number) {
        let list = orb_map ? FishData.Inst().CfgPictureInfo(orb_map) : CfgOrbData.picture
        let rp = 0
        list.forEach(element => {
            if (1 == rp) {
                return
            }
            if (element.orb_map > 0) {
                let strs = element.handbook_treasure.toString().split("|")
                let is_active = FishData.Inst().GetWaBaoCollectionBookActived(element.orb_map, element.handbook_type);
                let has_gray = false;
                for (let i = 0; i < strs.length; i++) {
                    let itemId = + strs[i]
                    let is_gray = element.orb_map > 0 ? (undefined == FishData.Inst().GetWaBaoIntegrityInfoItem(itemId)) : (0 == FishData.Inst().GetWaBaoCollectionBookInfoItem(element.handbook_type));
                    has_gray = has_gray || is_gray
                }
                if (!has_gray && !is_active) {
                    rp = 1
                    return
                }
            }
        });
        return rp
    }
    /**
     * 根据类型获取相应描述
     * @param type 
     */
    public GetArrTipByType(type: number) {
        for (let i = 0; i < CfgOrbData.att_txt.length; i++) {
            if (CfgOrbData.att_txt[i].att_type == type) {
                return "注释：" + CfgOrbData.att_txt[i].att_txt;
            }
        }
        return null;
    }
}


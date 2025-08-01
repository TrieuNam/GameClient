import { CfgBoxColorAtt, CfgBoxData } from "config/CfgBox";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { ArenaData } from "modules/Arena/ArenaData";
import { BagEquipConpareView } from "modules/EquipBag/BagEquipConpareView";
import { EquipBagData } from "modules/EquipBag/EquipBagData";
import { FastData, FastUseView } from "modules/FastUse/FastUseView";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { QualityColorStr } from "modules/common/ColorEnum";
import { AdType, BATTLE_ATTR, IsPercent } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { AttrListDesc, AttrListName, Language } from "modules/common/Language";
import { CommonRewardView } from "modules/common_account/CommonRewardView";
import { MainView } from "modules/main/MainView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes, PublicPopupData } from "modules/public_popup/PublicPopupData";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { DataBase } from "../../data/DataBase";
import { CfgHelper } from "../../helpers/CfgHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { BoxCtrl, BoxReqType } from "./BoxCtrl";
import { BoxEquipView } from "./BoxEquipView";
import { BoxShiZhuangEffectView } from "./BoxShiZhuangEffectView";
import { BoxTrustView } from "./BoxTrustView";

export class BoxResultData {
    @smartdata
    box_level_data: PB_SCBoxInfo;

    @smartdata
    equip_info: PB_SCBoxEquipInfo;

    @smartdata
    box_setting_info: PB_SCBoxSetingInfo;

    @smartdata
    box_status: BOX_STATUS = BOX_STATUS.Init;

    @smartdata
    auto_statu = AUTO_STATUS.OVER;

    @smartdata
    flush_ad: boolean;

    @smartdata
    flush_shizhuang: boolean;

}
export class SBoxFlushData {
    @smartdata
    sell_flag: boolean;

    @smartdata
    enchant_get: boolean;
}

export enum BOX_STATUS {
    UNCLICKABLE = 0,//不可点击 点击宝箱后 未得到下发协议 或未过cd
    OPENING = 1,//打开中 下发装备信息 播放特效
    OPENED = 2,//已打开 特效播完后
    CLOSEING = 3,//关闭中
    CLOSEED = 4,//已关闭
    Init = 5,//初始状态
    OPENANI = 6,//打开中，播放开箱动效
}

export enum AUTO_STATUS {
    START = 0,//开始
    STOP = 1,//暂停
    OVER = 2,//结束
}

let BOX_SHI_ZHUANG_EQUIP_TYPE = 999;
export enum BoxAutoCheckResult {
    INIT = 0,
    CHALLENGE_ITEM_MAX = 1,//竞技场挑战券满
    OVER = 2,//结束
}
export class BoxData extends DataBase {
    public box_result_data: BoxResultData;
    public FlushData: SBoxFlushData = null;
    public sell_info = { coin: 0, exp: 0 }
    private is_show_arean_item: boolean;//是否展示竞技场挑战券奖励弹窗
    private box_auto_cfg: { [seq: number]: { param_1: string[], desc: string[] } };
    private box_color_att_cfg: { [att_group: number]: CfgBoxColorAtt[] };
    private isCondition: boolean;
    public ShowEquipEff: boolean = false;
    private _wHanlder: { time: number } = undefined;
    public sell_tip = true;//出售装备提醒
    public sale_state = 0;//出售/分解
    public enchant_info: any
    constructor() {
        super();
        this.createSmartData();
        EventCtrl.Inst().on(CommonEvent.NET_CHECKED, () => {
            if (this.box_result_data.box_status == BOX_STATUS.UNCLICKABLE)
                this.SetBoxStatus(BOX_STATUS.CLOSEED);

        }, this, false)
    }

    protected onSwitch(): void {
        this.setAutoStatus(AUTO_STATUS.OVER)
    }

    private createSmartData() {
        let self = this;
        self.box_result_data = CreateSMD(BoxResultData);
        this.FlushData = CreateSMD(SBoxFlushData);
    }

    public GetboxResultData() {
        return this.box_result_data
    }
    public GetBoxInfo() {
        return this.box_result_data.box_level_data;
    }

    public GetBoxNumInfo() {
        let num = Item.GetNum(this.GetBoxId());
        return num;
    }

    public GetBoxSettingInfo() {
        return this.box_result_data.box_setting_info
    }

    public GetBoxEquipInfo() {
        return this.box_result_data.equip_info
    }
    public GetBoxStatus() {
        return this.box_result_data.box_status
    }

    public SetBoxStatus(status: BOX_STATUS) {
        this.box_result_data.box_status = status;
        this.OnBoxStatusChange();
    }

    public set ShowArenaItem(is_show: boolean) {
        this.is_show_arean_item = is_show;
    }

    public get ShowArenaItem() {
        return this.is_show_arean_item;
    }

    public setBoxEquip(data: PB_SCBoxEquipInfo) {
        let self = this;
        self.box_result_data.equip_info = data
        self.checkBoxEquip();
    }

    public setBoxLevel(data: PB_SCBoxInfo) {
        let max_arena = this.GetArenaMax();
        if (this.box_result_data.box_level_data && (this.box_result_data.box_level_data.arenaItemNum == max_arena - 1) && data.arenaItemNum == max_arena) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Box.tip6, max_arena));
        }
        this.box_result_data.box_level_data = data;
    }

    public GetBoxLevel() {
        let level = 1;
        if (this.box_result_data.box_level_data)
            level = this.box_result_data.box_level_data.boxLevel;
        return level;
    }

    public setSettingInfo(data: PB_SCBoxSetingInfo) {
        this.box_result_data.box_setting_info = data;
    }

    public setAutoStatus(status: AUTO_STATUS) {
        this.box_result_data.auto_statu = status;
    }

    public getAutoStatus() {
        return this.box_result_data.auto_statu;
    }

    public onClickAuto() {
        if (this.getAutoStatus() == AUTO_STATUS.START || this.getAutoStatus() == AUTO_STATUS.STOP) {
            this.setAutoStatus(AUTO_STATUS.OVER);
            PublicPopupCtrl.Inst().Center(Language.Box.tip1);
        } else {
            ViewManager.Inst().OpenView(BoxTrustView);
        }
    }

    //当前等级宝箱随机品质信息
    public GetBoxRandomColorCfg(lv?: number) {
        let self = this;
        let cfgs = CfgBoxData.random_color;
        lv = lv ? lv : self.GetBoxLevel();
        let cfg = cfgs[lv - 1];
        return cfg
    }

    public GetBoxRandomColorList(data: any) {
        let str: string = data.equipment_color_1;
        let list = str.split("|");
        // for (let i = 1; i <= 8; i++) {
        //     list.push((data["equipment_color_" + i]) / 100) + "%";
        // }
        return list;
    }

    //宝箱是否最大等级
    public isBoxMaxLevel() {
        let is_box_max = false;
        is_box_max = this.GetBoxLevel() >= CfgBoxData.random_color.length
        return is_box_max;
    }

    public OnBoxClick() {
        let self = this;
        if (this.GetBoxStatus() == BOX_STATUS.UNCLICKABLE ||
            this.GetBoxStatus() == BOX_STATUS.OPENING ||
            this.GetBoxStatus() == BOX_STATUS.CLOSEING) {
            return;
        }
        if (this.GetBoxStatus() == BOX_STATUS.OPENED && self.getAutoStatus() != AUTO_STATUS.START) {
            this.checkBoxOpened();
        }
        else if (!this.CheckEquipBag() && (this.GetBoxStatus() == BOX_STATUS.CLOSEED || this.GetBoxStatus() == BOX_STATUS.Init)) {
            self.sendOpen()
        }
    }

    public sendOpen() {
        let self = this;
        if (self.GetBoxNumInfo() > 0) {
            if (this.getAutoStatus() == AUTO_STATUS.START || this.getAutoStatus() == AUTO_STATUS.STOP) {
                if (this.GetBoxSettingInfo().boxSet.openFiveMark) {
                    if (self.GetBoxNumInfo() >= 5) {
                        this.SetBoxStatus(BOX_STATUS.UNCLICKABLE);
                    } else {
                        this.setAutoStatus(AUTO_STATUS.OVER);
                    }
                } else {
                    this.SetBoxStatus(BOX_STATUS.UNCLICKABLE);
                }
                BoxCtrl.Inst().SendBoxReq(BoxReqType.OPEN_BOX, this.GetBoxSettingInfo().boxSet.openFiveMark);
            } else {
                this.SetBoxStatus(BOX_STATUS.UNCLICKABLE);
                BoxCtrl.Inst().SendBoxReq(BoxReqType.OPEN_BOX);
            }
        } else {
            if (self.getAutoStatus() == AUTO_STATUS.START)
                this.setAutoStatus(AUTO_STATUS.OVER);
            PublicPopupCtrl.Inst().Center(Language.Box.tip2);
        }
    }

    /**开箱获得时装 */
    public SetShiZhuang(item_id: number) {
        let box_equip_data = new PB_SCBoxEquipInfo();
        box_equip_data.isNew = 1;
        box_equip_data.equipInfo = new PB_EquipData();
        box_equip_data.equipInfo.itemId = item_id;
        box_equip_data.equipInfo.equipType = BOX_SHI_ZHUANG_EQUIP_TYPE;
        this.setBoxEquip(box_equip_data);
    }

    /**清空箱子内时装信息 */
    public DelShiZhuang() {
        let box_equip_data = new PB_SCBoxEquipInfo();
        box_equip_data.isNew = 0;
        box_equip_data.equipInfo = new PB_EquipData();
        box_equip_data.equipInfo.itemId = 0;
        box_equip_data.equipInfo.equipType = -1;
        this.setBoxEquip(box_equip_data);
    }

    /**宝箱内时装物品id */
    public GetBoxShiZhuangId() {
        if (this.box_result_data.equip_info) {
            if (this.box_result_data.equip_info.equipInfo.equipType == BOX_SHI_ZHUANG_EQUIP_TYPE)
                return this.box_result_data.equip_info.equipInfo.itemId
        }
        return 0;
    }

    /***********************/
    /**宝箱状态变化 */
    public OnBoxStatusChange() {
        let status = this.GetBoxStatus();
        switch (status) {
            case BOX_STATUS.OPENING:
                AudioManager.Inst().Play(AudioTag.KaiXiangXuLi);
                break;
        }
    }

    /**主界面隐藏 宝箱状态在后台继续 */
    public IsBoxBackStage() {
        return !ViewManager.Inst().IsMainViewActive();
    }

    /**宝箱装备下发，检查箱子里的装备，判断箱子状态 */
    public checkBoxEquip() {
        let self = this;
        let info = self.box_result_data.equip_info;
        let cur_box_status = self.GetBoxStatus();
        if (!info.equipInfo || info.equipInfo.equipType == -1) {//宝箱内是空的
            this.SetBoxStatus(cur_box_status == BOX_STATUS.Init ? BOX_STATUS.CLOSEED : BOX_STATUS.CLOSEING);
            if (ViewManager.Inst().IsOpen(BoxEquipView)) {
                ViewManager.Inst().CloseView(BoxEquipView);
            }
        } else if (info.isNew) {
            this.SetBoxStatus(cur_box_status == BOX_STATUS.Init ? BOX_STATUS.OPENANI : BOX_STATUS.OPENING);
        } else if (cur_box_status == BOX_STATUS.Init) {
            this.SetBoxStatus(BOX_STATUS.OPENANI);
        }
    }

    /**宝箱已开启 判断自动开箱/弹出装备对比 */
    public checkBoxOpened() {
        let self = this;
        this.SetBoxStatus(BOX_STATUS.OPENED);
        if (self.box_result_data.equip_info.equipInfo.equipType == BOX_SHI_ZHUANG_EQUIP_TYPE) {
            ViewManager.Inst().OpenView(BoxShiZhuangEffectView);
        } else if (self.getAutoStatus() == AUTO_STATUS.START) {
            self.checkAuto();
        } else if (self.getAutoStatus() == AUTO_STATUS.OVER || self.getAutoStatus() == AUTO_STATUS.STOP) {
            if (this.IsMainViewTop())
                ViewManager.Inst().OpenView(BoxEquipView);
        }
        if (this.is_show_arean_item) {
            this.ShowArenaItem = false;
            ViewManager.Inst().OpenView(CommonRewardView, { reward_data: [{ itemId: ArenaData.Inst().GetChallengeCostId(), num: 1 }] })
        }
    }

    /**宝箱关闭 检查是否自动开箱/装备背包 */
    public checkBoxCloseed() {
        let self = this;
        this.SetBoxStatus(BOX_STATUS.CLOSEED);
        if (!this.CheckEquipBag())
            if (self.getAutoStatus() == AUTO_STATUS.START || self.getAutoStatus() == AUTO_STATUS.STOP) {
                this.setAutoStatus(AUTO_STATUS.START);
                self.checkAuto();
            }
    }

    //检查装备背包
    private CheckEquipBag() {
        if (EquipBagData.Inst().IsEquipToDetail()) {
            if (this.IsMainViewTop())
                ViewManager.Inst().OpenView(BagEquipConpareView);
            return true;
        }
        return false;
    }

    //主界面是否在最顶层
    public IsMainViewTop() {
        return ViewManager.Inst().IsTopView(MainView)
    }

    //请求装备
    public onEquip() {
        BoxCtrl.Inst().SendBoxReq(BoxReqType.WEAR_EQUIP);
    }

    //请求售出
    public sendSale() {
        BoxCtrl.Inst().SendBoxReq(BoxReqType.SELL)
    }

    //请求分解
    public sendEnchant() {
        BoxCtrl.Inst().SendBoxReq(BoxReqType.Enchant)
    }

    //对比装备条件 
    public CheckAutoCondition() {
        let self = this;
        let box_equip = self.box_result_data.equip_info;
        if (box_equip && box_equip.equipInfo.equipType != -1) {
            this.isCondition = this.checkCondition();
            return this.isCondition;
        }
        return false;
    }

    private checkAuto(interval: number = 0.5) {
        let self = this;
        self.CheckAutoCondition();
        let box_equip = self.box_result_data.equip_info;
        if (box_equip && box_equip.equipInfo.equipType != -1) {
            let boxset = this.box_result_data.box_setting_info.boxSet;
            if (boxset.challengeMark && ArenaData.Inst().IsChallengeTimeMax()) {
                PublicPopupCtrl.Inst().Center(Language.Box.tip5);
                this.setAutoStatus(AUTO_STATUS.OVER);
            }
            if (this.isCondition) {
                PublicPopupCtrl.Inst().Center(Language.Box.tip1);
                this.setAutoStatus(AUTO_STATUS.STOP);
                if (this.IsMainViewTop())
                    ViewManager.Inst().OpenView(BoxEquipView);
            }
            else {
                if (boxset.equipSellMark == 0) {
                    this.sendSale()
                    // this.CheckSale(box_equip.equipInfo, this.sendSale.bind(BoxData.Inst()), true);
                } else {
                    this.sendEnchant();
                    // this.CheckSale(box_equip.equipInfo, this.sendEnchant.bind(BoxData.Inst()), true);
                }
            }
        } else {
            if (interval == 0) {
                this.OnBoxClick();
            } else {
                if (this._wHanlder) {
                    Timer.Inst().CancelTimer(this._wHanlder);
                }
                this._wHanlder = Timer.Inst().AddRunTimer(() => {
                    if (self.getAutoStatus() == AUTO_STATUS.START)
                        this.OnBoxClick();
                }, interval, 1, false)
            }
        }
    }

    private checkCondition() {
        let self = this;
        let box_equip = self.box_result_data.equip_info;
        let boxset = this.box_result_data.box_setting_info.boxSet;
        let cfg_equip = Item.GetConfig(box_equip.equipInfo.itemId);
        if (cfg_equip.quality < boxset.equipEqality) {
            if (boxset.retainMark && cfg_equip.quality >= 7) {
                return true;
            }
            return false;
        }
        if (!boxset.retainMark && (!boxset.conditionFirstMark || (!boxset.conditionFirst1 && !boxset.conditionFirst2))
            && (!boxset.conditionSecondMark || (!boxset.conditionSecond1 && !boxset.conditionSecond2))) {
            return true;
        }
        if (boxset.retainMark && cfg_equip.quality >= 7) {
            return true;
        }
        // if (boxset.equipCapMark) {
        //     let cur_equip = BagData.Inst().GetEquipItemInfo(box_equip.equipInfo.equipType);
        //     let cur_cap = cur_equip ? AttrHelper.GetPower(AttrHelper.EquipAttrToAttrUp(cur_equip), false) : 0;
        //     let box_cap = AttrHelper.GetPower(AttrHelper.EquipAttrToAttrUp(box_equip.equipInfo), false);
        //     if (box_cap > cur_cap)
        //         return true;
        // }
        let conditions_first = [];
        boxset.conditionFirst1 != 0 && conditions_first.push(boxset.conditionFirst1);
        boxset.conditionFirst2 != 0 && conditions_first.push(boxset.conditionFirst2);
        let att_type = [box_equip.equipInfo.attrType1, box_equip.equipInfo.attrType2];
        if (boxset.conditionFirstMark && conditions_first.length) {
            let condition1 = conditions_first[0];
            for (let j = 0; j < att_type.length; j++) {
                if (condition1 == att_type[j] && (conditions_first.length == 1 || conditions_first[1] == att_type[Math.abs(j - 1)])) {
                    return true;
                }
            }
        }
        let conditions_secobnd = [];
        boxset.conditionSecond1 != 0 && conditions_secobnd.push(boxset.conditionSecond1);
        boxset.conditionSecond2 != 0 && conditions_secobnd.push(boxset.conditionSecond2);
        if (boxset.conditionSecondMark && conditions_secobnd.length) {
            let condition1 = conditions_secobnd[0];
            for (let j = 0; j < att_type.length; j++) {
                if (condition1 == att_type[j] && (conditions_secobnd.length == 1 || conditions_secobnd[1] == att_type[Math.abs(j - 1)])) {
                    return true;
                }
            }
        }
        return false;
    }

    //开始委托
    public startAuto() {
        let self = this;
        if (this.GetBoxNumInfo() <= 0) {
            PublicPopupCtrl.Inst().Center(Language.Box.tip2);
            return;
        }
        if ((this.box_result_data.equip_info && this.box_result_data.equip_info.equipInfo.itemId != 0) ||
            EquipBagData.Inst().IsEquipToDetail()) {
            PublicPopupCtrl.Inst().Center(Language.Box.tip7);
            return
        }
        let boxset = this.box_result_data.box_setting_info.boxSet;
        if (boxset.challengeMark && ArenaData.Inst().IsChallengeTimeMax()) {
            PublicPopupCtrl.Inst().Center(Language.Box.tip5);
            this.setAutoStatus(AUTO_STATUS.OVER);
            return;
        }
        self.setAutoStatus(AUTO_STATUS.START)
        self.checkAuto(0);
    }

    public checkCloseAuto() {
        if (this.getAutoStatus() == AUTO_STATUS.START) {
            this.setAutoStatus(AUTO_STATUS.OVER)
            PublicPopupCtrl.Inst().Center(Language.Box.tip1);
        }
    }

    public GetEquipAttListData(equip_data: IPB_EquipData, compare_data?: IPB_EquipData) {
        let list = []
        list[0] = { att_name: AttrListName[BATTLE_ATTR.SPEED], num: equip_data.speed, compare_num: compare_data ? compare_data.speed : equip_data.speed }
        list[1] = { att_name: AttrListName[BATTLE_ATTR.HP], num: equip_data.hp, compare_num: compare_data ? compare_data.hp : equip_data.hp }
        list[2] = { att_name: AttrListName[BATTLE_ATTR.ATTACK], num: equip_data.attack, compare_num: compare_data ? compare_data.attack : equip_data.attack }
        list[3] = { att_name: AttrListName[BATTLE_ATTR.ARMOR], num: equip_data.defend, compare_num: compare_data ? compare_data.defend : equip_data.defend }
        return list
    }

    public GetEquipAddAttListData(equip_data: IPB_EquipData) {
        let list = [];
        let num1 = IsPercent[equip_data.attrType1] ? (equip_data.attrValue1 / 100) + "%" : equip_data.attrValue1;
        if (equip_data.attrType1 != BATTLE_ATTR.BATTLE_ATTR_MIN)
            list.push({ att_name: AttrListName[equip_data.attrType1], num: num1, desc: AttrListDesc[equip_data.attrType1] });
        let num2 = IsPercent[equip_data.attrType2] ? (equip_data.attrValue2 / 100) + "%" : equip_data.attrValue2;
        if (equip_data.attrType2 != BATTLE_ATTR.BATTLE_ATTR_MIN)
            list.push({ att_name: AttrListName[equip_data.attrType2], num: num2, desc: AttrListDesc[equip_data.attrType2] });
        return list;
    }


    //设置勾选信息 
    public setBoxSet(info: PB_BoxSet) {
        this.box_result_data.box_setting_info.boxSet = info;
        BoxCtrl.Inst().SendBoxSetReq(info);
    }

    public sendBuy() {
        if (this.IsBoxCanUp()) {
            PublicPopupCtrl.Inst().Center(Language.Box.tip3);
            return;
        }
        let cost = this.GetBoxRandomColorCfg().price;
        let id = this.GetBuyBoxCurrId();
        let num = BagData.Inst().getItemNum(id);
        if (cost <= num)
            BoxCtrl.Inst().SendBoxReq(BoxReqType.LEVEL_BUY);
        else
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(id)
    }

    public sendUp() {
        let self = this
        if (self.isBoxMaxLevel()) {
            return
        }
        if (self.IsBoxCanUp()) {
            BoxCtrl.Inst().SendBoxReq(BoxReqType.LEVEL_UP);
        } else {
            PublicPopupCtrl.Inst().Center(Language.Box.tip4);
        }
    }

    //加速
    public SpeedUp() {
        let item_id = this.GetBoxSpeedUpCostId();
        let cfg = Item.GetConfig(item_id);
        let max_num = Math.ceil((this.box_result_data.box_level_data.timestamp - TimeCtrl.Inst().ServerTime) / 60 / cfg.param);
        let fast_data = new FastData(max_num, item_id, this.sendSpeedUp.bind(this), 1);
        ViewManager.Inst().OpenView(FastUseView, fast_data)
    }

    public sendSpeedUp(num: number) {
        BoxCtrl.Inst().SendBoxReq(BoxReqType.SPEED_UP, num);
    }

    public GetBoxUpPro() {
        let self = this
        let curcfg = self.GetBoxRandomColorCfg();
        let max = curcfg.up_buy_num * 110 - 10;
        let val = Math.max(self.box_result_data.box_level_data.buyTimes * 110 - 10, 0);
        return { max: max, val: val };
    }

    public GetBoxUpReward() {
        let curcfg = this.GetBoxRandomColorCfg();
        let list = [];
        let flag = DataHelper.ToBinary(this.box_result_data.box_level_data.levelFetchFlag);
        for (let i = 0; i < curcfg.reward.length; i++) {
            list.push({
                item: curcfg.reward[i],
                is_fetch: flag[i + 1],
                can_fetch: this.box_result_data.box_level_data.buyTimes >= i + 1 && flag[i + 1] != 1,
                seq: i + 1
            });
        }
        return list;
    }

    public GetBoxEquipQualiy() {
        let qua = 1;
        let data = this.box_result_data.equip_info.equipInfo;
        if (data) {
            qua = Item.GetColor(data.itemId);
            // let cfg = Item.GetConfig(data.itemId);
            // if (cfg) {
            //     qua = cfg.quality;
            // }
        }
        return qua;
    }

    public GetBuyBoxCurrId() {
        return CfgBoxData.other[0].currency_type
    }

    public GetBoxSpeedItemId() {
        return CfgBoxData.other[0].accelerate_id
    }
    public GetBoxSpeedUpCostId() {
        return CfgBoxData.other[0].accelerate_id
    }

    public GetAutoCfg() {
        if (!this.box_auto_cfg) {
            this.box_auto_cfg = {}
            let cfgs = CfgBoxData.auto_unpack;
            for (let i = 0; i < cfgs.length; i++) {
                if (!this.box_auto_cfg[cfgs[i].seq])
                    this.box_auto_cfg[cfgs[i].seq] = { param_1: [], desc: [] };
                this.box_auto_cfg[cfgs[i].seq].param_1.push(cfgs[i].param_1 + "");
                this.box_auto_cfg[cfgs[i].seq].desc.push(cfgs[i].dec);
            }
        }
        return this.box_auto_cfg;
    }

    public GetAutoQualityDesc() {
        return this.GetAutoCfg()[1].desc;
    }
    public GetAutoQualityParam() {
        return this.GetAutoCfg()[1].param_1;
    }
    public GetAutoQualityColor() {
        let quas = this.GetAutoCfg()[1].param_1;
        let list = [];
        for (let i = 0; i < quas.length; i++) {
            list.push(QualityColorStr[+quas[i]]);
        }
        return list;
    }
    public GetAutoCondition1Desc() {
        return this.GetAutoCfg()[2].desc;
    }
    public GetAutoCondition1Param() {
        return this.GetAutoCfg()[2].param_1;
    }
    public GetAutoCondition2Desc() {
        return this.GetAutoCfg()[3].desc;
    }
    public GetAutoCondition2Param() {
        return this.GetAutoCfg()[3].param_1;
    }

    public GetBoxId() {
        return CfgBoxData.other[0].unpack_item_id;
    }

    public IsBoxCanUp() {
        let self = this
        let curcfg = self.GetBoxRandomColorCfg();
        let data = self.box_result_data.box_level_data;
        if (data) {
            return data.buyTimes >= curcfg.up_buy_num && data.timestamp <= 0 && !this.isBoxMaxLevel();
        }
    }


    public GetArenaMax() {
        return CfgBoxData.other[0].get_num;
    }
    //今日开出挑战券数量是否上限
    public IsArenaItemMax() {
        let num = this.box_result_data.box_level_data ? this.box_result_data.box_level_data.arenaItemNum : 0;
        let limit = this.GetArenaMax();
        return num >= limit;
    }

    //设置售出经验与金币
    SetSellInfo(coin: number, exp: number) {
        this.sell_info.coin = coin
        this.sell_info.exp = exp
        this.FlushData.sell_flag = !this.FlushData.sell_flag
    }
    GetSellInfo() {
        return this.sell_info
    }

    //宝箱样式
    public GetBoxType() {
        let level = this.GetBoxLevel();
        return CfgBoxData.random_color[level - 1].box_num;
    }

    //装备品质对应附加属性表
    public GetEquipColorAttrCfg() {
        if (!this.box_color_att_cfg) {
            this.box_color_att_cfg = CfgHelper.reSetdatas(CfgBoxData.color_att, ["att_group"], true);
        }
        return this.box_color_att_cfg;
    }

    //检查是否直接售出
    public CheckSale(data: IPB_EquipData, sell_func: Function, is_auto?: boolean) {
        is_auto = is_auto ?? false
        if (!PublicPopupData.Inst().GetDialogTipsNotTips(DialogTipsTypes.box_sell)) {
            //判断属性
            let cur_type = data.equipType;
            let role_equip = BagData.Inst().GetEquipItemInfo(cur_type);//人物身上的装备数据
            if (role_equip) {
                let is_att = role_equip.attack < data.attack;
                let is_hp = role_equip.hp < data.hp;
                let is_defend = role_equip.defend < data.defend;
                let is_speed = role_equip.speed < data.speed;
                if (is_att && is_hp && is_defend && is_speed) {
                    PublicPopupCtrl.Inst().DialogTips(Language.Box.SellTips, DialogTipsTypes.box_sell, sell_func, true);
                    return;
                }
            }
        }
        if (is_auto) {
            if (this.box_result_data.box_setting_info.boxSet.equipSellMark == 0) {
                sell_func();
            } else {
                this.sendEnchant();
            }
        } else {
            if (this.sale_state == 0) {
                sell_func();
            } else {
                this.sendEnchant();
            }
        }

    }

    public SetEnchantInfo(info: any) {
        this.enchant_info = info
        this.FlushData.enchant_get = !this.FlushData.enchant_get
    }

    public GetEnchantInfo() {
        return this.enchant_info
    }

    /**宝箱升级购买红点 */
    public GetBoxBuyRed() {
        if (this.isBoxMaxLevel())
            return 0;
        if (this.IsBoxCanUp()) {
            return 0;
        }
        if (!this.box_result_data.box_level_data)
            return 0
        if (this.box_result_data.box_level_data.timestamp > 0)
            return 0
        let cost = this.GetBoxRandomColorCfg().price;
        let num = BagData.Inst().getItemNum(this.GetBuyBoxCurrId());
        if (cost <= num)
            return 1;
        return 0;
    }

    /**宝箱升级红点 */
    public GetBoxUpRed() {
        return this.IsBoxCanUp() ? 1 : 0;
    }

    /**宝箱加速红点 */
    public GetBoxSpeedRed() {
        if (this.isBoxMaxLevel())
            return 0;
        let cost_id = this.GetBoxSpeedUpCostId();
        let num = Item.GetNum(cost_id);
        if (this.box_result_data.box_level_data && this.box_result_data.box_level_data.timestamp > 0) {
            return num > 0 ? 1 : 0;
        }
        return 0;
    }

    /**宝箱升级广告加速红点 */
    public GetAdRed() {
        if (this.isBoxMaxLevel())
            return 0;
        let data_ad = RoleData.Inst().AdInfo
        let box_ad = data_ad.get(AdType.box_speed_up)
        if (!this.box_result_data.box_level_data || this.box_result_data.box_level_data.timestamp <= 0) {
            return 0;
        }
        if (!box_ad) {
            return 1;
        }
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
        if (+co.ad_param - box_ad.todayCount <= 0) {
            return 0;
        }
        if (box_ad.nextFetchTime > 0)
            return 0;
        return 1;
    }

    /**宝箱购买奖励红点 */
    public GetBoxUpRewardRed() {
        if (this.isBoxMaxLevel())
            return 0;
        if (!this.box_result_data.box_level_data || this.box_result_data.box_level_data.timestamp > 0) {
            return 0;
        }
        let curcfg = this.GetBoxRandomColorCfg();
        let flag = DataHelper.ToBinary(this.box_result_data.box_level_data.levelFetchFlag);
        for (let i = 0; i < curcfg.reward.length; i++) {
            if (this.box_result_data.box_level_data.buyTimes >= i + 1 && flag[i + 1] != 1)
                return 1;
        }
        return 0;
    }

    /**宝箱升级总红点 */
    public GetBoxInfoRedNum() {
        if (this.GetBoxBuyRed() ||
            this.GetBoxUpRed() ||
            this.GetBoxSpeedRed() ||
            this.GetBoxUpRewardRed() ||
            this.GetAdRed()) {
            return 1;
        }
        return 0;
    }

}

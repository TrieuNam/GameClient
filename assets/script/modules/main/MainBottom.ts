import { math } from "cc";
import { CfgDFArena } from "config/CfgDFArena";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor, SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { ArenaData } from "modules/Arena/ArenaData";
import { PetData } from "modules/Pet/PetData";
import { TodayShareData } from "modules/TodayShare/TodayShareCtrl";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_ENTER_TYPE } from "modules/activity/ActivityEnum";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BoxData } from "modules/box/BoxData";
import { BoxInfoView } from "modules/box/BoxInfoView";
import { BaseItemGB } from "modules/common/BaseItem";
import { AdType, ICON_TYPE } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { DungeonEnterView } from "modules/dungeon/DungeonEnterView";
import { EscortData } from "modules/escort/EscortData";
import { RedPoint } from "modules/extends/RedPoint";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PublicPopupData } from "modules/public_popup/PublicPopupData";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { RoleData } from "modules/role/RoleData";
import { TaskData } from "modules/task/TaskData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { MainActItem } from "./MainActItem";
import { MainBoxShow } from "./MainBoxShow";
import { MainBtnTodayShare } from "./MainBtnTodayShare";
import { MainDailyAdButton } from "./MainItems";
import { MainTaskItem } from "./MainTaskItem";
import { BoxGetWayView } from "modules/box/BoxGetWay";



export class MainBottom extends fgui.GComponent {
    private handleCollector: HandleCollector;
    private timer_handle_daily_add: any = null;
    private openCtrler: fgui.Controller

    private viewNode = {
        // BtnBoxAuto: <MainBoxAutoButton>null,
        BtnBoxUp: <fgui.GButton>null,
        BtnBoxOpen: <fgui.GButton>null,
        BoxShow: <MainBoxShow>null,
        Btn1: <MainButtonMod>null,
        Btn2: <MainButtonModJJC>null,
        Btn3: <MainButtonMod>null,
        Btn4: <MainButtonMod>null,
        // Btn5: <MainButtonMod>null,
        Btn6: <MainButtonMod>null,
        // Btn7: <MainButtonMod>null,
        BoxNum: <fgui.GTextField>null,
        RedBox: <RedPoint>null,
        TaskItem: <MainTaskItem>null,
        BtnChallengTip: <fgui.GButton>null,
        EscortTip: <fgui.GLabel>null,
        BtnTodayShare: <MainBtnTodayShare>null,
        BtnDailyAd: <MainDailyAdButton>null,
        //BtnTest: <fgui.GButton>null,
        // AutoBoxTip: <fgui.GLabel>null,
        ActItem: <MainActItem>null,
        BtnBoxGetWay: <fgui.GButton>null,
    };

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        EventCtrl.Inst().off(CommonEvent.NET_SWITCH, this.initBtn, this);
        Timer.Inst().CancelTimer(this.timer_handle_daily_add)
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    private addRemindCare(mod_key: number, obj: RedPoint) {
        let self = this;
        let group = ModManger.TabMod(mod_key);
        this.handleCollector.Add(RemindGroupMonitor.Create(group, self.freshRedPoint.bind(self, group, obj)));
    }

    private freshRedPoint(group: any, obj: RedPoint) {
        obj.SetNum(RemindCtrl.Inst().GetGroupNum(group));
    }
    /* onClickTest() {
        for (let index = 0; index < 10; index++) {
            let flyIcon = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
            this.addChild(flyIcon)
            flyIcon.PlayTween(math.randomRangeInt(0, 2), +index)
        }
    } */

    private _arr_coin: MainFlyIcon[] = [];
    FlushBoxSellInfo() {
        //1 金币 其他 经验
        let sell_info = BoxData.Inst().GetSellInfo()
        let value = sell_info.coin
        let d = Math.floor(value / 5)//
        d = d == 0 ? 1 : d
        let num = d
        for (let index = 1; index <= 5; index++) {
            if (value > 0) {
                let flyIcon = this._arr_coin[index];
                if (!flyIcon) {
                    flyIcon = this._arr_coin[index] = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
                    this.addChild(flyIcon)
                }
                if (value - d < 0) {
                    flyIcon.PlayTween(1, value)
                } else {
                    flyIcon.PlayTween(1, +d)
                }
                value = value - d
            }
        }
        value = sell_info.exp
        d = Math.floor(value / 5)//
        d = d == 0 ? 1 : d
        num = d
        for (let index = 6; index <= 10; index++) {
            if (value > 0) {
                let flyIcon = this._arr_coin[index];
                if (!flyIcon) {
                    flyIcon = this._arr_coin[index] = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
                    this.addChild(flyIcon)
                }
                if (value - d < 0) {
                    flyIcon.PlayTween(0, value)
                } else {
                    flyIcon.PlayTween(0, +d)
                }
                value = value - d
            }
        }
        AudioManager.Inst().Play(AudioTag.JinBi);
    }

    FlushBoxEnChantInfo() {
        //1 金币 其他 经验
        let enchant_info = BoxData.Inst().GetEnchantInfo()
        // LogError("enchant_info = ", enchant_info)
        for (let i = 0; i < enchant_info.length; i++) {
            let value = Number(enchant_info[i].num)
            let d = Math.floor(value / 5)//
            d = d == 0 ? 1 : d
            let num = d
            for (let index = (1 + i * 5); index <= (5 * i + 5); index++) {
                if (value > 0) {
                    let flyIcon = this._arr_coin[index];
                    if (!flyIcon) {
                        flyIcon = this._arr_coin[index] = <MainFlyIcon>fgui.UIPackage.createObject("Main", "FlyIcon", MainFlyIcon)
                        this.addChild(flyIcon)
                    }
                    if (value - d < 0) {
                        flyIcon.PlayTween(enchant_info[i].itemId, value)
                    } else {
                        flyIcon.PlayTween(enchant_info[i].itemId, +d)
                    }
                    value = value - d
                }
            }
        }
        AudioManager.Inst().Play(AudioTag.JinBi);
    }
    public InitData() {
        this.openCtrler = this.getController("Open");

        //this.viewNode.BtnTest.onClick(this.onClickTest.bind(this))
        this.addSmartDataCare(BagData.Inst().BagItemData, this.FlushBoxInfoShow.bind(this), "OtherChange");
        this.addSmartDataCare(BoxData.Inst().GetboxResultData(), this.FlushBoxStatus.bind(this), "box_status");
        this.addSmartDataCare(BoxData.Inst().GetboxResultData(), this.FlushBoxLevel.bind(this), "box_level_data");
        this.addSmartDataCare(TaskData.Inst().result_info, this.FlushTask.bind(this), "is_change");
        this.addSmartDataCare(BoxData.Inst().FlushData, this.FlushBoxSellInfo.bind(this), "sell_flag")
        this.addSmartDataCare(BoxData.Inst().FlushData, this.FlushBoxEnChantInfo.bind(this), "enchant_get")
        this.addSmartDataCare(EscortData.Inst().FlushData, this.FlushEscortTipShow.bind(this), "flush_ship_list", "flush_role_info")
        this.addSmartDataCare(TodayShareData.Inst().flush_info, this.FlushTodayShareShow.bind(this), "info");
        this.addSmartDataCare(ActivityData.Inst().ResuleData, this.FlushTodayShareShow.bind(this), "is_activity_status_change");
        this.addSmartDataCare(RoleData.Inst().AdFlush, this.FlushDailyAdShow.bind(this));
        this.addSmartDataCare(RoleData.Inst().ResultData, this.FlushDailyAdShow.bind(this), "roleLevel");
        this.addSmartDataCare(PublicPopupData.Inst().MainFlushData, this.FlushMainOpen.bind(this), "MainOpen");
        //this.addSmartDataCare(TerritoryData.Inst().FlushData, this.TerritoryLogRed.bind(this), "flush_info");
        this.addRemindCare(Mod.BoxInfo.View, this.viewNode.RedBox)
        //FunOpen.Inst().RgCheckFunc("EscortView", this.OnFunOpenChange.bind(this))
        this.viewNode.BtnBoxUp.onClick(this.onBtnClick.bind(this, "BtnBoxUp"));
        this.viewNode.BtnChallengTip.onClick(this.onBtnClick.bind(this, "BtnChallengTip"));
        this.viewNode.Btn1.onClick(this.onBtnClick.bind(this, "Btn1"));
        this.viewNode.Btn2.onClick(this.onBtnClick.bind(this, "Btn2"));
        this.viewNode.Btn3.onClick(this.onBtnClick.bind(this, "Btn3"));
        this.viewNode.Btn4.onClick(this.onBtnClick.bind(this, "Btn4"));
        // this.viewNode.Btn5.onClick(this.onBtnClick.bind(this, "Btn5"));
        this.viewNode.Btn6.onClick(this.onBtnClick.bind(this, "Btn6"));
        // this.viewNode.Btn7.onClick(this.onBtnClick.bind(this, "Btn7"));
        this.viewNode.BtnBoxOpen.onClick(this.OnClickBoxOpen, this);
        this.viewNode.BtnTodayShare.onClick(this.OnClickTodayShare, this);
        this.viewNode.BtnDailyAd.onClick(this.OnClickDailyAd, this);
        this.viewNode.BtnBoxGetWay.onClick(this.onClickBoxGetWay, this);
        UH.SetText(this.viewNode.BtnBoxGetWay, Language.Box.getBox);
        this.initBtn();
        this.viewNode.BoxShow.InitData();
        GuideCtrl.Inst().AddGuideUi("BtnBoxOpen", this.viewNode.BtnBoxOpen);
        GuideCtrl.Inst().AddGuideUi("BtnMaoXian", this.viewNode.Btn1);
        GuideCtrl.Inst().AddGuideUi("BtnBoxUp", this.viewNode.BtnBoxUp);
        GuideCtrl.Inst().AddGuideUi("BtnDungeon", this.viewNode.Btn3);
        GuideCtrl.Inst().AddGuideUi("BtnArena", this.viewNode.Btn2);
        // GuideCtrl.Inst().AddGuideUi("BtnMainOther", this.viewNode.Btn7);
        GuideCtrl.Inst().AddGuideUi("BtnPet", this.viewNode.Btn4);
        // GuideCtrl.Inst().AddGuideUi("EscortMainBtn", this.viewNode.Btn5)
        GuideCtrl.Inst().AddGuideUi("FishMainBtn", this.viewNode.Btn6);
        this.InitView();
        EventCtrl.Inst().on(CommonEvent.NET_SWITCH, this.initBtn, this);

        this.viewNode.ActItem.InitData(ACTIVITY_ENTER_TYPE.Right);

    }

    private initBtn() {
        this.viewNode.Btn1.SetData({ NameShow: Language.Adventure.mao_xian, IconName: "MaoXianTuBiao", ModKey: Mod.Adventure.View });
        this.viewNode.Btn2.SetData({ NameShow: Language.Arena.arena, IconName: "JingJiChang", ModKey: Mod.ArenaEnter.Main });
        this.viewNode.Btn3.SetData({ NameShow: Language.Dungeon.MainName, IconName: "FuBen", ModKey: Mod.Dungeon.View, mod: Mod.Dungeon });
        this.viewNode.Btn4.SetData({ NameShow: Language.Pet.pet, IconName: "ChongWu", ModKey: Mod.Pet.View, mod: Mod.Pet });
        // this.viewNode.Btn5.SetData({ NameShow: Language.Escort.Name, IconName: "HuSong", ModKey: Mod.Escort.View });
        this.viewNode.Btn6.SetData({ NameShow: Language.Territory.MainName, IconName: "LingDi", ModKey: Mod.Territory.Main });
        // this.viewNode.Btn7.SetData({ NameShow: Language.Common.other, IconName: "QiTa", ModKey: Mod.Other.View, mod: Mod.Other });
        this.viewNode.BtnTodayShare.InitData();
    }

    FlushEscortTipShow() {
        let num = EscortData.Inst().GetRewardRedPoint()
        //console.log("护送完成红点", num);
        this.viewNode.EscortTip.visible = num > 0;
    }
    // TerritoryLogRed() {
    //     let data = FunOpen.Inst().GetFunIsOpen(Mod.Territory.Main)
    //     if (data.is_open) {
    //         TerritoryCtrl.Inst().SendTerritoryReq(TERRITORY_REQ.Log);
    //     }
    // }

    private InitView() {
        this.FlushBoxInfoShow();
        this.FlushBoxStatus();
        this.FlushBoxLevel();
        this.FlushTask();
        this.FlushDailyAdShow();
        this.viewNode.BtnDailyAd.FlushShow();
    }

    private FlushBoxInfoShow() {
        let num = BoxData.Inst().GetBoxNumInfo();
        UH.SetText(this.viewNode.BoxNum, num);
        if (num == 0) {
            this.viewNode.BtnBoxGetWay.visible = true;
        } else {
            this.viewNode.BtnBoxGetWay.visible = false;
        }
    }

    private FlushBoxStatus() {
        this.viewNode.BoxShow.FlushBoxStatus();
    }

    private FlushBoxLevel() {
        let box_level_info = BoxData.Inst().GetBoxInfo();
        if (box_level_info) {
            UH.SetText(this.viewNode.BtnBoxUp.getTextField(), "Lv." + BoxData.Inst().GetBoxInfo().boxLevel);
            this.viewNode.BtnChallengTip.visible = BoxData.Inst().IsArenaItemMax();
            if (this.viewNode.BoxShow) {
                this.viewNode.BoxShow.initBox();
            }
        }
    }
    public FlushTodayShareShow() {
        // this.viewNode.BtnTodayShare.visible = !TodayShareData.Inst().IsFetch() && ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.TodayShare)
        //     && FunOpen.Inst().GetFunIsOpen(Mod.ServerActivity.TodayShare).is_open
        this.viewNode.BtnTodayShare.visible = false
    }

    private FlushTask() {
        this.viewNode.TaskItem.FlushData();
    }

    private FlushMainOpen() {
        this.openCtrler.selectedIndex = PublicPopupData.Inst().MainViewOpen ? 1 : 0
    }

    private onBtnClick(btn_name: string) {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        switch (btn_name) {
            case "BtnBoxUp":
                ViewManager.Inst().OpenView(BoxInfoView);
                break;
            case "BtnChallengTip":
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Box.tip6, BoxData.Inst().GetArenaMax()));
                break;
            case "Btn1":
                ViewManager.Inst().OpenViewByKey(this.viewNode.Btn1.GetData().ModKey);
                break
            case "Btn2":
                ViewManager.Inst().OpenViewByKey(this.viewNode.Btn2.GetData().ModKey);
                break
            case "Btn3":
                ViewManager.Inst().OpenView(DungeonEnterView);
                break;
            case "Btn4":
                PetData.Inst().checkOpenPet();
                break
            // case "Btn5":
            //     ViewManager.Inst().OpenView(EscortView);
            //     break;
            case "Btn6":
                ViewManager.Inst().OpenViewByKey(this.viewNode.Btn6.GetData().ModKey);
                break;
            // case "Btn7":
            //     ViewManager.Inst().OpenViewByKey(this.viewNode.Btn7.GetData().ModKey);
            //     break;
        }
    }
    private OnClickBoxOpen() {
        // let qua = math.randomRangeInt(1, 5)
        // this.viewNode.BoxShow.OpenBox(qua);
        BoxData.Inst().checkCloseAuto();
        BoxData.Inst().OnBoxClick();
    }

    private OnClickTodayShare() {
        // ServerActivityData.Inst().SetQuickOpen("TodayShareView")
        // ViewManager.Inst().OpenView(ServerActivityView)
        ViewManager.Inst().OpenViewByKey(Mod.ServerActivity.TodayShare)
    }

    private FlushDailyAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.daily)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.daily)
        this.viewNode.BtnDailyAd.visible = RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount));

        Timer.Inst().CancelTimer(this.timer_handle_daily_add)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_daily_add = Timer.Inst().AddCountDownCT(() => { }, this.FlushDailyAdShow.bind(this), info.nextFetchTime, 1)
        }
    }

    private OnClickDailyAd() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.daily)
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.daily, TextHelper.Format(Language.adv.daily, co.ad_award[0].num));
    }

    private onClickBoxGetWay() {
        ViewManager.Inst().OpenView(BoxGetWayView);
    }
}

export class MainButtonMod extends BaseItemGB {
    private handleCollector: HandleCollector;
    protected viewNode = {
        Icon: <fgui.GLoader>null,
        NameShow: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
        LockShow: <fgui.GImage>null,
        CountMax: <fgui.GImage>null,
        ArenaItemCount: <fgui.GTextField>null,
        GpArenaItemCount: <fgui.GGroup>null,
    }
    // private extral_mod_list: any
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.extral_mod_list = []
    }
    public SetData(data: any) {
        this._data = data;
        UH.SpriteName(this.viewNode.Icon, "Main", data.IconName);
        UH.SetText(this.viewNode.NameShow, data.NameShow);
        this.viewNode.CountMax.visible = false
        this.viewNode.GpArenaItemCount.visible = false;
        if (data.ModKey) {
            let mod = data.mod ?? ModManger.TabMod(data.ModKey);
            if (!this.handleCollector)
                this.handleCollector = HandleCollector.Create();
            else
                this.handleCollector.RemoveAll();
            this.addRemindCare(mod)

            if (data.ModKey == Mod.Arena.View) {
                //物品刷新
                this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushAreanCountMax.bind(this), "OtherChange")
                //属性刷新
                this.AddSmartDataCare(RoleData.Inst().BaseAttribute, this.FlushAreanCountMax.bind(this))
            }
            let open_t = FunOpen.Inst().GetFunIsOpen(data.ModKey);
            this.grayed = !open_t.is_open;
            this.viewNode.LockShow.visible = !open_t.is_open;
            if (!open_t.is_open) {
                FunOpen.Inst().RgCheckFunc(data.ModKey, this.OnFunOpenChange.bind(this));
            }
            // this.PlusExtralMod()
        }
    }
    FlushAreanCountMax() {
        let open_t = FunOpen.Inst().GetFunIsOpen(this._data.ModKey);
        if (open_t.is_open) {
            let is_max = ArenaData.Inst().IsChallengeTimeMax();
            this.viewNode.CountMax.visible = is_max;
            let num = ArenaData.Inst().GetFightTimes();
            this.viewNode.GpArenaItemCount.visible = num != 0 && !is_max
            UH.SetText(this.viewNode.ArenaItemCount, num);
            this.viewNode.RedPoint.visible = num <= 0;
        } else {
            this.viewNode.CountMax.visible = false;
            this.viewNode.GpArenaItemCount.visible = false;
            this.viewNode.RedPoint.visible = true;
        }
        // this.viewNode.CountMax.visible = open_t.is_open && ArenaData.Inst().IsChallengeTimeMax();
        // let open_t = FunOpen.Inst().GetFunIsOpen(this._data.ModKey);
        // if(open_t.is_open){
        // }else{
        //     this.viewNode.CountMax.visible = false
        // }
    }
    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    // private PlusExtralMod() {
    //     if (this._data.ModKey == Mod.Other.View) {
    //         this.addRemindCare(Mod.LoopMine.View)
    //         this.extral_mod_list.push(Mod.LoopMine.View)
    //     }
    // }

    private OnFunOpenChange(key: number | string, is_open: boolean) {
        this.grayed = !is_open;
        this.viewNode.LockShow.visible = !is_open;
        if (is_open) {
            FunOpen.Inst().ClearRgFunc(key);
            if (this._data.ModKey == Mod.Arena.View)
                this.FlushAreanCountMax()
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    private addRemindCare(mod: any) {
        let self = this;
        this.handleCollector.Add(RemindGroupMonitor.Create(mod, self.freshRedPoint.bind(self, mod)));
    }

    private freshRedPoint(group: any) {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
        // for (var index in this.extral_mod_list) {
        //     let r_num = RemindCtrl.Inst().GetRemindNum(Number(this.extral_mod_list[index]));
        //     let g_num = RemindCtrl.Inst().GetGroupNum(Number(this.extral_mod_list[index]));
        //     let num = (r_num + g_num) > 0 ? 1 : 0
        //     this.viewNode.RedPoint.SetNum(num);
        // }
    }
}

export class MainButtonModJJC extends BaseItemGB {
    private handleCollector: HandleCollector;
    protected viewNode = {
        Icon: <fgui.GLoader>null,
        NameShow: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
        LockShow: <fgui.GImage>null,
        CountMax: <fgui.GImage>null,
        ArenaItemCount: <fgui.GTextField>null,
        GpArenaItemCount: <fgui.GGroup>null,
        ArenaNumShow: <fgui.GGroup>null,
        PeakArenaNumShow: <fgui.GGroup>null,
        ArenaNum: <fgui.GLabel>null,
        PeakArenaNum: <fgui.GLabel>null,
    }
    // private extral_mod_list: any
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.extral_mod_list = []
    }
    public SetData(data: any) {
        this._data = data;
        UH.SpriteName(this.viewNode.Icon, "Main", data.IconName);
        UH.SetText(this.viewNode.NameShow, data.NameShow);
        this.viewNode.CountMax.visible = false
        this.viewNode.GpArenaItemCount.visible = false;
        this.viewNode.ArenaNumShow.visible = false
        this.viewNode.PeakArenaNumShow.visible = false
        if (data.ModKey) {
            let mod = data.mod ?? ModManger.TabMod(data.ModKey);
            if (!this.handleCollector)
                this.handleCollector = HandleCollector.Create();
            else
                this.handleCollector.RemoveAll();
            this.addRemindCare(mod)

            if (data.ModKey == Mod.ArenaEnter.Main) {
                //物品刷新
                this.FlushAreanCountMax()
                this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushAreanCountMax.bind(this), "OtherChange")
                //属性刷新
                this.AddSmartDataCare(RoleData.Inst().BaseAttribute, this.FlushAreanCountMax.bind(this))
            }
            let open_t = FunOpen.Inst().GetFunIsOpen(data.ModKey);
            this.grayed = !open_t.is_open;
            this.viewNode.LockShow.visible = !open_t.is_open;
            if (!open_t.is_open) {
                FunOpen.Inst().RgCheckFunc(data.ModKey, this.OnFunOpenChange.bind(this));
            }
            // this.PlusExtralMod()
        }
    }
    FlushAreanCountMax() {
        let open_t = FunOpen.Inst().GetFunIsOpen(this._data.ModKey);
        if (open_t.is_open) {
            let arena_num = ArenaData.Inst().GetFightTimes();
            let peak_arena_num = Item.GetNum(CfgDFArena.df_arena_cfg[0].sarena_challenger_id)
            this.viewNode.RedPoint.visible = arena_num <= 0 && peak_arena_num <= 0;

            let peak_open_t = FunOpen.Inst().GetFunIsOpen(Mod.PeakArena.Main);
            let arena_open_t = FunOpen.Inst().GetFunIsOpen(Mod.Arena.View);

            this.viewNode.ArenaNumShow.visible = arena_num != 0 && arena_open_t.is_open
            this.viewNode.PeakArenaNumShow.visible = peak_arena_num != 0 && peak_open_t.is_open

            UH.SetText(this.viewNode.ArenaNum, arena_num);
            UH.SetText(this.viewNode.PeakArenaNum, peak_arena_num);

            // let is_max = ArenaData.Inst().IsChallengeTimeMax();
            // this.viewNode.CountMax.visible = is_max;

            // this.viewNode.GpArenaItemCount.visible = num != 0 && !is_max
            // UH.SetText(this.viewNode.ArenaItemCount, num);

        } else {
            this.viewNode.CountMax.visible = false;
            this.viewNode.GpArenaItemCount.visible = false;
            this.viewNode.RedPoint.visible = true;
            this.viewNode.ArenaNumShow.visible = false
            this.viewNode.PeakArenaNumShow.visible = false
        }
        // this.viewNode.CountMax.visible = open_t.is_open && ArenaData.Inst().IsChallengeTimeMax();
        // let open_t = FunOpen.Inst().GetFunIsOpen(this._data.ModKey);
        // if(open_t.is_open){
        // }else{
        //     this.viewNode.CountMax.visible = false
        // }
    }
    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    // private PlusExtralMod() {
    //     if (this._data.ModKey == Mod.Other.View) {
    //         this.addRemindCare(Mod.LoopMine.View)
    //         this.extral_mod_list.push(Mod.LoopMine.View)
    //     }
    // }

    private OnFunOpenChange(key: number | string, is_open: boolean) {
        this.grayed = !is_open;
        this.viewNode.LockShow.visible = !is_open;
        if (is_open) {
            FunOpen.Inst().ClearRgFunc(key);
            if (this._data.ModKey == Mod.Arena.View)
                this.FlushAreanCountMax()
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    private addRemindCare(mod: any) {
        let self = this;
        this.handleCollector.Add(RemindGroupMonitor.Create(mod, self.freshRedPoint.bind(self, mod)));
    }

    private freshRedPoint(group: any) {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
        // for (var index in this.extral_mod_list) {
        //     let r_num = RemindCtrl.Inst().GetRemindNum(Number(this.extral_mod_list[index]));
        //     let g_num = RemindCtrl.Inst().GetGroupNum(Number(this.extral_mod_list[index]));
        //     let num = (r_num + g_num) > 0 ? 1 : 0
        //     this.viewNode.RedPoint.SetNum(num);
        // }
    }

}


export class MainButtonModR extends BaseItemGB {
    private handleCollector: HandleCollector;
    protected viewNode = {
        RedPoint: <RedPoint>null,
    }
    // private extral_mod_list: any
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.extral_mod_list = []
    }
    public SetData(data: any) {
        this._data = data;
        if (data.ModKey) {
            let mod = data.mod ?? ModManger.TabMod(data.ModKey);
            if (!this.handleCollector)
                this.handleCollector = HandleCollector.Create();
            else
                this.handleCollector.RemoveAll();
            this.addRemindCare(mod)

            let open_t = FunOpen.Inst().GetFunIsOpen(data.ModKey);
            this.grayed = !open_t.is_open;
            // this.viewNode.LockShow.visible = !open_t.is_open;
            if (!open_t.is_open) {
                FunOpen.Inst().RgCheckFunc(data.ModKey, this.OnFunOpenChange.bind(this));
            }
            // this.PlusExtralMod()
        }
    }

    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    // private PlusExtralMod() {
    //     if (this._data.ModKey == Mod.Other.View) {
    //         this.addRemindCare(Mod.LoopMine.View)
    //         this.extral_mod_list.push(Mod.LoopMine.View)
    //     }
    // }

    private OnFunOpenChange(key: number | string, is_open: boolean) {
        this.grayed = !is_open;
        // this.viewNode.LockShow.visible = !is_open;
        if (is_open) {
            FunOpen.Inst().ClearRgFunc(key);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    private addRemindCare(mod: any) {
        let self = this;
        this.handleCollector.Add(RemindGroupMonitor.Create(mod, self.freshRedPoint.bind(self, mod)));
    }

    private freshRedPoint(group: any) {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
        // for (var index in this.extral_mod_list) {
        //     let r_num = RemindCtrl.Inst().GetRemindNum(Number(this.extral_mod_list[index]));
        //     let g_num = RemindCtrl.Inst().GetGroupNum(Number(this.extral_mod_list[index]));
        //     let num = (r_num + g_num) > 0 ? 1 : 0
        //     this.viewNode.RedPoint.SetNum(num);
        // }
    }

}

export class MainFlyIcon extends fgui.GComponent {
    private viewNode = {
        Icon: <fgui.GLoader>null,
        ValueCoin: <fgui.GTextField>null,
        ValueExp: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    //起始坐标 x(小浮动) 变化dis (左右，dis越短 时间越短),
    //总时间 = 
    PlayTween(type: number, value: number, x: number = 395, y: number = 170, sp_name?: string | number, icon_show = false) {
        if (icon_show) {
            UH.SetIcon(this.viewNode.Icon, sp_name, ICON_TYPE.ITEM);
        } else {
            if (type == 1 || type == 0) {
                UH.SpriteName(this.viewNode.Icon, "Main", sp_name ? `${sp_name}` : (type == 1 ? "JinBi" : "JingYan"))
            } else {
                UH.SpriteName(this.viewNode.Icon, "Main", type.toString())
            }
        }
        // let x = 395//中心坐标X
        // let y = 170//中心坐标Y 480
        let xStart = x + math.randomRange(-10, 11)//随机起始点X
        let dirs = [-1, 1]//抛出方向
        let dir = dirs[math.randomRangeInt(0, 2)]//随机方向
        let dis = math.randomRangeInt(10, 151)//随机抛出距离

        let xEnd = x + dir * dis//最终X坐标
        let yStart = y//Y起始
        let yEnd = y - 100 - math.randomRangeInt(0, 45)//Y 抛出高度
        let yEnd2 = y - math.randomRangeInt(0, 45)//掉落高度
        let time = dis / 150//过程总时间 抛出距离越大时间越长 150是最远距离
        this.viewNode.ValueExp.text = "";
        this.viewNode.ValueCoin.text = "";
        this.visible = true;
        this.viewNode.Icon.visible = true;
        fgui.GTween.to(xStart, xEnd, time)
            .setEase(fgui.EaseType.SineOut)
            .onUpdate((tweener: fgui.GTweener) => {
                this.x = tweener.value.x
            })
            .onComplete(() => {
                fgui.GTween.to(this.y, this.y, 0.2)
                    .onComplete(() => {
                        this.viewNode.Icon.visible = false
                        if (type == 1) {
                            this.viewNode.ValueCoin.text = "+" + value
                        } else {
                            this.viewNode.ValueExp.text = "+" + value
                        }
                        fgui.GTween.to(this.y, this.y - 120, 0.5)
                            .setEase(fgui.EaseType.Linear)
                            .onUpdate((tweener: fgui.GTweener) => {
                                this.y = tweener.value.x
                            })
                            .onComplete(() => {
                                this.visible = false;
                            })
                    })
            });

        fgui.GTween.to(yStart, yEnd, time * 0.3)
            .setEase(fgui.EaseType.SineOut)
            .onUpdate((tweener: fgui.GTweener) => {
                this.y = tweener.value.x

            }).onComplete(() => {
                fgui.GTween.to(yEnd, yEnd2, time * 0.7)
                    .setEase(fgui.EaseType.BounceOut)
                    .onUpdate((tweener: fgui.GTweener) => {
                        this.y = tweener.value.x
                    });
            })
    }
}

import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor, SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { AngelData } from "modules/Angel/AngelData";
import { AngelView } from "modules/Angel/AngelView";
import { EnChantData } from "modules/Enchant/EnchantData";
import { ManualData } from "modules/Manual/ManualCtrl";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { BlockData } from "modules/block/BlockData";
import { BlockEnterView } from "modules/block/BlockEnterView";
import { BlockView } from "modules/block/BlockView";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BATTLE_ATTR, IsPercent } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { RoleTitleItem1 } from "modules/common_item/RoleTitleItems";
import { ItemCellEquip } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { FashionData } from "modules/fashion/FashionData";
import { FashionView } from "modules/fashion/FashionView";
import { FishData } from "modules/fish/FishData";
import { GemAtelierData } from "modules/gem_atelier/GemAtelierData";
import { GemAtelierMainView } from "modules/gem_atelier/GemAtelierMainView";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { InscriptionData } from "modules/inscription/InscriptionData";
import { InscriptionView } from "modules/inscription/InscriptionView";
import { MountData } from "modules/mount/MountData";
import { MountMainView } from "modules/mount/MountMainView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PublicPopupData } from "modules/public_popup/PublicPopupData";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { RoleData } from "modules/role/RoleData";
import { RoleTitleView } from "modules/role/RoleTitleView";
import { BodyObjSpine } from "modules/scene_obj_spine/BodyObjSpine";
import { SceneObjSpine } from "modules/scene_obj_spine/SceneObjSpine";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ShenQiData } from "modules/shenqi/ShenQiData";
import { ShenQiEnterView } from "modules/shenqi/ShenQiEnterView";
import { ShenQiView } from "modules/shenqi/ShenQiView";
import { StarMapData } from "modules/star_map/StarMapData";
import { StarMapMainView } from "modules/star_map/StarMapMainView";
import { Timer } from "modules/time/Timer";
import { ResPath } from "utils/ResPath";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { MainAngelButton } from "./MainAngelButton";
import { MainMountButton } from "./MainMountButton";

export class MainCenter extends fgui.GComponent {
    private handleCollector: HandleCollector;
    private monster_obj: SceneObjSpine = null;
    private timer_handle_up_level: any = null;
    private timer_handle_flush_enchant: any = null;
    private openCtrler: fgui.Controller
    private timer_finger_pos: any = null;
    TwShow: fgui.GTweener = null;


    private viewNode = {
        Attrs: <fgui.GList>null,
        Attrs2: <fgui.GList>null,
        Equips1: <fgui.GList>null,
        Equips2: <fgui.GList>null,
        BtnAngel: <MainAngelButton>null,
        BtnMount: <MainMountButton>null,
        BtnArrow: <fgui.GButton>null,
        BtnAttr: <fgui.GButton>null,
        BtnGem: <fgui.GButton>null,
        uiModelShow: <UIModelShow>null,
        TitleShow: <RoleTitleItem1>null,
        LevelUpEffect: <UIEffectShow>null,
        RedPointTitle: <RedPoint>null,
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
        Timer.Inst().CancelTimer(this.timer_handle_up_level)
        Timer.Inst().CancelTimer(this.timer_handle_flush_enchant)
        this.monster_obj.Destory();
        EventCtrl.Inst().off(CommonEvent.NET_SWITCH, this.checkFunOpen, this)
        Timer.Inst().CancelTimer(this.timer_finger_pos);
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        let handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    public InitData() {
        this.openCtrler = this.getController("Open");

        this.addSmartDataCare(RoleData.Inst().BaseAttribute, this.FlushAttrShow.bind(this));
        this.addSmartDataCare(BagData.Inst().EquipmentData, this.FlushEquip1Show.bind(this));
        this.addSmartDataCare(EnChantData.Inst().ResultData, this.FlushEquip1Show.bind(this), "ChantOneInfo");
        this.addSmartDataCare(EnChantData.Inst().ResultData, this.FlushEnchantView.bind(this), "ChantOneInfo");
        this.addSmartDataCare(RoleData.Inst().ResultData, this.FulshTitleShow.bind(this), "roleinfo");
        this.addSmartDataCare(RoleData.Inst().ResultData, this.LevelUpShow.bind(this), "roleLevel");
        this.addSmartDataCare(ManualData.Inst().result_data, this.FulshTitleShow.bind(this), "info");
        this.addSmartDataCare(MountData.Inst().flush_info, this.FlushMountShow.bind(this), "needflush");
        this.addSmartDataCare(AngelData.Inst().result_info, this.FlushAngelShow.bind(this), "is_change");
        this.addSmartDataCare(RoleData.Inst().ResultData, this.onRoleAppearance.bind(this), "appearance");
        this.addSmartDataCare(RoleData.Inst().TitleRedInfo, this.FlushTitleRedPoint.bind(this));
        this.addSmartDataCare(PublicPopupData.Inst().MainFlushData, this.FlushMainOpen.bind(this), "MainOpen");
        this.addSmartDataCare(PublicPopupData.Inst().MainFlushData, this.FlushAttrEffectShow.bind(this), "AttrShow");

        // this.viewNode.BtnBoxAuto.onClick(this.OnClickBoxAuto, this);
        // this.viewNode.BtnBoxUp.onClick(this.OnClickBoxUp, this);
        this.viewNode.BtnAngel.onClick(this.onClickAngel.bind(this));
        this.viewNode.BtnMount.onClick(this.onClickMount.bind(this));
        this.viewNode.BtnAttr.onClick(this.OnClickAttr, this);
        this.viewNode.TitleShow.onClick(this.OnClickTitle, this);
        this.viewNode.BtnGem.onClick(this.OnClickGem, this);
        this.viewNode.BtnArrow.onClick(this.OnClickArrow, this);

        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().ResultData, this.FlushEquip2Show.bind(this), "roleLevel"));

        // GuideCtrl.Inst().AddGuideUi("BtnAngel", this.viewNode.BtnAngel);

        this.InitView();

        // GuideCtrl.Inst().AddGuideUi("MainCenterMount", this.viewNode.BtnMount);
        GuideCtrl.Inst().AddGuideUi("MainCenterBaoShi", this.viewNode.BtnGem);
        EventCtrl.Inst().on(CommonEvent.NET_SWITCH, this.checkFunOpen, this);
        this.checkFunOpen();

    }

    private checkFunOpen() {
        let open_t1 = FunOpen.Inst().GetFunIsOpen(Mod.Angel.View);
        if (!open_t1.is_open) {
            FunOpen.Inst().RgCheckFunc(Mod.Angel.View, this.FlushAngelShow.bind(this))
        }
        let open_t2 = FunOpen.Inst().GetFunIsOpen(Mod.GemAtelier.View);
        if (!open_t2.is_open) {
            FunOpen.Inst().RgCheckFunc(Mod.GemAtelier.View, this.FlushGemShow.bind(this))
        }
        let open_t3 = FunOpen.Inst().GetFunIsOpen(Mod.Skill.View);
        if (!open_t3.is_open) {
            FunOpen.Inst().RgCheckFunc(Mod.Skill.View, this.FlushEquip2Show.bind(this))
        }
        // this.viewNode.BtnAngel.InitData();
        // this.viewNode.BtnMount.InitData();
    }

    private InitView() {
        this.FlushAttrShow();
        this.FlushEquip1Show();
        this.FlushEquip2Show();
        this.FulshTitleShow();
        this.FlushAngelShow();
        this.FlushGemShow();
        this.FlushMountShow()
        this.FlushTitleRedPoint()
        this.FlushEnchantView()
        this.FlushMainOpen()

        let appear = RoleData.Inst().GetAppearanceRes(true)
        let isMont = BodyObjSpine.Check_Mont(appear.surfaceMount)
        if (isMont) {
            this.viewNode.uiModelShow.y = 350
        }
        this.viewNode.uiModelShow.setPath(ResPath.ActorRole(10001), appear);

        this.addSmartDataCare(FashionData.Inst().FlushData, this.FlushEquip2Show.bind(this), "flush_single", "flush_all")
        this.addSmartDataCare(StarMapData.Inst().flush_info, this.FlushEquip2Show.bind(this), "needflush")
        this.addSmartDataCare(GemAtelierData.Inst().flush_info, this.FlushEquip2Show.bind(this), "needflush")
        this.addSmartDataCare(InscriptionData.Inst().flush_info, this.FlushEquip2Show.bind(this), "flushneed")
        this.addSmartDataCare(ShenQiData.Inst().ResultData, this.FlushEquip2Show.bind(this), "OtherInfo")
        this.addSmartDataCare(BlockData.Inst().FlushData, this.FlushEquip2Show.bind(this), "FlushInfoMapWear")
        this.addSmartDataCare(MountData.Inst().flush_info, this.FlushEquip2Show.bind(this), "needflush");
        this.addSmartDataCare(AngelData.Inst().result_info, this.FlushEquip2Show.bind(this), "is_change");
        this.viewNode.Equips2._container.addComponent(CocHighPerfList)
        this.viewNode.Equips1._container.addComponent(CocHighPerfList)
        this.viewNode.Attrs._container.addComponent(CocHighPerfList)

    }

    private setListData(list: any, data: any[]) {
        if (!list) {
            return;
        }

        data = data || [];

        if (typeof list.SetData === "function") {
            list.SetData(data);
            return;
        }

        if ("itemRenderer" in list && "numItems" in list) {
            const setDataEvent = (fgui.Event as any).SETDATA;
            list.itemRenderer = (index: number, item: any) => {
                if (item && typeof item.SetData === "function") {
                    item.SetData(data[index]);
                }
            };
            list.numItems = data.length;
            if (setDataEvent) {
                list.node?.emit?.(setDataEvent);
            }
            return;
        }

        if ("numItems" in list) {
            try {
                list.numItems = data.length;
            } catch (e) {
            }
        }

        for (let i = 0; i < data.length; i++) {
            const item = list.getChildAt ? list.getChildAt(i) : null;
            if (item && typeof item.SetData === "function") {
                item.SetData(data[i]);
            }
        }
    }

    private FlushAttrShow() {
        let attrs1: any = [];
        let attrs2: any = [];
        attrs1.push({ attrType: BATTLE_ATTR.SPEED, attrValue: RoleData.Inst().GetAttributeData(BATTLE_ATTR.SPEED) });
        attrs1.push({ attrType: BATTLE_ATTR.HP, attrValue: RoleData.Inst().GetAttributeData(BATTLE_ATTR.HP) });
        attrs1.push({ attrType: BATTLE_ATTR.ATTACK, attrValue: RoleData.Inst().GetAttributeData(BATTLE_ATTR.ATTACK) });
        attrs1.push({ attrType: BATTLE_ATTR.ARMOR, attrValue: RoleData.Inst().GetAttributeData(BATTLE_ATTR.ARMOR) });
        for (let i = BATTLE_ATTR.VAMPIRIC; i <= BATTLE_ATTR.STUN_IMMUNITY; i++) {
            attrs2.push({ attrType: i, attrValue: RoleData.Inst().GetAttributeData(i) });

        }
        this.setListData(this.viewNode.Attrs, attrs1);
        this.setListData(this.viewNode.Attrs2, attrs2);
    }

    private FlushMainOpen() {
        this.openCtrler.selectedIndex = PublicPopupData.Inst().MainViewOpen ? 1 : 0
    }

    public FlushAttrEffectShow() {
        let cur_index = 0
        let show: Function
        show = () => {
            this.TwShow = fgui.GTween.delayedCall(0.05).onComplete(() => {
                cur_index++
                if (cur_index < 7) {
                    for (let index = 0; index < 4; index++) {
                        let item = <MainAttrItem3>this.viewNode.Attrs.getChildAt(index)
                        if (item) {

                            item.EffectShow(true, cur_index)
                        }
                    }
                    show()
                } else if (cur_index < 14) {
                    for (let index = 0; index < 4; index++) {
                        let item = <MainAttrItem3>this.viewNode.Attrs.getChildAt(index)
                        if (item) {
                            item.EffectShow(true, cur_index, true)
                        }
                    }
                    show()
                } else {
                    for (let index = 0; index < 4; index++) {
                        let item = <MainAttrItem3>this.viewNode.Attrs.getChildAt(index)
                        if (item) {
                            item.EffectShow(false)
                        }
                    }
                }
            })
        }
        show();
    }

    private OnClickArrow() {
        PublicPopupData.Inst().MainViewOpen = !PublicPopupData.Inst().MainViewOpen

        Timer.Inst().CancelTimer(this.timer_finger_pos);
        this.timer_finger_pos = Timer.Inst().AddRunTimer(() => {
            GuideCtrl.Inst().FingerPosRefresh()
        }, 0.2, 1, false)
    }

    private onClickAngel() {
        // ViewManager.Inst().OpenView(AngelInfoView);
        ViewManager.Inst().OpenViewByKey(Mod.Angel.View);
    }

    private onClickMount() {
        // if (!MountData.Inst().GetWithRideOn()) {
        //     ViewManager.Inst().OpenView(MountMainView);
        // } else {
        //     ViewManager.Inst().OpenView(MountEnterView);
        // }
        ViewManager.Inst().OpenView(MountMainView);
    }

    private equip_list_data: IPB_EquipData[];
    private FlushEquip1Show() {

        let equip_list_data: IPB_EquipData[] = BagData.Inst().GetEquipmentItemList();
        let is_first = true
        if (this.equip_list_data) {
            for (let i = 0; i < equip_list_data.length; i++) {
                let equip = equip_list_data[i];
                // if (equip_list_data[i]) {
                if (equip == undefined ||
                    !this.equip_list_data[i] ||
                    this.equip_list_data[i].itemId != equip.itemId ||
                    EnChantData.Inst().ChangeEqipType == equip.equipType
                ) {
                    if (is_first && equip != undefined) {
                        GuideCtrl.Inst().AddGuideUi("MainEnchantEquip", (<ItemCellEquip>this.viewNode.Equips1.getChildAt(i)).viewNode.ItemCell);
                        is_first = false
                    }

                    (<ItemCellEquip>this.viewNode.Equips1.getChildAt(i)).SetData(equip_list_data[i]);
                }
                // }
            }
        } else {
            this.setListData(this.viewNode.Equips1, BagData.Inst().GetEquipmentItemList());
        }
        this.equip_list_data = equip_list_data;
    }

    private FlushEquip2Show() {
        let list2: any = []

        list2[0] = { index: 3, icon_package: "Main", icon_name: "ShiZhuang", name: Language.Fashion.MainTitle, notOpen: false, mod: Mod.Fashion.View }
        list2[1] = { index: 1, icon_package: "Main", icon_name: "ZuoQi", name: Language.Mount.MainTitle, notOpen: false, mod: Mod.Mount.View }
        list2[3] = { index: 2, icon_package: "Main", icon_name: "FaZhen", name: Language.Angel.MainTitle, notOpen: false, mod: Mod.Angel.View }
        list2[2] = { index: 0, icon_package: "Main", icon_name: "JiMu", name: Language.Block.MainTitle, notOpen: false, mod: Mod.Block.View }
        list2[4] = { index: 4, icon_package: "Main", icon_name: "ShenQi", name: Language.ShenQi.MainTitle, notOpen: false, mod: Mod.ShenQi.Main }
        list2[5] = { index: 5, icon_package: "Main", icon_name: "MingWen", name: Language.Inscription.MainTitle, notOpen: false, mod: Mod.Inscription.Main }
        list2[6] = { index: 6, icon_package: "Main", icon_name: "XingTu", name: Language.StarMap.MainTitle, notOpen: false, mod: Mod.StarMap.View }
        list2[7] = { index: 7, icon_package: "Main", icon_name: "XingTu", name: Language.Skill.MainTitle, notOpen: false, mod: Mod.Skill.View }
        this.setListData(this.viewNode.Equips2, list2);
        this.viewNode.Equips2.on(fgui.Event.CLICK_ITEM, this.OnEquip2, this);
    }

    public FulshTitleShow() {
        this.viewNode.TitleShow.SetData({ title: RoleData.Inst().GetTitleId(), level: ManualData.Inst().GetLevel() })
        this.FlushTitleRedPoint()
    }

    public FlushTitleRedPoint() {
        let rp = 0
        let tri = RoleData.Inst().TitleRedInfo;
        if (tri.size) {
            for (let value of tri.values()) {
                if (value > 0) {
                    rp = 1;
                    break;
                }
            }
        }
        this.viewNode.RedPointTitle.SetNum(rp)
    }

    private OnEquip2(item: MainExtraEnter) {
        let open_t
        switch (item.GetData().index) {
            case 0:
                if (BlockData.Inst().InfoMapId > 0) {
                    ViewManager.Inst().OpenView(BlockEnterView);
                } else {
                    ViewManager.Inst().OpenView(BlockView);
                }
                break;
            case 1:
                // ViewManager.Inst().OpenView(FishView);
                ViewManager.Inst().OpenView(MountMainView);
                break;
            case 2:
                // ViewManager.Inst().OpenView(FishView);
                ViewManager.Inst().OpenView(AngelView);
                break;
            case 3:
                // ViewManager.Inst().OpenView(FishView);
                ViewManager.Inst().OpenView(FashionView);
                break;
            case 4:
                open_t = FunOpen.Inst().GetFunIsOpen(Mod.ShenQi.Main);
                if (!open_t.is_open) {
                    PublicPopupCtrl.Inst().Center(open_t.content);
                    return;
                }
                let other_info = ShenQiData.Inst().ResultData.OtherInfo
                if (-1 == other_info.wearingId) {
                    ViewManager.Inst().OpenView(ShenQiView);
                } else {
                    ViewManager.Inst().OpenView(ShenQiEnterView);
                }
                break;
            case 5:
                ViewManager.Inst().OpenView(InscriptionView);
                break;
            case 6:
                ViewManager.Inst().OpenView(StarMapMainView);
                // ViewManager.Inst().OpenView(SuperStarMapView);
                break;
            case 7:
                open_t = FunOpen.Inst().GetFunIsOpen(Mod.Skill.View)
                if (!open_t.is_open) {
                    PublicPopupCtrl.Inst().Center(open_t.content);
                    return;
                }
                ViewManager.Inst().OpenViewByKey(Mod.Skill.View);
                break;
            default:
                PublicPopupCtrl.Inst().Center(Language.Common.NotOpenTips);
        }
    }

    private OnClickAttr() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: RoleData.Inst().GetAllAttributeDataShow(),
        })
    }

    private OnClickTitle() {
        ViewManager.Inst().OpenView(RoleTitleView);
    }

    private OnClickBlock() {
        if (BlockData.Inst().InfoMapId > 0) {
            ViewManager.Inst().OpenView(BlockEnterView);
        } else {
            ViewManager.Inst().OpenView(BlockView);
        }
    }

    private OnClickGem() {
        ViewManager.Inst().OpenView(GemAtelierMainView);
    }

    private FlushMountShow() {
        this.viewNode.BtnMount.FlushData();
    }

    private FlushAngelShow() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Angel.View);
        if (!open_t.is_open) {
            this.viewNode.BtnAngel.SetData(-1)
            return;
        }
        FunOpen.Inst().ClearRgFunc(Mod.Angel.View)
        if (AngelData.Inst().result_info.angel_info) {
            AngelData.Inst().checkResActive();
            this.viewNode.BtnAngel.SetData(AngelData.Inst().result_info.angel_info.useAppearance)
        }
    }

    private FlushGemShow() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.GemAtelier.View);
        this.viewNode.BtnGem.visible = open_t.is_open
        if (open_t.is_open) {
            FunOpen.Inst().ClearRgFunc(Mod.GemAtelier.View)
        }
    }

    private LevelUpShow() {
        Timer.Inst().CancelTimer(this.timer_handle_up_level)
        this.timer_handle_up_level = Timer.Inst().AddRunFrameTimer(() => {
            AudioManager.Inst().Play(AudioTag.ShengJi);
        }, 1, 1, false)
        // this.viewNode.LevelUpEffect.PlayEff(4164023);
        // ViewManager.Inst().OpenView(LevelUpView)
    }
    private onRoleAppearance() {
        let appear = RoleData.Inst().GetAppearanceRes(true)
        let isMont = BodyObjSpine.Check_Mont(appear.surfaceMount)
        if (isMont) {
            this.viewNode.uiModelShow.y = 350
        }
        this.viewNode.uiModelShow.setAppearance(appear)
    }

    private FlushEnchantView() {
        let next_flush_time = EnChantData.Inst().GetShortTime() + 1
        if (next_flush_time > 1) {
            Timer.Inst().CancelTimer(this.timer_handle_flush_enchant)
            this.timer_handle_flush_enchant = Timer.Inst().AddRunTimer(() => {
                this.FlushEquip1Show();
            }, next_flush_time, 1, false)
        } else {
            Timer.Inst().CancelTimer(this.timer_handle_flush_enchant)
        }
    }
}

export class MainAttrItem1 extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType]);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue));
    }
}

export class MainAttrItem2 extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        this.width = data.attrType < BATTLE_ATTR.VAMPIRIC_IMMUNITY ? 183 : 203
        UH.SetText(this.viewNode.AttrName, `${AttrListName[data.attrType]}:`);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, (IsPercent[data.attrType] ? (Math.ceil(data.attrValue / 100)) * 100 : data.attrValue)));
    }
}

export class MainAttrItem3 extends BaseItem {
    TwShow: fgui.GTweener = null;
    private preValue: number

    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
        ArrowShow: <fgui.GLoader>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        this.viewNode.ArrowShow.visible = false
        this.preValue = this._data ? this._data.attrValue : 0
        super.SetData(data)
        UH.SetText(this.viewNode.AttrName, `${AttrListName[data.attrType]}:`);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue));
        UH.SpriteName(this.viewNode.ArrowShow, "CommonAtlas", +data.attrValue > +this.preValue ? "JianTouLv" : "JianTouHong2")
    }

    public PreValue() {
        return +this.preValue
    }

    public PerValue() {
        return Math.floor((+this._data.attrValue - +this.preValue) / 7)
    }

    public EffectShow(is_show: boolean, cur_index?: number, end_show: boolean = false) {
        this.viewNode.ArrowShow.visible = is_show && (this._data.attrValue != this.PreValue())
        if (!is_show || end_show) {
            UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(this._data.attrType, this._data.attrValue));
        } else {
            UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(this._data.attrType, this.PreValue() + cur_index * this.PerValue()));
        }
    }
}

export class MainExtraEnter extends BaseItemGB {
    private handleCollector: HandleCollector;
    protected viewNode = {
        Icon: <fgui.GLoader>null,
        Name: <fgui.GLabel>null,
        NotOpen: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
        QuaIcon: <fgui.GLoader>null,
    };
    public SetData(data: any) {
        super.SetData(data)
        let isEmpty = IsEmpty(data) || data.notOpen

        if (isEmpty) {
            UH.SetText(this.viewNode.Name, "")
        }
        else {
            UH.SetText(this.viewNode.Name, data.name)
        }
        this.viewNode.NotOpen.visible = isEmpty
        this.viewNode.Icon.visible = !isEmpty
        let level = 0
        switch (data.name) {
            case Language.Fashion.MainTitle:
                level = FashionData.Inst().GetMaxQua();
                break;
            case Language.Block.MainTitle:
                level = BlockData.Inst().GetBlockMaxColor()
                break;
            case Language.StarMap.MainTitle:
                level = StarMapData.Inst().GetMaxLevel()
                break;
            case Language.Fish.MainTitle:
                level = FishData.Inst().GetWabaoBoxMaxColor()
                break;
            case Language.Inscription.MainTitle:
                level = InscriptionData.Inst().GetMaxColor()
            case Language.ShenQi.MainTitle:
                level = ShenQiData.Inst().GetMaxColor()
                break;
        }
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", "PinZhi" + level)
        this.InitGuide()

        if (data.mod != null) {
            if (this.handleCollector) {
                this.handleCollector.RemoveAll()
            } else {
                this.handleCollector = HandleCollector.Create();
            }
            let group = ModManger.TabMod(data.mod);
            // if (Mod.Fish.View == data.mod) {
            //     group = ModManger.TabMod(Mod.FishBox.Main);
            // }
            if (Mod.Angel.View == data.mod) {
                group = Mod.Angel;
            }
            this.handleCollector.Add(RemindGroupMonitor.Create(group, this.freshRedPoint.bind(this, group)))
        }
        if (data.mod != null) {
            this.OnFunOpenChange(data.mod, FunOpen.Inst().GetFunIsOpen(data.mod).is_open)
            FunOpen.Inst().RgCheckFunc2(data.mod, this.OnFunOpenChange.bind(this))
        } else if (!isEmpty) {
            UH.SpriteName(this.viewNode.Icon, data.icon_package, data.icon_name)
            this.viewNode.QuaIcon.visible = false
            this.viewNode.Name.visible = true
        }
    }
    OnFunOpenChange(key: number | string, is_open: boolean) {
        if (key == this._data.mod) {
            UH.SpriteName(this.viewNode.Icon, this._data.icon_package, is_open ? this._data.icon_name : `${this._data.icon_name}1`);
            this.viewNode.QuaIcon.visible = false
            this.viewNode.Name.visible = is_open
            // this.viewNode.Icon.grayed = !is_open
            // this.viewNode.QuaIcon.grayed = !is_open
        }
        if (is_open) {
            FunOpen.Inst().ClearRgFunc2(key)
        }
    }

    public freshRedPoint(group: any) {
        let red_num = 0
        if (Mod.Mount.View == group.modkey) {
            red_num = (MountData.Inst().GetRedNum() + MountData.Inst().GetAngelResAllRed() + MountData.Inst().GetEquipRed()) > 0 ? 1 : 0
        } else {
            red_num = RemindCtrl.Inst().GetGroupNum(group)
        }
        this.viewNode.RedPoint.SetNum(red_num);
    }

    public InitGuide() {
        if (this._data.name == Language.GemAtelier.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("MainCenterBaoShi", this);
        }
        else if (this._data.name == Language.StarMap.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("MainCenterStarMap", this);
        }
        else if (this._data.name == Language.Inscription.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("MainCenterInscription", this);
        }
        else if (this._data.name == Language.ShenQi.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("MainCenterShenQi", this);
        }
        else if (this._data.name == Language.Block.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("MainCenterBlock", this);
        }
        else if (this._data.name == Language.Angel.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("BtnAngel", this);
        }
        else if (this._data.name == Language.Mount.MainTitle) {
            GuideCtrl.Inst().AddGuideUi("MainCenterMount", this);
        }
    }
    protected onDestroy(): void {
        if (this._data.name == Language.GemAtelier.MainTitle) {
            GuideCtrl.Inst().ClearGuideUi("MainCenterBaoShi");
        }
        else if (this._data.name == Language.StarMap.MainTitle) {
            GuideCtrl.Inst().ClearGuideUi("MainCenterStarMap");
        }
        else if (this._data.name == Language.Inscription.MainTitle) {
            GuideCtrl.Inst().ClearGuideUi("MainCenterInscription");
        }
        else if (this._data.name == Language.ShenQi.MainTitle) {
            GuideCtrl.Inst().ClearGuideUi("MainCenterShenQi");
        }
        else if (this._data.name == Language.Block.MainTitle) {
            GuideCtrl.Inst().ClearGuideUi("MainCenterBlock");
        }
        super.onDestroy();
    }
}
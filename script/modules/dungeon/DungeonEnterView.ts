import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { PetGuardView } from "modules/PetGuard/PetGuardView";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { ChiefDungeonView } from "modules/dungeon/ChiefDungeonView";
import { EscortView } from "modules/escort/EscortView";
import { RedPoint } from "modules/extends/RedPoint";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { InscriptionTowerView } from "modules/inscription/InscriptionTowerView";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { GuMoView } from "modules/trial/GuMoView";
import { TrialView } from "modules/trial/TrialView";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";
import { UH } from "../../helpers/UIHelper";
import { DungeonConfigEnterBgName } from "./DungeonConfig";

@BaseView.registView
export class DungeonEnterView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Dungeon",
        ViewName: "DungeonEnter",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "DungeonEnterCell", ExtendsClass: DungeonEnterCell },

    ];

    protected EnterCfg = [
        { Title: Language.Dungeon.EnterNames[0], OpenView: ChiefDungeonView, IconPic: "YeWaiShouLing", fb_type: 1, mod_key: Mod.Chief.View, isRemind: true },
        { Title: Language.Dungeon.EnterNames[2], OpenView: EscortView, IconPic: "HuSongTuBiao", fb_type: 3, mod_key: Mod.Escort.View, isRemind: true },
        { Title: Language.Dungeon.EnterNames[1], OpenView: TrialView, IconPic: "ShiLianZhiTa", fb_type: 2, mod_key: Mod.Trial.TrialTower },
        { Title: Language.Dungeon.EnterNames[6], OpenView: PetGuardView, IconPic: "ChongWuShouHu", fb_type: 1, mod_key: Mod.PetGuard.Main, isRemind: true },
        { Title: Language.Dungeon.EnterNames[4], OpenView: InscriptionTowerView, IconPic: "MingWenZhiTa", fb_type: 5, mod_key: Mod.InscriptionTower.Main, isRemind: true },
        { Title: Language.Dungeon.EnterNames[3], OpenView: GuMoView, IconPic: "GuMoZhiTa", fb_type: 4, mod_key: Mod.GuMo.View, isRemind: true },
    ];

    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        EnterList: <fgui.GList>null,
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    InitData() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));

        this.viewNode.EnterList.itemRenderer = this.onRenderEnterItem.bind(this);
        this.viewNode.EnterList.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this);
        this.viewNode.EnterList.numItems = this.EnterCfg.length;
        // UH.SetText(self.viewNode.Desc, self.init_data.desc)
        this.viewNode.EnterList._container.addComponent(CocHighPerfList)


    }

    InitUI() {
        let guide_cfg = GuideCtrl.Inst().CurStepCfg();
        if (guide_cfg && guide_cfg.step_param_1 == "DungeonEnterBtnPetGuard") {
            this.viewNode.EnterList.scrollToView(5)
        }
    }

    CloseCallBack() {

    }

    private OnClickItem(item: DungeonEnterCell) {
        item.OnClickItem();
    }

    private onRenderEnterItem(index: number, item: DungeonEnterCell) {
        item.SetData(this.EnterCfg[index]);
    }

    private CloseView() {
        ViewManager.Inst().CloseView(DungeonEnterView)
    }
}

// DungeonEnterCell
export class DungeonEnterCell extends fgui.GComponent {
    private viewNode = {
        BgSp: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        Name: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.viewNode.BtnUp.onClick(this.OnClickUp, this);
        // this.viewNode.BtnAdd.onClick(this.OnClickAdd, this);
    }
    private handleCollector: HandleCollector;

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SpriteName(this.viewNode.BgSp, "Dungeon", DungeonConfigEnterBgName[data.fb_type]);
        UH.SetText(this.viewNode.Name, data.Title);
        UH.SpriteName(this.viewNode.Icon, "Dungeon", data.IconPic);

        if (data.mod_key) {
            let is_open = FunOpen.Inst().GetFunIsOpen(data.mod_key).is_open;
            this.grayed = !is_open;
            if (!is_open) {
                FunOpen.Inst().RgCheckFunc(data.mod_key, this.OnFunOpenChange.bind(this))
            }
            if (data.isRemind) {
                let group = ModManger.TabMod(data.mod_key);
                this.handleCollector = HandleCollector.Create();
                this.handleCollector.Add(RemindGroupMonitor.Create(group, this.freshRedPoint.bind(this, group)));
            }
        }
        this.StartGuide()
    }

    private StartGuide() {
        if (this.data.Title == Language.Dungeon.EnterNames[0]) {
            GuideCtrl.Inst().AddGuideUi("DungeonEnterBtnDungeon", this);
        }
        if (this.data.Title == Language.Dungeon.EnterNames[1]) {
            GuideCtrl.Inst().AddGuideUi("DungeonEnterBtnTrial", this);
        }
        if (this.data.Title == Language.Dungeon.EnterNames[2]) {
            GuideCtrl.Inst().AddGuideUi("EscortMainBtn", this);
        }
        if (this.data.Title == Language.Dungeon.EnterNames[3]) {
            GuideCtrl.Inst().AddGuideUi("DungeonEnterBtnGuMo", this);
        }
        if (this.data.Title == Language.Dungeon.EnterNames[4]) {
            GuideCtrl.Inst().AddGuideUi("DungeonEnterBtnInscriptionTower", this);
        }
        if (this.data.Title == Language.Dungeon.EnterNames[6]) {
            GuideCtrl.Inst().AddGuideUi("DungeonEnterBtnPetGuard", this);
        }
    }

    private freshRedPoint(group: any) {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
    }

    OnFunOpenChange(key: number | string, is_open: boolean) {
        this.grayed = !is_open
        if (is_open) {
            FunOpen.Inst().ClearRgFunc(key)
        }
    }

    public OnClickItem() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        if (this.data.OpenView != undefined) {
            ViewManager.Inst().OpenView(this.data.OpenView)
            // if (this.data.fb_type == 1 ) {
            //     DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Info,1)
            //     DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Info,2)
            //     DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Info,3)
            // }
        }

        ViewManager.Inst().CloseView(DungeonEnterView)
    }

    onDestroy() {
        if (this.data.Title == Language.Dungeon.EnterNames[0]) {
            GuideCtrl.Inst().ClearGuideUi("DungeonEnterBtnDungeon");
        }
        if (this.data.Title == Language.Dungeon.EnterNames[1]) {
            GuideCtrl.Inst().ClearGuideUi("DungeonEnterBtnTrial");
        }
        if (this.data.Title == Language.Dungeon.EnterNames[2]) {
            GuideCtrl.Inst().ClearGuideUi("EscortMainBtn");
        }
        if (this.data.Title == Language.Dungeon.EnterNames[3]) {
            GuideCtrl.Inst().ClearGuideUi("DungeonEnterBtnGuMo");
        }
        if (this.data.Title == Language.Dungeon.EnterNames[6]) {
            GuideCtrl.Inst().ClearGuideUi("DungeonEnterBtnPetGuard");
        }
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        if (this.data) {
            FunOpen.Inst().ClearRgFunc(this.data.mod_key);
        }
    }
}
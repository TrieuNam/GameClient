import { LogError } from "core/Debugger";
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { DataHelper } from "../../helpers/DataHelper";
import { ChiefDungeonView } from "modules/dungeon/ChiefDungeonView";
import { DungeonCtrl, LINGZHU_OP_TYPE } from "modules/dungeon/DungeonCtrl";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { EscortView } from "modules/escort/EscortView";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { FunOpen } from "modules/guide/FunOpen";
import { RedPoint } from "modules/extends/RedPoint";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import { ModManger } from "manager/ModManger";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { ArenaView } from "modules/Arena/ArenaView";
import { ArenaConfigEnterBgName, ArenaConfigEnterNumBgName } from "./PeakArenaConfig";
import { PeakArenaView } from "./PeakArenaView";
import { ArenaRankView } from "modules/Arena/ArenaRankView";
import { PeakArenaRankView } from "./PeakArenaRankView";
import { CfgDFArena } from "config/CfgDFArena";
import { CfgArenaData } from "config/CfgArena";
import { Item } from "modules/bag/ItemData";

@BaseView.registView
export class ArenaEnterView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ArenaExtra",
        ViewName: "ArenaEnter",
        RelyOnPack: ["Dungeon"],
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BlockClose
    };

    protected extendsCfg = [
        { ResName: "ArenaEnterCell", ExtendsClass: ArenaEnterCell },
    ];

    protected EnterCfg = [
        {
            Title: Language.PeakArena.EnterName[0], OpenView: ArenaRankView, IconPic: "JingJiChang",
            fb_type: 1, mod_key: Mod.Arena.View, isRemind: true, timesItem: CfgArenaData.arena_cfg[0].arena_challenge_id
        },
        {
            Title: Language.PeakArena.EnterName[1], OpenView: PeakArenaRankView, IconPic: "DianFengJingJiChang",
            fb_type: 2, mod_key: Mod.PeakArena.Main, isRemind: true, timesItem: CfgDFArena.df_arena_cfg[0].sarena_challenger_id
        },
    ];

    protected viewNode = {
        Btn1: <ArenaEnterCell>null,
        Btn2: <ArenaEnterCell>null,
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    InitData() {
        this.viewNode.Btn1.onClick(this.OnClickItem.bind(this, this.viewNode.Btn1))
        this.viewNode.Btn2.onClick(this.OnClickItem.bind(this, this.viewNode.Btn2))
        this.viewNode.Btn1.SetData(this.EnterCfg[0])
        this.viewNode.Btn2.SetData(this.EnterCfg[1])
        // this.viewNode.EnterList.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this);
        // this.viewNode.EnterList.SetData(this.EnterCfg)
    }
    InitUI() {
    }

    CloseCallBack() {
    }

    private OnClickItem(item: ArenaEnterCell) {
        item.OnClickItem();
    }

    private CloseView() {
        ViewManager.Inst().CloseView(ArenaEnterView)
    }
}

// ArenaEnterCell
export class ArenaEnterCell extends fgui.GComponent {
    private viewNode = {
        BgSp: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        Name: <fgui.GLabel>null,
        RedPoint: <RedPoint>null,

        TimeShow: <fgui.GGroup>null,
        TimeIcon: <fgui.GLoader>null,
        TimeStr: <fgui.GLabel>null,
    }

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private handleCollector: HandleCollector;

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SpriteName(this.viewNode.BgSp, "ArenaExtra", ArenaConfigEnterBgName[data.fb_type]);
        UH.SpriteName(this.viewNode.TimeIcon, "ArenaExtra", ArenaConfigEnterNumBgName[data.fb_type]);
        UH.SetText(this.viewNode.Name, data.Title);
        UH.SpriteName(this.viewNode.Icon, "ArenaExtra", data.IconPic);

        let is_open = true
        if (data.mod_key) {
            is_open = FunOpen.Inst().GetFunIsOpen(data.mod_key).is_open;
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

        let num = Item.GetNum(data.timesItem)
        this.viewNode.TimeShow.visible = num > 0 && is_open
        UH.SetText(this.viewNode.TimeStr, num);

        if (data.mod_key == Mod.PeakArena.Main) {
            GuideCtrl.Inst().AddGuideUi("PeakArenaRankView", this);
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
        }

        ViewManager.Inst().CloseView(ArenaEnterView)
    }

    onDestroy() {
        if (this.data.mod_key == Mod.PeakArena.Main) {
            GuideCtrl.Inst().ClearGuideUi("PeakArenaRankView");
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
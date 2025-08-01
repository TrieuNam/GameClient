import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { ViewManager } from "manager/ViewManager";
import { AngelData } from "./AngelData";
import { BagData } from "modules/bag/BagData";
import { AngelResCell, HuanHuaAttCell, HuanHuaComp } from "./HuanHuaComp";
import { AngelAttCell, AngelHolAttireItem, AngelProCell, AngelUpComp, BaoJiComp } from "./AngelUpComp";
import { Language } from "modules/common/Language";
import { HelpView } from "modules/common_help/CommonHelpView";
import { Mod } from "modules/common/ModuleDefine";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { AngelBtnFes, AngelFesView } from "modules/AngelFes/AngelFesView";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { FunOpen } from "modules/guide/FunOpen";
import { AngelFesData } from "modules/AngelFes/AngelFesCtrl";
import { LogError } from "core/Debugger";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoardCC } from "modules/common_board/CommonBoardCC";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";

@BaseView.registView
export class AngelView extends BaseView {
    select_index = 0;
    HuanHuaBg: fgui.GImage;
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.Angel.Angel, index: 0, modKey: Mod.Angel.Up, isRemind: true },
        { panel: null, viewName: "", titleName: Language.Angel.HuanHua, index: 1, modKey: Mod.Angel.Res, isRemind: true }
    ]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Angel",
        ViewName: "AngelView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        AngelUpComp: <AngelUpComp>null,
        HuanHuaComp: <HuanHuaComp>null,
        ListTab: <fgui.GList>null,
        BtnFes: <fgui.GButton>null,
        Board: <CommonBoardCC>null,
        HuanHuaBg: <fgui.GImage>null,
    }

    protected extendsCfg = [
        { ResName: "AngelUpComp", ExtendsClass: AngelUpComp },
        { ResName: "HuanHuaAttCell", ExtendsClass: HuanHuaAttCell },
        { ResName: "AngelResCell", ExtendsClass: AngelResCell },
        { ResName: "HuanHuaComp", ExtendsClass: HuanHuaComp },
        { ResName: "AngelAttCell", ExtendsClass: AngelAttCell },
        { ResName: "ProCell", ExtendsClass: AngelProCell },
        { ResName: "AngelHolAttireItem", ExtendsClass: AngelHolAttireItem },
        { ResName: "BtnFes", ExtendsClass: AngelBtnFes },
        { ResName: "BaoJiComp", ExtendsClass: BaoJiComp },
    ];

    InitData() {
        this.HuanHuaBg = this.viewNode.HuanHuaBg;
        this.viewNode.Board.SetData(new BoardData(AngelView, Language.Angel.Title, 18));
        this.viewNode.Board.SetCoreMark(CoreCrisisType.Angel)
        this.viewNode.ListTab.SetData(this.tabbarCfg);
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        this.viewNode.BtnFes.onClick(this.onClickFes.bind(this));
        AngelFesData.Inst().CheckTime()
        this.AddSmartDataCare(AngelData.Inst().result_info, this.FlushData.bind(this), "is_change");
        this.AddSmartDataCare(AngelData.Inst().result_info, this.FlushBaoJi.bind(this), "FlushBaoJi");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushData.bind(this), "OtherChange");
        this.AddSmartDataCare(AngelFesData.Inst().flush_info, this.FlushFes.bind(this), "show_time");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.FlushView.bind(this), "need_flush");
        this.viewNode.ListTab.OnSelectedItem(0);
        this.viewNode.AngelUpComp.InitData();
        this.viewNode.HuanHuaComp.InitData();
        this.FlushShow();
        this.FlushFes()
    }

    public FlushView() {
        this.viewNode.Board.FlushCore()
    }

    OnClickListItem(item: CommonBoard5Tab) {
        if (this.select_index != item._data.index) {
            this.select_index = item._data.index
            this.FlushShow();
        }
    }

    /* 展示盛典界面 */
    public FlushFes() {
        this.viewNode.BtnFes.visible = ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.FaZhenGala)
            && FunOpen.Inst().GetFunIsOpen(Mod.AngelFes.Main).is_open && AngelFesData.Inst().flush_info.show_time == 1
    }

    /**刷新展示界面 */
    public FlushShow() {
        if (this.select_index == 0) {
            this.viewNode.Board.SetIcon("Tou_DaiBiaoTi", 13);
            this.viewNode.Board.SetHelpVisible(true);
            this.viewNode.Board.removeExtraCompent();
            this.viewNode.AngelUpComp.visible = true;
            this.viewNode.HuanHuaComp.visible = false;
            this.HuanHuaBg.visible = false;
        } else {
            this.viewNode.Board.SetIcon("Tou_BuDaiBiaoTi", 47)
            this.viewNode.Board.SetHelpVisible(false);
            this.viewNode.Board.removeExtraCompent();
            this.viewNode.Board.addExtraCompent(this.HuanHuaBg);
            this.viewNode.AngelUpComp.visible = false;
            this.viewNode.HuanHuaComp.visible = true;
            this.HuanHuaBg.visible = true;
        }
        this.FlushData();
    }

    /**刷新数据 */
    public FlushData() {
        if (this.select_index == 0) {
            this.viewNode.AngelUpComp.FlushAll();
        } else {
            this.viewNode.HuanHuaComp.FlushData();
        }
    }

    /**暴击 */
    public FlushBaoJi() {
        if (this.select_index == 0) {
            this.viewNode.AngelUpComp.FlushBaoJi();
        }
    }

    CloseCallBack() {
        GuideCtrl.Inst().ForceStop();
    }

    public onClickFes() {
        ViewManager.Inst().OpenView(AngelFesView)
    }
}




import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonComboBox } from "modules/box/BoxTrustView";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";

@BaseView.registView 
export class FishSettingView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishSetting",
        ViewName: "FishSettingView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        CbQuality: <CommonComboBox>null,
        Toggle1: <fgui.GButton>null,
        Toggle2: <fgui.GButton>null,
        Toggle3: <fgui.GButton>null,
        BtnStart: <fgui.GButton>null,
        BtnStop: <fgui.GButton>null,
        GpAnim: <fgui.GGroup>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(FishSettingView));

        this.viewNode.CbQuality.items = FishData.Inst().GetAutoQualityDesc();
        this.viewNode.CbQuality.items_rich = FishData.Inst().GetAutoQualityColor();
        this.viewNode.CbQuality.values = FishData.Inst().GetAutoQualityParam();
        this.viewNode.CbQuality.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.Toggle1.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.Toggle2.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.Toggle3.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.BtnStart.onClick(this.OnClickStart, this);
        this.viewNode.BtnStop.onClick(this.OnClickStop, this);

        this.viewNode.BtnStart.visible = !FishData.Inst().autoWaBao
        this.viewNode.BtnStop.visible = FishData.Inst().autoWaBao
    }

    InitUI(): void {
        this.FlushWaBaoSetingInfo()
    }

    FlushWaBaoSetingInfo() {
        let info = FishData.Inst().GetWaBaoSetingInfo()
        this.viewNode.CbQuality.value = info.eqality.toString()
        this.viewNode.Toggle1.selected = 1 == info.eqalityMark
        this.viewNode.Toggle2.selected = 1 == info.newRecord
        this.viewNode.Toggle3.selected = 1 == info.newBook
    }

    onChangedEnd(target: fgui.GComponent) {
        let info = FishData.Inst().GetWaBaoSetingInfo()
        switch (target._name) {
            case "Toggle1":
                info.eqalityMark = this.viewNode.Toggle1.selected ? 1 : 0
                break;
            case "Toggle2":
                info.newRecord = this.viewNode.Toggle2.selected ? 1 : 0
                break;
            case "Toggle3":
                info.newBook = this.viewNode.Toggle3.selected ? 1 : 0
                break;
            case "CbQuality":
                info.eqality = + this.viewNode.CbQuality.value;
                break;
        }
        FishCtrl.Inst().SendWaBaoSetReq(FishData.Inst().GetWaBaoSetingInfo());
    }

    OnClickStart() {
        ViewManager.Inst().CloseView(FishSettingView)
        FishData.Inst().AutoWabao(true);
    }

    OnClickStop() {
        ViewManager.Inst().CloseView(FishSettingView)
        FishData.Inst().AutoWabao(false);
        PublicPopupCtrl.Inst().Center(Language.Fish.FishSetting.StopSucc)
    }
}
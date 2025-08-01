import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { BoxData } from "./BoxData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";
import { FunOpen } from "modules/guide/FunOpen";
import { Mod } from "modules/common/ModuleDefine";
import { LogError } from "core/Debugger";
import { RoleData } from "modules/role/RoleData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";

@BaseView.registView
export class BoxTrustView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BoxTrust",
        ViewName: "BoxTrustView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    private boxSettingInfo: PB_BoxSet;
    private language = Language.Box;
    protected viewNode = {
        Board: <CommonBoard3>null,
        ImgBg: <fgui.GImage>null,
        GpGaoJi: <fgui.GGroup>null,
        BtnDown: <fgui.GButton>null,
        BtnStart: <fgui.GButton>null,
        RTxtTianCi: <fgui.GRichTextField>null,
        TogCondition1: <fgui.GButton>null,
        TogCondition2: <fgui.GButton>null,
        TogTianCi: <fgui.GButton>null,
        TogChallenge: <fgui.GButton>null,
        TogFive: <fgui.GButton>null,
        TogCap: <fgui.GButton>null,
        CbQuality: <CommonComboBox>null,
        Cb1Condition1: <CommonComboBox>null,
        Cb2Condition1: <CommonComboBox>null,
        Cb1Condition2: <CommonComboBox>null,
        Cb2Condition2: <CommonComboBox>null,
        gp_challenge: <fgui.GGroup>null,
        gp_five_open: <fgui.GGroup>null,
        BtnChange: <fgui.GButton>null,
        StateChange: <fgui.GGroup>null,
    };

    InitData() {
        let self = this;
        self.boxSettingInfo = new PB_BoxSet();
        self.viewNode.Board.SetData(new BoardData(BoxTrustView));
        let is_tiped = LocalStorageHelper.PrefsInt(LocalStorageHelper.AutoBoxOpenTip());
        if (is_tiped != 1) {
            LocalStorageHelper.PrefsInt(LocalStorageHelper.AutoBoxOpenTip(), 1);
        }
    }

    private CloseView() {
        ViewManager.Inst().CloseView(BoxTrustView)

    }
    InitUI() {
        let self = this;
        self.viewNode.CbQuality.items = BoxData.Inst().GetAutoQualityDesc();
        self.viewNode.CbQuality.items_rich = BoxData.Inst().GetAutoQualityColor();
        self.viewNode.CbQuality.values = BoxData.Inst().GetAutoQualityParam();
        UH.SetText(this.viewNode.RTxtTianCi, TextHelper.Format(self.language.tip, COLORSTR.Red1));
        self.viewNode.Cb1Condition1.items = BoxData.Inst().GetAutoCondition1Desc();
        self.viewNode.Cb2Condition1.items = BoxData.Inst().GetAutoCondition2Desc();
        self.viewNode.Cb1Condition2.items = BoxData.Inst().GetAutoCondition1Desc();
        self.viewNode.Cb2Condition2.items = BoxData.Inst().GetAutoCondition2Desc();
        self.viewNode.Cb1Condition1.values = BoxData.Inst().GetAutoCondition1Param();
        self.viewNode.Cb2Condition1.values = BoxData.Inst().GetAutoCondition2Param();
        self.viewNode.Cb1Condition2.values = BoxData.Inst().GetAutoCondition1Param();
        self.viewNode.Cb2Condition2.values = BoxData.Inst().GetAutoCondition2Param();
        self.viewNode.TogCondition1.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.TogCondition2.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.TogTianCi.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.TogChallenge.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.TogFive.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.TogCap.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.CbQuality.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.Cb1Condition1.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.Cb2Condition1.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.Cb1Condition2.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.Cb2Condition2.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.BtnDown.on(fgui.Event.STATUS_CHANGED, self.onChangedEnd, self);
        self.viewNode.BtnChange.onClick(self.OnClickBtnChange.bind(self));
        self.viewNode.BtnStart.onClick(self.startTrust.bind(self));
        self.FlushAll();
        GuideCtrl.Inst().AddGuideUi("BtnBoxAutoStart", this.viewNode.BtnStart);
        this.viewNode.gp_challenge.visible = FunOpen.Inst().GetFunIsOpen(Mod.Arena.View).is_open;
        //this.viewNode.gp_challenge.x = 274
        let is_five_open = FunOpen.Inst().GetFunIsOpen(Mod.BoxFiveOpen.Main).is_open
        this.viewNode.gp_challenge.x = is_five_open ? 131 : 274
        this.viewNode.gp_five_open.visible = is_five_open

        if (!FunOpen.Inst().GetFunIsOpen(Mod.EquipEnchant.Main).is_open)
        // {
        //     this.viewNode.StateChange.visible = true;
        //     this.viewNode.StateChange.height = 94;
        // }
        // else
        {
            this.viewNode.StateChange.visible = false;
            this.viewNode.StateChange.height = 0;
        }
        this.FlushBtnChangeState()
    }

    private FlushAll() {
        let self = this;
        let info = BoxData.Inst().GetBoxSettingInfo();
        if (info) {
            self.boxSettingInfo.conditionFirstMark = info.boxSet.conditionFirstMark;
            self.boxSettingInfo.conditionSecondMark = info.boxSet.conditionSecondMark;
            self.boxSettingInfo.retainMark = info.boxSet.retainMark;
            self.boxSettingInfo.challengeMark = info.boxSet.challengeMark;
            self.boxSettingInfo.equipCapMark = info.boxSet.equipCapMark;
            self.boxSettingInfo.equipEqality = info.boxSet.equipEqality;
            self.boxSettingInfo.conditionFirst1 = info.boxSet.conditionFirst1;
            self.boxSettingInfo.conditionFirst2 = info.boxSet.conditionFirst2;
            self.boxSettingInfo.conditionSecond1 = info.boxSet.conditionSecond1;
            self.boxSettingInfo.conditionSecond2 = info.boxSet.conditionSecond2;
            self.boxSettingInfo.equipSellMark = info.boxSet.equipSellMark;
            self.boxSettingInfo.openFiveMark = info.boxSet.openFiveMark;

            self.viewNode.TogCondition1.selected = info.boxSet.conditionFirstMark == 1;
            self.viewNode.TogCondition2.selected = info.boxSet.conditionSecondMark == 1;
            self.viewNode.TogTianCi.selected = info.boxSet.retainMark == 1;
            self.viewNode.TogChallenge.selected = info.boxSet.challengeMark == 1;
            self.viewNode.TogCap.selected = info.boxSet.equipCapMark == 1;
            self.viewNode.CbQuality.value = info.boxSet.equipEqality + "";
            self.viewNode.TogFive.selected = info.boxSet.openFiveMark == 1;
            self.viewNode.Cb1Condition1.value = info.boxSet.conditionFirst1 + "";
            self.viewNode.Cb2Condition1.value = info.boxSet.conditionFirst2 + "";
            self.viewNode.Cb1Condition2.value = info.boxSet.conditionSecond1 + "";
            self.viewNode.Cb2Condition2.value = info.boxSet.conditionSecond2 + "";

        }
    }
    private startTrust() {
        if (this.boxSettingInfo.openFiveMark && BoxData.Inst().GetBoxNumInfo() < 5) {
            PublicPopupCtrl.Inst().Center(Language.Box.tip10);
            return
        }
        BoxData.Inst().setBoxSet(this.boxSettingInfo);
        this.CloseView();
        BoxData.Inst().startAuto();
    }

    private onChangedEnd(target: fgui.GComponent) {
        let self = this;
        switch (target._name) {
            case "TogCondition1":
                self.boxSettingInfo.conditionFirstMark = this.viewNode.TogCondition1.selected ? 1 : 0
                break;
            case "TogCondition2":
                self.boxSettingInfo.conditionSecondMark = this.viewNode.TogCondition2.selected ? 1 : 0
                break;
            case "TogTianCi":
                self.boxSettingInfo.retainMark = this.viewNode.TogTianCi.selected ? 1 : 0
                break;
            case "TogChallenge":
                self.boxSettingInfo.challengeMark = this.viewNode.TogChallenge.selected ? 1 : 0
                break;
            case "TogFive":
                self.boxSettingInfo.openFiveMark = this.viewNode.TogFive.selected ? 1 : 0
                break;
            case "TogCap":
                self.boxSettingInfo.equipCapMark = this.viewNode.TogCap.selected ? 1 : 0
                break;
            case "CbQuality":
                self.boxSettingInfo.equipEqality = +self.viewNode.CbQuality.value;
                break;
            case "Cb1Condition1":
                self.boxSettingInfo.conditionFirst1 = +self.viewNode.Cb1Condition1.value;
                break;
            case "Cb2Condition1":
                self.boxSettingInfo.conditionFirst2 = +self.viewNode.Cb2Condition1.value;
                break;
            case "Cb1Condition2":
                self.boxSettingInfo.conditionSecond1 = +self.viewNode.Cb1Condition2.value;
                break;
            case "Cb2Condition2":
                self.boxSettingInfo.conditionSecond2 = +self.viewNode.Cb2Condition2.value;
                break;
            case "BtnDown":
                if (self.viewNode.BtnDown.selected) {
                    self.viewNode.ImgBg.height = 451;
                    self.viewNode.GpGaoJi.visible = true;
                } else {
                    self.viewNode.ImgBg.height = 142;
                    self.viewNode.GpGaoJi.visible = false;
                }
                break;
        }
    }

    FlushBtnChangeState() {
        if (this.boxSettingInfo.equipSellMark == 0) {    //出售
            this.viewNode.BtnChange.title = this.language.Sale
        } else { //分解
            this.viewNode.BtnChange.title = this.language.Enchant
        }
    }

    OnClickBtnChange() {
        // let role_id = RoleData.Inst().GetRoleId();
        // let index = LocalStorageHelper.PrefsInt(role_id +"EquipDoChange") == 1 ? 2 : 1
        // LocalStorageHelper.PrefsInt(role_id +"EquipDoChange",index)
        let index = this.boxSettingInfo.equipSellMark == 0 ? 1 : 0
        this.boxSettingInfo.equipSellMark = index

        this.FlushBtnChangeState()
    }

    CloseCallBack() {
        GuideCtrl.Inst().ClearGuideUi("BtnBoxAutoStart");
        GuideCtrl.Inst().ForceStop()
    }
}

export class CommonComboBox extends fgui.GComboBox {
    public showDropdown() {
        let fun = function () {
            let self = this
            if (self._itemsUpdated) {
                self._itemsUpdated = false;

                self._list.removeChildrenToPool();
                var cnt: number = self._items.length;
                for (var i: number = 0; i < cnt; i++) {
                    var item: fgui.GObject = self._list.addItemFromPool();
                    item.name = i < self._values.length ? self._values[i] : "";
                    item.text = self._items_rich_color ? TextHelper.ColorStr(self._items[i], self._items_rich_color[i]) : self._items[i];
                    item.icon = (self._icons && i < self._icons.length) ? self._icons[i] : null;
                }
                self._list.resizeToFit(self._visibleItemCount);
            }
            self._list.selectedIndex = self._selectedIndex;
            self.dropdown.width = self.width;
            self._list.ensureBoundsCorrect();
            fgui.GRoot.inst.togglePopup(this.dropdown, this, this._popupDirection);
            if (this.dropdown.parent)
                this.setState(fgui.GButton.DOWN);
        }.bind(this)
        fun()
    }

    private _items_rich_color: string[]
    public set items_rich(value: string[]) {
        this._items_rich_color = value;
    }
}
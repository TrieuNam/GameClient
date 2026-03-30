import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";
import { DialogTipsTypes, PublicPopupData } from "./PublicPopupData";

@BaseView.registView
export class DialogTipsView extends BaseView {
    private call_back: Function;
    private dt_type: DialogTipsTypes;
    static Tips: Map<string, boolean> = new Map();
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "DialogTips",
        ViewName: "DialogTipsView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnConfirm: <fgui.GButton>null,
        BtnNotTip: <fgui.GButton>null,
        DescShow: <fgui.GTextField>null,
        GpNotTips: <fgui.GGroup>null,
    };

    InitData(paramt: { desc: string, type: DialogTipsTypes, cb?: Function, not_tips?: boolean, confirmText?: string }) {
        this.dt_type = paramt ? paramt.type : -1;
        this.call_back = paramt ? paramt.cb : undefined;
        this.viewNode.Board.SetData(new BoardData(DialogTipsView));
        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
        this.viewNode.BtnNotTip.on(fgui.Event.STATUS_CHANGED, this.OnClickNotTip, this);
        UH.SetText(this.viewNode.DescShow, paramt ? paramt.desc : "")
        this.viewNode.GpNotTips.visible = paramt.not_tips ?? false
        this.viewNode.BtnConfirm.title = paramt.confirmText ?? Language.Common.Confirm
    }

    OnClickConfirm() {
        this.call_back && this.call_back();
        ViewManager.Inst().CloseView(DialogTipsView);
    }

    OnClickNotTip() {
        PublicPopupData.Inst().SetDialogTipsNotTips(this.dt_type, this.viewNode.BtnNotTip.selected)
        // BoxData.Inst().sell_tip = !this.viewNode.BtnNotTip.selected;
    }
}
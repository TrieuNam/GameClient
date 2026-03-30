import { HorizontalTextAlignment } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class CommonConfirmTipView extends BaseView {
    private tip_data: CommonConfirmTipData;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonConfirmTip",
        ViewName: "CommonConfirmTipView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        Desc: <fgui.GTextField>null,
        BtnConfirm: <fgui.GButton>null,
        BtnCancel: <fgui.GButton>null,
    };

    InitData(param: CommonConfirmTipData) {
        this.tip_data = param;
        this.viewNode.Board.SetData(new BoardData(CommonConfirmTipView, param.title));
        UH.SetText(this.viewNode.Desc, param.desc);
        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
        this.viewNode.BtnCancel.onClick(this.OnClickCancel, this);
        param.align && (this.viewNode.Desc.align = param.align)
    }

    OnClickConfirm() {
        ViewManager.Inst().CloseView(CommonConfirmTipView);
        this.tip_data && this.tip_data.confirm_func && this.tip_data.confirm_func();
    }
    OnClickCancel() {
        ViewManager.Inst().CloseView(CommonConfirmTipView);
        this.tip_data && this.tip_data.cancle_func && this.tip_data.cancle_func();
    }
}

export class CommonConfirmTipData {
    title: string;
    desc: string;
    confirm_func: Function;
    cancle_func: Function;
    align = HorizontalTextAlignment.CENTER;
    constructor(title: string, desc: string, confirm_func: Function, cancle_func?: Function, align?: HorizontalTextAlignment) {
        this.title = title;
        this.desc = desc;
        this.confirm_func = confirm_func;
        this.cancle_func = cancle_func;

        this.align = align;
    }
}
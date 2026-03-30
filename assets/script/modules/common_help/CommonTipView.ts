import { HorizontalTextAlignment } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class CommonTipView extends BaseView {
    private tip_data: CommonTipData;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonTips",
        ViewName: "CommonTipView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        Desc: <fgui.GTextField>null,
        BtnConfirm: <fgui.GButton>null,
    };

    InitData(param: CommonTipData) {
        this.tip_data = param;
        this.viewNode.Board.SetData(new BoardData(CommonTipView, param.title));
        UH.SetText(this.viewNode.Desc, param.desc);
        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
        param.align && (this.viewNode.Desc.align = param.align)
    }

    OnClickConfirm() {
        ViewManager.Inst().CloseView(CommonTipView);
        this.tip_data && this.tip_data.confirm_func && this.tip_data.confirm_func();
    }
}

export class CommonTipData {
    title: string;
    desc: string;
    confirm_func: Function;
    align = HorizontalTextAlignment.CENTER;
    constructor(title: string, desc: string, confirm_func: Function, align?: HorizontalTextAlignment) {
        this.title = title;
        this.desc = desc;
        this.confirm_func = confirm_func;
        this.align = align;
    }
}
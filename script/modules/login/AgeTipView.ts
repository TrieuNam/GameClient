import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from "modules/common_board/BoardData";

@BaseView.registView
export class AgeTipView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "AgeTip",
        ViewName: "AgeTipView",
        LayerType: ViewLayer.Normal,
        ViewMask:ViewMask.BgBlock
    };

    protected viewNode = {
        Board:<CommonBoard3>null,
    }

    InitData() {
        this.viewNode.Board.SetData(new BoardData(AgeTipView));
    }

    InitUI() {
    }

}
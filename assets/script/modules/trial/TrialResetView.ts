import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { TrialCtrl } from "./TrialCtrl";

@BaseView.registView 
export class TrialResetView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialReset",
        ViewName: "TrialResetView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnConfirm: <fgui.GButton>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialResetView));
        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
    }

    OnClickConfirm() {
        ViewManager.Inst().CloseView(TrialResetView);
        TrialCtrl.Inst().SendShiLianPagodaReqReset();
    }
}
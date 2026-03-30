import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";

@BaseView.registView 
export class TrialReplaceView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialReplace",
        ViewName: "TrialReplaceView",
        LayerType: ViewLayer.Normal,
        // ViewMask :ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        // NameShow:<fgui.GRichTextField>null,
        // CellShow: <ItemCellEquip>null,
        // CapShow: <MainCapItem>null,
        // AttrShow: <AttrItem>null,
        // AttrList: <fgui.GList>null,
        // BtnArrow: <fgui.GButton>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialReplaceView));
        // UH.SetText(this.viewNode.NameShow,  item.QuaNameOL())
        // this.viewNode.CellShow.SetData(item.Vo(), {is_click:false});
        // this.viewNode.CapShow.SetData(item.Cap());
        // this.viewNode.CellShow.SetData(item);
    }

    OnClickArrow() {
        // LogError("OnClickArrow")
        // this.viewNode.AttrList.
    }
}
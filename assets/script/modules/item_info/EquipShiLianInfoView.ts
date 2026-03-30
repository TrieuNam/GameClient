import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { EquipShiLian } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { ItemCellEquip } from "modules/extends/ItemCell";
import { MainCapItem } from "modules/main/MainItems";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class EquipShiLianInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "EquipShiLianInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard4>null,
        NameShow: <fgui.GRichTextField>null,
        CellShow: <ItemCellEquip>null,
        CapShow: <MainCapItem>null,
        DescShow: <fgui.GTextField>null,
        DescShow2: <fgui.GTextField>null,
        LevelShow: <fgui.GLabel>null,
        // AttrList: <fgui.GList>null,
        // BtnArrow: <fgui.GButton>null,
    };

    InitData(item: EquipShiLian) {
        this.viewNode.Board.SetData(new BoardData(EquipShiLianInfoView));

        UH.SetText(this.viewNode.NameShow, item.QuaNameOL())
        this.viewNode.CellShow.SetData(item.Vo(), { is_click: false, no_level: true });
        this.viewNode.CapShow.SetData(item.Cap());
        UH.SetText(this.viewNode.DescShow, item.GetDescShow2())
        UH.SetText(this.viewNode.DescShow2, item.Desc())
        UH.SetText(this.viewNode.LevelShow, `Lv.${item.Level()}`);
    }

    OnClickArrow() {
        LogError("OnClickArrow")
        // this.viewNode.AttrList.
    }
}
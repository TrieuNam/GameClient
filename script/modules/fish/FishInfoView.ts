
import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishData } from "./FishData";

@BaseView.registView
export class FishInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishInfo",
        ViewName: "FishInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        NameShow: <fgui.GTextField>null,
        RecordShow: <fgui.GTextField>null,
        DescShow: <fgui.GTextField>null,
        CellShow: <ItemCell>null,
    };

    InitData(item: Item) {
        let integrity_info = FishData.Inst().GetWaBaoIntegrityInfoItem(item.ItemId());
        this.viewNode.Board.SetData(new BoardData(FishInfoView, item.Name()));
        UH.SetText(this.viewNode.NameShow, GetCfgValue(Language.Fish.BoxTypeShows, Item.GetWaBaoType(item.ItemId())));
        UH.SetText(this.viewNode.RecordShow, TextHelper.Format(Language.Fish.FishInfo.RecordShow, integrity_info ? integrity_info.maxIntegrity : 0));
        UH.SetText(this.viewNode.DescShow, item.Desc());
        this.viewNode.CellShow.SetData(Item.Create(item.Vo(), { is_click: false }));
    }
}
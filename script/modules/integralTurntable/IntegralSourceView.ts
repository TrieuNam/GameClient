import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { BaseItem } from "modules/common/BaseItem";

@BaseView.registView
export class IntegralSourceView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "IntegralSource",
        ViewName: "IntegralSourceView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "SourceItemCell", ExtendsClass: SourceItemCell },
    ];

    private common_list: any

    protected viewNode = {
        Board: <CommonBoard3>null,
        Title: <fgui.GTextField>null,
        list: <fgui.GList>null,
    };

    InitData(param: { common_list: any }) {

        this.viewNode.Board.SetData(new BoardData(IntegralSourceView));
        this.viewNode.Board.SetTitle(Language.IntegralTurntable.source);

        UH.SetText(this.viewNode.Title, Language.IntegralTurntable.consume);

        this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.list.setVirtual();
        this.common_list = param;
    }

    InitUI() {
        this.FluhShowList()
    }

    private renderListItem(index: number, item: SourceItemCell) {
        item.SetData(this.common_list[index]);
    }

    private FluhShowList() {
        this.viewNode.list.numItems = this.common_list.length;
    }
}


export class SourceItemCell extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        Score: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        let item = Item.Create({ item_id: data.consume_item }, { is_click: true })
        this.viewNode.Cell.SetData(item)
        UH.SetText(this.viewNode.Score, TextHelper.Format(Language.IntegralTurntable.score, data.get_score));
    }
}
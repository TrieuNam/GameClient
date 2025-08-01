import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class TurntableView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "CaveLootPro",
        ViewName: "CaveLootPro",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    private common_list: any
    private special_list: any

    protected viewNode = {
        Board: <CommonBoard3>null,
        zhenxi_list: <fgui.GList>null,
        common_list: <fgui.GList>null,

    };
    protected extendsCfg = [
        { ResName: "CaveLootGaiItem", ExtendsClass: TurntableGaiItem }
    ];

    InitData(param: { common_list: any, special_list: any }) {

        this.viewNode.Board.SetData(new BoardData(TurntableView));
        this.viewNode.Board.SetTitle(Language.IntegralTurntable.probability);

        this.viewNode.zhenxi_list.itemRenderer = this.renderSpecialListItem.bind(this);
        this.viewNode.zhenxi_list.setVirtual();

        this.viewNode.common_list.itemRenderer = this.renderCommonListItem.bind(this);
        this.viewNode.common_list.setVirtual();

        this.special_list = param.special_list;
        this.common_list = param.common_list;
    }

    InitUI() {
        this.FluhShowList()
    }

    private renderCommonListItem(index: number, item: TurntableGaiItem) {
        item.SetData(this.common_list[index]);
    }

    private renderSpecialListItem(index: number, item: TurntableGaiItem) {
        item.SetData(this.special_list[index]);
    }

    private FluhShowList() {
        this.viewNode.zhenxi_list.numItems = this.special_list.length;
        this.viewNode.common_list.numItems = this.common_list.length;
    }

}

export class TurntableGaiItem extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        pro: <fgui.GTextField>null,
    };
    public SetData(data: any) {
        this.viewNode.Cell.SetData(Item.Create(data.reward_id, { is_num: true }));
        UH.SetText(this.viewNode.pro, TextHelper.Format(Language.IntegralTurntable.GaiLu, data.rate / 100))
    }
}
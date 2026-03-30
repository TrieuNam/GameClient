import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class TrailRewardPreview extends BaseView {

    protected viewRegcfg = {
        UIPackName: "TrailRewardPreview",
        ViewName: "RewardPreviewVIew",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock
    };

    private common_list : any
    private special_list : any
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        // Name: <fgui.GTextField>null,
        Board: <CommonBoard3>null,
        common_list:<fgui.GList> null,
        higher_list:<fgui.GList> null,
    };

    // protected extendsCfg = [
    //     { ResName: "CaveLootGaiItem", ExtendsClass: CaveLootGaiItem }
    // ];

    InitData(param:{common_list:any, special_list: any}) {
        this.viewNode.Board.SetData(new BoardData(TrailRewardPreview));
        this.viewNode.higher_list.itemRenderer = this.renderSpecialListItem.bind(this);
        this.viewNode.higher_list.setVirtual();

        this.viewNode.common_list.itemRenderer = this.renderCommonListItem.bind(this);
        this.viewNode.common_list.setVirtual();

        this.special_list = param.special_list
        this.common_list = param.common_list
    }

    InitUI() {

        this.FluhShowList()
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }

    private renderCommonListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.common_list[index].item_reward,{ is_num: true}));
    }

    private renderSpecialListItem(index: number, item: ItemCell) {
        // item.SetData(this.special_list[index]);
        item.SetData(Item.Create(this.special_list[index].item_reward,{ is_num: true}));

    }

    private FluhShowList(){
        this.viewNode.higher_list.numItems = this.special_list.length;
        this.viewNode.common_list.numItems = this.common_list.length;
    }

}
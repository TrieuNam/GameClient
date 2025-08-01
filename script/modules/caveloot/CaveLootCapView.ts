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
import { CaveLootData } from "./CaveLootData";

@BaseView.registView
export class CaveLootCapView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "CaveLootPro",
        ViewName: "CaveLootPro",
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
        zhenxi_list:<fgui.GList> null,
        common_list:<fgui.GList> null,
    };

    protected extendsCfg = [
        { ResName: "CaveLootGaiItem", ExtendsClass: CaveLootGaiItem }
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(CaveLootCapView));
        this.viewNode.zhenxi_list.itemRenderer = this.renderSpecialListItem.bind(this);
        this.viewNode.zhenxi_list.setVirtual();

        this.viewNode.common_list.itemRenderer = this.renderCommonListItem.bind(this);
        this.viewNode.common_list.setVirtual();
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

    private renderCommonListItem(index: number, item: CaveLootGaiItem) {
        item.SetData(this.common_list[index]);
    }

    private renderSpecialListItem(index: number, item: CaveLootGaiItem) {
        item.SetData(this.special_list[index]);
    }

    private FluhShowList(){
        this.common_list = CaveLootData.Inst().GetShowProData(2)
        this.special_list = CaveLootData.Inst().GetShowProData(1)

        this.viewNode.zhenxi_list.numItems = this.special_list.length;
        this.viewNode.common_list.numItems = this.common_list.length;
    }

}


export class CaveLootGaiItem extends fgui.GComponent {
    private viewNode = {
        Cell: <ItemCell>null,
        pro:<fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.viewNode.Cell.SetData(Item.Create(data.reward_id,{is_num:true}));
        UH.SetText(this.viewNode.pro, TextHelper.Format(Language.CaveLoot.GaiLu,data.rate / 100)) 
    }
}
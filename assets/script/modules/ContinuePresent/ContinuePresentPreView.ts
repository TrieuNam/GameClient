import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { ContinuePresentData } from "./ContinuePresentCtrl";

@BaseView.registView 
export class ContinuePresentPreView extends BaseView {
    protected param:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ContinuePresent",
        ViewName: "ContinuePresentPreView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "PreViewItem", ExtendsClass: ContinuePresentPreItem },
    ]

    protected viewNode = {
        Board: <CommonBoard3>null,
        RewardList:<fgui.GList> null,
        Tips: <fgui.GLabel>null,
    };

    InitData(data:any) {
        this.viewNode.Board.SetData(new BoardData(ContinuePresentPreView,Language.ContinuePresent.RatePreView));

        let big_list = ContinuePresentData.Inst().GetBigList()
        this.viewNode.RewardList.SetData(big_list)
    }

    public flushInfoPanel() {
        
    }
}

export class ContinuePresentPreItem extends fgui.GComponent {
    private viewNode:{[key:string]:any} = {
        ItemCell:<ItemCell>null,
        Big:<fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data

        let item_call = Item.Create({item_id:data.item_id,num:data.num},{is_num : true,is_click:true})
        this.viewNode.ItemCell.SetData(item_call)

        // this.viewNode.Big.visible = this.data.is_big
    }
}
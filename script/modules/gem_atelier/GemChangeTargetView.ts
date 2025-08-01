import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { GemAtelierData } from "./GemAtelierData";
import { GemLevelShowCell } from "./GemAtelierInsetView";
import { GemMainRecipeItem } from "./GemAtelierMainView";
import { GemAtelierMixItem } from "./GemAtelierMixSureView";

@BaseView.registView 
export class GemChangeTargetView extends BaseView {
    protected param:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierMixSure",
        ViewName: "GemChangeTargetView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "GemShowItem", ExtendsClass: GemShowItem },
        { ResName: "LevelShowCell", ExtendsClass: GemLevelShowCell },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        GemList: <fgui.GList>null,
    };

    InitData(data:any) {
        this.viewNode.Board.SetData(new BoardData(GemChangeTargetView,Language.GemAtelier.ChangeTarget));
        this.viewNode.GemList.on(fgui.Event.CLICK_ITEM,this.OnClickGemList,this);
        this.viewNode.GemList.SetData(GemAtelierData.Inst().GetChangeSelectList(data.item_id))
        this.param = data
    }

    private OnClickGemList(item:GemShowItem) {
        GemAtelierData.Inst().SetChangeSelect(item.data)

        ViewManager.Inst().CloseView(GemChangeTargetView);
    }
}

// {item_id;is_num;level;}
export class GemShowItem extends fgui.GButton {
    private viewNode = {
        ItemCall: <ItemCell>null,
        Itemshow: <fgui.GLabel>null,
        NumStr: <fgui.GLabel>null,
        level_list: <fgui.GList>null,
        NumShow: <fgui.GGroup>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.viewNode.ItemCall.SetData(Item.Create({ item_id: data.item_id },
            { is_num: data.is_num, is_click: false }))

        UH.SetText(this.viewNode.Itemshow, "")
        this.viewNode.NumShow.visible = data.is_num
        UH.SetText(this.viewNode.NumStr, Item.GetNum(data.item_id))
        let levels = GemAtelierData.Inst().GetGemLevelList(data.level)
        this.viewNode.level_list.SetData(levels)

        this.data = data
    }

}

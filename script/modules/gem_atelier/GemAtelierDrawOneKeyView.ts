
import { sys } from "cc";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { GetWayData } from "modules/getway/GetWayData";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GemAtelierCtrl } from "./GemAtelierCtrl";
import { GemAtelierData } from "./GemAtelierData";
import { GemAtelierOneKeyView } from "./GemAtelierOneKeyView";

@BaseView.registView 
export class GemAtelierDrawOneKeyView extends BaseView {
    private need_info = {item_id:0,num:0}
    private send_list:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierDrawOneKey",
        ViewName: "GemAtelierDrawOneKeyView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "DrawOneKeyCell", ExtendsClass: GemAtelierDrawOneKeyCell },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        List: <fgui.GList>null,
        need_icon: <fgui.GLoader>null,
        need_num: <fgui.GLabel>null, 
        BtnSure: <fgui.GButton>null,
        OldPrice: <fgui.GTextField>null,
        NowPrice: <fgui.GTextField>null,
    };

    InitData(param:{draw_id:number,level:number}) {
        this.viewNode.Board.SetData(new BoardData(GemAtelierDrawOneKeyView,Language.GemAtelier.GemDrawTitle));
        this.viewNode.BtnSure.onClick(this.OnClickConfirm, this);

        let detail = GemAtelierData.Inst().GetDrawUpNeedDetail(param.draw_id,param.level)
        this.viewNode.List.SetData(detail.list)

        UH.SetIcon(this.viewNode.need_icon,Item.GetIconId(detail.need_item),ICON_TYPE.ITEM);

        let isDiscounts = GemAtelierData.Inst().IsDiscounts();
        let discountsCtrl = this.view.getController("discounts");
        discountsCtrl.setSelectedIndex(isDiscounts ? 1 : 0);
        if(isDiscounts){
            UH.SetText(this.viewNode.OldPrice,detail.need_num)
            UH.SetText(this.viewNode.NowPrice,detail.need_num / 2)
        }else{
            UH.SetText(this.viewNode.need_num,detail.need_num)
        }
        this.need_info.item_id = detail.need_item
        this.need_info.num = detail.need_num
        this.send_list = detail.send_list
    }

    OnClickConfirm()
    {
        let num = Item.GetNum(this.need_info.item_id)
        let config = Item.GetConfig(this.need_info.item_id);
        let list = GetWayData.Inst().GetWayList(config.get_way);
        let need_num = GemAtelierData.Inst().IsDiscounts() ? this.need_info.num / 2 : this.need_info.num
        if(num < need_num)
        {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Mount.LevelUpItemLackError,
                Item.GetName(this.need_info.item_id), list[0].desc));

            let show_call = Item.Create({ item_id: this.need_info.item_id, num: need_num - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return 
        }

        // LogError("?? ",this.send_list)
        GemAtelierCtrl.Inst().SendCSGemBuyReq(this.send_list)

        ViewManager.Inst().CloseView(GemAtelierDrawOneKeyView);
    }
}


export class GemAtelierDrawOneKeyCell extends fgui.GComponent {
    private viewNode = {
        name: <fgui.GLabel>null,
        item_cell: <ItemCell>null,
        enough: <fgui.GLabel>null,
        enough_low: <fgui.GGraph>null,
        un_enough: <fgui.GGraph>null,
        un_enough_t: <fgui.GLabel>null,
        need_icon : <fgui.GLoader>null,
        need_num : <fgui.GLabel>null,
        OldPrice: <fgui.GTextField>null,
        NowPrice: <fgui.GTextField>null,
    };

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetText(this.viewNode.name, data.name)
        let item_data = Item.Create(data.item_info,{is_click:true})
        this.viewNode.item_cell.SetData(item_data)
        this.viewNode.enough_low.visible = data.is_low_enough
        this.viewNode.enough.visible = data.is_enough
        this.viewNode.un_enough.visible = ! data.is_enough && ! data.is_low_enough

        let isDiscounts = GemAtelierData.Inst().IsDiscounts();
        let discountsCtrl = this.getController("discounts");
        discountsCtrl.setSelectedIndex(isDiscounts && !data.is_enough ? 1 : 0);
        if(isDiscounts){
            UH.SetText(this.viewNode.OldPrice,data.need_cast)
            UH.SetText(this.viewNode.NowPrice,data.need_cast / 2)
        }else{
            UH.SetText(this.viewNode.need_num,data.need_cast)
        }

        UH.SetText(this.viewNode.un_enough_t,data.un_enough_t)

        UH.SetIcon(this.viewNode.need_icon, Item.GetIconId(data.need_item) , ICON_TYPE.ITEM);
    }

}
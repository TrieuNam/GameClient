import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { BoardData } from "modules/common_board/BoardData";
import { UH } from "../../helpers/UIHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { Item } from "modules/bag/ItemData";
import { CfgStarMapData } from "config/CfgStarmap";
import { CommonId, ICON_TYPE } from "modules/common/CommonEnum";
import { COLORS, COLORSTR, QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { StarMapCtrl, STAR_MAP_REQ_TYPE} from "modules/star_map/StarMapCtrl";
import { LogError } from 'core/Debugger';
import { SuperResetView } from "modules/star_map/SuperResetView";
import { TextHelper } from "../../helpers/TextHelper";
import { OrderCtrl, Order_Data, RechargeType } from "modules/recharge/OrderCtrl";
import { NEO_SHOP_REQ_TYPE, OpenServerCtrl } from "./OpenServerCtrl";

@BaseView.registView 
export class OpenServerNeoShopConfirmView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "OpenServerActExtra",
        ViewName: "NeoShopBuyConfirmView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    private param:any
    protected viewNode = {
        Board: <CommonBoard3>null,
        Cell: <ItemCell>null,
        IconCost: <fgui.GLoader>null,
        TxtCost: <fgui.GTextField>null,
        BtnBuy: <fgui.GButton>null,
        TxtDesc: <fgui.GTextField>null,
        direct: <fgui.GLoader>null,
    }
    InitData(param:any){
        this.param = param

        let color = Item.GetColor(param.item_id);
        let quality_color = QualityColorOLStr[color];

        this.viewNode.Board.SetData(new BoardData(OpenServerNeoShopConfirmView,
            Item.GetName(param.item_id)))
            //TextHelper.ColorStr(Item.GetName(param.item_id),quality_color)));

        this.viewNode.Cell.SetData(Item.Create({item_id: param.item_id,num:param.item_num}
            , { is_num: true, is_click: false }))
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this));
        UH.SetText(this.viewNode.TxtDesc, Item.GetDesc(param.item_id));

        if(this.param.price_type == 3){
            this.viewNode.IconCost.visible = false
            this.viewNode.direct.visible = true

            UH.SetText(this.viewNode.TxtCost,this.param.price_num);
        }
        else 
        {
            this.viewNode.direct.visible = false
            this.viewNode.IconCost.visible = true
            UH.SetIcon(this.viewNode.IconCost, this.param.price_id,ICON_TYPE.ITEM);
        
            let price_color = Item.GetNum(this.param.price_id) < this.param.price_num ? COLORS.Red1 : COLORS.White;
            UH.SetText(this.viewNode.TxtCost,this.param.price_num, price_color);
        }
    }

    private onBuy() {

        if(this.param.price_type != 3 && Item.GetNum(this.param.price_id) < this.param.price_num){
            if(this.param.price_type == 1){
                PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoShopbuyDiaError)   
            }else 
            {
                PublicPopupCtrl.Inst().Center(Item.GetName(this.param.price_id)+Language.OpenServer.NeoShopPriceLack)
            }
            return 
        }

        if(this.param.price_type == 3){
            let order_data = Order_Data.initOrder(
                this.param.seq, 
                RechargeType.MARKET_SHOP, 
                this.param.price_num/10, 
                this.param.price_num, 
                Item.GetName(this.param.item_id));
            OrderCtrl.generateOrder(order_data);
        }
        else {
            OpenServerCtrl.Inst().SendCSMarketShopReq(NEO_SHOP_REQ_TYPE.BUY_GIFT,this.param.seq)
        }


        ViewManager.Inst().CloseView(OpenServerNeoShopConfirmView)
    }
}
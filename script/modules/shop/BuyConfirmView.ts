import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { BoardData } from "modules/common_board/BoardData";
import { UH } from "../../helpers/UIHelper";
import { ShopConfirmData } from "./ShopData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { Item } from "modules/bag/ItemData";
import { BagData } from "modules/bag/BagData";
import { CfgItem } from "config/CfgCommon";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { CommonId } from "modules/common/CommonEnum";
import { Mod } from "modules/common/ModuleDefine";


@BaseView.registView 
export class BuyConfirmView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShopBuyConfirm",
        ViewName: "BuyConfirmView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        Cell: <ItemCell>null,
        IconCost: <fgui.GLoader>null,
        TxtCost: <fgui.GTextField>null,
        BtnBuy: <fgui.GButton>null,
        TxtDesc: <fgui.GTextField>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private confirm_data: ShopConfirmData;
    InitData(param: ShopConfirmData) {
        this.confirm_data = param;
        let name = Item.GetName(param.item_id);
        this.viewNode.Board.SetData(new BoardData(BuyConfirmView, name));
        let cfg_item = new CfgItem(param.item_id, param.item_num);
        this.viewNode.Cell.SetData(Item.Create(cfg_item, { is_num: true, is_click: false }));
        UH.GoldIcon(this.viewNode.IconCost, param.exchange_item_id);
        UH.SetText(this.viewNode.TxtDesc, Item.GetDesc(param.item_id));
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCost.bind(this), "OtherChange");
        this.FlushCost();
    }

    InitUI() {
    }

    private FlushCost() {
        let color = Item.GetNum(this.confirm_data.exchange_item_id) < this.confirm_data.exchange_item_num ? COLORS.Red1 : COLORS.White;
        UH.SetText(this.viewNode.TxtCost, this.confirm_data.exchange_item_num, color);
    }

    private onBuy() {
        if (this.confirm_data.limit_times <= 0) {
            PublicPopupCtrl.Inst().Center(Language.Common.buy_limit);
        } else if (BagData.Inst().getItemNum(this.confirm_data.exchange_item_id) < this.confirm_data.exchange_item_num) {
            let id = this.confirm_data.exchange_item_id;
            if (id == CommonId.Diamond || id == CommonId.Gold) {
                ViewManager.Inst().CloseView(BuyConfirmView);
                let view_key = id == CommonId.Diamond ? Mod.Shop.DiamondShop : Mod.Shop.GoldShop;
                ViewManager.Inst().OpenViewByKey(view_key);
                PublicPopupCtrl.Inst().Center(Item.GetName(id) + Language.Common.NotHasTip)
            } else
                PublicPopupCtrl.Inst().ItemNotEnoughNotice(this.confirm_data.exchange_item_id)
        } else {
            this.confirm_data.limit_times = this.confirm_data.limit_times - 1;
            this.confirm_data.buy_fun();
        }
    }
}

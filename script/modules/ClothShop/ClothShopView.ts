import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { ClothShopIconName, ClothShopData } from "./ClothShopData";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { Currency2 } from "modules/extends/Currency";
import { CommonId } from "modules/common/CommonEnum";
import { BagData } from "modules/bag/BagData";

//幻化商城
@BaseView.registView
export class ClothShopView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "ClothShop",
        ViewName: "ClothShopView",
        LayerType: ViewLayer.Buttom,
    };

    protected viewNode = {
        BtnReturn: <fgui.GButton>null,
        List: <fgui.GList>null,
        ListTab: <fgui.GList>null,
        TabIcon: <fgui.GLoader>null,
        Currency: <Currency2>null,
    };

    protected extendsCfg = [
        { ResName: "ShopTitle", ExtendsClass: ShopTitle },
        { ResName: "ShopListCell", ExtendsClass: ShopListCell },
        { ResName: "ShopCell", ExtendsClass: ShopCell },
        { ResName: "BtnTab", ExtendsClass: BtnTab },
    ];

    protected TagCfg = [
        { name: Language.ClothShop.ClothShopTitle[0], seq: 0 },
        { name: Language.ClothShop.ClothShopTitle[1], seq: 1 },
        { name: Language.ClothShop.ClothShopTitle[2], seq: 2 },
        { name: Language.ClothShop.ClothShopTitle[3], seq: 3 },
    ];

    private data: ClothShopData = ClothShopData.Inst();
    private shop_list_data: any;
    private select_tab_data: any;

    InitData(param: any) {

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.freshNumber.bind(this), "OtherChange");

        let page_index = param && param.modkey ? param.modkey % 10 : 0;
        this.select_tab_data = this.TagCfg[page_index];

        this.viewNode.ListTab.SetData(this.TagCfg);
        this.viewNode.ListTab.selectedIndex = page_index;
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.onClickItem, this);

        this.viewNode.List.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.List.setVirtual();

        this.viewNode.BtnReturn.onClick(this.closeView.bind(this));

        let num = BagData.Inst().getItemNum(CommonId.Diamond);
        this.viewNode.Currency.SetCurrencyId(CommonId.Diamond, num);

        this.FulshListData();
        this.freshNumber();
    }

    private freshNumber() {
        let num = BagData.Inst().getItemNum(CommonId.Diamond);
        this.viewNode.Currency.SetCurrencyId(CommonId.Diamond, num);
    }

    private FulshListData() {
        let is_scroll = !this.shop_list_data || this.shop_list_data.length == 0;
        this.shop_list_data = this.data.GetShopDataByPage(this.select_tab_data.seq);
        this.viewNode.List.SetData(this.shop_list_data);
        this.viewNode.List.refreshVirtualList();
        is_scroll && this.viewNode.List.scrollToView(0);

        UH.SpriteName(this.viewNode.TabIcon, "ClothShop", ClothShopIconName[this.select_tab_data.seq]);
    }

    private GetListItemResource(index: number) {
        let data = this.shop_list_data[index];
        if (typeof (data) === "string") {
            return fgui.UIPackage.getItemURL("ClothShop", "ShopTitle");
        } else {
            return fgui.UIPackage.getItemURL("ClothShop", "ShopListCell");
        }
    }

    private onClickItem(item: BtnTab, event: fgui.Event) {
        if (!this.select_tab_data || this.select_tab_data.seq != item.tab_data.seq) {
            this.select_tab_data = item.tab_data;
            this.FulshListData();
            this.viewNode.List.scrollToView(0);
        }
    }

    // DoOpenWaitHandle() {
    // }

    // OpenCallBack() {
    // }

    // CloseCallBack() {
    // }
}

export class BtnTab extends fgui.GButton {
    private viewNode = {
        Title: <fgui.GTextField>null,
        Title_select: <fgui.GTextField>null,
    };
    tab_data: any;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.tab_data = data;
        UH.SetText(this.viewNode.Title, data.name);
        UH.SetText(this.viewNode.Title_select, data.name);
    }
}

export class ShopTitle extends fgui.GComponent {
    protected viewNode = {
        Title: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        UH.SetText(this.viewNode.Title, data);
    }
}

export class ShopCell extends fgui.GComponent {
    protected viewNode = {
        BtnBuy: <CommonButtonBuy>null,
        ItemCell: <ItemCell>null,
        Original: <fgui.GGroup>null,
        Discount: <fgui.GGroup>null,
        Icon1: <fgui.GLoader>null,
        Icon2: <fgui.GLoader>null,
        CostNum: <fgui.GTextField>null,
        TextOriginalCost: <fgui.GTextField>null,
        TextDiscountCost: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.data = data;
        let item_data = { itemId: data.item_id, num: data.item_num };
        let item_call = Item.Create(item_data, { is_click: true, is_num: true });
        this.viewNode.ItemCell.SetData(item_call);
        UH.SpriteName(this.viewNode.Icon1, "CommonAtlas", "Item" + data.buy_item);
        UH.SpriteName(this.viewNode.Icon2, "CommonAtlas", "Item" + data.buy_item);

        UH.SetText(this.viewNode.CostNum, data.buy_item_num);
        UH.SetText(this.viewNode.TextOriginalCost, data.buy_item_num);
        UH.SetText(this.viewNode.TextDiscountCost, data.buy_item_num * data.discount);

        this.viewNode.BtnBuy.onClick(this.onBuy, this);

        this.viewNode.Discount.visible = data.discount != 1;
        this.viewNode.Original.visible = data.discount == 1;
    }

    private onBuy() {
        ClothShopData.Inst().sendBuy(this.data);
    }
}

export class ShopListCell extends fgui.GComponent {
    private viewNode = {
        List: <fgui.GList>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.List.itemRenderer = this.renderListItem.bind(this);
    }

    private shop_data: any[];
    private renderListItem(index: number, item: any) {
        let self = this;
        item.SetData(self.shop_data[index]);
    }
    public SetData(data: any[]) {
        this.shop_data = data;
        this.viewNode.List.numItems = data.length;
    }
}

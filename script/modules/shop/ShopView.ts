import { CfgShop, CfgShopLabel } from "config/CfgShop";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { RechargeData, RechargeListInfo } from "modules/recharge/RechargeData";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { UH } from "../../helpers/UIHelper";
import { ShopBoxItem, ShopBoxItemCell } from "./ShopBoxItem";
import { CoreBoxData, ShopData } from "./ShopData";

@BaseView.registView
export class ShopView extends BaseView {
    private shopdata: { name: string, tab_data: CfgShopLabel[] }
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Shop",
        ViewName: "ShopView",
        LayerType: ViewLayer.Buttom,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        TxtTitle: <fgui.GTextField>null,
        ListTab: <fgui.GList>null,
        List: <fgui.GList>null,
        BtnReturn: <fgui.GButton>null,
        Currency1: <Currency>null,
        Currency2: <Currency>null,
    }

    protected extendsCfg = [
        { ResName: "BtnShop", ExtendsClass: BtnShop },
        { ResName: "ShopItemCell", ExtendsClass: ShopItemCell },
        { ResName: "ShopListCell", ExtendsClass: ShopListCell },
        { ResName: "ShopTitleCell", ExtendsClass: ShopTitleCell },
        { ResName: "BtnShopItem", ExtendsClass: CommonButtonBuy },
        { ResName: "ShopBoxItem", ExtendsClass: ShopBoxItem },
        { ResName: "ShopBoxItemCell", ExtendsClass: ShopBoxItemCell },
    ];

    private shop_data: ShopData = ShopData.Inst();
    private shop_list_data: any;
    private select_tab_data: CfgShopLabel;
    InitData(param: any) {
        let self = this;
        let mod_key = param && param.modkey ? param.modkey : Mod.Shop.View;;
        let page_index = 0;
        let shop_data = this.shopdata = self.shop_data.InitTabData(mod_key);
        if (!shop_data.name) {
            page_index = param.modkey % 10;
            shop_data = self.shop_data.InitTabData(mod_key - page_index);
        }
        let trial_shop = Mod.Trial.TrialShop == mod_key
        UH.SetText(this.viewNode.TxtTitle, shop_data.name);
        this.viewNode.Currency1.visible = !trial_shop
        this.viewNode.Currency1.SetCurrencyId(CommonId.Diamond);
        this.viewNode.Currency2.SetCurrencyId(trial_shop ? CommonId.ShiLianCoin : CommonId.Gold);
        this.viewNode.Currency1.BtnAddShow(true, { x: 40, y: 2 });
        this.viewNode.Currency2.BtnAddShow(!trial_shop, { x: 40, y: 2 });
        this.viewNode.BtnReturn.onClick(this.closeView.bind(this));
        self.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, self.onClickItem, self);
        self.viewNode.List.itemProvider = this.GetListItemResource.bind(this);
        self.viewNode.List.setVirtual();
        self.viewNode.ListTab.SetData(shop_data.tab_data);
        self.viewNode.ListTab.selectedIndex = page_index;
        this.select_tab_data = shop_data.tab_data[page_index];
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FulshListData.bind(this), "OtherChange");
        this.AddSmartDataCare(RechargeData.Inst().ResultData, this.FlushRechargeList.bind(this), "is_change");
        this.AddSmartDataCare(ShopData.Inst().result_info, this.FulshListData.bind(this), "is_limit_change");

        this.FulshListData();
    }

    SelectTabbar(mod_key: number) {
        let page_index = mod_key % 10;
        if (this.shopdata) {
            this.viewNode.ListTab.selectedIndex = page_index;
            this.select_tab_data = this.shopdata.tab_data[page_index];
            this.FulshListData();
            this.viewNode.List.scrollToView(0);
        }
    }

    InitUI() {
    }

    private FulshListData() {
        let is_scroll = !this.shop_list_data || this.shop_list_data.length == 0;
        this.shop_list_data = this.shop_data.GetShopDataByPage(this.select_tab_data.seq);
        this.viewNode.List.SetData(this.shop_list_data);
        this.viewNode.List.refreshVirtualList();
        is_scroll && this.viewNode.List.scrollToView(0);
    }

    private GetListItemResource(index: number) {
        let data = this.shop_list_data[index];
        if (data instanceof CoreBoxData) {
            return fgui.UIPackage.getItemURL("Shop", "ShopBoxItem");
        } else if (typeof (data) === "string")
            return fgui.UIPackage.getItemURL("Shop", "ShopTitleCell");
        else
            return fgui.UIPackage.getItemURL("Shop", "ShopListCell");
    }

    private onClickItem(item: BtnShop, event: fgui.Event) {
        if (!this.select_tab_data || this.select_tab_data.seq != item.tab_data.seq) {
            this.select_tab_data = item.tab_data;
            this.FulshListData();
            this.viewNode.List.scrollToView(0);
        }
    }

    private FlushRechargeList() {
        if (this.select_tab_data.shop_type == 2) {
            this.FulshListData();
        }
    }
}

export class BtnShop extends fgui.GButton {
    tab_data: CfgShopLabel;
    private handleCollector: HandleCollector;
    private viewNode = {
        title: <fgui.GTextField>null,
        title_select: <fgui.GTextField>null,
        redPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: CfgShopLabel) {
        this.tab_data = data;
        UH.SetText(this.viewNode.title, this.tab_data.name);
        UH.SetText(this.viewNode.title_select, this.tab_data.name);
        if (!this.handleCollector)
            this.handleCollector = HandleCollector.Create();
        else
            this.handleCollector.RemoveAll();
        this.addRemindCare(ModManger.TabMod(data.mod_key))
    }

    private addRemindCare(mod: any) {
        let self = this;
        this.handleCollector.Add(RemindGroupMonitor.Create(mod, self.freshRedPoint.bind(self, mod)));
    }

    private freshRedPoint(group: any) {
        this.viewNode.redPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

}

export class ShopItemCell extends fgui.GComponent {
    private viewNode = {
        GpDouble: <fgui.GGroup>null,
        TxtName: <fgui.GTextField>null,
        ItemCell: <ItemCell>null,
        BtnBuy: <CommonButtonBuy>null,
        TxtLimit: <fgui.GTextField>null,
        GpSellOut: <fgui.GGroup>null,
        Block: <fgui.GGraph>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Block.onClick(this.onBuy.bind(this));
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this));
    }

    private onBuy() {
        if (this.shopdata instanceof RechargeListInfo) {
            RechargeData.Inst().DoRecharge(this.shopdata);
        } else {
            ShopData.Inst().sendBuy(this.shopdata);
        }
    }

    private shopdata: CfgShop | RechargeListInfo;
    public SetData(data: CfgShop | RechargeListInfo) {
        let cell_data = this.viewNode.ItemCell.GetData();
        let TxtCost = this.viewNode.BtnBuy.GetTitle();
        if (data instanceof RechargeListInfo) {
            this.viewNode.GpDouble.visible = data.recharge_times == 0;
            if (!this.shopdata || !cell_data || cell_data.ItemId() != CommonId.Diamond || cell_data.Num() != data.info.addGold) {
                let icon_id = Item.CheckIconByIdNum(CommonId.Diamond, data.info.addGold);
                let extra_data = icon_id ? { icon_id: icon_id } : null;
                let item_data = { itemId: CommonId.Diamond, num: data.info.addGold, extra_data: extra_data };
                this.viewNode.ItemCell.SetData(Item.Create(item_data, { is_num: true, is_click: false }));
                UH.SetText(this.viewNode.TxtName, Item.GetName(CommonId.Diamond));
                this.viewNode.BtnBuy.SetIcon(true, "RenMinBiXiaoHuang", "CommonButton");
                UH.SetText(TxtCost, data.info.moneyShow / 100, COLORS.Yellow2);
            }
            this.viewNode.GpSellOut.visible = false;
        }
        else {
            this.viewNode.GpDouble.visible = false;
            if (!this.shopdata || !cell_data || cell_data.ItemId() != data.item_id || cell_data.Num() != data.item_num) {
                let icon_id = Item.CheckIconByIdNum(data.item_id, data.item_num);
                let extra_data = icon_id ? { icon_id: icon_id } : null;
                let item_data = { itemId: data.item_id, num: data.item_num, extra_data: extra_data };
                this.viewNode.ItemCell.SetData(Item.Create(item_data, { is_num: true, is_click: false }));
                this.viewNode.BtnBuy.SetIcon(true, "Item" + data.exchange_item_id, 'CommonAtlas');
                UH.SetText(this.viewNode.TxtName, Item.GetName(data.item_id));
            }
            let color = Item.GetNum(data.exchange_item_id) < data.exchange_item_num ? COLORS.Red1 : COLORS.Yellow2;
            UH.SetText(TxtCost, data.exchange_item_num, color);
            if (data.quota_type == 0) {
                this.viewNode.TxtLimit.visible = this.viewNode.GpSellOut.visible = false;
                this.viewNode.GpSellOut.visible = false;
            } else {
                let buy_num = ShopData.Inst().GetBuyCount(data.index);
                let num = data.param - buy_num;
                UH.SetText(this.viewNode.TxtLimit, Language.Shop.limit_desc[data.quota_type] + num + "/" + data.param);
                this.viewNode.TxtLimit.visible = true;
                this.viewNode.GpSellOut.visible = num <= 0;
            }
        }
        this.shopdata = data;
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

    private shop_data: CfgShop[];
    private renderListItem(index: number, item: any) {
        let self = this;
        item.SetData(self.shop_data[index]);
    }
    public SetData(data: CfgShop[]) {
        this.shop_data = data;
        this.viewNode.List.numItems = data.length;
    }
}

export class ShopTitleCell extends fgui.GComponent {
    private viewNode = {
        title: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: string) {
        UH.SetText(this.viewNode.title, data)
    }
}
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCell } from "modules/extends/ItemCell";
import { BoardData } from "modules/common_board/BoardData";
import { MysteryShopCtrl, MysteryShopeData, MysteryShopListData, MysteryShopReq } from "./MysteryShopCtrl";
import { UH } from "../../../helpers/UIHelper";
import { Language } from "modules/common/Language";
import { ShopView } from "../ShopView";
import { Item } from "modules/bag/ItemData";
import { BagData } from "modules/bag/BagData";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { FastBuyCtrl } from "modules/FastUse/FastBuyCtrl";
import { TextHelper } from "../../../helpers/TextHelper";


@BaseView.registView
export class MysteryShopView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MysteryShop",
        ViewName: "MysteryShopView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        TxtLimit: <fgui.GTextField>null,
        BtnAdd: <fgui.GButton>null,
        BtnRefresh: <fgui.GButton>null,
    }

    protected extendsCfg = [
        { ResName: "MysteryShopCell", ExtendsClass: MysteryShopCell },
    ];

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    OpenCallBack() {
        MysteryShopCtrl.Inst().SendMysteryShopReq(MysteryShopReq.Open)
    }

    InitData() {
        this.viewNode.Board.SetData(new BoardData(MysteryShopView));
        this.viewNode.List.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.List.setVirtual();
        this.AddSmartDataCare(MysteryShopeData.Inst().mystery_shop_result_info, this.FlushList.bind(this), "shop_info");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushList.bind(this), "OtherChange");
    }

    InitUI() {
        this.viewNode.BtnAdd.onClick(this.onAdd.bind(this));
        this.viewNode.BtnRefresh.onClick(this.onRefresh.bind(this));
        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        this.FlushList();
    }

    private FlushList() {
        this.list_data = MysteryShopeData.Inst().GetShopInfo();
        this.viewNode.List.numItems = this.list_data.length;
        this.FlushRefreshTimes();
    }

    private FlushRefreshTimes() {
        let times = MysteryShopeData.Inst().getReFreshTime();
        UH.SetText(this.viewNode.TxtLimit, Language.MysteryShop.refresh_limit + times);
    }

    private list_data: MysteryShopListData[];
    private renderListItem(index: number, item: MysteryShopCell) {
        item.SetData(this.list_data[index]);
    }

    private onAdd() {
        ViewManager.Inst().CloseView(MysteryShopView);
        ViewManager.Inst().OpenView(ShopView);
    }

    private onRefresh() {
        let times = MysteryShopeData.Inst().getReFreshTime();
        if (times > 0)
            MysteryShopCtrl.Inst().SendMysteryShopReq(MysteryShopReq.Refresh);
        else
            FastBuyCtrl.Inst().checkFastBuy(MysteryShopeData.Inst().getRefreshId());
        // PublicPopupCtrl.Inst().Center(Language.Common.refresh_limit)
    }

    private onClickItem(item: MysteryShopCell, event: fgui.Event) {
        MysteryShopeData.Inst().sendBuy(item.shop_data);
    }

}

export class MysteryShopCell extends fgui.GComponent {
    private viewNode = {
        TxtName: <fgui.GTextField>null,
        Cell: <ItemCell>null,
        ImgIcon: <fgui.GLoader>null,
        TxtCostNum: <fgui.GTextField>null,
        TxtLimit: <fgui.GTextField>null,
        GpSellOut: <fgui.GGroup>null,
        GpDiscount: <fgui.GGroup>null,
        TxtDiscount: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    shop_data: MysteryShopListData;
    public SetData(data: MysteryShopListData) {
        this.shop_data = data;
        UH.SetText(this.viewNode.TxtName, Item.GetName(data.cfg.item_id));
        let color = Item.GetNum(data.cfg.exchange_item_id) < data.cfg.exchange_item_num ? COLORS.Red1 : COLORS.White;
        let stro_color = Item.GetNum(data.cfg.exchange_item_id) < data.cfg.exchange_item_num ? COLORS.Red2 : COLORS.Yellow2;
        this.viewNode.TxtCostNum.strokeColor = stro_color;
        UH.SetText(this.viewNode.TxtCostNum, data.cfg.exchange_item_num, color);
        UH.SetText(this.viewNode.TxtLimit, Language.MysteryShop.limit_buy + (data.flag == 1 ? "0" : "1") + "/1");
        this.viewNode.GpSellOut.visible = data.flag == 1;
        this.viewNode.Cell.SetData(data.item_cell_data);
        UH.GoldIcon(this.viewNode.ImgIcon, data.cfg.exchange_item_id);
        if(data.cfg.discount==10){
            this.viewNode.GpDiscount.visible=false;
        }else{
            this.viewNode.GpDiscount.visible = true;
            UH.SetText(this.viewNode.TxtDiscount, TextHelper.Format(Language.MysteryShop.discount, data.cfg.discount) );
        }
    }
}
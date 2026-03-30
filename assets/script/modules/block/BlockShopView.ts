
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { CommonId, ICON_TYPE } from "modules/common/CommonEnum";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { ShopData } from "modules/shop/ShopData";
import { UH } from "../../helpers/UIHelper";
import { BlockData } from "./BlockData";

@BaseView.registView
export class BlockShopView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BlockShop",
        ViewName: "BlockShopView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        ShowList: <fgui.GList>null,
        CurrencyShow1: <Currency>null,
        CurrencyShow2: <Currency>null,
    };

    protected extendsCfg = [
        { ResName: "TypeItem", ExtendsClass: BlockShopViewTypeItem },
        { ResName: "PageItem", ExtendsClass: BlockShopViewPageItem },
        { ResName: "SpaceItem", ExtendsClass: BlockShopViewSpaceItem },
        { ResName: "MonoItem", ExtendsClass: BlockShopViewMonoItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(BlockShopView));

        this.viewNode.ShowList.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.ShowList.setVirtual();

        this.viewNode.CurrencyShow1.SetCurrencyId(CommonId.Diamond, true);
        this.viewNode.CurrencyShow1.BtnAddShow(false)
        this.viewNode.CurrencyShow2.SetCurrencyId(BlockData.Inst().CfgOtherJiMuQuanId(), true);
        this.viewNode.CurrencyShow2.BtnAddShow(false)

        this.AddSmartDataCare(ShopData.Inst().result_info, this.FlushShow.bind(this), "is_limit_change");
    }

    InitUI() {
        this.FlushShow();
    }

    FlushShow() {
        let show_list = BlockData.Inst().GetShopShowList()
        this.showList = show_list
        this.viewNode.ShowList.SetData(show_list)
    }

    private showList: any[] = []

    private GetListItemResource(index: number) {
        let data = this.showList[index];
        if (data.space) {
            return fgui.UIPackage.getItemURL("BlockShop", "SpaceItem");
        }
        else if (typeof (data) == "string") {
            return fgui.UIPackage.getItemURL("BlockShop", "TypeItem");
        } else {
            return fgui.UIPackage.getItemURL("BlockShop", "PageItem");
        }
    }
}

export class BlockShopViewTypeItem extends BaseItem {
    protected viewNode = {
        TitleShow: <fgui.GTextField>null,
    };
    public SetData(data: string) {
        UH.SetText(this.viewNode.TitleShow, data)
    }
}

export class BlockShopViewPageItem extends BaseItem {
    protected viewNode = {
        ShowList: <fgui.GList>null,
    };
    public SetData(data: any) {
        this.viewNode.ShowList.SetData(data)
    }
}

export class BlockShopViewSpaceItem extends BaseItem {
}


export class BlockShopViewMonoItem extends BaseItemGB {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        IconShow: <fgui.GLoader>null,
        PriceShow: <fgui.GTextField>null,
        NameShow: <fgui.GRichTextField>null,
        CellShow: <ItemCell>null,
        GpMask: <fgui.GGroup>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.onClick(this.OnClickBuy.bind(this));
    }

    public SetData(data: any) {
        super.SetData(data);
        let item = Item.Create({ item_id: data.item_id, num: data.item_num }, { is_click: false, is_num: true })
        this.viewNode.CellShow.SetData(item)
        UH.SetText(this.viewNode.NameShow, item.QuaNameOL());
        UH.SetText(this.viewNode.PriceShow, data.exchange_item_num);
        UH.SetIcon(this.viewNode.IconShow, Item.GetIconId(data.exchange_item_id), ICON_TYPE.ITEM);

        let buy_num = ShopData.Inst().GetBuyCount(data.index);
        this.viewNode.GpMask.visible = (data.param > 0) && ((data.param - buy_num) <= 0);

        this.InitGuide()
    }

    public OnClickBuy() {
        ShopData.Inst().sendBuy(this._data);
    }

    public InitGuide() {
        if (5 == this._data.page_1 && 1 == this._data.seq) {
            GuideCtrl.Inst().AddGuideUi("BlockShopBuy1", this);
        }
    }
    protected onDestroy(): void {
        if (5 == this._data.page_1 && 1 == this._data.seq) {
            GuideCtrl.Inst().ClearGuideUi("BlockShopBuy1");
        }
        super.onDestroy();
    }
}
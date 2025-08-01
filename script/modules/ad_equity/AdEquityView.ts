import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { ViewLayer, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { EGLoader } from "modules/extends/EGLoader";
import { KnightCardData } from "modules/knight_card/KnightCardData";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";

export class AdEquityView extends fgui.GComponent {
    private handleCollector: HandleCollector;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Serveractivity",
        ViewName: "AdEquityView",
        LayerType: ViewLayer.Normal,
    };

    protected viewNode = {
        BgSp: <EGLoader>null,
        BtnBuy: <CommonButtonBuy>null,
        ShowList: <fgui.GList>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.ShowList._container.addComponent(CocHighPerfList)

        this.InitData();
        this.InitUI();
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);

    }

    private InitData() {
        this.viewNode.BtnBuy.onClick(this.OnClickBuy, this);
        this.viewNode.BgSp.SetIcon(`loader/serveractivity/ad_equity_bg`, () => { })

        this.addSmartDataCare(KnightCardData.Inst().ResultData, this.FlushShow.bind(this), "Info");
    }

    private InitUI() {
        this.FlushShow()
    }

    private FlushShow() {
        let is_buy = KnightCardData.Inst().GetKnightCardIsBuy()
        this.viewNode.ShowList.SetData(Language.AdEquity.DescShow)
        this.viewNode.BtnBuy.SetIcon(!is_buy, "RenMinBiDaHuang", "CommonButton");
        this.viewNode.BtnBuy.title = is_buy ? Language.KnightCard.BtnBuyedShow : `${KnightCardData.Inst().CfgKnightCardBuyMoney() / 10}`;
        this.viewNode.BtnBuy.grayed = is_buy
        this.viewNode.BtnBuy.touchable = !is_buy
    }

    private OnClickBuy() {
        let buy_money = KnightCardData.Inst().CfgKnightCardBuyMoney();
        let order_data = Order_Data.initOrder(0, ACTIVITY_TYPE.AdEquity, buy_money / 10, buy_money, Language.AdEquity.productName, 0);
        OrderCtrl.generateOrder(order_data);
    }
}

export class AdEquityShowItem extends BaseItem {
    protected viewNode = {
        DescShow: <fgui.GTextField>null,
        ValShow: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        let desc_show = data.desc_show
        if (undefined != data.val_show) {
            let reward = KnightCardData.Inst().CfgKnightCardFirstBuyRewardItem()
            desc_show = TextHelper.Format(desc_show, Item.GetName(reward.item_id))
            UH.SetIcon(this.viewNode.Icon, Item.GetIconId(reward.item_id), ICON_TYPE.ITEM);
            UH.SetText(this.viewNode.ValShow, reward.num)
        }
        this.viewNode.Icon.visible = undefined != data.val_show
        UH.SetText(this.viewNode.DescShow, desc_show)
    }
}
import { RedPoint } from 'modules/extends/RedPoint';
import { CfgItem } from "config/CfgCommon";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UH } from "../../helpers/UIHelper";
import { MonthlyCardCtrl, MonthlyCardData, MonthlyCard_OP_TYPE } from "./MonthlyCardCtrl";
export class MonthlyCardView extends BaseItem {
    protected viewNode = {
        List: <fgui.GList>null,
        BtnArrowLeft: <fgui.GButton>null,
        BtnArrowRight: <fgui.GButton>null,
        BtnRightRed: <RedPoint>null,
        ArrowRight: <fgui.GGroup>null,
    };

    private handleCollector: HandleCollector;
    private cardsNum: number;
    static CurSelCardIndex: number = 0;

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.addSmartDataCare(MonthlyCardData.Inst().ResultData, this.FlushData.bind(this), "info");
        this.addSmartDataCare(RoleData.Inst().ResultData, this.FlushData.bind(this), "roleLevel");

        this.viewNode.List.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.BtnArrowLeft.onClick(this.OnClickArrowLeft, this);
        this.viewNode.BtnArrowRight.onClick(this.OnClickArrowRight, this);
        this.FlushData();
        this.SetSelect(true);
    }

    public FlushData() {
        if (MonthlyCardData.Inst().ResultData.info) {
            // this.viewNode.List.SetData(MonthlyCardData.Inst().ResultData.info.cardList, this.OnClickCardItem, MonthlyCardView.CurSelCardIndex);
            let cardList = []
            for (let element of MonthlyCardData.Inst().ResultData.info.cardList) {
                let cfg = MonthlyCardData.Inst().GetMonthlyCardInfo(element.cardType)
                if (cfg) {
                    if (FunOpen.Inst().GetFunIsOpen(cfg.mod_key).is_open) {
                        cardList.push(element)
                    }
                }
            }
            let curSelCard = Math.min(cardList.length, MonthlyCardView.CurSelCardIndex)
            this.showList = cardList
            this.viewNode.List.SetData(this.showList);
            this.viewNode.List.scrollToView(curSelCard)
            this.viewNode.List.selectedIndex = curSelCard
            this.cardsNum = cardList.length
            this.viewNode.BtnRightRed.SetNum(MonthlyCardData.Inst().GetFetchMarkRed(1));
            this.FlushArrow()
        }
    }

    private FlushArrow() {
        this.viewNode.BtnArrowLeft.visible = MonthlyCardView.CurSelCardIndex > 0 && this.cardsNum > 0
        this.viewNode.ArrowRight.visible = MonthlyCardView.CurSelCardIndex < this.cardsNum - 1
    }

    private showList: any[]
    private GetListItemResource(index: number) {
        let data = this.showList[index];
        switch (data.cardType) {
            case 1:
                return fgui.UIPackage.getItemURL("Serveractivity", "MonthlyFishCardCell");
            default:
                return fgui.UIPackage.getItemURL("Serveractivity", "MonthlyCardCell");
        }
    }

    public SetSelect(select: boolean) {
        this.visible = select;
        if (select) {
            MonthlyCardData.Inst().ClearFirstRemind();
        }
    }
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
    private OnClickCardItem() {
    }

    private OnClickArrowLeft() {
        MonthlyCardView.CurSelCardIndex = MonthlyCardView.CurSelCardIndex - 1
        this.FlushData()
    }

    private OnClickArrowRight() {
        MonthlyCardView.CurSelCardIndex = MonthlyCardView.CurSelCardIndex + 1
        this.FlushData()
    }
}

export class MonthlyCardCell extends BaseItem {
    protected viewNode = {
        Bg: <EGLoader>null,
        ListRewardDesc: <fgui.GList>null,
        GpFistActive: <fgui.GGroup>null,
        FirstActiveReward: <ItemCell>null,
        BtnBuy: <CommonButtonBuy>null,
        ListReward: <fgui.GList>null,
        GpTime: <fgui.GGroup>null,
        TxtTime: <fgui.GTextField>null,
        EffectShow: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this))
    }

    public SetData(data: PB_RaMonthCardData) {
        this._data = data;
        this.viewNode.Bg.SetIcon("loader/serveractivity/monthly_card/YueKa_KaPian0", () => { })
        let cfg = MonthlyCardData.Inst().GetMonthlyCardInfo(data.cardType) //CfgMonthlyCard.month_card_configuration[data.cardType];
        if (cfg) {
            this.viewNode.GpFistActive.visible = false;
            if (data.haveDays > 0) {
                this.viewNode.GpTime.visible = this.viewNode.ListReward.visible = true;
                this.viewNode.TxtTime.text = data.haveDays + Language.Date.day;
                this.viewNode.ListReward.SetData(Item.DefaultCreateListItem(cfg.day_reward_item));
            } else {
                this.viewNode.GpTime.visible = this.viewNode.ListReward.visible = false;
                if (!data.firstBuyMark && cfg.first_buy_reward_item) {
                    this.viewNode.GpFistActive.visible = true;
                    this.viewNode.FirstActiveReward.SetData(Item.Create(cfg.first_buy_reward_item, { is_num: true }));
                }
            }
            if (data.haveDays > 1 && data.fetchMark == 1) {
                this.viewNode.BtnBuy.SetIcon(false);
                this.viewNode.BtnBuy.SetTitle(Language.ActCommon.YiLingQu);
                this.viewNode.BtnBuy.grayed = true;
                this.viewNode.EffectShow.StopAllEff();
            } else {
                this.viewNode.BtnBuy.grayed = false;
                if (data.haveDays > 0 && data.fetchMark == 0) {
                    this.viewNode.BtnBuy.SetIcon(false);
                    this.viewNode.BtnBuy.SetTitle(Language.ActCommon.LingQu);
                } else {
                    this.viewNode.BtnBuy.SetIcon(true, "RenMinBiDaHuang", "CommonButton");
                    this.viewNode.BtnBuy.title = cfg.buy_money / 10 + "";// RechargeData.Inst().GetLocalSign() + 
                }
                this.viewNode.EffectShow.PlayEff(4164060);
            }
            let list = [];
            list.push({ desc: Language.MonthlyCard.UnLockGet, num: cfg.buy_reward_item.num, item_id: cfg.buy_reward_item.item_id });
            for (let i = 0; i < cfg.day_reward_item.length; i++) {
                list.push({ desc: Language.MonthlyCard.DailyGet, num: cfg.day_reward_item[i].num, item_id: cfg.day_reward_item[i].item_id });
            }
            this.viewNode.ListRewardDesc.SetData(list)
        }
    }

    private onBuy() {
        if (this._data) {
            if ((this._data.fetchMark && this._data.haveDays == 1) || this._data.haveDays <= 0) {
                let cfg = MonthlyCardData.Inst().GetMonthlyCardInfo(this._data.cardType)
                let order_data = Order_Data.initOrder(this._data.cardType, ACTIVITY_TYPE.MonthlyCard, cfg.buy_money / 10, cfg.buy_money, Language.MonthlyCard.MonthlyCard, 0);
                OrderCtrl.generateOrder(order_data);
            } else if (!this._data.fetchMark && this._data.haveDays > 0) {
                MonthlyCardCtrl.Inst().SendReq(MonthlyCard_OP_TYPE.FETCH, this._data.cardType)
            } else {
                PublicPopupCtrl.Inst().Center(Language.MonthlyCard.Tip)
            }
        }
    }
}

export class MonthlyCardRewardCell extends BaseItem {
    protected viewNode = {
        TxtDesc: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
        TxtNum: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Icon.onClick(this.OnClickIcon.bind(this))
    }

    public SetData(data: { desc: string, item_id: number, num: number }) {
        this._data = data
        UH.SetText(this.viewNode.TxtDesc, data.desc);
        if (data.item_id)
            UH.SetIcon(this.viewNode.Icon, Item.GetIconId(data.item_id), ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.TxtNum, data.num);
        if (data.item_id == 40093 || data.item_id == 40091) {
            this.viewNode.Icon.width = 86;
            this.viewNode.Icon.height = 86;
            this.viewNode.Icon.scaleX = 0.7;
            this.viewNode.Icon.scaleY = 0.7;
        }
    }

    public OnClickIcon() {
        if (this._data && this._data.item_id)
            Item.OnItemInfo(Item.Create(new CfgItem(this._data.item_id)))
    }
}


export class MonthlyFishCardCell extends BaseItem {
    protected viewNode = {
        Bg: <EGLoader>null,
        BtnBuy: <CommonButtonBuy>null,

        GpFistActive: <fgui.GGroup>null,
        GpTime: <fgui.GGroup>null,

        FirstActiveReward: <ItemCell>null,
        ListRewardDesc: <fgui.GList>null,
        ListReward: <fgui.GList>null,

        TxtTime: <fgui.GTextField>null,
        EffectShow: <UIEffectShow>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.OnClickBuy.bind(this))
    }

    public SetData(data: any) {
        super.SetData(data)
        this.viewNode.Bg.SetIcon("loader/serveractivity/monthly_card/YueKa_KaPian1", () => { })
        let cfg = MonthlyCardData.Inst().GetMonthlyCardInfo(data.cardType) //CfgMonthlyCard.month_card_configuration[data.cardType];
        if (cfg) {
            this.viewNode.GpFistActive.visible = false;
            if (data.haveDays > 0) {
                this.viewNode.GpTime.visible = this.viewNode.ListReward.visible = true;
                this.viewNode.TxtTime.text = data.haveDays + Language.Date.day;
                this.viewNode.ListReward.SetData(Item.DefaultCreateListItem(cfg.day_reward_item));
            } else {
                this.viewNode.GpTime.visible = this.viewNode.ListReward.visible = false;
                if (!data.firstBuyMark && cfg.first_buy_reward_item) {
                    this.viewNode.GpFistActive.visible = true;
                    this.viewNode.FirstActiveReward.SetData(Item.Create(cfg.first_buy_reward_item, { is_num: true }));
                }
            }
            if (data.haveDays > 1 && data.fetchMark == 1) {
                this.viewNode.BtnBuy.SetIcon(false);
                this.viewNode.BtnBuy.SetTitle(Language.ActCommon.YiLingQu);
                this.viewNode.BtnBuy.grayed = true;
                this.viewNode.EffectShow.StopAllEff();
            } else {
                this.viewNode.BtnBuy.grayed = false;
                if (data.haveDays > 0 && data.fetchMark == 0) {
                    this.viewNode.BtnBuy.SetIcon(false);
                    this.viewNode.BtnBuy.SetTitle(Language.ActCommon.LingQu);
                } else {
                    this.viewNode.BtnBuy.SetIcon(true, "RenMinBiDaHuang", "CommonButton");
                    this.viewNode.BtnBuy.title = cfg.buy_money / 10 + "";// RechargeData.Inst().GetLocalSign() + 
                }
                this.viewNode.EffectShow.PlayEff(4164060);
            }
            let list = [];
            list.push({ desc: Language.MonthlyCard.UnLockGet, num: cfg.buy_reward_item.num, item_id: cfg.buy_reward_item.item_id });
            for (let i = 0; i < cfg.day_reward_item.length; i++) {
                list.push({ desc: Language.MonthlyCard.DailyGet, num: cfg.day_reward_item[i].num, item_id: cfg.day_reward_item[i].item_id });
            }
            list.push({ desc: Language.MonthlyCard.FishSpeed2, num: "", item_id: 0 });
            this.viewNode.ListRewardDesc.SetData(list)
        }
    }

    private OnClickBuy() {
        if (this._data) {
            if ((this._data.fetchMark && this._data.haveDays == 1) || this._data.haveDays <= 0) {
                let cfg = MonthlyCardData.Inst().GetMonthlyCardInfo(this._data.cardType)
                let order_data = Order_Data.initOrder(this._data.cardType, ACTIVITY_TYPE.MonthlyCard, cfg.buy_money / 10, cfg.buy_money, Language.MonthlyCard.MonthlyCard, 0);
                OrderCtrl.generateOrder(order_data);
            } else if (!this._data.fetchMark && this._data.haveDays > 0) {
                MonthlyCardCtrl.Inst().SendReq(MonthlyCard_OP_TYPE.FETCH, this._data.cardType)
            } else {
                PublicPopupCtrl.Inst().Center(Language.MonthlyCard.Tip)
            }
        }
    }
}


import { CfgDailyGiftData } from "config/CfgDailyGift";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { CommonId, AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Order_Data, OrderCtrl } from "modules/recharge/OrderCtrl";
import { RechargeData } from "modules/recharge/RechargeData";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { DailyGiftData, DailyGiftCtrl, DailyGift_OP_TYPE } from "./DailyGiftCtrl";

export class DailyGiftView extends BaseItem {
    protected viewNode = {
        List: <fgui.GList>null,
    };
    private handleCollector: HandleCollector;

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
        this.addSmartDataCare(DailyGiftData.Inst().ResultData, this.FlushData.bind(this), "info");
        this.viewNode.List.setVirtual();
        this.viewNode.List._container.addComponent(CocHighPerfList)
        this.FlushData();
    }

    public FlushData() {
        this.viewNode.List.SetData(DailyGiftData.Inst().GetDailyGiftList());
    }
    
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
}

export class DailyGiftCell extends BaseItem {
    protected viewNode = {
        Bg: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        TxtValue: <fgui.GTextField>null,
        TxtName: <fgui.GTextField>null,
        ListReward: <fgui.GList>null,
        TxtLimit: <fgui.GTextField>null,
        BtnBuy: <CommonButtonBuy>null,
        GpValue: <fgui.GGroup>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this));
    }
    public SetData(data: { cfg: CfgDailyGiftData, buy_count: number, is_sell_out: boolean, limit_times: number }) {
        this._data = data;
        let cfg = data.cfg;
        UH.SpriteName(this.viewNode.Bg, "Serveractivity", "LiBao" + cfg.gift_color);
        let btn_icon = this.viewNode.BtnBuy.GetIcon();
        this.viewNode.GpValue.visible = cfg.gift_value != 0;
        this.viewNode.TxtLimit.visible = true;
        if (cfg.price == 0) {
            this.viewNode.Icon.visible = false;
            this.viewNode.TxtLimit.visible = false;
            if (data.is_sell_out) {
                btn_icon.visible = false;
                this.viewNode.BtnBuy.title = Language.ActCommon.YiLingQu;
            } else {
                if (DailyGiftData.Inst().IsAdFree()) {
                    btn_icon.visible = true;
                    UH.SpriteName(btn_icon, "CommonAtlas", "GuangGaoTuBiao")
                    this.viewNode.BtnBuy.title = Language.ActCommon.Free;
                } else {
                    btn_icon.visible = false;
                    this.viewNode.BtnBuy.SetTitle(Language.ActCommon.Free);
                }
            }
        } else if (cfg.price_type == 3) {
            this.viewNode.Icon.visible = false;
            btn_icon.visible = !data.is_sell_out;
            UH.SpriteName(btn_icon, "CommonButton", "RenMinBiZhongLv")
            this.viewNode.BtnBuy.title = data.is_sell_out ? Language.ActCommon.YiGouMai : cfg.price / 10 + "";
        } else {
            let id = cfg.price_type == 1 ? CommonId.Diamond : CommonId.Gold;
            UH.GoldIcon(this.viewNode.Icon, id);
            UH.GoldIcon(btn_icon, id);
            this.viewNode.Icon.visible = true;
            btn_icon.visible = !data.is_sell_out;
            this.viewNode.BtnBuy.title = data.is_sell_out ? Language.ActCommon.YiGouMai : cfg.price + "";
        }
        this.viewNode.BtnBuy.playEffect(data.is_sell_out ? null : 4164061)
        this.viewNode.BtnBuy.GetRedPoint().SetNum(cfg.price == 0 && !data.is_sell_out ? 1 : 0);
        UH.SetText(this.viewNode.TxtName, cfg.gift_name);
        UH.SetText(this.viewNode.TxtValue, cfg.price_type == 3 ? RechargeData.Inst().GetLocalSign() + cfg.gift_value : cfg.gift_value);
        UH.SetText(this.viewNode.TxtLimit, TextHelper.Format(Language.ActCommon.XianGou[cfg.limit_type], data.limit_times + "/" + cfg.limit_convert_count));
        this.viewNode.ListReward.SetData(Item.DefaultCreateListItem(cfg.reward_item, { is_gray: data.is_sell_out, is_click: true, is_num: true, eff: 0 }));
        this.grayed = data.is_sell_out;
    }

    private onBuy() {
        if (this._data) {
            let cfg: CfgDailyGiftData = this._data.cfg;
            if (this._data.buy_count < cfg.limit_convert_count) {
                if (cfg.price == 0) {
                    if (DailyGiftData.Inst().IsAdFree()) {
                        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.daily_free_gift)
                        let co = RoleData.Inst().CfgAdTypeSeq(AdType.daily_free_gift)
                        if (info) {
                            if (info.todayCount >= co.ad_param && co.ad_param != 0) {
                                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                                return
                            } else if (info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
                                PublicPopupCtrl.Inst().Center(Language.Common.AdColdTime);
                                return
                            }
                        }
                        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.daily_free_gift + "", "", 0, cfg.type);
                    } else
                        DailyGiftCtrl.Inst().SendDailyGiftReq(DailyGift_OP_TYPE.Buy, cfg.type);
                } else if (cfg.price_type == 3) {
                    let order = Order_Data.initOrder(cfg.type, ACTIVITY_TYPE.DailyGift, cfg.price / 10, cfg.price, cfg.gift_name, 0);
                    OrderCtrl.generateOrder(order);
                } else {
                    let id: number = cfg.price_type == 1 ? CommonId.Diamond : CommonId.Gold;
                    let has_num = Item.GetNum(id);
                    if (has_num >= cfg.price) {
                        DailyGiftCtrl.Inst().SendDailyGiftReq(DailyGift_OP_TYPE.Buy, cfg.type);
                    } else {
                        PublicPopupCtrl.Inst().ItemNotEnoughNotice(id);
                    }
                }
            }
        }
    }
}
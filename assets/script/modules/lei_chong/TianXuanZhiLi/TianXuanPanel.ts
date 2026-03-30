import { CfgItem } from "config/CfgCommon";
import { CfgGiftConfiguration } from "config/CfgTianXuanZhiLi";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../../helpers/TextHelper";
import { TimeHelper } from "../../../helpers/TimeHelper";
import { UH } from "../../../helpers/UIHelper";
import { LeiChongBasePanel } from "../LeiChongBasePanel";
import { TianXuanZhiLiData, TianXuan_OP_TYPE } from "./TianXuanZhiLiCtrl";

export class TianXuanPanel extends LeiChongBasePanel {

    protected viewNode = {
        FreeCell: <ItemCell>null,
        Lbtitle1: <fgui.GTextField>null,
        Lbtitle2: <fgui.GTextField>null,
        Lbtitle3: <fgui.GTextField>null,
        GiftList: <fgui.GList>null,
        BtnReturn: <fgui.GButton>null,
        timer: <TimeMeter>null,
        LbTime: <fgui.GRichTextField>null,
        EffTime: <UIEffectShow>null,
        ImgRight: <fgui.GObject>null,
        ImgLeft: <fgui.GObject>null,
        redPoint: <RedPoint>null,
    }

    InitData() {
        this.viewNode.GiftList.setVirtual();
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this), this.FlushUpdateTime.bind(this));
        this.AddSmartDataCare(TianXuanZhiLiData.Inst().ResultData, this.FlushData.bind(this), "info");
        this.viewNode.FreeCell.onClick(this.onItemClick.bind(this));
        this.FlushFlushTime();
        this.FlushData();

    }

    private FlushData() {
        if (TianXuanZhiLiData.Inst().IsTianXuanActShow) {
            this.viewNode.GiftList.SetData(TianXuanZhiLiData.Inst().GetGiftCfgBySeqs());
            let is_feth = TianXuanZhiLiData.Inst().ResultData.info.hasFetchFreeGift ? 1 : 0;
            let item = TianXuanZhiLiData.Inst().GetOtherCfg().free_reward_item[0];
            this.viewNode.redPoint.SetNum(is_feth ? 0 : 1);
            this.viewNode.FreeCell.SetData(Item.Create(item, { is_click: is_feth, is_gray: is_feth, eff: is_feth ? -1 : 0, is_num: true }));
        }
    }

    InitUI() {
        let title = TianXuanZhiLiData.Inst().GetTitle();
        UH.SetText(this.viewNode.Lbtitle1, title[0]);
        UH.SetText(this.viewNode.Lbtitle2, title[1]);
        UH.SetText(this.viewNode.Lbtitle3, title[2]);
        this.viewNode.EffTime.PlayEff(4164111)
        if (TianXuanZhiLiData.Inst().ResultData.info.gifts.length <= 2) {
            this.viewNode.ImgRight.visible = this.viewNode.ImgLeft.visible = false;
        }
    }
    private FlushFlushTime() {
        let time = TianXuanZhiLiData.Inst().ResultData.info.giftCloseTimestamp - TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_3);
        if (time <= 0) {
            this.viewNode.timer.CloseCountDownTime();
            //ViewManager.Inst().CloseView(LeiChongView);
        }
    }

    private FlushUpdateTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);
        let t_str = TextHelper.Format(Language.LeiChong.TimeStr, time_t.minute, time_t.second);
        UH.SetText(this.viewNode.LbTime, Language.WeekHaoLi.TimeLimit + t_str)
    }

    private onItemClick() {
        if (!TianXuanZhiLiData.Inst().ResultData.info.hasFetchFreeGift) {
            TianXuanZhiLiData.Inst().SendReq(TianXuan_OP_TYPE.FETCH_FREE_GIFT);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
    }

}

export class TianXuanCell extends BaseItem {
    protected viewNode = {
        LbName: <fgui.GTextField>null,
        GiftList: <fgui.GList>null,
        LbDis: <fgui.GTextField>null,
        LbValue: <fgui.GTextField>null,
        BtnBuy: <CommonButtonBuy>null
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.GiftList.setVirtual();
        this.viewNode.BtnBuy.onClick(this.onBtnClick.bind(this));
    }
    public SetData(data: { sort: number, data: CfgGiftConfiguration }) {
        this._data = data.data;
        UH.SetText(this.viewNode.LbName, this._data.name);
        let dis = TextHelper.Format(Language.MysteryShop.discount, data.data.discount);
        this.viewNode.BtnBuy.enabled = true;
        UH.SetText(this.viewNode.LbDis, dis);
        if (data.data.price_type == 3) { //直购
            let value = TextHelper.Format(Language.LeiChong.ValueTip, data.data.gift_value);
            UH.SetText(this.viewNode.LbValue, value);
            let price = TextHelper.Format(Language.LeiChong.BtnTitle, data.data.price / 10);
            this.viewNode.BtnBuy.SetTitle(price);
        } else if (data.data.price_type == 2) {//金币
            let value = TextHelper.Format(Language.LeiChong.ValueTip2, data.data.gift_value);
            UH.SetText(this.viewNode.LbValue, value);
            this.viewNode.BtnBuy.SetIcon(true, "Item" + CommonId.Gold, "CommonAtlas");
            this.viewNode.BtnBuy.SetTitle(data.data.price + "");
        } else if (data.data.price_type == 1) { //钻石
            let value = TextHelper.Format(Language.LeiChong.ValueTip2, data.data.gift_value);
            UH.SetText(this.viewNode.LbValue, value);
            this.viewNode.BtnBuy.SetIcon(true, "Item" + CommonId.Diamond, "CommonAtlas");
            this.viewNode.BtnBuy.SetTitle(data.data.price + "");
        }
        if (data.sort) {
            this.viewNode.BtnBuy.SetIcon(false);
            this.viewNode.BtnBuy.enabled = false;
            this.viewNode.BtnBuy.SetTitle(Language.ActCommon.YiGouMai);
        }
        this.viewNode.GiftList.SetData(data.data.item);
    }

    private onBtnClick() {
        if (this._data.price_type != 3) {
            // if(this._data.price_type == 2 && this._data.price > Item.GetNum(CommonId.Gold)){
            //     return;
            // }else if(this._data.price_type == 1 && this._data.price > Item.GetNum(CommonId.Diamond)){
            //     return;
            // }
            TianXuanZhiLiData.Inst().SendReq(TianXuan_OP_TYPE.BUY_GIFT, this._data.seq);
        } else {
            let money = this._data.price;
            let order_data = Order_Data.initOrder(this._data.seq, ACTIVITY_TYPE.TianXuanZhiLi, money / 10, money, "");
            OrderCtrl.generateOrder(order_data);
        }
    }
}

export class GiftItem extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        LbName: <fgui.GTextField>null,
    };
    public SetData(data: CfgItem) {
        this._data = data;
        this.viewNode.Cell.SetData(Item.Create(data, { is_click: true, is_gray: false, is_num: true }));
        UH.SetText(this.viewNode.LbName, Item.GetName(data.item_id));
    }
}
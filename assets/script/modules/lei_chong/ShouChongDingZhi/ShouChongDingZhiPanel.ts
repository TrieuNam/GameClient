import { sys } from "cc";
import { CfgGiftConfiguration, CfgShouChongDingZhiData } from "config/CfgShouChongDingZhi";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { Language, TextHelperWord } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { FashionInfoView } from "modules/item_info/FashionInfoView";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../../helpers/TextHelper";
import { UH } from "../../../helpers/UIHelper";
import { LeiChongBasePanel } from "../LeiChongBasePanel";
import { SHOUCHONGDINGZHI_REQ_TYPE, ShouChongDingZhiData } from "./ShouChongDingZhiCtrl";

export class ShouChongDingZhiPanel extends LeiChongBasePanel {

    protected viewNode = {
        Cell: <ItemCell>null,
        ListItem: <fgui.GList>null,
        TeBieCell: <DingZhiTeBieItem>null,
        BtnBuy: <CommonButtonBuy>null,
        GPValue: <fgui.GGroup>null,
        LbValue: <fgui.GTextField>null,
    }

    InitData() {
        this.viewNode.BtnBuy.onClick(this.onItemClick.bind(this));
        this.AddSmartDataCare(ShouChongDingZhiData.Inst().ResultData, this.FlushData.bind(this), "info");
        let isOpen = sys.localStorage.getItem("ShouChongDingZhiOpenRed")
        if (!isOpen) {
            sys.localStorage.setItem("ShouChongDingZhiOpenRed", "1");
            ShouChongDingZhiData.Inst().SetFlush_red();
        }

        this.FlushData();

        //console.log("-----",ShouChongDingZhiData.Inst().ResultData.info);
    }

    private FlushData() {
        // if(ShouChongDingZhiData.Inst().IsDingZhiActShow()){
        let itemData = ShouChongDingZhiData.Inst().GetGiftData();
        this.viewNode.ListItem.SetData(itemData.slice(0, 4));
        this.viewNode.TeBieCell.SetData(itemData[itemData.length - 1]);
        if (ShouChongDingZhiData.Inst().ResultData.info.hasBuyGift) {
            this.viewNode.GPValue.visible = this.viewNode.BtnBuy.visible = false;
        } else {
            this.viewNode.GPValue.visible = this.viewNode.BtnBuy.visible = true;
        }
        // }
    }

    InitUI() {
        if (ShouChongDingZhiData.Inst().IsDingZhiActShow()) {
            let item = ShouChongDingZhiData.Inst().GetGiftData();
            let buyItem = ShouChongDingZhiData.Inst().GetBuyData();
            this.viewNode.Cell.SetData(Item.Create(item[item.length - 1].reward_item[0], { is_click: true, is_gray: false, is_num: true }))
            let btnTitle = TextHelper.Format(Language.LeiChong.BtnTitle2, buyItem.price / 10);
            let value = TextHelper.Format(Language.LeiChong.ValueTip, buyItem.value);
            this.viewNode.BtnBuy.SetTitle(btnTitle);
            UH.SetText(this.viewNode.LbValue, value);
        }

    }

    private onItemClick() {
        let money = ShouChongDingZhiData.Inst().GetBuyData().price;
        let order_data = Order_Data.initOrder(0, ACTIVITY_TYPE.ShouChongDingZhi, money / 10, money, "");
        OrderCtrl.generateOrder(order_data);
    }

    protected onDestroy(): void {
        super.onDestroy();
    }

}

export class DingZhiPuTongItem extends BaseItem {
    protected viewNode = {
        LbTitle: <fgui.GTextField>null,
        ListCell: <fgui.GList>null,
        BtnRec: <CommonButtonBuy>null,
        ImgZheZhao: <fgui.GObject>null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnRec.onClick(this.onBtnClick.bind(this));
        this.viewNode.BtnRec.on(fgui.Event.TOUCH_BEGIN, this.onBegin.bind(this));
    }
    public SetData(data: CfgGiftConfiguration) {
        this._data = data;
        let day = TextHelper.Format(Language.AffordPresent.Days, TextHelperWord[data.active_times]);
        UH.SetText(this.viewNode.LbTitle, day);
        this.viewNode.ListCell.SetData(Item.DefaultCreateListItem(data.reward_item, { is_gray: false, is_click: true, is_num: true, eff: -1 }))
        this.viewNode.BtnRec.ShowRedPoint(ShouChongDingZhiData.Inst().ResultData.info.fetchFlags[data.seq] == 1);
        if (ShouChongDingZhiData.Inst().ResultData.info.fetchFlags[data.seq] == 0) { //不能领取
            this.viewNode.BtnRec.SetTitle(Language.LeiChong.BtnTitle3);
            this.viewNode.ImgZheZhao.visible = true;
        } else if (ShouChongDingZhiData.Inst().ResultData.info.fetchFlags[data.seq] == 1) { //可以领取
            this.viewNode.BtnRec.SetTitle(Language.ActCommon.LingQu);
            this.viewNode.BtnRec.SetBg("AnNiuZhong_Lv", "CommonButton");
            this.viewNode.ImgZheZhao.visible = false;
        } else {
            this.viewNode.BtnRec.SetTitle(Language.ActCommon.YiLingQu);
            this.viewNode.ImgZheZhao.visible = this.viewNode.BtnRec.enabled = false;
        }
    }
    // private renderListItem(index: number, item: ItemCell) {
    //     item.SetData(this.list_data[index]);
    // }
    private onBtnClick() {
        if (this.viewNode.ImgZheZhao.visible) {
            this.viewNode.ImgZheZhao.scaleX = this.viewNode.ImgZheZhao.scaleY = 1;
        } else {
            ShouChongDingZhiData.Inst().SendReq(SHOUCHONGDINGZHI_REQ_TYPE.FETCH_GIFT, this._data.seq)
        }
    }
    private onBegin() {
        if (this.viewNode.ImgZheZhao.visible) {
            this.viewNode.ImgZheZhao.scaleX = this.viewNode.ImgZheZhao.scaleY = 0.9;
        }
    }
}

export class DingZhiTeBieItem extends BaseItem {
    protected viewNode = {
        UIModel: <UIModelShow>null,
        BtnRec: <CommonButtonBuy>null,
        ImgZheZhao: <fgui.GObject>null,
        UIEff1: <UIEffectShow>null,
        UIEff2: <UIEffectShow>null,
        OnClickLoa: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnRec.onClick(this.onBtnClick.bind(this));
        this.viewNode.BtnRec.on(fgui.Event.TOUCH_BEGIN, this.onBegin.bind(this));
        this.viewNode.OnClickLoa.onClick(this.OnShowModel.bind(this));

    }
    public SetData(data: CfgGiftConfiguration) {
        this._data = data;
        this.viewNode.UIEff1.PlayEff(4164142);
        this.viewNode.UIEff2.PlayEff(4164143);
        this.viewNode.BtnRec.ShowRedPoint(ShouChongDingZhiData.Inst().ResultData.info.fetchFlags[data.seq] == 1);
        this.viewNode.UIModel.setPath(ResPath.Ride(CfgShouChongDingZhiData.other[0].res_id));
        if (ShouChongDingZhiData.Inst().ResultData.info.fetchFlags[data.seq] == 0) { //不能领取
            this.viewNode.BtnRec.SetTitle(Language.LeiChong.BtnTitle3);
        } else if (ShouChongDingZhiData.Inst().ResultData.info.fetchFlags[data.seq] == 1) { //可以领取
            this.viewNode.BtnRec.SetTitle(Language.ActCommon.LingQu);
            this.viewNode.BtnRec.SetBg("AnNiuZhong_Lv", "CommonButton");
            this.viewNode.ImgZheZhao.visible = false;
        } else {
            this.viewNode.BtnRec.SetTitle(Language.ActCommon.YiLingQu);
            this.viewNode.BtnRec.enabled = false;
            this.viewNode.ImgZheZhao.visible = false;
        }
    }
    private onBtnClick() {
        if (this.viewNode.ImgZheZhao.visible) {
            this.viewNode.ImgZheZhao.scaleX = this.viewNode.ImgZheZhao.scaleY = 1;
        } else {
            ShouChongDingZhiData.Inst().SendReq(SHOUCHONGDINGZHI_REQ_TYPE.FETCH_GIFT, this._data.seq)
        }
    }
    private onBegin() {
        if (this.viewNode.ImgZheZhao.visible) {
            this.viewNode.ImgZheZhao.scaleX = this.viewNode.ImgZheZhao.scaleY = 0.9;
        }
    }
    private OnShowModel() {
        ViewManager.Inst().OpenView(FashionInfoView, this._data.reward_item[0]);
    }
}
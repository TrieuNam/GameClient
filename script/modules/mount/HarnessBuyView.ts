import { sys } from "cc";
import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { CommonId } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { MOUNR_REQ_TYPE, MountCtrl } from "./MountCtrl";
import { MountData } from "./MountData";
@BaseView.registView
export class HarnessBuyView extends BaseView {
    private isFlushNum1 = 0;
    private isFlushNum2 = 0;
    private isOpen = false;
    private isShowEff = false;
    protected viewRegcfg = {
        UIPackName: "HarnessBuy",
        ViewName: "HarnessBuyView",
        RelyOnPack: ["MountEquipSure", "MountEquipOp", "MountMain"],
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };
    // re_item_num + n * re_item_num_change 刷新消耗
    protected viewNode = {
        BtnCloseView: <fgui.GButton>null,
        ItemList: <fgui.GList>null,
        Currency: <Currency>null,
        Icon: <fgui.GLoader>null,
        LbCurNum: <fgui.GTextField>null,
        BtnFlush1: <CommonButtonBuy>null,
        Icon2: <fgui.GLoader>null,
        LbCurNum2: <fgui.GTextField>null,
        BtnFlush2: <fgui.GButton>null,
        timer: <TimeMeter>null,
        LbTime: <fgui.GTextField>null,
        GpTime: <fgui.GGroup>null,
        ImgBtom: <fgui.GObject>null,
    };
    protected extendsCfg = [
        { ResName: "HarnessBuyCell", ExtendsClass: HarnessBuyCell },
    ];
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    InitUI() {
        this.viewNode.Currency.SetCurrencyId(41100, true);
        UH.SpriteName(this.viewNode.Icon, "CommonAtlas", "Item" + CommonId.Gold);
        UH.SpriteName(this.viewNode.Icon2, "CommonAtlas", "Item" + CommonId.Diamond);

    }
    private list_data: any[] = [];
    InitData(data: any) {
        // this.viewNode.ItemList.setVirtual();
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.OPEN_BUY);
        this.viewNode.ItemList.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.BtnCloseView.onClick(this.OnBtnClick.bind(this, "BtnCloseView"))
        this.viewNode.BtnFlush1.onClick(this.OnBtnClick.bind(this, "BtnFlush1"))
        this.viewNode.BtnFlush2.onClick(this.OnBtnClick.bind(this, "BtnFlush2"))
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this), this.FlushUpdateTime.bind(this));
        this.AddSmartDataCare(MountData.Inst().flush_info, this.FlushData.bind(this), "buyflush");
        this.isFlushNum1 = MountData.Inst().GetHarnessInfo.refresh_1_num;
        this.isFlushNum2 = MountData.Inst().GetHarnessInfo.refresh_2_num;
        if (!sys.localStorage.getItem("isInitHarnessBuyView")) {
            this.isOpen = true;
            sys.localStorage.setItem("isInitHarnessBuyView", "1")
        }

        this.FlushData();
    }
    private timeout: any;
    private isClose = false;
    private isFree = false;
    public FlushData() {
        this.FlushFlushTime();

        this.isShowEff = false;
        if (this.isOpen || this.isFlushNum1 < MountData.Inst().GetHarnessInfo.refresh_1_num || this.isFlushNum2 < MountData.Inst().GetHarnessInfo.refresh_2_num
            || (this.isFree && MountData.Inst().GetHarnessInfo.free_time - TimeCtrl.Inst().ServerTime > 0)) {
            this.isFlushNum1 = MountData.Inst().GetHarnessInfo.refresh_1_num;
            this.isFlushNum2 = MountData.Inst().GetHarnessInfo.refresh_2_num;
            this.isOpen = false;
            this.isShowEff = true;
            this.isClose = false;
            this.timeout = setTimeout(() => {
                this.isClose = true;
            }, 1000);
        } else {
            this.isClose = true;
        }
        if (MountData.Inst().GetHarnessInfo) {
            let time = MountData.Inst().GetHarnessInfo.free_time - TimeCtrl.Inst().ServerTime;
            if (time > 0) {
                this.viewNode.BtnFlush1.SetTitle(Language.PeakArena.BtnFlush);
                this.viewNode.ImgBtom.visible = this.viewNode.Icon.visible = this.viewNode.LbCurNum.visible = true;
                this.isFree = false;
            } else {
                this.viewNode.ImgBtom.visible = this.viewNode.Icon.visible = this.viewNode.LbCurNum.visible = false;
                this.isFree = true;
            }
            this.list_data = MountData.Inst().GetHarnessBuyList();
            this.viewNode.ItemList.numItems = this.list_data.length;
            let otherData = MountData.Inst().GetOtherData();
            let num2 = otherData.re_item_num2 + MountData.Inst().GetHarnessInfo.refresh_2_num * otherData.re_item_num_change;
            UH.SetText(this.viewNode.LbCurNum, otherData.re_item_num1)
            UH.SetText(this.viewNode.LbCurNum2, num2)
        }


    }
    private FlushFlushTime() {
        let time = MountData.Inst().GetHarnessInfo.free_time - TimeCtrl.Inst().ServerTime;
        this.viewNode.GpTime.visible = this.viewNode.timer.visible = time > 0;
        if (time < 0) {
            this.viewNode.BtnFlush1.SetTitle(Language.ActCommon.Free)
            this.viewNode.ImgBtom.visible = this.viewNode.Icon.visible = this.viewNode.LbCurNum.visible = false;
            this.isFree = true;
        } else {
            this.viewNode.ImgBtom.visible = this.viewNode.Icon.visible = this.viewNode.LbCurNum.visible = true;
        }
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_0);
    }

    private FlushUpdateTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr2, time_t.hour, time_t.minute, time_t.second);
        UH.SetText(this.viewNode.LbTime, t_str)
    }
    OnBtnClick(name: string) {
        switch (name) {
            case "BtnCloseView":
                if (this.isClose)
                    ViewManager.Inst().CloseView(HarnessBuyView);
                break;
            case "BtnFlush1": //金币刷新
                if (this.isClose)
                    MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.REFRESH_BUY, 0);
                break;
            case "BtnFlush2": //钻石刷新
                if (this.isClose)
                    MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.REFRESH_BUY, 1);
                break;
        }
    }
    CloseCallBack(): void {
        this.viewNode.timer.CloseCountDownTime();
        clearTimeout(this.timeout);

    }
    private renderListItem(index: number, item: HarnessBuyCell) {
        item.SetData(this.list_data[index], index, this.isShowEff);
    }

}

export class HarnessBuyCell extends fgui.GComponent {
    protected viewNode = {
        LbName: <fgui.GTextField>null,
        BtnBuy: <CommonButtonBuy>null,
        Icon: <fgui.GLoader>null,
        LbNum: <fgui.GTextField>null,
        Cell: <ItemCell>null,
        LbArrt1: <fgui.GTextField>null,
        LbArrt2: <fgui.GTextField>null,
        UiEff: <UIEffectShow>null,
        ImgBg: <fgui.GObject>null,
        ItemCell: <fgui.GGroup>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.OnBtnClick.bind(this))
    }
    private ItemData: any;
    private index: number;
    public SetData(data: any, index: number, isShowEff: boolean) {
        this.ItemData = data;
        this.index = index;
        //tween(this.viewNode.ImgBg).to(500,{scaleX:0}).to(500,{scaleX:1}).start();
        if (isShowEff) {
            this.viewNode.ItemCell.visible = this.viewNode.ImgBg.visible = false;
            this.viewNode.UiEff.StopEff("4164148");
            this.viewNode.UiEff.PlayEff("4164148");
            setTimeout(() => {
                this.viewNode.UiEff.StopEff("4164148");
                this.flushData(data, index)
            }, 400);
        } else {
            this.flushData(data, index);
        }
    }
    flushData(data: any, index: number) {
        if (this.viewNode.ItemCell && this.viewNode.ImgBg) {
            this.viewNode.ImgBg.visible = this.viewNode.ItemCell.visible = true;
            UH.SetIcon(this.viewNode.Icon, data.buy_item_id, 0);
            UH.SetText(this.viewNode.LbNum, data.buy_item_num);
            UH.SetText(this.viewNode.LbName, Item.GetName(data.harness_item))
            let cfg = Item.GetConfig(data.harness_item);
            this.viewNode.LbArrt2.visible = false;
            UH.SetText(this.viewNode.LbArrt1, AttrListName[cfg.att[0].type] + ": " + AttrHelper.Percent(cfg.att[0].type, cfg.att[0].add));
            if (cfg.att.length > 1) {
                this.viewNode.LbArrt2.visible = true;
                UH.SetText(this.viewNode.LbArrt2, AttrListName[cfg.att[1].type] + ": " + AttrHelper.Percent(cfg.att[1].type, cfg.att[1].add));
            }
            this.viewNode.Cell.SetData(Item.Create(new CfgItem(data.harness_item), { is_click: true, is_gray: false, eff: -1 }));
            this.viewNode.Icon.scaleX = this.viewNode.Icon.scaleY = 0.6;
            if (DataHelper.ToBinary(MountData.Inst().GetHarnessInfo.buy_flag)[index] == 1) {
                this.viewNode.BtnBuy.enabled = false;
                this.viewNode.BtnBuy.SetTitle(Language.ActCommon.YiGouMai);
            } else {
                this.viewNode.BtnBuy.enabled = true;
                this.viewNode.BtnBuy.SetTitle(Language.ActCommon.Buy);
            }
        }

    }
    OnBtnClick() {
        if (Item.GetNum(this.ItemData.buy_item_id) >= this.ItemData.buy_item_num) {
            MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.BUY, this.index);
            PublicPopupCtrl.Inst().Center(Language.Territory.BuySucc);
        } else {
            PublicPopupCtrl.Inst().Center(Language.Mount.BuyHarnessTip);
            ViewManager.Inst().OpenView(ItemInfoView, Item.Create({ itemId: this.ItemData.buy_item_id }));
        }
    }
    EffCb() {
        if (this.viewNode.ImgBg) {
            this.viewNode.ImgBg.visible = this.viewNode.ItemCell.visible = true;
        }

    }
}
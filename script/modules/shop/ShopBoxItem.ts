import { BaseItem } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { AdType, CommonId } from "modules/common/CommonEnum";
import { CfgLimitCore } from "config/CfgLimitCore";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TimeHelper } from "../../helpers/TimeHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { Language } from "modules/common/Language";
import { ShopTitleCell } from "./ShopView";
import { Item } from "modules/bag/ItemData";
import { CoreCrisisCtrl, LIMIT_CORE_OP_TYPE } from "modules/CoreCrisis/CoreCrisisCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { Color, RichText } from "cc";
import { COLORS } from "modules/common/ColorEnum";
import { CoreCrisisBoxData } from "modules/CoreCrisisBox/CoreCrisisBoxData";
import { CoreCrisisBoxType } from "modules/CoreCrisis/CoreCrisisConfig";

export class ShopBoxItem extends BaseItem {
    protected viewNode = {
        Title: <ShopTitleCell>null,
        Cell0: <ShopBoxItemCell>null,
        Cell1: <ShopBoxItemCell>null,
        Cell2: <ShopBoxItemCell>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }


    public SetData() {
        this.viewNode.Title.SetData(Language.Shop.Box);
        let buy_fun = (index: number) => {
            CoreCrisisBoxData.Inst().BoxQuality = index;
            CoreCrisisCtrl.Inst().SendCSLimitCoreReq(LIMIT_CORE_OP_TYPE.DRAW, index);
        }
        this.viewNode.Cell0.SetData({ index: 0, AdType: AdType.box_choujiang, buy_fun: buy_fun, price: 0 });
        this.viewNode.Cell1.SetData({ index: 1, AdType: AdType.box_choujiang, buy_fun: buy_fun, price: CfgLimitCore.other[0].price1 });
        this.viewNode.Cell2.SetData({ index: 2, AdType: AdType.box_choujiang, buy_fun: buy_fun, price: CfgLimitCore.other[0].price2 });
    }

}


export class ShopBoxItemCell extends BaseItem {
    private index: number;
    private AdType: AdType;
    private buy_fun: Function;
    private timer_handle_ad: any;
    private handleCollector: HandleCollector;
    private need_num: number;
    protected viewNode = {
        Bg: <fgui.GLoader>null,
        Title: <fgui.GLoader>null,
        Bottom: <fgui.GLoader>null,
        Box: <fgui.GLoader>null,
        BtnBuy: <CommonButtonBuy>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.OnClickBuy.bind(this));
    }

    public SetData(data: { index: number, AdType: AdType, buy_fun: Function, price: number }) {
        let index = this.index = data.index;
        this.AdType = data.AdType;
        this.buy_fun = data.buy_fun;
        this.viewNode.Bg.icon = "loader/limit_core/CoreBoxDiBan" + index;
        this.viewNode.Title.icon = "loader/limit_core/_LocCoreBoxTitle" + index;
        this.viewNode.Bottom.icon = "loader/limit_core/CoreBoxTuo" + index;
        this.viewNode.Box.icon = "loader/limit_core/CoreBox" + index;
        switch (index) {
            case 0:
                this.viewNode.BtnBuy.SetBg("AnNiuXiao_Lv", "CommonButton");
                this.viewNode.BtnBuy.SetStroke(2, COLORS.Green2);
                this.viewNode.BtnBuy.SetColor(COLORS.White);
                if (!this.handleCollector)
                    this.handleCollector = HandleCollector.Create();
                this.handleCollector.RemoveAll();
                this.viewNode.BtnBuy.SetIcon(true, "GuangGaoTuBiao", "CommonAtlas");
                this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().AdFlush, this.FlushAdShow.bind(this)));
                this.FlushAdShow();
                break;
            case 1:
            case 2:
                this.viewNode.BtnBuy.SetIcon(true, "Item" + CommonId.Diamond, "CommonAtlas");
                this.need_num = data.price;
                this.viewNode.BtnBuy.title = this.need_num + "";
                break;
        }
    }

    private OnClickBuy() {
        switch (this.index) {
            case 0:
                let info = RoleData.Inst().GetAdvertisementInfoBySeq(this.AdType)
                let co = RoleData.Inst().CfgAdTypeSeq(this.AdType)
                if (info) {
                    if (info.todayCount >= co.ad_param && co.ad_param != 0) {
                        PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                        return
                    } else if (info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
                        PublicPopupCtrl.Inst().Center(Language.Common.AdColdTime);
                        return
                    }
                }
                CoreCrisisBoxData.Inst().BoxQuality = CoreCrisisBoxType.Normal;
                ChannelAgent.Inst().advert(GameToChannel.wx_advert, this.AdType, Language.adv.draw);
                break;
            case 1:
            case 2:
                let num = Item.GetNum(CommonId.Diamond);
                if (num >= this.need_num) {
                    this.buy_fun && this.buy_fun(this.index);
                } else {
                    PublicPopupCtrl.Inst().ItemNotEnoughNotice(CommonId.Diamond);
                }
                break;
        }
    }

    private FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(this.AdType)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(this.AdType)
        let title = this.viewNode.BtnBuy.GetTitle();

        let limit_times = co.ad_param - info.todayCount ;
        let is_grey = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && (limit_times > 0 || co.ad_param == 0))));
        this.viewNode.BtnBuy.grayed = is_grey;
        this.viewNode.BtnBuy.ShowRedPoint(!is_grey);

        Timer.Inst().CancelTimer(this.timer_handle_ad)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_ad = Timer.Inst().AddCountDownCT(() => {
                let ft = TimeHelper.FormatDHMS(info.nextFetchTime - TimeCtrl.Inst().ServerTime);
                UH.SetText(title, TextHelper.SizeStr(TextHelper.Format(Language.UiTimeMeter.TimeStr1, ft.hour, ft.minute, ft.second), 24))
            }, this.FlushAdShow.bind(this), info.nextFetchTime, 1)
        } else {
            UH.SetText(title, Language.ActCommon.Free);
        }
    }


    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        Timer.Inst().CancelTimer(this.timer_handle_ad)
    }

}

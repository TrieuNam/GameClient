import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { AdType, CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { TerritoryData } from "./TerritoryData";
import { Item } from "modules/bag/ItemData";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { ViewManager } from "manager/ViewManager";
import { TerritoryRefreshView } from "./TerritoryRefreshView";
import { RoleCtrl } from "modules/role/RoleCtrl";

@BaseView.registView
export class TerritoryRefreshAdView extends BaseView {
    private timer_handle_ad: any = null;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "InscriptionTurntableAd",
        ViewName: "InscriptionTurntableAdView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnAd: <fgui.GButton>null,
        BtnFree: <fgui.GButton>null,

        IconCost: <fgui.GLoader>null,
        NumShow: <fgui.GTextField>null,
        TimesShow: <fgui.GTextField>null,
        desc: <fgui.GTextField>null,
    };

    private cache_timer: number

    CloseCallBack(): void {
        Timer.Inst().CancelTimer(this.timer_handle_ad)
    }

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TerritoryRefreshAdView));
        this.viewNode.Board.SetTitleShow(false)

        this.viewNode.BtnAd.onClick(this.OnClickAd, this);
        this.viewNode.BtnFree.onClick(this.OnClickFree, this);

        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.FlushAdShow.bind(this));

        UH.SetText(this.viewNode.desc, Language.Territory.refreshAd);
    }

    InitUI() {
        this.FlushAdShow();
    }

    CloseView() {
        ViewManager.Inst().CloseView(TerritoryRefreshAdView);
        if (ViewManager.Inst().IsOpen(TerritoryRefreshView)) {
            ViewManager.Inst().CloseView(TerritoryRefreshView);
        }
    }

    private FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.territory_refresh)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.territory_refresh)
        let price_cost = TerritoryData.Inst().GetOtherCfg()
        let time = this.cache_timer || 0;
        if (info.nextFetchTime > time) {
            time = info.nextFetchTime
        }

        UH.SpriteName(this.viewNode.IconCost, "CommonAtlas", `Item${price_cost.re_item}`);
        this.viewNode.TimesShow.text = TextHelper.Format(Language.Inscription.Turntable.FreeTimes, co.ad_param - (info ? info.todayCount : 0));
        this.viewNode.NumShow.text = `${price_cost.re_item_num2}`;
        this.viewNode.BtnAd.grayed = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= time && co.ad_param > info.todayCount)));
        Timer.Inst().CancelTimer(this.timer_handle_ad)
        if (info && time > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_ad = Timer.Inst().AddCountDownCT(() => {
                let ft = TimeHelper.FormatDHMS(time - TimeCtrl.Inst().ServerTime);
                this.viewNode.BtnAd.title = TextHelper.SizeStr(TextHelper.Format(Language.UiTimeMeter.TimeStr1, ft.hour, ft.minute, ft.second), 28)
            }, this.FlushAdShow.bind(this), time, 1)
        } else {
            this.viewNode.BtnAd.title = Language.Inscription.Turntable.BtnFree
            this.cache_timer = null;
        }
    }

    private OnClickAd() {
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.territory_refresh)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.territory_refresh)
        if (info) {
            if (info.todayCount >= co.ad_param) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                return
            } else if (info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdColdTime);
                return
            }
        }
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.territory_refresh, Language.adv.territory_refresh);
        // TerritoryCtrl.Inst().SendRefreshContainerInfo(0);
        this.cache_timer = TimeCtrl.Inst().ServerTime + 18000;
        this.CloseView();
    }

    private OnClickFree() {
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.territory_refresh)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.territory_refresh)
        if (info) {
            if (info.todayCount >= co.ad_param) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                return
            }
        }
        RoleCtrl.Inst().ReqAdverReward(AdType.territory_refresh, 1);
        this.CloseView();
    }

    // private OnClickFree() {
    //     let price_cost = TerritoryData.Inst().GetOtherCfg()
    //     let num = Item.GetNum(CommonId.Diamond);
    //     if (num >= price_cost.re_item_num2) {
    //         TerritoryCtrl.Inst().SendRefreshContainerInfo(2);
    //         this.CloseView();
    //     } else {
    //         PublicPopupCtrl.Inst().ItemNotEnoughNotice(CommonId.Diamond);
    //     }
    // }
}
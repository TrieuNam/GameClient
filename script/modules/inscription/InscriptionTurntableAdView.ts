import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { InscriptionData } from "./InscriptionData";

@BaseView.registView
export class InscriptionTurntableAdView extends BaseView {
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
    };

    CloseCallBack(): void {
        Timer.Inst().CancelTimer(this.timer_handle_ad)
    }

    InitData() {
        this.viewNode.Board.SetData(new BoardData(InscriptionTurntableAdView));
        this.viewNode.Board.SetTitleShow(false)

        this.viewNode.BtnAd.onClick(this.OnClickAd, this);
        this.viewNode.BtnFree.onClick(this.OnClickFree, this);

        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.FlushAdShow.bind(this));
    }

    InitUI() {
        this.FlushAdShow();
    }

    private FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let price_cost = InscriptionData.Inst().CfgTowerPriceCost()
        UH.SpriteName(this.viewNode.IconCost, "CommonAtlas", `Item${price_cost.item_id}`);
        this.viewNode.TimesShow.text = TextHelper.Format(Language.Inscription.Turntable.FreeTimes, co.ad_param - (info ? info.todayCount : 0));
        this.viewNode.NumShow.text = `${price_cost.num}`;
        this.viewNode.BtnAd.grayed = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount)));

        Timer.Inst().CancelTimer(this.timer_handle_ad)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_ad = Timer.Inst().AddCountDownCT(() => {
                let ft = TimeHelper.FormatDHMS(info.nextFetchTime - TimeCtrl.Inst().ServerTime);
                this.viewNode.BtnAd.title = TextHelper.SizeStr(TextHelper.Format(Language.UiTimeMeter.TimeStr1, ft.hour, ft.minute, ft.second), 28)
            }, this.FlushAdShow.bind(this), info.nextFetchTime, 1)
        } else {
            this.viewNode.BtnAd.title = Language.Inscription.Turntable.BtnFree
        }
    }

    private OnClickAd() {
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        if (info) {
            if (info.todayCount >= co.ad_param) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                return
            } else if (info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdColdTime);
                return
            }
        }
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.inscription_tower_draw, TextHelper.Format(Language.adv.inscription_turntable, co.ad_award[0].num));
    }

    private OnClickFree() {
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        if (info) {
            if (info.todayCount >= co.ad_param) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                return
            }
        }
        RoleCtrl.Inst().ReqAdverReward(AdType.inscription_tower_draw, 1);
    }
}
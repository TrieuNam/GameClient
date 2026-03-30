
import { bit } from "core/net/bit";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { HelpView } from "modules/common_help/CommonHelpView";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";

@BaseView.registView
export class InscriptionTurntableView extends BaseView {
    private draw_num = 0;
    private draw_flag = 0;
    private timer_handle: any = null;
    private isDraw5 = 0;
    private timer_handle_ad: any = null;
    private draw_co = {
        speed: 5,
        interval: 0.02,
    }

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "InscriptionTurntable",
        ViewName: "InscriptionTurntableView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode: { [key: string]: any } = {
        BtnClose: <fgui.GButton>null,
        BtnHelp: <fgui.GButton>null,
        BtnAd: <fgui.GButton>null,
        BtnDraw1: <fgui.GButton>null,
        BtnDraw10: <fgui.GButton>null,
        ToggleDraw5: <fgui.GButton>null,

        CellShow: <ItemCell>null,
        CellShow1: <ItemCell>null,
        CellShow2: <ItemCell>null,
        CellShow3: <ItemCell>null,
        CellShow4: <ItemCell>null,
        CellShow5: <ItemCell>null,
        CellShow6: <ItemCell>null,
        CellShow7: <ItemCell>null,
        CellShow8: <ItemCell>null,

        IconCost1: <fgui.GLoader>null,
        NumShow1: <fgui.GTextField>null,
        IconCost2: <fgui.GLoader>null,
        NumShow2: <fgui.GTextField>null,
        TimesShow: <fgui.GTextField>null,

        RoundShow: <fgui.GTextField>null,
        NumShow: <fgui.GTextField>null,
        DescShow1: <fgui.GRichTextField>null,
        DescShow2: <fgui.GRichTextField>null,
        PointerShow: <fgui.GImage>null,
        RedPointShow1: <RedPoint>null,
        RedPointShow5: <RedPoint>null,
    };

    InitData() {
        this.viewNode.BtnClose.onClick(this.OnClickClose, this);
        this.viewNode.BtnHelp.onClick(this.OnClickHelp, this);
        this.viewNode.BtnAd.onClick(this.OnClickAd, this);
        this.viewNode.BtnDraw1.onClick(this.OnClickDraw1, this);
        this.viewNode.BtnDraw10.onClick(this.OnClickDraw10, this);
        this.viewNode.ToggleDraw5.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushNumShow.bind(this), "turntable_num_flush");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushFlagShow.bind(this), "turntable_flag_flush");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushNumShow.bind(this), "flushneed");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.AdAutoDraw1.bind(this), "ad_auto_draw1");
        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.FlushAdShow.bind(this));

        this.draw_num = 0
        this.draw_flag = 0
    }

    InitUI() {
        this.FlushShow();
        this.FlushAdShow();
    }

    CloseCallBack() {
        Timer.Inst().CancelTimer(this.timer_handle)
        Timer.Inst().CancelTimer(this.timer_handle_ad)
        InscriptionData.Inst().turntable_drawing = false
    }

    FlushShow() {
        let price_cost = InscriptionData.Inst().CfgTowerPriceCost()
        UH.SetText(this.viewNode.DescShow1, TextHelper.Format(Language.Inscription.Turntable.DescShow1, Item.GetName(price_cost.item_id), price_cost.num, price_cost.num * 10));
        UH.SetText(this.viewNode.DescShow2, Language.Inscription.Turntable.DescShow2);
        UH.SpriteName(this.viewNode.IconCost1, "CommonAtlas", `Item${price_cost.item_id}`);
        UH.SpriteName(this.viewNode.IconCost2, "CommonAtlas", `Item${price_cost.item_id}`);
        this.viewNode.NumShow1.text = `${price_cost.num}`;
        this.viewNode.NumShow2.text = `${price_cost.num * 10}`;
        this.FlushRoundShow()
        this.FlushItemsShow();
        this.FlushNumShow();
    }

    FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.inscription_tower_draw)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.inscription_tower_draw)
        let show_ad = (RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (co.ad_param > info.todayCount)))
        // UH.SpriteName(this.viewNode.IconCost, "CommonAtlas", `Item${price_cost.item_id}`);
        this.viewNode.TimesShow.text = show_ad ? TextHelper.Format(Language.Inscription.Turntable.FreeTimes, co.ad_param - (info ? info.todayCount : 0)) : "";
        // this.viewNode.AdNumShow.text = show_ad ? `${price_cost.num}` : "";
        this.viewNode.BtnAd.grayed = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount)));
        this.viewNode.BtnAd.visible = show_ad
        this.viewNode.BtnDraw1.x = show_ad ? 450 : 272
        this.viewNode.IconCost1.x = show_ad ? 543 : 365
        this.viewNode.NumShow1.x = show_ad ? 573 : 395
        this.viewNode.BtnDraw1.visible = true

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

    FlushItemsShow(draw_end: boolean = false) {
        let info = InscriptionData.Inst().RuneInfo();
        if (draw_end) {
            this.draw_num--;
            if (0 == this.draw_num || 0 == info.turntable_flag) {
                this.draw_num = 0
                // ViewManager.Inst().OpenView(CommonRewardView, { reward_data: this.show_items })
                InscriptionData.Inst().TurntableRewardsShow();
                if (0 == info.turntable_flag) {
                    if (49 == info.turntable_round) {
                        info.turntable_round = 0
                    } else {
                        info.turntable_round++;
                    }
                    this.FlushRoundShow();
                }
            } else {
                this.Draw(this.draw_num);
            }
        }
        let turntable_list = InscriptionData.Inst().CfgTowerTurntableShow(info.turntable_round + 1);
        let prize = InscriptionData.Inst().CfgTowerRatePrizeGrid()
        for (let i = 0; i < turntable_list.length - 1; i++) {
            this.viewNode[`CellShow${i + 1}`].SetData(Item.Create(turntable_list[i].win[0], { is_num: true, is_gray: (bit.hasflag(info.turntable_flag, turntable_list[i].cur_index)) }));
        }
        if (turntable_list.length > 0) {
            // this.viewNode.CellShow.SetData(Item.Create(turntable_list[prize - 1].win[0], { is_num: true }));
        }
    }


    FlushNumShow() {
        let info = InscriptionData.Inst().RuneInfo();
        UH.SetText(this.viewNode.NumShow, TextHelper.Format(Language.Inscription.Turntable.NumShow, info.turntable_num > 0 ? COLORSTR.Yellow1 : COLORSTR.Red1, info.turntable_num));
        this.viewNode.RedPointShow1.SetNum(0);
        this.viewNode.RedPointShow5.SetNum(0);
    }

    FlushRoundShow() {
        let info = InscriptionData.Inst().RuneInfo();
        UH.SetText(this.viewNode.RoundShow, TextHelper.Format(Language.Inscription.Turntable.RoundShow, info.turntable_round + 1));
    }

    FlushFlagShow() {
        let info = InscriptionData.Inst().RuneInfo();
        let to_index = 0
        let turntable_list = InscriptionData.Inst().CfgTowerTurntableShow(info.turntable_round + 1);
        if (0 == info.turntable_flag) {
            let prize = InscriptionData.Inst().CfgTowerRatePrizeGrid()
            to_index = prize
            // for (let i = 0; i < turntable_list.length; i++) {
            //     let cur_index = turntable_list[i].cur_index
            //     if (!bit.hasflag(this.draw_flag, cur_index)) {
            //         this.show_items.push(turntable_list[i].win[0]);
            //     }
            // }
        } else {
            for (let i = 0; i < turntable_list.length; i++) {
                let cur_index = turntable_list[i].cur_index
                if (bit.hasflag(info.turntable_flag, cur_index) && !bit.hasflag(this.draw_flag, cur_index)) {
                    to_index = cur_index
                    // this.show_items.push(turntable_list[i].win[0]);
                }
            }
        }
        if (to_index > 0) {
            this.Drawing(to_index)
        }

    }

    Draw(num: number, is_send = true) {
        let info = InscriptionData.Inst().RuneInfo();
        this.draw_num = num
        if (is_send) {
            InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.TURNTABLE, 1);
        }
        this.draw_flag = info.turntable_flag
    }

    Drawing(to_index: number) {
        Timer.Inst().CancelTimer(this.timer_handle)
        this.timer_handle = Timer.Inst().AddRunTimer(() => {
            let to_rotation = this.viewNode.PointerShow.rotation + this.draw_co.speed
            to_rotation = to_rotation >= 360 ? 0 : to_rotation
            this.viewNode.PointerShow.rotation = to_rotation
            if (to_rotation == to_index * 45 - 20) {
                Timer.Inst().CancelTimer(this.timer_handle)
                this.timer_handle = null
                this.FlushItemsShow(true);
            }
        }, this.draw_co.interval, -1, true)
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(InscriptionTurntableView);
    }

    OnClickHelp() {
        ViewManager.Inst().OpenView(HelpView, 24);
    }

    OnClickAd() {
        // ViewManager.Inst().OpenView(InscriptionTurntableAdView)
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

    OnClickDraw() {
        if (0 == this.isDraw5) {
            this.OnClickDraw1();
        } else {
            this.OnClickDraw10();
        }
    }

    AdAutoDraw1() {
        this.Draw(1, false)
    }

    OnClickDraw1() {
        let price_cost = InscriptionData.Inst().CfgTowerPriceCost()
        let info = InscriptionData.Inst().RuneInfo();
        if (this.draw_num > 0 || InscriptionData.Inst().turntable_drawing) {
            PublicPopupCtrl.Inst().Center(Language.Inscription.Turntable.DrawingTips)
            return
        } else if (BagData.Inst().getItemNum(price_cost.item_id) < price_cost.num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(price_cost.item_id)
            // PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Inscription.Turntable.DrawNumTips, Item.GetName(price_cost.item_id)))
            return
        }
        InscriptionData.Inst().ClearTurntableRewards()
        this.Draw(1)
    }

    OnClickDraw10() {
        let price_cost = InscriptionData.Inst().CfgTowerPriceCost()
        let info = InscriptionData.Inst().RuneInfo();
        if (this.draw_num > 0 || InscriptionData.Inst().turntable_drawing) {
            PublicPopupCtrl.Inst().Center(Language.Inscription.Turntable.DrawingTips)
            return
        } else if (BagData.Inst().getItemNum(price_cost.item_id) < price_cost.num * 10) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Inscription.Turntable.DrawNumTips, Item.GetName(price_cost.item_id)))
            return
        }
        InscriptionData.Inst().ClearTurntableRewards()
        this.Draw(10)
    }

    onChangedEnd(target: fgui.GComponent) {
        switch (target._name) {
            case "ToggleDraw5":
                this.isDraw5 = this.viewNode.ToggleDraw5.selected ? 1 : 0
                this.FlushAdShow();
                this.FlushNumShow();
                break;
        }
    }

}
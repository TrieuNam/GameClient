import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { AdType, CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TerritoryData } from "./TerritoryData";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { Item } from "modules/bag/ItemData";
import { ViewManager } from "manager/ViewManager";
import { TerritoryRefreshAdView } from "./TerritoryRefreshAdView";

@BaseView.registView
export class TerritoryRefreshView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TerritoryRefresh",
        ViewName: "TerritoryRefreshView",
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

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TerritoryRefreshView));

        this.viewNode.BtnAd.onClick(this.OnClickAd, this);
        this.viewNode.BtnFree.onClick(this.OnClickFree, this);

        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.FlushAdShow.bind(this));
    }

    InitUI() {
        this.FlushAdShow();
    }

    private FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.territory_refresh)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.territory_refresh)
        let price_cost = TerritoryData.Inst().GetOtherCfg()
        UH.SpriteName(this.viewNode.IconCost, "CommonAtlas", `Item${price_cost.re_item}`);
        this.viewNode.TimesShow.text = TextHelper.Format(Language.Inscription.Turntable.FreeTimes, co.ad_param - (info ? info.todayCount : 0));
        this.viewNode.NumShow.text = `${price_cost.re_item_num1}`;
        this.viewNode.BtnAd.grayed = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (co.ad_param > info.todayCount)));
    }

    private OnClickAd() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.territory_refresh)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.territory_refresh)
        if (info.todayCount >= co.ad_param) {
            PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
            return
        }
        ViewManager.Inst().OpenView(TerritoryRefreshAdView)
    }

    private OnClickFree() {
        let price_cost = TerritoryData.Inst().GetOtherCfg()
        let num = Item.GetNum(CommonId.Diamond);
        if (num >= price_cost.re_item_num1) {
            TerritoryCtrl.Inst().SendRefreshContainerInfo(2);
            ViewManager.Inst().CloseView(TerritoryRefreshView);
        } else {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(CommonId.Diamond);
        }
    }
}
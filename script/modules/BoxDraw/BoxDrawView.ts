import { GetCfgValue } from "config/CfgCommon";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { AdType, CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { BoxDrawData } from "./BoxDrawData";
import { BoxDrawRateView } from "./BoxDrawRateView";

@BaseView.registView
export class BoxDrawView extends BaseView {
    private param_t: { ad_type: AdType, draw_func: Function, price: number[], rate_func: Function }
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BoxDraw",
        ViewName: "BoxDrawView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        List: <fgui.GList>null,
        BtnRate: <fgui.GButton>null
    }

    protected extendsCfg = [
        { ResName: "BoxDrawItem", ExtendsClass: BoxDrawItem },
    ];

    InitData(param_t: { ad_type: AdType, draw_func: Function, price: number[], rate_func: Function }) {
        this.param_t = param_t
        this.viewNode.Board.SetData(new BoardData(BoxDrawView, GetCfgValue(Language.BoxDraw.TitleNames, param_t.ad_type)));
        let buy_fun = (index: number) => {
            BoxDrawData.Inst().BoxQuality = index;
            param_t.draw_func(index)
        }
        let data = [
            { index: 0, AdType: param_t.ad_type, buy_fun: buy_fun, price: 0 },
            { index: 1, AdType: param_t.ad_type, buy_fun: buy_fun, price: param_t.price[0] },
            { index: 2, AdType: param_t.ad_type, buy_fun: buy_fun, price: param_t.price[1] }]
        this.viewNode.List.SetData(data);
        this.viewNode.BtnRate.onClick(this.OnClickRate.bind(this))
    }
    OnClickRate() {
        ViewManager.Inst().OpenView(BoxDrawRateView, this.param_t)
    }
}

export class BoxDrawItem extends BaseItem {
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
        Times: <fgui.GTextField>null,
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
        let box_sp = "Box" + index + (AdType.inscription_tower_draw == data.AdType ? AdType.inscription_tower_draw :"")
        UH.SpriteName(this.viewNode.Box, "BoxDraw", box_sp);
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

        let limit_times = co.ad_param - info.todayCount;
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
        UH.SetText(this.viewNode.Times, TextHelper.Format(Language.LimitCoreDraw.FreeLimitTime, limit_times))
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

import { CfgItem, GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { AdType, ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButton, CommonButtonHelp } from "modules/extends/CommonButton";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { FastData, FastUseView } from "modules/FastUse/FastUseView";
import { GuildConfig } from "modules/guild/GuildConfig";
import { GuildCtrl } from "modules/guild/GuildCtrl";
import { GuildData } from "modules/guild/GuildData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";


@BaseView.registView
export class FishBoxUpView extends BaseView {
    private timer_handle_ad: any = null;
    private list_data: { is_buy: number, width: number }[];

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishBoxUp",
        ViewName: "FishBoxUpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        CurrencyShow1: <Currency>null,
        CurrencyShow2: <Currency>null,

        BtnUp: <fgui.GButton>null,
        BtnAd: <CommonButton>null,
        BtnSpeed: <fgui.GButton>null,
        BtnHelp: <CommonButtonHelp>null,

        LevelCur: <fgui.GTextField>null,
        LevelNext: <fgui.GTextField>null,
        AttrList: <fgui.GList>null,

        ImgMax: <fgui.GImage>null,
        GpUp: <fgui.GGroup>null,
        GpUping: <fgui.GGroup>null,

        TxtTime: <fgui.GRichTextField>null,
        TxtCost: <fgui.GTextField>null,
        CostIcon: <fgui.GLoader>null,
        // ListPro: <fgui.GList>null,

        TimeShow: <TimeMeter>null,

        ProBar: <fgui.GProgressBar>null,
        ListReward: <fgui.GList>null,
        GpCost: <fgui.GGroup>null,
        RedUp: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "ItemAttr", ExtendsClass: FishBoxUpViewAttrItem },
        { ResName: "BoxBuyProCell", ExtendsClass: BoxBuyProCell },
        { ResName: "BoxUpRewardCell", ExtendsClass: BoxUpRewardCell },
    ]

    InitData() {
        this.viewNode.BtnUp.onClick(this.OnClickUp, this);
        this.viewNode.BtnAd.onClick(this.OnClickAd, this);
        this.viewNode.BtnSpeed.onClick(this.OnClickSpeed, this);
        this.viewNode.BtnHelp.onClick(this.OnClickHelp, this);
        // this.viewNode.BtnBuy.onClick(this.OnClickBuy, this);

        // this.viewNode.ListPro.itemRenderer = this.renderListItem.bind(this);
        // this.viewNode.ListPro.setVirtual();
        UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(FishData.Inst().CfgOtherBoxUpItem()), ICON_TYPE.ITEM);

        this.viewNode.Board.SetData(new BoardData(FishBoxUpView));
        this.viewNode.CurrencyShow1.SetCurrencyId(FishData.Inst().CfgOtherBoxUpItem(), true);
        this.viewNode.CurrencyShow1.BtnAddShow(false)
        this.viewNode.CurrencyShow2.SetCurrencyId(FishData.Inst().CfgOtherUpTimeItem(), true);
        this.viewNode.CurrencyShow2.BtnAddShow(false)
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoInfo.bind(this), "WaBaoInfo");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushWaBaoInfo.bind(this), "OtherChange");
        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.FlushAdShow.bind(this));
        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushWaBaoInfo.bind(this), "ReportListFlush");

        GuildCtrl.Inst().SendGuildReqReportList()
    }

    InitUI() {
        this.FlushWaBaoInfo()
        this.FlushAdShow();
    }

    private FlushAdShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.fish_speed_up)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.fish_speed_up)

        let is_grey = !(RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount)));
        this.viewNode.BtnAd.grayed = is_grey;
        this.viewNode.BtnAd.ShowRedPoint(!is_grey);

        Timer.Inst().CancelTimer(this.timer_handle_ad)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_ad = Timer.Inst().AddCountDownCT(() => {
                let ft = TimeHelper.FormatDHMS(info.nextFetchTime - TimeCtrl.Inst().ServerTime);
                this.viewNode.BtnAd.title = TextHelper.SizeStr(TextHelper.Format(Language.UiTimeMeter.TimeStr1, ft.hour, ft.minute, ft.second), 28)
            }, this.FlushAdShow.bind(this), info.nextFetchTime, 1)
        } else {
            this.viewNode.BtnAd.title = Language.Box.BtnReduceTime
        }
    }

    private OnClickAd() {
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.fish_speed_up)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.fish_speed_up)
        if (info) {
            if (info.todayCount >= co.ad_param) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdFreeTime);
                return
            } else if (info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
                PublicPopupCtrl.Inst().Center(Language.Common.AdColdTime);
                return
            }
        }
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.fish_speed_up, TextHelper.Format(Language.adv.speed, co.ad_award[0].num * 5));
    }

    CloseCallBack() {
        this.viewNode.TimeShow.CloseCountDownTime()
        Timer.Inst().CancelTimer(this.timer_handle_ad)
    }

    FlushWaBaoInfo() {
        let info = FishData.Inst().ResultData.WaBaoInfo
        UH.SetText(this.viewNode.LevelCur, TextHelper.Format(Language.Fish.FishBoxUp.LevelCur, info.collectionLevel))
        UH.SetText(this.viewNode.LevelNext, TextHelper.Format(Language.Fish.FishBoxUp.LevelNext, info.collectionLevel + 1))
        let attr_list = []
        let gather_cur = FishData.Inst().CfgGatherInfo(info.collectionLevel)
        let gather_next = FishData.Inst().CfgGatherInfo(info.collectionLevel + 1)
        let is_max = undefined == gather_next

        for (let i = 1; i <= 4; i++) {
            attr_list.push({ index: i, cur: gather_cur, next: gather_next })
        }
        this.viewNode.AttrList.SetData(attr_list)
        this.viewNode.ImgMax.visible = is_max

        if (is_max) {
            this.viewNode.GpUp.visible = false
            this.viewNode.GpUping.visible = false
            return
        }

        let is_uping = TimeCtrl.Inst().ServerTime < info.collectionLevelUpTime
        this.viewNode.GpUp.visible = !is_uping
        this.viewNode.GpUping.visible = is_uping

        let rp_up = 0
        if (is_uping) {
            info.collectionLevelUpTime
            this.FlushUpTimeShow()
            this.viewNode.BtnHelp.SetData({ type: GuildConfig.HelpType.fish_box, level: info.collectionLevel });
        } else {
            let time_t = TimeHelper.FormatDHMS(gather_cur.up_time_minute * 60);
            let time = TextHelper.Format(Language.UiTimeMeter.TimeStr1, time_t.day * 24 + time_t.hour, time_t.minute, time_t.second)
            let is_enough = BagData.Inst().getItemNum(FishData.Inst().CfgOtherBoxUpItem()) >= gather_cur.price
            UH.SetText(this.viewNode.TxtTime, Language.Fish.FishBoxUp.NeddTime + TextHelper.ColorStr(time, COLORSTR.Green1));
            UH.SetText(this.viewNode.TxtCost, gather_cur.price);
            this.viewNode.TxtCost.color = is_enough ? COLORS.Green1 : COLORS.Red1;
            this.viewNode.TxtCost.strokeColor = is_enough ? COLORS.Green2 : COLORS.Red2;
            // this.list_data = FishData.Inst().GetFishUpProListData(gather_cur);
            // this.viewNode.ListPro.numItems = this.list_data.length;
            // this.viewNode.BtnUp.grayed = info.collectionBuyTimes < gather_cur.up_num

            let pro_data = FishData.Inst().GetFishBoxUpPro(gather_cur);
            this.viewNode.ProBar.width = pro_data.max;
            this.viewNode.ProBar.max = pro_data.max;
            this.viewNode.ProBar.value = pro_data.val;

            this.viewNode.ListReward.SetData(FishData.Inst().GetFishBoxUpReward(gather_cur))

            if (info.collectionBuyTimes < gather_cur.up_num) {
                rp_up = is_enough ? 1 : 0
                this.viewNode.BtnUp.title = Language.Common.buy;
                this.viewNode.GpCost.visible = true;
            } else {
                rp_up = 1
                this.viewNode.BtnUp.title = Language.Common.up_level;
                this.viewNode.GpCost.visible = false;
                // UH.SetText(self.viewNode.TxtCost, this.cur_cfg.price)
                // this.FlushCostColor();
            }
        }
        this.viewNode.RedUp.SetNum(rp_up)
    }

    FlushUpTimeShow() {
        this.viewNode.TimeShow.CloseCountDownTime()
        let info = FishData.Inst().ResultData.WaBaoInfo
        if (info.collectionLevelUpTime > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(info.collectionLevelUpTime, TimeFormatType.TYPE_TIME_0, Language.Fish.FishBoxUp.TimeShow);
            this.viewNode.TimeShow.SetCallBack(this.FlushUpTimeShow.bind(this));
        }
        else {
            this.viewNode.TimeShow.SetTime("");
        }
    }

    private renderListItem(index: number, item: BoxBuyProCell) {
        item.SetData(this.list_data[index]);
    }

    OnClickUp() {
        let info = FishData.Inst().ResultData.WaBaoInfo
        let gather_cur = FishData.Inst().CfgGatherInfo(info.collectionLevel)
        if (info.collectionBuyTimes < gather_cur.up_num) {
            FishCtrl.Inst().SendWaBaoReqCollectionBuy()
        } else {
            FishCtrl.Inst().SendWaBaoReqCollectionUp()
        }
    }

    OnClickAd1() {
        let data_ad = RoleData.Inst().AdInfo
        let box_ad = data_ad.get(AdType.fish_speed_up)
        if (box_ad) {
            let co = RoleData.Inst().CfgAdTypeSeq(AdType.fish_speed_up)
            if (+co.ad_param - box_ad.todayCount <= 0) {
                this.viewNode.BtnAd.visible = false;
                return
            }
            if (box_ad.nextFetchTime != 0) {
                let time = box_ad.nextFetchTime - TimeCtrl.Inst().ServerTime
                if (time > 0) {
                    let fTime = TimeHelper.FormatDHMS(time);
                    let tip = Language.Box.tip9;
                    if (fTime.minute > 0 || fTime.hour > 0) {
                        tip = fTime.minute + Language.Date.minute + tip
                        if (fTime.hour > 0) {
                            tip = fTime.hour + Language.Date.hour + tip
                        }
                        PublicPopupCtrl.Inst().Center(tip);
                    }
                    return
                }
            }
        }
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.fish_speed_up)
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.fish_speed_up, TextHelper.Format(Language.adv.speed, co.ad_award[0].num * 5));
    }

    OnClickSpeed() {
        let info = FishData.Inst().ResultData.WaBaoInfo
        let item_id = FishData.Inst().CfgOtherUpTimeItem();
        let cfg = Item.GetConfig(item_id);
        let max_num = Math.ceil((info.collectionLevelUpTime - TimeCtrl.Inst().ServerTime) / 60 / cfg.param);
        let fast_data = new FastData(max_num, item_id, (num: number) => {
            FishCtrl.Inst().SendWaBaoReqCollectionQuicken(num);
        }, 1);
        ViewManager.Inst().OpenView(FastUseView, fast_data)
    }

    OnClickHelp() {
        GuildCtrl.Inst().SendGuildReqHelp(1)
    }

    OnClickBuy() {
        let info = FishData.Inst().ResultData.WaBaoInfo
        let gather_cur = FishData.Inst().CfgGatherInfo(info.collectionLevel)
        if (info.collectionBuyTimes >= gather_cur.up_num) {
            PublicPopupCtrl.Inst().Center(Language.Fish.FishBoxUp.CanUpTips);
            return
        }
        FishCtrl.Inst().SendWaBaoReqCollectionBuy()
    }
}

class FishBoxUpViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrCur: <fgui.GTextField>null,
        AttrNext: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        let cur = data.cur
        let next = data.next
        UH.SetText(this.viewNode.AttrCur, `${GetCfgValue(Language.Fish.FishBoxUp.AttrShows, data.index)}${GetCfgValue(cur, "num_" + data.index)}${Language.Fish.FishBoxUp.unit}`)
        UH.SetText(this.viewNode.AttrNext, next ? `${GetCfgValue(next, "num_" + data.index)}${Language.Fish.FishBoxUp.unit}` : "")
    }
}

class BoxBuyProCell extends fgui.GComponent {
    private viewNode = {
        ProLoader: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(pro: { is_buy: number, width: number }) {
        if (this.viewNode.ProLoader) {
            UH.SpriteName(this.viewNode.ProLoader, "FishBoxUp", pro.is_buy ? "JinDuLv" : "JinDuDi");
            this.width = pro.width;
        }
    }
}


class BoxUpRewardCell extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        Block: <fgui.GGraph>null,
        ObjFetched: <fgui.GGroup>null,
        redPoint: <RedPoint>null,
        Pro: <fgui.GLoader>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Block.onClick(this.GetReward.bind(this));
    }
    public SetData(data: { item: CfgItem, is_fetch: number, can_fetch: boolean, seq: number }) {
        this._data = data;
        this.viewNode.Cell.SetData(Item.Create(data.item, { is_num: true }));
        this.viewNode.Block.visible = data.can_fetch;
        this.viewNode.ObjFetched.visible = data.is_fetch == 1;
        this.viewNode.redPoint.SetNum(data.can_fetch ? 1 : 0);
        UH.SpriteName(this.viewNode.Pro, "FishBoxUp", (data.is_fetch == 1 || data.can_fetch) ? "FenGeFuGaoLiang" : "FenGeFu")
    }
    public GetReward() {
        if (this._data) {
            if (this._data.can_fetch) {
                FishCtrl.Inst().SendWaBaoReqFetchCollectionLevelReward(this._data.seq)
            }
        }
    }
}
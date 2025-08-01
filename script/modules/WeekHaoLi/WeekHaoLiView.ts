import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { COLORS } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { WeekHaoLiData } from "./WeekHaoLiCtrl";

export class WeekHaoLiView extends fgui.GComponent {
    private cache_timer = 0;
    private gift_data: any

    private viewNode = {
        // bg:<EGLoader> null,
        // need_show: <fgui.GLabel>null,
        reward_show: <fgui.GList>null,
        timer: <TimeMeter>null,
        LastTime: <fgui.GTextField>null,

    }

    private handleCollector: HandleCollector;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.addSmartDataCare(WeekHaoLiData.Inst().WeekHaoLiSmartData, this.FlushGiftList.bind(this));


        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this), this.FlushUpdateTime.bind(this));
        this.viewNode.reward_show.itemRenderer = this.renderListItem.bind(this);
        // this.viewNode.reward_show.setVirtual();

        this.flushinfo()
    }

    public flushinfo() {
        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.WeekHaoLi)
        this.FlushFlushTime()
        this.FlushGiftList()
    }

    public FlushGiftList() {
        this.gift_data = WeekHaoLiData.Inst().GetShowRewardList();

        this.viewNode.reward_show.numItems = this.gift_data.length;
    }

    private FlushFlushTime() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }

    private FlushUpdateTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.WeekHaoLi.TimeStr5, time_t.day, time_t.hour);
        UH.SetText(this.viewNode.LastTime, Language.WeekHaoLi.TimeLimit + t_str)
    }

    private renderListItem(index: number, item: WeekHaoLiItem) {
        item.SetData(this.gift_data[index]);
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
}

export class WeekHaoLiItem extends fgui.GComponent {
    private viewNode = {
        Bg: <fgui.GLoader>null,
        Name: <fgui.GTextField>null,
        ItemList: <fgui.GList>null,
        XianGou: <fgui.GTextField>null,
        BtnBuy: <fgui.GButton>null,
        icon: <fgui.GLoader>null,
        cost: <fgui.GTextField>null,
        common: <fgui.GGroup>null,
        ZhiGou: <fgui.GTextField>null,
        effectbox: <UIEffectShow>null,
        effectbtn: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.OnClickBuy.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data
        UH.SpriteName(this.viewNode.Bg, "MoreServerWeekHaoLi", "weekbg_" + data.bg_color);
        UH.SetText(this.viewNode.Name, data.gift_name);

        let has_buy_time = WeekHaoLiData.Inst().GetGiftBuyTime(data.seq);
        UH.SetText(this.viewNode.XianGou, TextHelper.Format(Language.WeekHaoLi.XianGou[data.limit_type], data.limit_convert_count - has_buy_time));

        this.viewNode.ItemList.itemRenderer = this.renderItemListItem.bind(this);
        this.viewNode.ItemList.setVirtual();
        this.viewNode.ItemList.numItems = data.reward_item.length;

        this.viewNode.common.visible = data.price_type != 3;
        this.viewNode.ZhiGou.visible = data.price_type == 3;

        UH.GoldIcon(this.viewNode.icon, data.price_type == 1 ? 40001 : 40000);
        let color = Item.GetNum(CommonId.Gold) < data.price && data.price_type == 2 || Item.GetNum(CommonId.Diamond) < data.price && data.price_type == 1 ? COLORS.Red1 : COLORS.White
        UH.SetText(this.viewNode.cost, data.price);
        this.viewNode.cost.color = color
        UH.SetText(this.viewNode.ZhiGou, TextHelper.Format(Language.WeekHaoLi.Cost, data.price / 10));

        this.viewNode.BtnBuy.grayed = data.limit_convert_count - has_buy_time <= 0
        this.viewNode.icon.grayed = data.limit_convert_count - has_buy_time <= 0

        // UH.SetText(this.viewNode.num_show,Language.AffordPresent.NumShow+data.num_show)
        this.viewNode.effectbox.PlayEff(4164104)
        if (data.limit_convert_count - has_buy_time <= 0) {
            this.viewNode.effectbtn.StopEff(4164100)
        } else {
            this.viewNode.effectbtn.PlayEff(4164100)
        }


    }

    private renderItemListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.data.reward_item[index], { is_num: true }));
    }

    private OnClickBuy() {
        let has_buy_time = WeekHaoLiData.Inst().GetGiftBuyTime(this.data.seq);
        if (this.data.limit_convert_count - has_buy_time <= 0) {
            PublicPopupCtrl.Inst().Center(Language.Common.buy_limit)
            return
        }
        if (this.data.price_type == 3) {     //直购
            let money = this.data.price
            let order_data = Order_Data.initOrder(this.data.seq, ACTIVITY_TYPE.WeekHaoLi, money / 10, money, "");
            OrderCtrl.generateOrder(order_data);
        } else {
            WeekHaoLiData.Inst().SendWeekHaoLiBuy(this.data.seq)
        }
    }
}


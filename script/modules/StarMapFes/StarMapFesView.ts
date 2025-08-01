import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { StarMapFesCtrl, StarMapFesData } from "./StarMapFesCtrl";

@BaseView.registView
export class StarMapFesView extends BaseView {
    select_index = 0;
    private time_timer: any;
    private realtime = 0
    private cache_timer = 0
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.StarMapFes.TagName[0], index: 0, modKey: null, isRemind: false },
        { panel: null, viewName: "", titleName: Language.StarMapFes.TagName[1], index: 1, modKey: null, isRemind: false },
        // { panel: null, viewName: "", titleName: Language.StarMapFes.TagName[2], index: 2, modKey: null, isRemind: false },
    ]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "StarMapFes",
        ViewName: "StarMapFesView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode: { [key: string]: any } = {
        Board: <CommonBoard2>null,
        TaskList: <fgui.GList>null,
        TagList: <fgui.GList>null,
        ShopList: <fgui.GList>null,
        TimeShow: <fgui.GLabel>null,
        RedPoint0: <RedPoint>null,
        RedPoint1: <RedPoint>null,
        RedPoint2: <RedPoint>null,
    }
    protected extendsCfg = [
        { ResName: "TaskItem", ExtendsClass: StarMapFesTaskItem },
        { ResName: "ShopItem", ExtendsClass: StarMapFesShopItem },
        // { ResName: "BtnBuy", ExtendsClass: StarMapFesShopBtnBuy },
    ]
    InitData() {
        this.viewNode.Board.SetData(new BoardData(StarMapFesView, Language.StarMapFes.Title))
        let fix_list = StarMapFesData.Inst().FixTagList(this.tabbarCfg)
        this.viewNode.TagList.SetData(fix_list);
        this.viewNode.TagList.on(fgui.Event.CLICK_ITEM, this.OnClickTagItem, this);
        // this.viewNode.ShopList.on(fgui.Event.CLICK_ITEM, this.ClickShopItem, this);
        this.AddSmartDataCare(StarMapFesData.Inst().flush_info, this.flushInfoPanel.bind(this), "flush_need");

        this.viewNode.TagList.selectedIndex = 0
        this.select_index = 0
        this.FlushShow()
    }

    CloseCallBack(): void {
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined
    }

    public OnClickTagItem(item: CommonBoard5Tab) {
        if (this.select_index != item._data.index) {
            this.select_index = item._data.index
            this.FlushShow();
        }
    }

    public FlushShow() {
        if (this.select_index <= 1) {
            this.viewNode.TaskList.visible = true;
            this.viewNode.ShopList.visible = false;
        } else {
            this.viewNode.TaskList.visible = false;
            this.viewNode.ShopList.visible = true;
        }

        this.flushInfoPanel()
    }

    public flushInfoPanel() {
        if (this.select_index == 0) {
            let list = StarMapFesData.Inst().GetTask0List()
            this.viewNode.TaskList.SetData(list)
        }
        else if (this.select_index == 1) {
            let list = StarMapFesData.Inst().GetTask1List()
            this.viewNode.TaskList.SetData(list)
        }
        else if (this.select_index == 2) {
            let list = StarMapFesData.Inst().GetShopList()
            this.viewNode.ShopList.SetData(list)
        }

        let view_param = StarMapFesData.Inst().GetViewParam()
        this.cache_timer = view_param.timer

        this.viewNode.RedPoint0.SetNum(StarMapFesData.Inst().GetRed0Num())
        this.viewNode.RedPoint1.SetNum(StarMapFesData.Inst().GetRed1Num())
        this.viewNode.RedPoint2.SetNum(StarMapFesData.Inst().GetFreeGiftRed())
        this.FlushFlushTime()
    }

    private FlushFlushTime() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;
        this.realtime = 0;
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined
        if (time > 0) {
            this.time_timer = Timer.Inst().AddCountDownTT(
                this.FlushUpdateTime.bind(this, time),
                this.FlushFlushTime.bind(this),
                time, 1);
        }
    }

    private FlushUpdateTime(total_time: number) {
        let time = Math.max(total_time - this.realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let hour_show = (time_t.hour == 0 && time > 0) ? 1 : time_t.hour
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, hour_show);
        UH.SetText(this.viewNode.TimeShow, t_str)

        this.realtime = this.realtime + 1
    }

    public ClickShopItem(item: StarMapFesShopItem) {
        if (item.data.limit_full) {
            PublicPopupCtrl.Inst().Center(Language.StarMapFes.LimitBuyFull)
            return
        }

        if (item.data.price_type == 3) {
            let seq = item.data.seq
            let money = item.data.price_num
            let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.StarMapGala, money / 10, money, "");
            OrderCtrl.generateOrder(order_data);
        }
        else {
            if (item.data.price_num > 0) {
                StarMapFesData.Inst().TryBuy({
                    seq: item.data.seq,
                    item_id: item.data.id,
                    num: item.data.num,
                    price_type: item.data.price_type,
                    price: item.data.price,
                    limit: item.data.limit_time,
                })
            }
            else {
                StarMapFesCtrl.Inst().SendStarMapFesReq(2, item.data.seq)
            }

        }
    }
}

export class StarMapFesTaskItem extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        ItemCell: <ItemCell>null,
        TaskTitle: <fgui.GLabel>null,
        Progress: <fgui.GProgressBar>null,
        BtnOper: <fgui.GButton>null,
        RedPoint: <RedPoint>null,
        Got: <fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.BtnOper.onClick(this.OnClickOper.bind(this));
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data

        let item_call = Item.Create({ item_id: data.reward_id, num: data.reward_num }, { is_num: true, is_click: true })
        this.viewNode.ItemCell.SetData(item_call)
        UH.SetText(this.viewNode.TaskTitle, data.desc)
        this.viewNode.Progress.max = data.task_max
        this.viewNode.Progress.value = data.task_num
        this.viewNode.BtnOper.title = data.btn_name
        // LogError(":d ",data.btn_name,data.is_complete)
        this.viewNode.BtnOper.grayed = !data.is_complete

        this.viewNode.RedPoint.SetNum(data.is_complete && !data.is_done)
        this.viewNode.Got.visible = data.is_done
        this.viewNode.BtnOper.visible = !data.is_done
    }

    public OnClickOper() {
        if (!this.data.is_complete) {
            PublicPopupCtrl.Inst().Center(Language.StarMapFes.TaskUnComplete)
            return
        }

        StarMapFesCtrl.Inst().SendStarMapFesReq(1, this.data.task_id)
    }
}

export class StarMapFesShopItem extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        ItemCell: <ItemCell>null,
        ItemName: <fgui.GLabel>null,
        limit: <fgui.GLabel>null,
        // price:<fgui.GLabel>null,
        off_group: <fgui.GGroup>null,
        // Free:<fgui.GLabel>null,
        off_str: <fgui.GLabel>null,
        diamond: <fgui.GLoader>null,

        bg: <fgui.GImage>null,
        off_bg: <fgui.GImage>null,
        BtnBuy: <CommonButtonBuy>null,
        redPoint: <RedPoint>null,
        // BtnFree:<fgui.GButton>null,
        // price_bg:<fgui.GImage>null,
        // ClickArea:<fgui.GGraph>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        // this.viewNode.ClickArea.onClick(this.OnClickOper.bind(this));
        this.viewNode.BtnBuy.onClick(this.OnClickOper.bind(this));
        // this.viewNode.BtnFree.onClick(this.OnClickOper.bind(this));
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data
        if (data.price_type == 4) {
            if (!data.limit_full) {
                this.viewNode.redPoint.SetNum(StarMapFesData.Inst().GetFreeGiftRed());
            }
        } else {
            this.viewNode.redPoint.SetNum(0);
        }


        let item_call = Item.Create({ item_id: data.id, num: data.num }, { is_num: true, is_click: !data.limit_full, is_gray: data.limit_full })
        this.viewNode.ItemCell.SetData(item_call)
        UH.SetText(this.viewNode.ItemName, item_call.Name())
        this.viewNode.limit.visible = data.is_limit
        UH.SetText(this.viewNode.limit, data.limit)
        // this.viewNode.BtnFree.visible = data.is_free
        // this.viewNode.BtnBuy.visible = !data.is_free
        let btn_icon = this.viewNode.BtnBuy.GetIcon();

        if (data.is_free) {
            btn_icon.visible = false
            this.viewNode.BtnBuy.title = Language.StarMapFes.BtnFree
        }
        else {
            btn_icon.visible = true
            this.viewNode.BtnBuy.title = " " + data.price // TextHelper.ColorStr(data.price, this.CheckEnough() ? COLORSTR.Yellow2 : COLORSTR.Red1)
            if (data.price_type == 3) {
                UH.SpriteName(btn_icon, "StarMapFes", "RenMinBi");

            } else {
                UH.GoldIcon(btn_icon, data.price_item)
            }
        }


        this.viewNode.off_group.visible = data.off_show
        UH.SetText(this.viewNode.off_str, data.off_str)
        // this.viewNode.BtnBuy.SetData(
        //     {
        //         type:data.price_type,
        //         item:data.price_item,
        //         price:TextHelper.ColorStr(data.price,this.CheckEnough() ?COLORSTR.Yellow2 : COLORSTR.Red1)
        //     }
        // )
        // UH.SetIcon(this.viewNode.diamond, data.price_item.toString(), ICON_TYPE.ITEM)

        // if(data.price_type == 3)
        // {
        //     UH.SpriteName(this.viewNode.BtnBuy,"StarMapFes","RenMinBi");    
        // }
        // else if(data.price_type == 1 || data.price_type == 2){
        //     let oper = this.viewNode.BtnBuy.icon
        //     LogError("? ohnafs ",oper)
        //     UH.SetIcon(oper, data.price_item, ICON_TYPE.ITEM);    
        // }


        // UH.SetText(this.viewNode.BtnBuy.title,TextHelper.ColorStr(data.price,this.CheckEnough() ?COLORSTR.Yellow1 : COLORSTR.Red1))

        this.viewNode.ItemName.grayed = data.limit_full
        this.viewNode.limit.grayed = data.limit_full
        // this.viewNode.price.grayed = data.limit_full
        // this.viewNode.Free.grayed = data.limit_full
        this.viewNode.off_str.grayed = data.limit_full
        // this.viewNode.diamond.grayed = data.limit_full
        this.viewNode.bg.grayed = data.limit_full
        this.viewNode.off_bg.grayed = data.limit_full
        this.viewNode.BtnBuy.grayed = data.limit_full
        // this.viewNode.price_bg.grayed = data.limit_full

    }

    public CheckEnough() {
        if (this.data.price_type == 1 || this.data.price_type == 2) {
            let num = Item.GetNum(this.data.price_item)
            return num >= this.data.price
        }
        return true
    }

    public OnClickOper() {
        if (this.data.limit_full) {
            PublicPopupCtrl.Inst().Center(Language.StarMapFes.LimitBuyFull)
            return
        }

        if (this.data.price_type == 3) {
            let seq = this.data.seq
            let money = this.data.price_num
            let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.StarMapGala, money / 10, money, "");
            OrderCtrl.generateOrder(order_data);
        }
        else {
            if (this.data.price_num > 0) {
                StarMapFesData.Inst().TryBuy({
                    seq: this.data.seq,
                    item_id: this.data.id,
                    num: this.data.num,
                    price_type: this.data.price_type,
                    price: this.data.price,
                    limit: this.data.limit_time,
                })
            }
            else {
                StarMapFesCtrl.Inst().SendStarMapFesReq(2, this.data.seq)
            }

        }
    }
}

export class StarMapFesShopBtnBuy extends fgui.GButton {
    private viewNode = {
        title: <fgui.GLabel>null,
        icon: <fgui.GLoader>null,
        rmb: <fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data
        UH.SetText(this.viewNode.title, data.price)

        if (data.type == 3) {
            this.viewNode.rmb.visible = true
            this.viewNode.icon.visible = false
        }
        else {
            this.viewNode.rmb.visible = false
            this.viewNode.icon.visible = true
            UH.SetIcon(this.viewNode.icon, data.item, ICON_TYPE.ITEM);
        }
    }
}

export class StarMapBtnFes extends fgui.GButton {
    protected handleCollector: HandleCollector;
    private viewNode: { [key: string]: any } = {
        ItemCell: <ItemCell>null,
        timer: <TimeMeter>null,
        RedPoint: <RedPoint>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.timer.SetOutline(true, COLORSTR.Green2)
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this), this.FlushUpdateTime.bind(this));

        this.viewNode.timer.StampTime(StarMapFesData.Inst().GetEndTime(),
            TimeFormatType.TYPE_TIME_4)

        this.handleCollector = HandleCollector.Create();

        var handle = SMDHandle.Create(StarMapFesData.Inst().flush_info, this.FlushRedPoint.bind(this), "flush_need");
        this.handleCollector.Add(handle);


        this.FlushRedPoint()
    }

    private FlushFlushTime() {
        StarMapFesData.Inst().CheckTime()
    }

    private FlushUpdateTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let hour_show = (time_t.hour == 0 && time > 0) ? 1 : time_t.hour
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, hour_show);
        t_str = TextHelper.RichTextOutLine(t_str, COLORSTR.Green2, 2);
        UH.SetText(this.viewNode.timer, t_str)
    }

    private FlushRedPoint() {
        this.viewNode.RedPoint.SetNum(StarMapFesData.Inst().GetRedNum())
    }

    protected onDestroy() {
        this.viewNode.timer.CloseCountDownTime();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        super.onDestroy();
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data
    }

}

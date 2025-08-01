
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ShenQiDrawCtrl, ShenQiDrawData, SHENQIDRAW_REQ_TYPE } from "./ShenQiDrawCtrl";
import { TimeMeter } from '../extends/TimeMeter';
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from '../extends/RedPoint';
import { MoreServerActivityView } from "modules/moreserveractive/MoreServerActivityView";
import { ShenQiView } from "modules/shenqi/ShenQiView";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";
import { Timer } from "modules/time/Timer";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Order_Data, OrderCtrl } from "modules/recharge/OrderCtrl";
import { LogError } from "core/Debugger";
import { ActivityData } from "modules/activity/ActivityData";
import { TimeHelper } from "../../helpers/TimeHelper";
import { Language } from "modules/common/Language";
import { COLORSTR } from "modules/common/ColorEnum";
import { TextHelper } from "../../helpers/TextHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AngelFesCtrl } from "modules/AngelFes/AngelFesCtrl";

export class ShenQiDrawView extends fgui.GComponent {
    private cache_timer = 0
    private time_timer: any;
    private realtime = 0

    private tab_index = 0
    private viewNode = {
        BtnGoTo:<fgui.GButton>null,
        BtnTab1:<ShenQiDrawTab>null,
        BtnTab2:<ShenQiDrawTab>null,
        List:<fgui.GList>null,
        timers:<fgui.GLabel>null,
    }

    private handleCollector: HandleCollector;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.addSmartDataCare(ShenQiDrawData.Inst().flush_info, this.flushinfo.bind(this));

        let tabs = ShenQiDrawData.Inst().GetTabList()
        this.viewNode.BtnTab1.SetData(tabs[0])
        this.viewNode.BtnTab2.SetData(tabs[1])
        this.viewNode.BtnTab1.selected = true // 默认选中

        this.viewNode.BtnGoTo.onClick(this.OnClickGoTo.bind(this));
        this.viewNode.BtnTab1.onClick(this.OnClickTab.bind(this,tabs[0].type));
        this.viewNode.BtnTab2.onClick(this.OnClickTab.bind(this,tabs[1].type));

        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.ShenQiDuoBao);
        this.FlushTimer()
        this.flushinfo()
    }
    public flushinfo() {
        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.ShenQiDuoBao);
        let list = ShenQiDrawData.Inst().GetViewDetail(this.tab_index)

        this.viewNode.List.SetData(list)
        this.viewNode.BtnTab1.FlushRed()
    }
    protected onDestroy(): void {
        super.onDestroy();

        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined;
        this.realtime = 0;

        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    private FlushTimer() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;
        this.realtime = 0;

        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined
        if (time > 0) {
            this.time_timer = Timer.Inst().AddCountDownTT(
                this.FlushUpdateTime.bind(this, time),
                this.FlushTimer.bind(this),
                time, 1);
        }
    }
    private FlushUpdateTime(total_time: number) {
        let time = Math.max(total_time - this.realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let str = ""
        let str_day =  time_t.day //time_t.day < 10 ? "0" + time_t.day :
        str = str + TextHelper.ColorStr(str_day,COLORSTR.Green4)+Language.ShenQiDuoBao.TimeShow[0]
        let str_hour = time_t.hour < 10 ? "0" + time_t.hour : time_t.hour
        str = str + (time_t.hour > 0 ? TextHelper.ColorStr(str_hour,COLORSTR.Green4)+Language.ShenQiDuoBao.TimeShow[1] : TextHelper.ColorStr(1,COLORSTR.Green4)+Language.ShenQiDuoBao.TimeShow[1])
        // let str_min = time_t.minute < 10 ? "0" + time_t.minute : time_t.minute
        // str = str + (time_t.minute > 0 ? TextHelper.ColorStr(str_min+Language.ShenQiDuoBao.TimeShow[2],COLORSTR.Green4) : "")

        UH.SetText(this.viewNode.timers,str)

        this.realtime = this.realtime + 1
    }
    private OnClickGoTo() {
        ViewManager.Inst().CloseView(MoreServerActivityView);
        ViewManager.Inst().OpenView(ShenQiView)
    }

    private OnClickTab(index:number) {
        this.tab_index = index

        this.viewNode.BtnTab1.selected = this.tab_index == 0
        this.viewNode.BtnTab2.selected = this.tab_index == 1

        this.flushinfo()
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
}


export class ShenQiDrawCell extends fgui.GComponent {
    private viewNode = {
        TitleShow:<fgui.GLabel>null,
        ShowLimit:<fgui.GGroup>null,
        RewardList:<fgui.GList>null,
        TaskShow:<fgui.GGroup>null,
        GiftShow:<fgui.GGroup>null,
        BtnTaskGet:<CommonButtonBuy>null,
        BtnGiftBuy:<CommonButtonBuy>null,
        gift_value:<fgui.GLabel>null,
        gift_price:<fgui.GLabel>null,
        icon_price:<fgui.GLoader>null,
        RedPoint:<RedPoint>null,
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.BtnTaskGet.onClick(this.OnClickTaskGet.bind(this));
        this.viewNode.BtnGiftBuy.onClick(this.OnClickGiftBuy.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data    

        UH.SetText(this.viewNode.TitleShow, data.title_show)

        this.viewNode.icon_price.visible = data.icon_price > 0
        UH.SetText(this.viewNode.gift_value, data.gift_value)
        UH.SetText(this.viewNode.gift_price, data.gift_price)
        UH.GoldIcon(this.viewNode.icon_price, data.icon_price)

        this.viewNode.BtnGiftBuy.title = data.price_num
        this.viewNode.BtnTaskGet.title = data.oper_str
        this.viewNode.BtnTaskGet.grayed = !data.is_complete || data.is_got
        this.viewNode.BtnGiftBuy.grayed = data.is_limit_buy

        this.viewNode.TaskShow.visible = data.show_type == 0
        this.viewNode.GiftShow.visible = data.show_type == 1

        let btn_icon = this.viewNode.BtnGiftBuy.GetIcon();
        if(data.need_icon > 0)
        {
            btn_icon.visible = true;
            UH.GoldIcon(btn_icon, data.need_icon)
        }
        else if(data.price_num > 0)
        {
            btn_icon.visible = true;
            UH.SpriteName(btn_icon, "CommonButton", "RenMinBiZhongHuang")
        }
        

        this.viewNode.RewardList.SetData(data.rewards)
        this.viewNode.RedPoint.SetNum((data.is_complete && !data.is_got ? 1:0))

        this.viewNode.ShowLimit.visible = data.is_limit
    }

    public OnClickTaskGet()
    {
        if(!this.data.is_complete)
        {
            PublicPopupCtrl.Inst().Center(Language.ShenQiDuoBao.UnComplete)
            return 
        }

        if(this.data.is_got)
        {
            PublicPopupCtrl.Inst().Center(Language.ShenQiDuoBao.RewardGot)
            return 
        }


        ShenQiDrawCtrl.Inst().SendShenqiDuobaoReq(SHENQIDRAW_REQ_TYPE.FETCH_TASK_REWARD,this.data.seq)
    }
    
    public OnClickGiftBuy()
    {
        if(this.data.is_got)
        {
            PublicPopupCtrl.Inst().Center(Language.ShenQiDuoBao.RewardGot)
            return 
        }

        if(this.data.is_limit_buy)
        {
            PublicPopupCtrl.Inst().Center(Language.ShenQiDuoBao.LimitBuy)
            return
        }

        if(this.data.price_type == 3)
        {
            let seq = this.data.seq
            // 注意类型3在显示处理的时候已经除过一次10了
            let money = this.data.price_num
            let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.ShenQiDuoBao, money , money*10, "");
            OrderCtrl.generateOrder(order_data);
        }
        else 
        {
            if(this.data.price_num > 0 ){
                ShenQiDrawData.Inst().TryBuy({
                    seq:this.data.seq,
                    item_id:this.data.rewards[0].item_info.item_id,
                    num:this.data.rewards[0].item_info.num,
                    price_type:this.data.price_type,
                    price:this.data.price_num,
                    limit:this.data.is_limit ?this.data.limit_time : 999999,
                })
            }
            else
            {
                ShenQiDrawCtrl.Inst().SendShenqiDuobaoReq(SHENQIDRAW_REQ_TYPE.BUY_GIFT,this.data.seq)
            }

            // ShenQiDrawCtrl.Inst().SendShenqiDuobaoReq(SHENQIDRAW_REQ_TYPE.BUY_GIFT,this.data.seq)
        }
        
    }
}

export class ShenQiDrawRewardCell extends fgui.GComponent {
    private viewNode = {
        item_cell:<ItemCell>null,
        item_name:<fgui.GLabel>null,
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data    

        let item = Item.Create(data.item_info,{is_click:true,is_num:true})
        this.viewNode.item_cell.SetData(item)
        UH.SetText(this.viewNode.item_name, item.Name())
    }
}

export class ShenQiDrawTab extends fgui.GButton {
    private viewNode = {
        TitleUp:<fgui.GLabel>null,
        TitleDown:<fgui.GLabel>null,
        redPoint:<RedPoint>null
    }
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data
        
        UH.SetText(this.viewNode.TitleUp, data.title)
        UH.SetText(this.viewNode.TitleDown, data.title)
    }

    public FlushRed()
    {
        this.viewNode.redPoint.SetNum(ShenQiDrawData.Inst().GetTypeRed(this.data.type))
    }
}
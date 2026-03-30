
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { TimeMeter, TimeFormatType } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { OpenServerCtrl, NEO_SHOP_REQ_TYPE } from "./OpenServerCtrl";
import { OpenServerData } from "./OpenServerData";
import { OpenServerNeoShopConfirmView } from './OpenServerNeoShopConfirmView';
import { COLORSTR } from '../common/ColorEnum';

export class OpenServerNeoShop extends fgui.GComponent {
    private viewNode = {
        Timer: <fgui.GLabel>null,
        timer: <TimeMeter>null,
        flush_timer: <TimeMeter>null,
        BtnFlush: <fgui.GButton>null,
        shop_list: <fgui.GList>null,
        FlushNeed: <fgui.GLabel>null,
        FlushIcon: <fgui.GLoader>null,
        FlushShow: <fgui.GGraph>null,
        loader: <EGLoader>null,
        DayFlush: <fgui.GLabel>null,
    }
    private cache_timer = 0
    private cache_flush_timer = 0
    private manual_info: any
    private time_timer: any;
    private realtime = 0
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this))//,this.FlushUpdateTime.bind(this));
        this.viewNode.flush_timer.SetCallBack(this.FlushFlushTimeTime.bind(this)) //,this.FlushUpdateFlushTimeTime.bind(this));

        this.viewNode.BtnFlush.onClick(this.OnClickFlush.bind(this));

        // 刷底图
        this.viewNode.loader.SetIcon("loader/open_server/ShangDianPeiTu", () => { })
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
    }
    onDestroy() {
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined;
        this.realtime = 0;
    }
    public flushinfo() {
        let param = OpenServerData.Inst().GetNeoShopParam()
        this.cache_timer = param.timer
        this.cache_flush_timer = param.flush_timer

        let info = {
            item_id: param.flush_need_item_id,
            need_num: param.flush_need_num,
        }
        this.manual_info = info
        UH.SetText(this.viewNode.FlushNeed, info.need_num)
        UH.SetIcon(this.viewNode.FlushIcon, info.item_id.toString(), ICON_TYPE.ITEM)

        this.viewNode.shop_list.SetData(param.shop_list)

        let color = param.day_flush_show == 0 ? COLORSTR.Red1 : COLORSTR.Green4
        UH.SetText(this.viewNode.DayFlush,Language.OpenServer.ShopDayFlush +
            TextHelper.ColorStr(param.day_flush_show+"/"+param.day_flush_max,color))
        this.FlushFlushTime()
        this.FlushFlushTimeTime()
    }

    private FlushFlushTimeTime() {
        let time = this.cache_flush_timer - TimeCtrl.Inst().ServerTime;
        let free_flag = time > 0
        this.viewNode.flush_timer.visible = free_flag
        this.viewNode.flush_timer.TotalTime(time, TimeFormatType.TYPE_TIME_0, Language.OpenServer.NeoShopFLushTime);

        this.viewNode.FlushShow.visible = free_flag

        this.viewNode.BtnFlush.title = free_flag ? Language.OpenServer.NeoShopFlush : Language.OpenServer.NeoShopFlushFree
    }

    private FlushUpdateFlushTimeTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr2, this.D2(time_t.hour), this.D2(time_t.minute), this.D2(time_t.second));
        UH.SetText(this.viewNode.flush_timer, t_str + Language.OpenServer.NeoShopFLushTime)
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
        UH.SetText(this.viewNode.Timer, Language.OpenServer.TimeLimit + t_str)

        this.realtime = this.realtime + 1
    }

    private D2(value: number): string {
        return (value < 10) ? "0" + value.toString() : value.toString();
    }

    public OnClickFlush() {
        let time = this.cache_flush_timer - TimeCtrl.Inst().ServerTime;
        if (time > 0) {
            let num = BagData.Inst().getItemNum(this.manual_info.item_id);
            if (this.manual_info.need_num > num) {
                PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoShopFlushError)
                return
            }
        }

        if( time > 0 && OpenServerData.Inst().CheckOpenShopDayFlushTimeDone()){
            PublicPopupCtrl.Inst().Center(Language.OpenServer.ShopDayFlushEnd)
            return 
        }

        OpenServerCtrl.Inst().SendCSMarketShopReq(NEO_SHOP_REQ_TYPE.REFRESH, 0)
    }
}

export class OpenServerNeoShopCell extends fgui.GComponent {
    private viewNode = {
        offset: <fgui.GGroup>null,
        btn_buy: <CommonButtonBuy>null,
        nomal_name: <fgui.GLabel>null,
        short_name: <fgui.GLabel>null,
        off_set: <fgui.GLabel>null,
        ItemCall: <ItemCell>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.btn_buy.onClick(this.OnClickBuy.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        this.viewNode.offset.visible = this.data.is_offprice
        this.viewNode.ItemCall.SetData(this.data.item)
        // this.viewNode.btn_buy.SetData(this.data.buy_param);
        if (this.data.buy_param){
            let buy_param = this.data.buy_param;
            let btn_icon=this.viewNode.btn_buy.GetIcon();
            btn_icon.visible = true;
            this.viewNode.btn_buy.title = buy_param.item_id == 0 ? buy_param.need_num / 10 : buy_param.need_num;
            if (buy_param.item_id > 0) {
                UH.GoldIcon(btn_icon, buy_param.item_id)
                this.viewNode.btn_buy.title =  buy_param.need_num
            }else{
                UH.SpriteName(btn_icon, "CommonButton", "RenMinBiXiaoLv")
                this.viewNode.btn_buy.title =  buy_param.need_num / 10 +"";
            }
        }
        this.viewNode.btn_buy.grayed = !this.data.is_effect
        this.viewNode.nomal_name.visible = this.data.is_long_name
        this.viewNode.short_name.visible = !this.data.is_long_name

        UH.SetText(this.viewNode.nomal_name, this.data.item.Name())
        UH.SetText(this.viewNode.short_name, this.data.item.Name())

        UH.SetText(this.viewNode.off_set, this.data.offprice + Language.OpenServer.NeoShopOffShow)
    }

    private OnClickBuy() {
        // 限购
        if (!this.data.is_effect) {
            PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoShopSellDone)
            return
        }

        ViewManager.Inst().OpenView(OpenServerNeoShopConfirmView, {
            seq: this.data.seq,
            item_id: this.data.item.item_id,
            item_num: this.data.item.num,
            price_type: this.data.price_type,
            price_id: this.data.buy_param.item_id,
            price_num: this.data.buy_param.need_num,
        });

        // if(this.data.price_type == 3){
        //     let order_data = Order_Data.initOrder(
        //         this.data.seq, 
        //         RechargeType.MARKET_SHOP, 
        //         this.data.need_num, 
        //         0, 
        //         this.data.item.Name());
        //     OrderCtrl.generateOrder(order_data);
        // }
        // else {
        //     let num = BagData.Inst().getItemNum(this.data.buy_param.item_id);    
        //     if(num < this.data.buy_param.need_num)
        //     {
        //         PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoShopbuyError)
        //         return 
        //     }

        //     OpenServerCtrl.Inst().SendCSMarketShopReq(NEO_SHOP_REQ_TYPE.BUY_GIFT,this.data.seq)
        // }

    }
}

// export class OpenServerBtnWithPrice extends fgui.GButton {
//     private viewNode = {
//         title: <fgui.GLabel>null,
//         icon: <fgui.GLoader>null,
//         direct: <fgui.GLabel>null,
//     }
//     protected onConstruct() {
//         super.onConstruct();
//         ViewManager.Inst().RegNodeIofo(this.viewNode, this);
//     }
//     public SetData(data: any) {
//         if (data == null) {
//             return;
//         }
//         this.data = data;

//         this.viewNode.direct.visible = data.item_id == 0
//         this.viewNode.icon.visible = data.item_id > 0
//         if (data.item_id > 0) {
//             UH.SetIcon(this.viewNode.icon, data.item_id.toString(), ICON_TYPE.ITEM)
//         }
//         UH.SetText(this.viewNode.title, data.item_id == 0 ? data.need_num / 10 : data.need_num)
//     }
// }


import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Order_Data, OrderCtrl } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { AffordPresentCtrl, AffordPresentData } from "./AffordPresentCtrl";

export class AffordPresentView extends fgui.GComponent {
    private cache_timer = 0
    private time_timer: any;
    private realtime = 0
    private viewNode = {
        bg:<EGLoader> null,
        need_show: <fgui.GLabel>null,
        Day: <fgui.GLabel>null,
        Hour: <fgui.GLabel>null,
        Min: <fgui.GLabel>null,
        btn_tips:<fgui.GButton>null,
        BtnBuy: <CommonButtonBuy>null,
        cell_1:<AffordPresentCell>null,
        cell_2:<AffordPresentCell>null,
        cell_3:<AffordPresentCell>null,
        cell_4:<AffordPresentCell>null,
        cell_5:<AffordPresentBCell>null,
        EffWenZi:<UIEffectShow>null,
    }

    private handleCollector: HandleCollector;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.bg.SetIcon("loader/more_server/ChaoZhiXianLibg",() => {})
        this.addSmartDataCare(AffordPresentData.Inst().flush_info, this.flushinfo.bind(this));
        this.viewNode.BtnBuy.onClick(this.OnClickBuy.bind(this));
        
        this.viewNode.BtnBuy.playEffect(4164100)
        this.viewNode.EffWenZi.PlayEff(4164099);

        this.flushinfo()
    }
    public flushinfo() {
        let param = AffordPresentData.Inst().GetPresentDetail()
        this.cache_timer = param.timer

        this.viewNode.cell_1.SetData(param.dates[0])
        this.viewNode.cell_2.SetData(param.dates[1])
        this.viewNode.cell_3.SetData(param.dates[2])
        this.viewNode.cell_4.SetData(param.dates[3])
        this.viewNode.cell_5.SetData(param.dates[4])

        let btn_icon=this.viewNode.BtnBuy.GetIcon()
        btn_icon.visible = true;
        UH.SetText(this.viewNode.need_show,param.d_price.toString())
        this.viewNode.BtnBuy.title = " "+param.price.toString()
        UH.SpriteName(btn_icon, "MoreServerExtraUn","RenMinBi")
        this.viewNode.BtnBuy.visible = param.can_buy
        
        this.FlushTimer()
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

        let str_day = time_t.day < 10 ? "0" + time_t.day : time_t.day
        UH.SetText(this.viewNode.Day, str_day)

        let str_hour = time_t.hour < 10 ? "0" + time_t.hour : time_t.hour
        UH.SetText(this.viewNode.Hour, str_hour)

        let str_min = time_t.minute < 10 ? "0" + time_t.minute : time_t.minute
        UH.SetText(this.viewNode.Min, str_min)

        this.realtime = this.realtime + 1
    }
    private OnClickBuy() {
        let cfg =  AffordPresentData.Inst().GetBuyCfg()
        let type = cfg.type
        let money = cfg.price
        let order_data = Order_Data.initOrder(type, ACTIVITY_TYPE.ChaoZhiXianLi, money / 10, money, "");
        OrderCtrl.generateOrder(order_data);
    }
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
}

export class AffordPresentCell extends fgui.GComponent {
    private viewNode = {
        num_show : <fgui.GLabel>null,
        ItemCell: <ItemCell>null,
        DayTime: <fgui.GLabel>null,
        GotShow : <fgui.GImage>null,
        BtnGet: <CommonButtonBuy>null,
        BtnWait: <CommonButtonBuy>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
        this.viewNode.BtnWait.onClick(this.OnClickWait.bind(this));

        this.viewNode.BtnGet.playEffect(4164097  )
        this.viewNode.BtnWait.playEffect(4164102 )
        
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data    

        let item_call = Item.Create(data.item_data,{is_click : true})
        this.viewNode.ItemCell.SetData(item_call)
        UH.SetText(this.viewNode.DayTime,data.days)
        this.viewNode.GotShow.visible = data.got_flag
        this.viewNode.BtnGet.visible = !data.got_flag && data.can_get
        this.viewNode.BtnWait.visible = !data.got_flag && !data.can_get 

        UH.SetText(this.viewNode.num_show,Language.AffordPresent.NumShow+data.num_show)
    }
    public OnClickGet()
    {
        AffordPresentCtrl.Inst().SendAffordPresentReq(1,this.data.seq)
    }
    public OnClickWait()
    {
        PublicPopupCtrl.Inst().Center(Language.AffordPresent.BuyWait)
    }
}

export class AffordPresentBCell extends fgui.GComponent {
    private viewNode = {
        num_show : <fgui.GLabel>null,
        ItemCell: <ItemCell>null,
        DayTime: <fgui.GLabel>null,
        GotShow : <fgui.GImage>null,
        BtnGet: <CommonButtonBuy>null,
        BtnWait: <CommonButtonBuy>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
        this.viewNode.BtnWait.onClick(this.OnClickWait.bind(this));

        this.viewNode.BtnGet.playEffect(4164096 )
        this.viewNode.BtnWait.playEffect(4164098)
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data

        let item_call = Item.Create(data.item_data,{is_click : true})
        this.viewNode.ItemCell.SetData(item_call)
        UH.SetText(this.viewNode.DayTime,data.days)
        this.viewNode.GotShow.visible = data.got_flag
        this.viewNode.BtnGet.visible = !data.got_flag && data.can_get
        this.viewNode.BtnWait.visible = !data.got_flag && !data.can_get 

        UH.SetText(this.viewNode.num_show,Language.AffordPresent.NumShow+data.num_show)
    }
    public OnClickGet()
    {
        AffordPresentCtrl.Inst().SendAffordPresentReq(1,this.data.seq)
    }
    public OnClickWait()
    {
        PublicPopupCtrl.Inst().Center(Language.AffordPresent.BuyWait)
    }
}


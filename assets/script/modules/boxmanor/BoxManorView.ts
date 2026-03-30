import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { CommonId } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { ItemAddName } from "modules/moreserveractive/MoreServerActivityView";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { BoxManorData } from "./BoxManorData";

// @BaseView.registView 
export class BoxManorView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "MoreServer",
        ViewName: "BoxManorView",
        LayerType: ViewLayer.Normal,
    };
    private show_list : any
    private cache_timer = 0;
    private handleCollector: HandleCollector;

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        show_list: <fgui.GList>null,
        time: <fgui.GTextField>null,
        timer:<TimeMeter>null,
    };

    protected extendsCfg = [
        { ResName: "BoxManorItem", ExtendsClass: BoxManorItem },
        { ResName: "ItemAddName", ExtendsClass: ItemAddName }
    ];

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.addSmartDataCare(BoxManorData.Inst().ResultData, this.FlushList.bind(this));

        this.viewNode.show_list.itemRenderer = this.renderListItem.bind(this);
        this.FlushList()
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this),this.FlushUpdateTime.bind(this));
    }



    private FlushFlushTime() {
        let time = this.cache_timer-TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }

    private FlushUpdateTime(realtime:number,total_time:number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, time_t.hour);
        UH.SetText(this.viewNode.time,t_str)
    }
    
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
/*
    InitData() {

        this.viewNode.show_list.itemRenderer = this.renderListItem.bind(this);
        // this.viewNode.show_list.setVirtual();
    }

    InitUI() {
        this.FlushList()
    }*/
    public FlushList(){
        this.show_list = BoxManorData.Inst().GetManorList()
        this.viewNode.show_list.numItems = this.show_list.length;

        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.BoxManor)
        this.FlushFlushTime()
    }


    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }



    private renderListItem(index: number, item: BoxManorItem) {
        item.SetData(this.show_list[index]);
    }

}


export class BoxManorItem extends fgui.GComponent {
    private viewNode = {
        Name: <fgui.GTextField> null,
        icon:<fgui.GLoader> null,
        list: <fgui.GList> null,
        xiangou: <fgui.GTextField> null,
        btn_buy: <CommonButtonBuy> null,
        yuanjia: <fgui.GTextField> null,

        bg: <fgui.GObject> null,
        title_bg: <fgui.GObject> null,
        box_bg: <fgui.GObject> null,

        iconAll:<fgui.GGroup>null,
        // icon1:<fgui.GLoader> null,
        icon2:<fgui.GLoader> null,
        EffectShow: <UIEffectShow>null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.btn_buy.onClick(this.OnclickBuy.bind(this));
        this.viewNode.EffectShow.PlayEff(4164062);
    }
    
    public SetData(data: any) {
        this.data = data;
        UH.SetText(this.viewNode.Name,data.gift_name);
        UH.SpriteName(this.viewNode.icon, "MoreServer", "box_"+(data.gift_color - 1));

        this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.list.setVirtual();
        this.viewNode.list.numItems = this.data.reward_item.length;
        let buy_icon = this.viewNode.btn_buy.GetIcon();
        this.viewNode.iconAll.visible = data.price_type != 3
        buy_icon.visible = true;
        if (data.price_type == 3){
            UH.SpriteName(buy_icon,"CommonButton","RenMinBiXiaoLv")
            UH.SetText(this.viewNode.btn_buy,data.buy_money/10)
            UH.SetText(this.viewNode.yuanjia,"¥"+data.original_price/10)
        }else{
            UH.SetText(this.viewNode.btn_buy,data.buy_money);
            UH.SetText(this.viewNode.yuanjia,data.original_price);
            UH.GoldIcon(buy_icon, data.price_type == 1 ? CommonId.Diamond : CommonId.Gold)
            UH.GoldIcon(this.viewNode.icon2, data.price_type == 1 ? CommonId.Diamond : CommonId.Gold);
        }


        let buy_time = BoxManorData.Inst().GetHasBuyTime(data.seq)
        UH.SetText(this.viewNode.xiangou,TextHelper.Format(Language.BoxManor.xiangou[data.limit_type-1],data.buy_times - buy_time))

        this.SetAllGray(buy_time >= data.buy_times)
    }
    private OnclickBuy(){
        let buy_time = BoxManorData.Inst().GetHasBuyTime(this.data.seq);
        // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);

        if (buy_time < this.data.buy_times){
            if (this.data.price_type == 3){
                let seq = this.data.seq;
                let money = this.data.buy_money;
                let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.BoxManor, money / 10, money, "");
                OrderCtrl.generateOrder(order_data);
            }else{
                BoxManorData.Inst().SendBuyGift(this.data.seq)
            }
        }
    }

    private renderListItem(index: number, item: ItemAddName) {
        let buy_time = BoxManorData.Inst().GetHasBuyTime(this.data.seq)
        // LogError("item ",item)
        // item.SetData(this.data.reward_item[index])
        // item.SetData(Item.Create(this.data.reward_item[index],{ is_num: true,is_gray:buy_time >= this.data.buy_times}));
        item.SetData({item : this.data.reward_item[index],is_gray : buy_time >= this.data.buy_times})
    }

    private SetAllGray(is_gray: boolean) {
        this.viewNode.bg.grayed = is_gray
        this.viewNode.title_bg.grayed = is_gray
        this.viewNode.box_bg.grayed = is_gray
        this.viewNode.icon.grayed = is_gray
        // this.viewNode.list.grayed = is_gray
        this.viewNode.btn_buy.grayed = is_gray
        this.viewNode.EffectShow.visible = !is_gray
    }

}


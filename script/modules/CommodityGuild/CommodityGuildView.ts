import { math } from "cc";
import { CfgCommodityGuildData } from "config/CfgCommodityGuild";
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
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { CommodityGuildData } from "./CommodityGuildData";

// @BaseView.registView 
export class CommodityGuildView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "MoreServer",
        ViewName: "CommodityGuildView",
        LayerType: ViewLayer.Normal,
    };
    private cache_timer = 0;
    private shop_list:any
    private Is_opened : boolean
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
        star: <fgui.GGroup> null,
        QuestionMark: <fgui.GGroup> null,
        Discount: <fgui.GGroup> null,
        open:<fgui.GButton>null,
        chou:<fgui.GButton>null,
        ImgDiscount:<fgui.GLoader> null,

        shop:<fgui.GGroup> null,
        showlist: <fgui.GList> null,
        nowzhekou:<fgui.GTextField>null,
        timer:<TimeMeter>null,

        StarZhe:<fgui.GTextField> null,
        LastTime:<fgui.GTextField> null,
        redPointGo:<RedPoint>null,
    };

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.Is_opened = false
        this.data = CommodityGuildData.Inst()
        this.viewNode.showlist.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.showlist.setVirtual();

        this.viewNode.chou.onClick(this.OnClickChou.bind(this));
        this.viewNode.open.onClick(this.OnClickJinRu.bind(this));
        // this.viewNode.showlist.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        this.addSmartDataCare(CommodityGuildData.Inst().CommodityGuildSmartData, this.FlushChouQuView.bind(this));
        this.addSmartDataCare(CommodityGuildData.Inst().CommodityGuildSmartData, this.FlushShopList.bind(this));
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this),this.FlushUpdateTime.bind(this));
    }

    public Init(){
        this.FlushInfo()
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
        UH.SetText(this.viewNode.LastTime,Language.OpenServer.TimeLimit+t_str)
    }

     protected extendsCfg = [
        { ResName: "CommodityGuildItem", ExtendsClass: CommodityGuildItem },

    ];
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
/*
    InitData() {
        // this.viewNode.Board.SetData(new BoardData(MysteryShopView));
        this.Is_opened = false
        this.data = CommodityGuildData.Inst()
        this.viewNode.showlist.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.showlist.setVirtual();

        this.viewNode.chou.onClick(this.OnClickChou.bind(this));
        this.viewNode.open.onClick(this.OnClickJinRu.bind(this));
        // this.viewNode.showlist.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        this.AddSmartDataCare(CommodityGuildData.Inst().CommodityGuildSmartData, this.FlushChouQuView.bind(this));
        this.AddSmartDataCare(CommodityGuildData.Inst().CommodityGuildSmartData, this.FlushShopList.bind(this));

    }

    InitUI() {
        // this.viewNode.BtnAdd.onClick(this.onAdd.bind(this));
        // this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        let is_chou = this.data.GetIsChouqu()
        if (is_chou){
            this.Is_opened = true
            this.IsShowShop(true)
            this.FlushShopList()
        }else
        {
            this.FlushChouQuView()
        }
    }*/

    public FlushInfo(){
        let is_chou = this.data.GetIsChouqu()
        if (is_chou){
            this.Is_opened = true
            this.IsShowShop(true)
            this.FlushShopList()
        }else
        {
            this.FlushChouQuView()
        }
        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.CommodityGuild)
        this.FlushFlushTime()
    }
    
    private FlushShopList() {
        let is_chou = this.data.GetIsChouqu()
        this.shop_list = this.data.GetShopList();
        this.viewNode.showlist.numItems = this.shop_list.length;
        let zhekou = CommodityGuildData.Inst().GetNowZhekou()
        UH.SetText(this.viewNode.nowzhekou,TextHelper.Format(Language.CommodityGuildItem.Zhe, zhekou))
    }

    private FlushChouQuView(){
        if (this.Is_opened) {return }
        this.IsShowShop(false)
        let is_chou = this.data.GetIsChouqu()
        // LogError(CfgCommodityGuildData.discount)
        UH.SetText(this.viewNode.StarZhe,TextHelper.Format(Language.CommodityGuildItem.StarZhe, CfgCommodityGuildData.discount[0].proportion,CfgCommodityGuildData.discount[2].proportion))
        this.viewNode.QuestionMark.visible = !is_chou
        this.viewNode.Discount.visible = is_chou
        if (is_chou) {  //显示折扣
            let zhekou = CommodityGuildData.Inst().GetNowZhekou()
            UH.SpriteName(this.viewNode.ImgDiscount, "MoreServer", zhekou.toString());
        }
        this.viewNode.redPointGo.SetNum(1)

    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {

    }

    CloseCallBack() {
    }

    private renderListItem(index: number, item: CommodityGuildItem) {
        item.SetData(this.shop_list[index]);
    }

    private OnClickChou(){
        // LogError("抽取")
        // this.data.SetIsChouqu(true)
        // this.FlushChouQuView()
        CommodityGuildData.Inst().SendCommodityChouQu()
    }

    private OnClickJinRu(){
        // LogError("抽取")
        this.Is_opened = true
        this.IsShowShop(true)
        this.FlushShopList()
    }

    private OnClickClose(){
        ViewManager.Inst().CloseView(CommodityGuildView);

    }

    private IsShowShop(open:boolean){
        this.viewNode.star.visible = !open
        this.viewNode.shop.visible = open
    }

    
}

export class CommodityGuildItem extends fgui.GComponent {
    private viewNode = {
        name: <fgui.GTextField> null,
        yuanjia:<fgui.GTextField> null,
        limitbuy: <fgui.GTextField> null,
        Icon: <fgui.GLoader> null,
        cost:<fgui.GTextField> null,
        Cell: <ItemCell>null,
        node:<fgui.GGroup> null,
        bg:<fgui.GObject> null,
        btnbuy:<fgui.GButton> null,
        btnbg:<fgui.GObject> null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.btnbuy.onClick(this.onClickBuy.bind(this))

    }
    buy_seq:number;
    is_to_gray:boolean;
    public SetData(data: any) {
        this.buy_seq = data.type;
        this.data = data;
        let zhekou = CommodityGuildData.Inst().GetNowZhekou();
        let has_buy_time = CommodityGuildData.Inst().GetItemBuyTime(data.type);
        // this.viewNode.bg.grayed = has_buy_time == data.limit_convert_count
        UH.SetText(this.viewNode.name, Item.GetName(data.reward_item.item_id));
        UH.GoldIcon(this.viewNode.Icon, data.price_type );
        UH.SetText(this.viewNode.yuanjia,TextHelper.Format(Language.CommodityGuildItem.Yuanjia,data.original_price));
        UH.SetText(this.viewNode.limitbuy,Language.CommodityGuildItem.LimitBuy[data.limit_type - 1] + 
            TextHelper.Format(Language.CommodityGuildItem.JinDu,data.limit_convert_count - has_buy_time,data.limit_convert_count));
        UH.SetText(this.viewNode.cost,data.original_price * zhekou / 10 | 0);
        if (has_buy_time >= data.limit_convert_count){
            this.viewNode.Cell.SetData(Item.Create(data.reward_item,{ is_num: true,is_gray : has_buy_time >= data.limit_convert_count,eff:-1}));
        }else{
            this.viewNode.Cell.SetData(Item.Create(data.reward_item,{ is_num: true,is_gray : has_buy_time >= data.limit_convert_count}));
        }
        // LogError("has_buy_time >= data.limit_convert_count = "+(has_buy_time >= data.limit_convert_count))
        this.is_to_gray = has_buy_time >= data.limit_convert_count
        this.SetAllGray(this.is_to_gray)
        // LogError(has_buy_time >= data.limit_convert_count)
    }

    private SetAllGray(is_gray:boolean){
        this.viewNode.bg.grayed = is_gray
        this.viewNode.name.grayed = is_gray
        this.viewNode.yuanjia.grayed = is_gray
        this.viewNode.limitbuy.grayed = is_gray
        this.viewNode.Icon.grayed = is_gray
        this.viewNode.cost.grayed = is_gray
        // this.viewNode.Cell.grayed = is_gray
        this.viewNode.btnbuy.grayed = is_gray
        this.viewNode.btnbg.grayed = is_gray
    }

    private onClickBuy() {
        // CommodityGuildData.Inst().SendBuy(this.buy_seq);
        // CommodityGuildData.Inst().SendCommodityBuyReward(this.buy_seq);
        let has_buy_time = CommodityGuildData.Inst().GetItemBuyTime(this.data.type);
        if (has_buy_time < this.data.limit_convert_count){
            CommodityGuildData.Inst().sendBuy(this.data)
        }
    }
}
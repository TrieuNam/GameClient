import { LogError } from "core/Debugger";
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
import { TimeMeter, TimeFormatType } from "modules/extends/TimeMeter";
import { MoreServerActivityView } from "modules/moreserveractive/MoreServerActivityView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { ColorStr, TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { WeekLianChongData, ZMLC_RewardState } from "./WeekLianChongCtrl";
// import { WeekHaoLiData } from "./WeekHaoLiCtrl";

export class WeekLianChongView extends fgui.GComponent {
    private cache_timer = 0;
    private gift_data:any
    private special_data:any

    private viewNode = {
        // bg:<EGLoader> null,
        // need_show: <fgui.GLabel>null,
        RewardList:<fgui.GList> null,
        timer:<TimeMeter>null,
        LastTime:<fgui.GTextField> null,
        Cost1:<fgui.GTextField> null,
        Cost2:<fgui.GTextField> null,
        Cost3:<fgui.GTextField> null,
        timeeffect:<UIEffectShow> null,
        HistoryRecharge:<fgui.GTextField> null,

        ContinueItem1:<WeekLianChongItem> null,
        ContinueItem2:<WeekLianChongItem> null,
        ContinueItem3:<WeekLianChongItem> null,
    }

    private handleCollector: HandleCollector;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        
        
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this),this.FlushUpdateTime.bind(this));
        this.viewNode.RewardList.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.RewardList.setVirtual()
        this.InitDailyRecharge()
        this.flushinfo()
        this.viewNode.timeeffect.PlayEff(4164111)
        
        this.addSmartDataCare(WeekLianChongData.Inst().WeekLianChongSmartData, this.flushinfo.bind(this));
    }

    InitDailyRecharge(){
        UH.SetText(this.viewNode.Cost1,TextHelper.Format(Language.WeekLianChong.OneDayNeedRecharge1,WeekLianChongData.Inst().GetDailyCost(0)))
        UH.SetText(this.viewNode.Cost2,TextHelper.Format(Language.WeekLianChong.OneDayNeedRecharge2,WeekLianChongData.Inst().GetDailyCost(1)))
        UH.SetText(this.viewNode.Cost3,TextHelper.Format(Language.WeekLianChong.OneDayNeedRecharge3,WeekLianChongData.Inst().GetDailyCost(2)))
    }

    FlushSpecialRewardList(){
        this.special_data = WeekLianChongData.Inst().GetSpecialRewardData()
        // LogError("this.special_data = ",this.special_data)
        this.viewNode.ContinueItem1.SetData({item:this.special_data[0].reward_list,day : 1,is_sp : true})
        this.viewNode.ContinueItem2.SetData({item:this.special_data[1].reward_list,day : 2,is_sp : true})
        this.viewNode.ContinueItem3.SetData({item:this.special_data[2].reward_list,day : 3,is_sp : true})


    }

    public flushinfo() {
        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.WeekLianChong)
        this.FlushFlushTime()
        this.FlushAll()
    }

    public FlushAll(){
        if (ViewManager.Inst().IsOpen(MoreServerActivityView) && this.viewNode.RewardList){
            this.FlushGiftList()
            this.FlushSpecialRewardList()
            let today_num = WeekLianChongData.Inst().GetTodayRechargeNum()
            UH.SetText(this.viewNode.HistoryRecharge,TextHelper.Format(Language.WeekLianChong.TodatRecharge,today_num))
        }
    }

    public FlushGiftList(){
        this.gift_data = WeekLianChongData.Inst().GetDailyRewardList();
        this.viewNode.RewardList.numItems = this.gift_data.length ;
    }

    private FlushFlushTime() {
        let time = this.cache_timer-TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }
    
    private FlushUpdateTime(realtime:number,total_time:number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.WeekLianChong.TimeStr5, time_t.day, time_t.hour);
        UH.SetText(this.viewNode.LastTime,Language.WeekHaoLi.TimeLimit+t_str)
    }

    private renderListItem(index: number, item: WeekLianChongRender) {
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
export class WeekLianChongRender extends fgui.GComponent {
    private viewNode = {
        open_tip:<fgui.GGroup> null,
        day_desc:<fgui.GTextField> null,
        Cell1:<WeekLianChongItem> null,
        Cell2:<WeekLianChongItem> null,
        Cell3:<WeekLianChongItem> null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data   
        let open_day = WeekLianChongData.Inst().GetFunOpenDay()
        this.viewNode.open_tip.visible = open_day == data[0].day
        UH.SetText(this.viewNode.day_desc,TextHelper.Format(Language.WeekLianChong.DayDesc,Language.DataHelper.DaXie[data[0].day])) 
        this.viewNode.Cell1.SetData({item:data[0].reward_list,day : data [0].day , seq : 0,is_sp : false,need_rechagre : WeekLianChongData.Inst().GetDailyCost(0)})
        this.viewNode.Cell2.SetData({item:data[1].reward_list,day : data [1].day , seq : 1,is_sp : false,need_rechagre : WeekLianChongData.Inst().GetDailyCost(1)})
        this.viewNode.Cell3.SetData({item:data[2].reward_list,day : data [2].day , seq : 2,is_sp : false,need_rechagre : WeekLianChongData.Inst().GetDailyCost(2)})

    }
}

export class WeekLianChongItem extends fgui.GComponent {
    private viewNode = {
        BtnGet:<fgui.GButton> null,
        buling:<fgui.GGroup> null,
        yilingqu:<fgui.GGroup> null,
        Effect:<UIEffectShow> null,
        Cell:<ItemCell> null,
        // beiguang:<fgui.GImage> null,
        recharge_num:<fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data   
        let state = ZMLC_RewardState.UnGet
        if (!data.is_sp){
            state = WeekLianChongData.Inst().GetRewardState(data.day - 1,data.seq)
        }else{
            state = WeekLianChongData.Inst().GetSpecialState(data.day - 1)
        }
        let open_day = WeekLianChongData.Inst().GetFunOpenDay()
        // LogError("open_day = "+open_day)
        this.viewNode.Cell.SetData(Item.Create(data.item[0],{ is_click: state != ZMLC_RewardState.CanGet ,is_num: true}));
        // this.viewNode.beiguang.visible = state == ZMLC_RewardState.HasGet
        this.viewNode.yilingqu.visible = state == ZMLC_RewardState.HasGet
        this.viewNode.buling.visible = open_day > data.day && state != ZMLC_RewardState.HasGet && !data.is_sp
        if (!data.is_sp && open_day > data.day && state == ZMLC_RewardState.CanGet && WeekLianChongData.Inst().WeekLianChongInfo.chongZhiNum[data.day - 1] >= data.need_rechagre){
            this.viewNode.buling.visible = false
        }
        UH.SetText(this.viewNode.recharge_num,TextHelper.Format(Language.WeekLianChong.NeedRecharge,data.need_rechagre))
        this.viewNode.BtnGet.visible = state == ZMLC_RewardState.CanGet
        if (state == ZMLC_RewardState.CanGet) {
            this.viewNode.Effect.StopEff(4164110)
            this.viewNode.Effect.PlayEff(4164110)
        }else{
            this.viewNode.Effect.StopEff(4164110)
        }
    }

    OnClickGet(){
        if (this.data.is_sp){
            WeekLianChongData.Inst().SendWeekLianChongSpecialBuy(this.data.day - 1)
        }else{
            WeekLianChongData.Inst().SendWeekLianChongBuy(this.data.day - 1,this.data.seq)
        }
    }
}
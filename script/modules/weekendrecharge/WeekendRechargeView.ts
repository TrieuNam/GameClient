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
import { COLORS } from "modules/common/ColorEnum";
import { AdType } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { ItemCell } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { buyLevelView } from "modules/warOrder/WarOrderView";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { WeekendRechargedData } from "./WeekendRechargeData";

// @BaseView.registView
export class WeekendRechargeView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "MoreServer",
        ViewName: "WeekendRecharge",
        LayerType: ViewLayer.Normal,
    };
    private list_data:any
    private cache_timer = 0;
    private handleCollector: HandleCollector;
    private timer_handle_daily_add: any = null;


    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        Timer.Inst().CancelTimer(this.timer_handle_daily_add)

    }
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        showlist: <fgui.GList>null,
        HasRechargeNum:<fgui.GTextField>null,
        MoreRecharge:<fgui.GTextField>null,
        time:<fgui.GTextField>null,
        tip:<fgui.GGroup> null,
        timer:<TimeMeter>null,
        BtnAdv:<fgui.GButton> null,
    };

    protected extendsCfg = [
        { ResName: "WeekendRechargeItem", ExtendsClass: WeekendRechargeItem }
    ];

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.data = WeekendRechargedData.Inst()
        this.viewNode.showlist.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.showlist.setVirtual();
        this.FlushList()
        this.addSmartDataCare(WeekendRechargedData.Inst().WeekendRechargedSmartData, this.FlushList.bind(this));
        this.addSmartDataCare(RoleData.Inst().AdFlush, this.FlushWeekendRechargeAdvShow.bind(this));
        this.addSmartDataCare(RoleData.Inst().ResultData, this.FlushWeekendRechargeAdvShow.bind(this), "roleLevel");
        this.viewNode.BtnAdv.onClick(this.OnClickAdv.bind(this))
        this.FlushWeekendRechargeAdvShow()
        // let end_time = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.WeekendRecharge)
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
        UH.SetText(this.viewNode.time,Language.OpenServer.TimeLimit+t_str)
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    private OnClickAdv() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.weekend_rechagre)
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.weekend_rechagre, null);//TextHelper.Format(Language.adv.weekend_rechagre, co.param)

        // let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.weekend_rechagre)
        // this.viewNode.BtnDailyAd.visible = RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount));

    }

    private FlushWeekendRechargeAdvShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.weekend_rechagre)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.weekend_rechagre)
        this.viewNode.BtnAdv.visible = RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount));

        Timer.Inst().CancelTimer(this.timer_handle_daily_add)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_daily_add = Timer.Inst().AddCountDownCT(() => { }, this.FlushWeekendRechargeAdvShow.bind(this), info.nextFetchTime, 1)
        }
    }

    /*InitData() {
        this.data = WeekendRechargedData.Inst()
        this.viewNode.showlist.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.showlist.setVirtual();
    }

    InitUI() {
        this.FlushList()
    }*/

    public FlushList(){
        this.list_data = this.data.GetWeekendRechargeList()
        this.viewNode.showlist.numItems = this.list_data.length;

        let now = this.data.GetHasRechargeNum()
        let next = this.data.GetNextNeedRecharge()
        UH.SetText(this.viewNode.HasRechargeNum,now/10)
        UH.SetText(this.viewNode.MoreRecharge,next/10)

        this.viewNode.tip.visible = next != 0

        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.WeekendRecharge)
        this.FlushFlushTime()
    }

    private renderListItem(index: number, item: WeekendRechargeItem) {
        item.SetData(this.list_data[index]);
    }
}

export class WeekendRechargeItem extends fgui.GComponent {
    private viewNode = {
        lbl_need: <fgui.GTextField> null,
        itemlist:<fgui.GList> null,
        btn_get:<fgui.GButton> null,
        btn_recharge:<fgui.GButton> null,
        yilingqu:<fgui.GGroup> null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.btn_recharge.onClick(this.OnClickRecharge.bind(this))
        this.viewNode.btn_get.onClick(this.OnClickGet.bind(this))

    }
    public SetData(data: any) {

        this.data = data
        this.viewNode.itemlist.itemRenderer = this.WeekendrenderListItem.bind(this);
        this.viewNode.itemlist.setVirtual();
        this.viewNode.itemlist.numItems = data.reward_item.length;
        let is_get = WeekendRechargedData.Inst().GetIsGetBySeq(data.seq)
        // if (is_get) { UH.SetText(this.viewNode.lbl_need,TextHelper.Format(Language.CaveLoot.RechargeNum1,data.diamond/10))}
        // else {UH.SetText(this.viewNode.lbl_need,TextHelper.Format(Language.CaveLoot.RechargeNum,data.diamond/10))}
        UH.SetText(this.viewNode.lbl_need,data.diamond/10)
        this.viewNode.lbl_need.color = is_get ? COLORS.Yellow5 : COLORS.Green3
        let now_recharge = WeekendRechargedData.Inst().GetHasRechargeNum()
        
        this.viewNode.btn_recharge.visible = now_recharge < data.diamond
        this.viewNode.btn_get.visible = now_recharge >= data.diamond && !is_get
        this.viewNode.yilingqu.visible = is_get

    }

    private WeekendrenderListItem(index: number, item: ItemCell) {
        // item.SetData(this.data[index]);

        let is_get = WeekendRechargedData.Inst().GetIsGetBySeq(this.data.seq)
        let now_recharge = WeekendRechargedData.Inst().GetHasRechargeNum()
            let eff = (now_recharge >= this.data.diamond && !is_get) ? 4164011 : null
        item.SetData(Item.Create(this.data.reward_item[index],{ is_num: true,eff : eff }));
    }

    private OnClickRecharge(){
        // LogError(this.data.diamond)
        ViewManager.Inst().OpenViewByKey(6002);

    }

    private OnClickGet(){
        // LogError(this.data.seq)
        WeekendRechargedData.Inst().SendGetWeekendReward(this.data.seq)
    }

}


// export class weekenditemrender extends fgui.GComponent {
//     private viewNode = {
//         cell: <ItemCell> null,
//         effect:<UIEffectShow> null,
//     };
//     protected onConstruct() {
//         ViewManager.Inst().RegNodeIofo(this.viewNode, this);

//     }
//     public SetData(data: any) {
//         this.data = data

//         let is_get = WeekendRechargedData.Inst().GetIsGetBySeq(this.data.seq)
//         let now_recharge = WeekendRechargedData.Inst().GetHasRechargeNum()
//         this.viewNode.cell.SetData(Item.Create(this.data.reward_item[index],{ is_num: true}));
//         if (now_recharge >= this.data.diamond && !is_get) {
//             this.viewNode.effect.PlayEff(4164011)
//         }else{
//             this.viewNode.effect.StopEff(4164011)
//         }

//     }
// }
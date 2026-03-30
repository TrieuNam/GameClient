import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item, ItemData } from "modules/bag/ItemData";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { AdType, ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { ItemCell } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { CaveLootData } from "./CaveLootData";
import { BagData } from "modules/bag/BagData";
import { SMDHandle } from "data/HandleCollectorCfg";
import { CaveLootActivityView } from "./CaveLootActivityView";
import { CaveLootCapView } from "./CaveLootCapView";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TimeHelper } from "../../helpers/TimeHelper";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityData } from "modules/activity/ActivityData";
import { RedPoint } from "modules/extends/RedPoint";
import { Timer } from "modules/time/Timer";
import { HandleCollector } from "core/HandleCollector";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { MoreServerActivityView } from "modules/moreserveractive/MoreServerActivityView";


// @BaseView.registView 
export class CaveLootMainView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "BoxManor",
        ViewName: "CaveLootMain",
        LayerType: ViewLayer.Normal,
    };
    private show_list:any;
    private chou_show_list:any;

    private is_jump:number;
    private cache_timer = 0;
    private handle : any ;
    private is_load = false;
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
        BtnHuoDong: <fgui.GButton>null,
        time:<fgui.GTextField> null,
        topshow:<fgui.GList> null,
        // RewardShow:<fgui.GList> null,
        redPoint:<RedPoint> null ,
        BtnOne: <fgui.GButton>null,
        BtnTen: <fgui.GButton>null,
        // OneIcon:<fgui.GLoader> null,
        // TenIcon:<fgui.GLoader> null,
        OneLbl:<fgui.GTextField> null,
        TenLbl:<fgui.GTextField> null,
        lbl_zhekou:<fgui.GTextField> null,
        baodi_time:<fgui.GRichTextField> null,

        BtnJump:<fgui.GButton> null,
        btn_gailu:<fgui.GButton> null,
        baodi_show:<fgui.GGroup>null,

        GetEffect:<UIEffectShow> null,
        TenEffect:<UIEffectShow> null,
        OneEffect:<UIEffectShow> null,
        timer:<TimeMeter>null,
        BtnAdv:<fgui.GButton> null,

    }; 

    /* protected extendsCfg = [
        { ResName: "组件名", ExtendsClass: 拓展类 }
    ]; */
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.data = CaveLootData.Inst()
        this.viewNode.topshow.itemRenderer = this.CaverenderListItem.bind(this);
        this.viewNode.topshow.setVirtual();

        // this.viewNode.RewardShow.itemRenderer = this.renderMainListItem.bind(this);
        // this.viewNode.RewardShow.setVirtual();

        this.viewNode.BtnHuoDong.onClick(this.OnClickHuoDong.bind(this));
        this.viewNode.BtnOne.onClick(this.OnClickChou.bind(this,1));
        this.viewNode.BtnTen.onClick(this.OnClickChou.bind(this,10));
        this.viewNode.BtnJump.onClick(this.OnClickJump.bind(this));
        this.viewNode.btn_gailu.onClick(this.OnClickShowPro.bind(this));

        this.addSmartDataCare(BagData.Inst().BagItemData, this.FlushItemNum.bind(this), "OtherChange");
        // this.addSmartDataCare(CaveLootData.Inst().ResultData, this.FlushMainReward.bind(this), "flush");
        this.addSmartDataCare(CaveLootData.Inst().ResultData, this.FlushList.bind(this));
        this.addSmartDataCare(RoleData.Inst().AdFlush, this.FlushCaveAdvShow.bind(this));
        this.addSmartDataCare(RoleData.Inst().ResultData, this.FlushCaveAdvShow.bind(this), "roleLevel");
        this.viewNode.BtnAdv.onClick(this.OnClickAdv.bind(this))

        let info = this.data.GetCaveLootOtherConfig()
        UH.SetText(this.viewNode.lbl_zhekou,TextHelper.Format(Language.CaveLoot.Zhe,info.discount_show))
        this.viewNode.GetEffect.PlayEff(4164018)

        // let use_item_id = this.data.GetCaveLootOtherConfig().item_id
        // LogError("info.item_id = "+ info.item_id)
        let icon_id = Item.GetIconId(info.item_id)
        // UH.SetIcon(this.viewNode.OneIcon,icon_id.toString(),ICON_TYPE.ITEM)
        // UH.SetIcon(this.viewNode.TenIcon,icon_id.toString(),ICON_TYPE.ITEM)

        this.viewNode.baodi_show.visible = info.can_cumulative_bao_di == 1

        this.FlushList()
        this.FlushItemNum()
        this.FlushCaveAdvShow()
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this),this.FlushUpdateTime.bind(this));
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    private FlushFlushTime() {
        let time = this.cache_timer-TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }

    private FlushUpdateTime(realtime:number,total_time:number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);
        let hour = time_t.hour ? time_t.hour : 1;   
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, hour);
        UH.SetText(this.viewNode.time,Language.OpenServer.TimeLimit+t_str)
    }
/*
    InitData() {
        this.data = CaveLootData.Inst()
        this.viewNode.topshow.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.topshow.setVirtual();

        this.viewNode.BtnHuoDong.onClick(this.OnClickHuoDong.bind(this));
        this.viewNode.BtnOne.onClick(this.OnClickChou.bind(this,1));
        this.viewNode.BtnTen.onClick(this.OnClickChou.bind(this,10));
        this.viewNode.BtnJump.onClick(this.OnClickJump.bind(this));
        this.viewNode.btn_gailu.onClick(this.OnClickShowPro.bind(this));

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemNum.bind(this), "OtherChange");

    }
    
    InitUI() {
        let info = this.data.GetCaveLootOtherConfig()
        UH.SetText(this.viewNode.lbl_zhekou,TextHelper.Format(Language.CaveLoot.Zhe,info.discount_show))
        this.viewNode.GetEffect.PlayEff(4164018)

        // let use_item_id = this.data.GetCaveLootOtherConfig().item_id
        UH.SetIcon(this.viewNode.OneIcon,info.item_id.toString(),ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.TenIcon,info.item_id.toString(),ICON_TYPE.ITEM)

        this.viewNode.baodi_show.visible = info.can_cumulative_bao_di == 1

        this.FlushList()
        this.FlushItemNum()
    }*/

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {

    }

    public FlushList(){

        this.show_list = this.data.GetMainSpecialItemShow()
        this.viewNode.topshow.numItems = this.show_list.length;

        let need_times = this.data.GetBaoDiTimes()
        UH.SetText(this.viewNode.baodi_time,TextHelper.Format(Language.CaveLoot.BaoDiDesc,need_times))

        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.CaveLoot)
        this.FlushFlushTime()

        let red = CaveLootData.Inst().GetAllRed()
        this.viewNode.redPoint.SetNum(red)
    }

    //抽奖物品数量
    public FlushItemNum(){
        let info = this.data.GetCaveLootOtherConfig()
        let item_num = BagData.Inst().getItemNum(info.item_id)
        UH.SetText(this.viewNode.OneLbl,TextHelper.Format(Language.CaveLoot.UseNum,item_num,info.first_consume_item_num))
        UH.SetText(this.viewNode.TenLbl,TextHelper.Format(Language.CaveLoot.UseNum,item_num,info.ten_consume_item_num))
    }

    public StopEffectShow(){
        if (ViewManager.Inst().IsOpen(MoreServerActivityView) && this.viewNode.OneEffect){
            this.viewNode.OneEffect.StopEff(4164022)
        }
    }

    public CloseView(){
        Timer.Inst().CancelTimer(this.handle)
        this.handle = null
    }

    private FlushMainReward(){
        this.chou_show_list = CaveLootData.Inst().GetMarkItemNotice()
        this.viewNode.topshow.numItems = this.chou_show_list.length;
    }

    private OnClickHuoDong(){
        //打开活动界面
        let param = {
            sel : 0,
        }
        ViewManager.Inst().OpenView(CaveLootActivityView,param);
    }

    private CaverenderListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.show_list[index].reward_id,{ is_num: true}));
    }

    private renderMainListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.chou_show_list[index].reward_id));
    }
    private OnClickChou(index:number){
        let info = this.data.GetCaveLootOtherConfig()
        let item_num = BagData.Inst().getItemNum(info.item_id)
        if (!this.viewNode.BtnJump.selected) {
            if (item_num >= (index == 1 ? info.first_consume_item_num : info.ten_consume_item_num)){
                if (this.is_load){
                    this.viewNode.OneEffect.PlayEff(4164022)
                    this.handle = Timer.Inst().AddRunTimer(function(){
                        CaveLootData.Inst().SendChouJiang(index);
                    },2,1,false)
                }
            }else{
                PublicPopupCtrl.Inst().Center(Language.OpenServer.ItemNotEnough);  
                let param = {
                    sel : 2,
                }
                ViewManager.Inst().OpenView(CaveLootActivityView,param)
                return 
                // CaveLootData.Inst().SendChouJiang(index);
            }
        }else{

            CaveLootData.Inst().SendChouJiang(index);
        }
        if (item_num >= (index == 1 ? info.first_consume_item_num : info.ten_consume_item_num)){
            if (!this.viewNode.BtnJump.selected) {
                if (!this.is_load){
                    this.viewNode.OneEffect.PlayEff(4164022,function(){
                        CaveLootData.Inst().SendChouJiang(index);
                    })
                    this.is_load = true;
                }
            }
        }else{
            PublicPopupCtrl.Inst().Center(Language.OpenServer.ItemNotEnough);  
            let param = {
                sel : 2,
            }
            ViewManager.Inst().OpenView(CaveLootActivityView,param)
            return 
        }
        // LogError("index = "+index)
    }
    

    private OnClickJump(){
        //是否开启动画
        // this.viewNode.BtnJump.selected = true //!this.viewNode.BtnJump.selected
        // LogError(this.viewNode.BtnJump.selected)
        this.is_jump = this.viewNode.BtnJump.selected ? 1 : 0
    }

    private OnClickShowPro(){
        //打开概率界面
        ViewManager.Inst().OpenView(CaveLootCapView);
    }

    private OnClickAdv() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.canvas_ling)
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.canvas_ling, TextHelper.Format(Language.adv.canvas_ling, co.ad_award[0].num));
    }

    private FlushCaveAdvShow() {
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.canvas_ling)
        let info = RoleData.Inst().GetAdvertisementInfoBySeq(AdType.canvas_ling)
        this.viewNode.BtnAdv.visible = RoleData.Inst().GetRoleLevel() >= +co.level && (!info || (TimeCtrl.Inst().ServerTime >= info.nextFetchTime && co.ad_param > info.todayCount));

        Timer.Inst().CancelTimer(this.timer_handle_daily_add)
        if (info && info.nextFetchTime > TimeCtrl.Inst().ServerTime) {
            this.timer_handle_daily_add = Timer.Inst().AddCountDownCT(() => { }, this.FlushCaveAdvShow.bind(this), info.nextFetchTime, 1)
        }
    }

}
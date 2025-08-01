import { CfgCaveLootData } from "config/CfgCaveLoot";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { CommonId } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { RechargeData } from "modules/recharge/RechargeData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { CaveLootData } from "./CaveLootData";


@BaseView.registView
export class CaveLootActivityView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "CaveLootActiveView",
        ViewName: "CaveLootActiveView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock
    };
    private task_data : any;
    private rechagre_data : any;
    private shop_data : any;
    private cache_timer = 0;
    private viewController:fgui.Controller;
    private select : number;

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        // Name: <fgui.GTextField>null,
        Board:<CommonBoard2> null,
        tasklist:<fgui.GList> null,
        RechargeList:<fgui.GList> null,
        ShopList:<fgui.GList> null,
        timer:<TimeMeter>null,
        time:<fgui.GTextField> null,
        redPoint1:<RedPoint> null,
        redPoint2:<RedPoint> null,
        num:<fgui.GTextField> null,
    };

    protected extendsCfg = [
        { ResName: "CaveLootTaskItem", ExtendsClass: CaveLootTaskItem },
        { ResName: "CaveLootRechargeItem", ExtendsClass: CaveLootRechargeItem },
        { ResName: "CaveLootShopItem", ExtendsClass: CaveLootShopItem },

    ]; 

    InitData(param:{sel:number}) {
        this.data = CaveLootData.Inst()
        this.viewNode.Board.SetData(new BoardData(CaveLootActivityView));
        this.viewNode.tasklist.itemRenderer = this.renderTaskListItem.bind(this);
        this.viewNode.tasklist.setVirtual();
        this.viewController = this.view.getController("Page")

        this.viewNode.RechargeList.itemRenderer = this.renderRechargeListItem.bind(this);
        this.viewNode.RechargeList.setVirtual();
        this.select = param.sel
        this.viewNode.ShopList.itemRenderer = this.renderShopListItem.bind(this);
        this.viewNode.ShopList.setVirtual();

        this.AddSmartDataCare(CaveLootData.Inst().ResultData, this.FlushAllInfo.bind(this));

    }

    InitUI() {
        this.viewController.selectedIndex = this.select
        this.FlushAllInfo()
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
        let hour = time_t.hour ? time_t.hour : 1;   
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, hour);
        UH.SetText(this.viewNode.time,Language.OpenServer.TimeLimit+t_str)
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }

    private FlushAllInfo(){
        this.FlushTaskView()
        this.FlushRechargeView()
        this.FlushShopView()

        this.cache_timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.CaveLoot)
        this.FlushFlushTime()
        this.FlushRed()
    }

    private FlushRed(){
        let red1 = CaveLootData.Inst().GetTaskRed()
        this.viewNode.redPoint1.SetNum(red1)
        let red2 = CaveLootData.Inst().GetRechagreRed()
        this.viewNode.redPoint2.SetNum(red2)
    }

    private FlushTaskView(){
        this.task_data = this.data.GetTaskList()
        this.viewNode.tasklist.numItems = this.task_data.length;
    }

    private renderTaskListItem(index: number, item: CaveLootTaskItem) {
        item.SetData(this.task_data[index]);
    }

    private FlushRechargeView(){
        // let data = RechargeData.Inst().GetChargeInfoList()
        this.rechagre_data = this.data.GetRechargeList()
        this.viewNode.RechargeList.numItems = this.rechagre_data.length;

        let num = CaveLootData.Inst().GetRechargeNum()
        UH.SetText(this.viewNode.num,num / 10)
    }

    private renderRechargeListItem(index: number, item: CaveLootRechargeItem) {
        // if (this.rechagre_data[index]){
            item.SetData(this.rechagre_data[index]);
        // }
    }

    private FlushShopView(){
        // let data = RechargeData.Inst().GetChargeInfoList()
        this.shop_data = this.data.GetShopList()
        this.viewNode.ShopList.numItems = this.shop_data.length;
    }

    private renderShopListItem(index: number, item: CaveLootShopItem) {
        item.SetData(this.shop_data[index]);
    }
}


export class CaveLootTaskItem extends fgui.GComponent {
    private viewNode = {
        Desc: <fgui.GTextField> null,
        TaskPro:<fgui.GProgressBar> null,
        RewardList: <fgui.GList> null,
        BtnLingQu: <fgui.GButton>null,
        YiLingQu:<fgui.GObject> null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnLingQu.onClick(this.OnClickGet.bind(this))
    }

    public SetData(data: any) {
        this.data = data;
        UH.SetText(this.viewNode.Desc, data.describe);
        this.viewNode.TaskPro.max = data.parameter;
        let jindu = CaveLootData.Inst().GetTaskJindu(data.task_type);
        this.viewNode.TaskPro.value = jindu <= data.parameter ? jindu : data.parameter;

        let is_get = CaveLootData.Inst().GetTaskIsGet(data.task_id,data.task_type);
        this.viewNode.BtnLingQu.grayed = jindu < data.parameter
        this.viewNode.BtnLingQu.visible = !is_get
        this.viewNode.YiLingQu.visible = is_get

        this.viewNode.RewardList.itemRenderer = this.TaskrenderListItem.bind(this);
        this.viewNode.RewardList.setVirtual();
        this.viewNode.RewardList.numItems = data.reward_item.length;

    }

    private TaskrenderListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.data.reward_item[index],{ is_num: true}));
    }
    private OnClickGet(){
        // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
        CaveLootData.Inst().SendTaskGift(this.data.task_type)
    }
}

export class CaveLootRechargeItem extends fgui.GComponent {
    private viewNode = {
        Desc: <fgui.GTextField> null,
        RewardList: <fgui.GList> null,
        BtnGet: <CommonButtonBuy>null,
        YiLingQu:<fgui.GObject> null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this))

    }
    public SetData(data: any) {
        this.data = data;
        UH.SetText(this.viewNode.Desc,TextHelper.Format(Language.CaveLoot.RechargeDesc,data.diamond/10));

        let recharge_num = CaveLootData.Inst().GetRechargeNum();
        let is_get = CaveLootData.Inst().GetRechargeIsGet(data.seq);

        this.viewNode.BtnGet.grayed = recharge_num < data.diamond
        this.viewNode.BtnGet.visible = !is_get
        this.viewNode.YiLingQu.visible = is_get

        this.viewNode.RewardList.itemRenderer = this.RechargerenderListItem.bind(this);
        this.viewNode.RewardList.setVirtual();
        this.viewNode.RewardList.numItems = data.reward_item.length;

    }

    private RechargerenderListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.data.reward_item[index],{ is_num: true}));
    }

    private OnClickGet(){
        // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
        CaveLootData.Inst().SendRechargeReward(this.data.seq)
    }
}

export class CaveLootShopItem extends fgui.GComponent {
    private viewNode = {
        Name: <fgui.GTextField> null,
        Cell: <ItemCell> null,
        lblxiangou: <fgui.GTextField>null,
        LblBuyMoney:<fgui.GTextField> null,
        icon:<fgui.GLoader>null,
        zhekou:<fgui.GGroup>null,
        LblZhekou:<fgui.GTextField>null,
        zhekoubg:<fgui.GObject>null,
        bg:<fgui.GObject>null,
        BtnBuy:<fgui.GButton> null,
        btnbg:<fgui.GObject> null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnBuy.onClick(this.onClickBuy.bind(this))
        
    }
    public SetData(data: any) {
        this.data = data
        UH.SetText(this.viewNode.Name, Item.GetName(data.reward_item.item_id));
        this.viewNode.icon.visible = data.price_type != 3 && data.price_type != 0
        UH.GoldIcon(this.viewNode.icon, data.price_type == 1 ? CommonId.Diamond : CommonId.Gold);
        
        this.viewNode.zhekou.visible = data.discount != 10
        UH.SetText(this.viewNode.LblZhekou,TextHelper.Format(Language.CaveLoot.Zhe,data.discount))
        
        let money_desc
        if (data.price_type == 1 || data.price_type == 2){money_desc = data.price }
        if (data.price_type == 3 ){money_desc = Language.Recharge.GoldType[0] + data.price  / 10}
        if (data.price_type == 0 ){money_desc = Language.CaveLoot.Free}
        UH.SetText(this.viewNode.LblBuyMoney,money_desc)
        
        let has_buy_time = CaveLootData.Inst().GetShopItemBuyTime(data.seq)
        this.viewNode.lblxiangou.visible = data.limit_type != 1
        if (data.limit_type != 1){
            UH.SetText(this.viewNode.lblxiangou,Language.CaveLoot.XianGou[data.limit_type-2]+TextHelper.Format(Language.CaveLoot.UseNum,data.limit_convert_count - has_buy_time,data.limit_convert_count))
        }
        this.viewNode.Cell.SetData(Item.Create(data.reward_item,{ is_num: true,is_gray:data.limit_type != 1 && has_buy_time >= data.limit_convert_count}));
        
        this.SetAllGray(data.limit_type != 1 && has_buy_time >= data.limit_convert_count)
    }

    private SetAllGray(is_gray:boolean){
        this.viewNode.bg.grayed = is_gray
        this.viewNode.LblBuyMoney.grayed = is_gray
        this.viewNode.LblZhekou.grayed = is_gray
        this.viewNode.zhekoubg.grayed = is_gray
        this.viewNode.icon.grayed = is_gray
        this.viewNode.Cell.grayed = is_gray
        this.viewNode.lblxiangou.grayed = is_gray
        this.viewNode.btnbg.grayed = is_gray

    }

    private onClickBuy() {
        // CommodityGuildData.Inst().SendBuy(this.buy_seq);
        if (this.data.price_type == 3){ //直购
            let seq = this.data.seq
            // let money_data = LevelFundData.Inst().GetPauseMoney(seq)
            let money = this.data.price
            let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.CaveLoot, money / 10, money, "");
            OrderCtrl.generateOrder(order_data);
        }else{
            CaveLootData.Inst().sendBuy(this.data)
        }
        // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);

    }

}
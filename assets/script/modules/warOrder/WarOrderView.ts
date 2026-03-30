import { CfgLevelFundData } from "config/CfgLevelFund";
import { CfgItem } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { CommonId } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { BoxFundRewardView } from "modules/boxfund/BoxFundRewardView";
import { TextHelper } from "../../helpers/TextHelper";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { RoleData } from "modules/role/RoleData";
import { RedPoint } from "modules/extends/RedPoint";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { ServerActivityData } from "modules/serveractivity/ServerActivityData";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { WarOrderData } from "./WarOrderData";
import { CfgWarOrderData } from "config/CfgWarOrder";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TimeHelper } from "../../helpers/TimeHelper";
import { ActivityData } from "modules/activity/ActivityData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from "modules/common_board/BoardData";
import { Color, color } from "cc";
import { COLORS } from "modules/common/ColorEnum";
import { Timer } from "modules/time/Timer";
import { ProgressTitleType } from "fairygui-cc";
import { InscriptionTowerView } from "modules/inscription/InscriptionTowerView";
import { DataHelper } from "../../helpers/DataHelper";
import { MainView } from "modules/main/MainView";
import { ServerActivityView } from "modules/serveractivity/ServerActivityView";
import { ShenQiView } from "modules/shenqi/ShenQiView";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";

// @BaseView.registView 
export class WarOrderView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "Serveractivity",
        ViewName: "WarOrderView",
        LayerType: ViewLayer.Normal,
    };
    // PB_SCRaWarOrderInfo  3033
    private list_data: any;
    private select_index = 0;
    private pause_data: any;
    private select_pause: number;
    private handleCollector: HandleCollector;
    private cache_timer = 0;
    private cache_timer2 = 0;
    private task_data: any;
    private timeType: any;
    private timeStr: any;
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
        //剩余时间
        time: <fgui.GTextField>null,
        timer: <TimeMeter>null,
        //当前战令等级
        lb_level: <fgui.GTextField>null,
        //经验进度条
        orderBar: <fgui.GProgressBar>null,
        //购买等级
        btn_gmdj: <fgui.GButton>null,
        //奖励预览
        btn_jlyl: <fgui.GButton>null,
        //点选按钮组
        radiogp: <fgui.GGroup>null,
        typeRadio1: <fgui.GButton>null,
        typeRadio2: <fgui.GButton>null,
        typeRadio3: <fgui.GButton>null,
        //等级奖励组
        levelRewardGP: <fgui.GGroup>null,
        levelList: <fgui.GList>null,
        //一键领取
        BtnGet: <fgui.GButton>null,
        //解锁进阶
        BtnInvite: <fgui.GButton>null,

        //任务组
        taskGP: <fgui.GGroup>null,
        time2: <fgui.GTextField>null,
        timer2: <TimeMeter>null,
        //任务列表
        taskList: <fgui.GList>null,

        gp_ymj: <fgui.GGroup>null,
    };

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.levelList.setVirtual();
        this.viewNode.taskList.setVirtual();
        this.viewNode.levelList.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.taskList.itemRenderer = this.renderListItem2.bind(this);
        // this.viewNode.BtnRight.onClick(this.OnClickChange.bind(this,1));
        // this.viewNode.BtnLeft.onClick(this.OnClickChange.bind(this,-1));
        this.addSmartDataCare(WarOrderData.Inst().WarOrderSmartData, this.FlushList.bind(this));
        // this.AddSmartDataCare(LevelFundData.Inst().LevelFundSmartData, this.FlushList.bind(this), "OtherChange");
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this), this.FlushUpdateTime.bind(this));
        this.viewNode.timer2.SetCallBack(this.FlushFlushTime2.bind(this), this.FlushUpdateTime2.bind(this));
        this.viewNode.typeRadio1.on(fgui.Event.STATUS_CHANGED, this.onChangeClick, this);
        this.viewNode.typeRadio2.on(fgui.Event.STATUS_CHANGED, this.onChangeClick, this);
        this.viewNode.typeRadio3.on(fgui.Event.STATUS_CHANGED, this.onChangeClick, this);
        this.viewNode.btn_jlyl.onClick(this.OnClickOpenRewardView.bind(this));
        this.viewNode.btn_gmdj.onClick(this.OnClickOpenBuyLevelView.bind(this));
        this.viewNode.BtnInvite.onClick(this.OnClickPay.bind(this));
        this.viewNode.BtnGet.onClick(this.OnClickOneKey.bind(this));

        this.FlushList();

    }
    protected extendsCfg = [
        { ResName: "levelRewardItem", ExtendsClass: levelRewardItem },
        { ResName: "taskItem", ExtendsClass: taskItem },
        { ResName: "rewardItem", ExtendsClass: rewardItem },
    ];
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
    private FlushFlushTime() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }

    private FlushUpdateTime(realtime: number, total_time: number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, time_t.hour);
        UH.SetText(this.viewNode.time, t_str)
    }
    private FlushFlushTime2() {
        let time2 = this.cache_timer2 - TimeCtrl.Inst().ServerTime;
        this.viewNode.timer2.visible = time2 > 0;
        this.viewNode.timer2.TotalTime(time2, this.timeType);
    }
    protected onEnable(): void {
        this.viewNode.levelList._container.addComponent(CocHighPerfList)
        this.viewNode.taskList._container.addComponent(CocHighPerfList)
    }
    private FlushUpdateTime2(realtime: number, total_time: number) {
        let time2 = Math.max(total_time - realtime, 0);
        // console.log("realtime-----"+realtime);
        // console.log("total_time-----"+total_time);
        // console.log("time2-----"+time2);

        let time_t = TimeHelper.FormatDHMS(time2);
        let t_str;
        if (this.select_index == 1) {
            if (+time_t.minute === 0 && +time_t.hour === 0) {
                time_t.minute = "1";
            }
            //console.log("day----" + (this.cache_timer2-TimeCtrl.Inst().ServerTime));

            t_str = TextHelper.Format(this.timeStr, time_t.hour, time_t.minute);
        } else if (this.select_index == 2) {
            if (+time_t.day === 0 && +time_t.hour === 0) {
                time_t.hour = "1";
            }
            //console.log("---------time_t.day-------"+time_t.day+"---time_t.hour-----"+time_t.hour +"--minute--" + time_t.minute);
            // console.log("week----" + (this.cache_timer2-TimeCtrl.Inst().ServerTime));
            t_str = TextHelper.Format(this.timeStr, time_t.day, time_t.hour);
        }

        UH.SetText(this.viewNode.time2, t_str)
    }

    public FlushList() {
        UH.SetText(this.viewNode.lb_level, WarOrderData.Inst().GetCurLevel());
        this.cache_timer = WarOrderData.Inst().GetNextMonTime();
        if (WarOrderData.Inst().GetCurLevel() == CfgWarOrderData.other[0].grade_time) {
            this.viewNode.btn_gmdj.visible = false;
            this.viewNode.gp_ymj.visible = true;
        } else {
            this.viewNode.gp_ymj.visible = false;
            if (WarOrderData.Inst().GetCurData()) {
                this.viewNode.orderBar.max = WarOrderData.Inst().GetCurData().open_exp;
                this.viewNode.orderBar.min = 0;
                this.viewNode.orderBar.value = WarOrderData.Inst().WarOrderSmartData.WarOrderInfo.exp;
            }
        }

        if (this.select_index == 0) { //等级奖励
            this.list_data = WarOrderData.Inst().GetLevelRewradList();
            this.viewNode.levelList.numItems = this.list_data.length;
            this.viewNode.taskGP.visible = false;
            this.viewNode.levelRewardGP.visible = true;
            this.viewNode.typeRadio1.titleColor = COLORS.Yellow2;
            this.viewNode.typeRadio2.titleColor = this.viewNode.typeRadio3.titleColor = COLORS.Yellow8;
            let toIndx = WarOrderData.Inst().GetLevelListIndex() >= CfgWarOrderData.other[0].grade_time - 1 ? WarOrderData.Inst().GetLevelListIndex() - 1 : WarOrderData.Inst().GetLevelListIndex();
            this.viewNode.levelList.scrollToView(toIndx, true, true);
            if (WarOrderData.Inst().WarOrderSmartData.WarOrderInfo.isBuy) {
                this.viewNode.BtnGet.x = 328;
                this.viewNode.BtnInvite.visible = false;
            }
        } else if (this.select_index == 1) { //每日任务
            this.viewNode.taskGP.visible = true;
            this.viewNode.levelRewardGP.visible = false;
            this.task_data = WarOrderData.Inst().GetTaskListByType(1);
            this.viewNode.taskList.numItems = this.task_data.length;
            this.viewNode.typeRadio2.titleColor = COLORS.Yellow2;
            this.viewNode.typeRadio1.titleColor = this.viewNode.typeRadio3.titleColor = COLORS.Yellow8;
            this.timeType = TimeFormatType.TYPE_TIME_5;
            this.timeStr = Language.UiTimeMeter.TimeStr7;
            this.cache_timer2 = Math.floor(TimeCtrl.Inst().tomorrowStarTime);
            this.FlushFlushTime2();
        } else if (this.select_index == 2) { //每周任务
            this.viewNode.taskGP.visible = true;
            this.viewNode.levelRewardGP.visible = false;
            this.task_data = WarOrderData.Inst().GetTaskListByType(2);
            this.viewNode.taskList.numItems = this.task_data.length;
            this.viewNode.typeRadio3.titleColor = COLORS.Yellow2;
            this.viewNode.typeRadio2.titleColor = this.viewNode.typeRadio1.titleColor = COLORS.Yellow8;
            this.timeType = TimeFormatType.TYPE_TIME_4;
            this.timeStr = Language.UiTimeMeter.TimeStr5;
            this.cache_timer2 = TimeCtrl.Inst().GetNextWeekMonTime();
            this.FlushFlushTime2();

        }

        this.FlushFlushTime();
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }
    onChangeClick(target: fgui.GComponent) {
        switch (target._name) {
            case "typeRadio1":
                this.select_index = 0;
                this.FlushList();
                break;
            case "typeRadio2":
                this.select_index = 1;
                this.FlushList();
                break;
            case "typeRadio3":
                this.select_index = 2;
                this.FlushList();
                break;
        }

    }
    //等级奖励
    private renderListItem(index: number, item: levelRewardItem) {
        item.SetData(this.list_data[index]);
    }
    //任务
    //等级奖励
    private renderListItem2(index: number, item: taskItem) {

        item.SetData(this.task_data[index], this.select_index);
    }
    private OnClickCloseView() {
        ViewManager.Inst().CloseView(WarOrderView);
    }

    private OnClickOpenRewardView() {
        let param = {
            type: 4,
            pause: this.select_pause
        }
        ViewManager.Inst().OpenView(BoxFundRewardView, param);
    }
    private OnClickOpenBuyLevelView() {
        ViewManager.Inst().OpenView(buyLevelView);
    }
    private OnClickChange(index: number) {

    }
    //购买战令
    private OnClickPay() {
        let money = CfgWarOrderData.other[0].buy_senior;
        let order_data = Order_Data.initOrder(0, ACTIVITY_TYPE.WarOrder, money / 10, money, "");
        OrderCtrl.generateOrder(order_data);
    }
    //一键领取
    private OnClickOneKey() {
        WarOrderData.Inst().SendWarOrderReward(2);
    }


}


export class levelRewardItem extends fgui.GComponent {
    private viewNode = {
        img_zhezhao: <fgui.GObject>null,
        Cell: <ItemCell>null,
        lb_level: <fgui.GTextField>null,
        img_topBar: <fgui.GObject>null,
        img_downBar: <fgui.GObject>null,
        common_yilingqu: <fgui.GGroup>null,
        itemList: <fgui.GList>null,
        commonEffect: <UIEffectShow>null,
        redPoint: <RedPoint>null,
    };
    private list_data: any;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Cell.onClick(this.OnClickCommonCell.bind(this));
        this.viewNode.itemList.onClick(this.OnClickCommonCellList.bind(this));
        this.viewNode.itemList.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.common_yilingqu.enabled = false;
    }
    public SetData(data: any) {
        this.data = data;
        this.viewNode.img_downBar.visible = this.viewNode.common_yilingqu.visible = false;
        this.viewNode.img_topBar.visible = this.data.open_grade <= WarOrderData.Inst().GetCurLevel();
        this.viewNode.img_zhezhao.visible = this.data.open_grade > WarOrderData.Inst().GetCurLevel();
        let is_receive = WarOrderData.Inst().GetRewardGet(data.seq, 1);
        let is_Get = false;
        this.viewNode.redPoint.SetNum(0);
        if (this.data.open_grade <= WarOrderData.Inst().GetCurLevel()) {
            this.viewNode.img_downBar.visible = true;
            if (is_receive) {
                this.viewNode.commonEffect.StopEff(4164011);
                this.viewNode.common_yilingqu.visible = true;
            } else {
                this.viewNode.commonEffect.PlayEff(4164011);
                this.viewNode.redPoint.SetNum(1);
                is_Get = true;
            }
        }
        UH.SetText(this.viewNode.lb_level, this.data.open_grade);
        this.viewNode.Cell.SetData(Item.Create(data.ordinary_item, { is_click: !is_Get, is_num: true }));
        this.list_data = data.senior_item;
        this.viewNode.itemList.numItems = this.data.senior_item.length;


    }
    //领取普通奖励
    private OnClickCommonCell() {
        if (!WarOrderData.Inst().GetRewardGet(this.data.seq, 1) && this.data.open_grade <= WarOrderData.Inst().GetCurLevel()) {
            WarOrderData.Inst().SendWarOrderReward(1, this.data.seq);
        }
    }
    //领取高级奖励
    private OnClickCommonCellList() {
        if (!WarOrderData.Inst().GetRewardGet(this.data.seq, 2) && this.data.open_grade <= WarOrderData.Inst().GetCurLevel() && WarOrderData.Inst().WarOrderSmartData.WarOrderInfo.isBuy) {
            WarOrderData.Inst().SendWarOrderReward(1, this.data.seq);
        }
    }
    private renderListItem(index: number, item: rewardItem) {
        item.SetData(this.list_data[index], this.data.open_grade, this.data.seq);
    }
    // private OnClickSenioeCell(){
    //     LogError("OnClickSenioeCell" + this.data.seq)
    // }
}

export class taskItem extends fgui.GComponent {
    private viewNode = {
        bg: <fgui.GLoader>null,
        lb_cur: <fgui.GTextField>null,
        lb_exp: <fgui.GTextField>null,
        lb_dis: <fgui.GTextField>null,
        btn_goto: <fgui.GButton>null,
        img_ywc: <fgui.GObject>null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.btn_goto.onClick(this.onGoto.bind(this));
    }
    public SetData(data: any, type: number) {
        this.data = data
        this.viewNode.img_ywc.visible = false;
        this.viewNode.btn_goto.visible = true;
        this.viewNode.lb_cur.color = COLORS.Red1;
        if (type == 1) {
            UH.SpriteName(this.viewNode.bg, "Serveractivity", "wxzl_hdd2");

        } else if (type == 2) {
            UH.SpriteName(this.viewNode.bg, "Serveractivity", "wxzl_hdd3");

        }
        let cur = WarOrderData.Inst().GetTaskReceive(type)[this.data.type] >= this.data.parameter ? this.data.parameter : WarOrderData.Inst().GetTaskReceive(type)[this.data.type]; //当前任务进度
        let re = this.data.parameter;  //完成进度
        UH.SetText(this.viewNode.lb_cur, "(" + cur + "/" + re + ")");
        if (WarOrderData.Inst().GetTaskFalg(this.data.seq, type)) {
            this.viewNode.lb_cur.color = COLORS.Green3;
            this.viewNode.img_ywc.visible = true;
            this.viewNode.btn_goto.visible = false;

        }
        UH.SetText(this.viewNode.lb_dis, data.describe);
        UH.SetText(this.viewNode.lb_exp, "经验+" + data.open_exp);

    }
    private onGoto() {
        // console.log("------------onGoto-------------",this.data.open_panel);
        if (this.data.open_panel == 30000) { //铭文之塔用modkey跳不过去
            ViewManager.Inst().OpenView(InscriptionTowerView);
        } else if (this.data.open_panel == 43000) {
            ViewManager.Inst().OpenView(ShenQiView);
        } else if (this.data.open_panel == 3) {
            ViewManager.Inst().CloseView(ServerActivityView);
        } else {
            ViewManager.Inst().OpenViewByKey(this.data.open_panel);
        }


    }
}

export class rewardItem extends fgui.GComponent {
    private viewNode = {
        Cell: <ItemCell>null,
        common_yilingqu: <fgui.GGroup>null,
        lock: <fgui.GObject>null,
        commonEffect: <UIEffectShow>null,
        redPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.common_yilingqu.enabled = false;
    }
    public SetData(data: any, open_grade: number, seq: number) {
        this.data = data;
        let is_buy = WarOrderData.Inst().WarOrderSmartData.WarOrderInfo.isBuy; //是否购买高级战令

        this.viewNode.common_yilingqu.visible = false;
        this.viewNode.redPoint.SetNum(0);
        let is_receive = WarOrderData.Inst().GetRewardGet(seq, 2); //是否已领取
        let is_Get = false;
        if (is_buy) {

            this.viewNode.lock.visible = false;
            if (open_grade <= WarOrderData.Inst().GetCurLevel()) {
                if (is_receive) {
                    this.viewNode.commonEffect.StopEff(4164011);
                    this.viewNode.common_yilingqu.visible = true;
                } else {
                    this.viewNode.commonEffect.PlayEff(4164011);
                    this.viewNode.redPoint.SetNum(1);
                    is_Get = true;
                }
            }
        } else {
            this.viewNode.lock.visible = true;
        }
        this.viewNode.Cell.SetData(Item.Create(data, { is_click: !is_Get, is_num: true }));

    }

}
@BaseView.registView
export class buyLevelView extends BaseView {
    private buy_level = 1;
    private dataList: any;

    protected viewRegcfg = {
        UIPackName: "WarOrder",
        ViewName: "buyLevelView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    protected viewNode = {
        //购买后能提升到的等级
        lb_level: <fgui.GTextField>null,
        itemList: <fgui.GList>null,
        //购买多少级
        lb_buyLevel: <fgui.GTextField>null,
        //购买
        btn_buy: <fgui.GButton>null,
        add: <fgui.GButton>null,
        reduce: <fgui.GButton>null,
        //消耗多少钻石
        lb_values: <fgui.GTextField>null,
        Board: <CommonBoard3>null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    InitUI() {


    }

    public InitData(data: any) {
        this.viewNode.Board.SetData(new BoardData(buyLevelView));
        this.viewNode.add.onClick(this.addLevel.bind(this));
        this.viewNode.reduce.onClick(this.reduceLevel.bind(this));
        this.viewNode.btn_buy.onClick(this.OnBuyLevel.bind(this));
        this.viewNode.itemList.itemRenderer = this.renderListItem.bind(this);
        this.AddSmartDataCare(WarOrderData.Inst().WarOrderSmartData, this.ChangeLevel.bind(this));
        this.FlushData();
    }

    private addLevel() {
        this.buy_level = this.buy_level + WarOrderData.Inst().GetCurLevel() >= CfgWarOrderData.other[0].grade_time ? this.buy_level : this.buy_level + 1;
        this.FlushData();
    }

    private reduceLevel() {
        this.buy_level = this.buy_level - 1 <= 1 ? 1 : this.buy_level - 1;
        this.FlushData();
    }
    public ChangeLevel() {
        this.buy_level = 1;
        this.FlushData();
    }

    public FlushData() {
        if (WarOrderData.Inst().GetCurLevel() >= CfgWarOrderData.other[0].grade_time) { //
            //this.buy_level = 0;
            //ViewManager.Inst().CloseView(buyLevelView);
            return;
        }
        UH.SetText(this.viewNode.lb_level, WarOrderData.Inst().GetCurLevel() >= CfgWarOrderData.other[0].grade_time ? CfgWarOrderData.other[0].grade_time : WarOrderData.Inst().GetCurLevel() + this.buy_level);
        UH.SetText(this.viewNode.lb_buyLevel, WarOrderData.Inst().GetCurLevel() >= CfgWarOrderData.other[0].grade_time ? 0 : this.buy_level);
        let list = WarOrderData.Inst().GetLevelRewradListByBuyLevel(WarOrderData.Inst().GetCurLevel(), this.buy_level);
        let value = WarOrderData.Inst().GetBuyLevelValue(list);
        UH.SetText(this.viewNode.lb_values, value);
        this.dataList = WarOrderData.Inst().GetBuyLevelReward(this.buy_level);
        if (this.viewNode.itemList) {
            this.viewNode.itemList.numItems = this.dataList.length;

        }

    }
    private renderListItem(index: number, item: ItemCell) {
        item.SetData(Item.Create(this.dataList[index], { is_click: true, is_num: true }));
    }
    private timeOut: any;
    private OnBuyLevel() {
        this.viewNode.btn_buy.enabled = false;
        WarOrderData.Inst().SendWarOrderReward(3, this.buy_level);
        this.timeOut = setTimeout(() => {
            this.viewNode.btn_buy.enabled = true;
            if (WarOrderData.Inst().GetCurLevel() >= CfgWarOrderData.other[0].grade_time) { //
                //this.buy_level = 0;
                ViewManager.Inst().CloseView(buyLevelView);
            }
        }, 500);
        this.timeOut;

    }
    CloseCallBack(): void {
        clearTimeout(this.timeOut)
    }
    private OnClickCloseView() {
        ViewManager.Inst().CloseView(buyLevelView);
    }

}

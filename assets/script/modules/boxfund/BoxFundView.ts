import { Component } from "cc";
import { CfgBoxFundData } from "config/CfgBoxFund";
import { CfgItem } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BoxData } from "modules/box/BoxData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { AdType, CommonId } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { BoxFundData } from "./BoxFundData";
import { BoxFundRewardView } from "./BoxFundRewardView";
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { FundChooseS } from "../levelfund/LevelFundView";
import { AdvDoubleView, AdvDoubleViewData } from "modules/AdvDouble/AdvDoubleView";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";

//宝箱基金 2049
// @BaseView.registView 
export class BoxFundView extends fgui.GComponent {

    protected viewRegcfg = {
        UIPackName: "Serveractivity",
        ViewName: "BoxFundView",
        LayerType: ViewLayer.Normal,
    };

    private list_data: any;
    private select_index = 0;
    private select_pause: number;
    private pause_data: any;
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
        Reward_list: <fgui.GList>null,
        BtnPay: <fgui.GButton>null,
        BtnReward: <fgui.GButton>null,
        // BtnRight:<fgui.GButton>null,
        highEffect: <UIEffectShow>null,
        // BtnLeft:<fgui.GButton>null,
        btnlist: <fgui.GList>null,
    };



    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.data = BoxFundData.Inst()
        this.viewNode.Reward_list.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.Reward_list.setVirtual();

        this.viewNode.btnlist.itemRenderer = this.renderBtnListItem.bind(this);
        // this.viewNode.btnlist.setVirtual();
        this.viewNode.BtnPay.onClick(this.OnClickPay.bind(this));
        this.viewNode.BtnReward.onClick(this.OnClickOpenRewardView.bind(this));
        // this.viewNode.BtnRight.onClick(this.OnClickChange.bind(this,1));
        // this.viewNode.BtnLeft.onClick(this.OnClickChange.bind(this,-1));
        let is_over = BoxFundData.Inst().GetIsActiveOver()
        if (!is_over) { return }
        this.pause_data = this.data.GetPauseData();
        this.select_index = 0;
        this.select_pause = this.pause_data[this.select_index].pause;
        this.viewNode.highEffect.PlayEff(4164027)
        this.addSmartDataCare(BoxFundData.Inst().BoxFundSmartData, this.FlushList.bind(this));
        this.viewNode.btnlist.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this)
        this.viewNode.Reward_list._container.addComponent(CocHighPerfList)

        this.FlushList()

    }
    protected extendsCfg = [
        { ResName: "BoxFundItem", ExtendsClass: BoxFundItem },
        { ResName: "FundChoose", ExtendsClass: FundChoose },

    ];

    private OnClickItem(item: FundChooseS) {
        let level = BoxData.Inst().GetBoxLevel()
        if (level >= item.data.show_level && this.select_pause != item.data.phase) {
            this.select_index = item.data.phase - 1
            this.select_pause = item.data.phase
            BoxFundData.Inst().SetNowSelPhase(item.data.phase)
            this.FlushList()
        } else if (level < item.data.show_level) {
            PublicPopupCtrl.Inst().Center(Language.OpenServer.BoxNotEnoughLevel);
        }
    }
    /*
        InitData() {
            // this.viewNode.Board.SetData(new BoardData(MysteryShopView));
            this.data = BoxFundData.Inst()
            this.viewNode.Reward_list.itemRenderer = this.renderListItem.bind(this);
            this.viewNode.Reward_list.setVirtual();
            this.viewNode.BtnPay.onClick(this.OnClickPay.bind(this));
            this.viewNode.BtnReward.onClick(this.OnClickOpenRewardView.bind(this));
            this.viewNode.BtnRight.onClick(this.OnClickChange.bind(this,1));
            this.viewNode.BtnLeft.onClick(this.OnClickChange.bind(this,-1));
    
            // this.AddSmartDataCare(BoxFundData.Inst().BoxFundSmartData, this.FlushList.bind(this));
    
            // this.AddSmartDataCare(BoxFundData.Inst().BoxFundSmartData, this.FlushList.bind(this), "OtherChange");
            this.pause_data = this.data.GetPauseData()
            this.select_index = 0
            this.select_pause = this.pause_data[this.select_index].pause
            // this.list_data = BoxFundData.Inst().GetBoxFundShowList(this.select_pause)
            // this.viewNode.Reward_list.SetData(this.list_data)
    
        }
    
        InitUI() {
            // this.viewNode.BtnAdd.onClick(this.onAdd.bind(this));
            // this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
            this.FlushList()
        }*/
    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
    public FlushList() {
        this.pause_data = BoxFundData.Inst().GetPauseData()
        let is_over = BoxFundData.Inst().GetIsActiveOver()
        if (!is_over) {
            this.list_data = BoxFundData.Inst().GetBoxFundShowList(this.select_pause);
            this.viewNode.Reward_list.numItems = this.list_data.length;
            return
        }
        this.select_pause = this.pause_data[this.select_index].phase


        let need_level = 999
        if (BoxFundData.Inst().GetPauseMoney(this.select_pause)[0] != undefined) {
            need_level = BoxFundData.Inst().GetPauseMoney(this.select_pause)[0].show_level
        }
        let box_level = RoleData.Inst().GetRoleLevel()
        // this.viewNode.BtnLeft.visible = this.pause_data[this.select_index - 1] != null
        // this.viewNode.BtnRight.visible = this.pause_data[this.select_index + 1] != null && box_level >= need_level

        let buy_money_data = BoxFundData.Inst().GetPauseMoney(this.select_pause);
        let buy_money = buy_money_data[0].buy_money / 10;
        UH.SetText(this.viewNode.BtnPay, buy_money);
        this.list_data = BoxFundData.Inst().GetBoxFundShowList(this.select_pause)
        // this.viewNode.Reward_list.SetData(this.list_data)
        // this.viewNode.Reward_list.itemRenderer = this.renderListItem.bind(this);
        // this.viewNode.Reward_list.setVirtual();

        this.viewNode.Reward_list.numItems = this.list_data.length;
        this.viewNode.btnlist.numItems = this.pause_data.length;

        // this.FlushRefreshTimes();
        let is_buy = BoxFundData.Inst().GetIsBuyBoxFund(this.select_pause)
        this.viewNode.BtnPay.visible = !is_buy
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }

    private renderListItem(index: number, item: BoxFundItem) {
        item.SetData(this.list_data[index]);
    }

    private renderBtnListItem(index: number, item: BoxFundItem) {
        item.SetData(this.pause_data[index]);
    }

    private OnClickCloseView() {
        ViewManager.Inst().CloseView(BoxFundView);
    }

    private OnClickOpenRewardView() {
        let param = {
            type: 1,
            pause: this.select_pause
        }
        ViewManager.Inst().OpenView(BoxFundRewardView, param);
    }

    private OnClickChange(index: number) {
        this.select_index = this.select_index + index
        this.select_pause = this.pause_data[this.select_index].phase
        BoxFundData.Inst().SetNowSelPhase(this.select_pause)
        this.FlushList()
    }

    private OnClickPay() {
        let seq = this.select_pause
        let money_data = this.data.GetPauseMoney(seq)
        let money = money_data[0].buy_money
        let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.BoxFund, money / 10, money, "");
        OrderCtrl.generateOrder(order_data);
    }
}


export class BoxFundItem extends fgui.GComponent {
    private viewNode = {
        CommonLock: <fgui.GGroup>null,
        level: <fgui.GTextField>null,
        middledown: <fgui.GGroup>null,
        middletop: <fgui.GGroup>null,
        middleend: <fgui.GGroup>null,
        ActiveLevelBg: <fgui.GObject>null,

        common_yilingqu: <fgui.GGroup>null,
        CommonItem: <ItemCell>null,
        SeniorCell1: <ItemCell>null,
        SeniorCell2: <ItemCell>null,

        SeniorLock2: <fgui.GGroup>null,
        SeniorLock1: <fgui.GGroup>null,
        senior_yilingqu2: <fgui.GGroup>null,
        senior_yilingqu1: <fgui.GGroup>null,

        redPoint: <RedPoint>null,
        redPoint1: <RedPoint>null,
        redPoint2: <RedPoint>null,

        commonEffect: <UIEffectShow>null,
        senoirEffect1: <UIEffectShow>null,
        senoirEffect2: <UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.CommonItem.onClick(this.OnClickCommonCell.bind(this, 0))
        this.viewNode.SeniorCell1.onClick(this.OnClickCommonCell.bind(this, 1))
        this.viewNode.SeniorCell2.onClick(this.OnClickCommonCell.bind(this, 1))

    }
    public SetData(data: any) {
        this.data = data
        let box_level = BoxData.Inst().GetBoxLevel()//BoxFundData.Inst().GetBoxLevel();
        let max_length = BoxFundData.Inst().GetListLength(data.phase);
        let is_active = BoxFundData.Inst().GetIsBuyBoxFund(data.phase);   //是否购买豪华
        let is_common_get = BoxFundData.Inst().GetRewardGet(data.seq, 1);
        let is_senior_get = BoxFundData.Inst().GetRewardGet(data.seq, 2);


        UH.SetText(this.viewNode.level, data.level);
        this.viewNode.middletop.visible = data.level <= box_level;
        this.viewNode.middledown.visible = data.seq != max_length && data.level <= box_level;
        this.viewNode.middleend.visible = data.seq == max_length && data.level <= box_level;

        this.viewNode.ActiveLevelBg.visible = data.level <= box_level;
        this.viewNode.CommonLock.visible = data.level > box_level;
        this.viewNode.redPoint.SetNum((!is_common_get && data.level <= box_level) ? 1 : 0)


        // if (data.ordinary_item && data.ordinary_item.item_id) {
        this.viewNode.CommonItem.SetData(Item.Create(data.ordinary_item, { is_click: !(!is_common_get && data.level <= box_level), is_num: true }));

        // }else{
        //     this.viewNode.CommonItem.SetData(Item.Create(new CfgItem(CommonId.Diamond,data.diamond_num),{ is_num: true }));
        // }
        if (!is_common_get && data.level <= box_level) {
            this.viewNode.commonEffect.PlayEff(4164011)
        } else {
            this.viewNode.commonEffect.StopEff(4164011)
        }

        UH.ActivatorPosition(this.viewNode.SeniorCell1, (data.senior_item.length == 1), 487, 30, 413, 30);
        UH.ActivatorPosition(this.viewNode.redPoint1, (data.senior_item.length == 1), 585, 32, 512, 32);
        UH.ActivatorPosition(this.viewNode.senoirEffect1, (data.senior_item.length == 1), 536, 84, 462, 84);

        if (data.senior_item.length == 1) {
            //只有一个物品
            this.viewNode.SeniorCell2.visible = false;
            this.viewNode.SeniorCell1.SetData(Item.Create(data.senior_item[0], { is_click: !(!is_senior_get && data.level <= box_level && is_active), is_num: true }));
            this.viewNode.SeniorLock1.visible = !is_active || data.level > box_level;
            this.viewNode.SeniorLock2.visible = false;
            this.viewNode.senior_yilingqu1.visible = is_senior_get;
            this.viewNode.senior_yilingqu2.visible = false;
            this.viewNode.redPoint1.SetNum((!is_senior_get && data.level <= box_level && is_active) ? 1 : 0);
            this.viewNode.redPoint2.SetNum(0);
            if (!is_senior_get && data.level <= box_level && is_active) {
                this.viewNode.senoirEffect1.PlayEff(4164011)
                this.viewNode.senoirEffect2.StopEff(4164011)
            } else {
                this.viewNode.senoirEffect1.StopEff(4164011)
                this.viewNode.senoirEffect2.StopEff(4164011)
            }
        }
        else {
            this.viewNode.SeniorCell2.visible = true;
            this.viewNode.SeniorCell1.SetData(Item.Create(data.senior_item[0], { is_click: !(!is_senior_get && data.level <= box_level && is_active), is_num: true }));
            this.viewNode.SeniorCell2.SetData(Item.Create(data.senior_item[1], { is_click: !(!is_senior_get && data.level <= box_level && is_active), is_num: true }));

            // this.viewNode.SeniorCell2.SetData(Item.Create(new CfgItem(CommonId.Diamond,data.senior_bind_diamond),{ is_num: true }));

            this.viewNode.SeniorLock1.visible = false;
            this.viewNode.SeniorLock2.visible = !is_active || data.level > box_level;

            this.viewNode.senior_yilingqu2.visible = is_senior_get;
            this.viewNode.senior_yilingqu1.visible = false;
            this.viewNode.redPoint1.SetNum((!is_senior_get && data.level <= box_level && is_active) ? 1 : 0)
            this.viewNode.redPoint2.SetNum((!is_senior_get && data.level <= box_level && is_active) ? 1 : 0)
            if (!is_senior_get && data.level <= box_level && is_active) {
                this.viewNode.senoirEffect1.PlayEff(4164011)
                this.viewNode.senoirEffect2.PlayEff(4164011)
            } else {
                this.viewNode.senoirEffect1.StopEff(4164011)
                this.viewNode.senoirEffect2.StopEff(4164011)
            }
        }

        this.viewNode.common_yilingqu.visible = is_common_get;

    }

    // private OnClickCommonCell(){
    //     AudioManager.Inst().Play(AudioTag.TongYongClick);
    //     BoxFundData.Inst().SendGetBoxFundReward(this.data.seq)
    // }
    private OnClickCommonCell(type: number) {
        // LogError("OnClickCommonCell" + this.data.seq)
        let box_level = BoxData.Inst().GetBoxLevel()
        let is_common_get = BoxFundData.Inst().GetRewardGet(this.data.seq, 1);
        // LogError("box_level = " + box_level + " this.data = ", this.data)
        if (type == 0 && (box_level < this.data.level || is_common_get)) {
            return
        }
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        if (type == 0) {
            if (CfgBoxFundData.other[0].is_open == 1) { //开启广告
                ViewManager.Inst().OpenView(AdvDoubleView, new AdvDoubleViewData(Language.FundAdv.title,
                    Language.FundAdv.LevelFundAdvTip,
                    this.data.ordinary_item,
                    () => {    //LogError("看广告双倍")
                        // RoleCtrl.Inst().ReqAdverReward(AdType.box_fun, 0 , this.data.seq);
                        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.box_fun, Language.adv.box_fun, 0, this.data.seq)

                        // let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_fun)
                        //     ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.box_fun + "", TextHelper.Format(Language.adv.box_fun, co.ad_award[0].num))
                    },
                    () => { BoxFundData.Inst().SendGetBoxFundReward(type, this.data.seq) }))
            } else {
                BoxFundData.Inst().SendGetBoxFundReward(0, this.data.seq)
                BoxFundData.Inst().SendGetBoxFundReward(1, this.data.seq)
            }
        } else {
            if (CfgBoxFundData.other[0].is_open == 1) { //开启广告
                BoxFundData.Inst().SendGetBoxFundReward(type, this.data.seq)
            } else {
                BoxFundData.Inst().SendGetBoxFundReward(0, this.data.seq)
                BoxFundData.Inst().SendGetBoxFundReward(1, this.data.seq)
            }
        }
    }
    // private OnClickSenioeCell(){
    // }
}

export class FundChoose extends fgui.GComponent {
    private viewNode = {
        name: <fgui.GTextField>null,
        name1: <fgui.GTextField>null,
        name2: <fgui.GTextField>null,

        sel: <fgui.GGroup>null,
        unsel: <fgui.GGroup>null,
        lock: <fgui.GGroup>null,
        redPoint: <RedPoint>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: any) {


        this.data = data
        let sel = BoxFundData.Inst().GetNowSelPhase()
        let level = RoleData.Inst().GetRoleLevel()
        UH.SetText(this.viewNode.name, data.seg_name)
        UH.SetText(this.viewNode.name1, data.seg_name)
        UH.SetText(this.viewNode.name2, data.seg_name)

        this.viewNode.lock.visible = level < data.show_level
        this.viewNode.sel.visible = level >= data.show_level && sel == data.phase
        this.viewNode.unsel.visible = level >= data.show_level && sel != data.phase
        let red = BoxFundData.Inst().GetPauseRed(data.phase)
        this.viewNode.redPoint.SetNum(red)
    }
}
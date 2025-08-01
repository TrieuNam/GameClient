import { CfgActivityData, CfgActivityRand } from "config/CfgActivity";
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { AdEquityShowItem, AdEquityView } from "modules/ad_equity/AdEquityView";
import { BoxFundData } from "modules/boxfund/BoxFundData";
import { BoxFundItem, BoxFundView, FundChoose } from "modules/boxfund/BoxFundView";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { CommonId } from "modules/common/CommonEnum";
import { Mod } from "modules/common/ModuleDefine";
import { DailyGiftCell, DailyGiftView } from "modules/DailyGift/DailyGiftView";
import { Currency } from "modules/extends/Currency";
import { RedPoint } from "modules/extends/RedPoint";
import { InviteFriendItem, InviteFriendView } from "modules/invitefriend/InviteFriendView";
import { LevelFundData } from "modules/levelfund/LevelFundData";
import { FundChooseS, LevelFundItem, LevelFundView } from "modules/levelfund/LevelFundView";
import { MonthlyCardCell, MonthlyCardRewardCell, MonthlyCardView, MonthlyFishCardCell } from "modules/MonthlyCard/MonthlyCardView";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { RoleData } from "modules/role/RoleData";
import { ButtonFund, ScoreFundItem, ScoreFundRewardItem, ScoreFundView } from "modules/ScoreFund/ScoreFundView";
import { TodayShareView } from "modules/TodayShare/TodayShareView";
import { levelRewardItem, rewardItem, taskItem, WarOrderView } from "modules/warOrder/WarOrderView";
import { UH } from "../../helpers/UIHelper";
import { ServerActivityData } from "./ServerActivityData";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";

@BaseView.registView
export class ServerActivityView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "Serveractivity",
        ViewName: "ServerActivityView",
        LayerType: ViewLayer.Buttom,
    };
    private activity_list: CfgActivityRand[]
    private select_index = 0
    private select_name: string
    private list_length = 0
    private Panel: { [key: string]: any } = []
    private activity_list_bei: CfgActivityRand[]
    private list_scrollPane: fgui.ScrollPane;
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        list: <fgui.GList>null,
        BtnReturn: <fgui.GButton>null,
        Currency1: <Currency>null,
        Currency2: <Currency>null,
        title: <fgui.GTextField>null,
        // LevelFund: <LevelFundView>null,
        // BoxFund: <BoxFundView>null,
        // InviteFriend: <InviteFriendView>null,
        // DailyGift: <DailyGiftView>null,
        // MonthlyCard: <MonthlyCardView>null,
        dot: <fgui.GComponent>null,
    };

    private readonly newProperty = "MonthlyCardRewardCell";

    protected extendsCfg = [
        { ResName: "ServeractivityItem", ExtendsClass: ServeractivityItem },
        { ResName: "BoxFundView", ExtendsClass: BoxFundView },
        { ResName: "LevelFundView", ExtendsClass: LevelFundView },
        { ResName: "InviteFriendView", ExtendsClass: InviteFriendView },
        { ResName: "LevelFundItem", ExtendsClass: LevelFundItem },
        { ResName: "BoxFundItem", ExtendsClass: BoxFundItem },
        { ResName: "InviteFriendItem", ExtendsClass: InviteFriendItem },
        { ResName: "DailyGiftCell", ExtendsClass: DailyGiftCell },
        { ResName: "DailyGiftView", ExtendsClass: DailyGiftView },
        { ResName: "MonthlyCardCell", ExtendsClass: MonthlyCardCell },
        { ResName: "MonthlyFishCardCell", ExtendsClass: MonthlyFishCardCell },
        { ResName: "MonthlyCardRewardCell", ExtendsClass: MonthlyCardRewardCell },
        { ResName: "MonthlyCardView", ExtendsClass: MonthlyCardView },
        { ResName: "TodayShareView", ExtendsClass: TodayShareView },

        { ResName: "FundChoose", ExtendsClass: FundChoose },
        { ResName: "FundChooseS", ExtendsClass: FundChooseS },

        { ResName: "ScoreFundView", ExtendsClass: ScoreFundView },
        { ResName: "ScoreFundItem", ExtendsClass: ScoreFundItem },
        { ResName: "ScoreFundRewardItem", ExtendsClass: ScoreFundRewardItem },
        { ResName: "ButtonFund", ExtendsClass: ButtonFund },

        { ResName: "WarOrderView", ExtendsClass: WarOrderView },
        //{ ResName: "buyLevelView", ExtendsClass: buyLevelView },
        { ResName: "levelRewardItem", ExtendsClass: levelRewardItem },
        { ResName: "taskItem", ExtendsClass: taskItem },
        { ResName: "rewardItem", ExtendsClass: rewardItem },



        { ResName: "AdEquityView", ExtendsClass: AdEquityView },
        { ResName: "AdEquityShowItem", ExtendsClass: AdEquityShowItem },

    ];
    select_list_index = 0
    InitData(param?: any) {
        this.list_scrollPane = this.viewNode.list.scrollPane;
        this.viewNode.BtnReturn.onClick(this.OnClickCloseAll.bind(this));
        this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
        this.activity_list = ServerActivityData.Inst().GetOpenActivityList();
        this.activity_list_bei = ServerActivityData.Inst().GetOpenActivityList();
        this.list_length = this.activity_list.length
        // this.viewNode.list.SetData(this.activity_list)
        this.viewNode.list.setVirtual();
        this.viewNode.list.numItems = this.activity_list.length;

        this.viewNode.Currency1.SetCurrencyId(CommonId.Diamond);
        this.viewNode.Currency2.SetCurrencyId(CommonId.Gold);
        this.viewNode.list.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this)

        // this.AddSmartDataCare(LevelFundData.Inst().LevelFundSmartData, this.FlushLevelFund.bind(this));
        // this.AddSmartDataCare(BoxFundData.Inst().BoxFundSmartData, this.FlushBoxFund.bind(this));
        // this.AddSmartDataCare(DailyGiftData.Inst().ResultData, this.FlushDailyGift.bind(this), "info");
        // this.AddSmartDataCare(InviteFriendData.Inst().ResultData, this.FlushInviteFriend.bind(this));
        // this.AddSmartDataCare(MonthlyCardData.Inst().ResultData, this.FlushMonthlyCard.bind(this), "info");

        // this.AddSmartDataCare(ServerActivityData.Inst().ResultData, this.FlushList.bind(this));
        this.AddSmartDataCare(ActivityData.Inst().ResuleData, this.FlushList.bind(this), "is_activity_status_change");
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushList.bind(this), "roleLevel");
        for (let i = 0; i < CfgActivityData.rand.length; i++) {
            if (CfgActivityData.rand[i].mod_key == Mod.ServerActivity.view) {
                UH.SetText(this.viewNode.title, CfgActivityData.rand[i].text);
                break;
            }
        }
        //LogError(param)
        if (param != null) {
            let index = this.activity_list.findIndex(cfg => { return cfg.mod_key == param.modkey })
            if (index > 0) {
                this.select_list_index = index
                //LogError("跳转", this.select_list_index)
            }
        } else {
            this.viewNode.list.selectedIndex = 0
        }
        // this.FlushLevelFund()
        // this.FlushBoxFund()
        // this.FlushInviteFriend()
        // this.FlushDailyGift()
        // this.FlushMonthlyCard()
    }

    InitUI() {
        let quick = ServerActivityData.Inst().GetQuickOpen()
        this.select_index = this.activity_list[0].mod_key;
        this.FlushList()
        //this.viewNode.list.numItems = this.activity_list.length;
        this.viewNode.list._container.addComponent(CocHighPerfList)
        setTimeout(() => {
            if (this.viewNode.list.itemIndexToChildIndex(this.select_list_index) == null) {
                this.OpenModView(this.activity_list[0].view_name)
            }
            else {
                this.viewNode.list.OnSelectedItem(this.viewNode.list.itemIndexToChildIndex(this.select_list_index))
            }

        }, 50);

        //this.viewNode.list.selectedIndex = this.select_list_index


        if (quick != null) {
            this.QuickOpen(quick)
            return
        }
        if (this.select_list_index == 0) {
            this.OpenModView(this.activity_list[0].view_name)
        }
    }
    SelectServerTab(mod_key: number) {
        let index = this.activity_list.findIndex(cfg => { return cfg.mod_key == mod_key })
        if (index > 0) {
            //this.viewNode.list.selectedIndex = this.viewNode.list.childIndexToItemIndex(index)
            this.viewNode.list.OnSelectedItem(this.viewNode.list.itemIndexToChildIndex(index))
            this.viewNode.list.clearSelection()
            this.viewNode.list.addSelection(index)
        }
    }

    private QuickOpen(name: string) {
        for (var index in this.activity_list) {
            if (name == this.activity_list[index].view_name) {
                this.OpenModView(name)
                this.select_index = this.activity_list[index].mod_key;
                this.viewNode.list.selectedIndex = Number(index)
                break
            }
        }
        ServerActivityData.Inst().ClearQuickOpen()
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
        LevelFundData.Inst().ClearData()
        BoxFundData.Inst().ClearData()
    }

    private OnClickCloseAll() {
        ViewManager.Inst().CloseView(ServerActivityView);
        // ViewManager.Inst().CloseView(this.select_name);
    }

    // private FlushLevelFund() {
    //     this.viewNode.LevelFund.FlushList()
    // }
    // private FlushBoxFund() {
    //     this.viewNode.BoxFund.FlushList()
    // }
    // private FlushInviteFriend() {
    //     this.viewNode.InviteFriend.FlushList()
    // }

    // private FlushDailyGift() {
    //     this.viewNode.DailyGift.FlushData();
    // }

    // private FlushMonthlyCard() {
    //     this.viewNode.MonthlyCard.FlushData();
    // }
    private FlushList() {
        this.activity_list = ServerActivityData.Inst().GetOpenActivityList();
        this.viewNode.list.numItems = this.activity_list.length;
        let flush_length = this.activity_list.length
        if (flush_length != this.list_length && flush_length > 0) {
            let index = 0;
            if (this.select_index) {
                for (let i = 0; i < this.activity_list.length; i++) {
                    if (this.activity_list[i].mod_key == this.select_index) {
                        index = i;
                        break;
                    }
                }
            }
            let data = this.activity_list[index];
            this.select_index = data.mod_key;
            this.viewNode.list.selectedIndex = index;
            this.list_length = flush_length
            this.OpenModView(data.view_name)
        }
        this.FlushViewActive();


    }

    private renderListItem(index: number, item: ServeractivityItem) {
        item.SetData(this.activity_list[index]);
    }

    private OnClickItem(item: ServeractivityItem) {

        // if (this.select_name != undefined){
        //     if (ViewManager.Inst().IsViewOpened(this.select_name)){
        //         ViewManager.Inst().CloseView(this.select_name)
        //     }
        // }
        // if (item.data.view_name != undefined) {
        //     ViewManager.Inst().OpenView(item.data.view_name)
        // }
        // this.select_index = item.data.seq
        // this.select_name = item.data.view_name
        this.select_index = item.data.mod_key;

        this.FlushViewActive()

        this.OpenModView(item.data.view_name)
        this.CheckBtnShow()
    }

    private CheckBtnShow() {
        let gap = -15;
        let width = 199;
        let list_width = 751;
        let item_width = width + gap;
        let pox = this.list_scrollPane.posX;
        let btn_list = this.activity_list
        let index = 0;//按钮列表中的index
        for (let i = 0; i < btn_list.length; i++) {
            if (btn_list[i].mod_key == this.select_index) {
                index = i;
                break;
            }
        }
        let btn_pos = index + 1;//按钮位置
        //右滑动
        let btn_list_num = btn_pos - Math.floor(pox / item_width) //选中按钮在列表中的位置
        if (btn_list_num >= 4) {
            let to_posX = (btn_pos + 1) * (width + gap) - list_width - gap
            this.list_scrollPane.setPosX(to_posX, true)
            return;
        }
        // 左滑动
        let btn_list_pos_left_num = btn_pos - Math.ceil(pox / item_width);
        if (btn_list_pos_left_num <= 1) {
            let to_posX = (btn_pos - 2) * (width + gap)
            this.list_scrollPane.setPosX(to_posX, true);
        }
    }

    private removeExtraCompent() {
        if (this.viewNode.dot)
            this.viewNode.dot.removeChildren();
    }

    private OpenModView(view_name: string) {
        if (this.Panel[view_name] == null) {
            let view: fgui.GComponent = fgui.UIPackage.createObject("Serveractivity", view_name).asCom
            this.viewNode.dot.addChild(view)
            this.Panel[view_name] = view
            this.changeView(view_name)
        } else {
            this.changeView(view_name)
        }


    }
    private changeView(view_name: string) {
        // LogError(this.Panel)
        // for(let i = 0 ; i < this.activity_list.length;i ++){
        //     let flag = this.activity_list[i].view_name == view_name
        //     if(this.Panel[this.activity_list[i].view_name]!= null){
        //         LogError("this.activity_list[i].view_name = "+ this.activity_list[i].view_name + " flag = " + flag)
        //         this.Panel[this.activity_list[i].view_name].visible = flag
        //     }
        // } 

        for (var c_index in this.activity_list_bei) {
            let flag = this.activity_list_bei[c_index].view_name == view_name
            if (this.Panel[this.activity_list_bei[c_index].view_name] != null) {
                this.Panel[this.activity_list_bei[c_index].view_name].visible = flag
            }
        }
        this.activity_list_bei = this.activity_list
    }

    private FlushViewActive() {
        // LogError("?dddd",this.viewNode.BoxFund)
        // this.viewNode.BoxFund.visible = this.select_index == Mod.ServerActivity.BoxFund
        // this.viewNode.LevelFund.visible = this.select_index == Mod.ServerActivity.LevelFund
        // this.viewNode.InviteFriend.visible = this.select_index == Mod.ServerActivity.InviteFriend
        // this.viewNode.DailyGift.visible = this.select_index == Mod.ServerActivity.DailyGift
        // this.viewNode.MonthlyCard.SetSelect(this.select_index == Mod.ServerActivity.MonthlyCard);
    }

    // private FlushOpenView(){
    //     if (this.select_index == Mod.Serveractivity.BoxFund){

    //     }else if (this.select_index == Mod.Serveractivity.LevelFund){

    //     }
    // }
}

export class ServeractivityItem extends fgui.GButton {
    private handleCollector: HandleCollector;
    private viewNode = {
        select: <fgui.GGroup>null,
        title: <fgui.GRichTextField>null,
        RedPoint: <RedPoint>null,
        icon: <fgui.GLoader>null
    };
    // private now_open_name:string
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.data = data
        UH.SetText(this.viewNode.title, data.text)
        if (this.handleCollector) {
            this.handleCollector.RemoveAll()
        } else {
            this.handleCollector = HandleCollector.Create();
        }
        this.handleCollector.Add(RemindGroupMonitor.Create(data.mod, this.freshRedPoint.bind(this), true));
        UH.SpriteName(this.viewNode.icon, "Serveractivity", data.sprite);

    }
    public freshRedPoint() {
        if (this.data) {
            let num = RemindCtrl.Inst().GetGroupNum(this.data.mod);
            this.viewNode.RedPoint.SetNum(num);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
}


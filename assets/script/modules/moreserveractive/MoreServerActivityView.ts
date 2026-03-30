import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { AffordPresentBCell, AffordPresentCell, AffordPresentView } from "modules/AffordPresent/AffordPresentView";
import { Item } from "modules/bag/ItemData";
import { BoxManorItem, BoxManorView } from "modules/boxmanor/BoxManorView";
import { CaveLootMainView } from "modules/caveloot/CaveLootMainView";
import { CommodityGuildItem, CommodityGuildView } from "modules/CommodityGuild/CommodityGuildView";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { CommonId } from "modules/common/CommonEnum";
import { ExtraPack } from "modules/common/ExtraPack";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { RoleData } from "modules/role/RoleData";
import { ShenQiDrawView, ShenQiDrawCell, ShenQiDrawRewardCell, ShenQiDrawTab } from "modules/ShenQiDraw/ShenQiDrawView";
import { WeekendRechargeItem, WeekendRechargeView } from "modules/weekendrecharge/WeekendRechargeView";
import { WeekHaoLiItem, WeekHaoLiView } from "modules/WeekHaoLi/WeekHaoLiView";
import { WeekLianChongItem, WeekLianChongRender, WeekLianChongView } from "modules/WeekLianChong/WeekLianChongView";
import { UH } from "../../helpers/UIHelper";
import { MoreServerActivityData } from "./MoreServerActivityData";
import { TurntableAwardCell, IntegralTurntableView } from "modules/integralTurntable/IntegralTurntableView";

@BaseView.registView
export class MoreServerActivityView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "MoreServer",
        ViewName: "MoreServerActivityView",
        LayerType: ViewLayer.Buttom,
    };
    private activity_list: any;
    private select_index = 0;
    private list_length = 0;
    private select_name: string;
    private item_data: OpenServeractivityItem;
    private extra_compent: fgui.GComponent;
    private Panel: { [key: string]: any } = [];
    private activity_list_bei: any;

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

        // WeekendRechargeView: <WeekendRechargeView>null,
        // BoxManorView: <BoxManorView>null,
        // CaveLootView: <CaveLootMainView>null,
        // CommodityGuildView: <CommodityGuildView>null,
        dot: <fgui.GComponent>null,
    };

    protected extendsCfg = [
        { ResName: "OpenServeractivityItem", ExtendsClass: OpenServeractivityItem },
        { ResName: "BoxManorView", ExtendsClass: BoxManorView },
        { ResName: "CaveLootMain", ExtendsClass: CaveLootMainView },
        { ResName: "CommodityGuildView", ExtendsClass: CommodityGuildView },
        { ResName: "WeekendRechargeView", ExtendsClass: WeekendRechargeView },
        { ResName: "AffordPresentView", ExtendsClass: AffordPresentView },
        { ResName: "AffordPresentCell", ExtendsClass: AffordPresentCell },
        { ResName: "AffordPresentBCell", ExtendsClass: AffordPresentBCell },
        { ResName: "WeekHaoLiItem", ExtendsClass: WeekHaoLiItem },
        { ResName: "WeekHaoLiView", ExtendsClass: WeekHaoLiView },
        { ResName: "WeekLianChongItem", ExtendsClass: WeekLianChongItem },
        { ResName: "WeekLianChongRender", ExtendsClass: WeekLianChongRender },
        { ResName: "WeekLianChongView", ExtendsClass: WeekLianChongView },
        { ResName: "IntegralTurntableView", ExtendsClass: IntegralTurntableView },
        { ResName: "WeekendRechargeItem", ExtendsClass: WeekendRechargeItem },
        { ResName: "CommodityGuildItem", ExtendsClass: CommodityGuildItem },
        { ResName: "BoxManorItem", ExtendsClass: BoxManorItem },
        { ResName: "ItemAddName", ExtendsClass: ItemAddName },
        { ResName: "TurntableAwardCell", ExtendsClass: TurntableAwardCell },

        { ResName: "ShenQiDrawView", ExtendsClass: ShenQiDrawView },
        { ResName: "ShenQiDrawCell", ExtendsClass: ShenQiDrawCell },
        { ResName: "ShenQiDrawRewardCell", ExtendsClass: ShenQiDrawRewardCell },
        { ResName: "ShenQiDrawTab", ExtendsClass: ShenQiDrawTab },

        // { ResName: "NewServerCompetitionView", ExtendsClass: NewServerCompetitionView },
        // { ResName: "NewServerCompetitionTypeItem", ExtendsClass: NewServerCompetitionTypeItem },
        // { ResName: "NewServerCompetitionRankItem", ExtendsClass: NewServerCompetitionRankItem },
        // { ResName: "NewServerCompetitionRewardItem", ExtendsClass: NewServerCompetitionRewardItem },
    ];


    // protected extendsCfgOther = [
    //     { ResName: "NewServerCompetitionView", ExtendsClass: NewServerCompetitionView, PkgName: "NewServerCompetition" },
    // ]


    InitData(param?: any) {
        ExtraPack.Inst().LoadPack("MoreServerExtraUn", this.ExtraCallBack.bind(this))
        ExtraPack.Inst().LoadPack("MoreServerWeekHaoLi", this.ExtraCallBack.bind(this))
        ExtraPack.Inst().LoadPack("MoreServerNewServerCompetition", this.ExtraCallBack.bind(this))
        ExtraPack.Inst().LoadPack("MoreServerWeekLianChong", this.ExtraCallBack.bind(this))

        this.viewNode.BtnReturn.onClick(this.OnClickCloseAll.bind(this));
        this.viewNode.list.itemRenderer = this.renderListItem.bind(this);
        this.activity_list = MoreServerActivityData.Inst().GetOpenActivityList();
        this.activity_list_bei = this.activity_list
        this.list_length = this.activity_list.length
        // this.viewNode.list.SetData(this.activity_list)
        this.viewNode.list.setVirtual();

        this.viewNode.Currency1.SetCurrencyId(CommonId.Diamond);
        this.viewNode.Currency2.SetCurrencyId(CommonId.Gold);
        this.viewNode.list.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this)

        // this.AddSmartDataCare(WeekendRechargedData.Inst().WeekendRechargedSmartData, this.FlushSmart.bind(this));
        // this.AddSmartDataCare(CaveLootData.Inst().ResultData, this.FlushSmart.bind(this));
        // this.AddSmartDataCare(BoxManorData.Inst().ResultData, this.FlushSmart.bind(this));
        // this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushSmart.bind(this), "OtherChange");

        this.AddSmartDataCare(MoreServerActivityData.Inst().ResultData, this.FlushList.bind(this));
        this.AddSmartDataCare(ActivityData.Inst().ResuleData, this.FlushList.bind(this), "is_activity_status_change");
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushList.bind(this), "roleLevel");
        // this.FlushWeekendRechargeFund()
        // this.FlushBoxManor()
        // this.FlushCaveLoot()
        // this.FlushCommodityGuild()

        if (param != null) {
            let index = this.activity_list.findIndex((cfg: { mod_key: any; }) => { return cfg.mod_key == param.modkey })
            if (index > 0) {
                this.viewNode.list.selectedIndex = index
            }
        } else {
            this.viewNode.list.selectedIndex = 0
        }
    }

    InitUI() {
        this.select_index = this.activity_list[0].mod_key;
        this.FlushList()
        this.viewNode.list.numItems = this.activity_list.length;
        this.viewNode.list.selectedIndex = 0

        this.OpenModView(this.activity_list[0].view_name)

    }

    DoOpenWaitHandle() {
    }


    OpenCallBack() {
        // LogError("OpenCallBack")
        // if (!MoreServerActivityData.Inst().GetDataCe() ) {
        //     MoreServerActivityData.Inst().Showceshi()
        //     this.OnClickCloseAll()
        // }
    }
    private OnClickCloseAll() {
        this.CloseDestroy()
        ViewManager.Inst().CloseView(MoreServerActivityView);
    }

    CloseCallBack() {
        ExtraPack.Inst().RemovePack("MoreServerExtraUn")
        ExtraPack.Inst().RemovePack("MoreServerWeekHaoLi")
        ExtraPack.Inst().RemovePack("MoreServerNewServerCompetition")
        ExtraPack.Inst().RemovePack("MoreServerWeekLianChong")

        this.CloseDestroy()
    }

    // 慎防跳转行为忘记删除，两个地方都要加
    CloseDestroy() {
        for (var view_name in this.Panel) {
            if (this.Panel[view_name]["onDestroy"]) {
                this.Panel[view_name].onDestroy()
            }
        }
    }

    // private FlushWeekendRechargeFund(){
    //     this.viewNode.WeekendRechargeView.FlushList()
    // }
    // private FlushBoxManor(){
    //     this.viewNode.BoxManorView.FlushList()
    // }
    // private FlushCaveLoot(){
    //     this.viewNode.CaveLootView.FlushList()
    //     this.viewNode.CaveLootView.FlushItemNum()

    // }
    // private FlushCommodityGuild(){
    //     this.viewNode.CommodityGuildView.FlushInfo()
    // }


    private ExtraCallBack() {
        if (this.activity_list != undefined && this.activity_list[this.viewNode.list.selectedIndex] != undefined) {
            this.OpenModView(this.activity_list[this.viewNode.list.selectedIndex].view_name)
        }
    }

    private FlushList() {
        this.activity_list = MoreServerActivityData.Inst().GetOpenActivityList();
        this.viewNode.list.numItems = this.activity_list.length;
        let flush_length = this.activity_list.length
        if (flush_length != this.list_length) {
            if (this.activity_list[0] != null) {
                this.select_index = this.activity_list[0].mod_key;
                this.viewNode.list.selectedIndex = 0
                this.list_length = flush_length;
                this.OpenModView(this.activity_list[0].view_name)
            }
            else {
                ViewManager.Inst().CloseView(MoreServerActivityView);
            }

        }
    }

    private renderListItem(index: number, item: OpenServeractivityItem) {
        item.SetData(this.activity_list[index]);
    }

    private OnClickItem(item: OpenServeractivityItem) {
        // if (this.select_name != undefined){
        //     if (ViewManager.Inst().IsViewOpened(this.select_name)){
        //         ViewManager.Inst().CloseView(this.select_name)
        //     }
        // }
        // if (item.data.view_name != undefined) {
        //     ViewManager.Inst().OpenView(item.data.view_name)
        // }
        // this.select_index = item.data.seq
        this.item_data = item
        // this.select_name = item.data.view_name
        this.select_index = item.data.mod_key;
        // this.FlushChooseView()
        this.OpenModView(item.data.view_name)

    }
    // private FlushChooseView(){
    //     if (this.select_index == Mod.MoreServer.CommodityGuild) {
    //         this.FlushCommodityGuild()
    //     }else if (this.select_index == Mod.MoreServer.CaveLoot){
    //         this.FlushCaveLoot()
    //     }else if (this.select_index == Mod.MoreServer.WeekendRecharge){
    //         this.FlushWeekendRechargeFund()
    //     }else if (this.select_index == Mod.MoreServer.BoxManor){
    //         this.FlushBoxManor()
    //     }

    //     if (this.select_index == Mod.MoreServer.CaveLoot){
    //         this.viewNode.CaveLootView.StopEffectShow()
    //     }
    // }

    // public addExtraCompent(extra_compent: fgui.GComponent) {
    //     if (!this.extra_compent) {
    //         this.extra_compent = new BoxManorView;
    //         this.extra_compent.height = 1500;
    //         this.extra_compent.width = 800;
    //         this.addChildAt(this.extra_compent, 1);
    //         this.extra_compent.center();
    //     }
    //     this.extra_compent.addChildAt(extra_compent, 0);
    // }

    private removeExtraCompent() {
        if (this.viewNode.dot)
            this.viewNode.dot.removeChildren();
    }

    private OpenModView(view_name: string) {
        // this.removeExtraCompent()
        // 载包未完成不启动
        if (ExtraPack.Inst().CheckIsLoading(view_name)) { return }

        if (this.Panel[view_name] == null) {
            let view: any = fgui.UIPackage.createObject("MoreServer", view_name).asCom
            this.viewNode.dot.addChild(view)
            this.Panel[view_name] = view
            this.changeView(view_name)
            if (view["Init"]) {
                view.Init()
            }

        } else {
            this.changeView(view_name)
        }

        if (view_name == "CaveLootMain" && this.Panel[view_name]) {
            this.Panel[view_name].StopEffectShow()
        }

    }

    private changeView(view_name: string) {
        for (var c_index in this.activity_list_bei) {
            let flag = this.activity_list_bei[c_index].view_name == view_name
            if (this.Panel[this.activity_list_bei[c_index].view_name] != null) {
                this.Panel[this.activity_list_bei[c_index].view_name].visible = flag
            }
        }
        this.activity_list_bei = this.activity_list

    }

}



export class OpenServeractivityItem extends fgui.GButton {
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
        // let red_num = ModManger.TabMod(data.mod_key)
        let red_num = RemindCtrl.Inst().GetRemindNum(data.mod_key)
        this.viewNode.RedPoint.SetNum(red_num)
        UH.SpriteName(this.viewNode.icon, "MoreServer", data.sprite);

    }
}

export class ItemAddName extends fgui.GComponent {
    private viewNode = {
        NameB: <fgui.GTextField>null,
        NameS: <fgui.GTextField>null,
        Cell: <ItemCell>null
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.viewNode.Cell.SetData(Item.Create(data.item, { is_num: true, is_gray: data.is_gray }));
        let name = Item.GetName(data.item.item_id)
        let len = name.length
        this.viewNode.NameB.visible = len <= 5
        this.viewNode.NameS.visible = len > 5

        UH.SetText(this.viewNode.NameB, name)
        UH.SetText(this.viewNode.NameS, name)
    }
}


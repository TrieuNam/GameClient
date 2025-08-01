import { Mod } from 'modules/common/ModuleDefine';
import { LogError } from "core/Debugger";
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, viewRegcfg } from 'modules/common/BaseView';
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { OpenServerBoxOpen, OpenServerBoxOpenBoxProgress, OpenServerBoxOpenCell } from "./OpenServerBoxOpen";
import { OpenServerNeoServer, OpenServerNeoServerCell } from "./OpenServerNeoServer";
import { OpenServerNeoShop, OpenServerNeoShopCell } from "./OpenServerNeoShop";
import { OpenServerSevenDays, OpenServerSevenDaysCell, OpenServerSevenDaysDCell } from "./OpenServerSevenDays";
import { OpenServerData } from "./OpenServerData";
import { Currency } from "modules/extends/Currency";
import { CommonId } from "modules/common/CommonEnum";
import { RedPoint } from "modules/extends/RedPoint";
import { OpenServerPanelCache } from "./OpenServerPanelCache";

@BaseView.registView
export class OpenServerView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "OpenServerAct",
        ViewName: "OpenServerView",
        LayerType: ViewLayer.Buttom,
    };

    private Controller: fgui.Controller;
    protected viewNode = {
        BtnReturn: <fgui.GButton>null,
        // ex_Seven:<OpenServerSevenDays>null,
        // ex_BoxOpen:<OpenServerBoxOpen>null,
        // ex_NeoServer:<OpenServerNeoServer>null,
        // ex_NeoShop:<OpenServerNeoShop>null,
        total: <OpenServerTotal>null,
        // btn_list:<fgui.GList>null,
        PanelCache: <OpenServerPanelCache>null,
        Btn0: <OpenServerBtnTotalClick>null,
        Btn1: <OpenServerBtnTotalClick>null,
        Btn2: <OpenServerBtnTotalClick>null,
        Btn3: <OpenServerBtnTotalClick>null,
    }

    protected extendsCfg = [
        { ResName: "BtnTotalClick", ExtendsClass: OpenServerBtnTotalClick },

        { ResName: "ex_SevenDays", ExtendsClass: OpenServerSevenDays },
        { ResName: "ex_BoxOpen", ExtendsClass: OpenServerBoxOpen },
        { ResName: "ex_NeoServer", ExtendsClass: OpenServerNeoServer },
        { ResName: "ex_NeoShop", ExtendsClass: OpenServerNeoShop },

        { ResName: "BoxOpenCell", ExtendsClass: OpenServerBoxOpenCell },
        { ResName: "NeoServerCell", ExtendsClass: OpenServerNeoServerCell },

        { ResName: "TopTotal", ExtendsClass: OpenServerTotal },
        { ResName: "BoxProgress", ExtendsClass: OpenServerBoxOpenBoxProgress },

        { ResName: "SevenDaysCell", ExtendsClass: OpenServerSevenDaysCell },
        { ResName: "SevenDaysDCell", ExtendsClass: OpenServerSevenDaysDCell },

        { ResName: "NeoShopCell", ExtendsClass: OpenServerNeoShopCell },

        { ResName: "OpenPanelCache", ExtendsClass: OpenServerPanelCache },

    ];

    page_index: number = 0;

    InitData(param?: any) {
        this.Controller = this.view.getController("control");

        this.Controller.onChanged(this.OnSelectChange.bind(this));
        this.viewNode.BtnReturn.onClick(this.CloseView.bind(this));

        this.AddSmartDataCare(OpenServerData.Inst().flush_info, this.flushSevenDays.bind(this), "sevendays_needflush");
        this.AddSmartDataCare(OpenServerData.Inst().flush_info, this.flushBoxOpen.bind(this), "boxopen_needflush");
        this.AddSmartDataCare(OpenServerData.Inst().flush_info, this.flushNeoServer.bind(this), "neoserver_needflush");
        this.AddSmartDataCare(OpenServerData.Inst().flush_info, this.flushNeoShop.bind(this), "neoshop_needflush");

        this.AddSmartDataCare(OpenServerData.Inst().flush_info, this.onFlushPaneInfo.bind(this), "sevendays_needflush");
        this.AddSmartDataCare(OpenServerData.Inst().flush_info, this.onFlushPaneInfo.bind(this), "boxopen_needflush");

        // this.viewNode.btn_list.on(fgui.Event.CLICK_ITEM,this.OnClickItem,this);

        // this.viewNode.Btn0.onClick(this.OnClickItem.bind(this));
        // this.viewNode.Btn1.onClick(this.OnClickItem.bind(this));
        // this.viewNode.Btn2.onClick(this.OnClickItem.bind(this));
        // this.viewNode.Btn3.onClick(this.OnClickItem.bind(this));

        // this.flushSevenDays()
        // this.flushBoxOpen()
        // this.flushNeoServer()
        // this.flushNeoShop()
        // LogError("?pool?",this.viewNode.btn_list.itemPool)
        this.onFlushPaneInfo()

        if (param && param.modkey) {
            if(param.modkey > Mod.OpenServer.View){
                this.page_index = param.modkey % 10 - 1;
            }
        }

    }

    OpenCallBack() {

        this.InitPanelCache()
    }

    private InitPanelCache() {

        this.Controller.selectedIndex = this.page_index
        // this.viewNode.btn_list.selectedIndex = 0
        this.viewNode.PanelCache.InitPanel(this.page_index)
        this.OnSelectChange();
    }

    private onFlushPaneInfo() {
        let item_base = OpenServerData.Inst().GetOpenServerBase()
        // this.viewNode.btn_list.SetData(item_base)
        for (let i = 0; i < 4; i++) {
            (this.viewNode as any)["Btn" + i].SetData(item_base[i])
        }
    }

    private OnClickItem(item: OpenServerBtnTotalClick) {
        // LogError("?clcxik! item !",item)
        // this.viewNode.control.setSelectedIndex(item.data.index)

    }

    private OnSelectChange() {
        this.viewNode.PanelCache.ChangePanel(this.Controller.selectedIndex)
    }

    private flushSevenDays() {
        if (this.Controller.selectedIndex != 0) { return }
        this.viewNode.PanelCache.flushinfo(0)
        // this.viewNode.ex_Seven.flushinfo()
    }

    private flushBoxOpen() {
        if (this.Controller.selectedIndex != 1) { return }
        this.viewNode.PanelCache.flushinfo(1)
        // this.viewNode.ex_BoxOpen.flushinfo()
    }

    private flushNeoServer() {
        if (this.Controller.selectedIndex != 2) { return }
        this.viewNode.PanelCache.flushinfo(2)
        // this.viewNode.ex_NeoServer.flushinfo()
    }

    private flushNeoShop() {
        if (this.Controller.selectedIndex != 3) { return }
        this.viewNode.PanelCache.flushinfo(3)
        // this.viewNode.ex_NeoShop.flushinfo()
    }

    private CloseView() {
        ViewManager.Inst().CloseView(OpenServerView)
    }
}

export class OpenServerTotal extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        Currency2: <Currency>null,
        Currency3: <Currency>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.Currency2.SetCurrencyId(CommonId.Diamond);
        this.viewNode.Currency3.SetCurrencyId(CommonId.Gold);

    }
}

export class OpenServerBtnTotalClick extends fgui.GButton {
    private viewNode = {
        redPoint: <RedPoint>null,
        title: <fgui.GLabel>null,
        selectedtitle: <fgui.GLabel>null,
        icon: <fgui.GLoader>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) { return }
        this.data = data
        this.viewNode.redPoint.SetNum(data.show_red);
        UH.SetText(this.viewNode.title, data.name)
        UH.SetText(this.viewNode.selectedtitle, data.name)
        UH.SpriteName(this.viewNode.icon, "OpenServerAct", data.icon)
    }
}


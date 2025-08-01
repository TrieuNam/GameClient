import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { BasePanel } from "modules/common/BasePanel";
import { HelpView } from "modules/common_help/CommonHelpView";
// import { MoneyType } from "modules/common/CommonEnum";
import { BaseBoard } from "modules/extends/BaseBoard";
import { RedPoint } from "modules/extends/RedPoint";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { RemindCtrl } from "modules/remind/RemindCtrl";
// import { BaseBoard } from "./BaseBoard";
// import { Currency } from "./Currency";
// import { RedPoint } from "./RedPoint";


export type tabberInfo = {
    panel: any,                //panel class
    viewName: string,          //View资源名字 
    titleName: string,         //panel name
    modKey?: number,            //panel modkey
    isRemind?: boolean,        //是否添加modeKey红点组
    NotShow?: boolean,        //是否显示地板背景图
    index?: number,             //用于区分可不填
    param?: any,                //任意用于传递
    guide?: string,               //用于指引
    helpTips?: number,
    tileShowName?: string,
    btnCloseShow?: boolean,
    check_func?: Function,
    click_func?: Function,
}


export class CommonBoard5 extends BaseBoard {
    private tabberCfg: tabberInfo[];
    private tabberComponent: Map<string, BasePanel> = new Map<string, BasePanel>();
    private selectIndex: number;
    private hideTabbar: boolean;
    private extra_compent: fgui.GComponent;

    protected viewNode = {
        TitleShow: <fgui.GTextField>null,
        BtnClose: <fgui.GButton>null,
        TabList: <fgui.GList>null,
        BtnHelp: <fgui.GButton>null,
    };


    public constructor() {
        super();
    }

    protected onConstruct() {
        let self = this;
        super.onConstruct();
        self.viewNode.BtnClose.onClick(self.onClickClose, self)
        self.viewNode.BtnHelp.onClick(self.onClickHelp, self)
    }

    public SetData() {
        let self = this;
        self.tabberCfg = self.parentView.BoardCfg().TabberCfg;
        self.hideTabbar = self.parentView.BoardCfg().HideTabbar ?? false;
        self.setTabber();
    }

    public SelectTabbar(modkey: number) {
        let self = this;
        self.viewNode.TabList.selectedIndex = self.getTabIndexByModKey(modkey);
        self.selectIndex = self.viewNode.TabList.selectedIndex;
        self.createObjView();
    }

    private getTabIndexByModKey(modkey: number) {
        let self = this;
        let tIndex = 0;
        let cfg = self.checkTabberCfg();
        for (let index = 0; index < cfg.length; index++) {
            const element = cfg[index];
            if (element.modKey === modkey) {
                tIndex = index;
                break;
            }
        }
        return tIndex
    }

    public addExtraCompent(extra_compent: fgui.GComponent) {
        if (!this.extra_compent) {
            this.extra_compent = new fgui.GComponent();
            this.extra_compent.height = 1500;
            this.extra_compent.width = 800;
            this.addChildAt(this.extra_compent, 1);
            this.extra_compent.center();
        }
        this.extra_compent.addChildAt(extra_compent, 0);
    }

    private removeExtraCompent() {
        if (this.extra_compent)
            this.extra_compent.removeChildren();
    }

    private onClickClose() {
        ViewManager.Inst().CloseView(this.parentView);
    }

    private onClickHelp() {
        let cfg = this.checkTabberCfg();
        var tabberIndex = this.selectIndex;
        var currentCfg = cfg[tabberIndex];
        if (currentCfg.helpTips != undefined) {
            ViewManager.Inst().OpenView(HelpView, currentCfg.helpTips);
        }
    }

    private setName(value: string) {
        this.viewNode.TitleShow.text = value;
    }

    private setTabber() {
        let self = this;
        let cfg = self.checkTabberCfg();
        let showTabberCount = cfg.length;
        self.viewNode.TabList.setVirtual();
        self.viewNode.TabList.on(fgui.Event.CLICK_ITEM, self.onClickListItem, self);
        self.viewNode.TabList.itemRenderer = self.renderListItem.bind(self);
        self.viewNode.TabList.numItems = showTabberCount;
        let sIndex = self.getOpenIndex(cfg);
        self.viewNode.TabList.selectedIndex = sIndex;
        self.selectIndex = sIndex;
        self.createObjView();
        self.viewNode.TabList.visible = !self.hideTabbar;
        if (self.tabberCfg.length < 4) {
            self.viewNode.TabList.scrollPane.touchEffect = false;
        }
    }

    //检查标签页是否开启
    private checkTabberCfg() {
        let list = []
        for (let element of this.tabberCfg) {
            if (undefined == element.modKey || FunOpen.Inst().GetFunIsOpen(element.modKey).is_open) {
                list.push(element)
            }
        }
        return list
    }

    // //获取界面打开时Index
    private getOpenIndex(cfg: tabberInfo[]) {
        let self = this;
        let sIndex = 0;
        let params = self.parentView.ViewParams();
        if (params) {
            for (let index = 0; index < cfg.length; index++) {
                const element = cfg[index];
                if (element.modKey === params.modkey) {
                    sIndex = index;
                    break
                }

            }
        }
        return sIndex;
    }

    private onClickListItem(tabber: CommonBoard5Tab) {
        let self = this;
        self.selectIndex = self.viewNode.TabList.selectedIndex;
        self.createObjView();
    }


    private renderListItem(index: number, tabber: CommonBoard5Tab) {
        let cfg = this.checkTabberCfg();
        tabber.SetData(cfg[index]);
    }

    private createObjView() {
        let self = this;
        let cfg = self.checkTabberCfg();
        var tabberIndex = self.selectIndex;
        var currentCfg = cfg[tabberIndex];
        if (!currentCfg) {
            return
        }
        if (currentCfg.check_func && currentCfg.check_func()) {
            self.viewNode.TabList.selectedIndex = 0;
            return
        }
        currentCfg.click_func && currentCfg.click_func()
        if (!currentCfg.panel) {
            return
        }
        this.removeExtraCompent();
        if (self.tabberComponent.has(currentCfg.viewName) === false) {
            let pName = this.parentView.ViewRegCfg().UIPackName;
            let vName = currentCfg.viewName;
            var panel = new currentCfg.panel();
            panel.InitExtends(pName);
            let view: fgui.GComponent = fgui.UIPackage.createObject(pName, vName).asCom;
            //view.center();
            view.visible = false;
            let panels: fgui.GComponent = self.parentView.view.getChild("panels")
            if (panels && panels.addChild) {
                panels.addChild(view);
            } else {
                self.parentView.view.addChild(view);
            }
            self.parentView.AddComponent(view);
            panel.view = view;
            panel.parentView = self.parentView;
            panel.Init();
            self.tabberComponent.set(currentCfg.viewName, panel);
        }
        self.viewNode.BtnHelp.visible = undefined != currentCfg.helpTips
        self.viewNode.BtnClose.visible = undefined == currentCfg.btnCloseShow ? true : currentCfg.btnCloseShow
        self.setPanelVisible(currentCfg.viewName);
        self.setName(currentCfg.tileShowName ?? currentCfg.titleName);
    }

    private setPanelVisible(viewName: string) {
        this.tabberComponent.forEach((value, key) => {
            if (key === viewName) {
                value.view.visible = true;
                value.OnVisible();
            } else {
                value.view.visible = false;
                value.OnUnVisible();
            }
        })
    }


    protected onDestroy() {
        this.tabberComponent.forEach((value, key) => {
            value.Close();
        })
    }
}

//============================MailItem============================
export class CommonBoard5Tab extends fgui.GButton {
    _data: tabberInfo;
    private viewNode = {
        TitleUp: <fgui.GTextField>null,
        TitleDown: <fgui.GTextField>null,
        redPoint: <RedPoint>null,
    };

    private handleCollector: HandleCollector;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
    }

    public SetData(info: tabberInfo) {
        this._data = info
        let self = this;
        let size = 28;
        if (info.titleName.length > 2) {
            size = 28;
        }
        self.viewNode.TitleUp.fontSize = size;
        self.viewNode.TitleDown.fontSize = size;
        self.viewNode.TitleUp.text = info.titleName;
        self.viewNode.TitleDown.text = info.titleName;

        if (info.isRemind) {
            let group = ModManger.TabMod(info.modKey);
            self.handleCollector = HandleCollector.Create();
            self.handleCollector.Add(RemindGroupMonitor.Create(group, self.freshRedPoint.bind(self, group)));
        }
        if (info.guide) {
            GuideCtrl.Inst().AddGuideUi(info.guide, this);
        }
    }

    private freshRedPoint(group: any) {
        this.viewNode.redPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
    }

    protected onDestroy(): void {
        super.onDestroy();
        let self = this;
        if (this.handleCollector) {
            HandleCollector.Destory(self.handleCollector);
            self.handleCollector = null;
        }
        if (this._data && this._data.guide) {
            GuideCtrl.Inst().ClearGuideUi(this._data.guide);
        }
    }

}
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { BasePanel } from "modules/common/BasePanel";
// import { MoneyType } from "modules/common/CommonEnum";
import { BaseBoard } from "modules/extends/BaseBoard";
import { RedPoint } from "modules/extends/RedPoint";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { tabberInfo } from "./CommonBoard5";


export class CommonBoard6 extends BaseBoard {
    private tabberCfg: tabberInfo[];
    private tabberComponent: Map<string, BasePanel> = new Map<string, BasePanel>();
    private selectIndex: number;
    private hideTabbar: boolean;

    protected viewNode = {
        // TitleShow: <fgui.GTextField>null,
        BtnClose: <fgui.GButton>null,
        TabList: <fgui.GList>null,
    };


    public constructor() {
        super();
    }

    protected onConstruct() {
        let self = this;
        super.onConstruct();
        self.viewNode.BtnClose.onClick(self.onClickClose, self)
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


    private onClickClose() {
        ViewManager.Inst().CloseView(this.parentView);
    }

    private setName(value: string) {
        // this.viewNode.TitleShow.text = value;
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
        return this.tabberCfg
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

    private onClickListItem(tabber: CommonBoard6Tab) {
        let self = this;
        self.selectIndex = self.viewNode.TabList.selectedIndex;
        self.createObjView();
    }


    private renderListItem(index: number, tabber: CommonBoard6Tab) {
        let cfg = this.checkTabberCfg();
        tabber.SetData(cfg[index]);
    }

    private createObjView() {
        let self = this;
        let cfg = self.checkTabberCfg();
        var tabberIndex = self.selectIndex;
        var currentCfg = cfg[tabberIndex];
        if (self.tabberComponent.has(currentCfg.viewName) === false) {
            let pName = this.parentView.ViewRegCfg().UIPackName;
            let vName = currentCfg.viewName;
            var panel = new currentCfg.panel();
            panel.InitExtends(pName);
            let view: fgui.GComponent = fgui.UIPackage.createObject(pName, vName).asCom;
            //view.center();
            view.visible = false;
            self.parentView.view.addChild(view);
            self.parentView.AddComponent(view);
            panel.view = view;
            panel.parentView = self.parentView;
            panel.Init();
            self.tabberComponent.set(currentCfg.viewName, panel);
        }
        self.setPanelVisible(currentCfg.viewName);
        self.setName(self.tabberCfg[tabberIndex].titleName);
    }

    private setPanelVisible(viewName: string) {
        this.tabberComponent.forEach((value, key) => {
            if (key === viewName) {
                value.view.visible = true;
            } else {
                value.view.visible = false;
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
export class CommonBoard6Tab extends fgui.GButton {
    private viewNode = {
        TitleUp: <fgui.GTextField>null,
        TitleDown: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
    };

    private handleCollector: HandleCollector;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
    }

    public SetData(info: tabberInfo) {
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
    }

    private freshRedPoint(group: any) {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
    }

    protected onDestroy(): void {
        super.onDestroy();
        let self = this;
        if (this.handleCollector) {
            HandleCollector.Destory(self.handleCollector);
            self.handleCollector = null;
        }
    }

}
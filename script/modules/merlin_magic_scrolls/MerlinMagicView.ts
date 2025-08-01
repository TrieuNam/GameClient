import { BaseView, ViewLayer, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CollectionRoom, CollectionRoomItem, CollectionRoomTabItem } from "./CollectionRoom";
import { LargeLibrary } from "./LargeLibrary";
import { PokedexRoom, PokedexRoomItem } from "./PokedexRoom";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { UH } from "../../helpers/UIHelper";
import { Language } from "modules/common/Language";
import { BasePanel } from "modules/common/BasePanel";

@BaseView.registView
export class MerlinMagicView extends BaseView {
    private tabberComponent: Map<string, BasePanel> = new Map<string, BasePanel>();
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MerlinMagic",
        ViewName: "MerlinMagicView",
        LayerType: ViewLayer.Buttom,
    };
    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        TabList: <fgui.GList>null,
        PanelNode: <fgui.GButton>null,
    };
    protected extendsCfg = [
        { ResName: "TagItem", ExtendsClass: MerlinMagicTagItem },
        { ResName: "CollectionRoomItem", ExtendsClass: CollectionRoomItem },
        { ResName: "CollectionRoomBoardItem", ExtendsClass: CollectionRoomBoardItem },
        { ResName: "CollectionRoomTabItem", ExtendsClass: CollectionRoomTabItem },
        { ResName: "MerlinMagicItem", ExtendsClass: MerlinMagicItem },
        { ResName: "PokedexRoomItem", ExtendsClass: PokedexRoomItem },
    ];
    protected tagCfg = [
        { index: 0, panel: CollectionRoom, viewName: "CollectionRoom" },
        { index: 1, panel: PokedexRoom, viewName: "PokedexRoom" },
        { index: 2, panel: LargeLibrary, viewName: "LargeLibrary" },
    ]
    InitData(param: any): void {
        this.viewNode.BtnClose.onClick(this.OnClickClose.bind(this))
    }
    OnClickClose() {
        ViewManager.Inst().CloseView(MerlinMagicView)
    }
    InitUI(): void {
        this.viewNode.TabList.SetData(this.tagCfg)
        this.viewNode.TabList.on(fgui.Event.CLICK_ITEM, this.OnClickItem, this)
        //this.viewNode.TabList.onClick(this.OnClickItem.bind(this))
        this.viewNode.TabList.OnSelectedItem(0)
    }
    OnClickItem() {
        console.log(this.viewNode.TabList.selectedIndex);
        this.createObjView()
    }
    private createObjView() {
        let data = this.tagCfg[this.viewNode.TabList.selectedIndex]
        if (this.tabberComponent.has(data.viewName) === false) {
            let pName = this.ViewRegCfg().UIPackName;
            let vName = data.viewName;
            var panel = new data.panel();
            panel.InitExtends(pName);
            let view: fgui.GComponent = fgui.UIPackage.createObject(pName, vName).asCom;
            view.visible = false;
            //this.view.addChild(view);
            this.viewNode.PanelNode.addChild(view)
            this.AddComponent(view);
            panel.view = view;
            panel.parentView = this;
            panel.Init();
            this.tabberComponent.set(data.viewName, panel);
        }
        this.setPanelVisible(data.viewName);
        //this.setName(this.tag[tabberIndex].titleName);
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

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {

    }

    CloseCallBack(): void {
        this.tabberComponent.forEach((value, key) => {
            value.Close();
        })
    }

    WindowSizeChange() {

    }
}

class MerlinMagicTagItem extends BaseItemGB {
    IconSp = [["TuBiao-ShouCangShi1", "TuBiao-ShouCangShi2"], ["TuBiao-TuJian1", "TuBiao-TuJian2"], ["TuBiao-DaShuKu1", "TuBiao-DaShuKu2"]]
    protected viewNode = {
        icon1: <fgui.GLoader>null,
        icon2: <fgui.GLoader>null,
        Name1: <fgui.GTextField>null,
        Name2: <fgui.GTextField>null,
    };
    protected _data: any = null;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this._data = data;
        UH.SpriteName(this.viewNode.icon1, "MerlinMagic", this.IconSp[data.index][0])
        UH.SpriteName(this.viewNode.icon2, "MerlinMagic", this.IconSp[data.index][1])
        UH.SetText(this.viewNode.Name1, Language.MerlinMagic.Title[data.index])
        UH.SetText(this.viewNode.Name2, Language.MerlinMagic.Title[data.index])
    }
    public GetData() {
        return this._data;
    }
}

class CollectionRoomBoardItem extends BaseItemGB {
}

export class MerlinMagicItem extends BaseItem {
    protected viewNode = {};
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this._data = data;
    }
    public GetData() {
        return this._data;
    }
}
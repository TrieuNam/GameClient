import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView } from "modules/common/BaseView";

export class BaseBoard extends fgui.GComponent {
    protected parentView: BaseView;
    protected viewNode = {};

    public constructor() {
        super();
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode,this);
    }

    public SetParentView(view: BaseView) {
        let self = this;
        self.parentView = view;
        self.center();
        self.parentView.AddComponent(self);
    }

    public SetData(){
        
    }

    public WindowSizeChange(){
        
    }

    public SelectTabbar(modkey: number){
        
    }
}
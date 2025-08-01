import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";

export class BaseItem extends fgui.GComponent {
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

export class BaseItemGB extends fgui.GButton {
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

export class BaseItemGL extends fgui.GLabel {
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

export class BaseItemGP extends fgui.GProgressBar {
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
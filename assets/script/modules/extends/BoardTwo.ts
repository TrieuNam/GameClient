import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Vec2 } from "cc";
import { BaseBoard } from "./BaseBoard";

export class BoardTwo extends BaseBoard {
    protected viewNode = {
        TitleName: <fgui.GTextField> null,
        BtnClose: <fgui.GButton> null,
    };
    public SetData() {
        this.SetName(this.parentView.BoardCfg().BoardTitle ?? "");
        this.SetRect(this.parentView.BoardCfg().Vect);
        this.viewNode.BtnClose.onClick(this.OnClickReturn,this);
    }
    public SetName(value: string) {
        this.viewNode.TitleName.text = value;
    }
    public SetRect(rect: Vec2) {
        if (rect != null){
            this.setSize(rect.x,rect.y);
        }
    }
    private OnClickReturn(){
        ViewManager.Inst().CloseView(this.parentView);
    }
}
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";

export class RedPoint extends fgui.GComponent {
    private num = 0;
    viewNode = {
        GpPoint: <fgui.GGroup>null,
    }

    protected onConstruct(): void {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetNum(num: number) {
        this.num = num;
        this.viewNode.GpPoint.visible = this.num > 0;
    }
}
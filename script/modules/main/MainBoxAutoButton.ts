import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
export class MainBoxAutoButton extends fgui.GButton {
    private AutoAnim: fgui.Transition;

    private viewNode = {
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }

    public InitData() {
        this.AutoAnim = this.getTransition("AutoAnim");
    }
    public PlayAuto() {
        this.AutoAnim.play();
        // console.log("播放齿轮动效")
    }

    public StopAuto() {
        this.AutoAnim.stop();
        // console.log("停止齿轮")
    }
}

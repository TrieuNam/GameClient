import { CfgGuideStep } from "config/CfgGuide";
import { LogError } from "core/Debugger";
import { ViewManager } from "manager/ViewManager";
import { GuideBase } from "./GuideBase";

export class GuideOpenView extends GuideBase {

    Start(step_cfg: CfgGuideStep, func: () => void) {
        this.CheckGuideView()

        //LogError(step_cfg);
        //ViewManager.Inst().OpenView()
        //LogError("获取指引界面" + (this.view == null));
        //LogError(this.view.view.name);

        func();
    }

    Continue(): void {

    }
    Finish(): void {

    }
}
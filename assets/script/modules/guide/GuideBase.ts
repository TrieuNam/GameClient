import { CfgGuideStep } from "config/CfgGuide";
import { GuideCtrl } from "./GuideCtrl";
import { GuideData } from "./GuideData";
import { GuideView } from "./GuideView";

export class GuideBase {
    protected ctrl: GuideCtrl = null;
    protected view: GuideView = null;

    CheckGuideView() {
        if (!this.view) {
            this.view = GuideData.Inst().GetGuideView();
        }
    }

    Start(step_cfg: CfgGuideStep, func: () => void): void {
        func();
    }

    Continue(id: number): void {

    }

    Finish(): void {

    }

}
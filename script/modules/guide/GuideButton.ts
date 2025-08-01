import { CfgGuideStep } from "config/CfgGuide";
import { GObject, GRoot } from "fairygui-cc";
import { Timer } from "modules/time/Timer";
import { GuideBase } from "./GuideBase";
import { GuideCtrl } from "./GuideCtrl";

export class GuideButton extends GuideBase {
    id: number;
    target: GObject;
    call_back: Function;
    handle: any = null;
    check_count: number = 0
    Start(step_cfg: CfgGuideStep, func: (id?: number) => void): void {
        this.CheckGuideView()
        this.call_back = func;
        this.CheckButton()
    }
    CheckButton() {
        let step_cfg = GuideCtrl.Inst().CurStepCfg()
        if (!step_cfg)
            return;

        if (!this.handle) {
            Timer.Inst().CancelTimer(this.handle)
            this.handle = null
        }
        this.target = null;
        Timer.Inst().CancelTimer(this.handle)
        this.check_count = 0
        this.handle = Timer.Inst().AddRunFrameTimer(this.GetGuideUi.bind(this), 1, 800, false)//240)
    }

    GetGuideUi() {
        let step_cfg = GuideCtrl.Inst().CurStepCfg()
        if (!step_cfg) return;
        let ui_key = step_cfg.step_param_1
        this.id = step_cfg.step_id;
        this.target = GuideCtrl.Inst().GetGuideUi(ui_key)
        if (this.target != null) {
            //做一个延迟才行对于列表的item会对不上
            this.check_count = this.check_count + 1
            if (this.check_count > 20) {
                Timer.Inst().CancelTimer(this.handle)
            } else {
                return
            }
            //console.log("获取到目标对象", ui_key)
            let pos = this.target.localToGlobal();
            //这里涉及到分辨率变化
            pos.x = pos.x - (200 - this.target.width / 2)
            pos.y = pos.y - (200 - this.target.height / 2)
            pos.y = pos.y - (GRoot.inst.height - 1500)
            this.view && this.view.Show(pos);
        }
    }

    Continue(id: number): void {
        this.call_back ? this.call_back(id) : null;
        this.Finish()
    }

    Finish(): void {
        this.target = null;
        this.check_count = 0
    }

    OnClick() {
        let id = this.id;
        if (this.target == null || this.target.node == null) {
            GuideCtrl.Inst().ForceStop()
            console.log("指引操作步骤出错, 指引按钮被销毁过");
            return
        }
        GRoot.inst.inputProcessor.simulateClick(this.target);
        this.Continue(id)
    }
}
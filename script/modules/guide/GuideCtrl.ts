import { log, logID } from 'cc';
import { CfgGuideData, CfgGuideConfig, CfgGuideStep } from 'config/CfgGuide';
import { LogError } from 'core/Debugger';
import { GObject } from 'fairygui-cc';
import { ViewManager } from 'manager/ViewManager';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { BaseView } from 'modules/common/BaseView';
import { GuideButton } from './GuideButton';
import { StepType } from './GuideCfg';
import { GuideData } from './GuideData';
import { GuideOpenView } from './GuideOpenView';
import { GuideView } from './GuideView';


export class GuideCtrl extends BaseCtrl {

    data: GuideData = GuideData.Inst();
    guide_view: GuideView = null;
    guide_button_list: { [ui_key: string]: GObject };
    cur_guide: CfgGuideConfig;
    step_cfg: CfgGuideStep;
    step: number = 0;
    total_step: number = 0;
    step_list: CfgGuideStep[];
    click_button: GuideButton;
    open_view: GuideOpenView;
    _continue = (id?: number) => {
        this.Continue(id);
    }


    initCtrl() {
        //sLogError("init Guide ctrl");
        if (!this.click_button)
            this.click_button = new GuideButton();

        if (!this.open_view)
            this.open_view = new GuideOpenView();

        // this.Start(0);
        // this.Start(1);
        //注意调用顺序问题
    }

    MsgCfg(): regMsg[] {
        return [
            //{ msgType: PB_SCLoginToAccount, func: this.recvLoginResult }
        ]
    }
    public SetGuideView(view: GuideView) {
        this.guide_view = view
    }
    public AddGuideUi(ui_key: string, ui_obj: GObject) {
        if (!this.guide_button_list) {
            this.guide_button_list = {}
        }
        this.guide_button_list[ui_key] = ui_obj;
        //this.data.GetStepCfg(1);
        return ui_key;
    }
    //手指位置刷新
    public FingerPosRefresh() {
        this.click_button.GetGuideUi();
    }
    public ClearGuideUi(ui_key: string) {
        this.guide_button_list[ui_key] = null;
    }

    public GetGuideUi(ui_key: string) {
        return this.guide_button_list[ui_key]
    }

    public Start(id: number) {
        //console.log("start ",id);

        /* if (!ViewManager.Inst().IsOpen(GuideView)){
            ViewManager.Inst().OpenView(GuideView);
        } */
        //console.log("开始指引", id)
        if (this.cur_guide != null && this.cur_guide.id == id && this.step == 1) {
            return;
        }
        let guide_cfg = this.data.GetGuideCfg(id);
        this.cur_guide = guide_cfg;
        if (this.cur_guide == null) {
            //console.log("指引" + id + "不存在");
            return;
        }
        this.step_list = this.data.GetStepCfg(id);
        //LogError(this.step_list)
        this.step = 0;
        this.total_step = this.step_list.length;
        this.Continue();
    }
    Continue(id?: number) {
        //console.log("Continue " + this.step);
        if (this.step >= this.total_step) {
            this.Stop();
        } else {
            if (this.step_cfg && id && id != this.step_cfg.step_id) {
                return
            }
            this.step = this.step + 1;
            this.step_cfg = this.step_list[this.step - 1];
            this.Execute();
        }
    }
    Execute() {
        //console.log("Execute " + this.step_cfg.step_type);
        if (this.step_cfg.step_type == StepType.AutoOpenView) {
            //箭头函数能保存函数创建时的this值,而不是调用时的值
            // this.open_view.Start(() => {
            //     this.Continue();
            // });
            this.open_view.Start(this.step_cfg, this._continue);
            //this.open_view.Start(this.Continue); Error
        } else if (this.step_cfg.step_type == StepType.ClickButton) {
            // this.click_button.Start(() => {
            //     this.Continue();
            // });
            this.click_button.Start(this.step_cfg, this._continue);
        } else {
            LogError("Unknown step type " + this.step_cfg.step_type);
        }
    }

    Stop() {
        // if(this.cur_guide){
        //     console.error("Stop " + this.cur_guide.id);
        // }
        this.step = 0;
        this.total_step = 0;
        this.step_list = null;
        this.cur_guide = null;
    }
    ForceStop() {
        //隐藏界面后
        if (this.guide_view != null) {
            this.guide_view.Hide()
        }
        this.Stop();
    }

    CurGuide() {
        return this.cur_guide
    }

    CurStepCfg() {
        return this.step_cfg
    }

    /*
    private recvLoginResult(data: PB_SCLoginToAccount) {
        LoginData.Inst().resultData.result = data.result;
    }
    */

}
import { BaseView, boardCfg, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { Mod } from "modules/common/ModuleDefine";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { TrialTrialTowerPanel } from "./TrialTrialTowerPanel";

@BaseView.registView
export class TrialView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "Trial",
        ViewName: "TrialView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected boardCfg: boardCfg = {
        TabberCfg: [
            { panel: TrialTrialTowerPanel, viewName: "TrialTrialTowerPanel", titleName: Language.Trial.TabTrialTower, modKey: Mod.Trial.TrialTower, helpTips: 11 },
        ],
        HideTabbar: true,
    };
    CloseCallBack() {
        GuideCtrl.Inst().ForceStop()
    }
}
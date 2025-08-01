import { BaseView, boardCfg, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { Mod } from "modules/common/ModuleDefine";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { TrialGuMoTowerPanel } from "./TrialGuMoTowerPanel";

@BaseView.registView
export class GuMoView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "Trial",
        ViewName: "TrialView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected boardCfg: boardCfg = {
        TabberCfg: [
            { panel: TrialGuMoTowerPanel, viewName: "TrialGuMoTowerPanel", titleName: Language.Trial.TabGuMoTower, modKey: Mod.GuMo.View, guide: "TrialTabGuMo", helpTips: 10 },
        ],
        HideTabbar: true,
    };
    CloseCallBack() {
        GuideCtrl.Inst().ForceStop()
        ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.gumo);
    }
}
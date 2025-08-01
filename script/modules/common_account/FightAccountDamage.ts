import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CfgItem } from "config/CfgCommon";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BattleReportData } from "modules/battle/BattleData";
import { ItemCell } from "modules/extends/ItemCell";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { LogError } from "core/Debugger";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { TrialData } from "modules/trial/TrialData";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class FightAccountDamage extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "FightAccountDamage",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Actions: <fgui.GTextField>null,
        EffectShow: <UIEffectShow>null,
        Damage: <fgui.GTextField>null,
    }

    InitData(param: { rep: BattleReportData, reward_data: CfgItem[] }) {
        UH.SetText(this.viewNode.Actions, param.rep.total_round);
        UH.SetText(this.viewNode.Damage, param.rep.total_damage); 
        this.viewNode.EffectShow.PlayEff(4164051);
    }

    InitUI() {
    }

    CloseCallBack() {
        BattleCtrl.Inst().end();
    }
}
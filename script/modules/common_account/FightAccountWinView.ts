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
import { Timer } from "modules/time/Timer";
import { AdventureData } from "modules/adventure/AdventureData";
import { ViewManager } from "manager/ViewManager";
import { AdventureView } from "modules/adventure/AdventureView";

@BaseView.registView
export class FightAccountWinView extends BaseView {
    private timer_handle: any = null;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "FightAccountWinView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        ListReward: <fgui.GList>null,
        EffectShow: <UIEffectShow>null,
        GpStars: <fgui.GGroup>null,
        StarShow1: <UIEffectShow>null,
        StarShow2: <UIEffectShow>null,
        StarShow3: <UIEffectShow>null,
    }

    private reward_data: any[];
    InitData(param: { rep: BattleReportData, reward_data: CfgItem[] }) {
        this.viewNode.ListReward.visible = false
        this.viewNode.ListReward.itemRenderer = this.renderItem.bind(this);
        this.reward_data = Item.DefaultCreateListItem(param.reward_data, { is_gray: false, is_click: true, is_num: true, eff: -4164000 });
        this.viewNode.ListReward.numItems = this.reward_data.length;
        this.viewNode.EffectShow.PlayEff(4164051)
        let starsShow = false
        switch (param.rep.proto_report.battleModeType) {
            case ENUM_BATTLE.HERO_BATTLE_TYPE_GU_MO_PAGODA:
                starsShow = true;
                let stars = undefined != TrialData.Inst().FinishStarFunc ? TrialData.Inst().FinishStarFunc() : 0
                switch(stars){
                    case 1:
                        this.viewNode.StarShow1.PlayEff(4164057)
                        break
                    case 2:
                        this.viewNode.StarShow1.PlayEff(4164057)
                        this.viewNode.StarShow2.PlayEff(4164057)
                        break
                    case 3:
                        this.viewNode.StarShow1.PlayEff(4164057)
                        this.viewNode.StarShow2.PlayEff(4164057)
                        this.viewNode.StarShow3.PlayEff(4164057)
                        break
                }
                break;
            case ENUM_BATTLE.HERO_BATTLE_TYPE_MAIN_FB:
                if (AdventureData.Inst().is_close_view){
                    ViewManager.Inst().CloseView(AdventureView);
                }
                break;
        }
        this.viewNode.GpStars.visible = starsShow

        Timer.Inst().CancelTimer(this.timer_handle)
        this.timer_handle = Timer.Inst().AddRunFrameTimer(()=>{
            this.viewNode.ListReward.visible = true
        }, 3, 1, false)
    }

    InitUI() {
    }

    private renderItem(index: number, item: ItemCell) {
        let self = this;
        item.SetData(self.reward_data[index]);
    }

    CloseCallBack() {
        BattleCtrl.Inst().end();
        Timer.Inst().CancelTimer(this.timer_handle)
    }
}
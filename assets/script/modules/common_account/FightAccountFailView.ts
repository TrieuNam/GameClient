import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BattleData, BattleReportData } from "modules/battle/BattleData";
import { CfgItem } from "config/CfgCommon";
import { BaseItem } from "modules/common/BaseItem";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { AdventureData } from "modules/adventure/AdventureData";
import { AdventureView } from "modules/adventure/AdventureView";
@BaseView.registView
export class FightAccountFailView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "FightAccountFailView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "FightAccountFailCell", ExtendsClass: FightAccountFailCell },
    ];

    protected viewNode = {
        List: <fgui.GList>null,
        EffectShow: <UIEffectShow>null,
    }

    InitData(param: { rep: BattleReportData, reward_data: CfgItem[] }) {
        this.viewNode.List.setVirtual();
        let list_data = BattleData.Inst().GetLoseList();
        this.viewNode.List.SetData(list_data);
        this.viewNode.EffectShow.PlayEff(4164052);
        switch (param.rep.proto_report.battleModeType) {
            case ENUM_BATTLE.HERO_BATTLE_TYPE_MAIN_FB:
                if (AdventureData.Inst().is_close_view) {
                    ViewManager.Inst().CloseView(AdventureView);
                }
                break;
        }
    }

    InitUI() {
    }

    CloseCallBack() {
        BattleCtrl.Inst().end();
    }
}

export class FightAccountFailCell extends BaseItem {
    protected viewNode = {
        TxtName: <fgui.GTextField>null,
        BtnGoTo: <fgui.GButton>null,
        Icon: <fgui.GLoader>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGoTo.onClick(this.onGoTo.bind(this))
    }

    public SetData(data: any) {
        this._data = data;
        UH.SetText(this.viewNode.TxtName, data.show_txt)
        this.viewNode.BtnGoTo.visible = data.mod_key != 0 //&&mod_key的功能开启
        UH.SetIcon(this.viewNode.Icon, data.show_icon, ICON_TYPE.Enter);

        if(data.seq == 1){
            this.viewNode.Icon.setPosition(115,15);
        }
    }

    private onGoTo() {
        //前往按钮点击
        if (this._data) {
            if (this._data.mod_key) {
                ViewManager.Inst().OpenViewByKey(this._data.mod_key);
                ViewManager.Inst().CloseView(FightAccountFailView);
            }
        }
    }
}

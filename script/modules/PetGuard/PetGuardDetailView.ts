import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { UH } from "../../helpers/UIHelper";
import { PetGuardCtrl } from "./PetGuardCtrl";
import { PetGuardData } from "./PetGuardData";
import { RedPoint } from '../extends/RedPoint';
import { Language } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";

@BaseView.RegisterView
export class PetGuardDetailView extends BaseView {
    private send_level = 0
    private view_param:any 
    private gamepass = false
    protected viewRegcfg = {
        UIPackName: "PetGuardDetail",
        ViewName: "PetGuardDetailView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "RewardCell", ExtendsClass: PetGuardRewardCell },
        { ResName: "RuleCell", ExtendsClass: PetGuardRuleCell },
    ]
    protected viewNode = {
        title:<fgui.GLabel>null,
        BtnClose:<fgui.GButton>null,
        // LevelShow:<fgui.GLabel>null,
        ModelShow:<UIModelShow>null,
        ProgBar:<fgui.GProgressBar>null,
        Reward1:<PetGuardRewardCell>null,
        Reward2:<PetGuardRewardCell>null,
        Reward3:<PetGuardRewardCell>null,
        RuleList:<fgui.GList>null,
        BtnStart:<fgui.GButton>null,
        level_text:<fgui.GLabel>null,
    }
    InitData(param:any) {
        this.view_param = param
        this.viewNode.BtnClose.onClick(this.OnClickClose, this);
        this.viewNode.BtnStart.onClick(this.OnClickStart, this);

        this.AddSmartDataCare(PetGuardData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");
        // this.viewNode.Board.SetData(new BoardData(PetGuardDetailView,Language.PeakArena.EnterName[1],25))

        this.flushInfoPanel()
    }
    flushInfoPanel() {
        if (BattleCtrl.Inst().check(this, this.flushInfoPanel.bind(this))) {
            return
        }
        
        let param = PetGuardData.Inst().GetDetailViewDetial(this.view_param.stage)

        UH.SetText(this.viewNode.title, param.title)
        // UH.SetText(this.viewNode.LevelShow, param.level_show)
        this.viewNode.ModelShow.setPath(ResPath.Npc(param.res_id));

        this.viewNode.ProgBar.max = param.p_max
        this.viewNode.ProgBar.value = param.p_value
        
        this.viewNode.Reward1.SetData(param.rewards[0])
        this.viewNode.Reward2.SetData(param.rewards[1])
        this.viewNode.Reward3.SetData(param.rewards[2])
        
        this.viewNode.RuleList.SetData(param.rule_list)
        this.send_level = param.level

        this.viewNode.BtnStart.grayed = param.game_pass
        this.viewNode.BtnStart.title = param.game_pass? Language.PetGuard.BtnChallengeDone :Language.PetGuard.BtnChallengeStart
        this.gamepass = param.game_pass

        UH.SetText(this.viewNode.level_text,param.level_text)
    }
    OnClickClose()
    {
        ViewManager.Inst().CloseView(PetGuardDetailView)
    }
    OnClickStart()
    {
        if(this.gamepass)
        {
            PublicPopupCtrl.Inst().Center(Language.PetGuard.AllChallengeComplete)       
            return
        }
        PetGuardCtrl.Inst().SendPetFbReq(1,this.send_level)
    }
}

export class PetGuardRewardCell extends fgui.GComponent {
    private viewNode = {
        title:<fgui.GLabel>null,
        item_cell:<ItemCell>null,
        complete:<fgui.GImage>null,
        complete_g:<fgui.GGroup>null,
        Lock:<fgui.GGroup>null,
        RewardArea:<fgui.GGraph>null,
        RedPoint:<RedPoint>null,
        nomal_bg:<fgui.GImage>null,
        nomal_select:<fgui.GImage>null,
        sp_bg:<fgui.GImage>null,
        sp_select:<fgui.GImage>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.RewardArea.onClick(this.OnClickReward, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetText(this.viewNode.title,data.name)
        let item_cell = Item.Create(data.item_data,{is_click :true,is_num :true})
        this.viewNode.item_cell.SetData(item_cell)
        this.viewNode.complete_g.visible = data.is_complete
        this.viewNode.Lock.visible = data.is_lock && !data.is_challenge
        this.viewNode.RewardArea.visible = data.show_oper
        this.viewNode.RedPoint.SetNum(!data.is_lock&&!data.is_complete ? 1 : 0)

        this.viewNode.nomal_bg.visible = !data.is_last 
        this.viewNode.nomal_select.visible = !data.is_last && data.is_challenge
        this.viewNode.sp_bg.visible = data.is_last 
        this.viewNode.sp_select.visible = data.is_last && data.is_challenge
    }

    private OnClickReward() {
        PetGuardCtrl.Inst().SendPetFbReq(2,this.data.level)
    }
}

export class PetGuardRuleCell extends fgui.GComponent {
    private viewNode = {
        title:<fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetText(this.viewNode.title,data.str)
    }
}

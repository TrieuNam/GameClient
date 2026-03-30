
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { HelpView } from "modules/common_help/CommonHelpView";
import { RedPoint } from "modules/extends/RedPoint";
import { MainCapItem } from "modules/main/MainItems";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { InscriptionChengJiuView } from "./InscriptionChengJiuView";
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";
import { InscriptionRewardView } from "./InscriptionRewardView";
import { InscriptionTurntableView } from "./InscriptionTurntableView";
import { InscriptionView } from "./InscriptionView";


@BaseView.registView
export class InscriptionTowerView extends BaseView {
    private fight_time = 0;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "InscriptionTower",
        ViewName: "InscriptionTowerView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnHelp: <fgui.GButton>null,
        BtnInscription: <fgui.GButton>null,
        BtnReward: <fgui.GButton>null,
        BtnTurntable: <fgui.GButton>null,
        BtnFight: <fgui.GButton>null,
        BtnChapter: <fgui.GButton>null,
        BtnChengJiu: <fgui.GButton>null,

        LayerShow: <fgui.GTextField>null,
        DescShow: <fgui.GRichTextField>null,
        CapShow: <MainCapItem>null,
        UIModelShow: <UIModelShow>null,
        RewardList1: <fgui.GList>null,
        RewardList2: <fgui.GList>null,

        RedPointShowInscription: <RedPoint>null,
        RedPointShowReward: <RedPoint>null,
        RedPointShowTurntable: <RedPoint>null,
        RedPointShowChapter: <RedPoint>null,
        ChengJiuRed: <RedPoint>null,

        GpCur: <fgui.GGroup>null,
        GpMax: <fgui.GGroup>null,
    };

    InitData() {
        this.viewNode.BtnClose.onClick(this.OnClickClose, this);
        this.viewNode.BtnHelp.onClick(this.OnClickHelp, this);
        this.viewNode.BtnInscription.onClick(this.OnClickInscription, this);
        this.viewNode.BtnReward.onClick(this.OnClickReward, this);
        this.viewNode.BtnTurntable.onClick(this.OnClickTurntable, this);
        this.viewNode.BtnFight.onClick(this.OnClickFight, this);
        this.viewNode.BtnChapter.onClick(this.OnClickChapter, this);
        this.viewNode.BtnChengJiu.onClick(this.OnClickChengJiu, this);

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushShow.bind(this), "tower_level_flush");

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushNumShow.bind(this), "turntable_num_flush");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushNumShow.bind(this), "flushneed");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushRewardShow.bind(this), "tower_reward_flush");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushChapterShow.bind(this), "tower_chapter_flush");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushChengJiuShow.bind(this), "chengjiu_info");

    }

    InitUI() {
        this.FlushShow();

        this.FlushNumShow();
    }

    FlushShow() {
        let info = InscriptionData.Inst().RuneInfo();
        let co_tower = InscriptionData.Inst().CfgTowerClearanceLevel(info.tower_level + 1);
        let is_max = undefined == co_tower
        this.viewNode.GpMax.visible = is_max
        this.viewNode.GpCur.visible = !is_max
        co_tower = co_tower ?? InscriptionData.Inst().CfgTowerClearanceLevel(info.tower_level);
        UH.SetText(this.viewNode.LayerShow, TextHelper.Format(Language.Inscription.Tower.LayerShow, info.tower_level + 1));
        this.viewNode.CapShow.SetData(co_tower.score);
        this.viewNode.UIModelShow.setPath(ResPath.Npc(co_tower.res_id));

        let rewards = [];
        for (let i = 0; i < co_tower.win.length; i++) {
            rewards.push(Item.Create(co_tower.win[i], { is_num: true }))
        }
        this.viewNode.RewardList1.SetData(rewards);
        this.viewNode.BtnFight.grayed = is_max
        this.viewNode.BtnFight.touchable = !is_max

        this.FlushChapterShow();
        this.FlushRewardShow();
        this.FlushChengJiuShow();
    }

    FlushNumShow() {
        this.viewNode.RedPointShowInscription.SetNum(InscriptionData.Inst().GetAdRed());
        // this.viewNode.RedPointShowTurntable.SetNum(0);
    }

    FlushRewardShow() {
        let info = InscriptionData.Inst().RuneInfo();
        this.viewNode.RedPointShowReward.SetNum(info.tower_level > 0 && 0 == info.daily_reward ? 1 : 0);
    }

    FlushChapterShow() {
        let info = InscriptionData.Inst().RuneInfo();
        let co_reward = InscriptionData.Inst().CfgTowerDayRewardIndex(info.pass_reward_index);
        let can_get = info.tower_level >= co_reward.level_clear

        let rewards = []
        for (let i = 0; i < co_reward.reward_chap.length; i++) {
            rewards.push(Item.Create(co_reward.reward_chap[i], { is_num: true }))
        }
        UH.SetText(this.viewNode.DescShow, TextHelper.Format(Language.Inscription.Tower.DescShow, co_reward.level_clear));
        this.viewNode.RewardList2.SetData(rewards);
        this.viewNode.BtnChapter.grayed = !can_get;
        this.viewNode.RedPointShowChapter.SetNum(can_get ? 1 : 0);
    }

    FlushChengJiuShow() {
        this.viewNode.BtnChengJiu.visible = InscriptionData.Inst().GetInscriptionChengJiuIsOpen();
        let red = InscriptionData.Inst().GetChengJiuAllRed()
        this.viewNode.ChengJiuRed.SetNum(red)
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(InscriptionTowerView);
    }

    OnClickHelp() {
        ViewManager.Inst().OpenView(HelpView, 22);
    }

    OnClickInscription() {
        ViewManager.Inst().OpenView(InscriptionView);
    }

    OnClickReward() {
        ViewManager.Inst().OpenView(InscriptionRewardView);
    }

    OnClickTurntable() {
        ViewManager.Inst().OpenView(InscriptionTurntableView);
    }

    OnClickFight() {
        if (TimeCtrl.Inst().ServerTime - this.fight_time > 1) {
            this.fight_time = TimeCtrl.Inst().ServerTime;
            InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.FIGHT);
        }
    }

    OnClickChapter() {
        InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.PASS_REWARD);
    }

    OnClickChengJiu() {
        ViewManager.Inst().OpenView(InscriptionChengJiuView)
    }
}
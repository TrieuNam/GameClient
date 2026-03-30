import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { FightAccountWinView } from "./FightAccountWinView";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { ArenaData } from "modules/Arena/ArenaData";
import { BattleReportData } from "modules/battle/BattleData";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { Language } from "modules/common/Language";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ENUM_BATTLE } from "modules/battle/BattleConf";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { ItemCell } from "modules/extends/ItemCell";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { LogError } from "core/Debugger";
import { Item } from "modules/bag/ItemData";
import { CfgArenaData } from "config/CfgArena";
import { PeakArenaData } from "modules/PeakArena/PeakArenaData";
import { RANK_TYPE } from "modules/common/CommonEnum";
import { RankCtrl } from "modules/rank/RankCtrl";

@BaseView.registView
export class FightPvPWinView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "FightPvPWinView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        ListReward: <fgui.GList>null,
        name1: <fgui.GLabel>null,
        name2: <fgui.GLabel>null,
        score1: <fgui.GRichTextField>null,
        score2: <fgui.GRichTextField>null,
        avatarCell1: <AvatarCell>null,
        avatarCell2: <AvatarCell>null,
        EffectShow: <UIEffectShow>null,
        HuangGuan1: <fgui.GImage>null,
        HuangGuan2: <fgui.GImage>null,
        JiangBei1: <fgui.GImage>null,
        JiangBei2: <fgui.GImage>null,
    }

    private reward_data: any[];
    InitData(param: { rep: BattleReportData, reward_data: CfgItem[] }) {
        super.InitData(param);
        let my = ArenaData.Inst().GetArenaMainData();
        let distScore = param.rep.proto_report.scoreChange
        let nowScore = my.nowScore ;//- distScore;

        this.viewNode.name1.text = RoleData.Inst().GetRoleName();

        let data = param.rep.BattleInfo;
        switch (param.rep.proto_report.battleModeType) {
            case ENUM_BATTLE.HERO_BATTLE_TYPE_PVP:
                this.viewNode.HuangGuan1.visible = true
                this.viewNode.HuangGuan2.visible = true

                let target = data.target();
                this.viewNode.name2.text = target.name;
                let targetDistScore = distScore > 0 ? -CfgArenaData.arena_cfg[0].lose_score : 0;
                let targetScore = target.score + targetDistScore;
                UH.SetText(this.viewNode.score2, TextHelper.Format(Language.FightAccount.Scoure[targetDistScore >= 0 ? 0 : 1], targetScore, targetDistScore));
                UH.SetText(this.viewNode.score1, TextHelper.Format(Language.FightAccount.Scoure[distScore >= 0 ? 0 : 1], nowScore, distScore));
                this.viewNode.avatarCell2.SetData(new AvatarData(target.head_pic, target.level))
                break;
            case ENUM_BATTLE.CROSS_ARENA:
            
                let fight_ret = PeakArenaData.Inst().GetCrossArenaCount()
                this.viewNode.JiangBei1.visible = true
                this.viewNode.JiangBei2.visible = true

                let df_target = data.target();
                this.viewNode.name2.text = df_target.name;
                UH.SetText(this.viewNode.score2, TextHelper.Format(Language.FightAccount.Scoure[fight_ret.defender_change >= 0 ? 0 : 1], fight_ret.defender_score, fight_ret.defender_change));
                UH.SetText(this.viewNode.score1, TextHelper.Format(Language.FightAccount.Scoure[fight_ret.attacker_change >= 0 ? 0 : 1], fight_ret.attacker_score, fight_ret.attacker_change));
                this.viewNode.avatarCell2.SetData(new AvatarData(df_target.head_pic, df_target.level))

                RankCtrl.Inst().SendRankReq(RANK_TYPE.CrossArena,null,true);
                break;
        }
        this.viewNode.avatarCell1.SetData(new AvatarData(RoleData.Inst().GetRoleHeadPic(), RoleData.Inst().GetRoleLevel()));
        this.viewNode.EffectShow.PlayEff(4164051)
        let reward_data = Item.DefaultCreateListItem(param.reward_data, { is_gray: false, is_click: true, is_num: true, eff: -4164000 });
        this.viewNode.ListReward.SetData(reward_data)
    }

    InitUI() {
    }

    private renderItem(index: number, item: ItemCell) {
        let self = this;
        item.SetData(self.reward_data[index]);
    }

    CloseCallBack() {
        BattleCtrl.Inst().end();
    }
}
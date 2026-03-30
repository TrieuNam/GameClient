
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseItemGP } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard2 } from 'modules/common_board/CommonBoard2';
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GuildBossRewardView } from "./GuildBossRewardView";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";

@BaseView.registView
export class GuildBossView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildBoss",
        ViewName: "GuildBossView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        BtnReward: <fgui.GButton>null,
        BtnFight: <fgui.GButton>null,

        LevelShow: <fgui.GTextField>null,
        TimesShow: <fgui.GTextField>null,
        ProgressBlood: <GuildBossViewProgressBlood>null,
        CellShow: <ItemCell>null,
        UIModelShow: <UIModelShow>null,

        RedPointShow: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "ProgressBlood", ExtendsClass: GuildBossViewProgressBlood },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GuildBossView));

        this.viewNode.BtnReward.onClick(this.OnClickReward, this);
        this.viewNode.BtnFight.onClick(this.OnClickFight, this);

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");
    }

    InitUI() {
        this.FlushInfo();
    }

    FlushInfo() {
        if (BattleCtrl.Inst().check(this, this.FlushInfo.bind(this))) {
            return
        }
        let info = GuildData.Inst().ResultData.Info
        let co = GuildData.Inst().CfgBossInfoBySeq(info.bossLevel)
        UH.SetText(this.viewNode.LevelShow, `Lv.${co.boss_seq + 1}`)
        UH.SetText(this.viewNode.TimesShow, TextHelper.Format(Language.Guild.GuildBoss.TimesShow, GuildData.Inst().CfgBossFightTimeMax() - info.bossFightTime))
        this.viewNode.ProgressBlood.FlushInfo(info.bossHpPer)
        this.viewNode.UIModelShow.setPath(ResPath.Npc(co.res_id));
        this.viewNode.CellShow.SetData(Item.Create(GuildData.Inst().CfgOtherWin(), { is_num: true }));

        let co_boss = GuildData.Inst().CfgBossFightInfoByTime(info.bossFightTime + 1)
        this.viewNode.RedPointShow.SetNum(co_boss && co_boss.fight_item_num > 0 ? 0 : 1)
    }

    OnClickReward() {
        ViewManager.Inst().OpenView(GuildBossRewardView)
    }

    OnClickFight() {
        let info = GuildData.Inst().ResultData.Info
        let co = GuildData.Inst().CfgBossFightInfoByTime(info.bossFightTime + 1)
        if (co) {
            if (co.fight_item_num > 0) {
                PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Guild.GuildBoss.FightTips, co.fight_item_num, Item.GetName(co.fight_item_id)), DialogTipsTypes.guild_fight, () => {
                    GuildCtrl.Inst().SendGuildReqFightBoss();
                })
                return
            }
        }
        GuildCtrl.Inst().SendGuildReqFightBoss();
    }
}

export class GuildBossViewProgressBlood extends BaseItemGP {
    protected viewNode = {
        ValShow: <fgui.GTextField>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public FlushInfo(val: number) {
        this.value = val
        this.max = 10000
        UH.SetText(this.viewNode.ValShow, TextHelper.Format(Language.Guild.GuildBoss.ProgressValShow, val / 100));
    }
}

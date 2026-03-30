

import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from 'modules/common/BaseItem';
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard3 } from 'modules/common_board/CommonBoard3';
import { UH } from "../../helpers/UIHelper";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";

@BaseView.registView
export class GuildBossRewardView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildBossReward",
        ViewName: "GuildBossRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: GuildBossRewardViewShowItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GuildBossRewardView));

        this.viewNode.ShowList.setVirtual();

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushRoleInfo.bind(this), "RoleInfo");
    }

    InitUI() {
        this.FlushRoleInfo();
    }

    FlushRoleInfo() {
        this.viewNode.ShowList.SetData(GuildData.Inst().GetBossRewardsShow())
    }
}

export class GuildBossRewardViewShowItem extends BaseItem {
    protected viewNode = {
        BtnGet: <fgui.GButton>null,
        LevelShow: <fgui.GTextField>null,
        RewardList: <fgui.GList>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnGet.onClick(this.OnClickGet, this);
    }

    public SetData(data: any) {
        super.SetData(data);
        if (data) {
            let info_get = GuildData.Inst().GetGuildBossRewardIsGet(data.boss_seq)
            let rewards = [];
            for (let i = 0; i < data.win.length; i++) {
                rewards.push(Item.Create(data.win[i], { is_num: true }))
            }

            UH.SetText(this.viewNode.LevelShow, `Lv.${data.boss_seq + 1}`)
            this.viewNode.RewardList.SetData(rewards);

            this.viewNode.BtnGet.grayed = !info_get.can_get || info_get.is_get
            this.viewNode.BtnGet.touchable = !info_get.is_get
            this.viewNode.BtnGet.title = info_get.is_get ? Language.Guild.GuildBoss.BtnGeted : Language.Guild.GuildBoss.BtnGet
        }
    }

    public OnClickGet() {
        GuildCtrl.Inst().SendGuildReqFetchPassReward(this._data.boss_seq)
    }
}

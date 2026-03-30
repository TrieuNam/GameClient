
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { HelpView } from "modules/common_help/CommonHelpView";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UH } from "../../helpers/UIHelper";
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";
import { InscriptionTurntableView } from "./InscriptionTurntableView";


@BaseView.registView 
export class InscriptionRewardView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "InscriptionReward",
        ViewName: "InscriptionRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnGet: <fgui.GButton>null,
        RewardList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ItemReward", ExtendsClass: InscriptionRewardViewRewardItem }
    ]

    InitData() {
        this.viewNode.Board.SetData(new BoardData(InscriptionRewardView));
        this.viewNode.BtnGet.onClick(this.OnClickGet, this);

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushShow.bind(this), "tower_reward_flush");
    }

    InitUI() {
        this.FlushShow();
    }

    FlushShow() {
        let info = InscriptionData.Inst().RuneInfo();
        let is_get = 1 == info.daily_reward
        let co_reward = InscriptionData.Inst().CfgTowerDayRewardLevel(info.tower_level);
        let rewards = [];
        for (let i = 0; i < co_reward.reward.length; i++) {
            rewards.push(Item.Create(co_reward.reward[i], { is_num: true }))
        }
        this.viewNode.RewardList.SetData(rewards);
        this.viewNode.BtnGet.title = is_get ? Language.Inscription.Tower.DayRewardGeted : Language.Inscription.Tower.DayRewardGet
        this.viewNode.BtnGet.grayed = is_get || 0 == info.tower_level
        this.viewNode.BtnGet.touchable = !is_get
    }

    OnClickGet() {
        let info = InscriptionData.Inst().RuneInfo();
        if(0 == info.tower_level){
            PublicPopupCtrl.Inst().Center(Language.Inscription.Tower.DayReward0Tips)
            return
        }
        InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.FETCHDAYREWARD);
    }
}

class InscriptionRewardViewRewardItem extends BaseItem {
    protected viewNode = {
        CellShow: <ItemCell>null,
        NameShow: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        this.viewNode.CellShow.SetData(data);
        UH.SetText(this.viewNode.NameShow, data.Name());
    }
}
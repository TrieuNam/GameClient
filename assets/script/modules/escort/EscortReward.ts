import { CfgEscortRank, CfgEscortShip } from "config/CfgEscort";
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonBoard5Tab, tabberInfo } from "modules/common_board/CommonBoard5";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { EscortData } from "./EscortData";

@BaseView.registView
export class EscortReward extends BaseView {
    data: EscortData = EscortData.Inst()
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.Escort.TabbarName1 },
        { panel: null, viewName: "", titleName: Language.Escort.TabbarName2 }
    ]

    protected viewRegcfg = {
        UIPackName: "EscortReward",
        ViewName: "EscortReward",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        TabList: <fgui.GList>null,
        Board: <CommonBoard3>null,
        RewardList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "EscortRewardItem", ExtendsClass: EscortRewardItem }
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(EscortReward, Language.Escort.Title2))
        this.viewNode.TabList.SetData(this.tabbarCfg);
        this.viewNode.TabList.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        this.viewNode.TabList.OnSelectedItem(0)
        //this.viewNode.TabList.selectedIndex = 0;
    }
    OnClickListItem(tabber: number) {
        if (this.viewNode.TabList.selectedIndex == 0) {
            this.viewNode.RewardList.SetData(this.data.GetRankReward(1))
        } else {
            this.viewNode.RewardList.SetData(this.data.GetRankReward(0))
        }
    }
    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }
}

export class EscortRewardItem extends BaseItem {
    escort_data = EscortData.Inst()
    protected viewNode = {
        Name: <fgui.GTextField>null,
        List: <fgui.GList>null,
    };

    public SetData(data: CfgEscortRank) {
        if (data.paihang_1 == data.paihang_2) {
            UH.SetText(this.viewNode.Name, data.paihang_1)
        } else {
            if (data.paihang_2 == 0) {
                UH.SetText(this.viewNode.Name, TextHelper.Format(Language.Escort.RankNum2, data.paihang_1))
            } else {
                UH.SetText(this.viewNode.Name, TextHelper.Format(Language.Escort.RankNum, data.paihang_1, data.paihang_2))
            }
        }
        let rewards = [];
        let rewad_list = data.paihang_reward
        for (let i = 0; i < rewad_list.length; i++) {
            rewards.push(Item.Create(rewad_list[i], { is_num: true }))
        }
        this.viewNode.List.SetData(rewards)
    }
}
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class TrialRewardView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialReward",
        ViewName: "TrialRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        TipsShow: <fgui.GTextField>null,
        // CellShow: <ItemCellEquip>null,
        // CapShow: <MainCapItem>null,
        // AttrShow: <AttrItem>null,
        ShowList: <fgui.GList>null,
        // BtnArrow: <fgui.GButton>null,
        //排名奖励预览 //试炼之塔根据每周排名结算奖励，以邮件形式发放
    };

    protected extendsCfg = [
        { ResName: "TrialRewardItem", ExtendsClass: TrialTrialTowerPanelRewardItem },
    ];

    private param: { title: string, tip: string, list_data: any[] }
    InitData(param: { title: string, tip: string, list_data: any[] }) {
        this.param = param;

    }
    InitUI() {
        this.viewNode.Board.SetData(new BoardData(TrialRewardView, this.param.title));
        UH.SetText(this.viewNode.TipsShow, this.param.tip)
        this.viewNode.ShowList.SetData(this.param.list_data)
    }
}

class TrialTrialTowerPanelRewardItem extends BaseItem {
    protected viewNode = {
        RankShow: <fgui.GTextField>null,
        RewardList: <fgui.GList>null,
    };

    public SetData(data: any) {
        let rewards = [];
        let rewad_list = data.paihang_reward ? data.paihang_reward : data.item_list;
        for (let i = 0; i < rewad_list.length; i++) {
            rewards.push(Item.Create(rewad_list[i], { is_num: true }))
        }
        UH.SetText(this.viewNode.RankShow, data.paihang_1 == data.paihang_2 ? data.paihang_1 : (data.paihang_1 > 100 ? TextHelper.Format(Language.Trial.TrialTower.RewardRankLater, data.paihang_1) : `${data.paihang_1}-${data.paihang_2}`))
        this.viewNode.RewardList.SetData(rewards);
    }
}
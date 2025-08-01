import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { MonsterData } from "modules/monster/MonsterData";
import { TrialData } from "./TrialData";

@BaseView.registView 
export class TrialAttrView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialAttr",
        ViewName: "TrialAttrView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        RewardList: <fgui.GList>null,
        AttrList: <fgui.GList>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialAttrView));
        this.viewNode.Board.SetTitleShow(false);

        this.FlushRewardShow();
    }

    private FlushRewardShow() {
        let co = TrialData.Inst().CfgShiLianClearance(TrialData.Inst().GetTrialInfoCurLevel())
        let rewards = []
        for(let i = 0; i < co.win.length; i ++){
            rewards.push(Item.Create(co.win[i], {is_num : true}))
        }
        this.viewNode.RewardList.SetData(rewards);
        let attrs = MonsterData.Inst().CfgMonsterAttrsByMonsterGroupId(co.monster_group)
        this.viewNode.AttrList.SetData(attrs);
    }

}
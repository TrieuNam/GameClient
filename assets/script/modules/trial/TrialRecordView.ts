import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { RankData } from "modules/rank/RankData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TrialData } from "./TrialData";
import { TrialRankView } from "./TrialRankView";
import { TrialRewardView } from "./TrialRewardView";

@BaseView.registView 
export class TrialRecordView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialRecord",
        ViewName: "TrialRecordView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnView: <fgui.GButton>null,
        LayerShow:<fgui.GTextField>null,
        RankShow:<fgui.GTextField>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialRecordView));
        this.viewNode.BtnView.onClick(this.OnClickRankReward, this);

        this.AddSmartDataCare(RankData.Inst().result_info, this.FlushShow.bind(this), "is_change");
    }

    InitUI() {
        this.FlushShow();
    }

    private FlushShow() {
        let my_rank =RankData.Inst().GetMyRank(RANK_TYPE.TRIAL);
        UH.SetText(this.viewNode.LayerShow, TextHelper.Format(Language.Trial.TrialTower.RecordLayerShow, TrialData.Inst().GetTrialInfoBestLevel()))
        UH.SetText(this.viewNode.RankShow, my_rank > 0 ? TextHelper.Format(Language.Trial.TrialTower.RecordRankShow, my_rank) : Language.Trial.TrialTower.RecordRankShowNone)
    }

    private OnClickRankReward() {
        ViewManager.Inst().OpenView(TrialRankView, RANK_TYPE.TRIAL);
    }
}
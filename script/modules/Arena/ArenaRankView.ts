import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { PeakArenaRewardView } from "modules/PeakArena/PeakArenaRewardView";
import { BagData } from "modules/bag/BagData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { RANK_TYPE } from "modules/common/CommonEnum";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { TrialTrialTowerPanelRankItem } from "modules/trial/TrialRankView";
import { ArenaData } from "./ArenaData";
import { ArenaNewView } from "./ArenaNewView";
import { GuideCtrl } from "modules/guide/GuideCtrl";


@BaseView.registView
export class ArenaRankView extends BaseView {
    private type = RANK_TYPE.Arena;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ArenaRank",
        ViewName: "ArenaRankView",
        LayerType: ViewLayer.Buttom,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        BtnDesc: <fgui.GButton>null,
        List: <fgui.GList>null,
        MyRankItem: <TrialTrialTowerPanelRankItem>null,
        BtnChallenge: <CommonButtonBuy>null,
        BtnWeekRankReward: <fgui.GButton>null,
        BtnReturn: <fgui.GButton>null,
        EmptyObj: <fgui.GComponent>null,
    }

    protected extendsCfg = [
        { ResName: "ArenaMyRankItem", ExtendsClass: TrialTrialTowerPanelRankItem },
        { ResName: "ArenaRankItem", ExtendsClass: TrialTrialTowerPanelRankItem },
    ];

    InitData() {
        RankData.Inst().CurRankType = this.type;
        this.viewNode.List.setVirtual();
        this.viewNode.List.on(fgui.Event.SCROLL_END, this.OnScrollEnd, this);
        this.viewNode.BtnChallenge.onClick(this.OnClick.bind(this, "BtnChallenge"));
        this.viewNode.BtnWeekRankReward.onClick(this.OnClick.bind(this, "BtnWeekRankReward"));
        this.viewNode.BtnReturn.onClick(this.closeView.bind(this));
        this.AddSmartDataCare(RankData.Inst().result_info, this.FlushShow.bind(this), "is_change");
        this.AddSmartDataCare(ArenaData.Inst().rank_sm_info, this.FlushPos.bind(this), "flush_pos");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushRed.bind(this), "OtherChange");
        this.FlushRed();
        RankCtrl.Inst().SendRankReq(this.type);
        GuideCtrl.Inst().AddGuideUi("BtnEqual", this.viewNode.BtnChallenge);

    }

    InitUI() {
    }

    private FlushRed() {
        let fight_times = ArenaData.Inst().GetFightTimes();
        this.viewNode.BtnChallenge.ShowRedPoint(fight_times > 0);
    }

    private FlushShow() {
        let data = RankData.Inst().GetRankList(this.type);
        this.viewNode.List.SetData(data.list);
        this.viewNode.EmptyObj.visible = 0 == data.list.length;
        this.viewNode.MyRankItem.SetData(data.my_info);
        this.viewNode.MyRankItem.visible = true;
    }

    private FlushPos() {
        this.viewNode.List.scrollPane.scrollTop();
    }

    private OnScrollEnd() {
        RankCtrl.Inst().SendRankReq(this.type)
    }

    private OnClick(btn_name: string) {
        switch (btn_name) {
            case "BtnChallenge":
                // ViewManager.Inst().OpenView(ArenaView);
                ViewManager.Inst().OpenView(ArenaNewView);
                break;
            case "BtnWeekRankReward":
                // ViewManager.Inst().OpenView(TrialRewardView,
                //     {
                //         title: Language.Arena.week_reward,
                //         tip: Language.Arena.week_reward_tip,
                //         list_data: ArenaData.Inst().GetWeekRewardList()
                //     });
                ViewManager.Inst().OpenView(PeakArenaRewardView, { viewType: 0 });
                break;
        }
    }

    CloseCallBack() {
        RankData.Inst().CurRankType = null;
        RankData.Inst().clearRankData(this.type);
        GuideCtrl.Inst().ClearGuideUi("BtnEqual");
        GuideCtrl.Inst().ForceStop();
    }

}


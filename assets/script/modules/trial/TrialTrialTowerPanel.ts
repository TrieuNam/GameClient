
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseItem } from "modules/common/BaseItem";
import { BasePanel } from "modules/common/BasePanel";
import { RANK_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { ItemCellShiLian } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { MainCapItem } from "modules/main/MainItems";
import { MonsterData } from "modules/monster/MonsterData";
import { RankCtrl } from "modules/rank/RankCtrl";
import { RankData } from "modules/rank/RankData";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { RoleData } from "modules/role/RoleData";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel, tuiSongID } from "../../proload/ChannelAgent";
import { TrialAttrView } from "./TrialAttrView";
import { TrialBagView } from "./TrialBagView";
import { TrialCtrl } from "./TrialCtrl";
import { TrialData } from "./TrialData";
import { TrialRecordView } from "./TrialRecordView";
import { TrialResetView } from "./TrialResetView";
import { TrialRewardView } from "./TrialRewardView";
import { TrialSpoilsView } from "./TrialSpoilsView";

export class TrialTrialTowerPanel extends BasePanel {
    private operTime: number = 0
    guide_tag: string[] = []
    protected viewNode = {
        BtnShop: <fgui.GButton>null,
        BtnRank: <fgui.GButton>null,
        BtnRecord: <fgui.GButton>null,
        BtnBag: <fgui.GButton>null,
        BtnFight: <fgui.GButton>null,
        BtnReset: <fgui.GButton>null,
        BtnView: <fgui.GButton>null,
        BtnSpoil: <fgui.GButton>null,
        BtnAttrs: <fgui.GButton>null,

        GroupTime: <fgui.GGroup>null,
        GroupBtnsMain: <fgui.GGroup>null,

        CapShow: <MainCapItem>null,

        LayerShow: <fgui.GTextField>null,
        RankShow: <fgui.GTextField>null,
        TimeShow: <TimeMeter>null,

        CurrencyIcon: <fgui.GLoader>null,
        CurrencyNum: <fgui.GTextField>null,

        SpoilList: <fgui.GList>null,
        RewardList: <fgui.GList>null,

        UIModelShow: <UIModelShow>null,
        layer: <fgui.GGroup>null,
        rewards: <fgui.GGroup>null,
        GpMax: <fgui.GGroup>null,
    };

    protected extendsCfg = [
        { ResName: "TrialAttrItem", ExtendsClass: TrialTrialTowerPanelAttrItem },

    ];

    private show_list: any[];

    InitPanelData() {
        this.viewNode.BtnShop.onClick(this.OnClickShop, this);
        this.viewNode.BtnRank.onClick(this.OnClickRank, this);
        this.viewNode.BtnRecord.onClick(this.OnClickRecord, this);
        this.viewNode.BtnBag.onClick(this.OnClickBag, this);
        this.viewNode.BtnView.onClick(this.OnClickView, this);
        this.viewNode.BtnSpoil.onClick(this.OnClickSpoil, this);
        this.viewNode.BtnAttrs.onClick(this.OnClickAttrs, this);

        this.viewNode.BtnFight.onClick(this.OnClickFight, this);
        this.viewNode.BtnReset.onClick(this.OnClickRest, this);

        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushTrialInfoShow.bind(this), "TrialInfo");
        this.AddSmartDataCare(TrialData.Inst().ResultData, this.SendTrialRankInfo.bind(this), "TrialInfo");
        // this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleInfoShow.bind(this));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushTrialInfoShow.bind(this), "EquipShiLianChange");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushTrialInfoShow.bind(this), "OtherChange");
        this.AddSmartDataCare(RankData.Inst().result_info, this.FlushRankShow.bind(this), "is_change");

        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("TrialFightBtn", this.viewNode.BtnFight))
    }

    InitPanel() {
        this.FlushTrialInfoShow();
        // this.FlushRoleInfoShow();
        // this.FlushItemShow();
        this.FlushTrialBtnsShow();
        this.FlushRankShow();
        this.SendTrialRankInfo();
    }

    ClosePanel() {
        this.viewNode.TimeShow.CloseCountDownTime()
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []

        ChannelAgent.Inst().OnMessage(GameToChannel.tuisong, tuiSongID.shilian);

    }

    private SendTrialRankInfo() {
        RankCtrl.Inst().SendRankReq(RANK_TYPE.TRIAL)
    }

    private FlushTrialInfoShow() {
        if (BattleCtrl.Inst().check(this, this.FlushTrialInfoShow.bind(this))) {
            return
        }
        this.viewNode.GpMax.visible = false;
        let co = TrialData.Inst().CfgShiLianClearance(TrialData.Inst().GetTrialInfoCurLevel())
        UH.SetText(this.viewNode.LayerShow, TextHelper.Format(Language.Trial.TrialTower.LayerShow, TrialData.Inst().GetTrialInfoCurLevel()))
        this.viewNode.SpoilList.SetData(TrialData.Inst().GetTrialInfoUseItemShow(), this.OnClickUseItem.bind(this))
        this.viewNode.UIModelShow.setPath(ResPath.Npc(co.res_id));
        this.viewNode.CapShow.SetData(co.score);
        this.FlushTrialBtnsShow();

        this.FlushTrialTimeShow();
        this.FlushItemShow();
        this.FlushRewardShow();
    }

    private FlushRankShow() {
        let my_rank = RankData.Inst().GetMyRank(RANK_TYPE.TRIAL);
        UH.SetText(this.viewNode.LayerShow, TextHelper.Format(Language.Trial.TrialTower.RecordLayerShow, TrialData.Inst().GetTrialInfoBestLevel()))
        UH.SetText(this.viewNode.RankShow, my_rank > 0 ? TextHelper.Format(Language.Trial.TrialTower.RecordRankShow, my_rank) : Language.Trial.TrialTower.RecordRankShowNone)
    }

    private FlushTrialTimeShow() {
        this.viewNode.GroupTime.visible = TrialData.Inst().GetTrialInfoSeasonEndTime() > 0
        this.viewNode.TimeShow.CloseCountDownTime()
        if (TrialData.Inst().GetTrialInfoSeasonEndTime() > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(TrialData.Inst().GetTrialInfoSeasonEndTime(), TimeFormatType.TYPE_TIME_3, Language.Trial.TrialTower.TimeShow)
            this.viewNode.TimeShow.SetCallBack(this.FlushTrialTimeShow.bind(this))
        }
    }

    private FlushTrialBtnsShow() {
        let randoms = TrialData.Inst().GetTrialInfoRandomId()
        let show_spoil = randoms.length > 0 && randoms[0] > 0
        this.viewNode.GroupBtnsMain.visible = !show_spoil
        this.viewNode.BtnSpoil.visible = show_spoil
        if (!TrialData.Inst().CfgShiLianClearance(TrialData.Inst().ResultData.TrialInfo.passLevel + 1)) {//如果是最高层
            if (!show_spoil) {
                this.viewNode.GpMax.visible = true;
                this.viewNode.SpoilList.visible = this.viewNode.rewards.visible = this.viewNode.GroupTime.visible = this.viewNode.layer.visible = false;
                this.viewNode.BtnFight.enabled = this.viewNode.UIModelShow.visible = false
            }
        } else {
            this.viewNode.GpMax.visible = false;
            this.viewNode.SpoilList.visible = this.viewNode.rewards.visible = this.viewNode.GroupTime.visible = this.viewNode.layer.visible = true;
            this.viewNode.BtnFight.enabled = this.viewNode.UIModelShow.visible = true
        }
    }

    private FlushRoleInfoShow() {
        this.viewNode.CapShow.SetData(RoleData.Inst().GetCapability());
    }

    private FlushItemShow() {
        let shilian_coin_id = TrialData.Inst().CfgShiLianOtherShiLianCoinId()
        UH.SpriteName(this.viewNode.CurrencyIcon, "CommonAtlas", `Item${shilian_coin_id}`);
        UH.SetText(this.viewNode.CurrencyNum, DataHelper.ConverMoney(+BagData.Inst().getItemNum(shilian_coin_id)));
    }

    private OnClickUseItem(item: ItemCellShiLian) {
        let data = item.GetData();
        let index = this.viewNode.SpoilList.getChildIndex(item);
        if (-1 == data.itemId) {
            if (TrialData.Inst().GetTrialLockEnough()) {
                TrialCtrl.Inst().SendShiLianPagodaReqOpen(index)
            }
        }
    }

    private FlushRewardShow() {
        let co = TrialData.Inst().CfgShiLianClearance(TrialData.Inst().GetTrialInfoCurLevel())
        let rewards = []
        for (let i = 0; i < co.win.length; i++) {
            rewards.push(Item.Create(co.win[i], { is_num: true }))
        }
        this.viewNode.RewardList.SetData(rewards);
    }


    private OnClickShop() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenViewByKey(Mod.Trial.TrialShop);
    }

    private OnClickRank() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        let list = TrialData.Inst().CfgShiLianPaiHangReward();
        ViewManager.Inst().OpenView(TrialRewardView, { title: Language.Trial.RankReward, tip: Language.Trial.RankRewardTip, list_data: list });
    }

    private OnClickRecord() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        RankCtrl.Inst().SendRankReq(1);
        ViewManager.Inst().OpenView(TrialRecordView);
    }

    private OnClickBag() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(TrialBagView);
    }

    private OnClickView() {
        ViewManager.Inst().OpenView(TrialAttrView);
    }

    private OnClickSpoil() {
        if (this.OperTimeWait()) {
            return
        }
        ViewManager.Inst().OpenView(TrialSpoilsView)
    }

    private OnClickAttrs() {
        let co = TrialData.Inst().CfgShiLianClearance(TrialData.Inst().GetTrialInfoCurLevel())
        let attrs = MonsterData.Inst().CfgMonsterAttrsByMonsterGroupId(co.monster_group)
        ViewManager.Inst().OpenView(RoleAttrView, {
            attrList: attrs,
        })
    }

    private OnClickFight() {
        if (this.OperTimeWait()) {
            return
        }
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        TrialCtrl.Inst().SendShiLianPagodaReqFight();
    }

    private OnClickRest() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(TrialResetView);
    }

    OperTimeWait() {
        let is_wait = TimeCtrl.Inst().ServerTime - this.operTime < 0.5
        if (!is_wait) {
            this.operTime = TimeCtrl.Inst().ServerTime
        }
        return is_wait
    }
}

export class TrialTrialTowerPanelAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType]);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue));
    }
}
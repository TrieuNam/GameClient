
import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer } from "modules/common/BaseView";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { OtherRoleCtrl, RANK_TO_OTHER } from "modules/OtherRole/OtherRoleCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { NewServerCompetitionCtrl } from "./NewServerCompetitionCtrl";
import { NewServerCompetitionData, NewServerCompetitionRankType } from "./NewServerCompetitionData";

@BaseView.registView
export class NewServerCompetitionView extends BaseView {
    static typeSelIndex: number
    static rankTypeSel: number
    PrgressFunc: { [key: number]: Function } = {};

    protected viewRegcfg = {
        UIPackName: "MoreServerNewServerCompetition",
        ViewName: "NewServerCompetitionView",
        LayerType: ViewLayer.Buttom,
    };

    protected viewNode = {
        BtnReturn: <fgui.GButton>null,
        Currency1: <Currency>null,
        Currency2: <Currency>null,
        TypeList: <fgui.GList>null,
        RankList: <fgui.GList>null,
        RankMe: <NewServerCompetitionRankItem>null,
        TimeShow: <TimeMeter>null,
        ProgressShow: <fgui.GProgressBar>null,
        RewardItem1: <NewServerCompetitionRewardItem>null,
        RewardItem2: <NewServerCompetitionRewardItem>null,
        RewardItem3: <NewServerCompetitionRewardItem>null,
        UIEffectShow: <UIEffectShow>null,
    };

    protected extendsCfg = [
        { ResName: "NewServerCompetitionTypeItem", ExtendsClass: NewServerCompetitionTypeItem },
        { ResName: "NewServerCompetitionRankItem", ExtendsClass: NewServerCompetitionRankItem },
        { ResName: "NewServerCompetitionRewardItem", ExtendsClass: NewServerCompetitionRewardItem },
    ]

    CloseCallBack(): void {
        this.viewNode.TimeShow.CloseCountDownTime()
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinGuMo);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinMaoXian);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinChongWu);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinFaZhen);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinXingTu);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinZuoJi);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinShiZhuang);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinFaZhenZhuangBei);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinJingJiChang);
        // RankData.Inst().clearRankData(RANK_TYPE.BiPinDengJi);
    }

    InitData() {
        this.viewNode.BtnReturn.onClick(this.OnClickClose.bind(this));
        this.viewNode.RewardItem1.onClick(this.OnClickRewardItem.bind(this, this.viewNode.RewardItem1))
        this.viewNode.RewardItem2.onClick(this.OnClickRewardItem.bind(this, this.viewNode.RewardItem2))
        this.viewNode.RewardItem3.onClick(this.OnClickRewardItem.bind(this, this.viewNode.RewardItem3))

        this.viewNode.RankList.setVirtual();
        this.viewNode.RankList.on(fgui.Event.SCROLL_END, this.OnScrollEnd, this);

        this.AddSmartDataCare(NewServerCompetitionData.Inst().ResultData, this.FlushShow.bind(this), "Info");
        // this.AddSmartDataCare(RankData.Inst().result_info, this.FlushInfoShow.bind(this), "is_change");
        this.AddSmartDataCare(NewServerCompetitionData.Inst().ResultData, this.FlushInfoShow.bind(this), "FlushRank");
    }

    InitUI() {
        this.viewNode.UIEffectShow.PlayEff(4164109)
        this.viewNode.Currency1.SetCurrencyId(CommonId.Diamond);
        this.viewNode.Currency2.SetCurrencyId(CommonId.Gold);
        this.FlushShow();
    }

    private FlushShow() {
        let rank_types = NewServerCompetitionData.Inst().GetRankTypesSort(NewServerCompetitionData.Inst().CfgRankTypes());
        if (NewServerCompetitionView.rankTypeSel) {
            for (var i = 0; i < rank_types.length; i++) {
                if (rank_types[i].rank_type == NewServerCompetitionView.rankTypeSel) {
                    NewServerCompetitionView.typeSelIndex = i
                }
            }
        }
        this.viewNode.TypeList.SetData(rank_types, this.OnClickTypeItem.bind(this), NewServerCompetitionView.typeSelIndex)
    }

    private FlushInfoShow() {
        // let rank_data = RankData.Inst().GetRankList(GetCfgValue(NewServerCompetitionRankType, NewServerCompetitionView.rankTypeSel));
        let rank_data = NewServerCompetitionData.Inst().GetRankList(GetCfgValue(NewServerCompetitionRankType, NewServerCompetitionView.rankTypeSel));
        if (undefined == rank_data) { return; }
        this.viewNode.RankList.SetData(NewServerCompetitionData.Inst().GetRankListShow(rank_data.ranklist, NewServerCompetitionView.rankTypeSel));
        this.viewNode.RankMe.SetDataMy(rank_data.myRank, rank_data.myRankValue);
        this.viewNode.TimeShow.CloseCountDownTime()
        let end_time = NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(NewServerCompetitionView.rankTypeSel)
        if (end_time > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(end_time, TimeFormatType.TYPE_TIME_3, Language.NewServerCompetition.TimeShow)
            this.viewNode.TimeShow.SetCallBack(this.FlushShow.bind(this))
        } else {
            this.viewNode.TimeShow.SetTime(Language.NewServerCompetition.ActEnd)
        }
        let rewards = NewServerCompetitionData.Inst().CfgRankGiftByRankTypeWithoutRewardType1(NewServerCompetitionView.rankTypeSel)
        this.viewNode.RewardItem1.SetData(rewards[0])
        this.viewNode.RewardItem2.SetData(rewards[1])
        this.viewNode.RewardItem3.SetData(rewards[2])

        this.viewNode.ProgressShow.value = NewServerCompetitionData.Inst().GetRewardProgressVal(NewServerCompetitionView.rankTypeSel, rewards[0].parameter_1, rewards[2].parameter_1);
        this.viewNode.ProgressShow.max = Math.abs(rewards[2].parameter_1 - rewards[0].parameter_1);
    }

    private OnScrollEnd() {
        // RankCtrl.Inst().SendRankReq(GetCfgValue(NewServerCompetitionRankType, NewServerCompetitionView.rankTypeSel))
        // NewServerCompetitionCtrl.Inst().SendRandActivityOperaReqRankInfo(GetCfgValue(NewServerCompetitionRankType, NewServerCompetitionView.rankTypeSel))
    }

    private OnClickClose() {
        ViewManager.Inst().CloseView(NewServerCompetitionView);
    }

    private OnClickTypeItem(item: NewServerCompetitionTypeItem) {
        let data = item.GetData()
        let end_time = NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(data.rank_type)
        let server_time = TimeCtrl.Inst().ServerTime
        let not_open = (end_time - server_time) > (data.continuou_times * 86400)
        if (not_open) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.NewServerCompetition.OpenDay, Math.ceil((end_time - server_time - (data.continuou_times * 86400)) / 86400)))
            this.FlushShow()
        } else {
            NewServerCompetitionView.rankTypeSel = data.rank_type
            NewServerCompetitionView.typeSelIndex = this.viewNode.TypeList.selectedIndex
            // RankCtrl.Inst().SendRankReq(GetCfgValue(NewServerCompetitionRankType, NewServerCompetitionView.rankTypeSel), 0)
            NewServerCompetitionCtrl.Inst().SendRandActivityOperaReqRankInfo(GetCfgValue(NewServerCompetitionRankType, NewServerCompetitionView.rankTypeSel))
            this.FlushInfoShow();
        }
    }

    private OnClickRewardItem(item: NewServerCompetitionRewardItem) {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        let data = item.GetData();
        let info = NewServerCompetitionData.Inst().GetRankRewardGet(data.rank_type, data.seq, data.parameter_1);
        if (info.can_get && !info.is_get) {
            NewServerCompetitionCtrl.Inst().SendRandActivityOperaReqGetReward(data.rank_type, data.seq)
        }
    }
}


export class NewServerCompetitionRankItem extends BaseItem {
    protected viewNode = {
        RankImg: <fgui.GLoader>null,
        RankTxt: <fgui.GTextField>null,
        NameShow: <fgui.GTextField>null,
        ValShow: <fgui.GRichTextField>null,
        EmptyShow: <fgui.GTextField>null,
        Head: <AvatarCell>null,
        RewardList: <fgui.GList>null,
        icon: <fgui.GLoader>null,
        UIEffectShow: <UIEffectShow>null,
        BgCap: <fgui.GImage>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Head.onClick(this.OtherRoleInfo.bind(this));
    }

    public SetData(data?: { info: IPB_RoleInfo, rank: number, value: number, name: string, co?: any }) {
        this._data = data;
        this.viewNode.UIEffectShow.StopAllEff()
        if (data) {
            let is_empty = null == data.info
            let role_name = data.name
            let role_rank = data.rank
            let rank_co = data.co
            let info_show = !(is_empty && (0 == (rank_co ? rank_co.parameter_3 : 0)))
            if (role_rank > 0 && role_rank <= 3) {
                this.viewNode.UIEffectShow.PlayEff(1 == role_rank ? 4164105 : (2 == role_rank ? 4164106 : 4164107))
                this.viewNode.RankImg.visible = false
            } else {
                this.viewNode.RankImg.visible = true
            }
            // UH.SpriteName(this.viewNode.RankImg, "MoreServerNewServerCompetition", (0 == role_rank || role_rank > 3) ? "PaiMingDi" : `PaiMing${role_rank}`)
            UH.SetText(this.viewNode.RankTxt, 0 == role_rank ? Language.NewServerCompetition.NoRank : (role_rank > 3 ? role_rank : ""))
            UH.SetText(this.viewNode.NameShow, role_name)
            if (!is_empty) {
                this.viewNode.Head.SetData(new AvatarData(data.info.headPicId, data.info.level, data.info.headChar));
            }
            this.viewNode.Head.visible = !is_empty;
            this.viewNode.EmptyShow.visible = is_empty;
            this.viewNode.BgCap.visible = info_show
            this.viewNode.ValShow.visible = info_show
            UH.SetText(this.viewNode.ValShow, is_empty ? TextHelper.Format(GetCfgValue(Language.NewServerCompetition.RankEmptyVal, NewServerCompetitionView.rankTypeSel), 0 == NewServerCompetitionView.rankTypeSel ? role_rank : (rank_co ? rank_co.parameter_3 : 0)) : TextHelper.Format(GetCfgValue(Language.NewServerCompetition.RankVal, NewServerCompetitionView.rankTypeSel), 0 == NewServerCompetitionView.rankTypeSel ? role_rank : data.value))
            let rewards = [];
            let co = rank_co ?? NewServerCompetitionData.Inst().CfgRankGiftByRankTypeRank(NewServerCompetitionView.rankTypeSel, data.rank)
            let rewad_list = co ? co.reward_item : [];
            for (let i = 0; i < rewad_list.length; i++) {
                rewards.push(Item.Create(rewad_list[i], { is_num: true }))
            }
            this.viewNode.RewardList.SetData(rewards)
        }
    }

    public SetDataMy(my_rank: number, my_rank_value: number) {
        UH.SpriteName(this.viewNode.icon, "MoreServerNewServerCompetition", "HuaDongDi2")
        let mrn = new PB_RoleInfo()
        mrn.roleId = RoleData.Inst().GetRoleId();
        mrn.level = RoleData.Inst().GetRoleLevel();
        mrn.roleId = RoleData.Inst().GetRoleId();
        mrn.headChar = RoleData.Inst().ResultData.roleinfo.headChar
        // my_info.info.roleinfo.name = RoleData.Inst().GetRoleName();
        this.SetData({ info: mrn, rank: my_rank, value: my_rank_value, name: RoleData.Inst().GetRoleName(), co: my_rank > 0 ? NewServerCompetitionData.Inst().CfgRankGiftByRankTypeRank(NewServerCompetitionView.rankTypeSel, my_rank) : null })
    }

    private OtherRoleInfo() {
        let type = NewServerCompetitionView.rankTypeSel;
        if (this._data) {
            if (this._data.role_id < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(RANK_TO_OTHER[type], this._data.value, this._data.info.roleId);
        }
    }
}

export class NewServerCompetitionTypeItem extends BaseItemGB {
    protected viewNode = {
        NameShow1: <fgui.GTextField>null,
        NameShow2: <fgui.GTextField>null,
        NameShow3: <fgui.GTextField>null,

        LockShow: <fgui.GImage>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        let end_time = NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(data.rank_type)
        let server_time = TimeCtrl.Inst().ServerTime
        let not_open = (end_time - server_time) > (data.continuou_times * 86400)
        this.grayed = not_open
        UH.SetText(this.viewNode.NameShow1, GetCfgValue(Language.NewServerCompetition.RankNames, data.rank_type))
        UH.SetText(this.viewNode.NameShow2, GetCfgValue(Language.NewServerCompetition.RankNames, data.rank_type))
        UH.SetText(this.viewNode.NameShow3, GetCfgValue(Language.NewServerCompetition.RankNames, data.rank_type))

        let rp = 0
        let rewards = NewServerCompetitionData.Inst().CfgRankGiftByRankTypeWithoutRewardType1(data.rank_type)
        if (!not_open) {
            for (let i = 0; i <= 2; i++) {
                let reward = rewards[i]
                let info = NewServerCompetitionData.Inst().GetRankRewardGet(reward.rank_type, reward.seq, reward.parameter_1);
                if (!info.is_get && info.can_get) {
                    rp = 1
                    break
                }
            }
        }
        this.viewNode.RedPointShow.SetNum(rp)
    }
}

export class NewServerCompetitionRewardItem extends BaseItemGB {
    protected viewNode = {
        CellShow: <ItemCell>null,
        TxtShow: <fgui.GTextField>null,
        MaskObj: <fgui.GImage>null,
        GetedObj: <fgui.GImage>null,
        SuoObj: <fgui.GImage>null,
        UIEffectShow: <UIEffectShow>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        this.viewNode.UIEffectShow.StopAllEff()
        if (data) {
            let info = NewServerCompetitionData.Inst().GetRankRewardGet(data.rank_type, data.seq, data.parameter_1);
            this.viewNode.MaskObj.visible = info.is_get || !info.can_get
            this.viewNode.GetedObj.visible = info.is_get
            this.viewNode.SuoObj.visible = !info.can_get
            this.viewNode.CellShow.SetData(Item.Create(data.reward_item[0], { is_num: true }));
            UH.SetText(this.viewNode.TxtShow, TextHelper.Format(GetCfgValue(Language.NewServerCompetition.RewardVal, NewServerCompetitionView.rankTypeSel), data.parameter_1));
            let rp = 0
            if (!info.is_get && info.can_get) {
                rp = 1
                this.viewNode.UIEffectShow.PlayEff(4164108)
                this.viewNode.CellShow.touchable = false
            } else {
                this.viewNode.CellShow.touchable = true
            }
            this.viewNode.RedPointShow.SetNum(rp)
        }
    }
}

import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { BattleCtrl } from "modules/battle/BattleCtrl";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BasePanel } from "modules/common/BasePanel";
import { COLORS } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { MainCapItem } from "modules/main/MainItems";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TrailChengJiuView } from "./TrailChengJiuView";
import { TrialConfig } from "./TrialConfig";
import { TrialCtrl } from "./TrialCtrl";
import { TrialData } from "./TrialData";
import { TrialGuMoRewardView } from "./TrialGuMoRewardView";

export class TrialGuMoTowerPanel extends BasePanel {
    guide_tag: string[] = []
    private layerSelIndex: number
    private levelSelIndex: number
    private is_flush_info: boolean = false

    protected viewNode = {
        BtnFight: <fgui.GButton>null,

        LayerList: <fgui.GList>null,
        LevelList: <fgui.GList>null,
        ConditionList: <fgui.GList>null,
        RewardList: <fgui.GList>null,

        ProgressStar: <fgui.GProgressBar>null,
        StarReward1: <TrialGuMoTowerPanelStarRewardItem>null,
        StarReward2: <TrialGuMoTowerPanelStarRewardItem>null,
        StarReward3: <TrialGuMoTowerPanelStarRewardItem>null,
        CapShow: <MainCapItem>null,

        UIModelShow: <UIModelShow>null,

        BtnBox: <fgui.GButton>null,
        // BtnBoxGet: <fgui.GButton>null,
        BoxLight: <fgui.GImage>null,
        RedPointShow: <RedPoint>null,
        BtnChengJiu: <fgui.GButton>null,
        ChengJiuRedPoint: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "GuMoLayerItem", ExtendsClass: TrialGuMoTowerPanelLayerItem },
        { ResName: "GuMoLevelItem", ExtendsClass: TrialGuMoTowerPanelLevelItem },
        { ResName: "GuMoConditionItem", ExtendsClass: TrialGuMoTowerPanelConditionItem },
        { ResName: "GuMoStarRewardItem", ExtendsClass: TrialGuMoTowerPanelStarRewardItem },

    ];

    InitPanelData() {
        this.viewNode.BtnBox.onClick(this.OnClickBox, this);
        // this.viewNode.BtnBoxGet.onClick(this.OnClickBoxGet, this);
        this.viewNode.BtnChengJiu.onClick(this.OnClickChengJiu, this);

        this.viewNode.LayerList.setVirtual();
        this.viewNode.LayerList.on(fgui.Event.CLICK_ITEM, this.OnClickLayerItem, this);

        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushGuMoLayerShow.bind(this), "GuMoLayerFlush");
        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushGuMoListShow.bind(this), "GuMoListInfo");
        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushChengJiu.bind(this), "GuMoLayerInfo", "TrialChengJiuInfo", "GuMoLayerFlush");

        this.viewNode.BtnFight.onClick(this.OnClickFight, this);
        this.viewNode.StarReward1.onClick(this.OnClickRewardItem.bind(this, this.viewNode.StarReward1, 0))
        this.viewNode.StarReward2.onClick(this.OnClickRewardItem.bind(this, this.viewNode.StarReward2, 1))
        this.viewNode.StarReward3.onClick(this.OnClickRewardItem.bind(this, this.viewNode.StarReward3, 2))

        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("GuMoFightBtn", this.viewNode.BtnFight))
    }

    InitPanel() {
        this.FlushGuMoLayerShow();
        this.FlushGuMoListShow();
        this.FlushChengJiu()
    }

    ClosePanel() {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
    }

    private FlushGuMoLayerShow() {
        if (BattleCtrl.Inst().check(this, this.FlushGuMoLayerShow.bind(this))) {
            return
        }
        if (this.is_flush_info) {
            this.is_flush_info = false
        }
        else {
            let sel = TrialData.Inst().GetGuMoPagodaSel();
            this.layerSelIndex = sel.layer - 1
            this.levelSelIndex = sel.level - 1
        }
        // this.viewNode.LayerList.SetData(TrialData.Inst().CfgGuMoLayerShowList(), this.OnClickLayerItem.bind(this), this.layerSelIndex)
        this.viewNode.LayerList.SetData(TrialData.Inst().CfgGuMoLayerShowList())
        this.viewNode.LayerList.scrollToView(this.layerSelIndex)
        this.viewNode.LayerList.selectedIndex = this.layerSelIndex
        let index = this.viewNode.LayerList.itemIndexToChildIndex(this.layerSelIndex);
        let item = this.viewNode.LayerList.getChildAt(index)
        this.OnClickLayerItem(<TrialGuMoTowerPanelLayerItem>item)
    }

    private FlushGuMoListShow() {
        let info = TrialData.Inst().ResultData.GuMoListInfo
        // this.viewNode.BtnBoxGet.grayed = 1 == info.dayReward || 0 == info.lastdayLevel
        // this.viewNode.BtnBoxGet.title = 1 == info.dayReward ? Language.Trial.GuMoTower.DayRewardGeted : Language.Trial.GuMoTower.DayRewardGet
        this.viewNode.RedPointShow.SetNum((0 == info.dayReward && info.lastdayLevel > 0) ? 1 : 0);
    }

    private FlushGuMoLevelShow() {
        this.viewNode.LevelList.SetData(TrialData.Inst().CfgGuMoLevelShowList(TrialData.Inst().GuMoViewInfo.layerSel), this.OnClickLevelItem.bind(this), this.levelSelIndex)
    }

    private FlushGuMoInfoShow() {
        let info = TrialData.Inst().CfgGuMoLevelShowInfo(TrialData.Inst().GuMoViewInfo.layerSel, TrialData.Inst().GuMoViewInfo.levelSel);
        let rewards = []
        let star_rewars = TrialData.Inst().CfgGuMoStarShowRewards(info.layer);
        for (let i = 0; i < info.win.length; i++) {
            rewards.push(Item.Create(info.win[i], { is_num: true }))
        }
        this.viewNode.CapShow.SetData(info.score);
        this.viewNode.ConditionList.SetData(TrialData.Inst().CfgGuMoStarShowConditions(info.stars));
        this.viewNode.ProgressStar.value = TrialData.Inst().GetGuMoPagodaLayerStars(TrialData.Inst().GuMoViewInfo.layerSel);
        this.viewNode.ProgressStar.max = TrialConfig.GUMO_LAYER_STAR_MAX;
        this.viewNode.RewardList.SetData(rewards);
        this.viewNode.StarReward1.SetData(star_rewars[0])
        this.viewNode.StarReward2.SetData(star_rewars[1])
        this.viewNode.StarReward3.SetData(star_rewars[2])
        this.viewNode.UIModelShow.setPath(ResPath.Npc(info.res_id));
    }


    private OnClickLayerItem(item: TrialGuMoTowerPanelLayerItem) {
        let data = item.GetData();
        TrialData.Inst().GuMoViewInfo.layerSel = data.layer
        this.layerSelIndex = this.viewNode.LayerList.selectedIndex
        this.FlushGuMoLevelShow();
    }

    private OnClickLevelItem(item: TrialGuMoTowerPanelLevelItem) {
        let data = item.GetData();
        TrialData.Inst().GuMoViewInfo.levelSel = data.layer_level
        this.levelSelIndex = this.viewNode.LevelList.selectedIndex
        this.FlushGuMoInfoShow();
    }

    private OnClickRewardItem(item: TrialGuMoTowerPanelStarRewardItem, index: number) {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        let data = item.GetData();
        let info = TrialData.Inst().GetGuMoPagodaRewardGet(data.stars_num);
        if (info.can_get && !info.is_get) {
            TrialCtrl.Inst().SendGuMoPagodaReqFetchBox(data.layer, index)
            this.is_flush_info = true
        }
    }

    private OnClickFight() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        let info = TrialData.Inst().CfgGuMoLevelShowInfo(TrialData.Inst().GuMoViewInfo.layerSel, TrialData.Inst().GuMoViewInfo.levelSel);
        TrialCtrl.Inst().SendGuMoPagodaReqFight(info.level);
        let fightLayer = TrialData.Inst().GuMoViewInfo.layerSel
        let fightLevel = TrialData.Inst().GuMoViewInfo.levelSel
        TrialData.Inst().FinishStarFunc = () => {
            return TrialData.Inst().GetGuMoPagodaLevelStars(fightLayer, fightLevel)
        }
    }

    private OnClickBox() {
        // let info = TrialData.Inst().GetDayRewardShow()
        // if (info.succ) {
        //     let listInfo = TrialData.Inst().ResultData.GuMoListInfo
        //     if (listInfo && 0 == listInfo.dayReward && listInfo.lastdayLevel > 0) {
        //         ViewManager.Inst().OpenView(CommonRewardView, { reward_data: info.rewards })
        //     } else {
        //         let level = TrialData.Inst().ResultData.GuMoListInfo.lastdayLevel
        //         TrialCtrl.Inst().SendGuMoPagodaReqDayReward(level)
        //     }
        // } else {
        //     PublicPopupCtrl.Inst().Center(Language.Trial.GuMoTower.DayReward0)
        // }
        ViewManager.Inst().OpenView(TrialGuMoRewardView)
    }

    private OnClickBoxGet() {
        let level = TrialData.Inst().ResultData.GuMoListInfo.lastdayLevel
        if (level > 0) {
            TrialCtrl.Inst().SendGuMoPagodaReqDayReward(level)
        } else {
            PublicPopupCtrl.Inst().Center(Language.Trial.GuMoTower.DayReward0)
        }
    }

    private OnClickChengJiu() {
        ViewManager.Inst().OpenView(TrailChengJiuView)
    }

    private FlushChengJiu() {
        let is_open = TrialData.Inst().GetTrailChengJiuIsOpen()
        this.viewNode.BtnChengJiu.visible = ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.GuMoChengJiu) && is_open
        let red = TrialData.Inst().GetTrailChengJiuAllRed()
        this.viewNode.ChengJiuRedPoint.SetNum(red)
        // LogError("Cheng Jiu Open = " + is_open)
    }
}

export class TrialGuMoTowerPanelLayerItem extends BaseItemGB {
    protected viewNode = {
        LayerShow: <fgui.GTextField>null,
        StarShow: <fgui.GTextField>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        UH.SetText(this.viewNode.LayerShow, TextHelper.Format(Language.Trial.GuMoTower.LayerShow, data.layer))
        UH.SetText(this.viewNode.StarShow, TrialData.Inst().GetGuMoPagodaLayerStars(data.layer))

        let red_point_show = false
        for (let i = 1; i <= 3; i++) {
            let info = TrialData.Inst().GetGuMoPagodaRewardGet(i * 5, data.layer);
            if (info.can_get && !info.is_get) {
                red_point_show = true
                break
            }
        }
        this.viewNode.RedPointShow.SetNum(red_point_show ? 1 : 0);
    }
}

export class TrialGuMoTowerPanelLevelItem extends BaseItemGB {
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        IconSp: <fgui.GLoader>null,
        StarShow1: <fgui.GImage>null,
        StarShow2: <fgui.GImage>null,
        StarShow3: <fgui.GImage>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        let stars = TrialData.Inst().GetGuMoPagodaLevelStars(data.layer, data.layer_level)
        UH.SetText(this.viewNode.NameShow, TextHelper.Format(Language.Trial.TrialTower.LevelNameShow, data.level))
        this.viewNode.StarShow1.visible = stars >= 1
        this.viewNode.StarShow2.visible = stars >= 2
        this.viewNode.StarShow3.visible = stars >= 3
        UH.SetIcon(this.viewNode.IconSp, data.icon_id, ICON_TYPE.ITEM)
    }
}

export class TrialGuMoTowerPanelConditionItem extends BaseItem {
    protected viewNode = {
        ConditonShow: <fgui.GTextField>null,
        StarShow: <fgui.GImage>null,
    };

    public SetData(data: any) {
        let is_pass = TrialData.Inst().GetGuMoPagodaLevelConditionPass(TrialData.Inst().GuMoViewInfo.layerSel, TrialData.Inst().GuMoViewInfo.levelSel, data.order_num)
        UH.SetText(this.viewNode.ConditonShow, TextHelper.Format(Language.Trial.GuMoTower.ConditionFont, DataHelper.GetDaXie(data.order_num), data.txt));
        this.viewNode.ConditonShow.color = is_pass ? COLORS.Yellow5 : COLORS.Gray1
        this.viewNode.StarShow.visible = is_pass
    }
}

export class TrialGuMoTowerPanelStarRewardItem extends BaseItemGB {
    protected viewNode = {
        CellShow: <ItemCell>null,
        StarShow: <fgui.GTextField>null,
        MaskObj: <fgui.GImage>null,
        GetedObj: <fgui.GImage>null,
        SuoObj: <fgui.GImage>null,
        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        let info = TrialData.Inst().GetGuMoPagodaRewardGet(data.stars_num);
        this.viewNode.MaskObj.visible = info.is_get || !info.can_get
        this.viewNode.GetedObj.visible = info.is_get
        this.viewNode.SuoObj.visible = !info.can_get
        this.viewNode.RedPointShow.SetNum((info.can_get && !info.is_get) ? 1 : 0);
        UH.SetText(this.viewNode.StarShow, TextHelper.Format(Language.Trial.GuMoTower.StarReward, data.stars_num));
        this.viewNode.CellShow.SetData(Item.Create(data.stars_reward[0], { is_num: true, is_click: info.is_get || !info.can_get }));
    }
}
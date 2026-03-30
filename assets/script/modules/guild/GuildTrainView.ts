
import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItemGB } from "modules/common/BaseItem";
import { BasePanel } from 'modules/common/BasePanel';
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { Currency } from "modules/extends/Currency";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";

@BaseView.registView
export class GuildTrainView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildTrain",
        ViewName: "GuildTrainView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected extendsCfg = [
        { ResName: "ShowItemP", ExtendsClass: GuildTrainViewShowItem },
        { ResName: "ShowItemA", ExtendsClass: GuildTrainViewShowItem },
    ];

    protected boardCfg: boardCfg = {
        TabberCfg: [
            { panel: GuildTrainPrimaryPanel, viewName: "GuildTrainPrimaryPanel", titleName: Language.Guild.GuildTrain.TabTrainPrimary, tileShowName: Language.Guild.GuildTrain.TabTrain, modKey: Mod.GuildTrain.Primary, helpTips: 11, btnCloseShow: false },
            {
                panel: GuildTrainAdvancedPanel, viewName: "GuildTrainAdvancedPanel", titleName: Language.Guild.GuildTrain.TabTrainAdvanced, tileShowName: Language.Guild.GuildTrain.TabTrain, modKey: Mod.GuildTrain.Advanced, helpTips: 12, btnCloseShow: false, check_func: () => {
                    let info = GuildData.Inst().ResultData.RoleInfo
                    let levels = 0
                    for (let element of info.exercisePartLevel) {
                        levels += element
                    }
                    let not_open = levels < GuildData.Inst().CfgOtherAdavncedBuildOpenLevel();
                    if (not_open) {
                        PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Guild.GuildTrain.AdvancedOpenTips, GuildData.Inst().CfgOtherAdavncedBuildOpenLevel()))
                    }
                    return not_open
                }
            },
        ],
    };

    InitData() {
    }
}

export class GuildTrainViewShowItem extends BaseItemGB {
    protected viewNode = {
        LevelShow: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        UH.SetText(this.viewNode.LevelShow, `Lv.${data}`)
    }
}


export class GuildTrainPrimaryPanel extends BasePanel {
    private itemCtrler: fgui.Controller
    private curPartType = 0
    private selPartId = 0

    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnTrain: <fgui.GButton>null,
        BtnReset: <fgui.GButton>null,

        LevelShow: <fgui.GTextField>null,
        GpCondition: <fgui.GGroup>null,
        GpCost: <fgui.GGroup>null,
        CurrencyShow: <Currency>null,
        UIModelShow: <UIModelShow>null,

        PartNameShow: <fgui.GTextField>null,
        LevelCur: <fgui.GTextField>null,
        LevelNext: <fgui.GTextField>null,
        AttrNameShow: <fgui.GTextField>null,
        AttrCur: <fgui.GTextField>null,
        AttrNext: <fgui.GTextField>null,

        ConditionShow: <fgui.GRichTextField>null,

        CostIcon: <fgui.GLoader>null,
        CostNum: <fgui.GTextField>null,

        ShowItem0: <GuildTrainViewShowItem>null,
        ShowItem1: <GuildTrainViewShowItem>null,
        ShowItem2: <GuildTrainViewShowItem>null,
        ShowItem3: <GuildTrainViewShowItem>null,
        ShowItem4: <GuildTrainViewShowItem>null,
        ShowItem5: <GuildTrainViewShowItem>null,

        UIEffectShow: <UIEffectShow>null,
    };

    InitPanelData() {
        this.itemCtrler = this.view.getController("ItemSel");
        this.itemCtrler.onChanged(this.OnSelectChange.bind(this));

        this.viewNode.BtnClose.onClick(this.OnClickClose, this);
        this.viewNode.BtnTrain.onClick(this.OnClickTrain, this);
        this.viewNode.BtnReset.onClick(this.OnClickReset, this);

        this.viewNode.CurrencyShow.SetCurrencyId(GuildData.Inst().CfgPlayExerciseCostItem(this.curPartType), true);
        this.viewNode.CurrencyShow.BtnAddShow(false)

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushRoleInfo.bind(this), "RoleInfo");
    }

    InitPanel() {
        this.FlushRoleInfo();

        let appear = RoleData.Inst().GetAppearanceRes(true)
        this.viewNode.UIModelShow.setPath(ResPath.ActorRole(10001), appear);
    }

    ClosePanel() {
    }

    FlushRoleInfo() {
        let role_info = GuildData.Inst().ResultData.RoleInfo

        let level_t = 0
        for (let i = 0; i < 6; i++) {
            let level = role_info.exercisePartLevel[i] ?? 0
            level_t = level_t + level
            let item = <GuildTrainViewShowItem>GetCfgValue(this.viewNode, "ShowItem" + i)
            item.SetData(level)
        }
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Guild.GuildTrain.LevelShow, level_t))

        let level = role_info.exercisePartLevel[this.selPartId] ?? 0
        let co_cur = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level)
        let co_next = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level + 1)
        let co = co_cur ?? co_next
        let is_max = undefined == co_next

        UH.SetText(this.viewNode.PartNameShow, Language.Guild.GuildTrain.PartNames[this.selPartId])
        UH.SetText(this.viewNode.LevelCur, `Lv.${level}`)
        UH.SetText(this.viewNode.LevelNext, `Lv.${level + 1}`)
        UH.SetText(this.viewNode.AttrNameShow, AttrListName[co.part_att[0].type])
        UH.SetText(this.viewNode.AttrCur, co_cur ? AttrHelper.Percent(co.part_att[0].type, co_cur.part_att[0].add) : 0)
        UH.SetText(this.viewNode.AttrNext, co_next ? AttrHelper.Percent(co.part_att[0].type, co_next.part_att[0].add) : 0)

        this.viewNode.GpCondition.visible = !is_max && (level_t < co_next.part_limit_level)
        UH.SetText(this.viewNode.ConditionShow, TextHelper.Format(Language.Guild.GuildTrain.ConditionShow[this.curPartType], co_next ? co_next.part_limit_level : 0))

        this.viewNode.GpCost.visible = !is_max
        if (!is_max) {
            UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(co_next.exercise[0].item_id), ICON_TYPE.ITEM);
            UH.SetText(this.viewNode.CostNum, co_next.exercise[0].num);
        }
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(GuildTrainView)
    }

    OnClickTrain() {
        GuildCtrl.Inst().SendGuildExercise(this.curPartType, this.selPartId)

        let role_info = GuildData.Inst().ResultData.RoleInfo
        let level = role_info.exercisePartLevel[this.selPartId] ?? 0
        let co_cur = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level)
        let co_next = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level + 1)
        let is_max = undefined == co_next
        if (!is_max && BagData.Inst().getItemNum(co_next.exercise[0].item_id) >= co_next.exercise[0].num) {
            let level_t = 0
            for (let i = 0; i < 6; i++) {
                let level = role_info.exercisePartLevel[i] ?? 0
                level_t = level_t + level
                let item = <GuildTrainViewShowItem>GetCfgValue(this.viewNode, "ShowItem" + i)
                item.SetData(level)
            }
            if (level_t >= co_next.part_limit_level) {
                this.viewNode.UIEffectShow.PlayEff(4164141)
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[co_next.part_att[0].type]} +${AttrHelper.Percent(co_next.part_att[0].type, co_next.part_att[0].add - (co_cur ? co_cur.part_att[0].add : 0))}`, 1)
            }
        }
    }

    OnClickReset() {
        let rebuild = GuildData.Inst().CfgOtherRebuild()
        PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Guild.GuildTrain.ResetTips, rebuild.num, Item.GetName(rebuild.item_id)), DialogTipsTypes.guild_train_reset, () => {
            GuildCtrl.Inst().SendGuildReqExerciseReset(this.curPartType)
        });
    }

    OnSelectChange() {
        this.selPartId = this.itemCtrler.selectedIndex
        this.FlushRoleInfo()
    }
}

export class GuildTrainAdvancedPanel extends BasePanel {
    private itemCtrler: fgui.Controller
    private curPartType = 1
    private selPartId = 0

    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnTrain: <fgui.GButton>null,
        BtnReset: <fgui.GButton>null,

        LevelShow: <fgui.GTextField>null,
        GpCondition: <fgui.GGroup>null,
        GpCost: <fgui.GGroup>null,
        CurrencyShow: <Currency>null,
        UIModelShow: <UIModelShow>null,

        PartNameShow: <fgui.GTextField>null,
        LevelCur: <fgui.GTextField>null,
        LevelNext: <fgui.GTextField>null,
        AttrNameShow: <fgui.GTextField>null,
        AttrCur: <fgui.GTextField>null,
        AttrNext: <fgui.GTextField>null,

        ConditionShow: <fgui.GRichTextField>null,

        CostIcon: <fgui.GLoader>null,
        CostNum: <fgui.GTextField>null,

        ShowItem0: <GuildTrainViewShowItem>null,
        ShowItem1: <GuildTrainViewShowItem>null,
        ShowItem2: <GuildTrainViewShowItem>null,
        ShowItem3: <GuildTrainViewShowItem>null,
        ShowItem4: <GuildTrainViewShowItem>null,
        ShowItem5: <GuildTrainViewShowItem>null,

        UIEffectShow: <UIEffectShow>null,
    };

    InitPanelData() {
        this.itemCtrler = this.view.getController("ItemSel");
        this.itemCtrler.onChanged(this.OnSelectChange.bind(this));

        this.viewNode.BtnClose.onClick(this.OnClickClose, this);
        this.viewNode.BtnTrain.onClick(this.OnClickTrain, this);
        this.viewNode.BtnReset.onClick(this.OnClickReset, this);

        this.viewNode.CurrencyShow.SetCurrencyId(GuildData.Inst().CfgPlayExerciseCostItem(this.curPartType), true);
        this.viewNode.CurrencyShow.BtnAddShow(false)

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushRoleInfo.bind(this), "RoleInfo");
    }

    InitPanel() {
        this.FlushRoleInfo();

        let appear = RoleData.Inst().GetAppearanceRes(true)
        this.viewNode.UIModelShow.setPath(ResPath.ActorRole(10001), appear);
    }

    ClosePanel() {
    }

    FlushRoleInfo() {
        let role_info = GuildData.Inst().ResultData.RoleInfo

        let level_t = 0
        for (let i = 0; i < 6; i++) {
            let level = role_info.exercisePartLevel[i + 6] ?? 0
            level_t = level_t + level
            let item = <GuildTrainViewShowItem>GetCfgValue(this.viewNode, "ShowItem" + i)
            item.SetData(level)
        }
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Guild.GuildTrain.LevelShow, level_t))

        let level = role_info.exercisePartLevel[this.selPartId + 6] ?? 0
        let co_cur = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level)
        let co_next = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level + 1)
        let co = co_cur ?? co_next
        let is_max = undefined == co_next

        UH.SetText(this.viewNode.PartNameShow, Language.Guild.GuildTrain.PartNames[this.selPartId])
        UH.SetText(this.viewNode.LevelCur, `Lv.${level}`)
        UH.SetText(this.viewNode.LevelNext, `Lv.${level + 1}`)
        UH.SetText(this.viewNode.AttrNameShow, AttrListName[co.part_att[0].type])
        UH.SetText(this.viewNode.AttrCur, co_cur ? AttrHelper.Percent(co.part_att[0].type, co_cur.part_att[0].add) : 0)
        UH.SetText(this.viewNode.AttrNext, co_next ? AttrHelper.Percent(co.part_att[0].type, co_next.part_att[0].add) : 0)

        this.viewNode.GpCondition.visible = !is_max && (level_t < co_next.part_limit_level)
        UH.SetText(this.viewNode.ConditionShow, TextHelper.Format(Language.Guild.GuildTrain.ConditionShow[this.curPartType], co_next ? co_next.part_limit_level : 0))

        this.viewNode.GpCost.visible = !is_max
        if (!is_max) {
            UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(co_next.exercise[0].item_id), ICON_TYPE.ITEM);
            UH.SetText(this.viewNode.CostNum, co_next.exercise[0].num);
        }
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(GuildTrainView)
    }

    OnClickTrain() {
        GuildCtrl.Inst().SendGuildExercise(this.curPartType, this.selPartId)

        let role_info = GuildData.Inst().ResultData.RoleInfo
        let level = role_info.exercisePartLevel[this.selPartId] ?? 0
        let co_cur = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level)
        let co_next = GuildData.Inst().GetPlayerExerciseInfoByTypeIdLevel(this.curPartType, this.selPartId, level + 1)
        let is_max = undefined == co_next
        if (!is_max && BagData.Inst().getItemNum(co_next.exercise[0].item_id) >= co_next.exercise[0].num) {
            let level_t = 0
            for (let i = 0; i < 6; i++) {
                let level = role_info.exercisePartLevel[i] ?? 0
                level_t = level_t + level
                let item = <GuildTrainViewShowItem>GetCfgValue(this.viewNode, "ShowItem" + i)
                item.SetData(level)
            }
            if (level_t >= co_next.part_limit_level) {
                this.viewNode.UIEffectShow.PlayEff(4164141)
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[co_next.part_att[0].type]} +${AttrHelper.Percent(co_next.part_att[0].type, co_next.part_att[0].add - (co_cur ? co_cur.part_att[0].add : 0))}`, 1)
            }
        }
    }

    OnClickReset() {
        let rebuild = GuildData.Inst().CfgOtherRebuild()
        PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Guild.GuildTrain.ResetTips, rebuild.num, Item.GetName(rebuild.item_id)), DialogTipsTypes.guild_train_reset, () => {
            GuildCtrl.Inst().SendGuildReqExerciseReset(this.curPartType)
        });
    }

    OnSelectChange() {
        this.selPartId = this.itemCtrler.selectedIndex
        this.FlushRoleInfo()
    }
}

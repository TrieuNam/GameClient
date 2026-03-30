import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ShenQiCtrl } from "modules/shenqi/ShenQiCtrl";
import { ShenQiData } from "modules/shenqi/ShenQiData";
import { ShenQiEnergyView } from "modules/shenqi/ShenQiEnergyView";
import { UpLevelShowView } from "modules/UpLevelShow/UpLevelShowView";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class ShenQiInfoView extends BaseView {
    private shenQiId: number
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "ShenQiInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard4>null,
        BtnUp: <fgui.GButton>null,
        BtnWear: <fgui.GButton>null,

        NameShow: <fgui.GRichTextField>null,
        LevelShow: <fgui.GTextField>null,
        NumShow: <fgui.GTextField>null,
        DescShow1: <fgui.GTextField>null,
        DescShow2: <fgui.GTextField>null,
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        GpNext: <fgui.GGroup>null,
    };


    InitUI() {
        this.FlushInfo()
        this.FlushOther()
    }

    InitData(param_t: any) {
        this.viewNode.Board.SetData(new BoardData(ShenQiInfoView));
        this.viewNode.BtnUp.onClick(this.OnClickUp, this);
        this.viewNode.BtnWear.onClick(this.OnClickWear, this);

        this.shenQiId = param_t ? param_t.id : 0
        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushInfo.bind(this), "FlushInfo");
        this.AddSmartDataCare(ShenQiData.Inst().ResultData, this.FlushOther.bind(this), "OtherInfo");
    }

    FlushInfo() {
        let info = ShenQiData.Inst().GetShenQiInfoById(this.shenQiId)
        let co_cur = ShenQiData.Inst().CfgShenQiInfoByIdLevel(this.shenQiId, info.level > 0 ? info.level : 1)
        let co_next = ShenQiData.Inst().CfgShenQiInfoByIdLevel(this.shenQiId, info.level + 1)

        let color = QualityColorStr[co_cur.quality];
        let color_ol = QualityColorOLStr[co_cur.quality];
        UH.SetText(this.viewNode.NameShow, TextHelper.RichTextOutLine(TextHelper.ColorStr(co_cur.name, color), color_ol, 2));
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${co_cur.quality}`)
        UH.SetIcon(this.viewNode.Icon, co_cur.icon, ICON_TYPE.ShenQi);
        UH.SetText(this.viewNode.LevelShow, info.level > 0 ? `Lv.${info.level}` : Language.ShenQi.ShenQiInfo.NotActive);
        UH.SetText(this.viewNode.DescShow1, (co_cur ?? co_next).dec)
        this.viewNode.GpNext.visible = (info.level > 0 && co_next != undefined);
        if (co_next) {
            UH.SetText(this.viewNode.DescShow2, (co_next ?? co_cur).dec)
            UH.SetText(this.viewNode.NumShow, TextHelper.Format(Language.ShenQi.ShenQiInfo.NumShow, info.num, co_next.exp));
        } else {
            UH.SetText(this.viewNode.NumShow, Language.ShenQi.ShenQiInfo.Max);
            this.viewNode.BtnUp.enabled = false
        }
    }

    FlushOther() {
        let is_wearing = ShenQiData.Inst().GetShenQiIsWearing(this.shenQiId)
        this.viewNode.BtnWear.title = is_wearing ? Language.ShenQi.ShenQiInfo.BtnWeard : Language.ShenQi.ShenQiInfo.BtnWear
        this.viewNode.BtnWear.grayed = is_wearing
    }


    OnClickUp() {
        let info = ShenQiData.Inst().GetShenQiInfoById(this.shenQiId)
        let co_next = ShenQiData.Inst().CfgShenQiInfoByIdLevel(this.shenQiId, info.level + 1)
        if (co_next) {
            if (CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.ShenQi, info.level + 1)) {
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.CoreCrisis.CoreLimitTips, Language.CoreCrisis.CoreName[CoreCrisisType.ShenQi]))
                ViewManager.Inst().OpenView(CoreCrisisView, { mark_type: CoreCrisisType.ShenQi })
                return
            }
            let energy_num = info.level > 0 ? BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiChip()) : 0
            if (info.num < co_next.exp && energy_num >= (co_next.exp - info.num)) {
                ViewManager.Inst().OpenView(ShenQiEnergyView, { id: this.shenQiId, num: co_next.exp - info.num })
                return
            } else if (info.num >= co_next.exp) {
                ViewManager.Inst().OpenView(UpLevelShowView, {
                    level_before: info.level,
                    level_after: info.level + 1,
                })
            }
        }
        ShenQiCtrl.Inst().SendShenQiReqLevelUp(this.shenQiId, false)
    }

    OnClickWear() {
        let info = ShenQiData.Inst().GetShenQiInfoById(this.shenQiId)
        let co = ShenQiData.Inst().CfgShenQiInfoById(this.shenQiId)
        if (0 == info.level) {
            PublicPopupCtrl.Inst().Center(Language.ShenQi.ShenQiInfo.NotActiveTips)
            return
        }
        if (ShenQiData.Inst().GetShenQiIsWearing(this.shenQiId)) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.ShenQi.ShenQiInfo.WearingTips, co.name))
            return
        }
        PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.ShenQi.ShenQiInfo.WearingTips, co.name))
        ShenQiCtrl.Inst().SendShenQiReqWearing(this.shenQiId)
    }

}
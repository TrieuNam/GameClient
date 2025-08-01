
import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BasePanel } from "modules/common/BasePanel";
import { QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Currency } from "modules/extends/Currency";
import { ItemCellFishEquip } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";
import { FishToolUpViewAttrItem } from "./FishToolUpView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { CfgOrbData } from "config/CfgOrb";
import { RedPoint } from "modules/extends/RedPoint";

export class FishToolUpGradePanel extends BasePanel 
{
    protected viewNode = {
        BtnUp: <fgui.GButton>null,

        CurrencyShow1:<Currency>null,
        CurrencyShow2:<Currency>null,

        CellShow: <ItemCellFishEquip>null,
        NameShow: <fgui.GRichTextField>null,
        LevelShow: <fgui.GTextField>null,
        AttrList: <FishToolUpViewAttrItem>null,
        TaskShow: <fgui.GTextField>null,
        gp_tip:<fgui.GGroup>null,
        max:<fgui.GObject>null,
        //升级
        redPoint:<RedPoint> null,
        //突破
        redPoint2:<RedPoint> null,
    };

    // protected extendsCfg = [
    //     { ResName: "GuMoLayerItem", ExtendsClass: TrialGuMoTowerPanelLayerItem },
    // ];
    InitPanelData() {
        this.viewNode.BtnUp.onClick(this.OnClickUp, this);

        this.viewNode.CurrencyShow1.SetCurrencyId(CommonId.Diamond);
        this.viewNode.CurrencyShow2.SetCurrencyId(FishData.Inst().CfgOtherUpItemId(), true);
        this.viewNode.CurrencyShow1.BtnAddShow(false)
        this.viewNode.CurrencyShow2.BtnAddShow(false)
        //this.viewNode.CellShow.effShow(false,4164134);
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushToolInfo.bind(this), "WaBaoToolInfo");
    }

    InitPanel() {
        this.FlushToolInfo();
    }

    ClosePanel() {
    }
    OnUnVisible(): void {
        this.viewNode.CellShow.effShow(false,4164134);
    }
    FlushToolInfo() {
        let tool_info = FishData.Inst().ResultData.WaBaoToolInfo
        let tool_level = tool_info.toolLevel
        let tool_grade = tool_info.toolGrade
        let condition_num = tool_info.conditionNum
        let item_seq = FishData.Inst().FishViewInfo.itemSeq
        // if(tool_grade[item_seq] != FishData.Inst().FishCurGrade){
        //     this.viewNode.CellShow.effShow(true,4164134);
        //     FishData.Inst().FishCurGrade = tool_grade[item_seq]
        // }
        let info = FishData.Inst().CfgUpgradInfo(item_seq, tool_level[item_seq]);
        let info_advance = FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq])
        let color = QualityColorStr[info.item_color];
        let color_ol = QualityColorOLStr[info.item_color];
        UH.SetText(this.viewNode.NameShow, TextHelper.RichTextOutLine(TextHelper.ColorStr(info.item_name, color), color_ol, 2));
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Fish.FishToolUp.LevelShow, tool_grade[item_seq], tool_level[item_seq]))
        this.viewNode.CellShow.SetData(info);
        this.viewNode.CellShow.LevelShow(false);
        let attr_list = []
        attr_list.push({index: 1,data:info_advance});
        let nextData = tool_grade[item_seq] == CfgOrbData.other[0].max_advance ? "max": FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq] + 1);
        //attr_list.push({cur:info_advance, next:FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq] + 1)})
        attr_list.push({index: 2,data:nextData,type:info_advance.item_type});
        this.viewNode.AttrList.SetData(attr_list);
        let can_up = tool_level[item_seq] >= info_advance.advance_need
        this.viewNode.max.visible = false;
        if(tool_grade[item_seq] == CfgOrbData.other[0].max_advance){
            this.viewNode.max.visible = true;
        }
        if(!can_up){
            this.viewNode.gp_tip.visible = true;
            this.viewNode.TaskShow.visible = false;
        }else{
            this.viewNode.gp_tip.visible = false;
            this.viewNode.TaskShow.visible = true;
        }
        UH.SetText(this.viewNode.TaskShow, can_up ? `${TextHelper.Format(GetCfgValue(Language.Fish.FishToolUp.ConditionShow, info_advance.condition), info_advance.param)}：${condition_num[item_seq]}/${info_advance.param}` : Language.Fish.FishToolUp.TaskUpNo)
        this.viewNode.redPoint2.SetNum(0);
        this.viewNode.redPoint.SetNum(0);
        if(FishData.Inst().GetWabaoToolUpRedPointByItemSeq(item_seq) == 3){
            this.viewNode.redPoint.SetNum(1);
        }else if(FishData.Inst().GetWabaoToolUpRedPointByItemSeq(item_seq) == 2){
            this.viewNode.redPoint2.SetNum(1);
        }else if(FishData.Inst().GetWabaoToolUpRedPointByItemSeq(item_seq) == 1){
            this.viewNode.redPoint2.SetNum(1);
            this.viewNode.redPoint.SetNum(1);
        }
    }

    OnClickUp() {
        FishCtrl.Inst().SendWaBaoReqToolUpGrade(FishData.Inst().FishViewInfo.itemSeq)
        let tool_info = FishData.Inst().ResultData.WaBaoToolInfo
        let tool_level = tool_info.toolLevel
        let tool_grade = tool_info.toolGrade
        let condition_num = tool_info.conditionNum
        let item_seq = FishData.Inst().FishViewInfo.itemSeq
        let info_advance = FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq])
        let can_up = tool_level[item_seq] >= info_advance.advance_need
        if(can_up && condition_num[item_seq]>=info_advance.param){
            PublicPopupCtrl.Inst().Center(Language.Fish.FishToolUp.UpGradeSucc)
            this.viewNode.CellShow.effShow(true,4164134);
        }
    }
    
}
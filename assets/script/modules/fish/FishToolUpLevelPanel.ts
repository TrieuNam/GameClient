
import { TERRAIN_HEIGHT_BASE } from "cc";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BasePanel } from "modules/common/BasePanel";
import { COLORSTR, QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { CommonId, ICON_TYPE } from "modules/common/CommonEnum";
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

export class FishToolUpLevelPanel extends BasePanel 
{
    protected viewNode = {
        BtnUp: <fgui.GButton>null,

        CurrencyShow1:<Currency>null,
        CurrencyShow2:<Currency>null,

        CellShow: <ItemCellFishEquip>null,
        NameShow: <fgui.GRichTextField>null,
        LevelShow: <fgui.GTextField>null,
        AttrList: <FishToolUpViewAttrItem>null,

        CostIcon: <fgui.GLoader>null,
        CostNum: <fgui.GTextField>null,
        gp_tip:<fgui.GGroup>null,
        max:<fgui.GObject>null,
        gp_grade:<fgui.GGroup>null,
        //升级
        redPoint:<RedPoint> null,
        //突破
        redPoint2:<RedPoint> null,

        LbTips: <fgui.GTextField>null,

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
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushToolInfo.bind(this), "OtherChange");
    }
    
    InitPanel() {
        this.FlushToolInfo();
    }
    
    ClosePanel() {
        //this.viewNode.CellShow.effShow(false,4164134);
    }
    OnVisible(): void {
        this.viewNode.CellShow.effShow(false,4164134);
    }
    FlushToolInfo() {
        let tool_info = FishData.Inst().ResultData.WaBaoToolInfo
        let tool_level = tool_info.toolLevel
        let tool_grade = tool_info.toolGrade
        let item_seq = FishData.Inst().FishViewInfo.itemSeq
        let info = FishData.Inst().CfgUpgradInfo(item_seq, tool_level[item_seq]);
        let info_advance = FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq])
        let color = QualityColorStr[info.item_color];
        let color_ol = QualityColorOLStr[info.item_color];
        UH.SetText(this.viewNode.NameShow, TextHelper.RichTextOutLine(TextHelper.ColorStr(info.item_name, color), color_ol, 2));
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Fish.FishToolUp.LevelShow, tool_grade[item_seq], tool_level[item_seq]))
        UH.SetText(this.viewNode.LbTips,FishData.Inst().GetArrTipByType(info.item_type));
        this.viewNode.CellShow.SetData(info);
        this.viewNode.CellShow.LevelShow(false);
        let attr_list = []
        attr_list.push({index: 1,data:info});
        this.viewNode.max.visible = this.viewNode.gp_tip.visible = false;
        if(tool_level[item_seq] == CfgOrbData.other[0].max_level){
            this.viewNode.max.visible = true;
        }
        let nextData = tool_level[item_seq] == CfgOrbData.other[0].max_level ? "max": FishData.Inst().CfgUpgradInfo(item_seq, tool_level[item_seq] + 1);
        attr_list.push({index: 2,data:nextData,type:info.item_type});
        this.viewNode.AttrList.SetData(attr_list);
        this.viewNode.gp_grade.visible = false;
        let enough = BagData.Inst().getItemNum(info.up_item[0].item_id) >= info.up_item[0].num
        color = enough ? COLORSTR.White : COLORSTR.Red1
        color_ol = enough ? COLORSTR.Black : COLORSTR.Red2
        UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(info.up_item[0].item_id), ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.CostNum, TextHelper.RichTextOutLine(TextHelper.ColorStr(info.up_item[0].num, color), color_ol, 2));
        this.viewNode.BtnUp.grayed = !enough
        this.viewNode.BtnUp.touchable = enough
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
        let tool_info = FishData.Inst().ResultData.WaBaoToolInfo
        let tool_level = tool_info.toolLevel
        let tool_grade = tool_info.toolGrade
        let item_seq = FishData.Inst().FishViewInfo.itemSeq
        let info_advance = FishData.Inst().CfgAdvanceInfo(item_seq, tool_grade[item_seq])
        let can_up = tool_level[item_seq] >= info_advance.advance_need
        if(!can_up){
            this.viewNode.CellShow.effShow(false,4164134);
            this.viewNode.CellShow.effShow(true,4164134);
            FishCtrl.Inst().SendWaBaoReqToolUpLevel(FishData.Inst().FishViewInfo.itemSeq)
            PublicPopupCtrl.Inst().Center(Language.Fish.FishToolUp.UpLevelSucc);
            // this.timeOut = setTimeout(() => {
            //     this.viewNode.CellShow.effShow(true,4164134);
            // }, 100);
        }else{
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Fish.FishToolUp.UpLevelFail, info_advance.advance + 1));
        }
    }
    
}
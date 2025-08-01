import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TimeFormatType, TimeMeter } from '../extends/TimeMeter';
import { PetRelicsData } from "./PetRelicsData";

@BaseView.registView
export class PetRelicsResultView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "PetRelicsResult",
        ViewName: "PetRelicsResultView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "ResultAttrItem", ExtendsClass: PetRelicsResultAttrItem },
    ]
    protected viewNode = {
        CloseTimer: <TimeMeter>null,
        ItemCell: <ItemCell>null,
        operName: <fgui.GLabel>null,
        itemName: <fgui.GLabel>null,
        preLevel: <fgui.GLabel>null,
        Level: <fgui.GLabel>null,
        attrList: <fgui.GList>null,
        SkillDesc: <fgui.GLabel>null,
    }
    private param: any
    InitData(param: any) {
        this.param = param
        this.viewNode.CloseTimer.SetCallBack(this.closeview.bind(this));
        this.viewNode.CloseTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, TextHelper.ColorStr(Language.Common.CloseTip, COLORSTR.Yellow1));

        this.flushInfoPanel()
    }
    flushInfoPanel() {
        let result = PetRelicsData.Inst().GetRelicsResultInfo(this.param.index)
        let item_cell = Item.Create(result.item_info)
        this.viewNode.ItemCell.SetData(item_cell)
        UH.SetText(this.viewNode.operName, this.param.oper_text)
        UH.SetText(this.viewNode.itemName, item_cell.Name())
        UH.SetText(this.viewNode.preLevel, result.pre_level)
        UH.SetText(this.viewNode.Level, this.param.level)
        UH.SetText(this.viewNode.SkillDesc, this.param.skill_desc)
        this.viewNode.attrList.SetData(result.attrs)
    }
    private closeview() {
        ViewManager.Inst().CloseView(PetRelicsResultView)
    }
}

export class PetRelicsResultAttrItem extends fgui.GComponent {
    private viewNode = {
        type: <fgui.GLabel>null,
        add: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetText(this.viewNode.type, data.type)
        UH.SetText(this.viewNode.add, data.add)
    }
}
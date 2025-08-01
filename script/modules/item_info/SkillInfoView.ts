import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { UH } from "../../helpers/UIHelper";
import { CfgPassiveSkillData } from "config/CfgPassiveSkill";
import { SkillCell } from "modules/extends/SkillCell";
import { QualityColor, QualityColorOL } from "modules/common/ColorEnum";

@BaseView.registView
export class SkillInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "SkillInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Name: <fgui.GTextField>null,
        SkillCell: <SkillCell>null,
        Level: <fgui.GTextField>null,
        Desc: <fgui.GTextField>null,
    };

    InitData(param: any) {
        let skill_id = param
        let cfg = CfgPassiveSkillData.passive_cfg[skill_id - 1];
        this.viewNode.SkillCell.SetData(skill_id);
        let qua_col = QualityColor[cfg.skill_color];
        let qua_ol_col = QualityColorOL[cfg.skill_color];
        this.viewNode.Name.color=qua_col;
        this.viewNode.Name.strokeColor = qua_ol_col;
        UH.SetText(this.viewNode.Name, cfg.skill_name);
        UH.SetText(this.viewNode.Desc, cfg.skill_desc)
        UH.SetText(this.viewNode.Level, "Lv." + cfg.skill_level)
    }

}

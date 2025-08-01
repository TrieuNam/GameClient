/**技能格子控件 */
import { BaseItem } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { CfgPassiveSkillData } from "config/CfgPassiveSkill";
import { UH } from "../../helpers/UIHelper";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { ViewManager } from "manager/ViewManager";
import { SkillInfoView } from "modules/item_info/SkillInfoView";

export class SkillCell extends BaseItem {
    protected viewNode = {
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
    };

    protected onConstruct(): void {
        this.onClick(this.OnClick, this);
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(skill_id: number) {
        this._data = skill_id;
        let cfg = CfgPassiveSkillData.passive_cfg[skill_id - 1];
        this.viewNode.QuaIcon.visible = this.viewNode.Icon.visible = cfg != undefined;
        if (cfg) {
            UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${cfg.skill_color}`);
            UH.SetIcon(this.viewNode.Icon, cfg.skill_icon, ICON_TYPE.SKILL);
        }
    }

    public OnClick() {
        if (this._data)
            ViewManager.Inst().OpenView(SkillInfoView, this._data)
    }
}
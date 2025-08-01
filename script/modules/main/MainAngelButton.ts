import { BaseItemGB } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { AngelData } from "modules/Angel/AngelData";
import { UH } from "../../helpers/UIHelper";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Item } from "modules/bag/ItemData";
import { RedPoint } from "modules/extends/RedPoint";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import { Mod } from "modules/common/ModuleDefine";
import { RemindCtrl } from "modules/remind/RemindCtrl";

export class MainAngelButton extends BaseItemGB {
    private handleCollector: HandleCollector;

    protected viewNode = {
        IconBg: <fgui.GLoader>null,
        AngelIcon: <fgui.GLoader>null,
        Title: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
    };

    public SetData(angelAppearance: number) {
        if (angelAppearance == -1) {
            this.viewNode.IconBg.visible = false;
            this.viewNode.AngelIcon.visible = false;
            return;
        }
        this.viewNode.IconBg.visible = true;
        this.viewNode.AngelIcon.visible = true;
        let angle_data = AngelData.Inst().GetUseResActiveItemData(angelAppearance);
        UH.SpriteName(this.viewNode.IconBg, "CommonAtlas", `PinZhi${Item.GetQuality(angle_data.jihuo_item_id)}`);
        UH.SetIcon(this.viewNode.AngelIcon, angle_data.icon_id, ICON_TYPE.ITEM);
    }

    public InitData() {
        this.handleCollector = HandleCollector.Create();
        this.handleCollector.Add(RemindGroupMonitor.Create(Mod.Angel, this.freshRedPoint.bind(this), true));
    }
    public freshRedPoint() {
        let num = RemindCtrl.Inst().GetGroupNum(Mod.Angel);
        this.viewNode.RedPoint.SetNum(num);
    }
}
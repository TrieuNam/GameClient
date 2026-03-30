import { BaseItemGB } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { AngelData } from "modules/Angel/AngelData";
import { UH } from "../../helpers/UIHelper";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Item } from "modules/bag/ItemData";
import { MountData } from "modules/mount/MountData";
import { LogError } from "core/Debugger";
import { RedPoint } from "modules/extends/RedPoint";
import { HandleCollector } from "core/HandleCollector";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import { Mod } from "modules/common/ModuleDefine";
import { RemindCtrl } from "modules/remind/RemindCtrl";

export class MainBtnTodayShare extends BaseItemGB {
    private handleCollector: HandleCollector;
    protected viewNode = {
        RedPoint: <RedPoint>null,
    };

    public InitData() {
        this.handleCollector = HandleCollector.Create();
        this.handleCollector.Add(RemindGroupMonitor.Create(Mod.ServerActivity, this.freshRedPoint.bind(this), true));
    }
    public freshRedPoint() {
        let num = RemindCtrl.Inst().GetRemindNum(Mod.ServerActivity.TodayShare)
        this.viewNode.RedPoint.SetNum(num);
    }
}
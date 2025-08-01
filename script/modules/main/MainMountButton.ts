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

export class MainMountButton extends BaseItemGB {
    private handleCollector: HandleCollector;
    protected viewNode = {
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        RedPoint: <RedPoint>null,
    };

    public FlushData(info?: { id: number, color?: number, }) {
        if (!info){
            info = MountData.Inst().GetAppearanceIdMount()
            if (!this.handleCollector){
                this.handleCollector = HandleCollector.Create();
                this.handleCollector.Add(RemindGroupMonitor.Create(Mod.Mount, this.freshRedPoint.bind(this), true));
                this.freshRedPoint()
            }
        }
        if (info.id == -1) {
            this.viewNode.QuaIcon.visible = false
            this.viewNode.Icon.visible = false
            return
        }


        this.viewNode.QuaIcon.visible = true
        this.viewNode.Icon.visible = true

        UH.SetIcon(this.viewNode.Icon, info.id, ICON_TYPE.ITEM);
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", "PinZhi" + info.color);
    }

    public InitData() {
       
    }
    public freshRedPoint() {
        let num = MountData.Inst().GetRedNum()
        let num_h = MountData.Inst().GetAngelResAllRed()
        let num_e = MountData.Inst().GetEquipRed()
        this.viewNode.RedPoint.SetNum(num+num_h+num_e > 0 ?1 :0 );
    }
}

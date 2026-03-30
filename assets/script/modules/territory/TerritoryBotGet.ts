import { sys } from "cc";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { TerritoryCtrl } from "./TerritoryCtrl";
import { TerritoryData } from "./TerritoryData";
@BaseView.registView
export class TerritoryBotGet extends BaseView {
    //data = TerritoryData.Inst()
    timer_handle: any = null
    protected viewRegcfg = {
        UIPackName: "TerritoryBotGet",
        ViewName: "TerritoryBotGet",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
    }
    OpenCallBack(): void {
        this.view.getTransition("t0").setHook("run_dis_end", this.TimeStart.bind(this));
    }
    TimeStart() {
        this.timer_handle = Timer.Inst().AddCountDownTT(() => { }, () => { ViewManager.Inst().CloseView(TerritoryBotGet) }, 2)
    }
    CloseCallBack(): void {
        Timer.Inst().CancelTimer(this.timer_handle)
    }
}

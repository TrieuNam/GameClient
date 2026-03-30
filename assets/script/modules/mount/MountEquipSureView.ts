import * as fgui from "fairygui-cc";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";


@BaseView.registView
export class MountEquipDetailView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipSure",
        ViewName: "MountEquipSureView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    // protected extendsCfg = []
    protected viewNode = {}
    InitData() {}
    CloseCallBack() {

    }
    flushInfoPanel()
    {
        
    }
}
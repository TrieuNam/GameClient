import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonGetView2 } from "modules/CommonGet2/CommonGetView2";
import { FashionData } from "modules/fashion/FashionData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { BoxData } from "./BoxData";

@BaseView.registView
export class BoxShiZhuangEffectView extends BaseView {
    private time_handle: any;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BoxShiZhuangEffect",
        ViewName: "BoxShiZhuangEffectView",
        LayerType: ViewLayer.BgBlockClose,
        ViewMask: ViewMask.None,
    };
    protected viewNode = {
        EffectBaoJi: <UIEffectShow>null,
    };

    InitData() {
        this.viewNode.EffectBaoJi.PlayEff(4164114);
        AudioManager.Inst().Play(AudioTag.JiHuo);
        this.time_handle = Timer.Inst().CancelTimer(this.time_handle);
        this.time_handle = Timer.Inst().AddRunTimer(() => {
            this.closeView();
        }, 2, 1, false)
    }

    closeView() {
        Timer.Inst().CancelTimer(this.time_handle);
        ViewManager.Inst().CloseView(BoxShiZhuangEffectView);
        FashionData.Inst().SetFashionShowData(
            BoxData.Inst().GetBoxShiZhuangId(),
            BoxData.Inst().DelShiZhuang.bind(BoxData.Inst()));
        if (!ViewManager.Inst().IsOpen(CommonGetView2)) {
            let get_data = FashionData.Inst().GetFashionShowData();
            ViewManager.Inst().OpenView(CommonGetView2, get_data);
        }
        BoxData.Inst().box_result_data.flush_shizhuang = !BoxData.Inst().box_result_data.flush_shizhuang;
    }
}

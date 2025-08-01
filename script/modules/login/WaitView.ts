import { LogError } from "core/Debugger";
import { ObjectPool } from "core/ObjectPool";
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { FloatingTextDate } from "modules/main/FloatingTextData";
import { UISpineShow } from "modules/scene_obj_spine/UISpineShow";
import { ResPath } from "utils/ResPath";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class WaitView extends BaseView {
    private sp_show: UISpineShow = undefined;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Wait",
        ViewName: "WaitView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    protected viewNode = {
        DescShow: <fgui.GTextField>null,
    };

    InitData(
        // param_t:{desc:string}
        ) {
        this.InitSpineAnim();
        this.AddSmartDataCare(FloatingTextDate.Inst().WaitData, this.flushDesc.bind(this), "desc")
        this.flushDesc();
        // UH.SetText(this.viewNode.DescShow, param_t ? param_t.desc : Language.Login.WaitTips.def)
    }

    private flushDesc(){
        UH.SetText(this.viewNode.DescShow, FloatingTextDate.Inst().WaitDesc);
    }

    InitSpineAnim() {
        this.sp_show = ObjectPool.Get(UISpineShow, ResPath.Spine("sp_load"), (obj: any) => {
            obj.setPosition(400, -750);
            this.view._container.insertChild(obj, 0);
        });
    }

    CloseCallBack(): void {
        if (this.sp_show) {
            ObjectPool.Push(this.sp_show);
        }
    }
}
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";;
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { CommonRewardCell } from "./CommonRewardView";

@BaseView.registView
export class GemOnceGetView extends BaseView {
    private call_back: Function;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonAccount",
        ViewName: "GemOnceGetView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "CommonRewardCell", ExtendsClass: CommonRewardCell },
    ];

    protected viewNode = {
        ListReward: <fgui.GList>null,
    }

    InitData(param?: { reward_data: IPB_ItemData[], call_back?: Function }) {
        this.call_back = param.call_back;
        this.viewNode.ListReward.SetData(param.reward_data);
    }

    InitUI() {
    }

    CloseCallBack(): void {
        this.call_back && this.call_back();
    }

    OpenCallBack() {
        AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
    }
}

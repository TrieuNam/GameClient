import { math, sys, tween, Vec3 } from "cc";
import { DEBUG } from "cc/env";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { PetAvatarCell, PetAvatarData } from "modules/extends/PetAvatarCell";
import { TimeMeter, TimeFormatType } from "modules/extends/TimeMeter";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { PackageData } from "preload/PkgData";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent } from "../../proload/ChannelAgent";
import { PetData } from "./PetData";

@BaseView.registView
export class PetEvolResultView extends BaseView {
    private param: any
    protected viewRegcfg = {
        UIPackName: "PetEvolResult",
        ViewName: "PetEvolResultView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        CloseTimer: <TimeMeter>null,

        pet_head: <PetAvatarCell>null,
        pet_name: <fgui.GLabel>null,
        LvShow: <fgui.GLabel>null,
        ModelShow: <UIModelShow>null,
        EffectShow: <UIEffectShow>null,
    }
    transion: fgui.Transition;
    tweener: fgui.GTweener | null = null
    InitData(param: any): void {
        this.viewNode.CloseTimer.SetCallBack(this.closeview.bind(this));
        //this.viewNode.CloseTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, Language.Common.CloseTip);

        this.param = param
        //LogError(this.param)
        this.transion = this.view.getTransition("t0")
        this.transion.setHook("change_res", this.ChangeRes.bind(this))
        this.flushPanelInfo()
        this.viewNode.EffectShow.PlayEff(4164140)
        let rotate = new Vec3(0, 0, 0)
        this.tweener = fgui.GTween.to(0, 1440, 2.65).onUpdate((tweener: fgui.GTweener) => {
            rotate.set(0, tweener.value.x, 0)
            this.viewNode.ModelShow.node.eulerAngles = rotate
        })
    }
    ChangeRes() {
        let pet_evol_cfg = PetData.Inst().GetEvolCfg(this.param.petId - 1)
        if (pet_evol_cfg == null) {
            let pet_evol_cfg = PetData.Inst().GetEvolMaxCfg()
            this.viewNode.ModelShow.setPath(ResPath.Npc(pet_evol_cfg.pet_res_after));
        } else {
            this.viewNode.ModelShow.setPath(ResPath.Npc(pet_evol_cfg.pet_res_after));
        }
        if (sys.platform == sys.Platform.WECHAT_GAME)
            ChannelAgent.wx.vibrateShort({ type: PackageData.Inst().getWxVibrate() });
        else if (DEBUG) {
            let pos = fgui.GRoot.inst.node.position
            let tw = tween(fgui.GRoot.inst.node)
                .to(0.1, { position: new Vec3(pos.x + 1, pos.y - 1, 0) }, { easing: "quadInOut" })
                .to(0.1, { position: new Vec3(pos.x - 1, pos.y + 1, 0) }, { easing: "quadInOut" })
                .to(0.1, { position: new Vec3(pos.x, pos.y, 0) }, { easing: "quadInOut" })
                .start()
        }
    }
    private closeview() {
        ViewManager.Inst().CloseView(PetEvolResultView)
    }
    flushPanelInfo() {
        let pet_evol_cfg = PetData.Inst().GetEvolCfg(this.param.petId - 1)
        if (pet_evol_cfg == null) {
            let pet_evol_cfg = PetData.Inst().GetEvolMaxCfg()
            this.viewNode.ModelShow.setPath(ResPath.Npc(pet_evol_cfg.pet_res_before));
        } else {
            this.viewNode.ModelShow.setPath(ResPath.Npc(pet_evol_cfg.pet_res_before));
        }
        // this.viewNode.pet_head.SetData(new PetAvatarData(this.param.petId, this.param.petOrder));

        // UH.SetText(this.viewNode.pet_name, this.param.petName);
        // UH.SetText(this.viewNode.LvShow, TextHelper.Format(Language.Escort.Level, this.param.petLevel));
    }
    CloseCallBack(): void {
        if (this.tweener) {
            this.tweener.kill()
            this.tweener = null
        }
    }
}
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";


@BaseView.registView
export class UpLevelShowView extends BaseView {
    //data = TerritoryData.Inst()
    private param: any
    protected viewRegcfg = {
        UIPackName: "UpLevelShow",
        ViewName: "UpLevelShowView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        before_l: <fgui.GLoader>null,
        before_r: <fgui.GLoader>null,
        word_b: <fgui.GLabel>null,

        p_before_l: <fgui.GLoader>null,
        p_before_r: <fgui.GLoader>null,
        p_word_b: <fgui.GLabel>null,

        after_l: <fgui.GLoader>null,
        after_r: <fgui.GLoader>null,
        word_a: <fgui.GLabel>null,

        p_after_l: <fgui.GLoader>null,
        p_after_r: <fgui.GLoader>null,
        p_word_a: <fgui.GLabel>null,

        CloseTimer: <TimeMeter>null,
    }
    // protected extendsCfg = [
    // ];

    InitData(param: any): void {
        this.viewNode.CloseTimer.SetCallBack(this.closeview.bind(this));
        this.viewNode.CloseTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, TextHelper.ColorStr(Language.Common.CloseTip, COLORSTR.Yellow1));

        this.param = param
    }
    private closeview() {
        ViewManager.Inst().CloseView(UpLevelShowView)
    }
    FlushLevelInfo() {
        if (this.param.plus_w_b != null) {
            this.viewNode.before_l.visible = true
            this.viewNode.before_r.visible = false
            this.viewNode.word_b.visible = true
            UH.SpriteName(this.viewNode.before_l, "CommonFont", "pet_lv_" + this.param.level_before);
            UH.SetText(this.viewNode.word_b, this.param.level_w_b)

            this.viewNode.p_before_l.visible = true
            this.viewNode.p_before_r.visible = false
            this.viewNode.p_word_b.visible = true
            UH.SpriteName(this.viewNode.p_before_l, "CommonFont", "pet_lv_" + this.param.plus_before);
            UH.SetText(this.viewNode.p_word_b, this.param.plus_w_b)

            this.viewNode.after_l.visible = true
            this.viewNode.after_r.visible = false
            this.viewNode.word_a.visible = true
            UH.SpriteName(this.viewNode.after_l, "CommonFont", "pet_lv_" + this.param.level_after);
            UH.SetText(this.viewNode.word_a, this.param.level_w_a)

            this.viewNode.p_after_l.visible = true
            this.viewNode.p_after_r.visible = false
            this.viewNode.p_word_a.visible = true
            UH.SpriteName(this.viewNode.p_after_l, "CommonFont", "pet_lv_" + this.param.plus_after);
            UH.SetText(this.viewNode.p_word_a, this.param.plus_w_a)

        }
        else {
            this.viewNode.word_b.visible = false
            this.viewNode.word_a.visible = false
            this.viewNode.p_word_b.visible = false
            this.viewNode.p_word_a.visible = false

            this.viewNode.p_before_l.visible = false
            this.viewNode.p_before_r.visible = false
            this.viewNode.p_after_l.visible = false
            this.viewNode.p_after_r.visible = false

            if (this.param.level_before > 9) {
                this.viewNode.before_l.visible = true
                this.viewNode.before_r.visible = true

                let left_num = Math.floor(this.param.level_before / 10)
                let right_num = Math.floor(this.param.level_before % 10)

                UH.SpriteName(this.viewNode.before_l, "CommonFont", "pet_lv_" + left_num);
                UH.SpriteName(this.viewNode.before_r, "CommonFont", "pet_lv_" + right_num);
            }
            else {
                this.viewNode.before_l.visible = false
                this.viewNode.before_r.visible = true

                UH.SpriteName(this.viewNode.before_r, "CommonFont", "pet_lv_" + this.param.level_before);
            }

            //after
            if (this.param.level_after > 9) {
                this.viewNode.after_l.visible = true
                this.viewNode.after_r.visible = true

                let left_num = Math.floor(this.param.level_after / 10)
                let right_num = Math.floor(this.param.level_after % 10)

                UH.SpriteName(this.viewNode.after_l, "CommonFont", "pet_lv_" + left_num);
                UH.SpriteName(this.viewNode.after_r, "CommonFont", "pet_lv_" + right_num);
            }
            else {
                this.viewNode.after_l.visible = true
                this.viewNode.after_r.visible = false

                UH.SpriteName(this.viewNode.after_l, "CommonFont", "pet_lv_" + this.param.level_after);
            }
        }

    }
    InitUI(): void {

    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.FlushLevelInfo()
    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}

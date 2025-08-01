/**
 * 公用购买按钮
 */
import { Color } from "cc";
import * as fgui from "fairygui-cc"
import { ViewManager } from "manager/ViewManager";
import { BaseItemGB } from "modules/common/BaseItem";
import { RedPoint } from "modules/extends/RedPoint";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

export class CommonButtonBuy extends fgui.GButton {
    protected viewNode = {
        Bg: <fgui.GLoader>null,
        icon: <fgui.GLoader>null,
        RedPoint: <RedPoint>null,
        EffectShow: <UIEffectShow>null,
        title: <fgui.GTextField>null,
        Gp: <fgui.GGroup>null
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    protected onDestroy(): void {
        super.onDestroy();
    }

    public SetIcon(visible: boolean, icon?: string, package_name?: string) {
        this.viewNode.icon.visible = visible;
        if (visible) {
            UH.SpriteName(this.viewNode.icon, package_name, icon);
        }
    }

    public SetTitle(title: string) {
        let length = title.length;
        if (length === 2) {
            title = TextHelper.LetterSpacing(title, 1);
        }
        UH.SetText(this.viewNode.title, title);
        if (this.viewNode.title)
            this.viewNode.title.ensureSizeCorrect();
    }

    set title(val: any) {
        this._title = val;
        if (this._titleObject)
            this._titleObject.text = (this._selected && this._selectedTitle) ? this._selectedTitle : this._title;
        this.updateGear(6);
        this.viewNode.title.ensureSizeCorrect();
    }

    public SetBg(icon: string, package_name: string) {
        UH.SpriteName(this.viewNode.Bg, package_name, icon);
    }

    public SetStroke(stroke: number, col: Color) {
        this.viewNode.title.stroke = 2;
        this.viewNode.title.strokeColor = col;
    }

    public SetColor(col: Color) {
        this.viewNode.title.color = col;
    }

    public GetIcon() {
        return this.viewNode.icon;
    }

    public GetTitle() {
        return this.viewNode.title;
    }

    public GetRedPoint() {
        return this.viewNode.RedPoint;
    }

    public playEffect(id?: number) {
        if (id)
            this.viewNode.EffectShow.PlayEff(id);
        else
            this.viewNode.EffectShow.StopAllEff();
    }

    public ShowRedPoint(red: boolean) {
        this.viewNode.RedPoint.SetNum(red ? 1 : 0)
    }

    setup_afterAdd(buffer: fgui.ByteBuffer, beginPos: number): void {
        super.setup_afterAdd(buffer, beginPos);
        let length = this.viewNode.title.text.length;
        if (length === 2) {
            this.viewNode.title.text = TextHelper.LetterSpacing(this.viewNode.title.text, 1);
        }
        if (this.viewNode.Gp)
            this.viewNode.Gp.ensureSizeCorrect();
    }
}

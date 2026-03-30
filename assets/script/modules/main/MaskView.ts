import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';

@BaseView.registView
export class MaskView extends BaseView {
    public parentView: BaseView = null;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Mask",
        ViewName: "MaskView",
    };
    protected viewNode = {
        BG: <fgui.GImage>null,
        Block: <fgui.GGraph>null,
    };
    InitUI() {
        this.viewNode.Block.onClick(this.OnClickBlock, this);
        this.viewNode.Block.visible = false;
        this.viewNode.BG.visible = false;
    }
    private OnClickBlock() {
        if (this.parentView) {
            this.parentView.closeView();
        }
    }
    public SetParentView(parentView: BaseView) {
        let viewMask = parentView.ViewRegCfg().ViewMask;
        let IsMask = viewMask == ViewMask.BgBlock || viewMask == ViewMask.BgBlockClose;
        let IsClose = viewMask == ViewMask.BlockClose || viewMask == ViewMask.BgBlockClose;

        this.viewNode.BG.visible = IsMask;
        this.viewNode.Block.visible = IsClose;
        this.parentView = IsClose ? parentView : null;
        this.view.sortingOrder = parentView.view.sortingOrder - 1;
    }
}
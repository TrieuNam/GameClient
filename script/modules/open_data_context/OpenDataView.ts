import { math, Sprite, SubContextView, Widget } from "cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonContext } from "modules/common/CommonContext";
/* 
    开放域界面显示
 */
@BaseView.registView
export class OpenDataView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "openDataContext",
        ViewName: "openDataContext",
        LayerType: ViewLayer.OpenData,
        ViewMask: ViewMask.None
    };

    protected viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnClear: <fgui.GButton>null,
        BtnReinit: <fgui.GButton>null,
        BtnSend: <fgui.GButton>null,
        BtnSet: <fgui.GButton>null,
        SubView: <fgui.GImage>null,
        TextInput: <fgui.GTextInput>null,
        TextInputW: <fgui.GTextInput>null,
        TextInputH: <fgui.GTextInput>null,
        Context: <CommonContext>null,
    }
    subContextView: SubContextView = null;
    InitData(param: any): void {
        console.log("init data");
        this.viewNode.BtnClear.onClick(this.OnClickClear, this)
        this.viewNode.BtnClose.onClick(this.OnClickClose, this)
        this.viewNode.BtnReinit.onClick(this.OnClickReinit, this)
        this.viewNode.BtnSend.onClick(this.OnClickSend, this)
        this.viewNode.BtnSet.onClick(this.OnClickSet, this)
    }

    InitUI(): void {
        // this.subContextView = this.viewNode.SubView.node.addComponent(SubContextView)
        // this.subContextView.enabled = true
        // this.viewNode.SubView.alpha = 1
        // this.viewNode.SubView.setPivot(0.5, 0.5)
        //编辑器无法设置
        //this.subContextView.designResolutionSize = math.size(800, 1500)
        //console.log("subContextView fps", this.subContextView.fps);
        //console.log("subContextView size", this.subContextView.designResolutionSize);
    }

    OpenCallBack(): void {
        //this.viewNode.Context.enabledContext()
        /* this.viewNode.Context.width = 640
        this.viewNode.Context.height = 960 */
        this.viewNode.Context.touchable = false
        //this.viewNode.Context.setDesignSize(math.size)
    }
    //设置画布
    OnClickSet() {
        /* let text_w = this.viewNode.TextInputW.text
        let text_h = this.viewNode.TextInputH.text
        this.subContextView.designResolutionSize = math.size(Number(text_w), Number(text_h))
        this.subContextView.enabled = true
        console.log("subContextView fps", this.subContextView.fps);
        console.log("subContextView size", this.subContextView.designResolutionSize); */
    }
    //清除画布
    OnClickClear() {
        this.realSendMsg('clear')
    }
    //重绘画布
    OnClickReinit() {
        //this.subContextView.enabled = true
        this.realSendMsg('show_rank')
    }
    //发送请求
    OnClickSend() {
        console.log("send msg ", this.viewNode.TextInput.text);

        this.realSendMsg(this.viewNode.TextInput.text);
    }
    realSendMsg(value: string) {
        let env = window.wx || window.tt || window.swan;
        if (env) {
            console.log('Message posted');
            env.getOpenDataContext().postMessage({
                type: value,
            });
        } else {
            console.log('env is null, send value is', value)
        }
    }
    //关闭
    OnClickClose() {
        ViewManager.Inst().CloseView(OpenDataView)
    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}
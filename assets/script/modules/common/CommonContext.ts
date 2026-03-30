import { math, Node, SubContextView, UITransform, Widget } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ChannelAgent } from "../../proload/ChannelAgent";
import { BaseItem } from "./BaseItem";
export class CommonContext extends BaseItem {
    //开放域数据显示组件
    //更新数据显示时需要设置x,y,w,h
    //一般x,y=0,0
    //自身尺寸 width height 为显示区域大小 根据较小的一方自适应

    protected viewNode = {
        Bg: <fgui.GImage>null,
    };
    protected _data: any = null;
    protected _widget: Widget = null
    public _subContextView: SubContextView = null
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        //必要组件
        this._widget = this.node.addComponent(Widget)
        this._subContextView = this.node.addComponent(SubContextView);


        // let scvNode = new Node("_subContextView")
        // scvNode.parent = this.node
        //this._widget = scvNode.addComponent(Widget)
        //this._subContextView = scvNode.addComponent(SubContextView)

    }
    //此时才是正确尺寸
    protected onEnable(): void {
        super.onEnable();
        this._subContextView.designResolutionSize = math.size(this.width, this.height)
    }
    //编辑器下自动enable false
    public enabledContext() {
        if (this._subContextView) {
            this._subContextView.enabled = true
        }
    }
    //设置渲染canvas大小
    public setDesignSize(size: math.Size) {
        if (this._subContextView) {
            this._subContextView.designResolutionSize = size
        }
    }
    //重新初始化
    public reInit() {
        if (this._subContextView) {
            this._subContextView.onLoad()
        }
    }
    //参考
    public visibleBg(flag: boolean) {
        this.viewNode.Bg.visible = flag
    }
    public SetData(data: any) {
        this._data = data;
    }
    public GetData() {
        return this._data;
    }
    //param = new OPEN_PARAM
    public postMessage(param: any) {
        ChannelAgent.Inst().postMessageToOD(param)
        /* let env = window.wx || window.tt || window.swan;
        if (env) {
            console.log('Message posted');
            env.getOpenDataContext().postMessage(param);
        } else {
            console.log('env is null, param = ', param)
        } */
    }
    protected onDestroy(): void {
        // let param = CommonStruct.OpenDataParam()
        // param.type = msgType.clear
        // this.postMessage(param)
    }
}
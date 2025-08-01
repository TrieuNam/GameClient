import { HandleBase, HandleCollector } from "core/HandleCollector";
import { LooperHandle, SMDHandle } from "data/HandleCollectorCfg";
import { UIObjectFactory, UIPackage } from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { extendsInfo, WaitHandle } from "./BaseView";

let handleKeys = {
    WaitOpen: "WaitOpen"
}

/**
 * Panel加载完成函数执行顺序
 * InitPanelData() //Panel数据初始化
 * InitPanel()  //Panel进行显示初始化
 * DoOpenWaitHandle() //Panel开启前等待已添加Handle完成
 * OpenPanel() // Panel开启执行函数
 * ClosePanel() //Panel关闭执行函数
*/
export class BasePanel {
    protected viewNode: {} = null;
    protected extendsCfg: extendsInfo[] = null;

    protected handleCollector: HandleCollector;
    public get handleCollectors(){
        return this.handleCollector
    }
    private waitHandles: Set<WaitHandle> = new Set<WaitHandle>();

    constructor() {
        this.handleCollector = HandleCollector.Create();
    }

    protected mView: any;
    public get view(): any {
        return this.mView;
    }
    public set view(v: any) {
        this.mView = v;
    }

    protected mParentView: any;
    public get parentView(): any {
        return this.mParentView;
    }
    public set parentView(v: any) {
        this.mParentView = v;
    }

    public ViewNode(): any {
        return this.viewNode;
    }

    public ExtendsCfg(): extendsInfo[] {
        return this.extendsCfg;
    }

    //外部初始化
    public Init() {
        let self = this;
        self.initNode();
        self.InitPanelData();
        self.InitPanel();
        self.DoOpenWaitHandle();
        self.doWaitHandles();
    }
    InitPanelData() {

    }

    InitPanel() {

    }

    DoOpenWaitHandle() {

    }

    OpenPanel() {

    }

    ClosePanel() {

    }

    OnVisible() {

    }

    OnUnVisible() {

    }


    private initNode() {
        if (this.ViewNode()) {
            this.regNodeIofo();
        }
    }

    public InitExtends(UIPackName: string) {
        let self = this;
        let extendCfg = self.ExtendsCfg();
        if (extendCfg) {
            for (let index = 0; index < extendCfg.length; index++) {
                const cfg = extendCfg[index];
                self.setComponentExtension(cfg, UIPackName);
            }
        }
    }

    private setComponentExtension(cfg: extendsInfo, UIPackName: string) {
        let self = this;
        let url = UIPackage.getItemURL(UIPackName, cfg.ResName);
        UIObjectFactory.setExtension(url, cfg.ExtendsClass);
    }

    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]): HandleBase {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
        return handle
    }

    public RemoveSmartDataCare() {
        let self = this;
        HandleCollector.Destory(self.handleCollector);
        self.handleCollector = null;
    }

    public createWaitHandle(name: string): WaitHandle {
        let handle: WaitHandle = {
            handleName: name,
            complete: false
        }
        return handle
    }

    public AddWaitHandle(handle: WaitHandle) {
        this.waitHandles.add(handle);
    }

    private doWaitHandles() {
        let self = this;
        if (self.waitHandles.size > 0) {
            this.handleCollector.KeyAdd(handleKeys.WaitOpen, LooperHandle.Create(this.checkWaitHandles.bind(this)));
        } else {
            self.view.visible = true;
            self.OpenPanel();
        }
    }

    private checkWaitHandles() {
        let self = this;
        let isComplete = true;
        let handles = self.waitHandles;
        for (let handle of handles) {
            if (handle.complete === false) {
                isComplete = false;
                break;
            }
        }
        if (isComplete === true) {
            this.handleCollector.KeyRemove(handleKeys.WaitOpen);
            self.view.visible = true;
            self.OpenPanel();
        }
    }

    private regNodeIofo() {
        let nodeInfo = ViewManager.Inst().RegNodeIofo(this.ViewNode(), this.view);
        return nodeInfo
    }

    public Close() {
        let self = this;
        self.ClosePanel();
        self.RemoveSmartDataCare();
        self.viewNode = {};
        self = null;
    }
}
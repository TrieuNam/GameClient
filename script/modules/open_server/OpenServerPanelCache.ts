import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { OpenServerBase } from './OpenServerData';
import { OpenServerSevenDays } from './OpenServerSevenDays';
import { OpenServerBoxOpen } from './OpenServerBoxOpen';
import { OpenServerNeoServer } from './OpenServerNeoServer';
import { OpenServerNeoShop } from './OpenServerNeoShop';
import { Timer } from 'modules/time/Timer';

export class OpenServerPanelCache extends fgui.GComponent {
    private Panel: { [key: string]: any } = []
    private viewNode = {}
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
    }
    onDestroy() { }
    public InitPanel(index: number) {
        // this.ChangePanel(index)

        // for(var c_index in OpenServerBase){
        this.CreatePanel(OpenServerBase[index])
        // }
        this.ChangePanel(index)
    }
    public flushinfo(index: number) {
        let p_info = OpenServerBase[index]
        if (this.Panel[p_info.panel_res] == null) {
            this.CreatePanel(p_info)
        }

        this.Panel[p_info.panel_res].flushinfo()
    }
    private time_timer: any;
    public ChangePanel(index: number) {
        let p_info = OpenServerBase[index]
        if (this.Panel[p_info.panel_res] == null) {
            this.CreatePanel(p_info)
        }
        this.ShowPanel(index)
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = Timer.Inst().AddRunTimer(() => {
            this.flushinfo(index)
        }, 0.1, 1, false);
    }

    private ShowPanel(index: number) {
        for (var c_index in OpenServerBase) {
            let flag = OpenServerBase[c_index].index == index
            if (this.Panel[OpenServerBase[c_index].panel_res] != null) {
                this.Panel[OpenServerBase[c_index].panel_res].visible = flag
            }
        }
    }

    private CreatePanel(param: any) {
        let panel = null
        if (param.index == 0) {
            panel = <OpenServerSevenDays>fgui.UIPackage.createObject("OpenServerAct", param.panel_res).asCom;
        }
        else if (param.index == 1) {
            panel = <OpenServerBoxOpen>fgui.UIPackage.createObject("OpenServerAct", param.panel_res).asCom;
        }
        else if (param.index == 2) {
            panel = <OpenServerNeoServer>fgui.UIPackage.createObject("OpenServerAct", param.panel_res).asCom;
        }
        else if (param.index == 3) {
            panel = <OpenServerNeoShop>fgui.UIPackage.createObject("OpenServerAct", param.panel_res).asCom;
        }

        if (panel == null) { return }
        panel.visible = false
        this.addChild(panel);
        this.Panel[param.panel_res] = panel
    }
}
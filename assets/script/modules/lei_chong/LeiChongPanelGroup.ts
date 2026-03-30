import * as fgui from "fairygui-cc";
import { ACTIVITY_TYPE, LeiChongPanelRes } from "modules/activity/ActivityEnum";
import { LeiChongBasePanel } from "./LeiChongBasePanel";

export class  LeiChongPanelGroup extends fgui.GComponent{
    private panels:{[act_type:number]:LeiChongBasePanel}={};//已加载的panels
    private last_show_type:number=0;//最后一次显示的活动id
    
    /**根据活动id显示panel */
    public ChangePanel(act_type: number){
        if (this.last_show_type ==act_type)
            return;
        if (LeiChongPanelRes[act_type]){
            let panel: LeiChongBasePanel = this.panels[act_type];
            if (!panel){
                panel = <LeiChongBasePanel>fgui.UIPackage.createObject("LeiChong", LeiChongPanelRes[act_type]).asCom;
                this.panels[act_type] = panel;
                this.addChild(panel);
                panel.InitData();
                panel.InitUI();
            }
            panel.visible=true;
            panel.OnShow();
        }
        if (this.last_show_type){
            let panel = this.panels[this.last_show_type];
            if(panel){
                panel.visible = false;
                panel.OnHide();
            }
        }
        this.last_show_type = act_type;
    }

    
}


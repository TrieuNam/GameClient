import { Vec2, Vec3 } from "cc";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, viewRegcfg } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { GuideButton } from "./GuideButton";
import { GuideCtrl } from "./GuideCtrl";
import { GuideData } from "./GuideData";
/* 
baseview虽然继承了fgui的组件
但是在涉及节点变化时不可以直接调用，需使用this.view
 */
@BaseView.registView
export class GuideView extends BaseView {
    guide_ctrl = GuideCtrl.Inst()
    ClickFrame: fgui.GButton = null;
    EffectShow: UIEffectShow = null;
    constructor() {
        super();
        GuideData.Inst().SetGuideView(this);
    }


    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Guide",
        ViewName: "GuideView",
        LayerType: ViewLayer.Top,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */



    protected viewNode = {
        Block: <fgui.GButton>null,
        Finger: <fgui.GComponent>null,
    };

    InitData() {
        this.guide_ctrl.SetGuideView(this)
    }

    InitUI() {

    }

    DoOpenWaitHandle() {

    }

    OpenCallBack() {
        if (!this.ClickFrame) {
            this.ClickFrame = this.viewNode.Finger.getChild("ClickFrame");
        }
        if (!this.EffectShow) {
            this.EffectShow = this.viewNode.Finger.getChild("EffectShow");
        }


        this.viewNode.Block.onClick(this.OnClickTarget, this)
        this.ClickFrame.onClick(this.OnClickTarget, this)
        this.viewNode.Block.visible = false
        this.viewNode.Finger.visible = false

        this.EffectShow.PlayEff(4164001)

        //LogError(this.viewNode.Finger.ClickFrame == null)

        // let GuideFinger = <GuideFinger>fgui.UIPackage.createObject("Guide", "GuideFingerParent").asCom;
        // GuideFinger.visible = false;
        // //GuideFinger.SetData();
        // let finger = this.view.addChild(GuideFinger);
        // //finger.setPosition(200,471)
        // let v3 = new Vec3(200, 471, 0)
        // let v2 = new Vec2(200, 1029)

        //let re = finger.localToGlobal(v2.x, v2.y)
        // this.viewNode.Finger.setPosition(v2.x, v2.y)

        // finger.setPosition(re.x, re.y);
        // GuideFinger.Hide();
        // let v33 = this.view._uiTrans.convertToNodeSpaceAR(v3)
        // LogError(v33);
        //localToGlobal
        // finger.localToGlobal(v33.x, -v33.y)
        //this.view.removeChild(finger);
        if (this.pos2) {
            this.Show(this.pos2);
            this.pos2 = undefined;
        }
    }

    CloseCallBack() {

    }

    OnClickTarget() {
        GuideCtrl.Inst().click_button.OnClick();
        this.Hide()
    }
    private pos2: Vec2
    public Show(pos: Vec2) {
        if (this.viewNode.Block && this.viewNode.Finger) {
            //显示手指等特效
            this.viewNode.Block.visible = false
            this.viewNode.Finger.setPosition(pos.x, pos.y)
            this.viewNode.Finger.visible = true
        } else {
            this.pos2 = pos;
        }
    }
    public Hide() {
        //隐藏特效

        this.viewNode.Block.visible = false
        this.viewNode.Finger.visible = false
    }
}
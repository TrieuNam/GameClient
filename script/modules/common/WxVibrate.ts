
import { sys, tween, Vec2, Vec3 } from "cc";
import { DEBUG } from "cc/env";
import * as fgui from "fairygui-cc";
import { RoleData } from "modules/role/RoleData";
import { PackageData } from "preload/PkgData";
import TGA from "tga-js";
import { ChannelAgent } from "../../proload/ChannelAgent";
import { ROLE_SETTING_TYPE } from "./CommonEnum";
import { ConstValue } from "./ConstValue";

export class WxVibrate extends fgui.GComponent {
    constructor() {
        super();
    }
    private p_click = true;
    protected onEnable() {
        if (this.parent && this.parent.data && (typeof (this.parent.data) == "string") && this.parent.data.indexOf(ConstValue.FGUIBaseUserData.WxVibrate) != -1) {
            this.p_click = false
        }
    }
    protected _hitTest(pt: Vec2, globalPt: Vec2): fgui.GObject {
        let is = super._hitTest(pt, globalPt);
        if (is && (globalPt as any).type == 2 && this.p_click) {
            let is = RoleData.Inst().GetRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingVibrate)
            if (is != 0) {
                return;
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
        return null;
    }
}
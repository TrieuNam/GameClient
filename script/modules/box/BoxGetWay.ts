import { CfgBoxData, CfgBoxGetWay } from "config/CfgBox";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { RoleData } from "modules/role/RoleData";
import { UH } from "../../helpers/UIHelper";


@BaseView.registView
export class BoxGetWayView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BoxGetWay,LevelUp",
        ViewName: "BoxGetWay",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        board3: <CommonBoard3>undefined,
        list_way: <fgui.GList>undefined,
        lb_tip: <fgui.GLabel>undefined,
    }
    protected extendsCfg = [
        { ResName: "BoxGetWayItem", ExtendsClass: BoxGetWayItem },
    ];
    OpenCallBack(): void {
        UH.SetText(this.viewNode.lb_tip, Language.Box.tip11);
        this.viewNode.board3.SetData(new BoardData(BoxGetWayView));
        let level = RoleData.Inst().GetRoleLevel();
        let cfg = CfgBoxData.getway.filter((value: CfgBoxGetWay) => {
            return level >= value.level ? value : undefined;
        });
        (this.viewNode.list_way as fgui.GList).SetData(cfg);
    }
}
class BoxGetWayItem extends BaseItem {
    protected _data: CfgBoxGetWay = null;
    protected viewNode = {
        gl_icon: <fgui.GLoader>undefined,
        lb_title: <fgui.GLabel>undefined,
        btn_go: <fgui.GButton>undefined,
    }
    protected onConstruct(): void {
        super.onConstruct();
        this.viewNode.btn_go.onClick(this.onGoto, this);
        UH.SetText(this.viewNode.btn_go, Language.Box.goto);
    }
    public SetData(data: CfgBoxGetWay) {
        super.SetData(data);
        UH.SetText(this.viewNode.lb_title, data.name);
        UH.SpriteName(this.viewNode.gl_icon, "LevelUp", data.icon)
    }
    private onGoto() {
        ViewManager.Inst().OpenViewByKey(this._data.open_panel);
    }
}
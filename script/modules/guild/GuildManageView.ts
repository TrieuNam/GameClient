
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { EGLoader } from 'modules/extends/EGLoader';
import { UH } from "../../helpers/UIHelper";
import { GuildConfig } from "./GuildConfig";
import { GuildCtrl } from "./GuildCtrl";

@BaseView.registView
export class GuildManageView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildManage",
        ViewName: "GuildManageView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BlockClose,
    };
    protected viewNode = {
        BgSp: <EGLoader>null,

        FuncList: <fgui.GList>null,
        FuncItem: <GuildManageViewFuncItem>null,
    };

    protected extendsCfg = [
        { ResName: "FuncItem", ExtendsClass: GuildManageViewFuncItem },
    ];

    InitData(param_t: any) {
        let funcs = param_t.funcs
        if (funcs) {
            let pos = param_t.pos
            this.viewNode.BgSp.x = pos.x
            this.viewNode.BgSp.y = pos.y - 2 * this.view.y
            UH.SpriteName(this.viewNode.BgSp, "GuildManage", `AnNiuQiPao${funcs.length}`)
            this.viewNode.FuncItem.visible = 1 == funcs.length
            if (1 == funcs.length) {
                this.viewNode.FuncItem.SetData(funcs[0])
            } else {
                this.viewNode.FuncList.SetData(funcs)
            }
        }
    }
}

class GuildManageViewFuncItem extends BaseItem {
    protected viewNode = {
        BtnOper: <fgui.GButton>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnOper.onClick(this.OnClickOper, this);
    }

    public SetData(data: any) {
        super.SetData(data);
        if (data) {
            this.viewNode.BtnOper.title = Language.Guild.GuildInfo.BtnOpers[data.type]
        }
    }

    OnClickOper() {
        if (this._data) {
            ViewManager.Inst().CloseView(GuildManageView);
            switch (this._data.type) {
                case GuildConfig.MemberOperType.exit:
                    GuildCtrl.Inst().SendGuildReqQuit();
                    break;
                case GuildConfig.MemberOperType.kick_out:
                    GuildCtrl.Inst().SendGuildReqKickOut(this._data.roleId);
                    break;
                case GuildConfig.MemberOperType.appoint_up:
                    GuildCtrl.Inst().SendGuildReqAppoint(this._data.roleId, GuildConfig.PositionType.vice_president);
                    break;
                case GuildConfig.MemberOperType.appoint_down:
                    GuildCtrl.Inst().SendGuildReqAppoint(this._data.roleId, GuildConfig.PositionType.member);
                    break;
                case GuildConfig.MemberOperType.appoint_to:
                    GuildCtrl.Inst().SendGuildReqAppoint(this._data.roleId, GuildConfig.PositionType.president);
                    break;
                case GuildConfig.MemberOperType.appoint_tov:
                    GuildCtrl.Inst().SendGuildReqAppoint(this._data.roleId, GuildConfig.PositionType.vice_president);
                    break;
            }
        }
    }
}

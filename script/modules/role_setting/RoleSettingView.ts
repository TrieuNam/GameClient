import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { BaseItemGL } from "modules/common/BaseItem";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { Mod } from "modules/common/ModuleDefine";
import { RoleData } from "modules/role/RoleData";
import { RoleSettingInfoPanel } from "./RoleSettingInfoPanel";
import { ItemMailCell, MailItem, RoleSettingMailPanel } from "./RoleSettingMailPanel";
import { RoleSettingNoticePanel } from "./RoleSettingNoticePanel";
import { RoleSettingSettingPanel } from "./RoleSettingSettingPanel";

@BaseView.registView 
export class RoleSettingView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "RoleSetting",
        ViewName: "RoleSettingView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected extendsCfg = [
        { ResName: "LabelNotice", ExtendsClass: RoleSettingViewNoticeLaber },
        { ResName: "MailItem", ExtendsClass: MailItem },
        { ResName: "ItemMailCell", ExtendsClass: ItemMailCell },
    ]

    protected boardCfg: boardCfg = {
        TabberCfg: [
            {panel:RoleSettingInfoPanel, viewName:"RoleSettingInfoPanel",titleName:Language.RoleSetting.TabInfo,modKey: Mod.RoleSetting.Info},
            {panel:RoleSettingSettingPanel, viewName:"RoleSettingSettingPanel",titleName:Language.RoleSetting.TabSetting,modKey: Mod.RoleSetting.Setting},
            {panel:RoleSettingNoticePanel, viewName:"RoleSettingNoticePanel",titleName:Language.RoleSetting.TabNotice,modKey: Mod.RoleSetting.Notice},
            {panel:RoleSettingMailPanel, viewName:"RoleSettingMailPanel",titleName:Language.RoleSetting.TabMail,modKey: Mod.RoleSetting.Mail, isRemind:true},
            // {panel:TrialGuMoTowerPanel,viewName:"TrialGuMoTowerPanel",titleName:Language.Trial.TabGuMoTower,modKey: Mod.Trial.GuMoTower},
        ]
    };
}

export class RoleSettingViewNoticeLaber extends BaseItemGL {
    protected viewNode = {
        TogShow: <fgui.GButton>null,
    };

    protected onConstruct(): void {
        super.onConstruct();
        this.viewNode.TogShow.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
    }

    public SetData(data: any) {
        super.SetData(data);
        this.viewNode.TogShow.selected = 0 == RoleData.Inst().GetRoleSystemSetInfo(data)
    }

    onChangedEnd(target: fgui.GComponent) {
        RoleData.Inst().ChangeRoleSystemSetInfo(this._data, this.viewNode.TogShow.selected ? 0 : 1)
    }
}


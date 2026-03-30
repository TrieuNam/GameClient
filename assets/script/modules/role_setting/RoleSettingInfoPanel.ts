
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BasePanel } from "modules/common/BasePanel";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { RoleTitleItem2 } from "modules/common_item/RoleTitleItems";
import { AvatarCell } from "modules/extends/AvatarCell";
import { ServerSelectView } from "modules/login/ServerSelectView";
import { ManualData } from "modules/Manual/ManualCtrl";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { PackageData } from "preload/PkgData";
import { SpriteFrame } from "cc";


export class RoleSettingInfoPanel extends BasePanel {

    protected viewNode = {
        BtnServer: <fgui.GButton>null,
        RoleAvatar: <AvatarCell>null,
        NameShow: <fgui.GTextField>null,
        LevelShow: <fgui.GTextField>null,
        UidShow: <fgui.GTextField>null,
        ServerShow: <fgui.GTextField>null,
        TitleShow: <RoleTitleItem2>null,
        GpKeFu: <fgui.GGroup>null,
        BtnKeFu: <fgui.GButton>null,
        BtnCopy: <fgui.GButton>null,
    };

    InitPanelData() {
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleInfo.bind(this), "roleinfo");

        this.viewNode.BtnServer.onClick(this.OnClickServer, this);
        this.viewNode.BtnCopy.onClick(this.OnClickCopy, this);

        if (PackageData.Inst().getShowKh()) {
            this.viewNode.GpKeFu.visible = true;
            this.viewNode.BtnKeFu.onClick(this.OnClickKeFu, this);
        }
    }

    InitPanel() {
        this.FlushRoleInfo();
    }

    ClosePanel() {
    }

    public FlushRoleInfo() {
        UH.SetText(this.viewNode.NameShow, RoleData.Inst().GetRoleName());
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.RoleSetting.Info.LevelShow, RoleData.Inst().GetRoleLevel()));
        UH.SetText(this.viewNode.UidShow, TextHelper.Format(Language.RoleSetting.Info.UidShow, RoleData.Inst().GetRoleId()));
        UH.SetText(this.viewNode.ServerShow, TextHelper.Format(Language.RoleSetting.Info.ServerShow, DataHelper.Uid2ServerId(RoleData.Inst().GetRoleId())));

        if (RoleData.Inst().avatar_out_texture) {
            this.viewNode.RoleAvatar.SeSpriteFrame(RoleData.Inst().avatar_out_texture as SpriteFrame)
        } else
            this.viewNode.RoleAvatar.DefaultShow()
        this.viewNode.TitleShow.SetData({ title: RoleData.Inst().GetTitleId(), level: ManualData.Inst().GetLevel() })

    }
    OnClickKeFu() {
        ChannelAgent.Inst().OnMessage(GameToChannel.KeFu);
    }

    OnClickServer() {
        ViewManager.Inst().OpenView(ServerSelectView)
    }
    OnClickCopy() {
        ChannelAgent.Inst().CopyText(RoleData.Inst().GetRoleId() + "");
    }
}
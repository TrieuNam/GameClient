
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BasePanel } from "modules/common/BasePanel";
import { Language } from "modules/common/Language";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { OtherRoleCtrl } from "modules/OtherRole/OtherRoleCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { GuildApplyView } from "./GuildApplyView";
import { GuildConfig } from "./GuildConfig";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";
import { GuildManageView } from "./GuildManageView";
import { GuildNoticeView } from "./GuildNoticeView";
import { GuildView } from "./GuildView";


export class GuildInfoPanel extends BasePanel {

    protected viewNode = {
        BtnApply: <fgui.GButton>null,
        BtnNotice: <fgui.GButton>null,
        BtnClose: <fgui.GButton>null,

        NoticeShow: <fgui.GTextField>null,
        MemberList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ItemMember", ExtendsClass: GuildInfoPanelMemberItem },
    ];

    InitPanelData() {
        this.viewNode.BtnApply.onClick(this.OnClickApply, this);
        this.viewNode.BtnNotice.onClick(this.OnClickNotice, this);
        this.viewNode.BtnClose.onClick(this.OnClickClose, this);

        this.viewNode.MemberList.setVirtual()
        this.viewNode.MemberList.scrollItemToViewOnClick = false

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");
        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "AppList");
        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushMemberList.bind(this), "MemberList");

        GuildCtrl.Inst().SendGuildReqMemberList();
    }

    InitPanel() {
        this.FlushInfo();
        this.FlushMemberList();
    }

    ClosePanel() {
    }

    FlushInfo() {
        if (!GuildData.Inst().IsInGuild()) {
            return
        }
        let info = GuildData.Inst().ResultData.Info
        UH.SetText(this.viewNode.NoticeShow, IsEmpty(info.guildNotice) ? Language.Guild.GuildInfo.NoticeShowEmpty : DataHelper.BytesToString(info.guildNotice));

        this.viewNode.BtnApply.visible = GuildData.Inst().IsGuildManager() && GuildData.Inst().GetGuildApplyListShow().length > 0
        this.viewNode.BtnNotice.visible = GuildData.Inst().IsGuildManager()
    }

    FlushMemberList() {
        let member_list = GuildData.Inst().GetGuildMemberListShow()
        this.viewNode.MemberList.SetData(member_list)
    }

    OnClickApply() {
        ViewManager.Inst().OpenView(GuildApplyView)
    }

    OnClickNotice() {
        ViewManager.Inst().OpenView(GuildNoticeView)
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(GuildView)
    }
}

class GuildInfoPanelMemberItem extends BaseItem {
    protected viewNode = {
        GpManager: <fgui.GGroup>null,
        GpMember: <fgui.GGroup>null,
        NameShow: <fgui.GTextField>null,
        JobSp: <fgui.GLoader>null,
        JobShow: <fgui.GTextField>null,
        AvatarShow: <AvatarCell>null,
        BtnOper: <fgui.GButton>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.AvatarShow.onClick(this.OtherRoleInfo.bind(this));
        this.viewNode.BtnOper.onClick(this.OnClickOper, this);
    }

    public SetData(data: IPB_SCGuildMemberNode) {
        super.SetData(data);

        let role_info = data.roleInfo
        let is_manager = GuildConfig.PositionType.member != data.position
        let funcs = GuildData.Inst().GetGuildMemberFuncs(data.position, role_info ? role_info.roleId == RoleData.Inst().GetRoleId() : false)

        if (role_info) {
            this.viewNode.AvatarShow.SetData(new AvatarData(role_info.headPicId, role_info.level, role_info.headChar))
            UH.SetText(this.viewNode.NameShow, DataHelper.BytesToString(role_info.name))
        }
        this.viewNode.GpManager.visible = is_manager
        this.viewNode.GpMember.visible = !is_manager
        if (is_manager) {
            UH.SpriteName(this.viewNode.JobSp, "Guild", GuildConfig.PositionIcon[data.position])
            UH.SetText(this.viewNode.JobShow, Language.Guild.PositionShow[data.position])
        }
        this.viewNode.BtnOper.visible = funcs.length > 0
    }

    OtherRoleInfo() {
        if (this._data) {
            if (this._data.roleInfo.roleId < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else {
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(undefined, undefined, this._data.roleInfo.roleId);
            }
        }
    }

    OnClickOper() {
        if (this._data) {
            let role_info = this._data.roleInfo
            let funcs = GuildData.Inst().GetGuildMemberFuncs(this._data.position, this._data.roleInfo ? this._data.roleInfo.roleId == RoleData.Inst().GetRoleId() : false)
            let list = []
            for (let i = 0; i < funcs.length; i++) {
                list.push({ type: funcs[i], roleId: role_info ? role_info.roleId : 0 })
            }
            ViewManager.Inst().OpenView(GuildManageView, { funcs: list, pos: this.viewNode.BtnOper.localToGlobal() })
        }
    }
}
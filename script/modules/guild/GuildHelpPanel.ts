
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem, BaseItemGP } from "modules/common/BaseItem";
import { BasePanel } from "modules/common/BasePanel";
import { Language } from "modules/common/Language";
import { RoleTitleItem1 } from "modules/common_item/RoleTitleItems";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { OtherRoleCtrl } from "modules/OtherRole/OtherRoleCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GuildBossView } from "./GuildBossView";
import { GuildConfig } from "./GuildConfig";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";
import { GuildTrainView } from "./GuildTrainView";
import { GuildView } from "./GuildView";


export class GuildHelpPanel extends BasePanel {
    static ListToDown: boolean = false;

    protected viewNode = {
        BtnTrain: <fgui.GButton>null,
        BtnBoss: <fgui.GButton>null,
        BtnClose: <fgui.GButton>null,

        RedPointBoss: <RedPoint>null,

        ShowList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ItemChatRole", ExtendsClass: GuildHelpPanelItemChatRole },
        { ResName: "ItemChatSystem", ExtendsClass: GuildHelpPanelItemChatSystem },
        { ResName: "ProgressBox", ExtendsClass: GuildHelpPanelProgressBox },
    ];

    InitPanelData() {
        this.viewNode.BtnTrain.onClick(this.OnClickTrain, this);
        this.viewNode.BtnBoss.onClick(this.OnClickBoss, this);
        this.viewNode.BtnClose.onClick(this.OnClickClose, this);

        this.viewNode.ShowList.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.ShowList.setVirtual();

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushReportList.bind(this), "ReportListFlush");
        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");
    }

    InitPanel() {
        this.FlushInfo();
        this.FlushReportList();
    }

    ClosePanel() {
    }

    OnVisible() {
        GuildCtrl.Inst().SendGuildReqReportList()
    }

    private showList: any[] = []

    private GetListItemResource(index: number) {
        let data = this.showList[index];
        if (GuildConfig.ReportType.help == data.type) {
            return fgui.UIPackage.getItemURL("Guild", "ItemChatRole");
        }
        else {
            return fgui.UIPackage.getItemURL("Guild", "ItemChatSystem");
        }
    }

    FlushInfo() {
        let info = GuildData.Inst().ResultData.Info
        let co = GuildData.Inst().CfgBossFightInfoByTime(info.bossFightTime + 1)
        this.viewNode.RedPointBoss.SetNum(co && co.fight_item_num > 0 ? 0 : 1)
    }

    FlushReportList() {
        let info = GuildData.Inst().ResultData.ReportList
        this.showList = info.reportList
        this.viewNode.ShowList.SetData(this.showList);
        if (GuildHelpPanel.ListToDown) {
            GuildHelpPanel.ListToDown = false
            this.viewNode.ShowList.scrollToView(this.showList.length - 1)
        }
    }

    OnClickTrain() {
        ViewManager.Inst().OpenView(GuildTrainView)
    }

    OnClickBoss() {
        ViewManager.Inst().OpenView(GuildBossView)
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(GuildView)
    }
}

export class GuildHelpPanelItemChatSystem extends BaseItem {
    protected viewNode = {
        ContentShow: <fgui.GTextField>null,
    };
    public SetData(data: IPB_SCGuildReportNode) {
        UH.SetText(this.viewNode.ContentShow, TextHelper.Format(Language.Guild.GuildHelp.ContentShow[data.type], DataHelper.BytesToString(data.nameA), DataHelper.BytesToString(data.nameB)))
    }
}

export class GuildHelpPanelItemChatRole extends BaseItem {
    protected viewNode = {
        BtnHelp: <fgui.GButton>null,

        BgSp: <fgui.GLoader>null,
        NameShow: <fgui.GTextField>null,
        AvatarShow: <AvatarCell>null,
        TitleShow: <RoleTitleItem1>null,
        ProgressBox: <GuildHelpPanelProgressBox>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnHelp.onClick(this.OnClickHelp, this);
        this.viewNode.AvatarShow.onClick(this.OtherRoleInfo.bind(this));
    }

    public SetData(data: IPB_SCGuildReportNode) {
        super.SetData(data)
        if (data) {
            let role_info = data.roleInfo
            let is_self = false
            if (role_info) {
                UH.SpriteName(this.viewNode.BgSp, "Guild", RoleData.Inst().GetRoleId() == role_info.roleId ? "LiaoTianBanLv" : "LiaoTianBanHuang")
                UH.SetText(this.viewNode.NameShow, DataHelper.BytesToString(role_info.name));
                this.viewNode.AvatarShow.SetData(new AvatarData(role_info.headPicId, role_info.level, role_info.headChar))
                this.viewNode.TitleShow.SetData({ title: role_info.titleId, level: role_info.knightLevel })
                is_self = RoleData.Inst().GetRoleId() == role_info.roleId
            }
            this.viewNode.ProgressBox.SetData(data)
            this.viewNode.BtnHelp.grayed = is_self || 0 != data.param_4
            this.viewNode.BtnHelp.title = `Lv.${data.param_2}`
            this.viewNode.BtnHelp.icon = fgui.UIPackage.getItemURL("Guild", `BaoXiang${data.param_1}`);
        }
    }

    public OnClickHelp() {
        if (this._data) {
            GuildCtrl.Inst().SendGuildHelpRet(this._data.reportKey)
        }
    }

    OtherRoleInfo() {
        if (this._data) {
            if (this._data.roleInfo.roleId < 65535) {
                PublicPopupCtrl.Inst().Center(Language.Arena.tip2);
            } else
                OtherRoleCtrl.Inst().SendGetOtherRoleInfo(undefined, undefined, this._data.roleInfo.roleId);
        }
    }
}


export class GuildHelpPanelProgressBox extends BaseItemGP {
    protected viewNode = {
        ValShow: <fgui.GRichTextField>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public SetData(data: IPB_SCGuildReportNode) {
        let co = GuildData.Inst().GetHelpInfoByTypeLevel(data.param_1, data.param_2)
        if (co) {
            this.value = data.param_3
            this.max = co.help_num
            UH.SetText(this.viewNode.ValShow, TextHelper.Format(Language.Guild.GuildHelp.ProgressValShow, data.param_3, co.help_num));
        }
    }
}

import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { CommonBoard5, CommonBoard5Tab } from "modules/common_board/CommonBoard5";
import { AvatarGuildCell, AvatarGuildData } from "modules/extends/AvatarCell";
import { EGLoader } from 'modules/extends/EGLoader';
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GuildData } from './GuildData';
import { GuildHelpPanel } from './GuildHelpPanel';
import { GuildInfoPanel } from './GuildInfoPanel';
import { GuildSettingView } from "./GuildSettingView";

@BaseView.registView
export class GuildView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Guild",
        ViewName: "GuildView",
        LayerType: ViewLayer.Buttom,
        ViewMask: ViewMask.BgBlock,
    };
    protected viewNode = {
        BgSp: <EGLoader>null,

        NameShow: <fgui.GTextField>null,
        IdShow: <fgui.GTextField>null,
        NumShow: <fgui.GRichTextField>null,
        AvatarShow: <AvatarGuildCell>null,
        EditorShow: <fgui.GImage>null,
    };

    protected extendsCfg = [
        { ResName: "ButtonTab", ExtendsClass: CommonBoard5Tab },
        { ResName: "BoadGuild", ExtendsClass: CommonBoard5 },
    ];

    protected boardCfg: boardCfg = {
        TabberCfg: [
            { panel: GuildHelpPanel, viewName: "GuildHelpPanel", titleName: Language.Guild.TabGuildHelp, tileShowName: Language.Guild.TabGuild, modKey: Mod.Guild.GuildHelp, helpTips: 30, btnCloseShow: false },
            { panel: GuildInfoPanel, viewName: "GuildInfoPanel", titleName: Language.Guild.TabGuildInfo, tileShowName: Language.Guild.TabGuild, modKey: Mod.Guild.GuildInfo, helpTips: 30, btnCloseShow: false },
        ],
    };

    DoOpenWaitHandle() {
        let self = this;
        let waitHandle = self.createWaitHandle("loadBG")
        self.AddWaitHandle(waitHandle);
        self.viewNode.BgSp.SetIcon(`loader/guild/BeiJing`, () => {
            waitHandle.complete = true;
        })
    }

    InitData() {
        this.viewNode.AvatarShow.onClick(this.OnClickEditor, this);

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");
    }

    InitUI() {
        this.FlushInfo()
    }

    FlushInfo() {
        if (!GuildData.Inst().IsInGuild()) {
            ViewManager.Inst().CloseView(GuildView)
            return
        }
        let info = GuildData.Inst().ResultData.Info
        this.viewNode.AvatarShow.SetData(new AvatarGuildData(info.guildIcon))
        UH.SetText(this.viewNode.NameShow, TextHelper.Format(Language.Guild.NameShow, DataHelper.BytesToString(info.guildName)))
        UH.SetText(this.viewNode.IdShow, TextHelper.Format(Language.Guild.IdShow, info.guildId))
        UH.SetText(this.viewNode.NumShow, TextHelper.Format(Language.Guild.NumShow, info.guildMemberNum, GuildData.Inst().CfgOtherGuildPopNum(), info.guildMemberNum < GuildData.Inst().CfgOtherGuildPopNum() ? COLORSTR.Green1 : COLORSTR.Red1))
        this.viewNode.EditorShow.visible = GuildData.Inst().IsGuildManager()
    }

    OnClickEditor() {
        if (GuildData.Inst().IsGuildManager()) {
            ViewManager.Inst().OpenView(GuildSettingView)
        }
    }
}

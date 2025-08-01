
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard3 } from 'modules/common_board/CommonBoard3';
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { IsEmpty } from "../../helpers/UtilHelper";
import { GuildCtrl } from "./GuildCtrl";
import { GuildData } from "./GuildData";

@BaseView.registView
export class GuildSettingView extends BaseView {
    private autoCtrler: fgui.Controller
    private searchCtrler: fgui.Controller

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildSetting",
        ViewName: "GuildSettingView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        BtnConfirm: <fgui.GButton>null,
        BtnDismiss: <fgui.GButton>null,

        InputField: <fgui.GTextInput>null,
        InputTips: <fgui.GTextField>null,
    };

    InitData() {
        this.autoCtrler = this.view.getController("AutoSel");
        this.searchCtrler = this.view.getController("SearchSel");

        this.viewNode.Board.SetData(new BoardData(GuildSettingView));

        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
        this.viewNode.BtnDismiss.onClick(this.OnClickDismiss, this);

        this.AddSmartDataCare(GuildData.Inst().ResultData, this.FlushInfo.bind(this), "Info");

        this.viewNode.InputField.restrict = "50-300"
        this.viewNode.InputField.on(fgui.Event.TEXT_CHANGE, () => {
            this.viewNode.InputTips.visible = "" == this.viewNode.InputField.text
        })
    }

    InitUI() {
        this.FlushInfo()
    }

    FlushInfo() {
        let info = GuildData.Inst().ResultData.Info
        this.viewNode.InputTips.text = `${info.appLevel}`
        this.autoCtrler.selectedIndex = info.autoApp
        this.searchCtrler.selectedIndex = info.canSearch
    }

    OnClickConfirm() {
        ViewManager.Inst().CloseView(GuildSettingView)
        GuildCtrl.Inst().SendGuildReqSetGuild(IsEmpty(this.viewNode.InputField.text) ? +this.viewNode.InputTips.text : +this.viewNode.InputField.text, this.autoCtrler.selectedIndex, this.searchCtrler.selectedIndex)
    }

    OnClickDismiss() {
        PublicPopupCtrl.Inst().DialogTips(Language.Guild.GuildInfo.DismissTips, DialogTipsTypes.guild_dismiss, () => {
            ViewManager.Inst().CloseView(GuildSettingView)
            GuildCtrl.Inst().SendGuildReqDismiss()
        })
    }
}

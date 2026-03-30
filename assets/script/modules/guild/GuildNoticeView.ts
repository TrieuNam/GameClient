
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from 'modules/common_board/BoardData';
import { CommonBoard3 } from 'modules/common_board/CommonBoard3';
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { BannedWordFilter } from "modules/sensitiveWords/BannedWordFilter";
import { GuildCtrl } from "./GuildCtrl";

@BaseView.registView
export class GuildNoticeView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GuildNotice",
        ViewName: "GuildNoticeView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        BtnConfirm: <fgui.GButton>null,

        InputField: <fgui.GTextInput>null,
        InputTips: <fgui.GTextField>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GuildNoticeView));

        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);

        this.viewNode.InputField.on(fgui.Event.TEXT_CHANGE, () => {
            this.viewNode.InputTips.visible = "" == this.viewNode.InputField.text
        })
    }

    OnClickConfirm() {
        let info = BannedWordFilter.ins.filterWord(this.viewNode.InputField.text)
        if (info.has) {
            PublicPopupCtrl.Inst().Center(Language.Common.bannedWordTip)
            return
        }
        GuildCtrl.Inst().SendGuildReqSetNotice(this.viewNode.InputField.text)
        ViewManager.Inst().CloseView(GuildNoticeView)
    }
}

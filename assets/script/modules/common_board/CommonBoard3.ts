import { BaseView, ViewLayer, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { HelpView } from "modules/common_help/CommonHelpView";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { COLORSTR } from "modules/common/ColorEnum";
import { BoardData } from "./BoardData";
import { LogError } from "core/Debugger";

export class CommonBoard3 extends fgui.GLabel {

    private viewNode = {
        BtnClose: <fgui.GButton>null,
        title: <fgui.GRichTextField>null,
        TitleShow: <fgui.GGroup>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private board_data: BoardData;
    SetData(board_data: BoardData) {
        if (board_data.title) {
            this.title = board_data.title;
            UH.SetText(this.viewNode.title, board_data.title);
        }
        this.viewNode.BtnClose.onClick(this.closeView.bind(this));
        this.board_data = board_data;
    }

    SetTitleShow(is_show: boolean) {
        this.viewNode.TitleShow.visible = is_show
    }
    
    SetTitle(title: string) {
        this.title = title;
        UH.SetText(this.viewNode.title, title);
    }

    private closeView() {
        ViewManager.Inst().CloseView(this.board_data.view)
    }
}
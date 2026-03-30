import { BaseView, ViewLayer, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { HelpView } from "modules/common_help/CommonHelpView";
import { UH } from "../../helpers/UIHelper";
import { COLORSTR } from "modules/common/ColorEnum";
import { BoardData } from "./BoardData";

export class CommonBoard4 extends fgui.GLabel {

    private viewNode = {
        BtnClose: <fgui.GButton>null, 
        BtnHelp: <fgui.GButton>null,
        title: <fgui.GRichTextField>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private board_data: BoardData;
    SetData(board_data: BoardData) {
        let self = this;
        if (board_data.title){ 
            this.title = board_data.title;
            UH.SetText(this.viewNode.title, board_data.title);
        }
        this.viewNode.BtnClose.onClick(this.closeView.bind(this));
        this.viewNode.BtnHelp.onClick(self.helpFun.bind(self));
        this.viewNode.BtnHelp.visible = board_data.help_key != undefined;
        this.board_data = board_data;
    }

    private closeView(){
        ViewManager.Inst().CloseView(this.board_data.view)
    }
    
    private helpFun() {
        //通过board_data.help_key读表取值
    }
}
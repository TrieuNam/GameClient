import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { HelpView } from "modules/common_help/CommonHelpView";
import { UH } from "../../helpers/UIHelper";
import { BoardData } from "./BoardData";

export class CommonBoard2 extends fgui.GLabel {
    private extra_compent: fgui.GComponent;

    private viewNode = {
        BtnClose: <fgui.GButton>null,
        BtnHelp: <fgui.GButton>null,
        title: <fgui.GTextField>null,
        icon: <fgui.GLoader>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private board_data: BoardData;
    fontSize = 40;
    font_gap = 1;//18;
    SetData(board_data: BoardData) {
        let self = this;
        self.board_data = board_data;
        if (board_data.title)
            UH.SetText(self.viewNode.title, board_data.title)
        let title = self.viewNode.title.text;
        let width = this.fontSize * title.length + this.font_gap * (title.length - 1);
        self.viewNode.title.width = width;
        self.viewNode.BtnClose.onClick(self.closeFun.bind(self));
        self.viewNode.BtnHelp.onClick(self.helpFun.bind(self));
        self.viewNode.BtnHelp.visible = board_data.help_key != undefined;
    }

    public addExtraCompent(extra_compent: fgui.GObject) {
        if (!this.extra_compent) {
            this.extra_compent = new fgui.GComponent();
            this.extra_compent.height = 1500;
            this.extra_compent.width = 800;
            this.addChildAt(this.extra_compent, 1);
            this.extra_compent.center();
        }
        this.extra_compent.addChildAt(extra_compent, 0);
    }

    public removeExtraCompent() {
        if (this.extra_compent)
            this.extra_compent.removeChildren();
    }

    private closeFun() {
        ViewManager.Inst().CloseView(this.board_data.view)
    }

    private helpFun() {
        if (this.board_data.help_key != undefined) {
            ViewManager.Inst().OpenView(HelpView, this.board_data.help_key);
        }
    }

    public SetIcon(icon: string, pos_y: number) {
        UH.SpriteName(this.viewNode.icon, "CommonBoard", icon);
        this.viewNode.icon.y = pos_y;
        this.viewNode.title.visible = icon != "Tou_BuDaiBiaoTi";
    }

    public SetHelpVisible(visible: boolean) {
        this.viewNode.BtnHelp.visible = visible;
    }

    public SetBtnCloseVisible(visible: boolean) {
        this.viewNode.BtnClose.visible = visible;
    }

    // 为什么连换个名字都不允许呢？
    public SetTitle(name: string) {
        let self = this;
        self.board_data.title = name
        UH.SetText(self.viewNode.title, self.board_data.title)
        let title = self.viewNode.title.text;
        let width = this.fontSize * title.length + this.font_gap * (title.length - 1);
        self.viewNode.title.width = width;
    }
}

export class CommonBoard2_2 extends fgui.GComponent {
    private viewNode = {
        BtnClose: <fgui.GButton>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private board_data: BoardData;
    SetData(board_data: BoardData) {
        this.board_data = board_data;
        this.viewNode.BtnClose.onClick(this.closeFun.bind(this));
    }

    private closeFun() {
        ViewManager.Inst().CloseView(this.board_data.view)
    }

}
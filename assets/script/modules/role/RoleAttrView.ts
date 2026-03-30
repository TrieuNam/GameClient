import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { AttrListName } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { MainCapItem } from "modules/main/MainItems";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { RoleData } from "./RoleData";


@BaseView.registView
export class RoleAttrView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Role",
        ViewName: "RoleAttrView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board: <AttrBoard>null,
        AttrList: <fgui.GList>null,
        BtnArrow: <fgui.GButton>null,
        empty: <fgui.GLabel>null,
        CapShow: <MainCapItem>null,
    };

    protected extendsCfg = [
        { ResName: "AttrDesc", ExtendsClass: RoleAttrDesc },
        { ResName: "AttrItem", ExtendsClass: AttrItem },
        { ResName: "AttrTitleItem", ExtendsClass: AttrTitleItem },
        { ResName: "AttrBoard", ExtendsClass: AttrBoard },
    ]

    InitData(param_t?: any) {
        this.viewNode.AttrList.itemProvider = this.GetListItemResource.bind(this);
        param_t = param_t ?? []
        let attrShow = []
        let attrList = param_t.attrList ?? [];
        let is_show_hiding = param_t.is_show_hiding ?? false;
        for (let i = 0; i < attrList.length; i++) {
            if (is_show_hiding || RoleData.Inst().GetRoleAttrIsShow(attrList[i].attrType)) {
                attrShow.push(attrList[i])
            }
        }
        this.viewNode.BtnArrow.visible = false;
        this.viewNode.Board.SetData(new BoardData(RoleAttrView, param_t.name, param_t.help));
        this.attrList = attrShow
        this.viewNode.empty.visible = attrShow.length == 0
        this.attrList.splice(4, 0, "string");
        this.viewNode.AttrList.SetData(this.attrList)
        this.viewNode.BtnArrow.onClick(this.OnClickArrow.bind(this));
        this.viewNode.CapShow.SetData(AttrHelper.GetPower(attrList, false))
        this.viewNode.AttrList._container.addComponent(CocHighPerfList)

    }

    private attrList: any[]

    private GetListItemResource(index: number) {
        let data = this.attrList[index];
        if (undefined != data.attrDesc) {
            return fgui.UIPackage.getItemURL("Role", "AttrDesc");
        } else if (data === "string") {
            return fgui.UIPackage.getItemURL("Role", "AttrTitleItem");
        }
        else {
            return fgui.UIPackage.getItemURL("Role", "AttrItem");
        }
    }

    OnClickArrow() {
        this.viewNode.AttrList.scrollPane.scrollDown()
    }

}

export class RoleAttrDesc extends BaseItem {
    protected viewNode = {
        AttrDesc: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrDesc, data.attrDesc);
    }
}
export class AttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType]);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue));
    }
}
export class AttrTitleItem extends BaseItem {
    protected viewNode = {

    };

    public SetData(data: any) {
    }
}
export class AttrBoard extends fgui.GLabel {
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
        if (board_data.title) {
            this.title = board_data.title;
            UH.SetText(this.viewNode.title, board_data.title);
        }
        this.viewNode.BtnClose.onClick(this.closeView.bind(this));
        this.viewNode.BtnHelp.onClick(self.helpFun.bind(self));
        this.viewNode.BtnHelp.visible = board_data.help_key != undefined;
        this.board_data = board_data;
    }

    private closeView() {
        ViewManager.Inst().CloseView(this.board_data.view)
    }

    private helpFun() {
        //通过board_data.help_key读表取值
    }
}
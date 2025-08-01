import { CfgAttrUp } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AttrListDesc, AttrListName, Language } from "modules/common/Language";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";

export class AttrItem extends fgui.GComponent {
    private viewNode = {
        List: <fgui.GList>null,
        ImgEmpty: <fgui.GImage>null,
        TxtEmpty: <fgui.GTextField>null,
        bg: <fgui.GImage>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.List.itemProvider = this.GetListItemResource.bind(this);
        // this.viewNode.List.setVirtual();
    }

    private list_data: any[];
    public SetData(list_att: CfgAttrUp[], bg?: number) {
        list_att.sort(
            (a: CfgAttrUp, b: CfgAttrUp) => {
                return a.type - b.type;
            }
        )
        let list: any[] = [];
        if (list_att.length > 0) {
            // list.push(Language.Common.basic_attr);
            for (let i = 0; i < list_att.length; i++) {
                if (list_att[i].type > 4) {
                    list.push(Language.Common.add_attr);
                    list = list.concat(list_att.slice(i));
                    break;
                } else {
                    list.push(list_att[i]);
                }
            }
        }
        this.viewNode.ImgEmpty.visible = list_att.length == 0;
        this.viewNode.TxtEmpty.visible = list_att.length == 0;
        this.list_data = list;
        this.viewNode.List.SetData(list);
        // this.viewNode.List.refreshVirtualList();

        this.viewNode.bg.visible = bg != 1
    }

    private GetListItemResource(index: number) {
        let data = this.list_data[index];
        if (typeof (data) == "string")
            return fgui.UIPackage.getItemURL("CommonItem", "AttrTitleCell");
        else if (data.type <= 4)
            return fgui.UIPackage.getItemURL("CommonItem", "AttrItemCell");
        else
            return fgui.UIPackage.getItemURL("CommonItem", "AttrAddItemCell");
    }

}

export class AttrItemCell extends fgui.GComponent {
    private viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtNum: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: CfgAttrUp) {
        UH.SetText(this.viewNode.TxtName, AttrListName[data.type] + ":");
        UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.type, data.add));
    }
}

export class AttrAddItemCell extends fgui.GComponent {
    private viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtNum: <fgui.GTextField>null,
        TxtDesc: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: CfgAttrUp) {
        UH.SetText(this.viewNode.TxtName, AttrListName[data.type] + ":");
        UH.SetText(this.viewNode.TxtDesc, AttrListDesc[data.type]);
        UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.type, data.add));
    }
}

export class AttrTitleCell extends fgui.GComponent {
    private viewNode = {
        // title: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(title: string) {
        // if (title == Language.Common.add_attr) {
        //     this.height = 50;
        // }
        // UH.SetText(this.viewNode.title, title);
    }
}

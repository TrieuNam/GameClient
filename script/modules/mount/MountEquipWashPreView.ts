import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { AttrListName } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { UH } from "../../helpers/UIHelper";
import { MountData } from "./MountData";

@BaseView.registView
export class MountEquipWashPreView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipSure",
        ViewName: "MountEquipWashPreView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "WashPreviewAttr", ExtendsClass: MountEquipWashPreviewAttr },
    ]
    protected viewNode = {
        Board:<CommonBoard4>null,
        attr_list:<fgui.GList>null,
    }
    private show_index:number
    InitData(param:{bag_index:number}) {
        this.show_index = param.bag_index

        this.viewNode.Board.SetData(new BoardData(MountEquipWashPreView, null));

        this.flushInfoPanel()
    }
    CloseCallBack() {

    }
    flushInfoPanel()
    {
        let detail = MountData.Inst().GetEquipWashPreDetail(this.show_index)

        this.viewNode.attr_list.SetData(detail.attr_list)
    }
}

export class MountEquipWashPreviewAttr extends fgui.GComponent {
    private viewNode = {
        attr_type:<fgui.GLabel>null,
        attr_str:<fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data:any) {
        if(data == null)
        {
            return 
        }
        this.data = data
        UH.SetText(this.viewNode.attr_type,AttrListName[data.attr_type])
        UH.SetText(this.viewNode.attr_str,data.attr_str)
    }
}
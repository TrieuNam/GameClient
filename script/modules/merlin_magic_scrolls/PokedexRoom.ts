import { BasePanel } from "modules/common/BasePanel";
import { Language } from "modules/common/Language";
import { MerlinMagicData, ScrollQuaList } from "./MerlinMagicData";
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
export class PokedexRoom extends BasePanel {
    data = MerlinMagicData.Inst()
    temp_list: number[] = []
    protected viewNode = {
        List: <fgui.GList>null,
    };
    InitPanelData() {

    }

    InitPanel() {

    }
    OnClickTab() {

    }
    DoOpenWaitHandle() {

    }

    OpenPanel() {
        //在这做逻辑
        //this.viewNode.List.setVirtual()
        let data = this.data.GetPokedexScroll()
        this.viewNode.List.SetData(data)
    }

    ClosePanel() {

    }

    OnVisible() {

    }

    OnUnVisible() {

    }
}

export class PokedexRoomItem extends BaseItem {
    init_height = 312
    protected viewNode = {
        List: <fgui.GList>null,
        BoardList: <fgui.GList>null,
        Desc: <fgui.GRichTextField>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: ScrollQuaList) {
        this._data = data;
        UH.SetText(this.viewNode.Desc, data.color)
        //this.viewNode.List.setVirtual()
        this.viewNode.List.SetData(data.list)
        let temp_list2 = []
        let num2 = Math.ceil(data.list.length / 3)
        for (let index = 0; index < num2; index++) {
            temp_list2.push(1)
        }
        //this.viewNode.BoardList.setVirtual()
        this.viewNode.BoardList.SetData(temp_list2)
        this.height = this.initHeight + (num2 - 1) * 240
    }
    public GetData() {
        return this._data;
    }
}
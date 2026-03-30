import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from "modules/common_board/BoardData";
import { PetData, PetGemData } from "./PetData";
import { ItemCell } from "modules/extends/ItemCell";
import { BagData } from "modules/bag/BagData";

@BaseView.registView
export class PetGemStoreView extends BaseView {
    private _data: PetGemStoreData;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemStore",
        ViewName: "PetGemStoreView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        List:<fgui.GList>null,
        NoTip:<fgui.GTextField>null,
    }

    InitData(param: PetGemStoreData) {
        this._data = param;
        this.viewNode.List.setVirtual();
        this.viewNode.Board.SetData(new BoardData(PetGemStoreView, param.title));
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_ts_gem_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_ts_gem_list_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushList.bind(this), "OtherChange");

        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.OnSelect, this);
        this.FlushList();
    }

    public FlushList() {
        let list:PetGemData[] = this._data.func_show()
        list.sort(PetData.Inst().SortGem.bind(PetData.Inst()));
        this.viewNode.List.SetData(list);
        this.viewNode.NoTip.visible = list.length==0;
    }

    public OnSelect(item: ItemCell) {
        this._data.func_select_call&&this._data.func_select_call(item.GetData());
    }
}

export class PetGemStoreData {
    title: string;
    func_show: Function;
    func_select_call: Function;
    // func_selected: Function;

}

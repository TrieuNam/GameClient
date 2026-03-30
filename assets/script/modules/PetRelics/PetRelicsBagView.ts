import * as fgui from "fairygui-cc";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PetRelicsData } from "./PetRelicsData";
import { PetRelicsBagItem, PetRelicsView } from "./PetRelicsView";

@BaseView.RegisterView
export class PetRelicsBagView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "PetRelicsBag",
        ViewName: "PetRelicsBagView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "RelicsBagItem", ExtendsClass: PetRelicsBagItem },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        BagList: <fgui.GList>null,
        empty: <fgui.GGroup>null,
    }
    private param:any
    InitData(param:any) {
        this.viewNode.Board.SetData(new BoardData(PetRelicsBagView,Language.PetRelics.SelectViewTitle,29))

        this.viewNode.BagList.on(fgui.Event.CLICK_ITEM, this.OnClickBagItem, this);

        this.param = param
        this.flushInfoPanel()
    }
    flushInfoPanel() {
        let list = PetRelicsData.Inst().GetRelicsSelectList(this.param.type)
        this.viewNode.BagList.SetData(list)
    }

    OnClickBagItem(item:PetRelicsBagItem)
    {

    }

}
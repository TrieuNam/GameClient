import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";
import { GemAtelierCtrl } from "./GemAtelierCtrl";
import { GemAtelierData } from "./GemAtelierData";
import { GemLevelShowCell } from "./GemAtelierInsetView";
import { GemShowItem } from "./GemChangeTargetView";

@BaseView.registView 
export class GemAtelierOneKeyView extends BaseView {
    protected gem_list:any
    protected select:number[]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierOneKey",
        ViewName: "GemAtelierOneKeyView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "GemShowItem", ExtendsClass: GemShowItem },
        { ResName: "LevelShowCell", ExtendsClass: GemLevelShowCell },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        List: <fgui.GList>null,
        BtnUp: <fgui.GButton>null,
        Tip: <fgui.GTextField>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GemAtelierOneKeyView,Language.GemAtelier.GemOneKeyUp));
        this.viewNode.List.on(fgui.Event.CLICK_ITEM,this.OnClickGemList,this);
        this.viewNode.BtnUp.onClick(this.OnClickConfirm, this);
        UH.SetText(this.viewNode.Tip, Language.GemAtelier.GemUpTip);

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushGemList.bind(this), "GemItemChange");

        this.flushGemList()
    }

    private flushGemList()
    {
        this.gem_list = GemAtelierData.Inst().GetOnekeyList()
        
        this.viewNode.List.SetData(this.gem_list)
    }

    private OnClickGemList(item:GemShowItem) {
        let list = []
        let select_index = this.viewNode.List.getSelection()
        for(var index in select_index)
        {
            list.push(this.gem_list[select_index[index]].item_id) 
        }

        this.select = list
    }

    private OnClickConfirm() {
        LogError("?FD f",this.select)
        GemAtelierCtrl.Inst().SendCSGemOneKeyUpLevelReq(this.select)
    }
}
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { GemAtelierCtrl, GEM_ATELIER_REQ_TYPE } from "./GemAtelierCtrl";
import { GemAtelierData } from "./GemAtelierData";
import { GemShowPart } from "./GemAtelierGemUpView";
import { GemLevelShowCell } from "./GemAtelierInsetView";
import { GemShowItem, GemChangeTargetView } from "./GemChangeTargetView";


@BaseView.registView 
export class GemAtelierGemChangeView extends BaseView {
    private show_list:any
    private target:any
    private select:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierUpGrade",
        RelyOnPack: ["GemAtelierInset"],
        ViewName: "GemAtelierGemChangeView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "GemShowItem", ExtendsClass: GemShowItem },
        { ResName: "GemShowPart", ExtendsClass: GemShowPart },
        { ResName: "LevelShowCell", ExtendsClass: GemLevelShowCell },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        GemShowSelect: <GemShowPart>null,
        GemShowNext: <GemShowPart>null,
        GemList: <fgui.GList>null,
        BtnChange: <fgui.GButton>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GemAtelierGemChangeView,Language.GemAtelier.ChangeGem));
        this.viewNode.GemList.on(fgui.Event.CLICK_ITEM,this.OnClickGemList,this);
        this.viewNode.BtnChange.onClick(this.OnClickGemChange, this);
        this.viewNode.GemShowNext.onClick(this.OnClickChangeView, this);
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushGemList.bind(this), "GemItemChange");
        this.AddSmartDataCare(GemAtelierData.Inst().flush_info, this.FlushNext.bind(this), "flush_change");

        this.flushGemList()
    }

    private flushGemList() {
        this.viewNode.GemList.clearSelection()

        this.show_list = GemAtelierData.Inst().GetGemUpList()
        this.viewNode.GemList.SetData(this.show_list)

        this.FlushGemShow()
    }

    private OnClickGemList(item:GemShowItem) {
        this.target = item.data
        this.select = null

        this.FlushGemShow()
        this.FlushNext()
    }

    private FlushNext() {
        let select = GemAtelierData.Inst().GetChangeSelect()
        this.viewNode.GemShowNext.SetData(select)
        this.select = select
    }

    private OnClickChangeView() {
        if(this.target == null){
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.GemChangeEmpty)
            return 
        }

        ViewManager.Inst().OpenView(GemChangeTargetView,{item_id :this.target.item_id})
    }

    private FlushGemShow() {
        this.viewNode.GemShowSelect.SetData(this.target)
    }

    private OnClickGemChange() {
        if(this.select == null){
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.ChangeEmpty)
            return 
        }

        GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.TRANSFORM,{
            param1:this.target.item_id,
            param2:this.select.item_id,
        })
        this.target = null
        GemAtelierData.Inst().SetChangeSelect(null)
    }
}

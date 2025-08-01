import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { BoardData } from "modules/common_board/BoardData";
import { PetData } from "./PetData";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { Item } from "modules/bag/ItemData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";

@BaseView.registView
export class PetReturnView extends BaseView {
    private pet_index:number;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetReturn",
        ViewName: "PetReturnView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
        BtnConfirm: <fgui.GButton>null,
        NoTip:<fgui.GTextField>null,
    }

    InitData() {
        this.viewNode.Board.SetData(new BoardData(PetReturnView));
        this.pet_index = PetData.Inst().CurShowPetIndex;
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushTouch.bind(this), "is_pet_list_change");
        let item_list = PetData.Inst().GetPetReturn();
        this.viewNode.List.SetData(Item.DefaultCreateListItem (item_list));
        this.viewNode.NoTip.visible = item_list.length==0;
        this.viewNode.BtnConfirm.onClick(this.PetReturnView.bind(this));
    }

    private FlushTouch(){
        if (!PetData.Inst().GetPetInfo(this.pet_index)){
            this.Touchable = true;
            ViewManager.Inst().CloseView(PetReturnView);
        }
    }

    private PetReturnView(){
        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.DISCARD,this.pet_index);
        PublicPopupCtrl.Inst().Center(Language.Pet.return_tip);
        this.Touchable = false;
    }
    
    InitUI() {
    }
}


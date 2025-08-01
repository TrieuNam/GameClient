import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import * as fgui from "fairygui-cc";
import { PetCtrl, PET_OP_TYPE } from "modules/Pet/PetCtrl";
import { PetData } from "modules/Pet/PetData";
import { Language } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PetClothData } from "./PetClothData";

@BaseView.registView 
export class PetHuanHuaTips extends BaseView{
    protected viewRegcfg = {
        UIPackName: "PetHuanHuaTip",
        ViewName: "PetHuanHuaTips",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };
   
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnAffirm: <fgui.GButton>null,
     };
     protected onConstruct() {
         ViewManager.Inst().RegNodeIofo(this.viewNode, this);
     }
     InitUI() {
        
      
     }
     private curId = 0;
     private isRep = 0;
     private repIndex = 0;
     public InitData(data: any) {
        this.curId = data;
        this.viewNode.Board.SetData(new BoardData(PetHuanHuaTips));
        this.viewNode.Board.SetTitleShow(false);
        this.viewNode.BtnAffirm.onClick(this.OnClickAffirm.bind(this));
        this.FlushData();
     }
   

     public FlushData(){

        
     }
 
 
     CloseCallBack(): void {
       if(!this.isRep){
            let data = PetData.Inst().PetAllInfo.clothList.find(cfg => {
                return cfg.itemId == this.curId
            });
            if(data){
                data.petIndex = PetData.Inst().CurShowPetIndex;
            }
       }
     }
     //确定替换
     private OnClickAffirm() {
        this.isRep = 1;
        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.CLOTH_WEAR,PetData.Inst().CurShowPetIndex,this.curId);
        PublicPopupCtrl.Inst().Center(Language.PetHuanHua.repTips);
        ViewManager.Inst().CloseView(PetHuanHuaTips);
    }
     
}

import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from "modules/common_board/BoardData";
import { UH } from "../../helpers/UIHelper";
import { PetData } from "./PetData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { TextHelper } from "../../helpers/TextHelper";
import { PetAvatarCell, PetAvatarData } from "modules/extends/PetAvatarCell";

@BaseView.registView
export class PetAdvenceSelView extends BaseView {
    private param: any;
    private list_data: { pet_data: IPB_SCRolePetData, is_lock: boolean }[];
    private select_pet_index:number=-1;
    private list_select_index:number=-1;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetAdvenceSelect",
        ViewName: "PetAdvenceSelView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        List: <fgui.GList>null,
        BtnSelect: <fgui.GButton>null,
    }

    protected extendsCfg = [
        { ResName: "PetAdvenceSelectCell", ExtendsClass: PetAdvenceSelectCell },
    ];

    InitData(param: { pet_index: number, target_pet_id: number, target_order: number, select_callback: Function, selected_pet_index :number}) {
        this.param = param;
        this.select_pet_index = param.selected_pet_index;
        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.onChangePet, this);
        this.viewNode.BtnSelect.onClick(this.onSelect.bind(this));
        this.viewNode.Board.SetData(new BoardData(PetAdvenceSelView));
        this.viewNode.List.setVirtual();
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushData.bind(this), "is_pet_list_change");
        this.FlushData();
    }

    private FlushData() {
        let data = PetData.Inst().PetAllInfo;
        this.list_data = [];
        for (let i = 0; i < data.petList.length; i++) {
            let pet = data.petList[i];
            let is_lock = pet.petId != this.param.target_pet_id || pet.petOrder < this.param.target_order || pet.petIndex == this.param.pet_index || PetData.Inst().IsEmBattlePetIndex(pet.petIndex);
            this.list_data.push({ pet_data: data.petList[i], is_lock: is_lock });
        }
        this.viewNode.List.SetData(this.list_data);
        if(this.select_pet_index!=-1){
           for(let i=0;i<this.list_data.length;i++){
               if (this.list_data[i].pet_data.petIndex == this.select_pet_index){
                   this.viewNode.List.selectedIndex=i;
                   this.list_select_index=i;
                   break;
               }
           }
        }
    }

    InitUI() {
    }

    private onChangePet(item: PetAdvenceSelectCell){
        if (!item.GetData().is_lock){
            this.select_pet_index=item.GetData().pet_data.petIndex;
            this.list_select_index = this.viewNode.List.selectedIndex;
        }else{
            this.viewNode.List.selectedIndex = this.list_select_index;
        }
    }

    private onSelect(){
        if (this.select_pet_index==-1){
            PublicPopupCtrl.Inst().Center(Language.Pet.select_pet_tip);
        }else{
            this.param.select_callback(this.select_pet_index);
            ViewManager.Inst().CloseView(PetAdvenceSelView);
        }
    }
}

class PetAdvenceSelectCell extends fgui.GButton {
    private _data: { pet_data: IPB_SCRolePetData, is_lock: boolean };
    protected viewNode = {
        Head: <PetAvatarCell>null,
        TxtLevel: <fgui.GTextField>null,
        GpLock:<fgui.GGroup>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data:{pet_data: IPB_SCRolePetData,is_lock:boolean}) {
        this._data = data;
        this.viewNode.Head.SetData(new PetAvatarData(data.pet_data.petId,data.pet_data.petOrder,data.pet_data.petIndex));
        UH.SetText(this.viewNode.TxtLevel, TextHelper.Format(Language.Escort.Level, data.pet_data.petLevel));
        this.viewNode.GpLock.visible=data.is_lock;
    }

    public GetData() {
        return this._data;
    }
}

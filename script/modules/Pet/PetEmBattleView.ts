import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { PetAvatarCell, PetAvatarData } from "modules/extends/PetAvatarCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { PetData } from "./PetData";
import { PetInfoCell } from "./PetPanel";

@BaseView.registView
export class PetEmBattleView extends BaseView {
    private select_pet: IPB_SCRolePetData;
    private selShowIndex: number
    private selPetIndex: number

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetEmBattle",
        ViewName: "PetEmBattleView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        // PetHead: <PetAvatarCell>null,
        // RoleHead: <AvatarCell>null,
        ShowList: <fgui.GList>null,
        ListPet: <fgui.GList>null,
        BtnConfirm: <CommonButtonBuy>null,
    }

    protected extendsCfg = [
        { ResName: "ShowItem", ExtendsClass: PetEmBattleViewShowItem },
    ];


    InitData() {
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_embattle_change");
        this.viewNode.ListPet.setVirtual();
        this.viewNode.ListPet.on(fgui.Event.CLICK_ITEM, this.OnClickPetItem, this);
        this.viewNode.BtnConfirm.onClick(this.onBtnClick.bind(this));
        // this.viewNode.PetHead.onClick(this.onOutBattle.bind(this));
        this.viewNode.Board.SetData(new BoardData(PetEmBattleView));
        let data = PetData.Inst().PetAllInfo;
        let sel_index = PetData.Inst().GetEmBattleIndex();
        this.select_pet = data.petList[sel_index];
        if (this.select_pet) {
            this.viewNode.ListPet.selectedIndex = sel_index;
        }

        this.selPetIndex = 0
        this.FlushPetData();
        this.FlushList();
        // this.viewNode.RoleHead.SetData(new AvatarData(RoleData.Inst().GetRoleHeadPic(), RoleData.Inst().GetRoleLevel()))
    }

    private FlushPetData() {
        // if (this.select_pet) {
        //     this.viewNode.PetHead.visible = true;
        //     this.viewNode.PetHead.SetData(new PetAvatarData(this.select_pet.petId, this.select_pet.petOrder, this.select_pet.petLevel));
        // } else {
        //     this.viewNode.PetHead.visible = false;
        // }
    }

    private FlushList() {
        let data = PetData.Inst().PetAllInfo;
        this.viewNode.ListPet.SetData(data.petList);
        this.viewNode.ShowList.SetData([{ index: 0, level: PetData.Inst().CfgOtherPetPosition() }, { index: 1, level: PetData.Inst().CfgOtherPetPosition2() }], this.OnClickShowItem.bind(this), this.selShowIndex)
        this.viewNode.ListPet.scrollToView(this.selPetIndex)
        this.viewNode.ListPet.selectedIndex = this.selPetIndex
        let index = this.viewNode.ListPet.itemIndexToChildIndex(this.selPetIndex);
        let item = this.viewNode.ListPet.getChildAt(index)
        this.OnClickPetItem(<PetInfoCell>item)
    }

    InitUI() {
    }

    private onChangePet(item: PetInfoCell) {
        this.select_pet = item.GetData();
        this.FlushPetData();
    }

    private onBtnClick() {
        let item = <PetEmBattleViewShowItem>this.viewNode.ShowList.getChildAt(this.viewNode.ShowList.selectedIndex)
        let data = item.GetData();
        let index = this.viewNode.ListPet.itemIndexToChildIndex(this.viewNode.ListPet.selectedIndex);
        let item2 = <PetInfoCell>this.viewNode.ListPet.getChildAt(index)
        let data2 = item2.GetData();
        let pet_info = PetData.Inst().GetPetInfo(PetData.Inst().PetAllInfo.fightPetIndex[data.index]);
        let is_lock = RoleData.Inst().GetRoleLevel() < data.level
        if (is_lock) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Pet.pet_outbattle_desc, data.level))
            return
        }

        let pet_index = PetData.Inst().PetAllInfo.fightPetIndex.indexOf(data2.petIndex)
        if (-1 != pet_index && pet_index != data.index) {
            PublicPopupCtrl.Inst().Center(Language.Pet.pet_changepos_succ)
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SET_FIGHT, -1, pet_index);
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SET_FIGHT, data2.petIndex, data.index);
            if (pet_info) {
                PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SET_FIGHT, pet_info.petIndex, pet_index);
            }
            return
        }
        if (pet_info) {
            if (pet_info.petIndex == data2.petIndex) {
                PublicPopupCtrl.Inst().Center(Language.Pet.pet_outbattle_succ)
            } else {
                PublicPopupCtrl.Inst().Center(Language.Pet.pet_changebattle_succ)
            }
        } else {
            PublicPopupCtrl.Inst().Center(Language.Pet.pet_embattle_succ)
        }
        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SET_FIGHT, pet_info && pet_info.petIndex == data2.petIndex ? -1 : data2.petIndex, data.index);
        // if (this.select_pet) {
        //     PublicPopupCtrl.Inst().Center(Language.Pet.pet_embattle_succ);
        //     PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SET_FIGHT, this.select_pet.petIndex);
        // } else {
        //     if (PetData.Inst().IsPetEmbattle()) {
        //         PublicPopupCtrl.Inst().Center(Language.Pet.pet_outbattle_succ);
        //         PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SET_FIGHT, -1);
        //     }
        // }
    }

    private OnClickShowItem(item: PetEmBattleViewShowItem) {
        this.selShowIndex = this.viewNode.ShowList.selectedIndex
        this.UpdateBtnTitle();
    }
    private curSelPetIndex = 0;
    private OnClickPetItem(item: PetInfoCell) {
        this.selPetIndex = this.viewNode.ListPet.selectedIndex
        
        this.curSelPetIndex = item.GetData().petIndex;
        this.UpdateBtnTitle();
        // if(PetData.Inst().IsEmBattlePetIndex(item.GetData().petIndex)){
        //     this.viewNode.BtnConfirm.SetTitle(Language.Pet.downTip);
        // }else{
        //     this.viewNode.BtnConfirm.SetTitle(Language.Pet.upTip3);
        // }
        
    }

    private UpdateBtnTitle(){
        if(PetData.Inst().PetAllInfo.fightPetIndex[this.selShowIndex] == 0){
            this.viewNode.BtnConfirm.SetTitle(Language.Pet.upTip3);
        }else{
            if(PetData.Inst().PetAllInfo.fightPetIndex[this.selShowIndex] == this.curSelPetIndex){
                this.viewNode.BtnConfirm.SetTitle(Language.Pet.downTip);
            }else{
                this.viewNode.BtnConfirm.SetTitle(Language.Inscription.BtnExchange);
            } 
        } 
    }
    /**宠物下阵 */
    // private onOutBattle() {
    //     if (this.select_pet) {
    //         this.select_pet = null;
    //         this.viewNode.PetHead.visible = false;
    //         this.viewNode.ListPet.selectedIndex = -1;
    //     }
    // }
}

export class PetEmBattleViewShowItem extends BaseItemGB {
    protected viewNode = {
        DescShow: <fgui.GTextField>null,
        PetHead: <PetAvatarCell>null,
        GpLock: <fgui.GGroup>null,
    };

    protected onConstruct() {
        super.onConstruct();
    }

    public SetData(data: any) {
        super.SetData(data);
        let is_lock = RoleData.Inst().GetRoleLevel() < data.level
        let pet_info = PetData.Inst().GetPetInfo(PetData.Inst().PetAllInfo.fightPetIndex[data.index]);
        this.viewNode.PetHead.visible = !is_lock && undefined != pet_info
        this.viewNode.GpLock.visible = is_lock
        if (is_lock) {
            UH.SetText(this.viewNode.DescShow, TextHelper.Format(Language.Pet.pet_outbattle_desc, data.level))
        } else if (pet_info) {
            this.viewNode.PetHead.SetData(new PetAvatarData(pet_info.petId, pet_info.petOrder,pet_info.petIndex, pet_info.petLevel));
        }
    }
}
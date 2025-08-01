import { BasePanel } from "modules/common/BasePanel";
import * as fgui from "fairygui-cc";
import { PetData } from "./PetData";
import { UH } from "../../helpers/UIHelper";
import { AttrHelper } from "../../helpers/AttrHelper";
import { CfgPetData } from "config/CfgPet";
import { Item } from "modules/bag/ItemData";
import { CfgItem } from "config/CfgCommon";
import { BagData } from "modules/bag/BagData";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { TextHelper } from "../../helpers/TextHelper";
import { PetModelShowItem } from "./PetPanel";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { HuanHuaAttCell } from "modules/Angel/HuanHuaComp";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { PetClothData } from "modules/PetCloth/PetClothData";


export class PetLevelUpPanel extends BasePanel {
    private select_index = 0;
    private pet_list: IPB_SCRolePetData[] = [];
    private pet_index: number = 0;
    private pet_level: number;

    protected viewNode = {
        ImgMax: <fgui.GImage>null,
        TxtName: <fgui.GTextField>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,
        ListAttr: <fgui.GList>null,
        TxtLevel: <fgui.GTextField>null,
        GpUp: <fgui.GGroup>null,
        BtnUpOne: <fgui.GButton>null,
        BtnUpTen: <fgui.GButton>null,
        PetModel: <PetModelShowItem>null,
        EffectShow: <UIEffectShow>null,
        EffectShow2: <UIEffectShow>null,
        CostOne: <fgui.GTextField>null,
        CostTen: <fgui.GTextField>null,
    }
    protected extendsCfg = [
        { ResName: "PetLevelUpAttrCell", ExtendsClass: HuanHuaAttCell },
    ];

    InitPanelData() {
    }

    InitPanel() {
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetInfo.bind(this), "is_pet_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetList.bind(this), "is_pet_list_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetInfo.bind(this), "flush_cloth_wear");
        this.viewNode.BtnLeft.onClick(this.onChangePet.bind(this, "BtnLeft"));
        this.viewNode.BtnRight.onClick(this.onChangePet.bind(this, "BtnRight"));
        this.viewNode.BtnUpOne.onClick(this.onClickUp.bind(this, "BtnUpOne"));
        this.viewNode.BtnUpTen.onClick(this.onClickUp.bind(this, "BtnUpTen"));
        this.FlushPetList();
    }

    /**更新宠物列表 */
    private FlushPetList() {
        let pet_list = PetData.Inst().PetAllInfo.petList;
        if (pet_list.length <= 0)
            return
        let index = 0;
        if (this.pet_index) {
            for (let i = 0; i < pet_list.length; i++) {
                if (pet_list[i].petIndex == this.pet_index) {
                    index = i;
                    break;
                }
            }
        }
        let pet_index = pet_list[index].petIndex;
        if (pet_index != this.pet_index) {
            this.pet_index = pet_list[index].petIndex;
            this.pet_level = pet_list[index].petLevel;
        }
        this.pet_list = pet_list;
        this.select_index = index;
        this.FlushPetData();
    }

    /**单个宠物信息改变 */
    private FlushPetInfo() {
        let pet_data = PetData.Inst().GetPetInfo(this.pet_index);
        if (pet_data) {
            if (!this.pet_level)
                this.pet_level = pet_data.petLevel;
            if (pet_data.petLevel != this.pet_level) {
                this.pet_level = pet_data.petLevel;
                this.viewNode.EffectShow.PlayEff(4164014);
                this.viewNode.EffectShow2.PlayEff(4164024);
                AudioManager.Inst().Play(AudioTag.ShengJi);
            }
        }
        this.FlushPetData();
    }

    OnVisible() {
        this.viewNode.EffectShow.StopEff(4164014);
        this.viewNode.EffectShow2.StopEff(4164024);
    }

    /**选中的宠物信息 */
    private FlushPetData() {
        this.viewNode.BtnLeft.visible = this.select_index != 0;
        this.viewNode.BtnRight.visible = this.select_index != this.pet_list.length - 1;
        let pet_data = PetData.Inst().GetPetInfo(this.pet_index);
        if (pet_data) {
            UH.SetText(this.viewNode.TxtLevel, pet_data.petLevel);
            let cfg_pet = PetData.Inst().GetPetCfg(pet_data.petId);
            
            let nextAtt = PetData.Inst().GetPetAttr(pet_data.petLevel + 1, pet_data.petId);
            let curtAtt = PetData.Inst().GetPetAttr(pet_data.petLevel, pet_data.petId);
            this.viewNode.ListAttr.SetData(AttrHelper.AttrChangeData(curtAtt, nextAtt));
            let petName = cfg_pet.pet_name + "";
            let resId = cfg_pet.pet_res;
            // for(let key in PetClothData.Inst().ClothWearList){
            //     if(PetClothData.Inst().ClothWearList[key] == this.pet_index){
            //         if(PetClothData.Inst().GetPetSkillDataById(+key)){
            //             let curData = PetClothData.Inst().GetPetSkillDataById(+key);
            //             resId = curData.res_id;
            //             petName = curData.name;
            //         }
                       
            //     }
            // }
            // for(let [key,value] of PetClothData.Inst().ClothWearList2.entries()){
            //     if(value.petIndex == this.pet_index){
            //         let curData = PetClothData.Inst().GetPetSkillDataById(key);
            //         if(curData){
            //             resId = curData.res_id;
            //             petName = curData.name;
            //         }
            //     }
            // }
            let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg =>{return cfg.petIndex == this.pet_index});
            if(cloth){
                let curData = PetClothData.Inst().GetPetSkillDataById(cloth.itemId);
                if(curData){
                    resId = curData.res_id;
                    petName = curData.name;
                }
            }
            if (nextAtt) {
                this.viewNode.GpUp.visible = true;
                this.viewNode.ImgMax.visible = false;
                UH.SetText(this.viewNode.CostOne, PetData.Inst().GetPetUpGold(cfg_pet.pet_type, pet_data.petLevel, 1));
                UH.SetText(this.viewNode.CostTen, PetData.Inst().GetPetUpGold(cfg_pet.pet_type, pet_data.petLevel, 10));
            } else {
                this.viewNode.GpUp.visible = false;
                this.viewNode.ImgMax.visible = true;
            }
            UH.SetText(this.viewNode.TxtName, petName);
            this.viewNode.PetModel.SetData(resId);
        }
    }

    /**切换宠物 */
    private onChangePet(name: string) {
        this.select_index = this.select_index + (name == "BtnLeft" ? -1 : 1);
        this.pet_index = this.pet_list[this.select_index].petIndex;
        this.pet_level = this.pet_list[this.select_index].petLevel;
        this.FlushPetData();
    }

    /**升级 */
    public onClickUp(name: string) {
        let pet_data = PetData.Inst().GetPetInfo(this.pet_index);
        if (pet_data) {
            let up_num = name == "BtnUpOne" ? 1 : 10;
            let cfg_pet = PetData.Inst().GetPetCfg(pet_data.petId);
            let need_num = PetData.Inst().GetPetUpGold(cfg_pet.pet_type, pet_data.petLevel, up_num);
            let num = Item.GetNum(CommonId.Gold);
            if(num<need_num){
                PublicPopupCtrl.Inst().ItemNotEnoughNotice(CommonId.Gold);
                return;
            }
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.LEVEL_UP, this.pet_index, up_num);
        }
    }



    // /**更新物品数量 */
    // public FulshExpItem() {
    //     let list = [];
    //     for (let i = 0; i < 3; i++) {
    //         let num = Item.GetNum(this.item_ids[i]);
    //         let desc_num = TextHelper.ColorStr(num, num > 0 ? COLORSTR.White : COLORSTR.Red1);
    //         list.push({ item_data: Item.Create(new CfgItem(this.item_ids[i]), { is_click: false }), show_num: desc_num });
    //     }
    //     this.viewNode.ListExp.SetData(list);
    // }
}
import { HorizontalTextAlignment } from "cc";
import { CfgItem } from "config/CfgCommon";
import { CfgPetAdvance } from "config/CfgPet";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { HuanHuaAttCell } from "modules/Angel/HuanHuaComp";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BasePanel } from "modules/common/BasePanel";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { HelpView } from "modules/common_help/CommonHelpView";
import { CommonTipData, CommonTipView } from "modules/common_help/CommonTipView";
import { PetAvatarCell, PetAvatarData } from "modules/extends/PetAvatarCell";
import { PetClothData } from "modules/PetCloth/PetClothData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { PetAdvenceSelView } from "./PetAdvenceSelView";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { PetData } from "./PetData";
import { ItemCellNum, PetModelShowItem } from "./PetPanel";


export class PetAdvencePanel extends BasePanel {
    private pet_index: number = 0;
    private select_index: number = 0;
    private pet_list: IPB_SCRolePetData[] = [];
    private cost_pet_index = -1;//材料本体宠物的index
    private cfg_advence: CfgPetAdvance;//消耗材料id
    private has_cost = false;
    private pet_order: number;

    protected viewNode = {
        ImgMax: <fgui.GImage>null,
        TxtName: <fgui.GTextField>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,
        ListAttr: <fgui.GList>null,
        ListPet: <fgui.GList>null,
        TxtCurGrade: <fgui.GTextField>null,
        TxtNextGrade: <fgui.GTextField>null,
        GpCurGrade: <fgui.GGroup>null,
        GpNextGrade: <fgui.GGroup>null,
        GpUp: <fgui.GGroup>null,
        CellCost: <ItemCellNum>null,
        TxtCost: <fgui.GTextField>null,
        BtnAdvence: <fgui.GButton>null,
        GpAddCostPet: <fgui.GGroup>null,
        CostPetHead: <PetAvatarCell>null,
        BtnAdd: <fgui.GButton>null,
        PetModel: <PetModelShowItem>null,
        BtnDesc: <fgui.GButton>null,
        EffectShowPet: <UIEffectShow>null,
        EffectShowAttr: <UIEffectShow>null,
        TxtCostPetGrade: <fgui.GTextField>null,
    }
    protected extendsCfg = [
        { ResName: "PetAdvenceAttCell", ExtendsClass: HuanHuaAttCell },
        { ResName: "PetHeadSelect", ExtendsClass: PetHeadSelect },
    ];

    InitPanelData() {
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FulshListData.bind(this), "is_pet_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FulshListData.bind(this), "is_pet_list_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCostItemNum.bind(this), "OtherChange");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FulshListData.bind(this), "flush_cloth_wear");
        this.viewNode.BtnLeft.onClick(this.onLeftRightClick.bind(this, "BtnLeft"));
        this.viewNode.BtnRight.onClick(this.onLeftRightClick.bind(this, "BtnRight"));
        
        this.viewNode.ListPet.on(fgui.Event.CLICK_ITEM, this.onChangePet, this);
        this.viewNode.BtnAdvence.onClick(this.onAdvance.bind(this));
        this.viewNode.BtnAdd.onClick(this.SelectCostPet.bind(this));
        this.viewNode.BtnDesc.onClick(this.JueXingDesc.bind(this));
        // this.viewNode.ListPet.on(fgui.Event.SCROLL, this.checkBtnShow.bind(this),this);
        this.FulshListData();
    }

    /**宠物列表数据 */
    private FulshListData() {
        this.pet_list = PetData.Inst().PetAllInfo.petList;
        if (!this.pet_list.length)
            return;
        let index = 0;
        if (this.pet_index) {
            for (let i = 0; i < this.pet_list.length; i++) {
                if (this.pet_list[i].petIndex == this.pet_index) {
                    index = i;
                    break;
                }
            }
        }
        if (index == 0) {
            if (this.pet_index != this.pet_list[0].petIndex){
                this.pet_index = this.pet_list[0].petIndex;
                this.pet_order = this.pet_list[this.select_index].petOrder;
            }
        }
        this.select_index = index;
        this.viewNode.ListPet.SetData(this.pet_list);
        this.viewNode.ListPet.selectedIndex = this.select_index;
        this.FlushPetData();
    }

    /**更新选中的宠物数据 */
    private FlushPetData() {
        this.parentView.Touchable = true;
        let pet = PetData.Inst().GetPetInfo(this.pet_index);
        if (pet) {
            let cfg = PetData.Inst().GetPetCfg(pet.petId);
            
            let pet_advence_cfg = PetData.Inst().GetPetAdvenceCfg(pet.petId, pet.petOrder);
            let pet_next_advence_cfg = PetData.Inst().GetPetAdvenceCfg(pet.petId, pet.petOrder + 1);
            let next_attr = pet_next_advence_cfg ? pet_next_advence_cfg.up_att : undefined;
            UH.SetText(this.viewNode.TxtCurGrade, TextHelper.Format(Language.Pet.advence_order, TextHelper.NumToWrord(pet.petOrder)));
            this.viewNode.ListAttr.SetData(AttrHelper.AttrChangeData(pet_advence_cfg.up_att, next_attr))
            let petName = cfg.pet_name + "";
            let resId = cfg.pet_res;
            this.viewNode.BtnAdd.visible = pet_advence_cfg.need_myself_num > 0
            this.viewNode.TxtCostPetGrade.visible = pet_advence_cfg.need_myself_num > 0
            this.viewNode.TxtCost.x =  pet_advence_cfg.need_myself_num > 0 ? 305 : 215
            this.viewNode.CellCost.x =  pet_advence_cfg.need_myself_num > 0 ? 255 : 165
            // for(let key in PetClothData.Inst().ClothWearList){
            //     if(PetClothData.Inst().ClothWearList[key] == this.pet_index){
            //         if(PetClothData.Inst().GetPetSkillDataById(+key)){
            //             let curData = PetClothData.Inst().GetPetSkillDataById(+key);
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
            UH.SetText(this.viewNode.TxtName, petName);
            if (next_attr) {
                this.viewNode.GpNextGrade.visible = true;
                this.viewNode.GpCurGrade.x = 89;
                this.viewNode.ImgMax.visible = false;
                this.viewNode.GpUp.visible = true;
                let cost_item_id = pet_advence_cfg.up_order_item_id;
                this.cfg_advence = pet_advence_cfg;
                UH.SetText(this.viewNode.TxtCost, Item.GetName(cost_item_id), Item.QuaColor(cost_item_id));
                this.viewNode.TxtCost.strokeColor = Item.QuaColorOL(cost_item_id);
                UH.SetText(this.viewNode.TxtNextGrade, TextHelper.Format(Language.Pet.advence_order, TextHelper.NumToWrord(pet.petOrder + 1)));
                UH.SetText(this.viewNode.TxtCostPetGrade, TextHelper.Format(Language.Pet.CostPetGrade, TextHelper.NumToWrord(pet.petOrder)))
            } else {
                this.cfg_advence = null;
                this.viewNode.GpNextGrade.visible = false;
                this.viewNode.GpCurGrade.x = 263;
                this.viewNode.ImgMax.visible = true;
                this.viewNode.GpUp.visible = false;
            }
            this.FlushCostPetHead();
            this.FlushCostItemNum();
            this.viewNode.PetModel.SetData(resId);
            if (!this.pet_order)
                this.pet_order = pet.petOrder;
            if (pet.petIndex == this.pet_index && pet.petOrder > this.pet_order) {
                this.pet_order = pet.petOrder;
                this.viewNode.EffectShowPet.PlayEff(4164024);
                this.viewNode.EffectShowAttr.PlayEff(4164014);
                AudioManager.Inst().Play(AudioTag.JiHuo);
            }
        }
    }

    OnVisible() {
        this.viewNode.EffectShowPet.StopEff(4164024);
        this.viewNode.EffectShowAttr.StopEff(4164014);
    }

    /**更新选中的宠物本体头像 */
    private FlushCostPetHead() {
        if (this.cost_pet_index != -1) {
            let pet = PetData.Inst().GetPetInfo(this.cost_pet_index);
            if (!pet) {
                this.cost_pet_index = -1;
                this.viewNode.CostPetHead.visible = false;
            } else {
                this.viewNode.CostPetHead.visible = true;
                let pet_data = PetData.Inst().GetPetInfo(this.cost_pet_index);
                this.viewNode.CostPetHead.SetData(new PetAvatarData(pet_data.petId, pet_data.petOrder,pet_data.petIndex, pet_data.petLevel));
            }
        } else {
            this.viewNode.CostPetHead.visible = false
        }
    }

    /**切换宠物 */
    private onChangePet(item: PetHeadSelect) {
        if (this.select_index != this.viewNode.ListPet.selectedIndex) {
            this.cost_pet_index = -1;
            this.select_index = this.viewNode.ListPet.selectedIndex;
            this.pet_index = this.pet_list[this.select_index].petIndex;
            this.pet_order = this.pet_list[this.select_index].petOrder;
            this.FlushPetData();
        }
    }

    /**打开宠物觉醒材料选择界面 */
    private SelectCostPet() {
        let pet = PetData.Inst().GetPetInfo(this.pet_index);
        let select_callback = (index: number) => {
            this.cost_pet_index = index;
            this.FlushCostPetHead();
        }
        if (pet) {
            let param = {
                pet_index: pet.petIndex,
                target_pet_id: pet.petId,
                target_order: pet.petOrder,
                select_callback: select_callback,
                selected_pet_index: this.cost_pet_index
            };
            ViewManager.Inst().OpenView(PetAdvenceSelView, param);
        }
    }

    /**觉醒 */
    private onAdvance() {
        let pet = PetData.Inst().GetPetInfo(this.pet_index);
        if(pet == null){
            return;
        }
        let pet_advence_cfg = PetData.Inst().GetPetAdvenceCfg(pet.petId, pet.petOrder);
        if(pet_advence_cfg.need_myself_num == 0 && this.has_cost){
            let fun = () => {
                PetCtrl.Inst().SendPetReq(PET_OP_TYPE.GRADE_UP, pet.petIndex, null, null, null);
                this.parentView.Touchable = false;
            }
            let name = this.viewNode.TxtName.text;
            let d = TextHelper.Format(Language.Pet.AdvenceTip2, pet.petOrder + name)
            fun()
            // ViewManager.Inst().OpenView(CommonTipView, new CommonTipData(Language.Pet.PetAdvence, d, fun, HorizontalTextAlignment.LEFT));
        }
        else if (this.cost_pet_index != -1 && this.has_cost) {
            if (pet) {
                let cost_pet_data = PetData.Inst().GetPetInfo(this.cost_pet_index);
                let fun = () => {
                    PetCtrl.Inst().SendPetReq(PET_OP_TYPE.GRADE_UP, pet.petIndex, null, null, [this.cost_pet_index]);
                    this.parentView.Touchable = false;
                }
                // if (cost_pet_data.petOrder > 1) {
                let name = this.viewNode.TxtName.text;
                let d = TextHelper.Format(Language.Pet.AdvenceTip, cost_pet_data.petOrder + name, pet.petOrder + name)
                ViewManager.Inst().OpenView(CommonTipView, new CommonTipData(Language.Pet.PetAdvence, d, fun, HorizontalTextAlignment.LEFT));
                // } else {
                //     fun();
                // }
            }
        } else {
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.LackItemError);
        }
    }

    public JueXingDesc() {
        let pet = PetData.Inst().GetPetInfo(this.pet_index);
        if (pet) {
            let cfg = PetData.Inst().GetPetCfg(pet.petId);
            let desc = cfg.desc;
            ViewManager.Inst().OpenView(HelpView, desc)
        }
    }

    /**滑动列表 */
    private onLeftRightClick(name: string) {
        let scrollPane: fgui.ScrollPane = this.viewNode.ListPet.scrollPane;
        let posX = scrollPane.posX;
        let item_w = 145;
        let gap = 19;
        let num = Math.floor((posX - gap) / (item_w + gap));
        if (posX - (num * (item_w + gap) - gap) > gap) {
            name == "BtnLeft" ? num -= 1 : num += 1;
        }
        name == "BtnLeft" ? num -= 3 : num += 3;
        if (num < 0)
            num = 0;
        if (num > this.pet_list.length - 3)
            num = this.pet_list.length - 3;
        posX = num * (item_w + gap);//- gap;
        scrollPane.posX = posX;
        // this.checkBtnShow();
    }

    // private checkBtnShow(){
    //     if (this.pet_list.length <= 3){
    //         this.viewNode.BtnRight.visible = this.viewNode.BtnLeft.visible=false;
    //         return;
    //     }
    //     let scrollPane: fgui.ScrollPane = this.viewNode.ListPet.scrollPane;
    //     let posX = scrollPane.posX;
    //     let cont_w=scrollPane.contentWidth;
    //     this.viewNode.BtnLeft.visible = posX != 0; 
    //     this.viewNode.BtnRight.visible = posX != cont_w-this.viewNode.ListPet.width;
    // }

    private FlushCostItemNum() {
        if (this.cfg_advence) {
            let cost_item_id = this.cfg_advence.up_order_item_id;
            let cost_item_num = this.cfg_advence.item_id_num;
            let has_num = Item.GetNum(cost_item_id);
            let num_desc = TextHelper.ColorStr(has_num, has_num >= cost_item_num ? COLORSTR.White : COLORSTR.Red1) + "/" + cost_item_num;
            this.viewNode.CellCost.SetData({ item_data: Item.Create(new CfgItem(cost_item_id)), show_num: num_desc });
            this.has_cost = has_num >= cost_item_num;
        }
    }

    InitPanel() {
    }
}

class PetHeadSelect extends fgui.GButton {
    protected viewNode = {
        HeadItem: <PetAvatarCell>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: PB_SCRolePetData) {
        this.viewNode.HeadItem.SetData(new PetAvatarData(data.petId, data.petOrder,data.petIndex,data.petLevel));
    }
}
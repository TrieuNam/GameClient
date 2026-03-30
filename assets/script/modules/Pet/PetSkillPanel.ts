import { BasePanel } from "modules/common/BasePanel";
import * as fgui from "fairygui-cc";
import { ItemCell } from "modules/extends/ItemCell";
import { ViewManager } from "manager/ViewManager";
import { PetData, PetSkillCellState } from "./PetData";
import { CfgPetData, CfgPetSkill } from "config/CfgPet";
import { UH } from "../../helpers/UIHelper";
import { BaseItem } from "modules/common/BaseItem";
import { CfgItem } from "config/CfgCommon";
import { Item } from "modules/bag/ItemData";
import { PetSkillSelView } from "./PetSkillSelView";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { PetModelShowItem } from "./PetPanel";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { SkillCell } from "modules/extends/SkillCell";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { PetSkillMapView } from "./PetSkillMapView";
import { PetClothData } from "modules/PetCloth/PetClothData";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";

export class PetSkillPanel extends BasePanel {
    private pet_list: IPB_SCRolePetData[] = [];
    private select_index: number = 0;
    private pet_index: number;
    private select_skill: CfgPetSkill;
    private skill_index: number = null;
    protected viewNode = {
        TxtName: <fgui.GTextField>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,
        AddBlock: <fgui.GGraph>null,
        RTTip: <fgui.GTextField>null,
        SkillCell: <ItemCell>null,
        List: <fgui.GList>null,
        BtnStudy: <fgui.GButton>null,
        BtnAdd: <fgui.GButton>null,
        PetModel: <PetModelShowItem>null,
        BtnSkillMap: <fgui.GButton>null,
        TxtLevel: <fgui.GRichTextField>null,
    }
    protected extendsCfg = [
        { ResName: "PetSkillCell", ExtendsClass: PetSkillCell },
        { ResName: "ButtonPetSkillCell", ExtendsClass: ButtonPetSkillCell },
    ];

    InitPanelData() {
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetListData.bind(this), "is_pet_list_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetData.bind(this), "is_pet_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetListData.bind(this), "flush_cloth_wear");
    }

    InitPanel() {
        this.viewNode.List.setVirtual();
        this.viewNode.BtnLeft.onClick(this.onChangePet.bind(this, "BtnLeft"))
        this.viewNode.BtnRight.onClick(this.onChangePet.bind(this, "BtnRight"))
        this.viewNode.BtnAdd.onClick(this.openSkillSelect.bind(this));
        this.viewNode.BtnStudy.onClick(this.Study.bind(this));
        this.viewNode.BtnSkillMap.onClick(this.OnMapClick.bind(this));
        this.FlushPetListData();
    }

    private FlushPetListData() {
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
            this.pet_index = this.pet_list[index].petIndex;
        }
        this.select_index = index;
        this.FlushPetData();
        this.checkBtnShow();
    }

    private FlushPetData() {
        let pet = PetData.Inst().GetPetInfo(this.pet_index);
        if (pet) {
            let skill_data = PetData.Inst().SetPetSkillData(pet);
            this.viewNode.List.SetData(skill_data.skill_list);
            this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);

            UH.SetText(this.viewNode.TxtLevel, pet.petLevel);
            let cfg = PetData.Inst().GetPetCfg(pet.petId);
            let petName = cfg.pet_name + "";
            let resId = cfg.pet_res;
            let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.petIndex == this.pet_index });
            if (cloth) {
                let curData = PetClothData.Inst().GetPetSkillDataById(cloth.itemId);
                if (curData) {
                    resId = curData.res_id;
                    petName = curData.name;
                }
            }
            UH.SetText(this.viewNode.TxtName, petName);
            let cost_num = 0;
            if (skill_data.lock_num > 0) {
                cost_num += CfgPetData.other[0].lock_1;
            }
            if (skill_data.lock_num > 1) {
                cost_num += CfgPetData.other[0].lock_2;
            }
            UH.SetText(this.viewNode.RTTip, TextHelper.Format(Language.Pet.cost_tip, TextHelper.ColorStr(skill_data.lock_num, COLORSTR.Yellow2),
                TextHelper.ColorStr(cost_num + Item.GetName(CfgPetData.other[0].use_item_id), COLORSTR.Yellow2)));
            if (this.select_skill) {
                this.viewNode.SkillCell.visible = true;
                this.viewNode.SkillCell.SetData(Item.Create(new CfgItem(this.select_skill.skill_item_id)));
            } else {
                this.viewNode.SkillCell.visible = false;
            }
            this.viewNode.PetModel.SetData(resId);
        }
    }

    OnClickListItem(item: ButtonPetSkillCell) {
        if (this.skill_index != item._data.index) {
            this.skill_index = item._data.index;
        }
    }

    private onChangePet(name: string) {
        this.select_index = this.select_index + (name == "BtnLeft" ? -1 : 1);
        this.pet_index = this.pet_list[this.select_index].petIndex;
        this.FlushPetData();
        this.checkBtnShow();
        this.viewNode.List.scrollToView(0);
    }

    private checkBtnShow() {
        this.viewNode.BtnLeft.visible = this.select_index != 0;
        this.viewNode.BtnRight.visible = this.select_index != this.pet_list.length - 1;
    }

    private openSkillSelect() {
        let call_Fun = (cfg: CfgPetSkill) => {
            this.select_skill = cfg;
            this.viewNode.SkillCell.visible = true;
            this.viewNode.SkillCell.SetData(Item.Create(new CfgItem(cfg.skill_item_id)));
        }
        ViewManager.Inst().OpenView(PetSkillSelView, { pet: this.pet_list[this.select_index], call_back: call_Fun });
    }

    private Study() {
        if (this.select_skill) {
            let pet = PetData.Inst().GetPetInfo(this.pet_index);
            if (pet) {
                if (!PetData.Inst().IsSkillCellUnlock(pet)) {
                    PublicPopupCtrl.Inst().Center(Language.Pet.SkillUnlockTip);
                    return
                }
                if (this.skill_index == null) return
                let skill_data = PetData.Inst().SetPetSkillData(pet);
                let cost_num = 0;
                if (skill_data.lock_num > 0) {
                    cost_num += CfgPetData.other[0].lock_1;
                }
                if (skill_data.lock_num > 1) {
                    cost_num += CfgPetData.other[0].lock_2;
                }
                let num = Item.GetNum(CfgPetData.other[0].use_item_id)
                if (cost_num >= num) {
                    PublicPopupCtrl.Inst().ItemNotEnoughNotice(CfgPetData.other[0].use_item_id);
                    return;
                }
                let skill = PetData.Inst().getPetSkillConfig(pet.skillList[this.skill_index]);
                let change_fun = () => {
                    PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SKILL_LEARN, pet.petIndex, this.skill_index, this.select_skill.skill_item_id);
                    this.select_skill = null;
                    this.viewNode.SkillCell.visible = false;
                }
                if (skill && this.select_skill.skill_color < skill.skill_color) {
                    PublicPopupCtrl.Inst().DialogTips(Language.Pet.PetSkillCover, null, change_fun)
                    return;
                } else {
                    change_fun()
                }

            }

        } else {
            PublicPopupCtrl.Inst().Center(Language.Pet.select_skill_tip)
        }
    }

    private OnMapClick() {
        ViewManager.Inst().OpenView(PetSkillMapView);
    }
}

export class ButtonPetSkillCell extends fgui.GButton {
    protected viewNode = {
        PetSkillCell: <PetSkillCell>null,
    };
    public _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this._data = data;
        this.viewNode.PetSkillCell.SetData(data);
    }
}

class PetSkillCell extends BaseItem {
    protected viewNode = {
        SkillCell: <SkillCell>null,
        TxtName: <fgui.GTextField>null,
        IconLock: <fgui.GLoader>null,
        EffectShow: <UIEffectShow>null,
        UnlockBtn: <fgui.GButton>null,
        CellBG: <fgui.GImage>null,
    };

    private stateCtrl: fgui.Controller;

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.viewNode.IconLock.onClick(this.onClickLock, this);
        this.viewNode.UnlockBtn.onClick(this.onClickUnlock, this);
        this.stateCtrl = this.getController("CellStateCtrl");
    }
    public SetData(data: { cfg: CfgPetSkill, is_lock: number, is_effect: boolean, state: PetSkillCellState, index: number }) {
        this._data = data;
        this.stateCtrl.setSelectedIndex(<number>data.state);
        if (data.cfg) {
            let item_id = data.cfg.skill_item_id;
            let cell_data = this.viewNode.SkillCell.GetData();
            if (cell_data != data.cfg.skill_id)
                this.viewNode.SkillCell.SetData(data.cfg.skill_id);
            UH.SetText(this.viewNode.TxtName, Item.GetName(item_id), Item.QuaColor(item_id));
            this.viewNode.TxtName.strokeColor = Item.QuaColorOL(item_id);
            this.viewNode.TxtName.stroke = 2;
            // this.viewNode.IconLock.visible = data.is_lock == 1 || PetData.Inst().IsCanLock();
            UH.SpriteName(this.viewNode.IconLock, "Pet", data.is_lock ? "ChongWu0007SuoLe1" : "ChongWu0006SuoKai1");
        } else {
            this.viewNode.SkillCell.SetData(null);
            this.viewNode.TxtName.stroke = 0;
            this.viewNode.TxtName.color = COLORS.Yellow2;
            UH.SetText(this.viewNode.TxtName, Language.Pet.lock);
            this.viewNode.IconLock.visible = false;
        }
        if (data.is_effect) {
            data.is_effect = false;
            this.viewNode.EffectShow.PlayEff(4164015);
            AudioManager.Inst().Play(AudioTag.JiHuo);
        }

        this.viewNode.CellBG.grayed = data.state == PetSkillCellState.Unlock || data.state == PetSkillCellState.Lock;
    }

    private onClickLock() {
        this._data.is_lock = Math.abs(this._data.is_lock - 1);
        PetData.Inst().ChangeSkillFlag();
    }

    private onClickUnlock() {
        let seq = this._data.index;
        let cfg = PetData.Inst().GetSkillCellUnlockCfg(seq);
        if (cfg.open.length < 1) {
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SKILL_UNLOCK, PetData.Inst().GetSkillPetIndex(), seq);
            return
        }
        let need_num = cfg.open[0].num;
        let has_num = Item.GetNum(cfg.open[0].item_id);

        if (has_num < need_num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(cfg.open[0].item_id);
            return
        }

        let need_num_str = TextHelper.RichTextOutLine(TextHelper.ColorStr(need_num, COLORSTR.White), COLORSTR.Yellow2);
        let icon = TextHelper.RichTextImg("CommonAtlas", "Item40001");

        PublicPopupCtrl.Inst().DialogTips(Format(Language.Pet.SkillUnlockForamt, icon, need_num_str), null, function () {
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SKILL_UNLOCK, PetData.Inst().GetSkillPetIndex(), seq);
        })
    }
}
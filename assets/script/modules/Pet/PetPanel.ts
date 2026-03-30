import { CfgPetData } from "config/CfgPet";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { PetClothData } from "modules/PetCloth/PetClothData";
import { PetHuanHuaMain } from "modules/PetCloth/PetHuanHuaMain";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BasePanel } from "modules/common/BasePanel";
import { COLORSTR } from "modules/common/ColorEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { ItemCell } from "modules/extends/ItemCell";
import { PetAvatarCell, PetAvatarData } from "modules/extends/PetAvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleAttrView } from "modules/role/RoleAttrView";
import { RoleData } from "modules/role/RoleData";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { PetData } from "./PetData";
import { PetEmBattleView } from "./PetEmBattleView";
import { PetEvolView } from "./PetEvolView";
import { PetGemView } from "./PetGemView";
import { PetReturnView } from "./PetReturnView";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";


export class PetPanel extends BasePanel {
    private bg1: fgui.GImage;
    protected viewNode = {
        //Bg1: <fgui.GImage>null,
        TxtName: <fgui.GTextField>null,
        TxtLv: <fgui.GTextField>null,
        BtnDetail: <fgui.GButton>null,
        // CapItem: <fgui.GTextField>null,
        BtnBuZhen: <fgui.GButton>null,
        ListPet: <fgui.GList>null,
        BtnFree: <fgui.GButton>null,
        BtnGem: <BtnPet>null,
        PetModel: <PetModelShowItem>null,
        ListAttr: <fgui.GList>null,
        BtnEvol: <fgui.GButton>null,
        EvolRedPoint: <RedPoint>null,
        BtnHuanHua: <BtnPet>null,
    }
    protected extendsCfg = [
        { ResName: "PetInfoCell", ExtendsClass: PetInfoCell },
        { ResName: "ItemCellNum", ExtendsClass: ItemCellNum },
        { ResName: "ItemCellSelect", ExtendsClass: ItemCellSelect },
        { ResName: "PetModelShowItem", ExtendsClass: PetModelShowItem },
        { ResName: "PetAttrCell", ExtendsClass: PetAttrCell },
        { ResName: "PetAttrCell", ExtendsClass: PetAttrCell },
        { ResName: "BtnPet", ExtendsClass: BtnPet },
    ];

    OnVisible() {
        //this.parentView.viewBoard.addExtraCompent(this.bg1);
    }

    InitPanelData() {
        //this.bg1 = this.viewNode.Bg1;
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_pet_list_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_pet_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "is_embattle_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "flush_gem_red");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "flush_cloth_wear");
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.OnFunOpenChange.bind(this), "roleLevel");
        this.viewNode.ListPet._container.addComponent(CocHighPerfList);
        GuideCtrl.Inst().AddGuideUi("BtnPetGem", this.viewNode.BtnGem);
        this.handleCollector.Add(RemindGroupMonitor.Create(ModManger.TabMod(Mod.Pet.PetGem), this.freshRedPoint.bind(this)));
        this.handleCollector.Add(RemindGroupMonitor.Create(ModManger.TabMod(Mod.Pet.PetHuanHua), this.FlushClothRed.bind(this)));
    }

    private freshRedPoint() {
        let red_point = this.viewNode.BtnGem.GetRedPoint();
        if (red_point) {
            red_point.SetNum(PetData.Inst().GetPetGemRed(PetData.Inst().CurShowPetIndex));
        }
    }

    InitPanel() {
        this.viewNode.ListPet.on(fgui.Event.CLICK_ITEM, this.onChangePet, this);
        this.viewNode.ListPet.setVirtual();
        this.viewNode.BtnBuZhen.onClick(this.onBtnClick.bind(this, "BtnBuZhen"));
        this.viewNode.BtnDetail.onClick(this.onBtnClick.bind(this, "BtnDetail"));
        this.viewNode.BtnFree.onClick(this.onBtnClick.bind(this, "BtnFree"));
        this.viewNode.BtnGem.onClick(this.onBtnClick.bind(this, "BtnGem"));
        this.viewNode.BtnHuanHua.onClick(this.onBtnClick.bind(this, "BtnHuanHua"));
        this.viewNode.BtnEvol.onClick(this.onClickEvol.bind(this));
        this.FlushList();
        this.OnFunOpenChange()
    }

    OnFunOpenChange() {
        this.viewNode.BtnGem.visible = FunOpen.Inst().GetFunIsOpen(Mod.Pet.PetGem).is_open;
    }

    /**更新宠物列表 */
    private FlushList() {
        let pet_list = PetData.Inst().getAllPet();
        if (pet_list) {
            if (!pet_list.length)
                return;
            let pet_index = PetData.Inst().CurShowPetIndex;
            let index = 0;
            if (pet_index) {
                for (let i = 0; i < pet_list.length; i++) {
                    if (pet_list[i].petIndex == pet_index) {
                        index = i;
                        break;
                    }
                }
            }
            if (index == 0) {
                pet_index = pet_list[0].petIndex;
                PetData.Inst().CurShowPetIndex = pet_index;
            }
            if (this.viewNode.ListPet) {
                this.viewNode.ListPet.SetData(pet_list);
                this.viewNode.ListPet.refreshVirtualList();
                this.viewNode.ListPet.selectedIndex = index;
                this.FlushPetData();
            }

        }

    }

    /**更新选中改的宠物数据 */
    public FlushPetData() {
        let pet_data = PetData.Inst().GetPetInfo(PetData.Inst().CurShowPetIndex);
        if (pet_data) {
            let cfg = PetData.Inst().GetPetCfg(pet_data.petId);
            let petName = cfg.pet_name + ""

            UH.SetText(this.viewNode.TxtLv, Language.GemAtelier.LevelShow + pet_data.petLevel);
            this.viewNode.ListAttr.SetData(PetData.Inst().GetPetBaseAttrDesc(pet_data));
            // UH.SetText(this.viewNode.CapItem, pet_data.capability);
            let resId = cfg.pet_res;
            let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.petIndex == PetData.Inst().CurShowPetIndex });
            if (cloth) {
                let curData = PetClothData.Inst().GetPetSkillDataById(cloth.itemId);
                if (curData) {
                    resId = curData.res_id;
                    petName = curData.name;
                }
            }
            UH.SetText(this.viewNode.TxtName, petName);
            this.viewNode.PetModel.SetData(resId);
            let pet_evol_cfg = PetData.Inst().GetEvolCfg(pet_data.petId)
            this.viewNode.BtnEvol.visible = pet_data.petLevel >= CfgPetData.other[0].pet_evo_level && pet_evol_cfg != null
            this.viewNode.EvolRedPoint.visible = pet_data.petLevel >= CfgPetData.other[0].pet_evo_level && pet_evol_cfg != null
            if (pet_evol_cfg != null) {
                let num = Item.GetNum(pet_evol_cfg.evo_item_id)
                this.viewNode.EvolRedPoint.SetNum(num >= pet_evol_cfg.item_id_num ? 1 : 0)
            }
            this.freshRedPoint();
            this.FlushClothRed();
        }
    }

    /**切换宠物 */
    private onChangePet(item: PetInfoCell) {
        PetData.Inst().CurShowPetIndex = item.GetData().petIndex;
        this.FlushPetData();
    }

    private onBtnClick(name: string) {
        switch (name) {
            case "BtnBuZhen":
                ViewManager.Inst().OpenView(PetEmBattleView);
                break;
            case "BtnDetail":
                ViewManager.Inst().OpenView(RoleAttrView, {
                    attrList: PetData.Inst().GetPetAttrList(PetData.Inst().CurShowPetIndex),
                })
                break;
            case "BtnFree":
                if (PetData.Inst().PetAllInfo.petList.length == 1) {
                    PublicPopupCtrl.Inst().Center(Language.Pet.last_pet_tip);
                } else
                    ViewManager.Inst().OpenView(PetReturnView, PetData.Inst().CurShowPetIndex);
                break;
            case "BtnGem":
                ViewManager.Inst().OpenView(PetGemView);
                break;
            case "BtnHuanHua":
                ViewManager.Inst().OpenView(PetHuanHuaMain, PetData.Inst().CurShowPetIndex);
                break;
        }
    }

    ClosePanel() {
        PetData.Inst().CurShowPetIndex = 0;
        GuideCtrl.Inst().ClearGuideUi("BtnPetGem");
    }
    FlushClothRed() {
        this.viewNode.BtnHuanHua.GetRedPoint().SetNum(PetClothData.Inst().GerAllRed());
    }
    onClickEvol() {
        ViewManager.Inst().OpenView(PetEvolView, { index: PetData.Inst().CurShowPetIndex })
    }
}


export class PetInfoCell extends fgui.GButton {
    private _data: IPB_SCRolePetData;
    protected viewNode = {
        Head: <PetAvatarCell>null,
        TxtLevel: <fgui.GTextField>null,
        GpEmBattle: <fgui.GGroup>null,
        RedPoint: <RedPoint>null,
        pos: <fgui.GGroup>null,
        LbTitle: <fgui.GTextField>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: IPB_SCRolePetData) {
        this._data = data;
        this.viewNode.pos.visible = false;
        this.viewNode.Head.SetData(new PetAvatarData(data.petId, data.petOrder, data.petIndex));
        UH.SetText(this.viewNode.TxtLevel, TextHelper.Format(Language.Escort.Level, data.petLevel));
        //this.viewNode.GpEmBattle.visible = PetData.Inst().IsEmBattlePetIndex(data.petIndex);
        this.viewNode.GpEmBattle.visible = false
        let num = PetData.Inst().CheckIsEvolRed(data.petId, data.petLevel) || PetData.Inst().GetPetGemRed(data.petIndex);
        this.viewNode.RedPoint.SetNum(num)
        for (let i = 0; i < PetData.Inst().PetAllInfo.fightPetIndex.length; i++) {
            if (PetData.Inst().PetAllInfo.fightPetIndex[i] == data.petIndex) {
                this.viewNode.pos.visible = true;
                let st = TextHelper.Format(Language.Pet.EmIndexTip, i + 1);
                UH.SetText(this.viewNode.LbTitle, st);
            }
        }
    }

    public GetData() {
        return this._data;
    }
}

export class ItemCellNum extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        RbTxt: <fgui.GRichTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: { item_data: any, show_num: number | string }) {
        let cell_data = this.viewNode.Cell.GetData();
        if (!cell_data || cell_data.ItemId() != data.item_data.ItemId())
            this.viewNode.Cell.SetData(data.item_data);
        UH.SetText(this.viewNode.RbTxt, TextHelper.RichTextOutLine(data.show_num + "", COLORSTR.Black, 2));
    }
}

class ItemCellSelect extends fgui.GButton {
    private viewNode = {
        Cell: <ItemCellNum>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.viewNode.Cell.SetData(data);
    }
}
//144 253
export class PetModelShowItem extends BaseItem {
    protected viewNode = {
        Model: <UIModelShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(pet_res: any) {
        if (pet_res && this._data != pet_res) {
            this.viewNode.Model.x = 144;
            this.viewNode.Model.y = 253;
            if (pet_res == 40004) {
                this.viewNode.Model.x = 180;
                this.viewNode.Model.y = 290;
            }
            this.viewNode.Model.setPath(ResPath.Npc(pet_res));
        }
        this._data = pet_res;
    }
}

export class PetAttrCell extends BaseItem {
    protected viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtBaseNum: <fgui.GTextField>null,
        TxtGrowNum: <fgui.GTextField>null,
    };

    public SetData(data: { type: number, base_num: number, grow_num: number }) {
        UH.SetText(this.viewNode.TxtName, TextHelper.Format(Language.Pet.AttrShow, AttrListName[data.type]));
        let base_num = data.base_num > 100000 ? DataHelper.ConverMoney(data.base_num) : data.base_num;
        let grow_num = data.grow_num > 100000 ? DataHelper.ConverMoney(data.grow_num) : data.grow_num;
        UH.SetText(this.viewNode.TxtBaseNum, AttrHelper.Percent(data.type, base_num));
        UH.SetText(this.viewNode.TxtGrowNum, "+" + AttrHelper.Percent(data.type, grow_num));
    }
}

export class BtnPet extends BaseItemGB {
    protected viewNode = {
        redPoint: <RedPoint>null,
    };

    public GetRedPoint() {
        return this.viewNode.redPoint
    }
}
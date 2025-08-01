import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ItemCellNum } from "./PetPanel";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { BaseItem } from "modules/common/BaseItem";
import { BoardData } from "modules/common_board/BoardData";
import { PetData, PetGemData } from "./PetData";
import { Item } from "modules/bag/ItemData";
import { CfgAttrUp, CfgItem } from "config/CfgCommon";
import { PetGemInfoView } from "./PetGemInfoView";
import { TabPetSkill } from "./PetSkillSelView";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { UH } from "../../helpers/UIHelper";
import { AttrListName, Language } from "modules/common/Language";
import { AttrHelper } from "../../helpers/AttrHelper";
import { BATTLE_ATTR } from "modules/common/CommonEnum";
import { RoleData } from "modules/role/RoleData";
import { PetGemStoreData, PetGemStoreView } from "./PetGemStoreView";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RedPoint } from "modules/extends/RedPoint";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";
import { AttrItem, AttrItemCell } from "modules/common_item/AttrItem";
import { CfgPetData } from "config/CfgPet";
import { PetGemOpView } from "./PetGemOpView";
import { BagData } from "modules/bag/BagData";
import { PetClothData } from "modules/PetCloth/PetClothData";

@BaseView.registView
export class PetGemView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGem",
        ViewName: "PetGemView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode: any = {
        Board: <CommonBoard2>null,
        ListAttr: <fgui.GList>null,
        PetModel: <UIModelShow>null,
        BtnStore: <fgui.GButton>null,
        GemItem0: <PetGemItem>null,
        GemItem1: <PetGemItem>null,
        GemItem2: <PetGemItem>null,
        GemItem3: <PetGemItem>null,
        GemItem4: <PetGemItem>null,
        GemItem5: <PetGemItem>null,
    }
    protected extendsCfg = [
        { ResName: "PetGemLvItem", ExtendsClass: PetGemLvItem },
        { ResName: "PetGemItem", ExtendsClass: PetGemItem },
        { ResName: "PetTsGemItem", ExtendsClass: PetGemItem },
        { ResName: "PetAttrCell", ExtendsClass: AttrItemCell },
        { ResName: "PetGemItemAttr", ExtendsClass: AttrItemCell },
        { ResName: "PetTsGemItemAttr", ExtendsClass: AttrItemCell },
    ];

    InitData() {
        this.viewNode.ListAttr.setVirtual();
        this.viewNode.Board.SetData(new BoardData(PetGemView, null, 16));
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetData.bind(this), "is_pet_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetData.bind(this), "is_ts_gem_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushPetData.bind(this), "OtherChange");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushGemRed.bind(this), "flush_gem_red");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushPetData.bind(this), "flush_cloth_wear");
        this.viewNode.BtnStore.onClick(this.onBtnClick.bind(this, "BtnStore"));
        this.FlushPetData();
        this.FlushGemRed();
    }

    /**宠物身上的宝石 */
    private FlushPetData() {
        let gem_list = PetData.Inst().GetPetGemList();
        let ts_gem_list = PetData.Inst().GetPetTsGemList();
        for (let i = 0; i <= 3; i++) {
            this.viewNode["GemItem" + i].SetData(gem_list[i]);
        }
        for (let i = 4; i <= 5; i++) {
            this.viewNode["GemItem" + i].SetData(ts_gem_list[i - 4]);
        }
        let pet = PetData.Inst().GetPetInfo(PetData.Inst().CurShowPetIndex);
        if (pet) {
            let list_attr: CfgAttrUp[] = [];
            for (let i = 1; i < BATTLE_ATTR.BATTLE_ATTR_MAX; i++) {
                list_attr.push(new CfgAttrUp(i, pet.attrList[i]))
            }
            this.viewNode.ListAttr.SetData(list_attr);
            let cfg = PetData.Inst().GetPetCfg(pet.petId);
            let resId = cfg.pet_res;
            // for(let key in PetClothData.Inst().ClothWearList){
            //     if(PetClothData.Inst().ClothWearList[key] == PetData.Inst().CurShowPetIndex){
            //         if(PetClothData.Inst().GetPetSkillDataById(+key)){
            //             let curData = PetClothData.Inst().GetPetSkillDataById(+key);
            //             resId = curData.res_id;
            //         }
                       
            //     }
            // }
            let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg =>{return cfg.petIndex == PetData.Inst().CurShowPetIndex});
            if(cloth){
                let curData = PetClothData.Inst().GetPetSkillDataById(cloth.itemId);
                if(curData){
                    resId = curData.res_id;
                }
            }
            this.viewNode.PetModel.setPath(ResPath.Npc(resId));
        }
    }

    private FlushGemRed() {
        for (let i = 0; i <= 5; i++) {
            this.viewNode["GemItem" + i].FlushRed();
        }
    }

    private onBtnClick(name: string) {
        let pet_inst = PetData.Inst();
        switch (name) {
            case "BtnStore":
                let store_data = new PetGemStoreData();
                store_data.title = Language.Pet.GemStore;
                store_data.func_show = pet_inst.GetAllGemInfo.bind(pet_inst);
                store_data.func_select_call = (gem_data: PetGemData) => {
                    ViewManager.Inst().OpenView(PetGemInfoView, gem_data);
                }
                ViewManager.Inst().OpenView(PetGemStoreView, store_data)
                break;
        }
    }



    InitUI() {
    }
}

class PetGemItem extends BaseItem {
    protected viewNode = {
        Cell: <PetGemLvItem>null,
        redPoint: <RedPoint>null,
        BtnAdd: <fgui.GButton>null,
        ListAttr: <fgui.GList>null,
        GpInfo: <fgui.GGroup>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnAdd.onClick(this.OnGemClick.bind(this));
    }

    public SetData(data: { gem_data: PetGemData, pos: number }) {
        this._data = data;
        if (data.gem_data.item_id == 0) {
            this.viewNode.BtnAdd.visible = true;
        } else {
            this.viewNode.GpInfo.visible = true;
            this.viewNode.Cell.SetData(data.gem_data);
            let cfg: any
            if (data.gem_data.item_id == PetData.Inst().GetTsGemId()) {
                cfg = CfgPetData.pet_ts_gem[data.gem_data.level - 1];
            } else {
                cfg = PetData.Inst().GetPetGemCfg()[data.gem_data.item_id];
            }
            if (cfg) {
                this.viewNode.ListAttr.SetData(cfg.up_att);
            }
        }
    }

    public FlushRed() {
        if (this.viewNode.redPoint && this._data) {
            let red;
            let is_up = PetData.Inst().CheckGemUpOne(this._data.gem_data);
            let is_set = !this._data.gem_data.item_id ? PetData.Inst().GetGemRedByPos(this._data.pos) : 0;
            red = is_up ? 1 : is_set;
            this.viewNode.redPoint.SetNum(red);
        }
    }

    private OnGemClick() {
        let data = this._data;
        if (data) {
            if (data.gem_data.item_id != 0) {
                ViewManager.Inst().OpenView(PetGemOpView, data)
            } else {
                //自动镶嵌
                let pos = data.pos;
                let max_gem = PetData.Inst().GetMaxGemByType(pos);
                if (!max_gem) {
                    PublicPopupCtrl.Inst().Center(Language.Pet.Tip);
                } else {
                    PetData.Inst().SetGem(pos, max_gem);
                }
            }
        }
    }

}

// export class PetGemUpItem extends fgui.GButton {
//     private _data: PetGemData;
//     protected viewNode = {
//         PetGemCell: <ItemCellNum>null,
//         GpWeared: <fgui.GGroup>null,
//     };
//     protected onConstruct() {
//         ViewManager.Inst().RegNodeIofo(this.viewNode, this);
//     }

//     public SetData(data: PetGemData) {
//         this._data = data;
//         let item_id = data.item_id
//         this.viewNode.PetGemCell.SetData({ item_data: Item.Create(new CfgItem(item_id), { is_click: false }), show_num: "Lv." + data.level });
//         this.viewNode.GpWeared.visible = data.pet_index > 0;
//     }

//     public GetData() {
//         return this._data;
//     }
// }

/** 显示等级的宝石cell */
export class PetGemLvItem extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        LevelShow: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: PetGemData) {
        this._data = data;
        let cell_data = this.viewNode.Cell.GetData();
        if (!cell_data || cell_data.ItemId() != data.item_id)
            this.viewNode.Cell.SetData(Item.Create(new CfgItem(data.item_id), { is_click: false }));
        UH.SetText(this.viewNode.LevelShow, "Lv." + data.level);
    }
}
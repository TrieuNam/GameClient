import { BaseItem } from "modules/common/BaseItem";
import * as fgui from "fairygui-cc";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { UH } from "../../helpers/UIHelper";
import { PetData } from "modules/Pet/PetData";
import { PetClothData } from "modules/PetCloth/PetClothData";

export class PetAvatarCell extends BaseItem {
    protected viewNode = {
        BgColor: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        OrderIcon: <fgui.GLoader>null,
        GpLevel: <fgui.GGroup>null,
        TxtLevel: <fgui.GTextField>null,
    };

    public SetData(data: PetAvatarData) {
        let cfg = PetData.Inst().GetPetCfg(data.petId);
        UH.SpriteName(this.viewNode.BgColor, "CommonAtlas", `PinZhi${cfg.pet_color}`);
        let iconId = cfg.pet_icon
        this.viewNode.Icon.scaleY = this.viewNode.Icon.scaleX = 1;
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg =>{return cfg.petIndex == data.petIndex});
        if(cloth){
            let curData = PetClothData.Inst().GetPetSkillDataById(cloth.itemId);
            if(curData){
                iconId = curData.icon_id;
                this.viewNode.Icon.scaleY = this.viewNode.Icon.scaleX = 1.2;
            }
        }
        UH.SetIcon(this.viewNode.Icon, iconId, ICON_TYPE.ITEM);
        UH.SpriteName(this.viewNode.OrderIcon, "Pet", "JueBiao_" + data.petOrder);
        if(data.level!=undefined){
            this.viewNode.GpLevel.visible=true;
            UH.SetText(this.viewNode.TxtLevel,"Lv."+data.level);
        }else{
            this.viewNode.GpLevel.visible = false;
        }
    }
}

export class PetAvatarData {
    petId: number;
    petOrder: number;
    petIndex: number;
    level?: number;
    constructor(petId: number, petOrder: number, petIndex?: number,level?: number){
        this.petId = petId;
        this.petOrder = petOrder;
        this.petIndex = petIndex;
        this.level = level;
    }
}
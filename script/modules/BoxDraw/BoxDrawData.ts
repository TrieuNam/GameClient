import { CfgItem } from "config/CfgCommon";
import { DataBase } from "data/DataBase";
import { ViewManager } from "manager/ViewManager";
import { PetData } from "modules/Pet/PetData";
import { GET_TYPE } from "modules/bag/BagEnum";
import { AdType } from "modules/common/CommonEnum";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { BoxDrawRewardView } from "./BoxDrawRewardView";


export enum BoxDrawState {
    None,
    OpenBox = 1,
    ShowCard1,
    ShowCard2,
    ShowCard3,
    ShowRet,
    Count,
}

//宝箱品质
export enum BoxDrawType {
    Normal = 0,
    Middle,
    High,
}

export class BoxDrawData extends DataBase {
    BoxQuality: number;//宝箱品质
    BoxRet: CfgItem[];
    BoxGetType: GET_TYPE;

    //宠物宝箱红点
    public GetPetBoxRed() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Pet.PetBox);
        if (!open_t.is_open) {
            return 0;
        }
        if (!PetData.Inst().IsHavePet()) {
            return 0;
        }
        let data_ad = RoleData.Inst().AdInfo
        let box_ad = data_ad.get(AdType.pet_draw)
        let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_speed_up)
        if (+co.ad_param - box_ad.todayCount <= 0) {
            return 0;
        }
        if (box_ad.nextFetchTime > 0)
            return 0;
        return 1;
    }

    public SetBoxRet(data: PB_SCGetItemNotice) {
        this.BoxGetType = data.getType
        this.BoxRet = [];
        let list = data.itemList;
        for (let i = 0; i < list.length; i++) {
            if (list[i].num > 0) {
                this.BoxRet.push(new CfgItem(list[i].itemId, list[i].num));
                if (this.BoxRet.length == 3) {
                    ViewManager.Inst().OpenView(BoxDrawRewardView);
                    return;
                }
            }
        }
    }

    public GetBoxRet(index: number) {
        if (this.BoxRet)
            return this.BoxRet[index]
    }
}
import { CfgMountData } from "config/CfgMount";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { PetData } from "modules/Pet/PetData";
import { Item } from "modules/bag/ItemData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { BATTLE_ATTR, RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { FashionData } from "modules/fashion/FashionData";
import { RoleData } from "modules/role/RoleData";
import { OrterRoleInfoView } from "./OrterRoleInfoView";

export class OtherRoleCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCGetOtherRoleRet, func: this.OnRecvOtherRoleRet },
        ]
    }

    //其他玩家信息
    private OnRecvOtherRoleRet(protocol: PB_SCGetOtherRoleRet) {
        OtherRoleData.Inst().SetOtherRoleRet(protocol);
    }

    // 请求其他玩家信息
    public SendGetOtherRoleInfo(type: OTHER_ROLE_REQ_TYPE, value: any, uid: number) {
        OtherRoleData.Inst().SetTypeData(type, value);
        let protocol = this.GetProtocol(PB_CSGetOtherRoleInfo);
        protocol.uid = uid;
        this.SendToServer(protocol);
    }
}

class OtherRoleResuleData {
    @smartdata
    is_change: boolean;
}

export class OtherRoleData extends DataBase {
    public ResultData: OtherRoleResuleData;
    private other_role_info: PB_SCGetOtherRoleRet;
    public type_data: { type: OTHER_ROLE_REQ_TYPE, value: any };
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(OtherRoleResuleData);
    }

    public SetTypeData(type: OTHER_ROLE_REQ_TYPE, value: any) {
        this.type_data = { type: type, value: value };
    }

    //其他玩家信息
    public SetOtherRoleRet(data: PB_SCGetOtherRoleRet) {
        this.other_role_info = data;
        if (ViewManager.Inst().IsOpen(OrterRoleInfoView)) {
            this.ResultData.is_change = !this.ResultData.is_change;
        } else {
            ViewManager.Inst().OpenView(OrterRoleInfoView);
        }
    }

    //其他玩家信息
    public GetOtherRoleRet() {
        return this.other_role_info;
    }

    public GetAttrInfo(index: number) {
        let list: { my_num: number, other_num: number, type: number }[] = [];
        if (index == 0) {
            let my_attr = RoleData.Inst().GetAllAttributeData();
            let other_attr = this.other_role_info.roleAttrList;
            for (let i = BATTLE_ATTR.HP; i <= BATTLE_ATTR.STUN_IMMUNITY; i++) {
                if (i == 5 || i == 12) {
                    list.push(null);
                }
                let type = i;
                list.push({ my_num: my_attr.get(type), other_num: other_attr[i] ? other_attr[i].attrValue : 0, type: type })
            }
        } else {
            let my_pet_attr = PetData.Inst().GetEmbattlePetAttr();
            let pet_info = this.other_role_info.petList.find(info => info.petId > 0)
            let other_pet_att = pet_info.petAttrList
            for (let i = BATTLE_ATTR.HP; i <= BATTLE_ATTR.STUN_IMMUNITY; i++) {
                if (i == 5 || i == 12) {
                    list.push(null);
                }
                let type = i;
                list.push({ my_num: my_pet_attr[i], other_num: other_pet_att[i] ? other_pet_att[i].attrValue : 0, type: type })
            }
        }
        return list;
    }

    /**是否有出战宠物 */
    public IsOtherPetEmbattle() {
        return this.other_role_info.petList.some(info => info.petId > 0)
    }

    /**坐骑入口 */
    public GetMountInfo() {
        let id = this.other_role_info.appearance.surfaceMount;
        if (id == -1) {
            return { id: -1 };
        }
        if (id >= 1000) {
            id -= 1000
            let cfg = CfgMountData.mount_res;
            for (let i = 0; i < cfg.length; i++) {
                if (cfg[i].mount_skin_seq == id) {
                    return { id: cfg[i].icon_id, color: Item.GetColor(cfg[i].jihuo_item_id) };
                }
            }
        } else {
            let cfg = CfgMountData.mount_jihuo;
            for (let i = 0; i < cfg.length; i++) {
                if (cfg[i].mount_id == id) {
                    return { id: cfg[i].icon_id, color: cfg[i].color };
                }
            }
        }
        return { id: -1 };
    }

    /**时装等级 */
    public GetShiZhuangLevel() {
        let level = 3;
        level = Math.max(Item.GetQuality(FashionData.Inst().GetFashionItemId(this.other_role_info.appearance.surfaceBody)), level)
        level = Math.max(Item.GetQuality(FashionData.Inst().GetFashionItemId(this.other_role_info.appearance.surfaceHead)), level)
        level = Math.max(Item.GetQuality(FashionData.Inst().GetFashionItemId(this.other_role_info.appearance.surfaceShield)), level)
        level = Math.max(Item.GetQuality(FashionData.Inst().GetFashionItemId(this.other_role_info.appearance.surfaceWeapon)), level)
        return level;
    }

    public GetDescByType() {
        let desc = "";
        if (this.type_data)
            switch (this.type_data.type) {
                case OTHER_ROLE_REQ_TYPE.ARENA:
                    desc = Language.Arena.score_desc + this.type_data.value;
                    break;
                case OTHER_ROLE_REQ_TYPE.CrossArena:
                    desc = Language.PeakArena.score_desc + this.type_data.value;
                    break;
            }
        return desc;
    }
}

export enum OTHER_ROLE_REQ_TYPE {
    ARENA = 1,
    TRIAL = 2,
    Escort = 3,
    CrossArena = 4,
}

/**竞技场对应的其他角色信息界面的type */
export let RANK_TO_OTHER: { [key: string]: number } = {
    [RANK_TYPE.Arena]: OTHER_ROLE_REQ_TYPE.ARENA,
    [RANK_TYPE.TRIAL]: OTHER_ROLE_REQ_TYPE.TRIAL,
    [RANK_TYPE.CrossArena]: OTHER_ROLE_REQ_TYPE.CrossArena,
}
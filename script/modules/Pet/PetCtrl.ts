import { CfgPetData } from 'config/CfgPet';
import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { BagData } from 'modules/bag/BagData';
import { BoxDrawData } from 'modules/BoxDraw/BoxDrawData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { PetClothData } from 'modules/PetCloth/PetClothData';
import { RoleData } from 'modules/role/RoleData';
import { PetData, PetGemData } from './PetData';
export enum PET_OP_TYPE {
    LEVEL_UP,            //升级          p1：pet_index    p2:1/10
    GRADE_UP,            //觉醒          p1：pet_index                                         p_list:材料的物品id
    SKILL_LEARN,         //学技能        p1：pet_index     p2：锁的flag     p3:技能书的物品id 
    INLAY_GEM,           //镶嵌普通宝石   p1：pet_index    p2:[0,3]         p3:宝石的物品id 
    GEM_LEVEL_UP_BAG,    //升级普通宝石   p1:物品id                                             p_list:材料的物品id
    GEM_LEVEL_UP_PET,    //升级普通宝石   p1：pet_index    p2:[0,3]                             p_list:材料的物品id
    INLAY_TS_GEM,        //镶嵌特殊宝石   p1：pet_index    p2:[0,1]         p3:gem_index
    TS_GEM_LEVEL_UP,     //特殊宝石升级   p1：gem_index                                          p_list:材料的物品gem_index
    TS_GEM_REFRESH,      //特殊宝石洗练   p1：gem_index    p2：锁的flag
    SET_FIGHT,           //设置出战       p1：pet_index
    DISCARD,             //放生           p1：pet_index
    SKILL_LOCK,          //上锁技能       p1：pet_index    p2:锁的flag
    TREASURE,            //抽奖           p1：type
    GRADE_UP_EVO,        //进化           p1: pet_index
    OK_GEM_LEVEL_UP_PET,     //单个普通宝石一键升级  p1:pet_index    p2:[0,3]
    OK_TS_GEM_LEVEL_UP,     //单个特殊宝石一键升级  p1:_gem_index
    SEND_EVO_ATTR,       // 请求进化后属性 p1 pet_index
    CLOTH_UP,           //皮肤升级  p1: cloth_id p2:0消耗物品 1:消耗钻石
    CLOTH_WEAR,         //皮肤穿戴  p1: pet_index p2:cloth_id

    SKILL_UNLOCK,       //解锁技能格子 p1: pet_index, p2:seq
}

export enum PET_RET_TYPE {
    FIGHT,  //设置出战 p1：pet_index p2:0|1
    DISCARD,//放生或被消耗 p1：pet_index
    DISCARD_TS_GEM,//特殊宝石被消耗 p1：gem_index
    GEM_UP,//升级结果通知 p1:0失败 1成功
    UP_EVO,//进化结果通知 p1:pet_index p2:新id
    CLOTH_UP,           //皮肤升级   p1:cloth_id    p2:level
    CLOTH_WEAR,         //皮肤穿戴   p1:cloth_id    p2:pet_index
    SKILL_UNLOCK,       //解锁技能   p1:pet_index   p2:seq
}
export class PetCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRolePetAllInfo, func: this.recvSCRolePetAllInfo },
            { msgType: PB_SCRolePetSignleInfo, func: this.recvSCRolePetSignleInfo },
            { msgType: PB_SCRoleTSGemSignleInfo, func: this.recvSCRoleTSGemSignleInfo },
            { msgType: PB_SCRolePetRetInfo, func: this.recvSCRolePetRetInfo },
            { msgType: PB_SCPetSendEvoAttr, func: this.recvSCPetSendEvoAttr },
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Pet.PetGem, PetData.Inst().ResultData,
            PetData.Inst().GetGemRed.bind(PetData.Inst()), "flush_gem_red"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Pet.PetBox, PetData.Inst().ResultData,
            BoxDrawData.Inst().GetPetBoxRed.bind(PetData.Inst()), "flush_ad_red", "is_pet_list_change"));

        this.handleCollector.Add(RemindRegister.Create(Mod.Pet.PetEvol, PetData.Inst().ResultData,
            PetData.Inst().GetEvolRed.bind(PetData.Inst()), "flush_evol_red"));
        this.handleCollector.Add(RemindRegister.Create(Mod.Pet.PetHuanHua, PetData.Inst().ResultData,
            PetClothData.Inst().GerAllRed.bind(PetClothData.Inst()), "flush_cloth_red"));
        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().AdFlush, this.AdChange.bind(this), "flush_info"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));

    }

    private recvSCRolePetAllInfo(data: PB_SCRolePetAllInfo) {
        PetData.Inst().SetRolePetAllInfo(data);
        // LogError("所有宠物信息", data)
    }

    private recvSCRolePetSignleInfo(data: PB_SCRolePetSignleInfo) {
        PetData.Inst().SetRolePetSignleInfo(data);
        // LogError("单个宠物信息", data)
    }

    private recvSCRoleTSGemSignleInfo(data: PB_SCRoleTSGemSignleInfo) {
        PetData.Inst().SetRoleTSGemSignleInfo(data);
        // LogError("单个宝石信息", data)
    }

    private recvSCRolePetRetInfo(data: PB_SCRolePetRetInfo) {
        PetData.Inst().RecvRolePetRetInfo(data);
        LogError("操作回调", data)
    }

    private recvSCPetSendEvoAttr(data: PB_SCPetSendEvoAttr) {
        PetData.Inst().RecvPetEvoAttr(data);
        LogError("?宠物进化后协议", data)
    }

    public SendPetReq(op_type: PET_OP_TYPE, p1: number, p2?: number, p3?: number, p_list?: number[]) {
        let protocol = this.GetProtocol(PB_CSRolePetReq);
        protocol.reqType = op_type;
        protocol.param_1 = p1 ?? 0;
        protocol.param_2 = p2 ?? 0;
        protocol.param_3 = p3 ?? 0;
        protocol.paramList = p_list ?? [];
        this.SendToServer(protocol);
        // LogError("宠物 操作", protocol)
    }

    private BagNumChange() {
        PetData.Inst().ResultData.flush_gem_red = !PetData.Inst().ResultData.flush_gem_red;

        PetData.Inst().ResultData.flush_evol_red = !PetData.Inst().ResultData.flush_evol_red;
        PetData.Inst().ResultData.flush_cloth_red = !PetData.Inst().ResultData.flush_cloth_red;
    }

    private AdChange() {
        PetData.Inst().ResultData.flush_ad_red = !PetData.Inst().ResultData.flush_ad_red;
    }

    public SendOneKeyCompose(list: PetGemData[]) {
        let protocol = this.GetProtocol(PB_CSPetOneKeyUpLevelGemReq);
        let list_info = [];
        for (let i = 0; i < list.length; i++) {
            let pet_gem_data = list[i];
            let gem_data: PB_OneKeyPetGemInfo = new PB_OneKeyPetGemInfo();
            gem_data.isTsGem = pet_gem_data.item_id == PetData.Inst().GetTsGemId();
            gem_data.isInlayed = pet_gem_data.pet_index != 0;
            gem_data.petIndex = pet_gem_data.pet_index;
            let slot_index = 0;
            if (gem_data.isInlayed) {
                let pet_data = PetData.Inst().GetPetInfo(pet_gem_data.pet_index);
                if (pet_data) {
                    if (gem_data.isTsGem) {
                        for (let i = 0; i < pet_data.tsGemIndex.length; i++) {
                            if (pet_data.tsGemIndex[i] == pet_gem_data.bag_index) {
                                slot_index = i;
                                break;
                            }
                        }
                    } else
                        for (let i = 0; i < pet_data.gemItemId.length; i++) {
                            if (pet_data.gemItemId[i] == pet_gem_data.item_id) {
                                slot_index = i;
                                break;
                            }
                        }
                }
            }
            gem_data.slotIndex = slot_index;
            let item_id = pet_gem_data.item_id;
            if (gem_data.isTsGem) {
                let cfg = CfgPetData.pet_ts_gem[pet_gem_data.level - 1]
                if (cfg) {
                    item_id = cfg.to_item_id;
                }
            }
            gem_data.itemId = item_id;
            gem_data.tsGemIndex = gem_data.isTsGem ? pet_gem_data.bag_index : 0;
            list_info.push(gem_data);
        }
        protocol.items = list_info;
        this.SendToServer(protocol);
        // LogError("宠物宝石 一键合成", protocol)
    }
}

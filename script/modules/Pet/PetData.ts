import { CfgAttrUp, CfgItem } from "config/CfgCommon";
import { CfgPetAdvance, CfgPetData, CfgPetGem, CfgPetSkill, CfgPetUp } from "config/CfgPet";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata, SMDTriggerNotify } from 'data/SmartData';
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { BATTLE_ATTR } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonRewardView } from "modules/common_account/CommonRewardView";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { CfgHelper } from "../../helpers/CfgHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { PET_OP_TYPE, PET_RET_TYPE, PetCtrl } from "./PetCtrl";
import { PetEvolResultView } from "./PetEvolResultView";
import { PetGemReplaceView } from "./PetGemReplaceView";
import { PetGemStoreView } from "./PetGemStoreView";
import { PetGemUpView } from "./PetGemUpView";
import { PetView } from "./PetView";

export enum PetSkillCellState{
    Show = 0,   //已经装备技能了
    Study = 1,  //可学习
    Unlock = 2, //可解锁
    Lock = 3,   //锁住
}

export class PetResultData {
    @smartdata
    is_pet_change: boolean;

    @smartdata
    is_pet_list_change: boolean;

    @smartdata
    is_ts_gem_change: boolean;

    @smartdata
    is_ts_gem_list_change: boolean;

    @smartdata
    is_gem_wash_flag_change: boolean;

    @smartdata
    is_gem_up_data_change: boolean;

    @smartdata
    is_embattle_change: boolean;

    @smartdata
    flush_gem_red: boolean;

    @smartdata
    flush_ad_red: boolean;

    @smartdata
    flush_gem_up_ret: boolean;

    @smartdata
    flush_evol_red: boolean;

    @smartdata
    flush_evol_attr: number;

    @smartdata
    flush_cloth_up: boolean;

    @smartdata
    flush_cloth_wear: boolean;

    @smartdata
    flush_cloth_red: boolean;
}
export class PetGemOnceResultData {
    @smartdata
    flush: boolean;
}

export let PET_GEM_UP_MATRIAL_MAX = 2;
export class PetData extends DataBase {
    private result_data: PetResultData;
    once_result_data: PetGemOnceResultData;
    private evol_attr: any
    //总数据
    private pet_all_info: PB_SCRolePetAllInfo;
    //宠物背包
    private pet_bag_info: { [index: number]: IPB_SCRolePetData } = {};
    //特殊宝石背包
    private ts_gem_bag_info: { [index: number]: PB_SCRoleTSGemData } = {};

    //当前展示宠物信息的宠物index
    private cur_show_pet_index: number = 0;

    //当前宠物技能信息 用来记录技能锁的信息
    private cur_pet_skill_info: { pet_index: number, lock_num: number, skill_list: { cfg: CfgPetSkill, is_lock: number }[] };

    //宠物宝石升级信息
    public cur_gem_up_data: { gem_data: PetGemData, list_index: number, pos: number }[] = [];

    //宠物宝石升级结果
    public gem_up_ret: number;
    private pet_up_cfg: { [pet_type: number]: CfgPetUp[] };
    private pet_advence_cfg: { [pet_type: number]: CfgPetAdvance[] };
    private pet_skill_cfg: { [skill_id: number]: CfgPetSkill };
    private pet_gem_cfg: { [gem_id: number]: CfgPetGem };
    private pet_gem_cfg_level: { [pos: number]: { [level: number]: CfgPetGem } };

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(PetResultData);
        self.once_result_data = CreateSMD(PetGemOnceResultData);
    }

    public get ResultData() {
        return this.result_data;
    }

    public set CurShowPetIndex(index: number) {
        this.cur_show_pet_index = index;
    }
    public get CurShowPetIndex() {
        return this.cur_show_pet_index;
    }

    public CfgOtherPetPosition() {
        return CfgPetData.other[0].pet_position ?? 0;
    }

    public CfgOtherPetPosition2() {
        return CfgPetData.other[0].pet_position2 ?? 0;
    }

    /**全部宠物信息 */
    public SetRolePetAllInfo(info: PB_SCRolePetAllInfo) {
        this.pet_all_info = info;
        for (let i = 0; i < info.petList.length; i++) {
            this.setSinglePetInfo(info.petList[i]);
        }
        for (let i = 0; i < info.tsGemList.length; i++) {
            this.setSingleTsGemInfo(<PB_SCRoleTSGemData>info.tsGemList[i]);
        }
        // console.log("info.clothList",info.clothList);

        // for (let i = 0; i < info.clothList.length; i++) {
        //     PetClothData.Inst().SetClothListInfo(<PB_SCRoleClothData>info.clothList[i]);
        // }
    }
    /**单个宠物信息 */
    public SetRolePetSignleInfo(info: PB_SCRolePetSignleInfo) {
        let is_new = true;
        for (let i = 0; i < this.pet_all_info.petList.length; i++) {
            if (info.petNode.petIndex == this.pet_all_info.petList[i].petIndex) {
                this.CheckPetGemAttrChange(this.pet_all_info.petList[i], info.petNode)
                this.pet_all_info.petList[i] = info.petNode;
                is_new = false;
                break;
            }
        }
        this.setSinglePetInfo(info.petNode);
        if (is_new) {
            this.result_data.is_pet_list_change = !this.result_data.is_pet_list_change;
            this.pet_all_info.petList.push(info.petNode);
        }
        else
            this.result_data.is_pet_change = !this.result_data.is_pet_change;
        this.result_data.flush_gem_red = !this.result_data.flush_gem_red;
    }

    /**宝石镶嵌属性飘字 */
    public CheckPetGemAttrChange(old_info: IPB_SCRolePetData, new_info: IPB_SCRolePetData) {
        if (ViewManager.Inst().IsOpen(PetGemUpView)) {
            return;
        }
        let attr: CfgAttrUp[] = [];
        let fuhao = "+";
        let type = 1;
        let cfg;
        for (let i = 0; i < old_info.gemItemId.length; i++) {
            let old_id = old_info.gemItemId[i];
            let new_id = new_info.gemItemId[i];
            if (old_id != new_id) {
                // if (new_info.petNode.gemItemId[i]==0){
                //  cfg = this.GetPetGemCfg()[old_id];
                //     fuhao = "-";
                //     type = 0;
                // }
                cfg = this.GetPetGemCfg()[new_id];
            }
        }
        for (let i = 0; i < old_info.tsGemIndex.length; i++) {
            let old_index = old_info.tsGemIndex[i];
            let new_index = new_info.tsGemIndex[i];
            let gem_index = new_index;
            if (old_index != new_index) {
                // if (new_index == 0) {
                //     fuhao = "-";
                //     type = 0;
                //     gem_index = old_index;
                // }
                let gem_info = this.GetGemInfo(gem_index);
                if (gem_info) {
                    cfg = CfgPetData.pet_ts_gem[gem_info.gemLevel - 1];

                }
            }
        }
        if (cfg)
            attr = cfg.up_att;
        for (let i = 0; i < attr.length; i++) {
            let att_type = attr[i].type;
            let att_add = attr[i].add;
            let name = AttrListName[att_type]
            PublicPopupCtrl.Inst().CenterAttr(`${name} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
        }
    }

    private setSinglePetInfo(data: IPB_SCRolePetData) {
        this.pet_bag_info[data.petIndex] = data;
    }

    /**单个宠物宝石信息 */
    public SetRoleTSGemSignleInfo(info: PB_SCRoleTSGemSignleInfo) {
        let old_data;
        for (let i = 0; i < this.pet_all_info.tsGemList.length; i++) {
            if (info.tsGemNode.gemIndex == this.pet_all_info.tsGemList[i].gemIndex) {
                old_data = this.pet_all_info.tsGemList[i];
                this.pet_all_info.tsGemList[i] = info.tsGemNode;
                break;
            }
        }
        this.setSingleTsGemInfo(<PB_SCRoleTSGemData>info.tsGemNode);
        if (!old_data) {
            this.result_data.is_ts_gem_list_change = !this.result_data.is_ts_gem_list_change;
            this.pet_all_info.tsGemList.push(info.tsGemNode);
        }
        else {
            let level = info.tsGemNode.gemLevel;
            let cfg = CfgPetData.pet_ts_gem[level - 1]
            if (cfg && level != old_data.gemLevel) {
                let item_id = cfg.to_item_id;
                ViewManager.Inst().OpenView(CommonRewardView, { reward_data: [{ itemId: item_id, num: 1 }] })
            }
            this.result_data.is_ts_gem_change = !this.result_data.is_ts_gem_change;
        }
        this.result_data.flush_gem_red = !this.result_data.flush_gem_red;
    }

    private setSingleTsGemInfo(data: PB_SCRoleTSGemData) {
        this.ts_gem_bag_info[data.gemIndex] = data;
    }

    public RecvRolePetRetInfo(data: PB_SCRolePetRetInfo) {
        switch (data.retType) {
            case PET_RET_TYPE.FIGHT:
                this.pet_all_info.fightPetIndex[data.retP2] = data.retP1;
                this.result_data.is_embattle_change = !this.result_data.is_embattle_change;
                break;
            case PET_RET_TYPE.DISCARD:
                this.DelPet(data.retP1);
                this.result_data.flush_gem_red = !this.result_data.flush_gem_red;
                break;
            case PET_RET_TYPE.DISCARD_TS_GEM:
                this.DelTsGem(data.retP1);
                this.result_data.flush_gem_red = !this.result_data.flush_gem_red;
                break;
            case PET_RET_TYPE.GEM_UP:
                this.result_data.flush_gem_up_ret = !this.result_data.flush_gem_up_ret;
                this.gem_up_ret = data.retP1;
                break;
            case PET_RET_TYPE.UP_EVO:
                let pet_data = this.GetPetInfo(data.retP1);
                let pet_cfg = PetData.Inst().GetPetCfg(data.retP2);
                //p1 pet_index p2 id
                ViewManager.Inst().OpenView(PetEvolResultView, {
                    petId: data.retP2,
                    petOrder: pet_data.petOrder,
                    petName: pet_cfg.pet_name,
                    petLevel: pet_data.petLevel,
                });
                break;
            case PET_RET_TYPE.CLOTH_UP:
                let tempLevel = this.pet_all_info.clothList.find(cfg => { return cfg.itemId == data.retP1 });
                if (tempLevel) {
                    tempLevel.level = data.retP2;
                } else {
                    let cloth = new PB_SCRoleClothData();
                    cloth.itemId = data.retP1;
                    cloth.level = data.retP2;
                    cloth.petIndex = 0
                    this.pet_all_info.clothList.push(cloth);
                }
                this.result_data.flush_cloth_up = !this.result_data.flush_cloth_up;
                break;
            case PET_RET_TYPE.CLOTH_WEAR:
                let temp = this.pet_all_info.clothList.find(cfg => { return cfg.itemId == data.retP1 });
                if (temp) {
                    temp.petIndex = data.retP2;
                }
                this.result_data.flush_cloth_wear = !this.result_data.flush_cloth_wear;
                break;
            case PET_RET_TYPE.SKILL_UNLOCK:
                let pet_index = data.retP1;
                let skill_cell_seq = data.retP2;
                let pet = this.GetPetInfo(pet_index);
                pet.skillList[skill_cell_seq] = 0;
                SMDTriggerNotify(this.result_data, "is_pet_change");
                break;
        }
    }

    public DelPet(index: number) {
        delete this.pet_bag_info[index];
        for (let i = 0; i < this.pet_all_info.petList.length; i++) {
            if (this.pet_all_info.petList[i].petIndex == index) {
                this.pet_all_info.petList.splice(i, 1);
                break;
            }
        }
        this.result_data.is_pet_list_change = !this.result_data.is_pet_list_change;
    }

    public DelTsGem(index: number) {
        delete this.ts_gem_bag_info[index];
        for (let i = 0; i < this.pet_all_info.tsGemList.length; i++) {
            if (this.pet_all_info.tsGemList[i].gemIndex == index) {
                this.pet_all_info.tsGemList.splice(i, 1);
                break;
            }
        }
        this.result_data.is_ts_gem_list_change = !this.result_data.is_ts_gem_list_change;
    }

    public get PetAllInfo() {
        return this.pet_all_info;
    }

    public GetPetInfo(index: number) {
        return this.pet_bag_info[index];
    }

    public GetGemInfo(index: number) {
        return this.ts_gem_bag_info[index];
    }

    /**宠物升级总配置 */
    private GetPetUpCfg() {
        if (!this.pet_up_cfg) {
            this.pet_up_cfg = CfgHelper.reSetdatas(CfgPetData.pet_up, ["pet_type"], true);
        }
        return this.pet_up_cfg;
    }

    /**宠物觉醒总配置 */
    public GetAdvenceCfg() {
        if (!this.pet_advence_cfg) {
            this.pet_advence_cfg = CfgHelper.reSetdatas(CfgPetData.pet_advance, ["pet_id"], true);
        }
        return this.pet_advence_cfg;
    }
    /**宠物技能总配置 */
    public GetPetSkillCfg() {
        if (!this.pet_skill_cfg) {
            this.pet_skill_cfg = CfgHelper.reSetdatas(CfgPetData.pet_skill, ["skill_id"], false);
        }
        return this.pet_skill_cfg;
    }

    /**检查宠物开启 */
    public checkOpenPet() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Pet.View);
        if (!open_t.is_open) {
            PublicPopupCtrl.Inst().Center(open_t.content);
            return;
        }
        if (this.IsHavePet()) {
            ViewManager.Inst().OpenView(PetView);
        } else {
            PublicPopupCtrl.Inst().Center(Language.Pet.no_pet_tip);
        }
    }

    public IsHavePet() {
        return this.pet_all_info != null && this.pet_all_info.petList.length > 0
    }

    /**宠物列表 */
    public getAllPet() {
        let pet_list = [];
        for (let key in this.pet_bag_info) {
            pet_list.push(this.pet_bag_info[key]);
        }
        pet_list.sort((a, b) => {
            if (a.petLevel == b.petLevel) {
                if (a.petOrder == b.petOrder) {
                    let a_color = this.GetPetCfg(a.petId).pet_color;
                    let b_color = this.GetPetCfg(b.petId).pet_color;
                    // if (a_color == b_color) {
                    //     return b.capability - a.capability;
                    // } else {
                    return b_color - a_color;
                    // }
                } else {
                    return b.petOrder - a.petOrder;
                }
            } else {
                return b.petLevel - a.petLevel;
            }
        })
        return pet_list;
    }


    /**宠物信息配置 */
    public GetPetCfg(pet_id: number) {
        return CfgPetData.pet[pet_id - 1];
    }

    /**升级所需金币 */
    public GetPetUpGold(pet_type: number, pet_level: number, level_num: number) {
        let cfgs = this.GetPetUpCfg();
        let gold = 0;
        for (let i = 0; i < level_num; i++) {
            let level = pet_level + i;
            let cfg = cfgs[pet_type][level - 1]
            if (cfg) {
                gold += cfg.up_exp;
            }
        }
        return gold;
    }

    /**对应等级的属性值 */
    public GetPetAttr(petLevel: number, pet_id: number) {
        // if (petLevel == 1) {
        //     return this.GetPetCfg(pet_id).pet_att;
        // } else {
        let cfg = this.GetPetUpCfg()[this.GetPetCfg(pet_id).pet_type][petLevel - 1];
        return cfg ? cfg.up_att : null;
        // }
    }

    /**宠物基础属性信息 */
    public GetPetBaseAttrDesc(data: IPB_SCRolePetData) {
        let list: { type: number, base_num: number, grow_num: number }[] = [];
        let cfg = this.GetPetCfg(data.petId);
        let base_attr: { [type: number]: number } = {};
        for (let i = 0; i < cfg.pet_att.length; i++) {
            base_attr[cfg.pet_att[i].type] = cfg.pet_att[i].add;
        }
        for (let i = BATTLE_ATTR.HP; i <= BATTLE_ATTR.SPEED; i++) {
            let base_num = base_attr[i] ?? 0;
            let grow_num = data.attrList[i] - base_num;
            list.push({ type: i, base_num: base_num, grow_num: grow_num })
        }
        return list;
    }

    /**上阵宠物列表index */
    public GetEmBattleIndex() {
        let list = this.pet_all_info.petList;
        if (this.pet_all_info.fightPetIndex.length > 0) {
            let index = this.pet_all_info.fightPetIndex[0];
            for (let i = 0; i < list.length; i++) {
                if (index == list[i].petIndex) {
                    return i;
                }
            }
        }
    }

    // /**上阵宠物index */
    // public GetEmBattlePetIndex() {
    //     return this.pet_all_info.fightPetIndex;
    // }

    /**宠物index是否上阵 */
    public IsEmBattlePetIndex(index: number) {
        return this.pet_all_info.fightPetIndex.indexOf(index) > -1
    }

    /**觉醒的配置 */
    public GetPetAdvenceCfg(pet_id: number, pet_order: number) {
        return this.GetAdvenceCfg()[pet_id][pet_order - 1];
    }

    /**宠物总属性 */
    public GetPetAttrList(pet_index: number) {
        let list = [];
        let pet = this.GetPetInfo(pet_index);
        if (pet)
            for (let i = 1; i < pet.attrList.length; i++) {
                list.push({ attrType: i, attrValue: pet.attrList[i] });
            }
        return list;
    }

    /**宠物放生返还 */
    public GetPetReturn() {
        let pet = this.GetPetInfo(this.CurShowPetIndex);
        let list: CfgItem[] = [];
        if (pet) {
            let cfg = this.GetPetCfg(pet.petId);
            let cfg_ups = this.GetPetUpCfg()[cfg.pet_type];
            let cfg_up = cfg_ups[pet.petLevel - 1]
            if (cfg_up) {
                list = cfg_up.abandon;
            }
        }
        return list;
    }

    /**宠物技能信息 */
    public SetPetSkillData(pet: IPB_SCRolePetData) {
        let skill_list: { cfg: CfgPetSkill, is_lock: number, is_effect: boolean, state:PetSkillCellState, index:number }[] = [];
        let pet_cfg = PetData.Inst().GetPetCfg(pet.petId);
        let lock_flag = pet.skillLockFlag.toString(2).split("").reverse().map(Number);
        let lock_num = 0;
        let cur_pet_skill_info = this.cur_pet_skill_info;
        let unlock = true;
        for (let i = 0; i < pet_cfg.skill_grid_max; i++) {
            let skill_id = pet.skillList[i] ?? -1;
            let state;
            if(skill_id > 0){
                state = PetSkillCellState.Show;
            }else if(skill_id == 0){
                state = PetSkillCellState.Study;
            }else if(unlock){
                state = PetSkillCellState.Unlock;
                unlock = false;
            }else{
                state = PetSkillCellState.Lock;
            }
            if(skill_id > 0){
                let cfg = PetData.Inst().GetPetSkillCfg()[skill_id];
                let is_lock = lock_flag[i] ?? 0;
                let is_effect = false;
                if (cfg != null && cur_pet_skill_info && cur_pet_skill_info.pet_index == pet.petIndex) {
                    if (cur_pet_skill_info.skill_list[i].is_lock != is_lock)
                        is_effect = true;
                    if (!cur_pet_skill_info.skill_list[i].cfg || cur_pet_skill_info.skill_list[i].cfg.skill_id != cfg.skill_id)
                        is_effect = true;
                }
                skill_list.push({ cfg: cfg, is_lock: is_lock, is_effect: is_effect, state:state, index:i});
                is_lock == 1 && (lock_num += 1);
            }else{
                skill_list.push({ cfg: null, is_lock: 0, is_effect: false, state: state, index:i})
            }  
        }
        this.cur_pet_skill_info = { pet_index: pet.petIndex, lock_num: lock_num, skill_list: skill_list };
        return this.cur_pet_skill_info;
    }

    GetSkillCellUnlockCfg(seq:number){
        return CfgPetData.kaigezi_rate[seq];
    }

    //是否有技能位置
    public IsSkillCellUnlock(pet: IPB_SCRolePetData):boolean{
        if(pet && pet.skillList){
            let pet_cfg = PetData.Inst().GetPetCfg(pet.petId);
            for(let i = 0; i < pet_cfg.skill_grid_max; ++i){
                let skill_id = pet.skillList[i] ?? -1;
                if(skill_id == 0){
                    return true;
                }
            }
            if(pet.skillList.length >= pet_cfg.skill_grid_max){
                return true;
            }
        }
        return false
    }

    public ChangeSkillFlag() {
        if (this.cur_pet_skill_info) {
            let flag = "";
            for (let i = this.cur_pet_skill_info.skill_list.length - 1; i >= 0; i--) {
                flag += this.cur_pet_skill_info.skill_list[i].is_lock;
            }
            let lock_flag = parseInt(flag, 2);
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SKILL_LOCK, this.cur_pet_skill_info.pet_index, lock_flag);
        }
    }

    public GetSkillPetIndex(){
        return this.cur_pet_skill_info.pet_index;
    }

    public IsCanLock() {
        if (this.cur_pet_skill_info) {
            return this.cur_pet_skill_info.lock_num < CfgPetData.other[0].lock_skill_num;
        }
    }

    //宠物技能
    public getPetSkillConfig(skill_id:number) {
        return CfgPetData.pet_skill.find(cfg => {
            return cfg.skill_id == skill_id;
        });
    }

    /**宠物技能书列表 */
    public GetSkillBookList(ex_skill: number[]) {
        let ex_list: { [skill_id: number]: number } = {};
        if (ex_skill) {
            for (let i = 0; i < ex_skill.length; i++) {
                ex_list[ex_skill[i]] = 1;
            }
        }
        let list: { [sjill_page: number]: { cfg: CfgPetSkill, is_studyed: boolean }[] } = {};
        let cfgs = CfgPetData.pet_skill;
        for (let i = 0; i < cfgs.length; i++) {
            let cfg = cfgs[i];
            if (!list[cfg.skill_page])
                list[cfg.skill_page] = [];
            let num = Item.GetNum(cfg.skill_item_id);
            if (num > 0) {
                list[cfg.skill_page].push({ cfg: cfg, is_studyed: ex_list[cfg.skill_id] == 1 });
            }
        }
        return list;
    }

    /****************宠物宝石*******************/
    public GetPetGemCfg() {
        if (!this.pet_gem_cfg) {
            this.pet_gem_cfg = CfgHelper.reSetdatas(CfgPetData.pet_gem, ["gem_id"], false);
        }
        return this.pet_gem_cfg;
    }

    /**宠物身上的普通宝石信息 */
    public GetPetGemList() {
        let pet: IPB_SCRolePetData = this.GetPetInfo(this.cur_show_pet_index);
        let list: { gem_data: PetGemData, pos: number }[] = [];
        if (pet) {
            for (let i = 0; i < pet.gemItemId.length; i++) {
                let cfg = this.GetPetGemCfg()[pet.gemItemId[i]];
                list.push({ gem_data: new PetGemData(pet.gemItemId[i], cfg ? cfg.level : 0, this.cur_show_pet_index), pos: i });
            }
        }
        return list;
    }

    /**宠物身上的特殊宝石信息 */
    public GetPetTsGemList() {
        let pet: IPB_SCRolePetData = this.GetPetInfo(this.cur_show_pet_index);
        let list: { gem_data: PetGemData, pos: number }[] = [];
        if (pet) {
            for (let i = 0; i < pet.tsGemIndex.length; i++) {
                let gem_data = this.GetGemInfo(pet.tsGemIndex[i]);
                list.push({
                    gem_data: new PetGemData(gem_data ? this.GetTsGemId() : 0, gem_data ? gem_data.gemLevel : 0,
                        this.cur_show_pet_index, gem_data ? gem_data.gemIndex : 0), pos: i + 4
                });
            }
        }
        return list;
    }

    /**特殊宝石id */
    public GetTsGemId() {
        return CfgPetData.other[0].ts_gem_id;
    }

    /**获取玩家可穿戴的最高等级宝石 */
    public GetMaxGemByType(pos: number) {
        let gem_info: PetGemData;
        let level = 0;
        let gem: number = -1;
        if (pos <= 3) {
            let cfgs = CfgPetData.pet_gem;
            for (let i = 0; i < cfgs.length; i++) {
                if (cfgs[i].gem_type == pos) {
                    if (cfgs[i].level > level) {
                        let num = Item.GetNum(cfgs[i].gem_id);
                        if (num > 0) {
                            level = cfgs[i].level;
                            gem = cfgs[i].gem_id;
                        }
                    }
                }
            }
        } else {//特殊宝石
            let all_data = this.ts_gem_bag_info;
            for (let index in all_data) {
                let gem_data = all_data[index];
                if (gem_data.petIndex == 0 && gem_data.gemLevel > level) {
                    level = gem_data.gemLevel;
                    gem = gem_data.gemIndex;
                }
            }
        }
        if (gem != -1) {
            gem_info = new PetGemData(pos <= 3 ? gem : this.GetTsGemId(), level, 0, pos <= 3 ? 0 : gem);
        }
        return gem_info;
    }

    public GetGemCfgByLevel() {
        if (!this.pet_gem_cfg_level) {
            this.pet_gem_cfg_level = {}
            let cfgs = CfgPetData.pet_gem;
            for (let i = 0; i < cfgs.length; i++) {
                if (!this.pet_gem_cfg_level[cfgs[i].gem_type])
                    this.pet_gem_cfg_level[cfgs[i].gem_type] = [];
                this.pet_gem_cfg_level[cfgs[i].gem_type][cfgs[i].level] = cfgs[i];
            }
        }
        return this.pet_gem_cfg_level;
    }

    /**宝石升一级 */
    public DoGemUpOne(gem_data: PetGemData) {
        let is_ts = gem_data.item_id == this.GetTsGemId();
        if (!is_ts) {
            let gem_type = this.GetPetGemCfg()[gem_data.item_id].gem_type;
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.OK_GEM_LEVEL_UP_PET, gem_data.pet_index, gem_type);
        } else {
            PetCtrl.Inst().SendPetReq(PET_OP_TYPE.OK_TS_GEM_LEVEL_UP, gem_data.bag_index);
        }
    }

    /**宝石是否能升一级 */
    public CheckGemUpOne(gem_data: PetGemData) {
        if (!gem_data.item_id)
            return false;
        let is_ts = gem_data.item_id == this.GetTsGemId();
        let level = gem_data.level;
        let gem_num: { [level: number]: number } = {};
        let cfg_gem: { [level: number]: CfgPetGem } = {};
        if (is_ts) {
            let all_data = this.ts_gem_bag_info;
            for (let index in all_data) {
                let gem_info = all_data[index];
                if (gem_info.gemIndex == gem_data.bag_index)
                    continue;
                if (gem_info.petIndex == 0) {
                    if (!gem_num[gem_info.gemLevel])
                        gem_num[gem_info.gemLevel] = 0;
                    gem_num[gem_info.gemLevel] += 1;
                }
            }
        } else {
            let cfgs = this.GetPetGemCfg();
            let type = cfgs[gem_data.item_id].gem_type;
            for (let i in cfgs) {
                if (cfgs[i].gem_type == type) {
                    let num = Item.GetNum(cfgs[i].gem_id);
                    gem_num[cfgs[i].level] = num;
                    // if (gem_data.pet_index == 0 && cfgs[i].gem_id == gem_data.item_id)
                    //     num -= 1;
                    cfg_gem[cfgs[i].level] = cfgs[i];
                }
            }
        }

        /**升级消耗的宝石等级 */
        let func_costlevel = (level: number) => {
            let up_need_same_class;
            if (is_ts)
                up_need_same_class = CfgPetData.pet_ts_gem[level - 1].up_need_same_class;
            else
                up_need_same_class = cfg_gem[level].up_need_same_class;
            return up_need_same_class;
        }

        /**检查是否有足够的的宝石升级 */
        let func_check = (gem_num: { [level: number]: number }, target_level: number) => {
            if (gem_num[target_level] >= 1) {
                gem_num[target_level] -= 1;
                return true;
            }
            let level = target_level - 1;//宝石材料本体等级
            if (level <= 0)
                return;
            let up_need_same_class = func_costlevel(level);//宝石材料升级所需要的宝石等级
            if (func_check(gem_num, level) && func_check(gem_num, up_need_same_class))
                return true;
            else
                return false;
        }

        let up_need_same_class = func_costlevel(level);
        return func_check(gem_num, up_need_same_class);
    }


    /**镶嵌宝石 */
    public SetGem(pos: number, data: PetGemData) {
        let pet = this.GetPetInfo(this.cur_show_pet_index);
        if (pet) {
            let cur_data: PetGemData;
            let op_type: PET_OP_TYPE;
            let is_change = false;
            let is_ts = data.item_id == this.GetTsGemId();
            if (is_ts) {
                pos = pos - 4;
                is_change = pet.tsGemIndex[pos] != 0;
                let gem_info = this.GetGemInfo(pet.tsGemIndex[pos]);
                if (is_change && gem_info)
                    cur_data = new PetGemData(this.GetTsGemId(), gem_info.gemLevel);
                op_type = PET_OP_TYPE.INLAY_TS_GEM;
            } else {
                op_type = PET_OP_TYPE.INLAY_GEM;
                pos = this.GetPetGemCfg()[data.item_id].gem_type;
                if (pet.gemItemId[pos] != 0) {
                    is_change = true;
                    cur_data = new PetGemData(pet.gemItemId[pos], this.GetPetGemCfg()[pet.gemItemId[pos]].level);
                }
            }
            let change_fun = () => {
                let gem_info = is_ts ? data.bag_index : data.item_id;
                PetCtrl.Inst().SendPetReq(op_type, this.cur_show_pet_index, pos, gem_info);
                AudioManager.Inst().Play(AudioTag.JiHuo);
                if (ViewManager.Inst().IsOpen(PetGemStoreView))
                    ViewManager.Inst().CloseView(PetGemStoreView);
            }
            if (!is_change) {
                change_fun();
            } else {
                ViewManager.Inst().OpenView(PetGemReplaceView, { cur_data: cur_data, change_data: data, call_back: change_fun })
            }
        }
    }

    /**所有普通宝石信息 */
    public GetAllGem() {
        let cfgs = CfgPetData.pet_gem;
        let list: PetGemData[] = [];
        for (let i = 0; i < this.PetAllInfo.petList.length; i++) {
            let pet_info = this.PetAllInfo.petList[i];
            for (let pos = 0; pos < pet_info.gemItemId.length; pos++) {
                let id = pet_info.gemItemId[pos];
                if (id != 0) {
                    let level = this.GetPetGemCfg()[id].level;
                    list.push(new PetGemData(id, level, pet_info.petIndex, list.length));
                }
            }
        }
        for (let i = 0; i < cfgs.length; i++) {
            let num = Item.GetNum(cfgs[i].gem_id);
            for (let j = 0; j < num; j++) {
                list.push(new PetGemData(cfgs[i].gem_id, cfgs[i].level, 0, list.length));
            }
        }
        return list;
    }

    /**所有特殊宝石信息 */
    public GetAllTsGem() {
        let list: PetGemData[] = [];
        for (let index in this.ts_gem_bag_info) {
            list.push(new PetGemData(this.GetTsGemId(), this.ts_gem_bag_info[index].gemLevel, this.ts_gem_bag_info[index].petIndex, +index));
        }
        return list;
    }

    /**所有宝石信息 */
    public GetAllGemInfo() {
        let gem_list = this.GetAllGem();
        let ts_gem_list = this.GetAllTsGem();
        let all_list = ts_gem_list.concat(gem_list);
        return all_list;
    }

    public SortGem(a: PetGemData, b: PetGemData) {
        // let a_wear = a.pet_index > 0;
        // let b_wear = b.pet_index > 0;
        let a_ts = a.item_id == this.GetTsGemId();
        let b_ts = b.item_id == this.GetTsGemId();
        if (a_ts == b_ts) {
            let a_color = Item.GetColor(a.item_id);
            let b_color = Item.GetColor(b.item_id);
            if (a_color == b_color) {
                return +b.level - +a.level;
            } else {
                return +b_color - +a_color;
            }
        } else {
            return +b_ts - +a_ts;
        }
        // if (a_ts == b_ts)
        //     if (a_wear == b_wear)
        //         return a.level - b.level;
        //     else
        //         return +b_wear - +a_wear;
        // else
        //     return +b_ts - +a_ts;
    }

    /**可升级宝石列表 去掉最高等级宝石 */
    public GetUpLevelGemList() {
        let cfgs = CfgPetData.pet_gem;
        let list: PetGemData[] = [];
        for (let index in this.ts_gem_bag_info) {
            let gem_info = this.ts_gem_bag_info[index];
            if (CfgPetData.pet_ts_gem[gem_info.gemLevel])
                list.push(new PetGemData(this.GetTsGemId(), gem_info.gemLevel, gem_info.petIndex, +index));
        }
        for (let i = 0; i < this.PetAllInfo.petList.length; i++) {
            let pet_info = this.PetAllInfo.petList[i];
            for (let pos = 0; pos < pet_info.gemItemId.length; pos++) {
                let id = pet_info.gemItemId[pos];
                if (id != 0) {
                    let cfg = this.GetPetGemCfg()[id]
                    let level = cfg.level;
                    if (this.GetGemCfgByLevel()[cfg.gem_type][level + 1])
                        list.push(new PetGemData(id, level, pet_info.petIndex, list.length));
                }
            }
        }
        for (let i = 0; i < cfgs.length; i++) {
            let num = Item.GetNum(cfgs[i].gem_id);
            if (this.GetGemCfgByLevel()[cfgs[i].gem_type][cfgs[i].level + 1])
                for (let j = 0; j < num; j++)
                    list.push(new PetGemData(cfgs[i].gem_id, cfgs[i].level, 0, list.length));
        }
        return list;
    }

    /**宝石洗练信息 记录flag */
    public pet_gem_wash_data: { gem_index: number, atttr_data: { type: number, value: number, flag: number, index: number }[], lock_num: number, level: number };
    public SetPetGemWahInfo(gem_index: number) {
        let pet_gem_wash_data: { gem_index: number, atttr_data: { type: number, value: number, flag: number, index: number }[], lock_num: number, level: number };
        pet_gem_wash_data = { gem_index: gem_index, atttr_data: [], lock_num: 0, level: 0 };
        let gem_data = this.GetGemInfo(gem_index);
        if (gem_data) {
            pet_gem_wash_data.level = gem_data.gemLevel;
            let lock_num = 0;
            for (let i = 0; i < gem_data.attrType.length; i++) {
                let flag = 0;
                if (this.pet_gem_wash_data && this.pet_gem_wash_data.gem_index == gem_index && this.pet_gem_wash_data.atttr_data[i]) {
                    flag = this.pet_gem_wash_data.atttr_data[i].flag;
                }
                lock_num += flag;
                pet_gem_wash_data.atttr_data.push({ type: gem_data.attrType[i], value: gem_data.attrValue[i], flag: flag, index: i });
            }
            pet_gem_wash_data.lock_num = lock_num;
        }
        this.pet_gem_wash_data = pet_gem_wash_data;
        return this.pet_gem_wash_data;
    }

    /**宝石洗练信息 修改flag */
    public changeWashFlag(index: number) {
        if (this.pet_gem_wash_data) {
            let flag = Math.abs(this.pet_gem_wash_data.atttr_data[index].flag - 1);
            this.pet_gem_wash_data.atttr_data[index].flag = flag;
            this.pet_gem_wash_data.lock_num = this.pet_gem_wash_data.lock_num + (flag == 0 ? -1 : 1);
            this.ResultData.is_gem_wash_flag_change = !this.ResultData.is_gem_wash_flag_change;
        }
    }

    public getGemUpInfo(index: number) {
        return this.cur_gem_up_data[index];
    }

    /**洗练锁属性消耗 */
    public GetWashLockCost(lock_num: number) {
        if (lock_num > CfgPetData.pet_gem_use.length - 1) {
            lock_num = CfgPetData.pet_gem_use.length - 1;
        }
        return CfgPetData.pet_gem_use[lock_num];
    }

    /**获取玩家可穿戴的某种类型宝石列表 */
    public GetGemByType(pet_gem_data: PetGemData, pos: number) {
        let list: PetGemData[] = [];
        let GetGemCommon = (pos: number) => {
            let list_common: PetGemData[] = [];
            let cfgs = CfgPetData.pet_gem;
            for (let i = 0; i < cfgs.length; i++) {
                if (cfgs[i].gem_type == pos || pos == -1) {
                    let num = Item.GetNum(cfgs[i].gem_id);
                    let data: PetGemData = new PetGemData(cfgs[i].gem_id, cfgs[i].level);
                    if (pet_gem_data.item_id == data.item_id) {
                        num -= 1;
                    }
                    for (let j = 0; j < num; j++) {
                        list_common.push(data);
                    }
                }
            }
            return list_common;
        }
        let GetGemTs = () => {
            let list_ts: PetGemData[] = [];
            let all_data = this.ts_gem_bag_info;
            for (let index in all_data) {
                let gem_data = all_data[index];
                if (gem_data.petIndex == 0) {
                    let data: PetGemData = new PetGemData(this.GetTsGemId(), gem_data.gemLevel, 0, gem_data.gemIndex);
                    list_ts.push(data);
                }
            }
            return list_ts;
        }
        if (pos == -1) {
            list = GetGemCommon(pos);
            list = list.concat(GetGemTs());
        } else if (pos <= 3) {
            list = GetGemCommon(pos);
        } else {
            list = GetGemTs();
        }
        return list;
    }

    /************** 宠物出战 *********************/
    /**出战宠物的属性列表 */
    public GetEmbattlePetAttr() {
        let list;
        if (this.pet_all_info) {
            let index = this.pet_all_info.fightPetIndex.find(index => index > 0)
            let pet_info = this.GetPetInfo(index);
            list = pet_info.attrList;
        }
        return list;
    }

    /**是否有出战宠物 */
    public IsPetEmbattle() {
        if (this.pet_all_info) {
            return this.pet_all_info.fightPetIndex.some(index => index > 0);
        }
        return false;
    }

    /**宠物技能图鉴数据 */
    public GetSkillMapData() {
        let active_flag: { [skill_id: number]: number } = {};
        let all_pet_info = this.pet_bag_info
        for (let key in all_pet_info) {
            let pet_info = all_pet_info[key];
            let skill_info = pet_info.skillList;
            for (let i = 0; i < skill_info.length; i++) {
                let skill_id = skill_info[i];
                active_flag[skill_id] = 1;
            }
        }
        let cfgs = CfgPetData.pet_skill;
        let skill_map_data: { [page: number]: { cfg: CfgPetSkill, is_active: number }[] } = {}
        for (let i = 0; i < cfgs.length; i++) {
            let cfg = cfgs[i];
            let page = cfg.skill_page;
            let skill_id = cfg.skill_id;
            if (!skill_map_data[page]) skill_map_data[page] = [];
            skill_map_data[page].push({ cfg: cfg, is_active: active_flag[skill_id] });
        }
        return skill_map_data;
    }

    /**宠物镶嵌宝石总等级 */
    public GetAllPetGemLevel() {
        let level = 0;
        for (let index in this.pet_bag_info) {
            let pet_info = this.pet_bag_info[index];
            for (let pos = 0; pos < pet_info.gemItemId.length; pos++) {
                let id = pet_info.gemItemId[pos];
                if (id != 0) {
                    level += this.GetPetGemCfg()[id].level;
                }
            }
            for (let pos = 0; pos < pet_info.tsGemIndex.length; pos++) {
                let gem_index = pet_info.tsGemIndex[pos];
                let gem_data = this.GetGemInfo(gem_index);
                if (gem_data) {
                    level += gem_data.gemLevel;
                }
            }
        }
        return level;
    }

    /**单个宠物宝石升级红点 */
    public GetPetGemUpRed(pet_index: number) {
        let pet_info = this.GetPetInfo(pet_index);
        if (pet_info)
            for (let i = 0; i <= 5; i++) {
                let is_ts = i > 3;
                let gem_info = is_ts ? pet_info.tsGemIndex[i - 4] :
                    pet_info.gemItemId[i];
                if (gem_info != 0) {
                    let gem: PetGemData
                    if (is_ts) {
                        let gem_data = this.GetGemInfo(gem_info);
                        if (gem_data)
                            gem = new PetGemData(
                                this.GetTsGemId(),
                                gem_data.gemLevel,
                                pet_info.petIndex,
                                gem_data.gemIndex
                            )
                    } else {
                        let cfg = this.GetPetGemCfg()[gem_info];
                        gem = new PetGemData(
                            gem_info,
                            cfg.level,
                            pet_info.petIndex
                        )
                    }
                    if (gem && this.CheckGemUpOne(gem)) {
                        return 1;
                    }
                }
            }
        return 0;
    }

    /**宠物宝石镶嵌红点 */
    public GetGemRedByPos(pos: number) {
        if (pos <= 3) {
            let cfgs = CfgPetData.pet_gem;
            for (let i = 0; i < cfgs.length; i++) {
                if (cfgs[i].gem_type == pos) {
                    let num = Item.GetNum(cfgs[i].gem_id);
                    if (num > 0)
                        return 1;
                }
            }
        } else {
            let all_data = this.ts_gem_bag_info;
            for (let index in all_data) {
                let gem_data = all_data[index];
                if (gem_data.petIndex == 0) {
                    return 1;
                }
            }
        }
        return 0;
    }

    public GetPetGemRed(pet_index: number) {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Pet.PetGem);
        if (!open_t.is_open) {
            return 0;
        }
        let pet_info = this.GetPetInfo(pet_index);
        if (pet_info) {
            if (this.GetPetGemUpRed(pet_info.petIndex) == 1)
                return 1;
            for (let i = 0; i <= 5; i++) {
                let is_ts = i > 3;
                let gem_info = is_ts ? pet_info.tsGemIndex[i - 4] :
                    pet_info.gemItemId[i];
                if (gem_info == 0 && this.GetGemRedByPos(i) == 1) {
                    return 1;
                }
            }
        }
        return 0;
    }

    /**宠物宝石红点 */
    public GetGemRed() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Pet.View);
        if (!open_t.is_open) {
            return 0;
        }
        /**宠物宝石 */
        if (this.pet_all_info && this.pet_all_info.petList.length > 0) {
            for (let index = 0; index < this.pet_all_info.petList.length; index++) {
                let pet_info = this.pet_all_info.petList[index]
                if (this.GetPetGemRed(pet_info.petIndex) == 1)
                    return 1;
            }
        }
        return 0;
    }

    /**
     * 根据属性类型和属性值来获取品质区间的颜色
     * @param type 属性类型
     * @param value 值
     */
    public GetGemQualityByTypeAndValue(type: number, value: number) {
        let data = CfgPetData.add_min_max;
        let quality_A;//白色 品质A
        let quality_B;//白色 品质B
        let quality_C;//白色 品质C
        let quality_D;//白色 品质D
        let quality_E;//白色 品质E
        for (let i = 0; i < data.length; i++) {
            if (type == data[i].add_type) {
                quality_A = data[i].range_a[0];
                quality_B = data[i].range_b[0];
                quality_C = data[i].range_c[0];
                quality_D = data[i].range_d[0];
                quality_E = data[i].range_e[0];
                break;
            }
        }
        if (quality_A) {
            if (value >= +quality_A.type && value < +quality_A.add) {
                return COLORS.White;
            } else if (value >= +quality_B.type && value < +quality_B.add) {
                return COLORS.Green4;
            } else if (value >= +quality_C.type && value < +quality_C.add) {
                return COLORS.Blue4;
            } else if (value >= +quality_D.type && value < +quality_D.add) {
                return COLORS.Purple3;
            } else if (value >= +quality_E.type && value <= +quality_E.add) {
                return COLORS.Yellow9;
            }
        }
    }

    public RecvPetEvoAttr(data: PB_SCPetSendEvoAttr) {
        let info = {
            pet_index: data.petIndex,
            attr_list: data.attrList,
        }
        this.evol_attr = info
        this.result_data.flush_evol_attr = this.result_data.flush_evol_attr + 1
    }

    public GetNextAttrForEvol(petIndex: number, nextpetId: number, nextLevel: number) {
        let cur_pet_data = this.GetPetInfo(petIndex);
        let pet_attr = PetData.Inst().GetPetBaseAttrDesc(cur_pet_data)
        let curAttr = PetData.Inst().GetPetAttr(cur_pet_data.petLevel, cur_pet_data.petId);

        let nextAtt = PetData.Inst().GetPetAttr(nextLevel, nextpetId);


        let next_pet_cfg = PetData.Inst().GetPetCfg(nextpetId);
        let next_base_attr: { [type: number]: number } = {};
        for (let i = 0; i < next_pet_cfg.pet_att.length; i++) {
            next_base_attr[next_pet_cfg.pet_att[i].type] = next_pet_cfg.pet_att[i].add;
        }

        let check_net = this.evol_attr != null && petIndex == this.evol_attr.pet_index

        let attr_list = []
        for (var index in pet_attr) {
            let info = {
                type: pet_attr[index].type,
                next_add: 0,
            }

            if (check_net) {
                for (var check in this.evol_attr.attr_list) {
                    if (info.type == (Number(check) + 1)) {
                        info.next_add = this.evol_attr.attr_list[check]
                    }
                }
            }
            else {
                // 减去原本的等级的成长值
                for (var check in curAttr) {
                    if (curAttr[check].type == info.type) {
                        info.next_add = pet_attr[index].grow_num + next_base_attr[pet_attr[index].type] - curAttr[check].add
                    }
                }

                // 加上现在的等级的成长值
                for (var check in nextAtt) {
                    if (nextAtt[check].type == info.type) {
                        info.next_add = info.next_add + nextAtt[check].add
                    }
                }
            }

            attr_list.push(info)
        }
        return attr_list
    }

    public GetEvolCfg(pet_id: number) {
        for (var index in CfgPetData.pet_evo) {
            if (CfgPetData.pet_evo[index].pet_type == pet_id) {
                return CfgPetData.pet_evo[index]
            }
        }

        return null
    }
    public GetEvolMaxCfg() {
        return CfgPetData.pet_evo[CfgPetData.pet_evo.length - 1]
    }


    public GetEvolDetail(pet_index: number) {
        let attr_list: { type: string, add: number, next_add: number }[] = []
        let up_data = {
            item_id: 0,
            num: 0,
        }
        let result = {
            attr_list: attr_list,
            name: "",
            next_name: "",
            pet_res: "",
            next_pet_res: "",
            up_data: up_data
        }

        let pet_data = this.GetPetInfo(pet_index);
        let pet_evol_cfg = this.GetEvolCfg(pet_data.petId);

        if (pet_evol_cfg == null) { return result }

        let pet_attr = PetData.Inst().GetPetBaseAttrDesc(pet_data)
        let cfg = PetData.Inst().GetPetCfg(pet_data.petId);
        let next_pet_cfg = PetData.Inst().GetPetCfg(pet_evol_cfg.pet_type_after);
        let next_base_attr: { [type: number]: number } = {};
        for (let i = 0; i < next_pet_cfg.pet_att.length; i++) {
            next_base_attr[next_pet_cfg.pet_att[i].type] = next_pet_cfg.pet_att[i].add;
        }


        result.name = TextHelper.ColorStr(cfg.pet_name.toString(), COLORSTR.Blue4) + " " + TextHelper.ColorStr(pet_data.petLevel + Language.Mount.LevelTitle, COLORSTR.Yellow9)

        let next_level = pet_data.petLevel + CfgPetData.other[0].pet_evo_level_up
        if (next_level > CfgPetData.other[0].pet_level_max) { next_level = CfgPetData.other[0].pet_level_max }
        result.next_name = TextHelper.ColorStr(next_pet_cfg.pet_name.toString(), COLORSTR.Blue4) + " " + TextHelper.ColorStr((next_level) + Language.Mount.LevelTitle, COLORSTR.Yellow9)

        let next_attr = this.GetNextAttrForEvol(pet_index, pet_evol_cfg.pet_type_after, next_level)
        for (var index in pet_attr) {
            let info = {
                type: AttrListName[pet_attr[index].type],
                add: pet_attr[index].base_num + pet_attr[index].grow_num,
                next_add: 0//next_base_attr[pet_attr[index].type]
            }

            for (var check in next_attr) {
                if (next_attr[check].type == pet_attr[index].type) {
                    info.next_add = info.next_add + next_attr[check].next_add
                }
            }

            attr_list.push(info)
        }

        result.attr_list = attr_list

        up_data.item_id = pet_evol_cfg.evo_item_id
        up_data.num = pet_evol_cfg.item_id_num
        result.up_data = up_data
        result.pet_res = cfg.pet_res.toString()
        result.next_pet_res = next_pet_cfg.pet_res.toString()

        return result
    }

    public GetEvolRed() {
        let pet_list = PetData.Inst().getAllPet();

        for (var index in pet_list) {
            let num = this.CheckIsEvolRed(pet_list[index].petId, pet_list[index].petLevel)
            if (num > 0) {
                return 1
            }
        }

        return 0
    }

    public CheckIsEvolRed(pet_id: number, pet_level: number) {
        let pet_evol_cfg = this.GetEvolCfg(pet_id)
        if (pet_evol_cfg == null) {
            return 0
        }

        let num = Item.GetNum(pet_evol_cfg.evo_item_id)
        if (pet_evol_cfg.item_id_num <= num && pet_level >= CfgPetData.other[0].pet_evo_level) {
            return 1
        }
        else {
            return 0
        }
    }
}



export class PetGemData {
    item_id: number;
    level: number;
    pet_index: number;
    bag_index?: number;
    constructor(item_id: number, level: number, pet_index: number = 0, bag_index: number = 0) {
        this.item_id = item_id;
        this.level = level;
        this.pet_index = pet_index;
        this.bag_index = bag_index;
    }
}

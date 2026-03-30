import { CfgPetWeapon } from "config/CfgPetWeapon";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { smartdata, CreateSMD } from "data/SmartData";
import { Item } from "modules/bag/ItemData";
import { AttrListName, Language } from "modules/common/Language";
import { InscriptionData } from "modules/inscription/InscriptionData";
import { AttrHelper } from "../../helpers/AttrHelper";


class PetRelicsInfo {
    @smartdata
    need_flush: number;
}

export class PetRelicsData extends DataBase {
    public flush_info: PetRelicsInfo
    private relics_list:any
    private oper_cloth:number
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(PetRelicsInfo);
        this.flush_info.need_flush = 0
    }

    public GetRedNum()
    {
       
        return 0
    }

    public SetPetRelicsInfo(data:PB_SCPetRemainsList)
    {
        if(data.sendType == 0)
        {
            this.relics_list = data.remainsList
        }
        else if(data.sendType == 1)
        {
            this.relics_list[data.remainsList[0].index] = data.remainsList[0]
        }
    }

    public CheckEmpty()
    {
        return this.relics_list == undefined
    }

    public GetCfgPetWeapon(seq:number)
    {
        let cfg = CfgPetWeapon.pet_weapon_cfg
        for(var i in cfg)
        {
            if(seq == cfg[i].seq)
            {
                return cfg[i]
            }
        }
    }

    public GetCfgPetWeaponLevel(quality:number,levels:number)
    {
        let cfg = CfgPetWeapon.pet_weapon_level
        for(var i in cfg)
        {
            if(quality == cfg[i].quality && levels == cfg[i].levels)
            {
                return cfg[i]
            }
        }
    }

    public GetCfgPetWeaponAttr(seq:number,levels:number)
    {
        let cfg = CfgPetWeapon.pet_weapon_attribute
        for(var i in cfg)
        {
            if(seq == cfg[i].seq && levels == cfg[i].levels)
            {
                return cfg[i]
            }
        }
    }

    public GetCfgPetWeaponStage(seq:number,steps:number)
    {
        let cfg = CfgPetWeapon.pet_weapon_stage
        for(var i in cfg)
        {
            if(seq == cfg[i].seq && steps == cfg[i].steps)
            {
                return cfg[i]
            }
        }
    }

    // 取的是背包位置
    public GetPetRelicsDetail(index:number)
    {
        if(this.CheckEmpty()){ return }
        let oper = this.relics_list[index]
        let cfg = this.GetCfgPetWeapon(oper.seq)
        let item_cfg = Item.GetConfig(cfg.pet_weapon_item)

        // add 是当前，change是上一级
        let attrs:{type:number,add:number,change:number}[] = []
        // 直接取当前属性 和 上一级的属性
        let level_cfg = this.GetCfgPetWeaponLevel(cfg.quality,oper.level)
        let level_attr_cfg = this.GetCfgPetWeaponAttr(oper.seq,oper.level)

        let is_init = oper.level == 1
        for(var i in cfg.pet_att){
            let info = {
                type:cfg.pet_att[i].type,
                add:cfg.pet_att[i].add,
                change:cfg.pet_att[i].change,
            }
            attrs.push(info)
        }

        for(var i in level_attr_cfg.up_att)
        {
            for(var j in attrs)
            {
                if(attrs[j].type == level_attr_cfg.up_att[j].type)
                {
                    attrs[j].add = level_attr_cfg.up_att[j].add + attrs[j].add
                    if(is_init)
                    {
                        attrs[j].change = level_attr_cfg.up_att[j].add + attrs[j].change
                    }
                }
            }
        }

        if(!is_init){
            let level_cfg = this.GetCfgPetWeaponLevel(cfg.quality,oper.level-1)
            for (var i in level_attr_cfg.up_att) {
                for (var j in attrs) {
                    if (attrs[j].type == level_attr_cfg.up_att[j].type) {
                        attrs[j].change = level_attr_cfg.up_att[j].add + attrs[j].change
                    }
                }
            }
        }


        let grade_cfg = this.GetCfgPetWeaponStage(oper.seq,oper.grade+1)
        let info:PetRelicsDetail = {
            seq: oper.seq,
            item_id: item_cfg.id,
            name: cfg.name,
            level: oper.level,
            grade: oper.grade,
            cloth_id: oper.cloth_id,
            index: index,
            quality: cfg.quality,
            exp: oper.exp,
            ex_type: cfg.pet_weapon_type,
            ex_id: cfg.pet_weapon_pet_id,
            for_exp: cfg.levels_1_pet_weapon_exp * oper.level,
            skill_id: grade_cfg.skill_type,
            skill_level: grade_cfg.steps,
            skill_id_param: grade_cfg.skill_id_type,
            model_id: 0,
            attr_show: attrs,
            level_exp: level_cfg.exps,
            level_grade: level_cfg.need_steps,
        }

        return info
    }

    public GetPetRelicsBase(index:number)
    {
        if(this.CheckEmpty()){ return }

        let oper = this.relics_list[index]
        LogError("?jj ",index,oper,this.relics_list)
        let cfg = this.GetCfgPetWeapon(oper.seq)
        let item_cfg = Item.GetConfig(cfg.pet_weapon_item)

        let info:PetRelicsBase = {
            seq: oper.seq,
            item_id: item_cfg.id,
            name: cfg.name,
            level: oper.level,
            grade: oper.grade,
            cloth_id: oper.cloth_id,
            index: index
        }

        return info
    }

    public GetPetRelicsList(type:number)
    {

    }

    public GetMainParam(select:number)
    {
        let result = {
            model_info:{},
            attr_info:{},
        }

        if(this.CheckEmpty()){ return result}

        let detail = select > 0 ? this.GetPetRelicsDetail(select) : null

        let model_info = {
            icon_info:{
                empty_type:0,
                id: detail == null ? 0 : detail.model_id,
                is_empty:detail == null
            },
            level_info:{
                type:0,
                level_show:detail == null ? "" : Language.PetRelics.LevelShow + detail.level,
                grade_show:detail == null ? "" : Language.PetRelics.GradeDShow + detail.grade,
                is_empty:detail == null
            },
            name_info:{
                name:detail == null? Language.PetRelics.EmptyName : detail.name
            },
        }

        result.model_info = model_info
        let attr_list:any = []
        let attr_info = {attr_list:attr_list,skill_desc:""}
        if(detail != null)
        {
            for(var i in detail.attr_show)
            {
                let info = {
                    type:detail.attr_show[i].type,
                    add:detail.attr_show[i].add,
                    change:detail.attr_show[i].change,
                    pre_show:false,
                }
                attr_list.push(info)
            }
            attr_info.attr_list = attr_list

            if(detail.skill_id > 0)
            {
                attr_info.skill_desc = AttrListName[detail.skill_id] + AttrHelper.Percent(detail.skill_id, detail.skill_id_param)
            }
            else
            {
                let cfg = InscriptionData.Inst().GetSkillCfgForTs(detail.skill_id_param,detail.skill_level)
                attr_info.skill_desc = cfg.skill_desc.toString()
            }
        }
        

        result.attr_info = attr_info
        return result
    }

    public GetMainBag()
    {
        let list:PetRelicsBase[] = []
        LogError("?afe",this.relics_list)
        for(var i in this.relics_list)
        {
            let info = this.GetPetRelicsBase(this.relics_list[i].index)
            list.push(info)
        }

        return list
    }

    public GetLevelOperRelics()
    {
        for(var i in this.relics_list)
        {
            if(this.relics_list[i].cloth_id == this.oper_cloth)
            {
                return this.GetPetRelicsDetail(this.relics_list[i].index)
            }
        }

        return null
    }

    public GetLevelBag()
    {
        let list:any[] = []
        for(var i in this.relics_list)
        {
            let info = this.GetPetRelicsBase(this.relics_list[i].index)
            list.push(info)
        }

        return list
    }

    public GetLevelParam()
    {
        let result = {
            model_info:{},
            attr_info:{},
        }
        if(this.CheckEmpty()){ return result }

        return result
    }

    public GetModelLevelParam()
    {
        let result = {
            icon_info:{},
            level_info:{},
            name_info:{},
            pre_prog:{},
            prog:{}
        }
        return result
    }
    public GetGradeParam()
    {
        let result ={
            select_item:{}, 
            stuff_item:{},
            up_text:"",
            level_desc:"",
            skill_desc:"",
        }

        return result
    }
    public GetRelicsSelectList(type:number)
    {
        let list:any[] = []
        return list
    }

    public GetRelicsResultInfo(index:number)
    {
        let attrs:any[] = []
        let result = {
            item_info:{},
            pre_level:0,
            level:0,
            skill_desc:"",
            attrs:attrs,
        }
        return result
    }

    public SetOperCloth(id:number)
    {
        this.oper_cloth = id
    }

    public GetOperCloth()
    {
        return this.oper_cloth
    }
}

// 圣遗物详细信息
export type PetRelicsDetail = {
    seq:number, //配置 协议 seq
    item_id:number, // 配置，圣遗物id
    name:string,
    quality:number, // 品质

    level:number, // 等级
    grade:number, // 精炼等级
    exp:number,   //当前经验值
    cloth_id:number, // 当前穿着位置
    index:number, // 背包位置
    
    ex_type:number, // 是否专属
    ex_id:number, // 专属皮肤id

    for_exp:number, // 作为材料的经验值
    level_exp:number, // 升级所需经验值
    level_grade:number, // 升级所需的阶级

    skill_id:number, // 技能id
    skill_id_param:number, // 技能补充信息
    skill_level:number, // 技能等级

    model_id:number, // 大图资源

    attr_show:{type:number,add:number,change:number}[]
}

// 圣遗物基础信息
export type PetRelicsBase = {
    seq:number, //配置 协议 seq
    item_id:number, // 配置，圣遗物id
    name:string,
    level:number, // 等级
    grade:number, // 精炼等级
    cloth_id:number, // 当前穿着位置
    index:number, // 背包位置
}
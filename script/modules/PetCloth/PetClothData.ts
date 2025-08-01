import { Color } from "cc";
import { CfgPetData } from "config/CfgPet";
import { CfgPetClothData } from "config/CfgPetCloth";
import { DataBase } from "data/DataBase";
import { CreateSMD } from "data/SmartData";
import { Item } from "modules/bag/ItemData";
import { COLORS } from "modules/common/ColorEnum";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { PetData } from "modules/Pet/PetData";

// export class PetClothSmaData{

// }
export class PetClothData extends DataBase{
    //PetClothSmaData: PetClothSmaData;
    public CurSelectIndex = 0;
    public CurQualityIndex = 7;  //7是史诗品质，8传说品质
    //  //皮肤列表
    // private cloth_list_info: { [index: number]: PB_SCRoleClothData } = {};
    // //皮肤升级列表
    // public ClothUpList: { [index: number]: number}  = {};
    // //皮肤穿戴列表
    // public ClothWearList: { [itemId: number]: number}  = {};
    //皮肤穿戴列表
   // public ClothWearList2: Map<number,PB_SCRoleClothData> = new Map();
    constructor(){
        super();
        //this.createSmartData();
    }

    // private createSmartData(){
    //     // let self = this;
    //     this.PetClothSmaData = CreateSMD(PetClothSmaData);
    // }

    // public SetClothListInfo(info :PB_SCRoleClothData){
    //     //console.log("PB_SCRoleClothData",info);
    //     // this.cloth_list_info[info.itemId] = info;
    //     // this.ClothUpList[info.itemId]= info.level;
    //     // this.ClothWearList[info.itemId] = info.petIndex;
    //     this.ClothWearList2.set(info.itemId,info);
    // }
    // public get Getcloth_list_info(){
    //     return this.cloth_list_info;
    // }
    /**
     * 根据皮肤id跟等级获取 皮肤技能表对应数据
     * @param id 皮肤id
     * @param level 皮肤等级
     * @param type 品质
     */
    public GetSkillDataByIdAndLevel(id: number,level: number){
        return CfgPetClothData.pet_skill_level.filter(cfg => {
           return cfg.id == id && cfg.cloth_skill_level == level;
        })
        
    }
    /**
     * 根据技能图标跟等级 获取相应的技能
     * @param iconId 技能图标
     * @param level 等级
     */
    public GetSkillDataBySkillIconAndLevel(iconId: number,level: number){
        for(let i = 0;i<CfgPetClothData.pet_skill_level.length;i++){
            if(CfgPetClothData.pet_skill_level[i].skill_icon == iconId && CfgPetClothData.pet_skill_level[i].cloth_skill_level == level){
                return CfgPetClothData.pet_skill_level[i];
            }
        }
    }
    /**
     * 获取升级消耗本体数量
     * @param id 
     * @param level 
     * @returns 
     */
    public GetUpSkillLevelData(id: number,level: number){
        for(let i = 0;i < CfgPetClothData.pet_cloth_up.length;i++){
            if(CfgPetClothData.pet_cloth_up[i].id == id && CfgPetClothData.pet_cloth_up[i].petcloth_order == level){
                return CfgPetClothData.pet_cloth_up[i].petcloth_count;
            }
        }
        return null;
    }
    //根据id 获取对应皮肤数据
    public GetPetSkillDataById(id: number){
        for(let i = 0;i<CfgPetClothData.all_pet_cloth.length;i++){
            if(id == CfgPetClothData.all_pet_cloth[i].id){
                return CfgPetClothData.all_pet_cloth[i];
            }
        }
        return null;
    }
    //将技能描述 改为富文本格式 使得数值变色   描述文字格式 ： 技能技能技能技能-20%-......  4  
    public GetText(str: string,color:any){
        let TR = [str];
        //let valueArr = str.match(/(\d+.)%/g)
        let valueArr = str.match(/-/g)
        if(valueArr != null){
            for(let i = 0 ;i<valueArr.length;i++){
                if(((i+1) %2) != 0){
                    let cur = TR[i].replace(/-/,"<color=#" + color + ">");
                    TR.push(cur);
                }else{
                    let cur = TR[i].replace(/-/,"</color>");
                    TR.push(cur);
                }
                
             }
        }else{
            // valueArr = str.match(/(\d+)/);
            // if(valueArr != null){
            //     for(let i = 0 ;i<valueArr.length;i++){
            //         let cur = TR[i].replace(/-(\d+)-/,"<color=#" + color + ">"+valueArr[i]+"</color>");
            //         TR.push(cur);
            //      }
            // }else{
                return str;
            // }
            
        }
       // console.log("--TR[TR.length -1]-",TR[TR.length -1]);
        
        return  TR[TR.length -1];
    }
    //根据皮肤品质获取皮肤数组
    public GerAllPetClothData(type: number){
        return CfgPetClothData.all_pet_cloth.filter(v=>{
            return v.color == type;
        });
    }
    
    public GetCfgRes(id: number){
        return  CfgPetClothData.all_pet_cloth[id].res_id;
    }
    

    //获取可激活可升级红点
    public GetRed(id: number,level: number){
        let num = Item.GetNum(id);
        if(this.GetUpSkillLevelData(id,level) == null){
            return 0;
        }
        if(num >= this.GetUpSkillLevelData(id,level)){
            return 1;
        }
        return 0;
    }
    //是否开宠物模块
    public GerAllRed(){
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Pet.View);
        if (open_t.is_open) {
            if (PetData.Inst().IsHavePet()) { 
                let upData = CfgPetClothData.all_pet_cloth;  // 5
                let cloth = PetData.Inst().PetAllInfo.clothList; //3
                let ar:number[] = [];
                if(cloth){ 
                    for(let j = 0;j <cloth.length;j++){//可升级
                        ar.push(cloth[j].itemId);
                        if(this.GetRed(cloth[j].itemId,cloth[j].level+1)){
                            return 1;
                        }
                    }
                    for(let i = 0;i<upData.length;i++){ //可激活
                        if(ar.indexOf(upData[i].id) < 0){
                            if(this.GetRed(upData[i].id,1)){
                                return 1;
                            } 
                        }
                    }

                }else{
                    for(let i = 0;i<upData.length;i++){ //可激活
                        if(this.GetRed(upData[i].id,1)){
                            return 1;
                        } 
                    }
                }
                
                return 0;
            }
        }
    }

    //根据宠物技能id 获取相应皮肤技能特效表数据
    public GetPetClothSkillBySkillId(skill_id: number){
        for(let i = 0;i < CfgPetClothData.pet_cloth_effect.length;i++){
            if(CfgPetClothData.pet_cloth_effect[i].skill_id_type == skill_id){
                return CfgPetClothData.pet_cloth_effect[i];
            }
        }
        return null;
    }

    //根据Boss宠物技能id 获取相应皮肤技能特效表数据
    public GetBossClothSkillBySkillId(skill_id: number){
        for(let i = 0;i < CfgPetClothData.boss_cloth_effect.length;i++){
            if(CfgPetClothData.boss_cloth_effect[i].skill_id_type == skill_id){
                return CfgPetClothData.boss_cloth_effect[i];
            }
        }
        return null;
    }



}

import { CfgEnchantData } from "config/CfgEnchant";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { TabPetSkill } from "modules/Pet/PetSkillSelView";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";

export enum EnchantCost {
    MOFEN = 40900, //墨粉
    FALI = 40901, //法力
    SHENGMING = 40902,//生命
    MOHE = 40903,//魔核

}
export class EnChantResultData {
    @smartdata
    ChantAllInfo: PB_SCEquipFuMoListInfo;
    
    @smartdata
    ChantOneInfo: PB_SCEquipFuMoOneInfo;

    @smartdata
    changeflush :boolean;

    @smartdata
    levelchangeflush :boolean;
}

export class EnChantData extends DataBase {

    public ResultData: EnChantResultData;
    public MaxEnchantLevel = 25;    //附魔最大等级
    public MaxEnchantNum = 3;       //最大附魔装备生效数
    public EnchantData:any;
    public ChangeEqipType = -1;  //变化附魔等级的装备类型

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(EnChantResultData);
    }

    public SetEquipFuMoListInfo(protocol: PB_SCEquipFuMoListInfo) {
        this.ResultData.ChantAllInfo = protocol
        this.EnchantData = protocol.fumoList
    }

    public SetEquipFuMoOneInfo(protocol: PB_SCEquipFuMoOneInfo) {
        this.ResultData.ChantOneInfo = protocol
        // LogError("equipType = "+protocol.equipType)
        for (let i = 0 ; i < this.EnchantData.length ; i ++){
            if ( protocol.equipType == i ){
                if ( this.EnchantData[i].level != protocol.fumoData.level ){
                    // LogError("this.EnchantData[i].level = "+ this.EnchantData[i].level + " + protocol.fumoData.level = "+protocol.fumoData.level)
                    // this.ResultData.levelchangeflush != this.ResultData.levelchangeflush;
                }
                this.EnchantData[i] = protocol.fumoData
                break
            }
        }
        this.ChangeEqipType = protocol.equipType;
        // LogError("---------------------------------------单次变化后总数 = ",this.EnchantData)

    }

    //部位附魔等级
    public GetEquipEnchantLevel(part:number){
        if (this.EnchantData == undefined || this.EnchantData[part] == undefined){
            return {}
        }
        return this.EnchantData[part]
    }

    public GetEquipEnchantLevelData(part:number,level:number){
        return CfgEnchantData.equip_fumo.find(cfg => {
            return cfg.part == part && cfg.fumo_level == level;
        });
    }

    public GetMaxEnchatLevel(part:number){
        return this.MaxEnchantLevel
    }

    public GetEnchantCost(part:number,level:number){
        let cfg : any= this.GetEquipEnchantLevelData(part,level);
        let cost:any[] = [];
        for (let i = 2 ; i <= 4 ; i ++){
            if (cfg["num"+i] != 0){
                cost.push({item : cfg["cost" + i],num : cfg["num" + i]})
            }
        }
        return cost
    }

    public GetHasEnchantNum(){
        let num = 0
        for (let i = 0 ; i < this.EnchantData.length ; i ++){
            if (this.EnchantData[i].endTime != 0 && this.EnchantData[i].endTime > TimeCtrl.Inst().ServerTime){
                num = num + 1
            }
        }
        return num
    }

    public GetChangeData(){
        return CfgEnchantData.change   
    }

    public SetChangeViewFlush(){
        this.ResultData.changeflush = !this.ResultData.changeflush
    }

    public GetChangeCostForOne(seq:number){
        return CfgEnchantData.change.find(cfg => {
            return cfg.seq == seq;
        });
    }

    public GetIsForthEnchant(equip_type : number){
        return this.EnchantData[equip_type].endTime == 0
    }


    public GetShortTime(){
        let time = 0
        if (this.EnchantData && this.EnchantData.length){
            for (let i = 0 ; i < this.EnchantData.length ; i ++){
                if (this.EnchantData[i].endTime != 0 && this.EnchantData[i].endTime > TimeCtrl.Inst().ServerTime){
                    if (time == 0 || this.EnchantData[i].endTime < time){
                        time = this.EnchantData[i].endTime
                    }
                }
            }
        }
        return time - TimeCtrl.Inst().ServerTime
    }
}
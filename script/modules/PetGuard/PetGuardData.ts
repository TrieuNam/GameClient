import { CfgPetClothFB } from "config/CfgPetClothFB";
import { LogError } from "core/Debugger";
import { bit } from "core/net/bit";
import { DataBase } from "data/DataBase";
import { smartdata, CreateSMD } from "data/SmartData";
import { Language } from "modules/common/Language";
import { MonsterData } from "modules/monster/MonsterData";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";

class PetGuardInfo {
    @smartdata
    need_flush: number;
}

export class PetGuardData extends DataBase {
    public flush_info: PetGuardInfo
    private fetch_flag :any
    private pass_level = 0
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(PetGuardInfo);
        this.flush_info.need_flush = 0
    }

    public GetRedNum()
    {
        if(this.fetch_flag == null)
        {
            return 0
        }

        let detail = this.GetViewDetail()
        for(var index in detail.list)
        {
            if(detail.list[index].is_red){
                return 1
            }
        }

        return 0
    }

    public SetFbInfo(data:PB_SCPetFbInfo)
    {
        this.pass_level = data.passLevel
        this.fetch_flag = DataHelper.ToBinary(data.fetchFlag)


        this.flush_info.need_flush = this.flush_info.need_flush + 1
    }

    public IsFetch(level:number)
    {
        return this.fetch_flag[level] == 1
    }

    public GetCfgStageList()
    {
        let list = []
        let cfg = CfgPetClothFB.pet_game
        for(var index in cfg)
        {
            if(list[cfg[index].level_stage] == null)
            {
                let ex_list: any[] = []
                let info = {
                    stage:cfg[index].level_stage,
                    cfglist:ex_list
                }
                info.cfglist.push(cfg[index])

                list[cfg[index].level_stage] = info
            }
            else
            {
                list[cfg[index].level_stage].cfglist.push(cfg[index])
            }
        }

        return list
    }

    public GetCfgDeatilList(stage:number)
    {
        let list = []
        let cfg = CfgPetClothFB.pet_game
        for(var index in cfg)
        {
            if(cfg[index].level_stage == stage)
            {
                list.push(cfg[index])
            }
        }

        return list
    }

    public GetRuleList(rule_str:string)
    {
        let list = []
        let cfg = CfgPetClothFB.challenge_rule
        let rule_list = rule_str.toString().split("|")
        for(var index in rule_list)
        {
            for(var check in cfg)
            {
                if(cfg[check].rule_id == Number(rule_list[index]))
                {
                    list.push(cfg[check])
                }
            }
        }

        return list
    }

    public GetViewDetail()
    {
        let list: any[] =  []
        let result = {
            list:list
        }

        let CfgList = this.GetCfgStageList()
        for(var index in CfgList)
        {
            let oper_cfg = CfgList[index].cfglist[0]
            let last = CfgList[index].cfglist[CfgList[index].cfglist.length - 1]
            let is_challenge = false
            let is_red = false
            for(var check in CfgList[index].cfglist)
            {
                if(this.pass_level+1 == CfgList[index].cfglist[check].level)
                {
                    is_challenge = true
                }
                if(!this.IsFetch(CfgList[index].cfglist[check].level) 
                    && this.pass_level >= CfgList[index].cfglist[check].level)
                {
                    is_red = true
                }
            }
            let info = {
                name:oper_cfg.game_name,
                icon_id:CfgList[index].cfglist[0].level_icon_id,
                is_complete:this.pass_level >= last.level,
                is_challenge:is_challenge,
                stage:oper_cfg.level_stage,
                is_red:is_red,
            }

            result.list.push(info)
        }
        return result
    }

    public GetDetailProgValue(index:number)
    {
        if(index == 1)
        {
            return 10
        }
        else if(index == 2)
        {
            return 50
        }
        else if(index == 3)
        {
            return 100
        }

        return 0
    }

    public GetDetailViewDetial(stage:number)
    {
        let rewards: any[] = []
        let rule_list: any[] = []
        let result = {
            title:"",
            level_show:"",
            res_id:0,
            p_max:100,
            p_value:0,
            rewards:rewards,
            rule_list:rule_list,
            level:0,
            game_pass:false,
            level_text:""
        }
        let list = this.GetCfgDeatilList(stage)

        let selected = false
        for(var index in list)
        {
            if(list[index].level == this.pass_level +1 || (Number(index) == list.length-1 && !selected ))
            {
                result.title = list[index].game_name
                result.level_show = TextHelper.Format(Language.PetGuard.LayTitle, DataHelper.GetDaXie(list[index].level_stage_game, false)); 
                result.res_id = MonsterData.Inst().CfgMonster(list[index].monster_id).res_id
                result.level = list[index].level
                result.p_value = this.GetDetailProgValue(list[index].level_stage_game)
                result.game_pass = this.pass_level >= list[index].level
                result.level_text = list[index].level_txt

                let rules = this.GetRuleList(list[index].rule_id)
                for(var check in rules)
                {
                    let info = {
                        str:rules[check].rule_desc
                    }
                    rule_list.push(info)
                }
                result.rule_list = rule_list
                selected = true
            }

            let reward = {
                name:TextHelper.Format(Language.PetGuard.LayTitle, DataHelper.GetDaXie(list[index].level_stage_game, false)),
                item_data:list[index].win[0],
                is_complete:this.pass_level >= list[index].level && this.IsFetch(list[index].level),
                is_lock:this.pass_level < list[index].level,
                level:list[index].level,
                show_oper:this.pass_level >= list[index].level && !this.IsFetch(list[index].level),
                is_last:Number(index) == list.length -1,
                is_challenge:list[index].level == this.pass_level +1,
            }
            rewards.push(reward)
        }
        result.rewards = rewards


        return result
    }
}
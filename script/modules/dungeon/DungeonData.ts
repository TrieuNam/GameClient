import { LogError } from 'core/Debugger';
import { DataBase } from "../../data/DataBase";
import { CfgClearance, CfgLingZhuData } from "config/CfgLingZhu";
import { CreateSMD, smartdata } from "data/SmartData";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from 'modules/common/Language';
import { RoleData } from "modules/role/RoleData";
import { CfgFashion } from 'config/CfgFashion';
import { Mod } from 'modules/common/ModuleDefine';
import { FunOpen } from 'modules/guide/FunOpen';

export type LingZhuStage = {
    level_list:LingZhuLevel[];
}

export type LingZhuLevel = {
    stage: number;
    pass_level: number;
    sweep_count: number;
}

class ChiefDungeonInfo {
    @smartdata 
    needflush:number;

    @smartdata 
    showred:number;
}

export class DungeonData extends DataBase{
    public chief_flush_info: ChiefDungeonInfo;
    private chief_info: any;
    private reded:boolean
    constructor() {
        super();
        this.createSmartData();

        this.chief_info = {}
        this.chief_info.stage_1 = []
        this.chief_info.stage_2 = []
        this.chief_info.stage_3 = []
        this.reded = false
    }

    private createSmartData() {
        this.chief_flush_info = CreateSMD(ChiefDungeonInfo);
        this.chief_flush_info.needflush = 0
        this.chief_flush_info.showred = 1
    }

    public GetChiefDungeonList(stage:number){
         var config = CfgLingZhuData.clearance;
         let list = [];

         for (const info of config) {
            if (stage == info.stage) {

                let server_info = this.GetSCLingZhuInfo(info.stage)
                // let last_server_info = info.front_seq == 0 ? {is_pass:1} : this.GetSCLingZhuInfo(info.front_seq)

                let complete = server_info.is_empty ? false : server_info.pass_level >= info.level;
                let saodang_num = server_info.is_empty ? 0 : server_info.sweep_count ;
                let show_saodang = server_info.is_empty ? false : server_info.pass_level == info.level;

                let cost_num = info.saodang_price_0
                if (saodang_num == 1)
                {
                    cost_num = info.saodang_price_1
                }
                else if (saodang_num == 2){
                    cost_num = info.saodang_price_2
                } 
                else if (saodang_num == 3){
                    cost_num = info.saodang_price_3
                } 
                else if (saodang_num >= 4){
                    cost_num = info.saodang_price_4
                }

                let is_free = server_info.is_empty ? false :cost_num == 0;

                let data = {
                    name:info.name,
                    is_complete:complete,
                    reward_show:complete ? info.saodang : info.win,
                    last_num: CfgLingZhuData.other[0].saodang_max - saodang_num,
                    last_color:(CfgLingZhuData.other[0].saodang_max - saodang_num) >0 ? COLORSTR.Yellow2 : COLORSTR.Red1,
                    is_free:is_free,
                    is_canchallenge: (info.level == 0||server_info.pass_level == info.level-1) && RoleData.Inst().GetRoleLevel() >= info.unlock_level,

                    seq:info.seq,
                    stage:info.stage,
                    level:info.level,
                    unlock_level:info.unlock_level,
                    saodang_item_id:info.saodang_item_id,
                    cost_num:cost_num,
                    show_saodang:show_saodang,
                    // saodang_price:
                }
               
                list.push(data);    
            }
         }     

         return list;
    }

    public GetChiefSelectDungeon(stage:number){
        let select_index = 0
        let dungeon_list = this.GetChiefDungeonList(stage)
        for(let i = 0;i<dungeon_list.length;i++){
            if(dungeon_list[i].show_saodang){
                select_index = i
            }
        }
        return select_index
    }
    public SetSCLingZhuInfo(data: PB_SCLingZhuInfo){
        // this.chief_info.info=data;
        let level_list = []
        for  (const info of data.lingzhuList) { 
            let cache = {
                stage:info.stage,
                pass_level:info.passLevel,
                sweep_count:info.sweepCount,
            }
            level_list.push(cache);    
        }

        if (data.lingzhuList.length > 1) {
            for(let i = 0;i<data.lingzhuList.length;i++){
                this.chief_info["stage_"+(i+1)] = level_list[i]
            }
        }
        else {
            for (let i = 0;i <3;i++){
                if (this.chief_info["stage_"+(i+1)].stage == level_list[0].stage){
                    this.chief_info["stage_"+(i+1)] = level_list[0]
                }
            }
        }
        
        if(this.reded == false){
            this.chief_flush_info.showred = this.flushRed() ? 1 :0
        }

        this.chief_flush_info.needflush = this.chief_flush_info.needflush + 1
    }

    public testred()
    {
        if(this.reded == false){
        this.chief_flush_info.showred = 1
        }
        this.chief_flush_info.needflush = this.chief_flush_info.needflush + 1
    }

    public GetSCLingZhuInfo(stage:number){

        if (this.chief_info == undefined) {return {is_empty:true}}
        
        if(stage <=3){
            return{
                is_empty:false,
                stage:this.chief_info["stage_"+stage].stage,
                pass_level:this.chief_info["stage_"+stage].pass_level,
                sweep_count:this.chief_info["stage_"+stage].sweep_count,
            }
        }

        return {is_empty:true}
    }

    public StrChange(num:number){
        if(num == 0) {
            return "saodang_price_0"
        }
        if(num == 1) {
            return "saodang_price_1"
        }
        if(num == 2) {
            return "saodang_price_2"
        }
        if(num == 3) {
            return "saodang_price_3"
        }
        if(num == 4) {
            return "saodang_price_4"
        }
    }

    public GetChiefQuickMop(stage:number){
        let dungeon_list = this.GetChiefDungeonList(stage)
        let net_info = this.chief_info["stage_"+stage]

        let item_list = []
        let cost_num = 0
        let last_time = 0
        let count = 0

        let config: CfgClearance[] = CfgLingZhuData.clearance;
    //     config.forEach(element => {
    //     for (let index = 0; index < 5; index++) {
    //         let key = "saodang_price_0"
    //         const element2 = element;
            
    //     }
    // });
       for (const info of config) {
            let show_saodang = net_info.is_empty ? false : net_info.pass_level == info.level;
            let flag = net_info.sweep_count < CfgLingZhuData.other[0].saodang_max
            // 定位
            if (stage == info.stage && show_saodang && flag) {
                let sweep_count = net_info.sweep_count
                last_time = CfgLingZhuData.other[0].saodang_max - sweep_count 
                let flag = info[this.StrChange(sweep_count)] == 0

                if(!flag){count = last_time}
                for(let i = sweep_count; i<CfgLingZhuData.other[0].saodang_max;i++){
                    // 当前为免费 
                    if(flag){
                        // 当不免费时 停止计算
                        if(info[this.StrChange(i)]> 0){
                            count = i - sweep_count 
                            break
                        }
                        // 当免费时，继续计算
                        else{
                            for (const item of info.saodang) {
                                let flag = false
                                for (const ready of item_list) {
                                    if (item.item_id == ready.item_id) {
                                        flag = true
                                        ready.num = ready.num + item.num
                                    }
                                }
                                if (!flag) {
                                    let vo = {
                                        item_id: item.item_id,
                                        num: item.num,
                                    }
                                    item_list.push(vo);
                                }
                            }
                        }
                    }   
                    // 当前不免费
                    else{
                        // 算价钱
                        cost_num = cost_num + info[this.StrChange(i)]
                        // 算道具
                        for (const item of info.saodang) {
                            let flag = false
                            for (const ready of item_list) {
                                if (item.item_id == ready.item_id) {
                                    flag = true
                                    ready.num = ready.num + item.num
                                }
                            }
                            if (!flag) {
                                let vo = {
                                    item_id: item.item_id,
                                    num: item.num,
                                }
                                item_list.push(vo);
                            }
                        }
                    }
                }

                
            }
        }



        // for (const cfg of dungeon_list) {
        //     let flag = net_info.sweep_count < CfgLingZhuData.other[0].saodang_max && RoleData.Inst().GetRoleLevel() >= cfg.unlock_level && cfg.show_saodang

        //     if (flag == true) {
        //         cost_num = cfg.cost_num 
        //         last_time = cfg.last_num

        //         // 不需要花钱的场合
        //         if(cost_num == 0){
        //             for (const item of cfg.reward_show) {
        //                 let flag = false
        //                 for (const ready of item_list){
        //                     if(item.item_id == ready.item_id){
        //                         flag = true
        //                         ready.num = ready.num + item.num
        //                     }
        //                 }
        //                 if(!flag){
        //                     let vo = {
        //                         item_id:item.item_id,
        //                         num:item.num,
        //                     }
        //                     item_list.push(vo);
        //                 }
        //                 count = 1
        //             }
        //         }
        //         // 需要花钱的场合
        //         else{


        //         }

                
        //     }
        // }

        let is_free = cost_num == 0
        let param = {
            item_list : item_list,
            is_free : is_free,
            cost_num : cost_num,
            last_time : last_time,
            param_seq : stage,
            is_quick : true,
            count: count,
            name : Language.Dungeon.OneKey,

            can_onekey:item_list.length > 0,
        }

        return param
    }

    public OpenView(){
        if(this.reded == false &&this.chief_flush_info.showred == 0 )
        {
            return 
        }

        this.chief_flush_info.showred = 0
        this.reded = true
    }

    public flushRed(){
        for(let i = 1;i<4;i++){
            let list = this.GetChiefDungeonList(i)
            for(var index in list){
                if(list[index].show_saodang && list[index].is_complete && list[index].last_num > 0){
                    return true
                }
            }
        }
        return false
        
    }

    public GetRedNum(){
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Chief.View));
        if(!open_t.is_open){
            return 0
        }

        return this.chief_flush_info.showred
    }


 }
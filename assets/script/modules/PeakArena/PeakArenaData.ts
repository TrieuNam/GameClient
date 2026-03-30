import { assetManager, ImageAsset, SpriteFrame } from "cc";
import { CfgDFArena } from "config/CfgDFArena";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ArenaEqualData } from "modules/Arena/ArenaData";
import { Item } from "modules/bag/ItemData";
import { CommonId, RANK_TYPE } from "modules/common/CommonEnum";
import { DateString, Language } from "modules/common/Language";
import { RankData } from "modules/rank/RankData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { ResPath } from "utils/ResPath";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { COLORSTR } from '../common/ColorEnum';

class PeakArenaInfo {
    @smartdata
    need_flush: number;
    @smartdata
    need_r_flush: number;
}

export class PeakArenaData extends DataBase {
    public flush_info: PeakArenaInfo
    private base_info :any
    private report_info :any
    private fight_ret_info:any

    private _sel_data: ArenaEqualData;
    public get sel_data(): ArenaEqualData {
        return this._sel_data;
    }
    
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(PeakArenaInfo);
        this.flush_info.need_flush = 0
    }

    public GetRedNum()
    {
        return 0
    }

    public GetMyPoint()
    {
        let ranks_param = RankData.Inst().GetRankList(RANK_TYPE.CrossArena)
        if(ranks_param.list.length >0)
        {
            LogError("?战斗前个人数据："+TextHelper.Format(ranks_param.my_info.value_show, ranks_param.my_info.info.value) )
            return TextHelper.Format(ranks_param.my_info.value_show, ranks_param.my_info.info.value) 
        }

        return 0
    }

    public SetCrossArenaInfo(data: PB_SCCrossArenaInfo) {
        let info = {
            roleinfo: data.roleinfo,
            target_score: data.targetScore,
            today_refresh_times: data.todayRefreshTimes,
            last_refresh_time: data.lastRefreshTime,
            target_fight_time: data.targetFightTime,
            is_fight: data.isFight,
            target_index :data.targetIndex,
        }

        this.base_info = info
        this.flush_info.need_flush = this.flush_info.need_flush + 1
    }

    public SetCrossArenaReportInfo(data: PB_SCCrossArenaReportList) {
        let info = {
            report_list: data.reportList,
        }

        this.report_info = info
        this.flush_info.need_r_flush = this.flush_info.need_r_flush + 1
    }

    public GetRewardList(type:number)
    {
        let cfg = type == 0 ? CfgDFArena.df_everyday_award : CfgDFArena.df_weekly_award

        let reward_list = []
        for(var index in cfg)
        {
            let is_top = cfg[index].paihang_1 == cfg[index].paihang_2
            let item_list = []
            for(var check in cfg[index].item_list)
            {
                item_list.push(Item.Create(cfg[index].item_list[check],{is_num:true,is_click:true}))
            }

            let info = {
                is_top:is_top,
                list:item_list,
                rank:is_top? cfg[index].paihang_1 : cfg[index].paihang_1+"-"+cfg[index].paihang_2,
            }

            reward_list.push(info)
        }

        return reward_list

    }

    public GetMainDetail()
    {
        let cfg = CfgDFArena
        let player_list: any[] = []
        let result = {
            playerList:player_list,
            ticketIcon:Item.GetIconId(cfg.df_arena_cfg[0].sarena_challenger_id),
            ticketNum:"",
            temp_time:0,
            huobiIcon:CommonId.Diamond,
            huobiNeed:0,
        }

        if(this.base_info.roleinfo == null){return result}

        for(var index in this.base_info.roleinfo)
        {
            let role = this.base_info.roleinfo[index]
            let point = this.base_info.target_score[index]
            let challenged = this.base_info.is_fight[index] == 1
            let target = this.base_info.target_index[index]
            let time = this.base_info.target_fight_time[index]
            // LogError("cjejmd ",role.headChar,role.headPicId)

            
            if (target != undefined) {
                let info = {
                    index: target,
                    name: DataHelper.BytesToString(role.name),
                    level: role.level,
                    point: point,
                    server: TextHelper.Format(Language.PeakArena.ServerShow, DataHelper.Uid2ServerId(role.roleId)),
                    challenged: challenged,
                    headChar: DataHelper.BytesToString(role.headChar),
                    headPicId: role.headPicId,

                    role_info:role,
                    last_time:time,
                }

                player_list.push(info)
            }
        }
        
        let temp_wait = this.base_info.last_refresh_time + cfg.df_arena_cfg[0].refresh_interval_s
        let temp_total = temp_wait - TimeCtrl.Inst().ServerTime;
        temp_total = temp_total > 0 ? temp_total : 0

        result.temp_time = temp_total
        result.playerList = player_list
        let ticket_num = Item.GetNum(cfg.df_arena_cfg[0].sarena_challenger_id)
        result.ticketNum = ticket_num +"/"+cfg.df_arena_cfg[0].initial_num
        result.huobiNeed = this.base_info.today_refresh_times * cfg.df_arena_cfg[0].diamond_expend

        return result
    }

    public SetSelData(data:ArenaEqualData)
    {
        this._sel_data = data;
    }

    // 生成并装填适合的数据
    public FixArenaEqualData(data:PB_RoleInfo,score:number,rank:number,index:number)
    {
        let info = new ArenaEqualData()
        info.role_id = data.roleId;
        info.name = DataHelper.BytesToString(data.name);
        info.level = data.level;
        info.cap = data.cap;
        info.head_pic = data.headPicId;
        info.headChar = DataHelper.BytesToString(data.headChar);
        info.score = score;
        info.rank = rank;
        info.index = index;
        return info
    }

    public GetRankDetail()
    {
        let ranks: any[] = []
        let result = {
            my_info:{},
            list:ranks,
        }

        let ranks_param = RankData.Inst().GetRankList(RANK_TYPE.CrossArena)

        if(ranks_param.list.length == 0)
        {
            return result
        }
        for(var index in ranks_param.list)
        {
            let check = ranks_param.list[index]
            let info = {
                level:check.info.roleinfo.level,
                point:TextHelper.Format(check.value_show, check.info.value) ,
                server:TextHelper.Format(Language.PeakArena.ServerShow,check.server_id),
                name:check.name,
                is_top:check.rank<=3,
                rank:check.rank,
                headChar:DataHelper.BytesToString(check.info.roleinfo.headChar),
                headPicId:check.info.roleinfo.headPicId,
                roleId:check.info.roleinfo.roleId,
                value:check.info.value,
            }

            ranks.push(info)
        }

        let me = ranks_param.my_info
        let my_info = {
            level:me.info.roleinfo.level,
            point:TextHelper.Format(me.value_show, me.info.value) ,
            server:TextHelper.Format(Language.PeakArena.ServerShow,me.server_id),
            name:me.name,
            is_top:me.rank <= 3 && me.rank != 0,
            rank:me.rank,
            headChar:DataHelper.BytesToString(me.info.roleinfo.headChar),
            headPicId:me.info.roleinfo.headPicId,
            roleId:me.info.roleinfo.roleId,
            value:me.info.value,
        }

        result.list = ranks
        result.my_info = my_info

        return result
    }

    public GetRecordDetail()
    {
        let cfg = CfgDFArena

        let list: any[] = []
        let result = {
            numShow:"",
            list:list,
        }

        let reports = this.report_info.report_list
        for(var index in reports)
        {
            let check = reports[index]
            let score_color = check.isWin == 1 ? COLORSTR.Green3 : COLORSTR.Red5
            let record_str = Language.PeakArena.RecordType[check.isAttack]+Language.PeakArena.RecordShow[check.isWin]
            // 等待时间不确定，暂定两分钟 120s
            let wait_time = 300
            let temp_time = check.targetFightTime + wait_time
            let total_time = temp_time - TimeCtrl.Inst().ServerTime

            total_time = total_time > 0 ? total_time : 0


            let time_str = ""
            let time_t = TimeHelper.FormatDHMS(TimeCtrl.Inst().ServerTime - check.time)
            for(var time_check in time_t){
                if(time_t[time_check] > 0)
                {
                    time_str = time_str + time_t[time_check] + DateString[time_check]
                }
            }
            if(time_str != "")
            {
                time_str = time_str + Language.PeakArena.TimePlus
            }
            if (check.targetInfo) {
                let info = {
                    index: Number(index),
                    level: check.targetInfo.level,
                    name: DataHelper.BytesToString(check.targetInfo.name),
                    server: TextHelper.Format(Language.PeakArena.ServerShow, DataHelper.Uid2ServerId(check.targetInfo.roleId)),
                    point:check.targetScore,
                    pointChange: TextHelper.ColorStr(check.score >0 ? "+"+check.score :check.score, score_color),
                    recordShow: TextHelper.ColorStr(record_str, score_color),
                    show_btn: check.isWin == 0 && check.isAttack == 0 && check.score < 0 && total_time == 0,
                    battle_time: time_str,
                    show_time: total_time > 0,
                    temp_time: total_time,

                    headChar: DataHelper.BytesToString(check.targetInfo.headChar),
                    headPicId: check.targetInfo.headPicId,

                    role_info:check.targetInfo,
                }
                list.push(info)
            }

        }

        let ticket_num = Item.GetNum(cfg.df_arena_cfg[0].sarena_challenger_id)
        result.numShow = ticket_num +"/"+cfg.df_arena_cfg[0].initial_num
        result.list = list

        return result
    }

    public SetCrossArenaCount(protocol: PB_SCCrossArenaFightRet)
    {
        let info = {
            attacker_score:protocol.attackerScore,
            attacker_change:protocol.attackerChange,
            defender_score:protocol.defenderScore,
            defender_change:protocol.defenderChange,
        }
        this.fight_ret_info = info
    }

    public GetCrossArenaCount()
    {
        return this.fight_ret_info 
    }
}

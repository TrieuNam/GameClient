import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataBase } from "../../data/DataBase";
import { TimeHelper } from "../../helpers/TimeHelper";
import { ActivityData } from "./ActivityData";

export class ActivityFuncsData extends DataBase {
    private cfg_cache_list: { [act_type: number]: any } = {};
    private cfg_cache_nums: { [act_type: number]: number } = {};
    constructor() {
        super();
    }

    public GetSectionList(act_type: number, act_cfg: any[], sort_key: string, server_start?: number, is_section?: boolean) {
        if (!act_cfg)
            return {} //配置找不到的时候
        if (act_cfg[act_cfg.length - 1].section_start == null && is_section == null)
            return act_cfg ?? {} //没有天数的时候
        server_start = server_start ?? TimeCtrl.Inst().GetCurOpenServerDay();
        server_start = server_start <= 0 ? 1 : server_start;
        if (this.cfg_cache_list[act_type])
            if (this.cfg_cache_nums[act_type] && this.cfg_cache_nums[act_type] == server_start)
                return this.cfg_cache_list[act_type];
        let info_list: any[] = [];
        for (let i = 0; i < act_cfg.length; i++) {
            let cfg = act_cfg[i];
            let section_num = is_section == true ? cfg.start_time : cfg.section_start;
            let section_end = is_section == true ? cfg.end_time : cfg.section_end;
            if ((section_num <= server_start && section_end >= server_start) ||
                (section_num <= server_start && section_end == 0)) {
                info_list.push(cfg);
            }
        }
        if (info_list.length == 0 && act_cfg) {
            info_list = act_cfg;
        }
        if (sort_key) {
            info_list.sort(
                (a: any, b: any) => {
                    return a[sort_key] - b[sort_key];
                }
            )
        }
        //缓存一个配置列表
        this.cfg_cache_nums[act_type] = server_start
        this.cfg_cache_list[act_type] = info_list
        return info_list;
    }

    //获取当前活动对应的服务器开启天数
    private GetActOpenServerDay(act_type: number) {
        return TimeHelper.GetDataDayNum(ActivityData.Inst().GetStartStampTime(act_type), TimeCtrl.Inst().ServerStartTs);
    }

    //当前活动开启到了第几天
    public GetActOpenDay(act_type: number) {
        return TimeHelper.GetDataDayNum(TimeCtrl.Inst().ServerTime, ActivityData.Inst().GetStartStampTime(act_type));
    }

    //获取新服(开服)天数(新开服务器)配置
    public GetActivityOpenCfg(act_type: number, config: any[], sort_key?: string) {
        return this.GetSectionList(act_type, config, sort_key);
    }

    //获取对应活动开启时的开启天数的配置
    public GetActOpenDayCfg(act_type: number, act_cfg: any[], sort_key: string) {
        return this.GetSectionList(act_type, act_cfg, sort_key, this.GetActOpenServerDay(act_type));
    }

    //统一的活动开启固定时间获取配置 
    public GetOpenConfig(act_type: number, act_cfg: any[], sort_key: string) {
        return this.GetSectionList(act_type, act_cfg, sort_key, this.GetActOpenDay(act_type));
    }

    //根据等级获取配置
    public static GetLevelCfg( act_cfg: any[], level:number){
        let list=[];
        for(let i=0;i<act_cfg.length;i++){
            let min = act_cfg[i].start_level ? act_cfg[i].start_level : act_cfg[i].level_min;
            let max = act_cfg[i].end_level ? act_cfg[i].end_level : act_cfg[i].level_max;
            if (level >= min && (level <= max || max ==0)){
                list.push(act_cfg[i]);
            }
        }
        return list;
    }
}
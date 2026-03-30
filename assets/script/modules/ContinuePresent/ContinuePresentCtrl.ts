import { CfgLianChongZengLi } from "config/CfgLianChongZengLi";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from "data/SmartData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FirstChargeData } from "modules/first_charge/FirstChargeCtrl";
import { TextHelper } from '../../helpers/TextHelper';

export class ContinuePresentCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaLianChongZengLiInfo, func: this.onSCRaLianChongZengLiInfo },
        ]
    }

    // 星图信息
    private onSCRaLianChongZengLiInfo(protocol: PB_SCRaLianChongZengLiInfo) {
        LogError("3032?连充赠礼信息?onSCRaLianChongZengLiInfo", protocol)
        ContinuePresentData.Inst().SetContinuePresentInfo(protocol)
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.LeiChong.LianChongZengLi,
            ContinuePresentData.Inst().flush_info,
            ContinuePresentData.Inst().GetRedNum.bind(ContinuePresentData.Inst())));
    }
}

class ContinuePresentInfo {
    @smartdata
    need_flush: number;
}

export class ContinuePresentData extends DataBase {
    public flush_info: ContinuePresentInfo
    private base_info = {
        level: 1,
        cur_task_day: 0,
        today_task_finish: 0,
        chongzhi_task_proceed: [0, 0, 0, 0, 0],
        friend_task_proceed: [0, 0, 0, 0, 0],
        receive_rewards_flag: [0, 0, 0, 0],
    }
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(ContinuePresentInfo);
        this.flush_info.need_flush = 0
    }

    public SetContinuePresentInfo(protocol: PB_SCRaLianChongZengLiInfo) {
        this.base_info.level = protocol.level
        this.base_info.cur_task_day = protocol.curTaskDay
        this.base_info.today_task_finish = protocol.todayTaskFinish
        this.base_info.chongzhi_task_proceed = protocol.chongzhiTaskProceed
        this.base_info.friend_task_proceed = protocol.friendTaskProceed
        this.base_info.receive_rewards_flag = protocol.receiveRewardsFlag

        this.flush_info.need_flush = this.flush_info.need_flush + 1
    }

    public GetRedNum() {
        if (this.base_info.level == 0) {
            return 0
        }
        for (var index in this.base_info.receive_rewards_flag) {
            if (Number(index) > 0 && this.base_info.receive_rewards_flag[index] == 0 && this.base_info.cur_task_day > Number(index)) {
                // return 1
                return 0
            }
        }

        return 0
    }

    public GetDetail() {
        let list = this.GetGiftList()
        let count_param = this.GetCountShow()

        return {
            gift_list: list,
            count_desc: count_param.desc,
            progress: count_param.pro,
            item_data: count_param.item_data,
        }
    }

    public GetCountShow() {
        let cfg = this.GetGiftList()
        let day_start = this.base_info.today_task_finish == 1 ? this.base_info.cur_task_day : this.base_info.cur_task_day - 1
        // for(var index in this.base_info.receive_rewards_flag)
        // {
        //     if(this.base_info.receive_rewards_flag[index] == 1 && Number(index) > 0)
        //     {
        //         day_start = Number(index)
        //     }
        // }
        let mark = null

        for (let i = 0; i < cfg.length; i++) {

            // LogError("? !",i,cfg[i])
            if (cfg[i].is_big && this.base_info.receive_rewards_flag[cfg[i].day] == 0) {
                mark = cfg[i]
                break
            }
        }

        if (mark == null && day_start >= cfg.length) {
            mark = cfg[cfg.length - 1]
        }

        let desc = ""
        let prog = ""
        let item_data = {}
        if (mark != null) {

            let day_pass = mark.day - day_start
            if (day_pass < 0) { day_pass = 0 }
            desc = TextHelper.Format(Language.ContinuePresent.BigCountShow, TextHelper.ColorStr(day_start, COLORSTR.Yellow3), TextHelper.ColorStr(day_pass, COLORSTR.Yellow3))

            prog = TextHelper.Format(Language.ContinuePresent.BigCountPro, TextHelper.ColorStr(day_start, day_start >= day_pass ? COLORSTR.Green4 : COLORSTR.Red1), mark.day)

            item_data = { item_id: mark.reward1_item[0].item_id, num: mark.reward1_item[0].num }
        }

        return {
            desc: desc,
            pro: prog,
            item_data: item_data
        }
    }

    public GetTaskDesc(task_type: number, task_1_param: number, task_2_param: number, is_today: boolean, day: number) {
        let base_desc = Language.ContinuePresent.TaksShow
        // let is_complete = this.base_info.cur_task_day > day
        let color_1_str = (this.base_info.chongzhi_task_proceed[day]) ? COLORSTR.Red4 : COLORSTR.Red1
        let color_2_str = (this.base_info.friend_task_proceed[day]) ? COLORSTR.Red4 : COLORSTR.Red1


        let desc_1 = TextHelper.Format(base_desc[0],
            TextHelper.ColorStr(this.base_info.chongzhi_task_proceed[day] / 10, color_1_str) + "/" + task_1_param / 10)
        let desc_2 = TextHelper.Format(base_desc[1],
            TextHelper.ColorStr(this.base_info.friend_task_proceed[day], color_2_str) + "/" + task_2_param)

        if (task_type == 0) {
            return desc_1
        }
        else if (task_type == 1) {
            return desc_2
        }
        else {
            return desc_1 + Language.ContinuePresent.TaskAND + desc_2
        }


    }

    public GetGiftList() {
        let cfg = CfgLianChongZengLi.gift_configure
        let list = []
        for (var check in cfg) {
            if (cfg[check].end_level >= this.base_info.level
                && cfg[check].start_level <= this.base_info.level) {
                // let is_today = this.base_info.today_task_finish == 1 ? this.base_info.cur_task_day-1 == cfg[check].day  : this.base_info.cur_task_day == cfg[check].day 

                let complete = (this.base_info.friend_task_proceed[cfg[check].day] > 0 && this.base_info.friend_task_proceed[cfg[check].day] >= cfg[check].inv_friend_num && cfg[check].inv_friend_num > 0)
                    || (this.base_info.chongzhi_task_proceed[cfg[check].day] > 0 && this.base_info.chongzhi_task_proceed[cfg[check].day] >= cfg[check].price && cfg[check].price > 0)
                let done = this.base_info.receive_rewards_flag[cfg[check].day] == 1

                let info = {
                    seq: cfg[check].seq,
                    day: cfg[check].day,
                    complete: complete,
                    done: done,
                    reward2_item: cfg[check].reward2_item,
                    reward1_item: cfg[check].reward1_item,
                    is_big: cfg[check].reward1_item[0] != undefined,
                    task_desc: this.GetTaskDesc(cfg[check].task_type, cfg[check].price, cfg[check].inv_friend_num, false, cfg[check].day),
                    sort: done ? 1000 + cfg[check].day : cfg[check].day
                }

                list.push(info)
            }
        }

        list.sort((a: any, b: any) => { return a.sort - b.sort })

        return list
    }

    public GetBigList() {
        let list = []
        let cfg = this.GetGiftList()
        for (var index in cfg) {
            if (cfg[index].is_big) {
                for (var b_index in cfg[index].reward1_item) {
                    let flag = true
                    for (var check in list) {
                        if (list[check].item_id == cfg[index].reward1_item[b_index].item_id) {
                            flag = false
                            list[check].num = list[check].num + cfg[index].reward1_item[b_index].num
                        }
                    }
                    if (flag) {
                        let info = {
                            item_id: cfg[index].reward1_item[b_index].item_id,
                            num: cfg[index].reward1_item[b_index].num,
                        }
                        list.push(info)
                    }
                }

            }
        }
        return list
    }

    public GetIsOpen() {
        if (!FirstChargeData.Inst().IsFirstRecharge()) {
            return false;
        }
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.LianChongZengLi)) {
            return false;
        }
        let cfg = this.GetGiftList()
        let check_flag = false
        for (var index in cfg) {
            if (this.base_info.receive_rewards_flag[cfg[index].day] == 0) {
                check_flag = true
                break
            }
        }

        return check_flag;
    }
}
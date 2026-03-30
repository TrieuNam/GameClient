
import { CfgArenaData } from "config/CfgArena";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from 'data/SmartData';
import { Item } from "modules/bag/ItemData";
import { BATTLE_ATTR } from "modules/common/CommonEnum";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { ARENA_OP_TYPE, ArenaCtrl } from "./ArenaCtrl";

export class ArenaResultData {
    @smartdata
    arena_info: PB_SCArenaInfo;

    @smartdata
    arena_report: PB_SCArenaReportList;
}
export class ArenaRankSmData {
    @smartdata
    flush_pos: boolean;
}

export class ArenaData extends DataBase {
    public result_info: ArenaResultData;
    public rank_sm_info: ArenaRankSmData;
    private _sel_data: ArenaEqualData;
    public get sel_data(): ArenaEqualData {
        return this._sel_data;
    }

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_info = CreateSMD(ArenaResultData);
        self.rank_sm_info = CreateSMD(ArenaRankSmData);
    }

    public setArenaInfo(data: PB_SCArenaInfo) {
        this.result_info.arena_info = data;
    }

    public setArenaReportList(data: PB_SCArenaReportList) {
        this.result_info.arena_report = data;
    }

    public GetWeeklyJoinListData() {
        let cfg = CfgArenaData.weekly_join_award;
        const total = 660;
        let per_w = total / cfg[cfg.length - 1].num;
        let pre_num = 0;
        let list = [];
        let flag = this.result_info.arena_info.weekBoxFetchFlag.toString(2).split("").reverse().map(Number);
        for (let i = 0; i < cfg.length; i++) {
            let w = (cfg[i].num - pre_num) * per_w;
            let is_can_fetch = this.IsCanFetch(cfg[i].num) && !this.IsFetched(cfg[i].seq);
            list.push({ cfg: cfg[i], w: w, flag: flag[cfg[i].seq], is_can_fetch: is_can_fetch });
            pre_num = cfg[i].num;
        }
        return list;
    }

    public GetWeeklyJoinMaxValue() {
        let cfg = CfgArenaData.weekly_join_award;
        return cfg[cfg.length - 1].num;
    }

    public GetDayRewardList() {
        return CfgArenaData.everyday_award;
    }
    public GetWeekRewardList() {
        return CfgArenaData.weekly_award;
    }

    public GetArenaMainData() {
        return this.result_info.arena_info;
    }

    public GetMyScore() {
        if (this.result_info.arena_info)
            return this.result_info.arena_info.nowScore;
        return 0;
    }
    public GetChallengeCostId() {
        return CfgArenaData.arena_cfg[0].arena_challenge_id;
    }

    public IsCanFetch(num: number) {
        return num <= this.result_info.arena_info.weekBoxProgress;
    }
    public IsFetched(seq: number) {
        return this.result_info.arena_info.weekBoxFetchFlag.toString(2).split("").reverse().map(Number)[seq] == 1;
    }

    public GetEquilList() {
        let list = [];
        if (this.result_info.arena_info && this.result_info.arena_info.roleinfo) {
            let equil_list = this.result_info.arena_info.roleinfo;
            let score: number[] = this.result_info.arena_info.targetScore;
            let ranks: number[] = this.result_info.arena_info.targetRank;

            for (let i = 0; i < equil_list.length; i++) {
                let role_info = new ArenaEqualData();
                if (equil_list[i].roleId < 65535) {//怪物
                    let cfg = CfgArenaData.arena_monster[equil_list[i].roleId - 1];
                    if (cfg) {
                        role_info.role_id = cfg.seq;
                        role_info.name = cfg.name_name;
                        role_info.level = cfg.monster_level;
                        role_info.cap = cfg.monster_fight;
                        role_info.head_pic = cfg.monstor_icon;
                        role_info.score = cfg.monster_score;
                        role_info.rank = ranks[i] ?? 0;
                    }
                } else {
                    role_info.role_id = equil_list[i].roleId;
                    role_info.name = DataHelper.BytesToString(equil_list[i].name)
                    role_info.level = equil_list[i].level;
                    role_info.cap = equil_list[i].cap;
                    role_info.head_pic = equil_list[i].headPicId;
                    role_info.headChar = DataHelper.BytesToString(equil_list[i].headChar);
                    role_info.score = score[i] ?? 0;
                    role_info.rank = ranks[i] ?? 0;
                }
                role_info.index = i;
                list.push(role_info);
            }
        }

        return list;
    }

    public sendChallenge(data: ArenaEqualData, type: ARENA_OP_TYPE) {
        if (this.GetFightTimes() > 0) {
            this._sel_data = data;
            ArenaCtrl.Inst().SendArenaReq(type, data.index);
        } else {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(ArenaData.Inst().GetChallengeCostId());
        }
    }

    public GetEndTime() {
        // let data = (CfgArenaData.arena_cfg[0].jiesuan_tiem + "");
        // let week = +data.slice(0, 1);
        // let hour = +data.slice(1, 2);
        // let min = +data.slice(3);
        // let cur_week = TimeCtrl.Inst().GetWeek();
        // // cur_week = cur_week == 0 ? 7 : cur_week;
        // let days: number;
        // if (cur_week <= week)
        //     days = week - cur_week;
        // else
        //     days = week + 7 - cur_week;
        // let sec = hour * 3600 + min * 60;
        // let time = sec + TimeCtrl.Inst().todayStarTime + days * 86400;
        // return time;
        return TimeCtrl.Inst().GetNextWeekMonTime()
    }

    public GetRecordList() {
        let record = this.result_info.arena_report;
        let list: any[];
        if (record) {
            list = [];
            for (let i = 0; i < record.reportList.length; i++) {
                list.push({ info: record.reportList[i], index: i })
            }
        }
        return list;
    }

    //玩家挑战券上限
    public GetChallengeTimeLimit() {
        let base_limit = +CfgArenaData.arena_cfg[0].initial_num;
        let attr_add = +RoleData.Inst().GetAttributeData(BATTLE_ATTR.GLADIATUS);
        return base_limit + attr_add;
    }

    //挑战券是否上限了
    public IsChallengeTimeMax() {
        if (this.result_info.arena_info) {
            return this.GetFightTimes() >= this.GetChallengeTimeLimit();
        }
        return true;
    }

    //竞技场可挑战次数
    public GetFightTimes() {
        let id = this.GetChallengeCostId();
        return +Item.GetNum(id);
    }

    /**对手基础分 */
    public GetBaseScore() {
        let cfg = CfgArenaData.arena_cfg[0];
        return [cfg.left_score, cfg.centre_score, cfg.right_score];
    }

    public GetRed() {
        if (this.result_info.arena_info) {
            let cfg = CfgArenaData.weekly_join_award;
            for (let i = 0; i < cfg.length; i++) {
                if (this.IsCanFetch(cfg[i].num) && !this.IsFetched(cfg[i].seq)) {
                    return 0;
                }
            }
        }
        return 0;
    }

    public RefreshEqualCost() {
        return CfgArenaData.arena_cfg[0].gold_expend;
    }

    public RefreshEqualCd() {
        return CfgArenaData.arena_cfg[0].refresh_interval_s;
    }

    /**竞技场排名 */
    public GetArenaRank() {
        return this.result_info.arena_info ? this.result_info.arena_info.nowRank : 0;
    }

    public GetRewardList(type: number) {
        let cfg = type == 0 ? CfgArenaData.everyday_award : CfgArenaData.weekly_award

        let reward_list = []
        for (var index in cfg) {
            let is_top = cfg[index].paihang_1 == cfg[index].paihang_2
            let item_list = []
            for (var check in cfg[index].item_list) {
                item_list.push(Item.Create(cfg[index].item_list[check], { is_num: true, is_click: true }))
            }

            let info = {
                is_top: is_top,
                list: item_list,
                rank: is_top ? cfg[index].paihang_1 : cfg[index].paihang_1 + "-" + cfg[index].paihang_2,
            }

            reward_list.push(info)
        }

        return reward_list

    }
}

export class ArenaEqualData {
    role_id: number;
    name: string;
    level: number;
    cap: number;
    head_pic: number;
    score: number;
    index: number;
    rank: number;
    headChar: string;
}

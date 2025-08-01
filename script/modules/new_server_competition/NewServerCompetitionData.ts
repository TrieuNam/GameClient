
import { GetCfgValue } from "config/CfgCommon";
import { CfgXinFuBiPinData } from "config/CfgXinFuBiPin";
import { bit } from "core/net/bit";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { AdventureData } from "modules/adventure/AdventureData";
import { AngelData } from "modules/Angel/AngelData";
import { ArenaData } from "modules/Arena/ArenaData";
import { RANK_TYPE } from "modules/common/CommonEnum";
import { FashionData } from "modules/fashion/FashionData";
import { MountData } from "modules/mount/MountData";
import { PetData } from "modules/Pet/PetData";
import { RoleData } from "modules/role/RoleData";
import { StarMapData } from "modules/star_map/StarMapData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TrialData } from "modules/trial/TrialData";
import { DataHelper } from "../../helpers/DataHelper";

export class NewServerCompetitionResultData {
    @smartdata
    Info: PB_SCRaNewServerInfo = new PB_SCRaNewServerInfo();
    @smartdata
    GlobalInfo: PB_SCRaNewServerGlobalInfo = new PB_SCRaNewServerGlobalInfo();
    @smartdata
    RankInfos: PB_SCRANewServerRankList[] = [];

    @smartdata
    FlushRank: boolean = false
}


export var NewServerCompetitionRankType = {
    [0]: RANK_TYPE.BiPinJingJiChang,
    [1]: RANK_TYPE.BiPinFaZhenZhuangBei,
    [2]: RANK_TYPE.BiPinDengJi,
    [3]: RANK_TYPE.BiPinGuMo,
    [4]: RANK_TYPE.BiPinMaoXian,
    [5]: RANK_TYPE.BiPinChongWu,
    [6]: RANK_TYPE.BiPinFaZhen,
    [7]: RANK_TYPE.BiPinXingTu,
    [8]: RANK_TYPE.BiPinZuoJi,
    [9]: RANK_TYPE.BiPinShiZhuang,
}

export class NewServerCompetitionData extends DataBase {
    public ResultData: NewServerCompetitionResultData;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(NewServerCompetitionResultData);
    }

    public SetRaNewServerInfo(protocol: PB_SCRaNewServerInfo) {
        this.ResultData.Info = protocol
    }

    public SetRaNewServerGlobalInfo(protocol: PB_SCRaNewServerGlobalInfo) {
        this.ResultData.GlobalInfo = protocol
    }

    public SetRANewServerRankList(protocol: PB_SCRANewServerRankList) {
        this.ResultData.RankInfos[protocol.type] = protocol
        this.ResultData.FlushRank = !this.ResultData.FlushRank
    }

    public CfgVersion() {
        let co = CfgXinFuBiPinData.timestamp.filter(cfg => cfg.ver_timestamp < TimeCtrl.Inst().ServerTime);
        return co ? co[co.length - 1].version : 0
    }

    public CfgRankTypes() {
        let version = this.CfgVersion();
        return CfgXinFuBiPinData.gift_configure.filter(cfg => cfg.version == version && cfg.seq == 0);
    }

    public CfgRankGiftByRankTypeRank(rank_type: number, rank: number) {
        let version = this.CfgVersion();
        return CfgXinFuBiPinData.gift_configure.find(cfg => cfg.version == version && cfg.rank_type == rank_type && cfg.reward_type == 1 && cfg.parameter_1 <= rank && cfg.parameter_2 >= rank);
    }

    // public CfgRankGiftByRankTypeRewardType1(rank_type: number) {
    //     let version = this.CfgVersion();
    //     return CfgXinFuBiPinData.gift_configure.filter(cfg => cfg.version == version && cfg.rank_type == rank_type && cfg.reward_type == 1);
    // }

    public CfgRankGiftByRankTypeRewardType1(rank_type: number) {
        let version = this.CfgVersion();
        return CfgXinFuBiPinData.gift_configure.filter(cfg => cfg.version == version && cfg.rank_type == rank_type && cfg.reward_type == 1 && cfg.parameter_1 <= cfg.parameter_2);
    }

    // public CfgRankGiftByRankTypeWithoutRewardType1(rank_type: number) {
    //     let version = this.CfgVersion();
    //     return CfgXinFuBiPinData.gift_configure.filter(cfg => cfg.version == version && cfg.rank_type == rank_type && cfg.reward_type > 1);
    // }

    public CfgRankGiftByRankTypeWithoutRewardType1(rank_type: number) {
        let version = this.CfgVersion();
        return CfgXinFuBiPinData.gift_configure.filter(cfg => cfg.version == version && cfg.rank_type == rank_type && cfg.reward_type == 3);
    }

    public GetRankList(rank_type: number) {
        return this.ResultData.RankInfos[rank_type]
    }

    public GetMyRank(type: RANK_TYPE) {
        let data = this.GetRankList(type);
        return data ? data.myRank : 0;
    }

    public GetRankTypesSort(rank_list: any[]) {
        let server_time = TimeCtrl.Inst().ServerTime
        rank_list.sort((a: any, b: any) => {
            let ao = (NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(a.rank_type) - server_time < 0) ? 2 : (((NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(a.rank_type) - server_time) < (a.continuou_times * 86400)) ? 0 : 1)
            let bo = (NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(b.rank_type) - server_time < 0) ? 2 : (((NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(b.rank_type) - server_time) < (b.continuou_times * 86400)) ? 0 : 1)
            return ao - bo
        })
        return rank_list
    }

    public GetRaNewServerGlobalInfoEndTime(rank_type: number) {
        return this.ResultData.GlobalInfo.endTime ? this.ResultData.GlobalInfo.endTime[rank_type] : 0
    }

    public GetRaNewServerInfoFetchFlag(rank_type: number) {
        return this.ResultData.Info.fetchFlag[rank_type]
    }

    public GetRewardVal(rank_type: number) {
        switch (rank_type) {
            case 0:
                return ArenaData.Inst().GetArenaRank();
            case 1:
                return AngelData.Inst().GetAllEquipLevel();
            case 2:
                return RoleData.Inst().GetRoleLevel();
            case 3:
                return TrialData.Inst().GetTrailAllStarNum();
            case 4:
                return AdventureData.Inst().GetAdventureLevel();
            case 5:
                return PetData.Inst().GetAllPetGemLevel();
            case 6:
                return AngelData.Inst().GetFaZhenLevel();
            case 7:
                return StarMapData.Inst().GetTotalLevel();
            case 8:
                return MountData.Inst().GetTotalGrade();
            case 9:
                return FashionData.Inst().ClothesTotalLevel();
        }
        return 0
    }

    public GetRankVal(rank_type: number) {
        rank_type = GetCfgValue(NewServerCompetitionRankType, rank_type)
        return this.GetMyRank(rank_type)
    }

    // public GetRewardProgressVal(rank_type: number, p1: number, p2: number) {
    //     let val = this.GetRewardVal(rank_type);
    //     switch (rank_type) {
    //         case 0:
    //             return p1 - val;
    //         default:
    //             return val - p1;
    //     }
    // }

    public GetRewardProgressVal(rank_type: number, p1: number, p2: number) {
        let val = this.GetRankVal(rank_type);
        return 0 == val ? 0 : (p1 - val);
    }

    // public GetRewardValCanGet(rank_type: number, p1: number) {
    //     let val = this.GetRewardVal(rank_type);
    //     switch (rank_type) {
    //         case 0:
    //             return val <= p1;
    //         default:
    //             return val >= p1;
    //     }
    // }

    public GetRewardValCanGet(rank_type: number, p1: number) {
        let val = this.GetRankVal(rank_type);
        return val > 0 && val <= p1;
    }


    public GetRankListShow(rank_list: IPB_SCRANewServerRankNode[], rank_type: number) {
        let show_list = []
        let index = 0
        let co = this.CfgRankGiftByRankTypeRewardType1(rank_type)
        let func_co = function (cfg: any[], rank: number) {
            let co_rank = cfg.find(cfg => cfg.parameter_2 >= rank)
            return co_rank
        }
        let max_num = 0
        for (let element of co) {
            max_num = Math.max(max_num, element.parameter_2)
        }
        for (let i = 0; i < max_num; i++) {
            let rank_info = rank_list.find(info => info.rank == (i + 1))
            let co_rank = func_co(co, i + 1)
            if (co_rank) {
                if (rank_info) {
                    let is_enough = 0 == rank_type || rank_info.value >= co_rank.parameter_3
                    if (is_enough) {
                        index++
                        show_list.push({ info: rank_info.roleinfo, rank: i + 1, value: rank_info.value, name: DataHelper.BytesToString(rank_info.roleinfo.name), co: co_rank })
                        continue
                    }
                }
            }
            show_list.push({ info: null, rank: i + 1, value: 0, name: "", co: co_rank })
        }
        return show_list
    }

    public GetRankRewardGet(rank_type: number, seq: number, p1: number) {
        let is_get = bit.hasflag(this.GetRaNewServerInfoFetchFlag(rank_type), seq)
        let can_get = this.GetRewardValCanGet(rank_type, p1)
        return { is_get, can_get }
    }

    public GetNewServerCompetitionRedNum() {
        let rp = 0
        let rank_types = NewServerCompetitionData.Inst().GetRankTypesSort(NewServerCompetitionData.Inst().CfgRankTypes());
        let server_time = TimeCtrl.Inst().ServerTime
        rank_types.forEach(element => {
            if (1 == rp) { return }
            let end_time = NewServerCompetitionData.Inst().GetRaNewServerGlobalInfoEndTime(element.rank_type)
            let not_open = (end_time - server_time) > (element.continuou_times * 86400)
            if (!not_open) {
                let rewards = NewServerCompetitionData.Inst().CfgRankGiftByRankTypeWithoutRewardType1(element.rank_type)
                rewards.forEach(element2 => {
                    if (1 == rp) { return }
                    let info = NewServerCompetitionData.Inst().GetRankRewardGet(element2.rank_type, element2.seq, element2.parameter_1);
                    if (!info.is_get && info.can_get) {
                        rp = 1
                        return
                    }
                });
            }
        });
        return rp
    }
}

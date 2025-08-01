
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from 'data/SmartData';
import { RANK_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { RoleData } from "modules/role/RoleData";
import { TrialData } from "modules/trial/TrialData";
import { DataHelper } from "../../helpers/DataHelper";

export class RankResultData {
    @smartdata
    is_change: boolean;
}

export class RankData extends DataBase {
    public result_info: RankResultData;
    private rank_info: { [type: number]: PB_SCRankList } = {};
    private cur_rank_type: RANK_TYPE;//当前展示的排行榜类型
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_info = CreateSMD(RankResultData);
    }

    public setRanInfo(protocol: PB_SCRankList) {
        LogError("?下发排行榜信息", protocol)
        if (protocol.listBegin == 0 || !this.rank_info[protocol.type])
            this.rank_info[protocol.type] = protocol;
        else if (this.rank_info[protocol.type]) {
            let rank_list = this.rank_info[protocol.type].ranklist;
            for (let i = 0; i < protocol.ranklist.length; i++) {
                rank_list[i + protocol.listBegin] = protocol.ranklist[i];
            }
            this.rank_info[protocol.type] = protocol;
            this.rank_info[protocol.type].ranklist = rank_list;
        }
        this.result_info.is_change = !this.result_info.is_change;
    }

    public set CurRankType(type: RANK_TYPE) {
        this.cur_rank_type = type;
    }

    public get CurRankType() {
        return this.cur_rank_type;
    }

    public getRankInfo(type: RANK_TYPE) {
        return this.rank_info[type]
    }

    public IsMax(type: RANK_TYPE) {
        if (this.rank_info[type])
            return this.rank_info[type] && this.rank_info[type].ranklist.length % 10 != 0;
    }

    public GetReqParam(type: RANK_TYPE): number {
        if (!this.rank_info[type])
            return 0;
        let length = this.rank_info[type].ranklist.length;
        return length % 10 == 0 ? length : 0;
    }

    public clearRankData(type: RANK_TYPE) {
        this.rank_info[type] = null;
    }

    public GetRankList(type: RANK_TYPE) {
        let list = [];
        let my_info: { info: PB_SCRankNode, rank: number, value_show: string, name: string, server_id: number };
        let data = RankData.Inst().getRankInfo(type);
        if (data) {
            let value_show = this.GetValueShowDesc(type);
            let rank_list = data.ranklist;
            let value = 0
            let server_id = 0
            for (let i = 0; i < rank_list.length; i++) {
                let name = DataHelper.BytesToString(rank_list[i].roleinfo.name);
                if (rank_list[i].roleinfo.roleId == RoleData.Inst().GetRoleId()) {
                    value = rank_list[i].value
                }
                server_id = rank_list[i].roleinfo.roleId >> 16
                list.push({ info: rank_list[i], rank: i + 1, value_show: value_show, name: name, server_id: server_id })
            }
            my_info = { info: new PB_SCRankNode(), rank: data.myRank, value_show: value_show, name: RoleData.Inst().GetRoleName(), server_id: 0 };
            my_info.info = new PB_SCRankNode();
            my_info.info.roleinfo = new PB_RoleInfo();
            my_info.info.roleinfo.level = RoleData.Inst().GetRoleLevel();
            my_info.info.roleinfo.roleId = RoleData.Inst().GetRoleId();
            my_info.info.roleinfo.headChar = RoleData.Inst().ResultData.roleinfo.headChar
            my_info.server_id = my_info.info.roleinfo.roleId >> 16
            // my_info.info.roleinfo.name = RoleData.Inst().GetRoleName();
            my_info.info.value = value;
            switch (data.type) {
                case RANK_TYPE.TRIAL:
                    my_info.info.value = TrialData.Inst().GetTrialInfoPassLevel();
                    break;
                // case RANK_TYPE.Arena:
                //     my_info.info.value = ArenaData.Inst().GetMyScore();
                //     break;
                default:
                    my_info.info.value = data.myRankValue;
                    break;
            }
        }
        return { list: list, my_info: my_info }
    }

    public GetValueShowDesc(type: RANK_TYPE) {
        let value_show: string;
        switch (type) {
            case RANK_TYPE.TRIAL:
                value_show = Language.Trial.TrialTower.RankLayerShow;
                break;
            case RANK_TYPE.Arena:
                value_show = Language.Arena.RankScoreShow;
                break;
            default:
                value_show = "{0}";
                break;
        }
        return value_show;
    }
    public GetMyRank(type: RANK_TYPE) {
        let data = RankData.Inst().getRankInfo(type);
        return data ? data.myRank : 0;
    }

    public GetTitle(type: RANK_TYPE) {
        switch (type) {
            case RANK_TYPE.Arena:
                return Language.Arena.rank_title;
            default:
                return Language.Common.rank;
        }
    }
}

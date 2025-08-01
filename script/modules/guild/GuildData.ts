
import { CfgGuildData } from "config/CfgGuild";
import { bit } from "core/net/bit";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { GuildConfig } from "./GuildConfig";
import { GuildHelpPanel } from "./GuildHelpPanel";

export class GuildResultData {
    @smartdata
    SearchList: PB_SCGuildSearchList = new PB_SCGuildSearchList();

    @smartdata
    Info: PB_SCGuildInfo = new PB_SCGuildInfo();

    @smartdata
    ReportList: PB_SCGuildReportList = new PB_SCGuildReportList();

    @smartdata
    MemberList: PB_SCGuildMemberList = new PB_SCGuildMemberList();

    @smartdata
    AppList: PB_SCGuildAppList = new PB_SCGuildAppList();

    @smartdata
    RoleInfo: PB_SCGuildRoleInfo = new PB_SCGuildRoleInfo();

    @smartdata
    ReportListFlush: boolean = false;
}

export class GuildData extends DataBase {
    public ResultData: GuildResultData;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(GuildResultData);
    }

    public SetGuildSearchList(protocol: PB_SCGuildSearchList) {
        GuildData.Inst().ResultData.SearchList = protocol
    }

    public SetGuildInfo(protocol: PB_SCGuildInfo) {
        GuildData.Inst().ResultData.Info = protocol
    }

    public SetGuildReportList(protocol: PB_SCGuildReportList) {
        if (0 == protocol.sendType) {
            GuildHelpPanel.ListToDown = true
            GuildData.Inst().ResultData.ReportList = protocol
        } else if (1 == protocol.sendType && protocol.reportList.length > 0) {
            let report_key = protocol.reportList[0].reportKey
            let is_find = false
            for (let i = 0; i < this.ResultData.ReportList.reportList.length; i++) {
                let element = this.ResultData.ReportList.reportList[i]
                if (GuildConfig.ReportType.help == element.type && element.reportKey == report_key) {
                    is_find = true
                    this.ResultData.ReportList.reportList[i] = protocol.reportList[0]
                    break
                }
            }
            if (!is_find) {
                GuildHelpPanel.ListToDown = true
                this.ResultData.ReportList.reportList.push(protocol.reportList[0])
            }
        }
        this.ResultData.ReportListFlush = !this.ResultData.ReportListFlush
    }

    public SetGuildMemberList(protocol: PB_SCGuildMemberList) {
        GuildData.Inst().ResultData.MemberList = protocol
    }

    public SetGuildAppList(protocol: PB_SCGuildAppList) {
        GuildData.Inst().ResultData.AppList = protocol
    }

    public SetGuildRoleInfo(protocol: PB_SCGuildRoleInfo) {
        GuildData.Inst().ResultData.RoleInfo = protocol
    }


    public CfgOtherFound() {
        return CfgGuildData.other[0].found
    }

    public CfgOtherGuildPopNum() {
        return CfgGuildData.other[0].guild_pop_num
    }

    public CfgOtherWin() {
        return CfgGuildData.other[0].win[0]
    }

    public CfgOtherRebuild() {
        return CfgGuildData.other[0].rebuild[0]
    }

    public CfgOtherAdavncedBuildOpenLevel() {
        return CfgGuildData.other[0].adavnced_build_open_level
    }

    public CfgBossInfoBySeq(seq: number) {
        return CfgGuildData.guild_boss_property.find(cfg => cfg.boss_seq == seq);
    }

    public CfgBossFightInfoByTime(time: number) {
        return CfgGuildData.guild_boss_item.find(cfg => cfg.fight_time == time);
    }

    public CfgBossFightTimeMax() {
        return CfgGuildData.guild_boss_item[CfgGuildData.guild_boss_item.length - 1].fight_time
    }

    public CfgPlayExerciseCostItem(part_type: number) {
        let co = CfgGuildData.player_exercise.find(cfg => cfg.part_type == part_type)
        return co ? co.exercise[0].item_id : 0
    }

    public GetBossRewardsShow() {
        return CfgGuildData.guild_boss_property
    }

    public GetPlayerExerciseInfoByTypeIdLevel(type: number, id: number, level: number) {
        return CfgGuildData.player_exercise.find(cfg => cfg.part_type == type && cfg.part_id == id && cfg.part_level == level)
    }

    public GetHelpInfoByTypeLevel(type: number, level: number) {
        return CfgGuildData.help.find(cfg => cfg.help_type == type && cfg.level == level)
    }

    public GetGuildBossRewardIsGet(boss_seq: number) {
        let info = GuildData.Inst().ResultData.Info
        let can_get = info.bossLevel > boss_seq
        let is_get = bit.hasflag(this.ResultData.RoleInfo.fightBossRewardFlag, boss_seq)
        return { is_get, can_get }
    }


    public IsInGuild() {
        return this.ResultData.Info.guildId > 0
    }

    public IsGuildManager() {
        return GuildConfig.PositionType.member != this.ResultData.Info.mPosition
    }

    public GetGuildMemberListShow() {
        let list = []
        for (let element of this.ResultData.MemberList.memberList) {
            list.push(element)
        }
        list.sort((a: IPB_SCGuildMemberNode, b: IPB_SCGuildMemberNode) => {
            return a.position - b.position
        })
        return list
    }

    public GetGuildApplyListShow() {
        return this.ResultData.AppList.roleList
    }

    public GetGuildRepotInfoByTypeLevel(type: number, level: number) {
        let role_id = RoleData.Inst().GetRoleId()
        return this.ResultData.ReportList.reportList.find((cfg) => cfg.type == GuildConfig.ReportType.help && cfg.roleInfo.roleId == role_id && cfg.param_1 == type && cfg.param_2 == level)
    }

    public GetGuildMemberFuncs(pos: number, is_self: boolean) {
        let list: number[] = []
        let my_pos = this.ResultData.Info.mPosition
        let ot = GuildConfig.MemberOperType
        if (is_self) {
            switch (my_pos) {
                case GuildConfig.PositionType.president:
                    list = []
                    break;
                case GuildConfig.PositionType.vice_president:
                    list = [ot.exit]
                    break;
                case GuildConfig.PositionType.member:
                    list = [ot.exit]
                    break;
            }
        } else {
            switch (my_pos) {
                case GuildConfig.PositionType.president:
                    switch (pos) {
                        case GuildConfig.PositionType.vice_president:
                            list = [ot.appoint_to, ot.appoint_down, ot.kick_out]
                            break;
                        case GuildConfig.PositionType.member:
                            list = [ot.appoint_to, ot.appoint_up, ot.kick_out]
                            break;
                    }
                    break;
                case GuildConfig.PositionType.vice_president:
                    switch (pos) {
                        case GuildConfig.PositionType.member:
                            list = [ot.appoint_tov, ot.kick_out]
                            break;
                    }
                    break;
                case GuildConfig.PositionType.member:
                    list = []
                    break;
            }
        }
        return list
    }

    public GetGuildRedPoint() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Guild.Main));
        if (!open_t.is_open) {
            return 0
        }
        return 1 == this.GetGuildBossRedPoint() ? 1 : 0;
    }

    public GetGuildBossRedPoint() {
        let info = GuildData.Inst().ResultData.Info
        let co = GuildData.Inst().CfgBossFightInfoByTime(info.bossFightTime + 1)
        return co && co.fight_item_num > 0 ? 0 : 1
    }
}

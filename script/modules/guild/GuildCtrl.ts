
import { LogError } from 'core/Debugger';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { DataHelper } from '../../helpers/DataHelper';
import { GuildConfig } from './GuildConfig';
import { GuildData } from './GuildData';

export class GuildCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCGuildSearchList, func: this.OnGuildSearchList },
            { msgType: PB_SCGuildInfo, func: this.OnGuildInfo },
            { msgType: PB_SCGuildReportList, func: this.OnGuildReportList },
            { msgType: PB_SCGuildMemberList, func: this.OnGuildMemberList },
            { msgType: PB_SCGuildAppList, func: this.OnGuildAppList },
            { msgType: PB_SCGuildRoleInfo, func: this.OnGuildRoleInfo },
        ]
    }

    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Guild.Main, GuildData.Inst().ResultData, GuildData.Inst().GetGuildRedPoint.bind(GuildData.Inst(), "Info")));
    }

    public OnGuildSearchList(protocol: PB_SCGuildSearchList) {
        LogError("OnGuildSearchList", protocol)
        GuildData.Inst().SetGuildSearchList(protocol);
    }

    public OnGuildInfo(protocol: PB_SCGuildInfo) {
        LogError("OnGuildInfo", protocol)
        GuildData.Inst().SetGuildInfo(protocol);
    }

    public OnGuildReportList(protocol: PB_SCGuildReportList) {
        LogError("OnGuildReportList", protocol)
        GuildData.Inst().SetGuildReportList(protocol);
    }

    public OnGuildMemberList(protocol: PB_SCGuildMemberList) {
        LogError("OnGuildMemberList", protocol)
        GuildData.Inst().SetGuildMemberList(protocol);
    }

    public OnGuildAppList(protocol: PB_SCGuildAppList) {
        LogError("OnGuildAppList", protocol)
        GuildData.Inst().SetGuildAppList(protocol);
    }

    public OnGuildRoleInfo(protocol: PB_SCGuildRoleInfo) {
        LogError("OnGuildRoleInfo", protocol)
        GuildData.Inst().SetGuildRoleInfo(protocol);
    }

    public SendGuildReq(type: number, param: number[] = [], str_param: string = "") {
        let protocol = this.GetProtocol(PB_CSGuildReq);
        protocol.reqType = type;
        protocol.param = param;
        protocol.strParam = DataHelper.StringToByte(str_param);
        this.SendToServer(protocol);
    }

    public SendGuildReqGuildInfo() {
        this.SendGuildReq(GuildConfig.ReqType.guild_info);
    }

    public SendGuildReqGuildList() {
        this.SendGuildReq(GuildConfig.ReqType.guild_list);
    }

    public SendGuildReqSearchGuild(search_content: string) {
        this.SendGuildReq(GuildConfig.ReqType.search_guild, [], search_content);
    }

    public SendGuildReqCreateGuild(guild_icon: number, guild_name: string) {
        this.SendGuildReq(GuildConfig.ReqType.create_guild, [guild_icon], guild_name);
    }

    public SendGuildReqJoinGuild(guild_id: number) {
        this.SendGuildReq(GuildConfig.ReqType.join_guild, [guild_id]);
    }

    public SendGuildReqApplyGuild(uid: number, is_agree: boolean) {
        this.SendGuildReq(GuildConfig.ReqType.apply_guild, [uid, is_agree ? 1 : 0]);
    }

    public SendGuildReqHelp(help_type: number) {
        this.SendGuildReq(GuildConfig.ReqType.help, [help_type]);
    }

    public SendGuildHelpRet(report_key: number) {
        this.SendGuildReq(GuildConfig.ReqType.help_ret, [report_key]);
    }

    public SendGuildReqSetGuild(level_limit: number, auto_apply: number, search_limit: number) {
        this.SendGuildReq(GuildConfig.ReqType.set_guild, [level_limit, auto_apply, search_limit]);
    }

    public SendGuildReqSetNotice(notice: string) {
        this.SendGuildReq(GuildConfig.ReqType.set_notice, [], notice);
    }

    public SendGuildReqAppoint(uid: number, position: number) {
        this.SendGuildReq(GuildConfig.ReqType.appoint, [uid, position]);
    }

    public SendGuildReqFightBoss() {
        this.SendGuildReq(GuildConfig.ReqType.fight_boss);
    }

    public SendGuildReqReportList() {
        if (GuildData.Inst().IsInGuild()) {
            this.SendGuildReq(GuildConfig.ReqType.report_list);
        }
    }

    public SendGuildReqMemberList() {
        this.SendGuildReq(GuildConfig.ReqType.member_list);
    }

    public SendGuildExercise(part_type: number, part_id: number) {
        this.SendGuildReq(GuildConfig.ReqType.exercise, [part_type, part_id]);
    }

    public SendGuildReqQuit() {
        this.SendGuildReq(GuildConfig.ReqType.quit);
    }

    public SendGuildReqKickOut(uid: number) {
        this.SendGuildReq(GuildConfig.ReqType.kick_out, [uid]);
    }

    public SendGuildReqFetchPassReward(boss_seq: number) {
        this.SendGuildReq(GuildConfig.ReqType.fetch_pass_reward, [boss_seq]);
    }

    public SendGuildReqExerciseReset(part_type: number) {
        this.SendGuildReq(GuildConfig.ReqType.exercise_reset, [part_type]);
    }

    public SendGuildReqDismiss() {
        this.SendGuildReq(GuildConfig.ReqType.dismiss);
    }
}


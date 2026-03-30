import { LogError } from "core/Debugger";
import { RemindRegister } from "data/HandleCollectorCfg";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { SkillData } from "modules/skill/SkillData";

export enum ROLE_SKILL_OPERA_REQ_TYPE {
    INFO = 0,
    LEARN_SKILL = 1,
    ONE_KEY_LEVEL_UP = 2,
}

export enum ROLE_TALENT_OPERA_REQ_TYPE {
    INFO = 0,
    LEARN_TALENT_SKILL = 1,
}

export class SkillCtrl extends BaseCtrl {
    private skillRefreshTimer: any = null;
    private talentRefreshTimer: any = null;

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRoleSkillAllInfo, func: this.onRoleSkillAllInfo },
            { msgType: PB_SCRoleTalentAllInfo, func: this.onRoleTalentAllInfo },
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(
            Mod.Skill.View,
            SkillData.Inst().flushData,
            this.getSkillModuleRedNum.bind(this),
            "skillChange",
            "talentChange",
        ));
    }

    private onRoleSkillAllInfo(protocol: PB_SCRoleSkillAllInfo) {
        this.clearSkillRefreshTimer()
        LogError("1471?角色技能信息?onRoleSkillAllInfo", protocol)
        SkillData.Inst().SetSkillInfo(protocol)
    }

    private onRoleTalentAllInfo(protocol: PB_SCRoleTalentAllInfo) {
        this.clearTalentRefreshTimer()
        LogError("1481?角色天赋信息?onRoleTalentAllInfo", protocol)
        SkillData.Inst().SetTalentInfo(protocol)
    }

    public SendRoleSkillInfoReq() {
        const protocol = this.GetProtocol(PB_CSRoleSkillOperaReq)
        protocol.reqType = ROLE_SKILL_OPERA_REQ_TYPE.INFO
        protocol.param1 = 0
        this.SendToServer(protocol)
    }

    public SendLearnSkillReq(skillId: number) {
        const protocol = this.GetProtocol(PB_CSRoleSkillOperaReq)
        protocol.reqType = ROLE_SKILL_OPERA_REQ_TYPE.LEARN_SKILL
        protocol.param1 = skillId
        this.SendToServer(protocol)
        this.scheduleSkillRefreshFallback()
    }

    public SendOneKeyLevelUpReq() {
        const protocol = this.GetProtocol(PB_CSRoleSkillOperaReq)
        protocol.reqType = ROLE_SKILL_OPERA_REQ_TYPE.ONE_KEY_LEVEL_UP
        protocol.param1 = 0
        this.SendToServer(protocol)
        this.scheduleSkillRefreshFallback()
    }

    public SendRoleTalentInfoReq() {
        const protocol = this.GetProtocol(PB_CSRoleTalentOperaReq)
        protocol.reqType = ROLE_TALENT_OPERA_REQ_TYPE.INFO
        protocol.param1 = 0
        this.SendToServer(protocol)
    }

    public SendLearnTalentReq(skillId: number) {
        const protocol = this.GetProtocol(PB_CSRoleTalentOperaReq)
        protocol.reqType = ROLE_TALENT_OPERA_REQ_TYPE.LEARN_TALENT_SKILL
        protocol.param1 = skillId
        this.SendToServer(protocol)
        this.scheduleTalentRefreshFallback()
    }

    private getSkillModuleRedNum() {
        if (!FunOpen.Inst().GetFunIsOpen(Mod.Skill.View).is_open) {
            return 0
        }
        return SkillData.Inst().HasUpgradeableSkill() || SkillData.Inst().HasUpgradeableTalent() ? 1 : 0
    }

    private scheduleSkillRefreshFallback() {
        this.clearSkillRefreshTimer()
        this.skillRefreshTimer = setTimeout(() => {
            this.skillRefreshTimer = null
            this.SendRoleSkillInfoReq()
        }, 500)
    }

    private scheduleTalentRefreshFallback() {
        this.clearTalentRefreshTimer()
        this.talentRefreshTimer = setTimeout(() => {
            this.talentRefreshTimer = null
            this.SendRoleTalentInfoReq()
        }, 500)
    }

    private clearSkillRefreshTimer() {
        if (this.skillRefreshTimer != null) {
            clearTimeout(this.skillRefreshTimer)
            this.skillRefreshTimer = null
        }
    }

    private clearTalentRefreshTimer() {
        if (this.talentRefreshTimer != null) {
            clearTimeout(this.talentRefreshTimer)
            this.talentRefreshTimer = null
        }
    }
}

export default SkillCtrl


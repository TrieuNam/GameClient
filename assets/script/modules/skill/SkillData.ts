import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { CfgPassiveSkillData } from "config/CfgPassiveSkill";
import { CfgSingleSkillData } from "config/CfgSingleSkill";

class SkillFlushData {
    @smartdata
    skillChange: boolean;

    @smartdata
    talentChange: boolean;
}

export class SkillData extends DataBase {
    public flushData: SkillFlushData;
    private skillInfo: PB_SCRoleSkillAllInfo;
    private talentInfo: PB_SCRoleTalentAllInfo;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flushData = CreateSMD(SkillFlushData);
    }

    protected onSwitch(): void {
        this.skillInfo = undefined;
        this.talentInfo = undefined;
    }

    public SetSkillInfo(data: PB_SCRoleSkillAllInfo) {
        this.skillInfo = data;
        if (this.skillInfo && this.skillInfo.skillList) {
            this.skillInfo.skillList = [...this.skillInfo.skillList].sort((a, b) => {
                return (a.skillIndex ?? 0) - (b.skillIndex ?? 0) || (a.skillId ?? 0) - (b.skillId ?? 0);
            });
            this.skillInfo.skillCount = this.skillInfo.skillList.length;
        }
        this.flushData.skillChange = !this.flushData.skillChange;
    }

    public SetTalentInfo(data: PB_SCRoleTalentAllInfo) {
        this.talentInfo = data;
        if (this.talentInfo && this.talentInfo.talentSkillList) {
            this.talentInfo.talentSkillList = [...this.talentInfo.talentSkillList].sort((a, b) => {
                return (a.skillId ?? 0) - (b.skillId ?? 0);
            });
            this.talentInfo.talentSkillCount = this.talentInfo.talentSkillList.length;
        }
        this.flushData.talentChange = !this.flushData.talentChange;
    }

    public GetSkillInfo() {
        return this.skillInfo;
    }

    public GetTalentInfo() {
        return this.talentInfo;
    }

    public GetSkillList() {
        return this.skillInfo?.skillList ?? [];
    }

    public GetTalentList() {
        return this.talentInfo?.talentSkillList ?? [];
    }

    public HasSkillInfoLoaded() {
        return this.skillInfo != undefined;
    }

    public HasTalentInfoLoaded() {
        return this.talentInfo != undefined;
    }

    public HasUpgradeableSkill() {
        if (!this.HasSkillInfoLoaded()) {
            return false;
        }

        const maxLevelMap = new Map<number, number>();
        (CfgSingleSkillData?.skill_cfg ?? []).forEach((cfg) => {
            const currentMax = maxLevelMap.get(cfg.skill_id) ?? 0;
            if (cfg.skill_level > currentMax) {
                maxLevelMap.set(cfg.skill_id, cfg.skill_level);
            }
        });

        if (maxLevelMap.size == 0) {
            return false;
        }

        const currentLevelMap = new Map<number, number>();
        this.GetSkillList().forEach((info) => {
            currentLevelMap.set(info.skillId, info.skillLevel ?? 0);
        });

        for (const [skillId, maxLevel] of maxLevelMap) {
            const currentLevel = currentLevelMap.get(skillId) ?? 0;
            if (currentLevel < maxLevel) {
                return true;
            }
        }

        return false;
    }

    public HasUpgradeableTalent() {
        if (!this.HasTalentInfoLoaded()) {
            return false;
        }

        const maxLevelMap = new Map<number, number>();
        (CfgPassiveSkillData?.passive_cfg ?? []).forEach((cfg) => {
            const currentMax = maxLevelMap.get(cfg.skill_id) ?? 0;
            if (cfg.skill_level > currentMax) {
                maxLevelMap.set(cfg.skill_id, cfg.skill_level);
            }
        });

        if (maxLevelMap.size == 0) {
            return false;
        }

        const currentLevelMap = new Map<number, number>();
        this.GetTalentList().forEach((info) => {
            currentLevelMap.set(info.skillId, info.skillLevel ?? 0);
        });

        for (const [skillId, maxLevel] of maxLevelMap) {
            const currentLevel = currentLevelMap.get(skillId) ?? 0;
            if (currentLevel < maxLevel) {
                return true;
            }
        }

        return false;
    }
}


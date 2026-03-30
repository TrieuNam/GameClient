import { Color } from "cc";
import { CfgPassiveSkill, CfgPassiveSkillData } from "config/CfgPassiveSkill";
import { CfgSingleSkill, CfgSingleSkillData } from "config/CfgSingleSkill";
import * as fgui from "fairygui-cc";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { PetSkillMapCell } from "modules/Pet/PetSkillMapView";
import { TabPetSkill } from "modules/Pet/PetSkillSelView";
import { SkillCtrl } from "modules/skill/SkillCtrl";
import { SkillData } from "modules/skill/SkillData";

const enum RoleSkillTab {
    Skill = 0,
    Talent = 1,
}

type SkillCatalogRow = {
    skillId: number,
    name: string,
    titleName: string,
    detail: string,
    currentLevel: number,
    maxLevel: number,
    locked: boolean,
    useSkillCell: boolean,
    isSelected?: boolean,
    onClick?: (data: SkillCatalogRow) => void,
}

type ActionButton = {
    root: fgui.GComponent,
    bg: fgui.GGraph,
    label: fgui.GTextField,
    enabled: boolean,
}

@BaseView.registView
export class SkillView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetSkill",
        ViewName: "PetSkillMapView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        ListSkill: <fgui.GList>null,
        ListTab: <fgui.GList>null,
    }

    protected extendsCfg = [
        { ResName: "TabPetSkill", ExtendsClass: TabPetSkill },
        { ResName: "PetSkillMapCell", ExtendsClass: PetSkillMapCell },
    ];

    private rows: { [key: number]: SkillCatalogRow[] } = {
        [RoleSkillTab.Skill]: [],
        [RoleSkillTab.Talent]: [],
    };
    private selectedSkillId: { [key: number]: number } = {};
    private footer: fgui.GComponent;
    private footerTitle: fgui.GTextField;
    private footerDesc: fgui.GTextField;
    private primaryBtn: ActionButton;
    private secondaryBtn: ActionButton;

    InitData() {
        this.viewNode.Board.SetData(new BoardData(SkillView, Language.Skill.MainTitle));
        this.viewNode.ListSkill.setVirtual();
        this.viewNode.ListSkill.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.ListTab.SetData([Language.Skill.TabSkill, Language.Skill.TabTalent]);
        this.viewNode.ListTab.selectedIndex = RoleSkillTab.Skill;
        this.createFooter();

        this.AddSmartDataCare(SkillData.Inst().flushData, this.onSkillFlush.bind(this), "skillChange");
        this.AddSmartDataCare(SkillData.Inst().flushData, this.onTalentFlush.bind(this), "talentChange");

        this.rebuildRows(RoleSkillTab.Skill);
        this.rebuildRows(RoleSkillTab.Talent);
        this.refreshCurrentTab();

        SkillCtrl.Inst().SendRoleSkillInfoReq();
        SkillCtrl.Inst().SendRoleTalentInfoReq();
    }

    InitUI() {
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.onClickTab, this);
    }

    private onClickTab() {
        this.refreshCurrentTab();
    }

    private onSkillFlush() {
        this.rebuildRows(RoleSkillTab.Skill);
        if (this.getCurrentTab() == RoleSkillTab.Skill) {
            this.refreshCurrentTab();
        }
    }

    private onTalentFlush() {
        this.rebuildRows(RoleSkillTab.Talent);
        if (this.getCurrentTab() == RoleSkillTab.Talent) {
            this.refreshCurrentTab();
        }
    }

    private createFooter() {
        const list = this.viewNode.ListSkill;
        const footerHeight = 172;
        list.height = Math.max(240, list.height - footerHeight - 10);

        this.footer = new fgui.GComponent();
        this.footer.setSize(list.width, footerHeight);
        this.footer.x = list.x;
        this.footer.y = list.y + list.height + 10;
        this.view.addChild(this.footer);

        const bg = new fgui.GGraph();
        bg.setSize(this.footer.width, this.footer.height);
        bg.touchable = false;
        bg.drawRect(2, new Color(178, 136, 67, 255), new Color(25, 31, 48, 245), [12, 12, 12, 12]);
        this.footer.addChild(bg);

        this.footerTitle = new fgui.GTextField();
        this.footerTitle.setSize(this.footer.width - 24, 28);
        this.footerTitle.x = 12;
        this.footerTitle.y = 10;
        this.footerTitle.fontSize = 24;
        this.footerTitle.color = new Color(255, 233, 187, 255);
        this.footer.addChild(this.footerTitle);

        this.footerDesc = new fgui.GTextField();
        this.footerDesc.setSize(this.footer.width - 24, 78);
        this.footerDesc.x = 12;
        this.footerDesc.y = 42;
        this.footerDesc.fontSize = 20;
        this.footerDesc.color = new Color(228, 230, 235, 255);
        this.footerDesc.leading = 6;
        this.footerDesc.singleLine = false;
        this.footer.addChild(this.footerDesc);

        const btnWidth = Math.floor((this.footer.width - 36) / 2);
        this.primaryBtn = this.createActionButton(12, 124, btnWidth, 38, Language.Skill.Learn);
        this.secondaryBtn = this.createActionButton(24 + btnWidth, 124, btnWidth, 38, Language.Skill.OneKeyLevelUp);
        this.primaryBtn.root.onClick(this.onClickPrimary, this);
        this.secondaryBtn.root.onClick(this.onClickSecondary, this);
    }

    private createActionButton(x: number, y: number, width: number, height: number, label: string): ActionButton {
        const root = new fgui.GComponent();
        root.setSize(width, height);
        root.x = x;
        root.y = y;
        root.touchable = true;

        const bg = new fgui.GGraph();
        bg.setSize(width, height);
        bg.touchable = false;
        bg.drawRect(2, new Color(245, 210, 130, 255), new Color(72, 102, 194, 255), [8, 8, 8, 8]);
        root.addChild(bg);

        const txt = new fgui.GTextField();
        txt.setSize(width, height);
        txt.fontSize = 20;
        txt.align = fgui.AlignType.Center;
        txt.verticalAlign = fgui.VertAlignType.Middle;
        txt.touchable = false;
        txt.color = new Color(255, 255, 255, 255);
        txt.text = label;
        root.addChild(txt);

        this.footer.addChild(root);
        return {
            root,
            bg,
            label: txt,
            enabled: true,
        };
    }

    private rebuildRows(tab: RoleSkillTab) {
        this.rows[tab] = tab == RoleSkillTab.Skill ? this.buildSkillRows() : this.buildTalentRows();
        this.applySelection(tab);
    }

    private buildSkillRows(): SkillCatalogRow[] {
        const rows: SkillCatalogRow[] = [];
        const cfgGroup = new Map<number, CfgSingleSkill[]>();
        const skillInfoMap = new Map<number, IPB_RoleSkillInfoPro>();

        SkillData.Inst().GetSkillList().forEach((info) => {
            skillInfoMap.set(info.skillId, info);
        });

        (CfgSingleSkillData?.skill_cfg ?? []).forEach((cfg) => {
            if (!cfgGroup.has(cfg.skill_id)) {
                cfgGroup.set(cfg.skill_id, []);
            }
            cfgGroup.get(cfg.skill_id).push(cfg);
        });

        cfgGroup.forEach((cfgList, skillId) => {
            cfgList.sort((a, b) => a.skill_level - b.skill_level);
            const currentLevel = skillInfoMap.get(skillId)?.skillLevel ?? 0;
            const maxLevel = cfgList[cfgList.length - 1]?.skill_level ?? 1;
            const displayCfg = this.findSingleSkillCfg(cfgList, currentLevel);
            rows.push({
                skillId,
                titleName: displayCfg.skill_name,
                name: `${displayCfg.skill_name}  ${currentLevel > 0 ? `Lv.${Math.min(currentLevel, maxLevel)}/${maxLevel}` : Language.Skill.Unlearned}`,
                detail: this.getSingleSkillDetail(displayCfg, currentLevel, maxLevel),
                currentLevel,
                maxLevel,
                locked: currentLevel <= 0,
                useSkillCell: false,
                onClick: this.onClickRow.bind(this),
            });
        });

        rows.sort((a, b) => a.skillId - b.skillId);
        return rows;
    }

    private buildTalentRows(): SkillCatalogRow[] {
        const rows: SkillCatalogRow[] = [];
        const cfgGroup = new Map<number, CfgPassiveSkill[]>();
        const talentInfoMap = new Map<number, IPB_RoleTalentInfoPro>();

        SkillData.Inst().GetTalentList().forEach((info) => {
            talentInfoMap.set(info.skillId, info);
        });

        (CfgPassiveSkillData?.passive_cfg ?? []).forEach((cfg) => {
            if (!cfgGroup.has(cfg.skill_id)) {
                cfgGroup.set(cfg.skill_id, []);
            }
            cfgGroup.get(cfg.skill_id).push(cfg);
        });

        cfgGroup.forEach((cfgList, skillId) => {
            cfgList.sort((a, b) => a.skill_level - b.skill_level);
            const currentLevel = talentInfoMap.get(skillId)?.skillLevel ?? 0;
            const maxLevel = cfgList[cfgList.length - 1]?.skill_level ?? 1;
            const displayCfg = this.findPassiveSkillCfg(cfgList, currentLevel);
            rows.push({
                skillId,
                titleName: displayCfg.skill_name,
                name: `${displayCfg.skill_name}  ${currentLevel > 0 ? `Lv.${Math.min(currentLevel, maxLevel)}/${maxLevel}` : Language.Skill.Unlearned}`,
                detail: this.getPassiveSkillDetail(cfgList, currentLevel, maxLevel),
                currentLevel,
                maxLevel,
                locked: currentLevel <= 0,
                useSkillCell: true,
                onClick: this.onClickRow.bind(this),
            });
        });

        rows.sort((a, b) => a.skillId - b.skillId);
        return rows;
    }

    private findSingleSkillCfg(cfgList: CfgSingleSkill[], currentLevel: number) {
        const targetLevel = Math.max(1, currentLevel);
        let result = cfgList[0];
        for (let i = 0; i < cfgList.length; i++) {
            if (cfgList[i].skill_level <= targetLevel) {
                result = cfgList[i];
            } else {
                break;
            }
        }
        return result;
    }

    private findPassiveSkillCfg(cfgList: CfgPassiveSkill[], currentLevel: number) {
        const targetLevel = Math.max(1, currentLevel);
        let result = cfgList[0];
        for (let i = 0; i < cfgList.length; i++) {
            if (cfgList[i].skill_level <= targetLevel) {
                result = cfgList[i];
            } else {
                break;
            }
        }
        return result;
    }

    private getSingleSkillDetail(cfg: CfgSingleSkill, currentLevel: number, maxLevel: number) {
        const targetSide = cfg.target_side_type == 1 ? Language.Skill.TargetEnemy : Language.Skill.TargetAlly;
        const flags: string[] = [];
        if (cfg.is_shanbi == 1) flags.push(Language.Skill.FlagDodge);
        if (cfg.is_baoji == 1) flags.push(Language.Skill.FlagCrit);
        if (cfg.is_lianji == 1) flags.push(Language.Skill.FlagCombo);
        if (cfg.is_xixue == 1) flags.push(Language.Skill.FlagLeech);
        if (cfg.is_jiyun == 1) flags.push(Language.Skill.FlagLucky);
        if (cfg.is_fanji == 1) flags.push(Language.Skill.FlagCounter);
        const levelText = currentLevel > 0 ? `Lv.${Math.min(currentLevel, maxLevel)}/${maxLevel}` : Language.Skill.Unlearned;
        return `${Language.Skill.CurrentLevelLabel}${levelText}\n${Language.Skill.TargetLabel}${targetSide}${cfg.target_num}${Language.Skill.TargetUnit}\n${Language.Skill.FeatureLabel}${flags.length > 0 ? flags.join("、") : Language.Skill.BasicAttackDesc}`;
    }

    private getPassiveSkillDetail(cfgList: CfgPassiveSkill[], currentLevel: number, maxLevel: number) {
        const cfg = this.findPassiveSkillCfg(cfgList, currentLevel);
        const levelText = currentLevel > 0 ? `Lv.${Math.min(currentLevel, maxLevel)}/${maxLevel}` : Language.Skill.Unlearned;
        return `${Language.Skill.CurrentLevelLabel}${levelText}\n${cfg?.skill_desc ?? Language.Skill.NoDetail}`;
    }

    private applySelection(tab: RoleSkillTab) {
        const rows = this.rows[tab];
        let selectedId = this.selectedSkillId[tab];
        if (!selectedId || !rows.some((row) => row.skillId == selectedId)) {
            selectedId = rows[0]?.skillId;
        }
        this.selectedSkillId[tab] = selectedId;
        rows.forEach((row) => {
            row.isSelected = row.skillId == selectedId;
            row.onClick = this.onClickRow.bind(this);
        });
    }

    private refreshCurrentTab() {
        const rows = this.rows[this.getCurrentTab()] ?? [];
        this.applySelection(this.getCurrentTab());
        this.viewNode.ListSkill.numItems = rows.length;
        this.refreshFooter();
    }

    private renderListItem(index: number, item: PetSkillMapCell) {
        const rows = this.rows[this.getCurrentTab()] ?? [];
        item.SetData(rows[index]);
    }

    private onClickRow(data: SkillCatalogRow) {
        this.selectedSkillId[this.getCurrentTab()] = data.skillId;
        this.refreshCurrentTab();
    }

    private refreshFooter() {
        const row = this.getSelectedRow();
        if (!row) {
            this.footerTitle.text = Language.Skill.MainTitle;
            this.footerDesc.text = Language.Skill.EmptyViewTips;
            this.setActionButton(this.primaryBtn, Language.Skill.Learn, false);
            this.setActionButton(this.secondaryBtn, Language.Skill.Refresh, true);
            return;
        }

        const isMax = row.currentLevel >= row.maxLevel && row.maxLevel > 0;
        const levelText = row.currentLevel > 0 ? `Lv.${Math.min(row.currentLevel, row.maxLevel)}/${row.maxLevel}` : Language.Skill.Unlearned;
        this.footerTitle.text = `${row.titleName}  ${levelText}`;
        this.footerDesc.text = row.detail;

        if (this.getCurrentTab() == RoleSkillTab.Skill) {
            this.setActionButton(this.primaryBtn, isMax ? Language.Skill.MaxLevel : (row.currentLevel > 0 ? Language.Skill.LevelUp : Language.Skill.Learn), !isMax);
            this.setActionButton(this.secondaryBtn, Language.Skill.OneKeyLevelUp, true);
        } else {
            this.setActionButton(this.primaryBtn, isMax ? Language.Skill.MaxLevel : (row.currentLevel > 0 ? Language.Skill.LevelUp : Language.Skill.Learn), !isMax);
            this.setActionButton(this.secondaryBtn, Language.Skill.Refresh, true);
        }
    }

    private setActionButton(btn: ActionButton, label: string, enabled: boolean) {
        btn.enabled = enabled;
        btn.label.text = label;
        btn.root.alpha = enabled ? 1 : 0.45;
    }

    private onClickPrimary() {
        if (!this.primaryBtn.enabled) {
            return;
        }
        const row = this.getSelectedRow();
        if (!row) {
            return;
        }
        if (this.getCurrentTab() == RoleSkillTab.Skill) {
            SkillCtrl.Inst().SendLearnSkillReq(row.skillId);
            return;
        }
        SkillCtrl.Inst().SendLearnTalentReq(row.skillId);
    }

    private onClickSecondary() {
        if (!this.secondaryBtn.enabled) {
            return;
        }
        if (this.getCurrentTab() == RoleSkillTab.Skill) {
            SkillCtrl.Inst().SendOneKeyLevelUpReq();
            return;
        }
        SkillCtrl.Inst().SendRoleTalentInfoReq();
    }

    private getCurrentTab() {
        return this.viewNode.ListTab.selectedIndex == RoleSkillTab.Talent ? RoleSkillTab.Talent : RoleSkillTab.Skill;
    }

    private getSelectedRow() {
        const rows = this.rows[this.getCurrentTab()] ?? [];
        const selectedId = this.selectedSkillId[this.getCurrentTab()];
        return rows.find((row) => row.skillId == selectedId);
    }
}


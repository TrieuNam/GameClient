// import { CapabilityData } from "config/CfgCapability";
import { CfgAttrUp, GetCfgValue } from "config/CfgCommon";
import { CfgAttScore, CfgScoreData } from "config/CfgScore";
import { AttChangeData } from "modules/Angel/AngelData";
import { AttrTypeForName, BATTLE_ATTR, IsPercent } from "modules/common/CommonEnum";
import { AttrContItem, AttrItem, KeyFunction } from "modules/common/CommonType";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "./DataHelper";

export let AttrHelper: KeyFunction = {};

//万分比属性处理
AttrHelper.Percent = function (attr_type: number, attr_value: number) {
    if (IsPercent[attr_type] == true) {
        return `${attr_value / 100}%`;
    }
    return attr_value;
}

//两个属性列表相加
AttrHelper.AddAttrList = function (value_1: any, value_2: any, is_key?: boolean) {
    if (is_key == true) {
        let value_list: { [key: string]: number } = {}
        for (const k in AttrTypeForName) {
            value_list[k] = (value_1[k] ?? 0) + (value_2[k] ?? 0);
        }
        return value_list;
    }
    else {
        let value_list: { [key: number]: number } = {}
        for (const k in AttrTypeForName) {
            const v = AttrTypeForName[k];
            value_list[v] = (value_1[v] ?? 0) + (value_2[v] ?? 0);
        }
        return value_list;
    }
}

//获取战力（基础战力）
AttrHelper.GetCapability = function (attr_list: AttrItem[]): number {
    let capability = 0;
    for (const item of attr_list) {
        // capability+=item.attr_value * CapabilityData.GetCapabilityValue(item.attr_type);
    }
    return capability;
}

//获取属性列表AttrItem[] [type:add]
AttrHelper.GetAttrList = function (attr: any): AttrItem[] {
    let attr_list: AttrItem[] = [];
    for (const key in attr) {
        attr_list.push({ attr_type: attr[key].type, attr_value: attr[key].add });
    }
    return attr_list;
}

AttrHelper.GetAttrBaseAddList = function (attrs: CfgAttrUp[]): { base_list: CfgAttrUp[], add_list: CfgAttrUp[] } {
    let base_list: CfgAttrUp[] = [], add_list: CfgAttrUp[] = [];
    for (let i = 0; i < attrs.length; i++) {
        let type = attrs[i].type;
        if (type <= BATTLE_ATTR.SPEED) {
            base_list[type - 1] = attrs[i];
        } else {
            add_list.push(attrs[i]);
        }
    }
    for (let i = 0; i < BATTLE_ATTR.SPEED; i++) {
        if (!base_list[i]) {
            base_list[i] = new CfgAttrUp(i + 1, 0);
        }
    }
    return { base_list: base_list, add_list: add_list };
}

AttrHelper.GetPower = function (attrs: CfgAttrUp[], isCover = true): number {
    let func_getscore = function (type: number, cfg: CfgAttScore): number {
        switch (type) {
            case BATTLE_ATTR.BATTLE_ATTR_MIN:
                return 0;
            case BATTLE_ATTR.SPEED:
                return cfg.speed_score;
            case BATTLE_ATTR.HP:
                return cfg.hp_score;
            case BATTLE_ATTR.ATTACK:
                return cfg.att_score;
            case BATTLE_ATTR.ARMOR:
                return cfg.def_score;
            case BATTLE_ATTR.VAMPIRIC:
                return cfg.xixue_score;
            case BATTLE_ATTR.COUNTER:
                return cfg.fanji_score;
            case BATTLE_ATTR.COMBO:
                return cfg.lianji_score;
            case BATTLE_ATTR.EVASION:
                return cfg.shanbi_score;
            case BATTLE_ATTR.CRITICAL:
                return cfg.baoji_score;
            case BATTLE_ATTR.STUN:
                return cfg.jiyun_score;
            case BATTLE_ATTR.VAMPIRIC_IMMUNITY:
                return cfg.de_xixue_score;
            case BATTLE_ATTR.COUNTER_IMMUNITY:
                return cfg.de_fanji_score;
            case BATTLE_ATTR.COMBO_IMMUNITY:
                return cfg.de_lianji_score;
            case BATTLE_ATTR.EVASION_IMMUNITY:
                return cfg.de_shanbi_score;
            case BATTLE_ATTR.CRITICAL_IMMUNITY:
                return cfg.de_baoji_score;
            case BATTLE_ATTR.STUN_IMMUNITY:
                return cfg.de_jiyun_score;
            case BATTLE_ATTR.TYRANNY:
                return cfg.baonue_score;
            case BATTLE_ATTR.BENEVOLENCE:
                return cfg.renai_score;
            case BATTLE_ATTR.MUDDY:
                return cfg.nining_score;
            case BATTLE_ATTR.INTERDICTION:
                return cfg.jinliao_score;
            case BATTLE_ATTR.REJUVENATION:
                return cfg.huifu_score;
            case BATTLE_ATTR.BULLYING:
                return cfg.qiling_score;
            case BATTLE_ATTR.PILLAGE:
                return cfg.luecai_score;
            case BATTLE_ATTR.GLADIATUS:
                return cfg.jiaodoushi_score;
            case BATTLE_ATTR.TRUE_DAMAGE:
                return cfg.zuizhongshanghai_score;
        }
        return 0;
    }
    let role_level = RoleData.Inst().GetRoleLevel();
    let cfg = CfgScoreData.att_score[role_level - 1];
    let power = 0;
    for (let i = 0; i < attrs.length; i++) {
        let type = attrs[i].type ?? GetCfgValue(attrs[i], "attrType");
        let value = attrs[i].add ?? GetCfgValue(attrs[i], "attrValue");
        let score = func_getscore(type, cfg);
        let num = IsPercent[type] ? 40 : 1;
        power += Math.floor(score * value / num);
    }
    if (isCover)
        power = DataHelper.ConverMoney(power)
    return power;
}
/**装备属性转属性数组 */
AttrHelper.EquipAttrToAttrUp = function (data: PB_EquipData): CfgAttrUp[] {
    let attrs: CfgAttrUp[] = [];
    attrs.push(new CfgAttrUp(BATTLE_ATTR.HP, data.hp));
    attrs.push(new CfgAttrUp(BATTLE_ATTR.ATTACK, data.attack));
    attrs.push(new CfgAttrUp(BATTLE_ATTR.ARMOR, data.defend));
    attrs.push(new CfgAttrUp(BATTLE_ATTR.SPEED, data.speed));
    if (data.attrType1)
        attrs.push(new CfgAttrUp(data.attrType1, data.attrValue1));
    if (data.attrType2)
        attrs.push(new CfgAttrUp(data.attrType2, data.attrValue2));
    return attrs;
}

/**属性改变数组 */
AttrHelper.AttrChangeData = function (cur_attr: CfgAttrUp[], next_attr: CfgAttrUp[]): AttChangeData[]{
    let att_change: Map<number, AttChangeData> = new Map();
    for (let i = 0; i < cur_attr.length; i++) {
        let type = cur_attr[i].type;
        let add = cur_attr[i].add;
        let data = att_change.get(type) ?? new AttChangeData();
        data.type = type;
        data.cur_num = add;
        data.next_num = next_attr?add:0;
        att_change.set(type, data);
    }
    if (next_attr)
        for (let i = 0; i < next_attr.length; i++) {
            let type = next_attr[i].type;
            let add = next_attr[i].add;
            let data = att_change.get(type) ?? new AttChangeData();
            data.type = type;
            data.cur_num =  data.cur_num ??0;
            data.next_num = add;
            att_change.set(type, data);
        }
    return Array.from(att_change.values());
}
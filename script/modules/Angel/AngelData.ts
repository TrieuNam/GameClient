import { Color } from "cc";
import { CfgAngel, CfgAngelData, CfgAngelRes, CfgAngelResUp } from "config/CfgAngel";
import { CfgAttrUp, CfgItem } from "config/CfgCommon";
import { CfgEquipAngleData } from "config/CfgEquipmentAngle";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from 'data/SmartData';
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item, ItemData } from "modules/bag/ItemData";
import { COLORS } from "modules/common/ColorEnum";
import { BATTLE_ATTR } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommGetData, CommGetType, CommonGetView } from "modules/common_account/CommonGetView";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { CfgHelper } from "../../helpers/CfgHelper";
import { AngelCtrl, AngelReqType } from "./AngelCtrl";

export enum AngelRetType {
    LEVEL,//等级 p1:level
    GRADE,//阶级 p1:level
    EQUIP_LEVEL,//装备 p1:item_id p2:index
    APPEAEANCE_LEVEL,//皮肤等级  p1：seq  p2:level
    USED_APPEARANCE,//使用的皮肤 p1:seq
}

export class AngelResultData {
    @smartdata
    angel_info: PB_SCAngelInfo;

    @smartdata
    is_change: boolean;

    @smartdata
    is_red_change: boolean;

    @smartdata
    FlushBaoJi: boolean;
}

export class AngelData extends DataBase {
    result_info: AngelResultData;
    private angle_att: CfgAttrUp[];
    private angle_grade_att: CfgAttrUp[];
    private angel_atts_equip: { [position: number]: CfgAttrUp[] };
    private angel_atts_huanhua: { [id: number]: CfgAttrUp[] };

    private cfg_angel_res_up: { [id: number]: CfgAngelResUp[] };
    private cfg_angel: { [show_angle_level: number]: CfgAngel[] };

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.result_info = CreateSMD(AngelResultData);
    }

    public setAngelInfo(data: PB_SCAngelInfo) {
        this.result_info.angel_info = data;
        this.result_info.is_change = !this.result_info.is_change;
        this.checkResActive();
    }

    public baoji:number=0;//暴击次数
    public setAngelOpRet(data: PB_SCAngelOpRet) {
        switch (data.retType) {
            case AngelRetType.LEVEL:
                let up_num = data.param1 - this.result_info.angel_info.angelLevel
                if (up_num>1){
                    //暴击
                    this.baoji = up_num;
                    this.result_info.FlushBaoJi = !this.result_info.FlushBaoJi;
                }else{
                    this.baoji = 0;
                    this.result_info.angel_info.angelLevel = data.param1;
                    this.SetAngelAtt();
                }
                break;
            case AngelRetType.GRADE:
                this.result_info.angel_info.angelGrade = data.param1;
                this.SetGradeAtt();
                break;
            case AngelRetType.EQUIP_LEVEL:
                if (!this.result_info.angel_info.angelEquipId[data.param2]) {
                    AudioManager.Inst().Play(AudioTag.JiHuo);
                }
                this.result_info.angel_info.angelEquipId[data.param2] = data.param1;
                this.SetEquipAtt();
                break;
            case AngelRetType.APPEAEANCE_LEVEL:
                let appearance_list = this.result_info.angel_info.appearanceData;
                let is_change = false;
                for (let i = 0; i < appearance_list.length; i++) {
                    if (appearance_list[i].id == data.param1) {
                        appearance_list[i].level = data.param2;
                        is_change = true;
                        break;
                    }
                }
                if (!is_change) {
                    let new_data = new PB_AngelAppearanceData();
                    new_data.id = data.param1;
                    new_data.level = data.param2;
                    appearance_list.push(new_data);
                    //获得新天使（激活幻化）
                    if (new_data.id != 0) {
                        let cfg = CfgAngelData.angel_res[new_data.id];
                        let get_data = new CommGetData(cfg.name, cfg.jihuo_att, Item.GetColor(cfg.jihuo_item_id), cfg.fazhen_show, CommGetType.FazhenIcon)
                        ViewManager.Inst().OpenView(CommonGetView, get_data);
                    }
                }
                this.SetResAtt();
                break;
            case AngelRetType.USED_APPEARANCE:
                this.checkAngelAttrChange(this.result_info.angel_info.useAppearance,data.param1);
                this.result_info.angel_info.useAppearance = data.param1;
                break;
        }
        this.result_info.is_change = !this.result_info.is_change;
        this.result_info.is_red_change = !this.result_info.is_red_change;
    }

    //天使等级属性加成
    public SetAngelAtt() {
        let level = this.result_info.angel_info.angelLevel;
        let cfgs = CfgAngelData.angel_cfg;
        if (level)
            this.angle_att = cfgs[level - 1].up_att;
        else
            this.angle_att = [];
    }

    public GetAngelAtt() {
        if (!this.angle_att)
            this.SetAngelAtt();
        return this.angle_att;
    }
    //天使阶级属性加成
    public SetGradeAtt() {
        let grade_level = this.result_info.angel_info.angelGrade;
        let cfgs = CfgAngelData.angel_up;
        if (grade_level)
            this.angle_grade_att = cfgs[grade_level - 1].stage_att;
        else
            this.angle_grade_att = [];
    }

    public GetGradeAtt() {
        if (!this.angle_grade_att)
            this.SetGradeAtt();
        return this.angle_grade_att;
    }

    //天使圣装属性加成
    public SetEquipAtt() {
        let atts: { [position: number]: CfgAttrUp[] } = {};
        let data = this.result_info.angel_info.angelEquipId;
        for (let position = 0; position < data.length; position++) {
            if (!atts[position]) {
                atts[position] = [];
            }
            let equipment_id = data[position];
            let equip_cfg = Item.GetConfig(equipment_id);
            if (equip_cfg) {
                atts[position] = equip_cfg.stage_att;
            }
        }
        this.angel_atts_equip = atts;
    }

    public GetEquipAtt() {
        if (!this.angel_atts_equip)
            this.SetEquipAtt();
        return this.angel_atts_equip;
    }

    public GetAngelCfg() {
        if (!this.cfg_angel) {
            this.cfg_angel = CfgHelper.reSetdatas(CfgAngelData.angel_cfg, ["show_angle_level"], true);
        }
        return this.cfg_angel;
    }

    public GetAppearanceUpCfg() {
        if (!this.cfg_angel_res_up) {
            let cfgs = CfgAngelData.angel_res_up;
            this.cfg_angel_res_up = CfgHelper.reSetdatas(cfgs, ["angle_skin_seq"], true);
        }
        return this.cfg_angel_res_up;
    }

    public checkResActive() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Angel.View);
        if (!open_t.is_open) {
            return;
        }
        let data: IPB_AngelAppearanceData[] = this.result_info.angel_info.appearanceData;
        let angel_0_level = -1;
        for (let id = 0; id < data.length; id++) {
            let angle_id = data[id].id;
            let angle_lv = data[id].level;
            if (angle_id == 0) {
                angel_0_level = angle_lv;
            }
        }
        if (angel_0_level == -1) {
            //第一个天使默认激活、幻化
            AngelCtrl.Inst().SendAngelReq(AngelReqType.APPEARANCE_LEVEL_UP, 0);
        }
        if (this.result_info.angel_info.useAppearance == -1) {
            AngelCtrl.Inst().SendAngelReq(AngelReqType.USE_APPEARANCE, 0);
        }
    }

    //天使幻化激活+升级属性加成
    public SetResAtt() {
        let atts: { [id: number]: CfgAttrUp[] } = {};
        let data: IPB_AngelAppearanceData[] = this.result_info.angel_info.appearanceData;
        for (let id = 0; id < data.length; id++) {
            let angle_id = data[id].id;
            let angle_lv = data[id].level;
            let cfg_ups = this.GetAppearanceUpCfg()[angle_id];
            let cfg_active = CfgAngelData.angel_res[angle_id];
            if (!atts[angle_id]) {
                atts[angle_id] = [];
            }
            if (cfg_active) {
                atts[angle_id] = cfg_active.jihuo_att;
                for (let lv = 1; lv <= angle_lv; lv++) {
                    let cfg_up = cfg_ups[lv];
                    if (cfg_up)
                        atts[angle_id] = cfg_up.jihuo_att;
                }
            }
        }
        this.angel_atts_huanhua = atts;
    }

    public GetResAtt() {
        if (!this.angel_atts_huanhua)
            this.SetResAtt();
        return this.angel_atts_huanhua;
    }

    public GetAllAtt() {
        let angle_att = this.GetAngelAtt();
        let angle_grade_att = this.GetGradeAtt();
        let angel_atts_equip = this.GetEquipAtt();
        let angel_atts_huanhua = this.GetResAtt();
        let att_all: { [type: number]: number } = {};
        att_all = this.sumAtt(angle_att, att_all);
        att_all = this.sumAtt(angle_grade_att, att_all);
        for (let position in angel_atts_equip)
            att_all = this.sumAtt(angel_atts_equip[position], att_all);
        for (let id in angel_atts_huanhua) {
            att_all = this.sumAtt(angel_atts_huanhua[id], att_all);
        }
        let list_att = [];
        // let list_att_add = [];
        for (let type in att_all) {
            let up_attr = new CfgAttrUp(+type, att_all[type]);
            list_att.push(up_attr);
            // if (+type < 4) {
            //     list_att[+type - 1] = up_attr;
            // } else {
            //     list_att_add.push(up_attr);
            // }
        }
        // for (let i = 0; i < 4; i++) {
        //     if (!list_att[i]) {
        //         list_att[i] = new CfgAttrUp(i + 1, 0);
        //     }
        // }
        return list_att;
    }

    public GetAllAttr2() {
        let angle_att = this.GetAngelAtt();
        let angle_grade_att = this.GetGradeAtt();
        let angel_atts_equip = this.GetEquipAtt();
        let angel_atts_huanhua = this.GetResAtt();
        let att_all: { [type: number]: number } = {};
        att_all = this.sumAtt(angle_att, att_all);
        att_all = this.sumAtt(angle_grade_att, att_all);
        for (let position in angel_atts_equip)
            att_all = this.sumAtt(angel_atts_equip[position], att_all);
        for (let id in angel_atts_huanhua) {
            att_all = this.sumAtt(angel_atts_huanhua[id], att_all);
        }
        let list_att = [];

        for (let i = BATTLE_ATTR.HP; i < BATTLE_ATTR.BATTLE_ATTR_MAX; i++) {
            list_att.push({ attrType: i, attrValue: att_all[i] ?? 0 });
        }
        return list_att;
    }

    public sumAtt(atts: CfgAttrUp[], total: { [type: number]: number }) {
        if (atts)
            for (let i = 0; i < atts.length; i++) {
                let type = atts[i].type;
                if (!total[type])
                    total[type] = 0;
                total[type] += atts[i].add;
            }
        return total;
    }

    public IsMaxLevel() {
        return this.result_info.angel_info.angelLevel == CfgAngelData.angel_cfg.length;
    }

    public GetNextLvAttList() {
        let cur_level_att = this.GetAngelAtt();
        let cur_grade_att = this.GetGradeAtt();
        let cur_att: { [type: number]: number } = {};
        cur_att = this.sumAtt(cur_level_att, cur_att);
        cur_att = this.sumAtt(cur_grade_att, cur_att);
        let level = this.result_info.angel_info.angelLevel;
        let next_att = undefined;
        let is_jinjie = false;
        if (this.GetIsJinJie()) {
            is_jinjie = true;
            let grade = this.result_info.angel_info.angelGrade;
            let next_grade_cfg = CfgAngelData.angel_up[grade];
            if (next_grade_cfg) {
                next_att = {};
                this.sumAtt(cur_grade_att, next_att);
                this.sumAtt(next_grade_cfg.stage_att, next_att);
            }
        } else {
            let next_level_cfg = CfgAngelData.angel_cfg[level];
            if (next_level_cfg) {
                next_att = {};
                this.sumAtt(cur_grade_att, next_att);
                this.sumAtt(next_level_cfg.up_att, next_att);
            }
        }
        let att_change: Map<number, AttChangeData> = this.GetChangeData(next_att, cur_att, is_jinjie);
        return Array.from(att_change.values())
    }

    public GetNextGradeLvAttList() {
        let cur_grade_att = this.GetGradeAtt();
        let grade = this.result_info.angel_info.angelGrade;
        let next_grade_cfg = CfgAngelData.angel_up[grade];
        let next_up_att = next_grade_cfg ? this.sumAtt(next_grade_cfg.stage_att, {}) : undefined;
        let att_change: Map<number, AttChangeData> = this.GetChangeData(next_up_att, this.sumAtt(cur_grade_att, {}));
        return Array.from(att_change);
    }

    public GetNextEquipAttList(position: number) {
        let cur_equip_att = this.GetEquipAtt()[position];
        let equipment_id = this.result_info.angel_info.angelEquipId[position];
        let next_id: number;
        next_id = Item.GetConfig(equipment_id).up;
        let equip_cfg = CfgEquipAngleData[next_id];
        let next_equip_att = equip_cfg ? this.sumAtt(equip_cfg.stage_att, {}) : undefined;
        let att_change: Map<number, AttChangeData> = this.GetChangeData(next_equip_att, this.sumAtt(cur_equip_att, {}));
        return Array.from(att_change.values());
    }

    public GetNextAppearanceAtt(id: number) {
        let level = this.GetResLevel(id);
        let cur_appearance_att = [];
        if (level == 1)
            cur_appearance_att = CfgAngelData.angel_res[id].jihuo_att;
        else
            cur_appearance_att = this.GetAppearanceUpCfg()[id][level ? level - 1 : 0].jihuo_att;
        let next_cfg: CfgAngelResUp = this.GetResNextLvCfg(id, level);
        let next_res_att = next_cfg ? this.sumAtt(next_cfg.jihuo_att, {}) : undefined;
        let att_change: Map<number, AttChangeData> = this.GetChangeData(next_res_att, this.sumAtt(cur_appearance_att, {}));
        return Array.from(att_change.values());
    }

    public GetChangeData(next_atts: { [type: number]: number }, cur_atts: { [type: number]: number }, isAdd = false) {
        let att_change: Map<number, AttChangeData> = new Map();
        if (next_atts)
            for (let type in next_atts) {
                let add = next_atts[+type];
                let data = att_change.get(+type) ? att_change.get(+type) : new AttChangeData();
                data.type = +type;
                data.cur_num = cur_atts[type] ?? 0;
                data.next_num = isAdd ? (data.cur_num + add) : add;
                att_change.set(+type, data);
            }
        for (let type in cur_atts) {
            let data = att_change.get(+type);
            if (!data) {
                data = new AttChangeData();
                data.type = +type;
                data.cur_num = cur_atts[type];
                data.next_num = next_atts ? data.cur_num : 0;
                att_change.set(+type, data);
            }
        }
        return att_change;
    }

    public GetAngelLevel() {
        let level = this.result_info.angel_info.angelLevel;
        let show_angle_level = level ? CfgAngelData.angel_cfg[level - 1].show_angle_level : 1;
        return show_angle_level;
    }

    public GetAngelNextLevel() {
        let show_angle_level = 1;
        if (this.result_info.angel_info) {
            let level = this.result_info.angel_info.angelLevel ?? 1;
            if (level != CfgAngelData.angel_cfg.length)
                level += 1;
            show_angle_level = CfgAngelData.angel_cfg[level - 1].show_angle_level;
        }
        return show_angle_level;
    }

    public GetAngelName() {
        let res_id = this.result_info.angel_info.useAppearance;
        if (res_id == -1) {
            res_id = 0;
        }
        let cfg = CfgAngelData.angel_res[res_id];
        return cfg.name;
    }

    public GetAngelResCfg() {
        let res_id = this.result_info.angel_info.useAppearance;
        if (res_id == -1) {
            res_id = 0;
        }
        let cfg = CfgAngelData.angel_res[res_id];
        return cfg;
    }

    public GetAngelResCfgItem(item_id: number) {
        return CfgAngelData.angel_res.find(cfg => cfg.jihuo_item_id == item_id);
    }

    public GetUseResActiveItemData(useAppearance?: number) {
        if (useAppearance == undefined) {
            useAppearance = this.result_info.angel_info.useAppearance;
        }
        let res_id = -1;
        if (this.result_info.angel_info)
            res_id = useAppearance;
        if (res_id == -1) {
            res_id = 0;
        }
        let cfg = CfgAngelData.angel_res[res_id];
        return cfg;
    }

    public GetAngelUpPro(is_eff:boolean) {
        let level = this.result_info.angel_info.angelLevel;
        let show_angle_level = this.GetAngelLevel();
        let cfgs = this.GetAngelCfg()[show_angle_level];
        let list: {val:number,is_effect:boolean}[] = [];
        if (cfgs)
            for (let i = 0; i < cfgs.length; i++) {
                list.push({
                   val: level >= cfgs[i].level ? 1 : 0,
                    is_effect: is_eff && level == cfgs[i].level
                });
            }
        return list;
    }

    public GetAngelUpLevel() {
        let level = this.result_info.angel_info.angelLevel;
        let show_angle_level = this.GetAngelLevel();
        let cfgs = this.GetAngelCfg()[show_angle_level];
        if (level == cfgs[cfgs.length - 1].level) {
            show_angle_level += 1;
        }
        return show_angle_level;
    }

    public GetIsJinJie() {
        let cfgs = CfgAngelData.angel_up;
        let level = this.result_info.angel_info.angelLevel;
        let grade = this.result_info.angel_info.angelGrade;
        for (let i = 0; i < cfgs.length; i++) {
            if (level == cfgs[i].angle_level) {
                if (grade != cfgs[i].angle_stage) {
                    return cfgs[i];
                }
                break;
            }
        }
        return null;
    }

    public GetAngelUpCostData(): CfgItem {
        let cfg_jinjie = this.GetIsJinJie();
        let item_data;
        if (cfg_jinjie) {
            item_data = new CfgItem(cfg_jinjie.stage_item_id, cfg_jinjie.stage_item_num)
        } else {
            let level = this.result_info.angel_info.angelLevel;
            let cfg_up = CfgAngelData.angel_cfg[level];
            if (cfg_up)
                item_data = new CfgItem(cfg_up.up_item_id, cfg_up.up_item_num)
        }
        return item_data;
    }

    public GetResLevel(id: number) {
        for (let i = 0; i < this.result_info.angel_info.appearanceData.length; i++) {
            if (this.result_info.angel_info.appearanceData[i].id == id)
                return this.result_info.angel_info.appearanceData[i].level;
        }
        return 0;
    }

    public GetResNextLvCfg(id: number, level?: number): any {
        let next_cfg: any;
        if (!level)
            level = this.GetResLevel(id);
        if (!level) {//未激活
            next_cfg = CfgAngelData.angel_res[id];
        } else {
            next_cfg = this.GetAppearanceUpCfg()[id][level];
        }
        return next_cfg;
    }
    public GetResUpCost(id: number) {
        let cfg = this.GetResNextLvCfg(id);
        if (cfg.jihuo_item_id) {
            return new CfgItem(cfg.jihuo_item_id, 1)
        } else {
            return new CfgItem(cfg.up_item_id, cfg.up_item_num)
        }
    }

    public IsResMax(id: number) {
        let cfg = this.GetAppearanceUpCfg()[id];
        let level = this.GetResLevel(id);
        return level >= cfg.length;
    }

    public GetEquipUpCost(position: number) {
        let equip_id = this.result_info.angel_info.angelEquipId[position];
        let cfg = Item.GetConfig(equip_id);
        return [new CfgItem(cfg.up_item_id_0, cfg.up_item_num_0), new CfgItem(cfg.up_item_id_1, cfg.up_item_num_1)];
    }

    public IsEquipMax(position: number) {
        let equip_id = this.result_info.angel_info.angelEquipId[position];
        let cfg = Item.GetConfig(equip_id);
        return cfg && cfg.up == 0;
    }

    public IsEquip(pos: number) {
        return this.result_info.angel_info.angelEquipId[pos] != 0;
    }

    public GetCostColor(has_cost: boolean) {
        let txt_color;
        let stroke_color;
        if (has_cost) {
            txt_color = COLORS.Green1;
            stroke_color = COLORS.Green2;
        }
        else {
            txt_color = COLORS.Red1;
            stroke_color = COLORS.Red2;
        }
        return { txt_color: txt_color, stroke_color: stroke_color }
    }

    public GetEquipCellData(pos: number) {
        let equip_id = this.result_info.angel_info.angelEquipId[pos];
        return new CfgItem(equip_id)
    }

    public sendHuanHua(id: number) {
        let level = this.GetResLevel(id)
        if (level) {
            let cur_id = this.result_info.angel_info.useAppearance;
            if (cur_id != id) {
                if (id != 0)
                    PublicPopupCtrl.Inst().Center(Language.Angel.tip3)
                AngelCtrl.Inst().SendAngelReq(AngelReqType.USE_APPEARANCE, id);
            }
        }
        else
            PublicPopupCtrl.Inst().Center(Language.Angel.tip2)
    }

    public GetResList() {
        let cfg = CfgAngelData.angel_res;
        let list = [];
        for (let i = 0; i < cfg.length; i++) {
            if (cfg[i].is_show)
                list.push(cfg[i])
        }
        return list;
    }

    public GetCfgRes(id: number): CfgAngelRes {
        return CfgAngelData.angel_res[id];
    }

    public GetAngelRed() {

    }

    //天使幻化升级红点
    public GetAngelResUpRed(seq: number) {
        if (this.IsResMax(seq)) {
            return 0;
        } else {
            let item_data = this.GetResUpCost(seq);
            let num = Item.GetNum(item_data.itemId);
            return num >= item_data.num ? 1 : 0;
        }
    }

    //天使幻化入口红点
    public GetAngelResAllRed() {
        if (!this.result_info.angel_info)
            return 0;
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Angel.View);
        if (!open_t.is_open) {
            return 0;
        }
        let list = this.GetResList();
        for (let i = 0; i < list.length; i++) {
            if (this.GetAngelResUpRed(list[i].angle_skin_seq))
                return 1;
        }
        return 0;
    }

    //天使装备升级红点
    public GetAngelEquipUpRed(pos: number) {
        let is_max = this.IsEquipMax(pos);
        if (is_max)
            return 0;
        if (this.result_info.angel_info.angelEquipId[pos] == 0)
            return 0;
        let cost_data = this.GetEquipUpCost(pos);
        let cost_data1 = cost_data[0];
        let has_num1 = Item.GetNum(cost_data1.item_id);
        if (has_num1 < cost_data1.num)
            return 0;
        let cost_data2 = cost_data[1];
        let has_num2 = Item.GetNum(cost_data2.item_id);
        return ((has_num1 < cost_data1.num) || (has_num2 < cost_data2.num)) ? 0 : 1;
    }

    //天使升级红点
    public GetAngelUpRed() {
        let item_data = this.GetAngelUpCostData();
        if (item_data) {
            let has_num = Item.GetNum(item_data.itemId);
            return has_num >= item_data.num ? 1 : 0;
        }
        return 0
    }

    //天使升级入口红点
    public GetAngelUpAllRed() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Angel.View);
        if (!open_t.is_open) {
            return 0;
        }
        if (!this.result_info.angel_info)
            return 0;
        if (this.GetAngelUpRed())
            return 1;
        for (let i = 0; i < 4; i++) {
            if (this.GetAngelEquipUpRed(i)) {
                return 1;
            }
        }
        return 0;
    }

    /**法阵等级 */
    public GetFaZhenLevel() {
        return this.result_info.angel_info ? this.result_info.angel_info.angelLevel : 1;
    }

    /**法阵圣装总等级 */
    public GetAllEquipLevel() {
        let level = 0;
        if (this.result_info.angel_info) {
            let data = this.result_info.angel_info.angelEquipId;
            for (let position = 0; position < data.length; position++) {
                // if (!atts[position]) {
                //     atts[position] = [];
                // }
                let equipment_id = data[position];
                let equip_cfg = Item.GetConfig(equipment_id);
                if (equip_cfg) {
                    level += equip_cfg.level;
                }
            }
        }
        return level;
    }

    /**法阵幻化属性飘字 */
    public checkAngelAttrChange(old_res: number, new_res: number) {
        let cur_appearance_att: CfgAttrUp[] = [];
        let id;
        let fuhao;
        let type;
        if (old_res == new_res )
            return;
        if (old_res == -1 && new_res == 0 ){
            //开放天使默认激幻化天使0
            return;
        }
        if (new_res == -1 || new_res == 0) {
            //脱下(默认幻化天使0)
            id = old_res;
            fuhao = "-";
            type = 0;
        } else {
            id = new_res;
            fuhao = "+";
            type = 1;
        }
        let cfg = CfgAngelData.angel_res[id];

        if (cfg) {
            let level = this.GetResLevel(id);
            if (level == 1)
                cur_appearance_att = CfgAngelData.angel_res[id].jihuo_att;
            else
                cur_appearance_att = this.GetAppearanceUpCfg()[id][level ? level - 1 : 0].jihuo_att;
        }
        for (let i = 0; i < cur_appearance_att.length; i++) {
            let att_type = cur_appearance_att[i].type;
            let att_add = cur_appearance_att[i].add;
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
        }
    }
}

export class AttChangeData {
    type: number;
    cur_num: number;
    next_num: number;
}

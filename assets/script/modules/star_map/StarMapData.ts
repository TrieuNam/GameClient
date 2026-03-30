import { CfgShopData } from 'config/CfgShop';
import { CfgStarMapData } from "config/CfgStarmap";
import { CreateSMD, smartdata } from "data/SmartData";
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { BagData } from 'modules/bag/BagData';
import { Item } from 'modules/bag/ItemData';
import { CommonId } from 'modules/common/CommonEnum';
import { AttrListName, Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { FunOpen } from 'modules/guide/FunOpen';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { StarMapLineCfg, StarMapPointPos, SuperStarMapLineCfg, SuperStarMapPointPos } from "modules/star_map/StarMapConifg";
import { DataBase } from "../../data/DataBase";
import { AttrHelper } from '../../helpers/AttrHelper';
import { DataHelper } from "../../helpers/DataHelper";
import { StarMapSuperData } from './StarMapSuperData';

export enum STAR_MAP_RET_TYPE {
    LEVEL_UP = 0, // p1 类型 p2 阶段 p3 id p4 等级
    BIG_LEVEL_UP = 1, // p1 id  p2 等级     ** 弃用
    RESET = 2,  // p1 类型 p2 阶段          
    BIG_RESET = 3,  //   ** 弃用                   

    NEW_SUPER_LEVEL_UP = 4, // 超星系激活 p1线路 p2:id
    NEW_SUPER_RESET = 5,    // 超星系重置
}

class StarMapFlushInfo {
    @smartdata
    needflush: number;
}

export class StarMapData extends DataBase {
    public flush_info: StarMapFlushInfo;
    private star_map_info: { [key: string]: any } = []
    private super_cache: number[][]
    constructor() {
        super();
        this.createSmartData();

        this.star_map_info = []
    }

    private createSmartData() {
        this.flush_info = CreateSMD(StarMapFlushInfo);
        this.flush_info.needflush = 0
    }

    public SetSCStarMapInfo(data: PB_SCStarMapInfo) {
        for (let i = 0; i < data.starMapList.length; i++) {
            let info: { [key: string]: any } = {
                type: data.starMapList[i].type,
                grade: data.starMapList[i].grade,
                id: data.starMapList[i].id,
                level: data.starMapList[i].level,
            }
            if (this.star_map_info[info.type] == null) {
                let map_list: { [key: number]: any } = []
                this.star_map_info[info.type] = map_list
            }

            if (this.star_map_info[info.type][info.grade] == null) {
                let map_list: { [key: number]: any } = []
                this.star_map_info[info.type][info.grade] = map_list
            }

            this.star_map_info[info.type][info.grade][info.id] = info
        }
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public SetSCStarMapOpRet(data: PB_SCStarMapOpRet) {
        if (data.retType == STAR_MAP_RET_TYPE.LEVEL_UP) {
            this.star_map_info[data.param1][data.param2][data.param3].level = data.param4
        }
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    // 一个list
    public GetStarMapNetInfo(type: number, grade: number) {
        let mark = type + "|" + grade
        return this.star_map_info[type][grade]
    }

    // 星图点位信息
    public GetStarMapRoleStar(type: number, grade: number, id: number, level: number) {
        var config = CfgStarMapData.role_star;
        for (const info of config) {
            if (info.type == type && info.grade == grade
                && info.star_id == id && info.star_level == level) {
                return info
            }
        }
    }

    // 星图条件信息
    public GetStarMapRoleStarCondition(type: number, grade: number, id: number) {
        var config = CfgStarMapData.role_star_condition;
        for (const info of config) {
            if (info.type == type && info.grade == grade
                && info.star_id == id) {
                return info
            }
        }
    }

    // 注意 超新星只有一个等级
    public GetSuperStarNetInfo(index: number) {
        return 0
    }

    // 超新星星图点位信息
    public GetStarMapSuperStar(id: number, level: number) {
        var config = CfgStarMapData.superstar;
        for (const info of config) {
            if (info.star_id == id && info.star_level == level) {
                return info
            }
        }
    }

    public GetStarMapAttr(type: number, grade: number) {
        let net_points = this.GetStarMapNetInfo(type, grade)
        let list = []
        for (let i = 0; i < net_points.length; i++) {
            if (net_points[i].level > 0) {
                let cfg = this.GetStarMapRoleStar(type, grade, i, net_points[i].level)
                let flag_plus = true
                for (let j = 0; j < list.length; j++) {
                    if (list[j].attrType == cfg.jihuo_att[0].type) {
                        flag_plus = false
                        list[j].attrValue = list[j].attrValue + cfg.jihuo_att[0].add
                        break
                    }
                }

                if (flag_plus) {
                    let info = {
                        attrType: cfg.jihuo_att[0].type,
                        attrValue: cfg.jihuo_att[0].add,
                    }
                    list.push(info)
                }
            }
        }

        let fix_list = []
        let temp = []
        for (let i = 0; i < list.length; i++) {
            if (temp.length >= 2) {
                fix_list.push(temp)
                temp = []
            }

            let info = {
                name: AttrListName[list[i].attrType],
                type: list[i].attrType,
                value: list[i].attrValue,
            }
            temp.push(info)
        }
        if (temp.length > 0) { fix_list.push(temp) }

        return fix_list
    }

    public GetSuperStarPointInfo(index: number) {
        let level = this.GetSuperStarNetInfo(index)
        let check_level = level == 10 ? 10 : level + 1
        let cfg = this.GetStarMapSuperStar(index, check_level)

        return {
            index: index,
            level: level,
            is_special: cfg == undefined ? false : (cfg.jihuo_att[0].type >= 6 && cfg.jihuo_att[0].type <= 17),
            att_type: cfg == undefined ? 0 : cfg.jihuo_att[0].type,
            level_show: level + "/10"
        }
    }

    public GetStarMapTagList() {
        let tag_list = []
        for (let i = 1; i < 2; i++) {
            let info = {
                type: i - 1,
                show_type: i,
                name: Language.StarMap.TypeName[i - 1],
                mod: i == 2 ? Mod.Pet.View : Mod.StarMap.View
            }
            tag_list.push(info)
        }

        return tag_list
    }

    public GetStarMapGradeList(type: number) {
        let grade_list: { type: number; unlock: boolean; name: string; show_grade: number; grade: number; }[] = []

        if (this.star_map_info == null) {
            return grade_list
        }

        for (let i = 0; i < this.star_map_info[type].length; i++) {
            let grade_info = {
                type: type,
                unlock: this.CheckGradeUnLock(type, i),
                name: DataHelper.GetDaXie(i + 1) + Language.StarMap.Grade,
                show_grade: i + 1,
                grade: i
            }

            grade_list.push(grade_info)
        }

        return grade_list
    }

    public CheckGradeUnLock(type: number, grade: number) {
        // 最低级无条件
        if (grade == 0) { return true }

        let net_info = this.GetStarMapNetInfo(type, grade - 1)
        let flag = true

        for (const info of net_info) {
            if (info.level == 0) {
                flag = false
                break
            }
        }

        return flag
    }

    // 这里注入的是show信息，不是data信息
    public GetStarMapGroupInfo(show_type: number, show_grade: number) {
        let info = {
            show_type: show_type,
            show_grade: show_grade,
            type: show_type - 1,
            grade: show_grade - 1,
        }

        return info
    }

    public GetStarMapLineInfo(type: number, grade: number) {
        let show_type = type + 1
        let show_grade = grade + 1

        let line_list = []
        let line_cfg = StarMapLineCfg["map" + show_type + "_" + show_grade]
        let net_points = this.GetStarMapNetInfo(type, grade)

        for (let i = 0; i < line_cfg.length; i++) {
            let p1 = { pos: line_cfg[i][0], is_act: net_points[line_cfg[i][0]].level > 0 }
            let p2 = { pos: line_cfg[i][1], is_act: net_points[line_cfg[i][1]].level > 0 }

            let point_info = {
                p1: p1,
                p2: p2,
            }
            line_list.push(point_info)
        }

        return line_list
    }

    public GetSuperStarLineInfo() {
        let fix_list = []
        for (let i = 0; i < SuperStarMapLineCfg.length; i++) {
            let p1 = { pos: SuperStarMapLineCfg[i][0], is_act: this.GetSuperStarNetInfo(SuperStarMapLineCfg[i][0]) > 0 }
            let p2 = { pos: SuperStarMapLineCfg[i][1], is_act: this.GetSuperStarNetInfo(SuperStarMapLineCfg[i][1]) > 0 }

            let point_info = {
                p1: p1,
                p2: p2,
            }
            fix_list.push(point_info)
        }

        return fix_list
    }

    public GetStarMapPointCanOper(type: number, grade: number, id: number) {
        let show_type = type + 1
        let show_grade = grade + 1
        let net_points = this.GetStarMapNetInfo(type, grade)
        let line_cfg = StarMapLineCfg["map" + show_type + "_" + show_grade]

        // 0号位置条件为和其他位点等级一致
        if (id == 0) {
            let flag = true
            for (let i = 1; i < 10; i++) {
                if (net_points[0].level > net_points[i].level) {
                    flag = false
                }
            }
            return flag
        }

        for (let i = 0; i < line_cfg.length; i++) {
            if (line_cfg[i][0] == id) {
                if (net_points[line_cfg[i][1]].level > net_points[line_cfg[i][0]].level) { return true }
            }
            else if (line_cfg[i][1] == id) {
                if (net_points[line_cfg[i][0]].level > net_points[line_cfg[i][1]].level) { return true }
            }
        }

        return false
    }

    public GetSuperStarPointCanOper(index: number) {
        if (index == 0) { return true }

        for (let i = 0; i < SuperStarMapLineCfg.length; i++) {
            if (SuperStarMapLineCfg[i][0] == index) {
                if (this.GetSuperStarNetInfo(SuperStarMapLineCfg[i][1]) > this.GetSuperStarNetInfo(SuperStarMapLineCfg[i][0])) { return true }
            }
            else if (SuperStarMapLineCfg[i][1] == index) {
                if (this.GetSuperStarNetInfo(SuperStarMapLineCfg[i][0]) > this.GetSuperStarNetInfo(SuperStarMapLineCfg[i][1])) { return true }
            }
        }

        return false
    }

    public GetStarMapPointUpParam(type: number, grade: number, id: number, level: number) {
        let check_level = level + 1
        let cfg = check_level == 11 ? null : this.GetStarMapRoleStar(type, grade, id, check_level)
        let cur_cfg = level == 0 ? null : this.GetStarMapRoleStar(type, grade, id, level)

        let cur_attr = []
        if (cur_cfg != null) {
            for (let i = 0; i < cur_cfg.jihuo_att.length; i++) {
                let attr = {
                    attr_name: cur_cfg.jihuo_att[i].type,
                    value: cur_cfg.jihuo_att[i].add,
                    attr_value: AttrHelper.Percent(cur_cfg.jihuo_att[i].type, cur_cfg.jihuo_att[i].add),
                    is_special: false,
                }
                cur_attr.push(attr)
            }
        }
        let next_attr = []
        if (cfg != null) {
            for (let i = 0; i < cfg.jihuo_att.length; i++) {
                let attr = {
                    attr_name: cfg.jihuo_att[i].type,
                    value: cfg.jihuo_att[i].add,
                    attr_value: AttrHelper.Percent(cfg.jihuo_att[i].type, cfg.jihuo_att[i].add),
                    is_special: false,
                }
                next_attr.push(attr)
            }
        }

        let cost_list = []
        if (cfg != null) {
            for (let i = 0; i < cfg.cost_item.length; i++) {
                let item = {
                    item_id: cfg.cost_item[i].item_id,
                    cost_num: cfg.cost_item[i].num,
                }
                cost_list.push(item)
            }
        }

        let send_data = {
            param1: type,
            param2: grade,
            param3: id,
        }
        let param = {
            id: id,
            type: type,
            grade: grade,
            is_super: false,
            is_special: false,
            name: Language.StarMap.PointOper[cur_cfg == null ? 0 : 1] + (cfg == null ? cur_cfg.star_name : cfg.star_name),
            btn_name: Language.StarMap.PointOper[cur_cfg == null ? 0 : 1],
            cur_attr_list: cur_attr,
            next_attr_list: next_attr,
            cost_list: cost_list,
            send_data: send_data,
            level: level
        }

        return param
    }

    public GetSuperStarPointUpParam(index: number) {
        let level = this.GetSuperStarNetInfo(index)
        let check_level = level + 1
        let cfg = check_level == 11 ? null : this.GetStarMapSuperStar(index, check_level)
        let cur_cfg = level == 0 ? null : this.GetStarMapSuperStar(index, level)

        let cur_attr = []
        if (cur_cfg != null) {
            for (let i = 0; i < cur_cfg.jihuo_att.length; i++) {
                let attr = {
                    attr_name: cur_cfg.jihuo_att[i].type,
                    value: cur_cfg.jihuo_att[i].add,
                    attr_value: AttrHelper.Percent(cur_cfg.jihuo_att[i].type, cur_cfg.jihuo_att[i].add),
                    is_special: cfg == undefined ? false : (cfg.jihuo_att[0].type >= 6 && cfg.jihuo_att[0].type <= 17),
                }
                cur_attr.push(attr)
            }
        }
        let next_attr = []
        if (cfg != null) {
            for (let i = 0; i < cfg.jihuo_att.length; i++) {
                let attr = {
                    attr_name: cfg.jihuo_att[i].type,
                    value: cfg.jihuo_att[i].add,
                    attr_value: AttrHelper.Percent(cfg.jihuo_att[i].type, cfg.jihuo_att[i].add),
                    is_special: cfg == undefined ? false : (cfg.jihuo_att[0].type >= 6 && cfg.jihuo_att[0].type <= 17),
                }
                next_attr.push(attr)
            }
        }

        let cost_list = []
        if (cfg != null) {
            for (let i = 0; i < cfg.cost_item.length; i++) {
                let item = {
                    item_id: cfg.cost_item[i].item_id,
                    cost_num: cfg.cost_item[i].num,
                }
                cost_list.push(item)
            }
        }

        let send_data = {
            param1: index,
            param2: 0,
            param3: 0,
        }

        let param = {
            index: index,
            is_super: true,
            is_special: cfg == undefined ? false : (cfg.jihuo_att[0].type >= 6 && cfg.jihuo_att[0].type <= 17),
            name: Language.StarMap.PointOper[cur_cfg == null ? 0 : 1] + (cfg == null ? cur_cfg.star_name : cfg.star_name),
            btn_name: Language.StarMap.PointOper[cur_cfg == null ? 0 : 1],
            cur_attr_list: cur_attr,
            next_attr_list: next_attr,
            cost_list: cost_list,
            send_data: send_data,
            level: level
        }

        return param
    }

    public GetSuperStarAllAttr() {
        return StarMapSuperData.Inst().GetSuperStarAllAttr();
    }

    public GetEnterParam() {
        let attr_list = []
        let temp_cell = []
        // 星图属性提取
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 6; j++) {
                // 注意出来的属性是两条或一条连装的
                let temp_list = this.GetStarMapAttr(i, j)
                for (var index in temp_list) {
                    for (var p_index in temp_list[index]) {
                        let flag_plus = true
                        for (var c_index in attr_list) {
                            if (attr_list[c_index].name == temp_list[index][p_index].name) {
                                flag_plus = false
                                attr_list[c_index].value = attr_list[c_index].value + temp_list[index][p_index].value
                            }
                        }

                        let attr_type = null
                        for (var a_index in AttrListName) {
                            if (AttrListName[a_index] == temp_list[index][p_index].name) {
                                attr_type = a_index
                                break
                            }
                        }

                        if (flag_plus) {
                            let info = {
                                type: Number(attr_type),
                                name: temp_list[index][p_index].name,
                                value: temp_list[index][p_index].value,
                            }
                            attr_list.push(info)
                        }
                    }
                }
            }
        }
        // 超星系属性提取
        let super_list = this.GetSuperStarAllAttr()
        for (var index in super_list) {
            let flag_plus = true
            let attr_name = AttrListName[super_list[index].attrType]
            for (var c_index in attr_list) {
                if (attr_list[c_index].name == attr_name) {
                    flag_plus = false
                    attr_list[c_index].value = super_list[index].attrValue + attr_list[c_index].value
                }
            }

            if (flag_plus) {
                let info = {
                    type: super_list[index].attrType,
                    name: attr_name,
                    value: super_list[index].attrValue,
                }
                attr_list.push(info)
            }
        }

        // 属性整理
        let plus_list = []
        for (var index in attr_list) {
            if (temp_cell.length < 3) {
                temp_cell.push(attr_list[index]);
            }

            if (temp_cell.length >= 3) {
                plus_list.push(temp_cell);
                temp_cell = []
            }
        }
        if (temp_cell.length > 0) {
            plus_list.push(temp_cell);
        }


        return {
            attr_list: plus_list,
        }
    }

    public GetIsShowEnter() {
        let param = this.GetEnterParam()
        return param.attr_list.length > 0
    }

    public GetCanLevelUp(type: number, grade: number, cur: number) {
        let points = this.GetStarMapNetInfo(type, grade)

        for (var index in points) {
            if (points[index].level < cur) {
                return false
            }
        }
        return true
    }


    /**宠物的加成 */
    public GetPetAttr() {
        let pet_attr: Map<number, number> = new Map();

        // let all_info = this.super_star_info;
        // if (all_info) {
        //     for (let i = 0; i < all_info.length; i++) {
        //         let star_info = all_info[i];
        //         if (star_info.type == 1) {
        //             let cfg = this.GetStarMapSuperStar(star_info.id, star_info.level);
        //             if (cfg) {
        //                 let num = pet_attr.get(cfg.jihuo_att[0].type);
        //                 if (!num) {
        //                     pet_attr.set(cfg.jihuo_att[0].type, cfg.jihuo_att[0].add);
        //                 } else {
        //                     pet_attr.set(cfg.jihuo_att[0].type, num + cfg.jihuo_att[0].add);
        //                 }
        //             }
        //         }
        //     }
        // }
        return pet_attr;
    }

    public GetMaxLevel() {
        if (this.star_map_info.length == 0) { return 0 }
        let level_max = 0
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 6; j++) {
                for (let id = 0; id < 10; id++) {
                    if (this.star_map_info[i][j][id].level > level_max) {
                        level_max = this.star_map_info[i][j][id].level
                    }
                }
            }
        }

        let cfg = CfgStarMapData.level
        for (var key in cfg) {
            if (cfg[key].star_level == level_max) {
                return cfg[key].icon
            }
        }

        return 0
    }

    public GetPointPosFromStarMap(type: number, grade: number) {
        return StarMapPointPos[type + "_" + grade]
    }

    public GetPointPosFromSuperStar() {
        return SuperStarMapPointPos
    }

    public GetRedNum() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.StarMap.View));
        // LogError("?ds------------------------------af",open_t)
        if (!open_t.is_open) {
            // LogError("?Return 1")
            return 0
        }

        if (CoreCrisisData.Inst().GetCoreRed(CoreCrisisType.StarMap) == 1) {
            // LogError("?Return 2")
            return 1
        }

        let tag_list = StarMapData.Inst().GetStarMapTagList()
        for (var index in tag_list) {
            let grade_list = StarMapData.Inst().GetStarMapGradeList(tag_list[index].type)
            for (var index_g in grade_list) {
                if (grade_list[index_g].unlock) {
                    let pos_list = StarMapData.Inst().GetStarMapNetInfo(tag_list[index].type, grade_list[index_g].grade)
                    for (var p_index in pos_list) {
                        let check_level = pos_list[p_index].level + 1
                        let limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level)
                        if (!limit && pos_list[p_index].level < 10
                            && StarMapData.Inst().GetStarMapPointCanOper(tag_list[index].type, grade_list[index_g].grade, Number(p_index))) {
                            let param = StarMapData.Inst().GetStarMapPointUpParam(tag_list[index].type, grade_list[index_g].grade, Number(p_index), pos_list[p_index].level)

                            let flag = 1
                            for (let i = 0; i < param.cost_list.length; i++) {
                                let num = Item.GetNum(param.cost_list[i].item_id)
                                let open_t = FunOpen.Inst().GetFunIsOpen(tag_list[index].mod)

                                if (num < param.cost_list[i].cost_num || !open_t.is_open) {
                                    flag = 0
                                }
                            }

                            if (flag == 1) {
                                // LogError("return 1",tag_list[index].type,grade_list[index_g].grade,Number(p_index),pos_list[p_index].level)
                                // LogError("?Return 3")
                                return 1
                            }
                        }
                    }
                }
            }
        }

        //超星系红点
        let super_remind = StarMapSuperData.Inst().GetSuperRemind();
        if (super_remind > 0) {
            return 1;
        }

        return 0
    }

    // 获取超星系总等级
    public GetSuperStarTotalLevel() {
        let total_level = 0
        for (let index = 0; index < 166; index++) {
            let level = this.GetSuperStarNetInfo(index)
            total_level = total_level + level
        }

        return total_level
    }

    // 获取星图总等级
    public GetStarMapTotalLevel() {
        let total_level = 0
        let tag_list = StarMapData.Inst().GetStarMapTagList()
        for (var index in tag_list) {
            let grade_list = StarMapData.Inst().GetStarMapGradeList(tag_list[index].type)
            for (var index_g in grade_list) {
                if (grade_list[index_g].unlock) {
                    let pos_list = StarMapData.Inst().GetStarMapNetInfo(tag_list[index].type, grade_list[index_g].grade)
                    for (var p_index in pos_list) {
                        total_level = total_level + pos_list[p_index].level
                    }
                }
            }
        }

        return total_level
    }

    // 获取星图的所有总等级
    public GetTotalLevel() {
        return this.GetStarMapTotalLevel() + this.GetSuperStarTotalLevel()
    }

    public GetTagIsRed(tag_index: number) {
        let tag_list = StarMapData.Inst().GetStarMapTagList()

        let grade_list = StarMapData.Inst().GetStarMapGradeList(tag_list[tag_index].type)
        for (var index_g in grade_list) {
            if (grade_list[index_g].unlock) {
                let pos_list = StarMapData.Inst().GetStarMapNetInfo(tag_list[tag_index].type, grade_list[index_g].grade)
                for (var p_index in pos_list) {
                    let check_level = pos_list[p_index].level + 1
                    let limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level)
                    if (!limit && pos_list[p_index].level < 10
                        && StarMapData.Inst().GetStarMapPointCanOper(tag_list[tag_index].type, grade_list[index_g].grade, Number(p_index))) {
                        let param = StarMapData.Inst().GetStarMapPointUpParam(tag_list[tag_index].type, grade_list[index_g].grade, Number(p_index), pos_list[p_index].level)

                        let flag = 1
                        for (let i = 0; i < param.cost_list.length; i++) {
                            let num = Item.GetNum(param.cost_list[i].item_id)
                            let open_t = FunOpen.Inst().GetFunIsOpen(tag_list[tag_index].mod)

                            if (num < param.cost_list[i].cost_num || !open_t.is_open) {
                                flag = 0
                            }
                        }

                        if (flag == 1) {

                            return true
                        }
                    }
                }
            }
        }

        return false
    }

    public GetGradeIsRed(tag_index: number, grade_index: number) {
        // LogError("?F f ",tag_index,grade_index)
        let tag_list = StarMapData.Inst().GetStarMapTagList()
        let grade_list = StarMapData.Inst().GetStarMapGradeList(tag_list[tag_index].type)

        if (grade_list[grade_index].unlock) {
            let pos_list = StarMapData.Inst().GetStarMapNetInfo(tag_list[tag_index].type, grade_list[grade_index].grade)
            for (var p_index in pos_list) {
                let check_level = pos_list[p_index].level + 1
                let limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level)
                if (!limit && pos_list[p_index].level < 10
                    && StarMapData.Inst().GetStarMapPointCanOper(tag_list[tag_index].type, grade_list[grade_index].grade, Number(p_index))) {
                    let param = StarMapData.Inst().GetStarMapPointUpParam(tag_list[tag_index].type, grade_list[grade_index].grade, Number(p_index), pos_list[p_index].level)

                    let flag = 1
                    for (let i = 0; i < param.cost_list.length; i++) {
                        let num = Item.GetNum(param.cost_list[i].item_id)
                        let open_t = FunOpen.Inst().GetFunIsOpen(tag_list[tag_index].mod)

                        if (num < param.cost_list[i].cost_num || !open_t.is_open) {
                            flag = 0
                        }
                    }

                    if (flag == 1) {
                        return true
                    }
                }
            }
        }

        return false
    }

    public FlushCoreCrisis() {
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public FlushItemChange() {
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public StarMapOneKeyCheck(type: number, grade: number) {
        let check_grade = grade - 1
        let check_type = type - 1
        let point_list: number[] = []
        let result = {
            type: check_type,
            grade: check_grade,
            num_1: 0,
            num_2: 0,
            num_3: 0,

            icon_1: 0,
            icon_2: 0,
            icon_3: Item.GetIconId(CommonId.Diamond),

            key_item: CommonId.Diamond,
            point_list: point_list,
            is_limit: false,

            send_index: 0,
        }

        let cost_item = 0
        let tag_list = StarMapData.Inst().GetStarMapTagList()
        let grade_list = StarMapData.Inst().GetStarMapGradeList(tag_list[check_type].type)

        if (grade_list[check_grade].unlock) {
            let pos_list = StarMapData.Inst().GetStarMapNetInfo(tag_list[check_type].type, grade_list[check_grade].grade)
            for (var p_index in pos_list) {
                let check_level = pos_list[p_index].level + 1
                let limit = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.StarMap, check_level)
                if (limit) {
                    result.is_limit = true
                }
                if (!limit && pos_list[p_index].level < 10) {
                    let param = StarMapData.Inst().GetStarMapPointUpParam(tag_list[check_type].type, grade_list[check_grade].grade, Number(p_index), pos_list[p_index].level)

                    if (result.icon_1 == 0) {
                        result.icon_1 = Item.GetIconId(param.cost_list[0].item_id)
                        result.icon_2 = Item.GetIconId(param.cost_list[0].item_id)
                        cost_item = param.cost_list[0].item_id
                    }

                    let flag = 1
                    for (let i = 0; i < param.cost_list.length; i++) {
                        result.num_1 = Item.GetNum(param.cost_list[i].item_id)
                        result.num_2 = param.cost_list[i].cost_num + result.num_2
                    }

                    result.point_list.push(Number(p_index))
                }
            }
        }

        result.num_2 = result.num_2 - result.num_1
        result.num_2 = result.num_2 < 0 ? 0 : result.num_2

        let shop_cfg = CfgShopData.shop
        for (let i = 0; i < shop_cfg.length; i++) {
            if (shop_cfg[i].item_id == cost_item) {
                result.num_3 = shop_cfg[i].exchange_item_num * result.num_2
                result.send_index = shop_cfg[i].index
            }
        }

        return result
    }

    public GetSuperStarPointUpOneKeyParam(index: number) {
        let point_list: number[][] = []
        let end_list: number[] = []
        let result = {
            cost_num: 0,
            point_list: end_list,
        }

        // 统算点位
        this.super_cache = []

        let con_cfg = CfgStarMapData.superstar_condition[index]
        let lines = con_cfg.adjoin.toString().split("|")
        for (var i in lines) {
            let list = [index, Number(lines[i])]
            point_list[i] = this.CheckSuperPointLast(list)
        }

        // point_list = this.CheckSuperPointLast([index])

        // LogError("?f gh",point_list)

        for (var i in this.super_cache) {
            this.super_cache[i].splice(0, 1)
        }

        let fix_list = []
        for (var i in point_list) {
            for (var c in point_list[i]) {
                let is_zero = true
                for (var j in this.super_cache) {
                    for (var k in this.super_cache[j]) {
                        if (point_list[i][c] == Number(this.super_cache[j][k])) {
                            let removed = point_list[i].splice(Number(c), 1)
                        }
                    }
                }
            }
        }

        // LogError(" ?? ",point_list)
        // LogError(" ?? ",this.super_cache)

        let success_mark = 0
        for (var k in point_list) {
            for (var v in point_list[k]) {
                if (point_list[k][v] == 0) {
                    success_mark = Number(k)
                }
            }
        }

        end_list = point_list[success_mark]
        // result.point_list = end_list

        let line_list = []
        let total_check_level = this.GetSuperStarNetInfo(index) + 1
        for (var i in end_list) {
            let level = this.GetSuperStarNetInfo(end_list[i])
            let check_level = level + 1
            if (check_level <= 10 && total_check_level > level) {
                let config = this.GetStarMapSuperStar(index, check_level)
                result.cost_num = config.cost_item[0].num + result.cost_num
                line_list.push(end_list[i])
            }
        }
        for (let i = line_list.length; i--; i < 0) {
            result.point_list.push(line_list[i])
        }

        return result
    }

    // 递归方法！
    // 以递归的方式收集所在点的有效线路，直到发现顶点0为止
    private CheckSuperPointLast(param: number[]): number[] {
        let check_list = param
        let oper_pos = param[param.length - 1]
        let check_level = this.GetSuperStarNetInfo(oper_pos) + 1
        let con_cfg = CfgStarMapData.superstar_condition[oper_pos]
        let lines = con_cfg.adjoin.toString().split("|")

        for (var i in lines) {
            let checked = Number(lines[i])

            let is_with = false
            for (var j in check_list) {
                if (check_list[j] == checked) {
                    is_with = true
                }
            }

            if (!is_with) {
                if (checked == 0) {
                    check_list.push(0)
                    // LogError("?hasdf ",check_list)
                    return check_list
                }
                else {
                    // 存在三岔路的情况时对岔路进行歧路递归
                    if (lines.length > 2 && Number(i) > 1) {
                        let list = this.CheckSuperPointLast([oper_pos, checked])
                        this.super_cache.push(list)
                    }
                    check_list.push(checked)
                    this.CheckSuperPointLast(check_list)
                }
            }
        }

        return check_list
    }

    // public CheckSuperPointZero(param:number[],map:number[],end_pos:number)
    // {
    //     for()
    // }

    // 逆向递归，
    public CheckSuperPointZero(param: number[], map: number[], end_pos: number) {
        let check_list = param
        let oper_pos = param[param.length - 1]
        let con_cfg = CfgStarMapData.superstar_condition[oper_pos]
        let lines = con_cfg.adjoin.toString().split("|")

        for (var i in lines) {
            let checked = Number(lines[i])

            let is_with = false
            for (var j in check_list) {
                if (check_list[j] == checked) {
                    is_with = true
                }
            }

            if (is_with) {
                for (var j in map) {
                    if (map[j] == checked) {
                        check_list.push(checked)
                        break
                    }
                }
            }

        }
    }

    //当前星系是否满级
    public GetIsMaxLevel(type: number, grade: number) {
        let curArr = this.star_map_info[type - 1][grade - 1];
        for (let i = 0; i < curArr.length; i++) {
            if(curArr[i].level < 10){
                return false;
            }
        }
        return true;
    }

    //返回当前星系手动升级了多少颗星
    public GetIsUpLevel(type: number, grade: number) {
        // console.log("----",this.star_map_info);

        let curArr = this.star_map_info[type - 1][grade - 1];
        let fix_list = this.CheckStarPointLast(type - 1, grade - 1, [0])

        let list = []
        for (let i = 0; i < curArr.length; i++) {
            if (curArr[0].level > curArr[i].level) {
                list.push(curArr[i].id)
            }
        }
        if (list.length < 1) {
            for (let i = 0; i < curArr.length; i++) {
                list.push(curArr[i].id)
            }
        }

        let up_list = []
        for (var i in fix_list) {
            let is_with = false
            for (var j in list) {
                if (fix_list[i] == list[j]) {
                    is_with = true
                    break
                }
            }

            if (is_with) {
                up_list.push(fix_list[i])
            }
        }

        return up_list;
    }

    private CheckStarPointLast(type: number, grade: number, param: number[]): number[] {
        let check_list = param
        let oper_pos = param[param.length - 1]
        let con_cfg = this.GetStarMapRoleStarCondition(type, grade, oper_pos)
        let lines = con_cfg.adjoin.toString().split("|")

        for (var i in lines) {
            let checked = Number(lines[i])

            let is_with = false
            for (var j in check_list) {
                if (check_list[j] == checked) {
                    is_with = true
                }
            }

            if (!is_with) {
                if (checked == 0) {
                    check_list.push(0)
                    return check_list
                }
                else {
                    check_list.push(checked)
                    this.CheckStarPointLast(type, grade, check_list)
                }
            }
        }

        return check_list
    }

    public JumpAttrFromOneKey(type: number, grade: number, points: number[]) {
        let attr_list: any[] = []
        for (var i in points) {
            let net_points = this.GetStarMapNetInfo(type, grade)
            let level = net_points[points[i]].level
            let check_level = level + 1
            let cfg = check_level == 11 ? null : this.GetStarMapRoleStar(type, grade, points[i], check_level)
            let cur_cfg = level == 0 ? null : this.GetStarMapRoleStar(type, grade, points[i], level)

            let cur_attr = []
            if (cur_cfg != null) {
                for (let c = 0; c < cur_cfg.jihuo_att.length; c++) {
                    let attr = {
                        type: cur_cfg.jihuo_att[c].type,
                        add: cur_cfg.jihuo_att[c].add,
                    }
                    cur_attr.push(attr)
                }
            }
            let next_attr = []
            if (cfg != null) {
                for (let c = 0; c < cfg.jihuo_att.length; c++) {
                    let attr = {
                        type: cfg.jihuo_att[c].type,
                        add: cfg.jihuo_att[c].add,
                    }
                    next_attr.push(attr)
                }
            }

            for (var j in next_attr) {
                let attr_change = next_attr[j].add
                for (var k in cur_attr) {
                    if (cur_attr[k].type == next_attr[j].type) {
                        attr_change = attr_change - cur_attr[k].add
                        break
                    }
                }

                let is_with = false
                for (var check in attr_list) {
                    if (attr_list[check].type == next_attr[j].type) {
                        is_with = true
                        attr_list[check].add = attr_change + attr_list[check].add
                        break
                    }
                }
                if (!is_with) {
                    let info = {
                        type: next_attr[j].type,
                        add: attr_change,
                    }

                    attr_list.push(info)
                }
                // next_attr[j]
            }
        }

        for (var i in attr_list) {
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr_list[i].type]} ${"+"}${AttrHelper.Percent(attr_list[i].type, attr_list[i].add)}`, 1)
        }
    }

    public JumpAttrFromOneKeyBySuper(points: number[]) {
        let attr_list: any[] = []
        for (var i in points) {
            let level = this.GetSuperStarNetInfo(points[i])

            let check_level = level + 1
            let cfg = check_level == 11 ? null : this.GetStarMapSuperStar(points[i], check_level)
            let cur_cfg = level == 0 ? null : this.GetStarMapSuperStar(points[i], level)

            let cur_attr = []
            if (cur_cfg != null) {
                for (let c = 0; c < cur_cfg.jihuo_att.length; c++) {
                    let attr = {
                        type: cur_cfg.jihuo_att[c].type,
                        add: cur_cfg.jihuo_att[c].add,
                    }
                    cur_attr.push(attr)
                }
            }
            let next_attr = []
            if (cfg != null) {
                for (let c = 0; c < cfg.jihuo_att.length; c++) {
                    let attr = {
                        type: cfg.jihuo_att[c].type,
                        add: cfg.jihuo_att[c].add,
                    }
                    next_attr.push(attr)
                }
            }

            for (var j in next_attr) {
                let attr_change = next_attr[j].add
                for (var k in cur_attr) {
                    if (cur_attr[k].type == next_attr[j].type) {
                        attr_change = attr_change - cur_attr[k].add
                        break
                    }
                }

                let is_with = false
                for (var check in attr_list) {
                    if (attr_list[check].type == next_attr[j].type) {
                        is_with = true
                        attr_list[check].add = attr_change + attr_list[check].add
                        break
                    }
                }
                if (!is_with) {
                    let info = {
                        type: next_attr[j].type,
                        add: attr_change,
                    }

                    attr_list.push(info)
                }
                // next_attr[j]
            }
        }

        for (var i in attr_list) {
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr_list[i].type]} ${"+"}${AttrHelper.Percent(attr_list[i].type, attr_list[i].add)}`, 1)
        }

    }
}


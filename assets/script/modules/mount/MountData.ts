import { CfgAttrUp, CfgItem } from 'config/CfgCommon';
import { CfgMountData, CfgMountJiHuo, CfgMountResUp } from "config/CfgMount";
import { LogError } from 'core/Debugger';
import { bit } from 'core/net/bit';
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from 'manager/ViewManager';
import { AttChangeData } from 'modules/Angel/AngelData';
import { CoreCrisisType } from 'modules/CoreCrisis/CoreCrisisConfig';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { BagData } from 'modules/bag/BagData';
import { Item } from 'modules/bag/ItemData';
import { QualityColorStr } from 'modules/common/ColorEnum';
import { AttrListName, Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { CommGetData, CommGetType, CommonGetView } from 'modules/common_account/CommonGetView';
import { tabberInfo } from 'modules/common_board/CommonBoard5';
import { GetWayData } from 'modules/getway/GetWayData';
import { FunOpen } from 'modules/guide/FunOpen';
import { ItemInfoView } from 'modules/item_info/ItemInfoView';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataBase } from "../../data/DataBase";
import { AttrHelper } from '../../helpers/AttrHelper';
import { CfgHelper } from '../../helpers/CfgHelper';
import { TextHelper } from '../../helpers/TextHelper';
import { IsEmpty } from '../../helpers/UtilHelper';
import { MOUNR_REQ_TYPE, MountCtrl } from './MountCtrl';
import { MountShield } from './MountBaseShow';

export enum MOUNR_RET_TYPE {
    LEVEL_UP = 0, // 升级 P1:id p2:level
    GRADE_UP = 1, // 升阶 P1:id p2:grade
    EXPLORE = 2,  // 探索 p1:id p2:time
    SET_APP = 3,  // 设置幻化 p1:id

    PIFU_UP = 4,  // 皮肤升级 p1:id p2:level
    USE_PIFU = 5, // 设置皮肤 p1:id
}

class MountFlushInfo {
    @smartdata
    needflush: number;

    @smartdata
    operid: number;

    @smartdata
    equiped: number;

    @smartdata
    buyflush: boolean;

    @smartdata
    washflush: number
}

export class MountData extends DataBase {
    public flush_info: MountFlushInfo;
    mount_info: any;
    private pifu_list: any;
    public appearance_id: any;
    private cfg_mount_res_up: { [id: number]: CfgMountResUp[] };
    public is_huanhua = 0

    private harness_list: IPB_HarnessData[]
    private harness_weak: any
    private harness_info: any
    private harness_wash_mark: number[]
    private equiped_eff_pos: number
    private equip_wash_sels: Array<Array<boolean>> = [];

    private wash_eff_mark = false
    constructor() {
        super();
        this.createSmartData();

        this.appearance_id = -1
        this.mount_info = []
    }

    private createSmartData() {
        this.flush_info = CreateSMD(MountFlushInfo);
        this.flush_info.needflush = 0
        this.flush_info.equiped = 0
        this.flush_info.washflush = 0
    }

    public SetSCMountInfo(data: PB_SCMountInfo) {
        for (let i = 0; i < data.mountList.length; i++) {
            this.mount_info[i] = data.mountList[i]
        }
        this.appearance_id = data.appearanceId
        this.pifu_list = data.pifuList

        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public SetSCMountOpRet(data: PB_SCMountOpRet) {
        if (data.retType == MOUNR_RET_TYPE.LEVEL_UP) {
            this.mount_info[data.param1].level = data.param2;
        }
        else if (data.retType == MOUNR_RET_TYPE.GRADE_UP) {
            this.mount_info[data.param1].grade = data.param2;
        }
        else if (data.retType == MOUNR_RET_TYPE.EXPLORE) {
            this.mount_info[data.param1].lastExploreTime = data.param2;
        }
        else if (data.retType == MOUNR_RET_TYPE.SET_APP) {
            this.ChangeAttrChangeShow(this.appearance_id, data.param1, 0);
            this.appearance_id = data.param1
        }
        else if (data.retType == MOUNR_RET_TYPE.PIFU_UP) {
            this.pifu_list[data.param1] = data.param2
        }
        else if (data.retType == MOUNR_RET_TYPE.USE_PIFU) {
            this.ChangeAttrChangeShow(this.appearance_id, 1000 + data.param1, 1);
            this.appearance_id = 1000 + data.param1 // 幻化的话就是1000+id
        }

        this.flush_info.needflush = this.flush_info.needflush + 1
        // this.flush_info.operid = data.param1 // 这个值废弃
    }

    public SetSCMountHarnessList(data: PB_SCMountHarnessListInfo) {
        this.harness_list = []

        for (var i in data.harnessList) {
            this.harness_list[data.harnessList[i].index] = data.harnessList[i]
        }

        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public SetSCMountHarnessOneInfo(data: PB_SCMountHarnessOneInfo) {
        this.harness_list[data.harnessData.index] = data.harnessData

        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    // 只取穿戴
    public SetSCMountHarnessInfo(data: PB_SCMountHarnessInfo) {
        this.harness_weak = data.wearIdx
        let info = {
            free_time: data.freeTime,
            refresh_1_num: data.refresh_1Num,
            refresh_2_num: data.refresh_2Num,
            buy_flag: data.buyFlag,
            buy_seq_list: data.buySeqList,
            wear_idx: data.wearIdx,
        }
        this.harness_info = info
        this.flush_info.needflush = this.flush_info.needflush + 1
        this.flush_info.buyflush = !this.flush_info.buyflush
    }

    public GetMountIsRideOn(id: number) {
        return id == this.appearance_id
    }

    public GetWithRideOn() {
        return this.appearance_id > -1
    }

    public GetMountNetInfo(id: number) {
        return this.mount_info[id]
    }

    public GetMountLevelCfg(id: number, next: boolean) {
        let net_info = this.GetMountNetInfo(id)
        var config = CfgMountData.mount_cfg;
        for (const info of config) {
            if (!next && info.level == net_info.level && id == info.mount_id) {
                return info
            }
            else if (next && info.level == net_info.level + 1 && id == info.mount_id) {
                return info
            }
        }

        return null
    }

    public GetMountGradeCfg(id: number, next: boolean) {
        let net_info = this.GetMountNetInfo(id)
        var config = CfgMountData.mount_jihuo;
        for (const info of config) {
            if (!next && info.level == net_info.grade && id == info.mount_id) {
                return info
            }
            else if (next && info.level == net_info.grade + 1 && id == info.mount_id) {
                return info
            }
        }

        return null
    }

    public GetMountGrade(id: number) {
        var config = CfgMountData.mount_jihuo;
        config.filter(cfg => {
            return cfg.mount_id == id;
        })
        for (const info of config) {
            if (id == info.mount_id) {
                return info
            }
        }
        return null
    }

    public GetMountDetail(id: number) {
        if (id == undefined) { return }
        let net_info = this.GetMountNetInfo(id)
        if (IsEmpty(net_info)) { return }

        let cur_mount_cfg = null
        let next_mount_cfg = null
        var config = CfgMountData.mount_cfg;

        for (const info of config) {
            if (info.level == net_info.level && id == info.mount_id) {
                cur_mount_cfg = info
            }

            if (info.level == net_info.level + 1 && id == info.mount_id) {
                next_mount_cfg = info
            }
        }
        let is_mount_level_max = next_mount_cfg == null
        let is_mount_level_init = cur_mount_cfg == null

        let cur_g_mount_cfg = null
        let next_g_mount_cfg = null
        var g_config = CfgMountData.mount_jihuo;
        for (const info of g_config) {
            if (info.level == net_info.grade && id == info.mount_id) {
                cur_g_mount_cfg = info
            }

            if (info.level == net_info.grade + 1 && id == info.mount_id) {
                next_g_mount_cfg = info
            }
        }
        let is_mount_grade_max = next_g_mount_cfg == null

        let hecheng_cfg = null
        for (const info of CfgMountData.hecheng) {
            if (info.mount_id == id) {
                hecheng_cfg = info
                break
            }
        }

        let level_info = is_mount_level_init ? next_mount_cfg : cur_mount_cfg
        if (level_info == undefined) return

        let core_limiting = false
        if (!IsEmpty(next_mount_cfg)) {
            core_limiting = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Mount, next_mount_cfg.level)
        }
        let level_b_num = BagData.Inst().getItemNum(level_info.up_item_id);
        let level_num = (level_b_num >= level_info.up_item_num && !core_limiting) ? 1 : 0

        if (IsEmpty(cur_g_mount_cfg)) { return }

        let he_config = CfgMountData.hecheng
        let info = null
        for (var index in he_config) {
            if (he_config[index].hecheng_item_id == cur_g_mount_cfg.up_id) {
                info = he_config[index]
            }
        }
        let pice_b_num = info == null ? 0 : BagData.Inst().getItemNum(info.hecheng_id);
        let pice_n_num = info == null ? 0 : Item.GetConfig(info.hecheng_id).param_0
        let pice_num = (pice_b_num > 0 && pice_b_num >= pice_n_num) ? 1 : 0

        let awake_info = cur_g_mount_cfg
        let awake_b_num = BagData.Inst().getItemNum(awake_info.up_id);
        let awake_num = (!IsEmpty(next_g_mount_cfg) && awake_b_num >= awake_info.up_num) ? 1 : 0



        let fix = {
            color: cur_g_mount_cfg.color,
            name: cur_g_mount_cfg.name,
            level: net_info.level,
            grade: net_info.grade,
            last_explore_time: net_info.last_explore_time,

            is_level_init: is_mount_level_init,
            is_max_level: is_mount_level_max,
            // is_grade_init: is_mount_grade_init,
            is_max_grade: is_mount_grade_max,

            cur_cfg: cur_mount_cfg,
            next_cfg: next_mount_cfg,

            cur_g_cfg: cur_g_mount_cfg,
            next_g_cfg: next_g_mount_cfg,

            hecheng_cfg: hecheng_cfg,

            mount_res: cur_g_mount_cfg.mount_res,

            level_red: level_num,
            pice_red: pice_num,
            awake_red: awake_num,
            unlock_red: awake_num,
        }

        return fix;
    }

    // 获取坐骑信息界面信息
    public GetEnterParam() {
        let param = this.GetMountDetail(this.appearance_id)

        let attr_list = []
        let temp_cell = []

        for (const info of param.cur_g_cfg.up_att) {
            if (temp_cell.length < 3) {
                temp_cell.push(info);
            }

            if (temp_cell.length >= 3) {
                attr_list.push(temp_cell);
                temp_cell = []
            }
        }

        if (!param.is_level_init) {
            for (const info of param.cur_cfg.up_att) {

                let plus_flag = true
                for (let i = 0; i < attr_list.length; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (attr_list[i] != undefined && attr_list[i][j].type == info.type) {
                            plus_flag = false
                            attr_list[i][j].add = attr_list[i][j].add + info.add
                        }
                    }
                }

                if (plus_flag) {
                    if (temp_cell.length < 3) {
                        temp_cell.push(info);
                    }

                    if (temp_cell.length >= 3) {
                        attr_list.push(temp_cell);
                        temp_cell = []
                    }
                }
            }
        }

        attr_list.push(temp_cell);

        return {
            mount_id: this.appearance_id,
            color: param.color,
            level: param.level,
            name: param.name,
            attr_list: attr_list,
        }
    }

    public GetMainMountList() {
        let fix = []

        for (let i = 0; i < this.mount_info.length; i++) {
            let net_info = this.GetMountNetInfo(i)
            let cfg = this.GetMountLevelCfg(i, false)
            let next_cfg = this.GetMountLevelCfg(i, true)
            let g_cfg = this.GetMountGradeCfg(i, false)
            let next_g_cfg = this.GetMountGradeCfg(i, true)
            if(MountShield.indexOf(g_cfg.up_id) != -1)continue;//屏蔽对应坐骑id

            let is_app = i == this.appearance_id
            let level_info = cfg == null ? next_cfg : cfg
            // LogError("?",i,net_info,cfg,next_cfg)
            let level_b_num = BagData.Inst().getItemNum(level_info.up_item_id);
            let core_limiting = false
            if (!IsEmpty(next_cfg)) {
                core_limiting = CoreCrisisData.Inst().CheckIsCoreLimiting(CoreCrisisType.Mount, next_cfg.level)
            }
            let level_num = (!IsEmpty(next_cfg) && level_b_num >= level_info.up_item_num && !core_limiting) ? 1 : 0

            let config = CfgMountData.hecheng
            let info = null
            for (var index in config) {
                // LogError("check?! mount ",g_cfg.up_id,config[index].hecheng_item_id)
                if (config[index].hecheng_item_id == (g_cfg.up_id)) {
                    info = config[index]
                }
            }
            let pice_b_num = info == null ? 0 : BagData.Inst().getItemNum(info.hecheng_id);
            let pice_n_num = Item.GetConfig(info.hecheng_id).param_0
            let pice_num = (pice_b_num > 0 && pice_b_num >= pice_n_num) ? 1 : 0

            let awake_info = g_cfg
            let awake_b_num = BagData.Inst().getItemNum(awake_info.up_id);
            // let awake_num = (!IsEmpty(next_g_cfg) && awake_b_num >= awake_info.up_num) ? 1 : 0   
            let awake_num = (!IsEmpty(next_g_cfg) && net_info.level == 0 && awake_b_num >= awake_info.up_num) ? 1 : 0;//屏蔽觉醒红点

            if (cfg != null || next_cfg != null) {
                let vo = {
                    id: i,
                    color: g_cfg.color,
                    name: this.mount_info[i].name,
                    level: this.mount_info[i].level,
                    grade: net_info.grade,
                    is_app: is_app ? 0 : 1,
                    explore_item_id: g_cfg.explore_item_id == 0 ? next_g_cfg.explore_item_id : g_cfg.explore_item_id,
                    explore_num: g_cfg.explore_item_num,

                    main_red_num: ((net_info.grade == 0 && pice_num > 0) || (net_info.grade > 0 && (level_num > 0 || pice_num > 0))) ? 1 : 0,
                    awake_red_num: awake_num
                }

                fix.push(vo);
            }
        }

        fix.sort((a, b) => a.is_app == b.is_app ? (a.grade == b.grade ? a.level - b.level : b.grade - a.grade) : a.is_app - b.is_app);

        return fix
    }

    public GetMountLevelChange(id: number) {
        let detail = this.GetMountDetail(id)

        let fix = []
        let length_num = detail.is_level_init ? detail.next_cfg.up_att.length : detail.cur_cfg.up_att.length

        for (let i = 0; i < length_num; i++) {
            let vp = {
                att_type: detail.is_level_init ? detail.next_cfg.up_att[i].type : detail.cur_cfg.up_att[i].type,
                att_1_value: detail.is_level_init ? detail.next_cfg.up_att[i].add : detail.cur_cfg.up_att[i].add,
                att_2_value: detail.is_max_level ? 0 : detail.next_cfg.up_att[i].add,

                is_max: detail.is_max_level || detail.is_level_init,
            }
            fix.push(vp);
        }

        return fix
    }

    public GetMountGradeChange(id: number) {
        let detail = this.GetMountDetail(id)

        let fix = []
        let length_num = detail.is_max_grade ? detail.cur_g_cfg.up_att.length : detail.next_g_cfg.up_att.length

        for (let i = 0; i < length_num; i++) {
            let vp = {
                att_type: detail.is_max_grade ? detail.cur_g_cfg.up_att[i].type : detail.next_g_cfg.up_att[i].type,
                att_1_value: detail.cur_g_cfg.up_att[i] == null ? 0 : detail.cur_g_cfg.up_att[i].add, // detail.is_max_grade ? detail.cur_g_cfg.up_att[i].add : detail.next_g_cfg.up_att[i].add
                att_2_value: detail.is_max_grade ? 0 : detail.next_g_cfg.up_att[i].add,

                is_max: detail.is_max_grade,
                is_special: false,
            }
            fix.push(vp);
        }

        // let vp = {
        //     att_type_str: Language.Mount.ExploreAttr,
        //     att_1_value: detail.cur_g_cfg.explore_item_num + Language.Mount.ExploreShow,
        //     att_2_value: detail.is_max_grade ? 0 + Language.Mount.ExploreShow : detail.next_g_cfg.explore_item_num + Language.Mount.ExploreShow,
        //     is_max: detail.is_max_grade,
        //     is_special: true,
        // }
        // fix.push(vp);

        return fix
    }

    public GetMountExploreProfit() {
        let cur_num = 0
        let cur_pro = 0
        let max_pro = 0

        let cur_time = TimeCtrl.Inst().ServerTime
        for (let i = 0; i < this.mount_info.length; i++) {
            let g_cfg = this.GetMountGradeCfg(i, false)
            if (g_cfg != null) {
                cur_num = cur_num + g_cfg.explore_item_num

                max_pro = 24 * g_cfg.explore_item_num + max_pro
                let times = Math.floor((cur_time - Number(this.mount_info[i].lastExploreTime)) / 3600)
                cur_pro = (times > 24 ? 24 : times) * g_cfg.explore_item_num + cur_pro
            }
        }

        return {
            cur_num: cur_num,
            cur_pro: cur_pro,
            max_pro: max_pro,
        }
    }

    public GetMountExploreRed() {
        let cur_time = TimeCtrl.Inst().ServerTime
        for (let i = 0; i < this.mount_info.length; i++) {
            let g_cfg = this.GetMountGradeCfg(i, false)
            if (g_cfg != null) {
                let times = Math.floor((cur_time - Number(this.mount_info[i].lastExploreTime)) / 3600)
                if (times >= 10 && this.mount_info[i].lastExploreTime > 0) { return true }
            }
        }
        return false
    }

    public GetHeChengCfg(mount_id: number) {
        let config = CfgMountData.hecheng
        for (var index in config) {
            if (config[index].mount_id == mount_id) {
                return config[index]
            }
        }
        return null
    }

    public TryOpenFixGetMountAwake(item: any) {

        let config = CfgMountData.hecheng
        let info = null
        for (var index in config) {
            if (config[index].hecheng_item_id == item.itemId) {
                info = config[index]
            }
        }

        if (info != null) {
            this.TryOpenGetMount(info.mount_id)
        }
    }

    public TryOpenGetMount(mount_id: number) {
        let cfg = null
        var g_config = CfgMountData.mount_jihuo;
        for (const info of g_config) {
            if (info.level == 1 && mount_id == info.mount_id) {
                cfg = info
            }
        }

        if (cfg == null) { return }
        let attr: CfgAttrUp[] = cfg.up_att
        ViewManager.Inst().OpenView(CommonGetView, new CommGetData(cfg.name, attr, cfg.color, cfg.mount_res, CommGetType.Ride));
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public GetAppearanceIdMount() {
        if (this.appearance_id == -1) {
            return { id: -1 }
        }
        if (this.appearance_id >= 1000) {
            let huanhua_check = this.appearance_id - 1000
            let cfg = CfgMountData.mount_res[huanhua_check]
            if (IsEmpty(cfg)) {
                return { id: -1 }
            }
            return { id: cfg.icon_id, color: 5 }
        }

        let detail = this.GetMountDetail(this.appearance_id)
        if (detail == undefined || IsEmpty(detail.cur_g_cfg)) {
            return { id: -1 }
        }
        let g_cfg = detail.cur_g_cfg

        return {
            id: g_cfg.icon_id,
            color: detail.color,
        }
    }

    public GetAwakeCfgByItemid(item_id: number) {
        var g_config = CfgMountData.mount_jihuo;
        for (const info of g_config) {
            if (info.up_id == item_id) {
                return info
            }
        }

        return null
    }

    public GetCfgMountApp(id: number): number {
        let mount = 0
        if (id >= 1000) {
            id -= 1000
            CfgMountData.mount_res.forEach(element => {
                element.mount_skin_seq == id && (mount = element.res_id);

            });
        } else {
            CfgMountData.mount_jihuo.forEach(element => {
                element.mount_id == id && (mount = element.mount_res);
            });
        }
        return mount
    }

    public getCfgMount(id: number): CfgMountJiHuo {
        let mount
        CfgMountData.mount_jihuo.forEach(element => {
            element.mount_id == id && (mount = element);
        });
        return mount;
    }

    public CfgMountJiHuoItemLevel1(item_id: number) {
        return CfgMountData.mount_jihuo.find(cfg => cfg.up_id == item_id && 1 == cfg.level) || CfgMountData.mount_res.find(cfg => cfg.jihuo_item_id == item_id);
    }
    // public GetMountList(){
    //     var config = CfgMountData.mount_cfg;
    //     return config
    // }

    // public GetMountList2(){
    //     var config = CfgMountData.mount_jihuo;
    //     return config
    // }

    // public GetMountList3(){
    //     var config = CfgMountData.other;
    //     return config
    // }

    public GetRedNum() {

        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.Mount.View));
        if (!open_t.is_open) {

            return 0
        }

        if (this.mount_info.length == 0) {

            return 0
        }

        if (CoreCrisisData.Inst().GetCoreRed(CoreCrisisType.Mount) == 1) {
            return 1
        }

        let mount_list = this.GetMainMountList()
        for (var key in mount_list) {
            let oper = mount_list[key]
            if (oper.main_red_num == 1) {

                return 1
            }
            if (oper.awake_red_num == 1) {

                return 1
            }
        }

        let param = this.GetMountExploreProfit()
        // if(param.cur_pro >= Math.floor(param.max_pro/2)&&param.max_pro > 0 )
        // if(this.GetMountExploreRed())
        // {
        //     return 1
        // }
        // let res_list = this.GetResList();
        // for (var key in res_list)
        // {
        //     if(this.GetHuanHuaResUpRed(res_list[key].mount_skin_seq) > 0)
        //     {
        //         return 1
        //     }

        // }

        return 0
    }

    // 获取坐骑的觉醒总等级
    public GetTotalGrade() {
        let total_grade = 0
        let mount_list = this.GetMainMountList()
        for (var index in mount_list) {
            total_grade = total_grade + mount_list[index].grade
        }
        return total_grade
    }


    // 移植代码-幻化
    public GetResLevel(id: number) {
        if (this.pifu_list == null) { return 0 }
        for (let i = 0; i < this.pifu_list.length; i++) {
            if (i == id) {
                return this.pifu_list[i] == null ? 0 : this.pifu_list[i]
            }
        }
        return 0;
    }
    public GetNextAppearanceAtt(id: number) {
        let level = this.GetResLevel(id);
        let cur_appearance_att = [];
        if (level == 1)
            cur_appearance_att = CfgMountData.mount_res[id].jihuo_att;
        else
            cur_appearance_att = this.GetAppearanceUpCfg()[id][level ? level - 1 : 0].jihuo_att;
        let next_cfg: CfgMountResUp = this.GetResNextLvCfg(id, level);
        let next_res_att = next_cfg ? this.sumAtt(next_cfg.jihuo_att, {}) : undefined;
        let att_change: Map<number, AttChangeData> = this.GetChangeData(next_res_att, this.sumAtt(cur_appearance_att, {}));
        // LogError("?F g", Array.from(att_change.values()))
        return Array.from(att_change.values());
    }
    public GetAppearanceUpCfg() {
        if (!this.cfg_mount_res_up) {
            let cfgs = CfgMountData.mount_res_up;
            this.cfg_mount_res_up = CfgHelper.reSetdatas(cfgs, ["mount_skin_seq"], true);
        }
        return this.cfg_mount_res_up;
    }
    public GetResNextLvCfg(id: number, level?: number): any {
        let next_cfg: any;
        if (!level)
            level = this.GetResLevel(id);
        if (!level) {//未激活
            next_cfg = CfgMountData.mount_res[id];
        } else {
            next_cfg = this.GetAppearanceUpCfg()[id][level];
        }
        return next_cfg;
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
    public sendHuanHua(id: number) {
        let level = this.GetResLevel(id)
        if (id == -1) {
            MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.SET_PIFU, id);
            return
        }
        if (level) {
            let cur_id = (this.appearance_id > 1000) ? this.appearance_id - 1000 : -1;
            if (cur_id != id) {
                if (id != -1)
                    PublicPopupCtrl.Inst().Center(Language.Angel.tip3)
                MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.SET_PIFU, id);
            }
        }
        else
            PublicPopupCtrl.Inst().Center(Language.Angel.tip2)
    }
    public IsResMax(id: number) {
        let cfg = this.GetAppearanceUpCfg()[id] ?? [];
        let level = this.GetResLevel(id);
        return level >= cfg.length;
    }
    public GetResUpCost(id: number) {
        let cfg = this.GetResNextLvCfg(id);
        if (cfg.jihuo_item_id) {
            return new CfgItem(cfg.jihuo_item_id, 1)
        } else {
            return new CfgItem(cfg.up_item_id, cfg.up_item_num)
        }
    }
    //天使幻化升级红点
    public GetHuanHuaResUpRed(seq: number) {
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
        if (!this.mount_info)
            return 0;
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Mount.View);
        if (!open_t.is_open) {
            return 0;
        }
        let list = this.GetResList();
        for (let i = 0; i < list.length; i++) {
            if (this.GetHuanHuaResUpRed(list[i].mount_skin_seq))
                return 1;
        }
        return 0;
    }
    public GetResList() {
        let cfg = CfgMountData.mount_res;
        let list = [];
        for (let i = 0; i < cfg.length; i++) {
            if (cfg[i].is_show)
                list.push(cfg[i])
        }
        return list;
    }

    // oper=0且oldid为幻化id时
    // oper=1且newid为幻化id时
    public ChangeAttrChangeShow(old_id: number, new_id: number, oper: number) {
        let cur_appearance_att: CfgAttrUp[] = [];
        let id;
        let fuhao = oper == 0 ? "-" : "+";
        let type = oper;
        if (type == 0 && old_id >= 1000) {
            id = old_id - 1000
        }
        else if (type == 1 && new_id >= 1000) {
            id = new_id - 1000
        }
        else {
            return
        }

        let cfg = CfgMountData.mount_res[id]
        if (cfg) {
            let level = this.GetResLevel(id);
            if (level == 1)
                cur_appearance_att = cfg.jihuo_att;
            else
                cur_appearance_att = this.GetAppearanceUpCfg()[id][level ? level - 1 : 0].jihuo_att;
        }

        for (let i = 0; i < cur_appearance_att.length; i++) {
            let att_type = cur_appearance_att[i].type;
            let att_add = cur_appearance_att[i].add;
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[att_type]} ${fuhao}${AttrHelper.Percent(att_type, att_add)}`, type)
        }
    }

    public FlushCoreCrisis() {
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public FlushItemChange() {
        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public CheckEmpty() {
        return this.harness_weak == undefined
    }

    // 类型-1 全list 0~3 针对四个类型 协议数据
    public GetHarnessList(type: number) {
        if (this.CheckEmpty()) { return }

        if (type == -1) {
            return this.harness_list
        }
        else {
            let list: IPB_HarnessData[] = []
            for (var i in this.harness_list) {
                let oper = this.harness_list[i]
                let item_cfg = Item.GetConfig(oper.itemId)
                if (item_cfg != null && item_cfg.harness_type == type && oper.itemId > 0 && oper.wearingMark == 0) {
                    list.push(oper)
                }
            }

            return list

        }
    }

    // 获取穿戴中 协议数据
    public GetHarnessWeakList() {
        if (this.CheckEmpty()) { return }

        let list: IPB_HarnessData[] = []
        for (var index in this.harness_weak) {
            if (this.harness_weak[index] > 0) {
                let oper = this.harness_list[this.harness_weak[index]]
                if (oper != null) {
                    list[Number(index)] = oper
                }
            }

        }

        return list
    }

    // 将协议信息升级为内部通用信息
    // 注入的index为协议中的背包下标
    public GetDetailHarnessInfo(index: number) {
        if (this.CheckEmpty()) { return }

        let oper = this.harness_list[index]
        let item_cfg = Item.GetConfig(oper.itemId)

        if (item_cfg == null) { return }

        let ex_list = []
        for (var i in oper.attrType) {
            let info = {
                type: oper.attrType[i],
                add: oper.attrVaule[i],
            }
            ex_list.push(info)
        }

        let info: MountEquipDetail = {
            harness_type: item_cfg.harness_type,
            name: item_cfg.name,
            item_id: item_cfg.id,
            base_attr_1: {
                type: item_cfg.att[0].type,
                add: item_cfg.att[0].add
            },
            base_attr_2: {
                type: item_cfg.att[1] == null ? 0 : item_cfg.att[1].type,
                add: item_cfg.att[1] == null ? 0 : item_cfg.att[1].add
            },
            ex_attr: ex_list,
            ex_attr_num: oper.attrNum,
            bag_index: index,
            ex_attr_max: item_cfg.harness_att_num_max,
            lockFlag: oper.lockFlag,
        }

        return info
    }

    public GetEquipParam() {
        let attrs: { type: number, add: number }[] = []
        let equips: MountEquipItemShow[] = []

        let result = {
            mount_res: "",
            equips: equips,
            attr_list: attrs,
            mount_name: ""
        }
        if (this.CheckEmpty()) { return result }

        if (this.appearance_id >= 1000) {
            let huanhua_check = this.appearance_id - 1000
            let cfg = CfgMountData.mount_res[huanhua_check]
            result.mount_name = cfg.name
            result.mount_res = cfg.res_id.toString()
        }
        else {
            if (this.appearance_id == -1) {
                let init = this.GetMountDetail(0)
                if (!IsEmpty(init) && !IsEmpty(init.cur_g_cfg)) {
                    result.mount_name = init.cur_g_cfg.name
                    result.mount_res = init.cur_g_cfg.mount_res.toString()
                }
            }
            else {
                let detail = this.GetMountDetail(this.appearance_id)
                if (!IsEmpty(detail) && !IsEmpty(detail.cur_g_cfg)) {
                    result.mount_name = detail.cur_g_cfg.name
                    result.mount_res = detail.cur_g_cfg.mount_res.toString()
                }
            }
        }


        let weak_list = this.GetHarnessWeakList()
        for (let i = 0; i < 4; i++) {
            if (weak_list[i] != null) {
                let oper = this.GetDetailHarnessInfo(weak_list[i].index)
                LogError("?ffff", oper)
                let info: MountEquipItemShow = {
                    harness_type: oper.harness_type,
                    item_info: {
                        item_id: oper.item_id
                    },
                    attr_1_str: AttrListName[oper.base_attr_1.type] + ":" + AttrHelper.Percent(oper.base_attr_1.type, oper.base_attr_1.add),
                    attr_2_str: (oper.base_attr_2.add > 0) ? AttrListName[oper.base_attr_2.type] + ":" + AttrHelper.Percent(oper.base_attr_2.type, oper.base_attr_2.add) : "",
                    is_empty: false,
                    beg_index: weak_list[i].index,
                    type_name: TextHelper.ColorStr(Language.Mount.EquipTypeName[oper.harness_type], QualityColorStr[Item.GetColor(oper.item_id)])
                }
                equips[i] = info
            }
            else {
                let info: MountEquipItemShow = {
                    harness_type: i,
                    item_info: {
                        item_id: 0
                    },
                    attr_1_str: "",
                    attr_2_str: '',
                    is_empty: true,
                    beg_index: -1,
                    type_name: TextHelper.ColorStr(Language.Mount.EquipTypeName[i], QualityColorStr[0])
                }
                equips[i] = info
            }
        }
        result.equips = equips

        for (var i in result.equips) {
            if (!result.equips[i].is_empty) {
                let oper = this.GetDetailHarnessInfo(weak_list[i].index)
                //检查主要属性1 和 2 
                let flag_1 = true
                for (var check in attrs) {
                    if (attrs[check].type == oper.base_attr_1.type) {
                        attrs[check].add = attrs[check].add + oper.base_attr_1.add
                        flag_1 = false
                    }
                }
                if (flag_1 && oper.base_attr_1.add > 0) {
                    let info = {
                        type: oper.base_attr_1.type,
                        add: oper.base_attr_1.add,
                    }
                    attrs.push(info)
                }

                let flag_2 = true
                for (var check in attrs) {
                    if (attrs[check].type == oper.base_attr_2.type) {
                        attrs[check].add = attrs[check].add + oper.base_attr_2.add
                        flag_2 = false
                    }
                }
                if (flag_2 && oper.base_attr_2.add > 0) {
                    let info = {
                        type: oper.base_attr_2.type,
                        add: oper.base_attr_2.add,
                    }
                    attrs.push(info)
                }

                // 检查其他的额外属性
                for (var index in oper.ex_attr) {
                    let flag = true
                    for (var check in attrs) {
                        if (oper.ex_attr[index].type == attrs[check].type) {
                            attrs[check].add = attrs[check].add + oper.ex_attr[index].add
                            flag = false
                        }
                    }
                    if (flag && oper.ex_attr[index].add > 0) {
                        let info = {
                            type: oper.ex_attr[index].type,
                            add: oper.ex_attr[index].add,
                        }
                        attrs.push(info)
                    }
                }
            }
        }

        result.attr_list = attrs

        return result
    }

    public WashLockMark(type: number, pos?: number) {
        LogError("?fg g ", type, pos)
        // type -1 清空
        if (type == -1) {
            this.harness_wash_mark = []
        }
        // type 0 解除锁定
        else if (type == 0) {
            this.harness_wash_mark[pos] = 0
            this.flush_info.washflush = this.flush_info.washflush + 1
        }
        // type 1 锁定
        else if (type == 1) {
            this.harness_wash_mark[pos] = 1
            this.flush_info.washflush = this.flush_info.washflush + 1
        }


    }

    public CheckWashLockMark() {
        let lock_num = 0
        for (let i = 0; i < 8; i++) {
            if (this.harness_wash_mark[i] != undefined && this.harness_wash_mark[i] == 1) {
                lock_num = lock_num + 1
            }
        }

        return lock_num
    }

    // 注意这里注入的index为背包下标
    public GetEquipWashDeatil(index: number) {
        let equip = {}
        let attrs: MountEquipAttr[] = []

        let result = {
            oper_item: 0,
            oper_need: 0,
            oper_target: equip,
            oper_attrs: attrs,
            oper_attr_num: 0,
            oper_item2: 0,
            oper_need2: 0,
        }

        if (this.CheckEmpty()) { return result }

        let lock_num = 0
        for (let i = 0; i < 8; i++) {
            if (this.harness_wash_mark[i] != undefined && this.harness_wash_mark[i] == 1) {
                lock_num = lock_num + 1
            }
        }
        LogError("?fg ", lock_num, this.harness_wash_mark)
        for (var i in CfgMountData.harness_gem_use) {
            if (CfgMountData.harness_gem_use[i].seq == lock_num) {
                result.oper_item = CfgMountData.harness_gem_use[i].use_item_id
                result.oper_need = CfgMountData.harness_gem_use[i].use_item_num
                result.oper_item2 = CfgMountData.harness_gem_use[i].use_item_id2
                result.oper_need2 = CfgMountData.harness_gem_use[i].use_item_num2
            }
        }

        let oper = this.GetDetailHarnessInfo(index)
        let info: MountEquipItemShow = {
            is_empty: false,
            beg_index: index,
            harness_type: oper.harness_type,
            item_info: {
                item_id: oper.item_id
            },
            attr_1_str: AttrListName[oper.base_attr_1.type] + ":" + AttrHelper.Percent(oper.base_attr_1.type, oper.base_attr_1.add),
            attr_2_str: (oper.base_attr_2.add > 0) ? AttrListName[oper.base_attr_2.type] + ":" + AttrHelper.Percent(oper.base_attr_2.type, oper.base_attr_2.add) : "",
            type_name: TextHelper.ColorStr(Language.Mount.EquipTypeName[oper.harness_type], QualityColorStr[Item.GetColor(oper.item_id)])
        }

        result.oper_target = info
        result.oper_attr_num = oper.ex_attr_num
        for (let i = 0; i < oper.ex_attr_max; i++) {
            if (i < oper.ex_attr_num) {
                let attr_str = AttrListName[oper.ex_attr[i].type] + ":" + AttrHelper.Percent(oper.ex_attr[i].type, oper.ex_attr[i].add)
                let info: MountEquipAttr = {
                    index: i,
                    is_unlock: true,
                    attr_str: oper.ex_attr[i].add > 0 ? attr_str : Language.Mount.EmptyExAttr,
                    unlock_item: CfgMountData.other[0].unlock_item_id,
                    unlock_need: CfgMountData.other[0].unlock_item_num,
                    is_select: 1 == bit.hasflag(oper.lockFlag, i),
                    color: this.GetEquipExColor(oper.item_id, oper.ex_attr[i].type, oper.ex_attr[i].add),
                    show_select: oper.ex_attr[i].add > 0,
                    show_empty: true,
                    is_empty: false,
                    master_index: oper.bag_index,
                }
                attrs.push(info)
            }
            else {
                let info: MountEquipAttr = {
                    index: 0,
                    is_unlock: false,
                    attr_str: Language.Mount.EmptyExAttr,
                    unlock_item: CfgMountData.other[0].unlock_item_id,
                    unlock_need: CfgMountData.other[0].unlock_item_num,
                    is_select: false,
                    color: 0,
                    show_select: true,
                    show_empty: true,
                    is_empty: true,
                    master_index: oper.bag_index,
                }
                attrs.push(info)
            }


        }

        result.oper_attrs = attrs
        return result
    }

    public GetEquipBagTabList() {
        let list: tabberInfo[] = [
            { panel: null, viewName: "", titleName: Language.Mount.EquipTypeName[0], index: 0, modKey: null, isRemind: false },
            { panel: null, viewName: "", titleName: Language.Mount.EquipTypeName[1], index: 1, modKey: null, isRemind: false },
            { panel: null, viewName: "", titleName: Language.Mount.EquipTypeName[2], index: 2, modKey: null, isRemind: false },
            { panel: null, viewName: "", titleName: Language.Mount.EquipTypeName[3], index: 3, modKey: null, isRemind: false },
        ]
        return list
    }

    public GetEquipBagList(type: number) {
        type bagItem = {
            item_info: { item_id: number },
            index: number,
            index_num: number,
        }
        let list: bagItem[] = []

        if (this.CheckEmpty()) { return list }

        let operlist = this.GetHarnessList(type)
        for (var index in operlist) {
            let item: bagItem = {
                item_info: {
                    item_id: operlist[index].itemId
                },
                index: operlist[index].index,
                index_num: Number(index),
            }

            list.push(item)
        }

        return list
    }

    public GetEquipSelectList(type: number) {
        type bagItem = {
            item_info: { item_id: number },
            index: number,
            index_num: number,
        }

        let list: bagItem[] = []
        if (this.CheckEmpty()) { return list }

        let operlist = this.GetHarnessList(type)

        for (var index in operlist) {
            let item: bagItem = {
                item_info: {
                    item_id: operlist[index].itemId
                },
                index: operlist[index].index,
                index_num: Number(index),
            }

            list.push(item)
        }

        return list
    }

    public GetEquipDeatil(index: number) {
        let attr_list: MountEquipAttr[] = []
        let detail = {
            item_info: { item_id: 0 },
            index: 0,
            main_attr_str: "",
            attr_list: attr_list,
        }
        if (this.CheckEmpty()) { return detail }

        let oper = this.GetDetailHarnessInfo(index)
        for (var i in oper.ex_attr) {
            if (oper.ex_attr[i].add > 0) {
                let info: MountEquipAttr = {
                    index: Number(i),
                    is_unlock: true,
                    attr_str: AttrListName[oper.ex_attr[i].type] + ":" + AttrHelper.Percent(oper.ex_attr[i].type, oper.ex_attr[i].add),
                    unlock_item: CfgMountData.other[0].unlock_item_id,
                    unlock_need: CfgMountData.other[0].unlock_item_num,
                    is_select: false,
                    color: this.GetEquipExColor(oper.item_id, oper.ex_attr[i].type, oper.ex_attr[i].add),
                    show_select: false,
                    show_empty: false,
                    is_empty: oper.ex_attr[i].add == 0,
                    master_index: index,
                }
                attr_list.push(info)
            }
        }
        detail.item_info.item_id = oper.item_id
        detail.index = index
        detail.main_attr_str = AttrListName[oper.base_attr_1.type] + ":" + AttrHelper.Percent(oper.base_attr_1.type, oper.base_attr_1.add) + "\n" +
            (oper.base_attr_2.add > 0 ? AttrListName[oper.base_attr_2.type] + ":" + AttrHelper.Percent(oper.base_attr_2.type, oper.base_attr_2.add) : "")

        return detail
    }

    public GetEquipWashPreDetail(index: number) {
        let list: { attr_type: number, attr_str: string }[] = []
        let result = {
            attr_list: list,
        }
        if (this.CheckEmpty()) { return result }
        let oper = this.GetDetailHarnessInfo(index)
        let ranges = this.GetEquipExColorRange(oper.item_id)

        for (var i in ranges) {
            let info = {
                attr_type: ranges[i].type,
                attr_str: TextHelper.ColorStr(AttrHelper.Percent(ranges[i].type, ranges[i].min), QualityColorStr[ranges[i].min_color])
                    + "-" + TextHelper.ColorStr(AttrHelper.Percent(ranges[i].type, ranges[i].max), QualityColorStr[ranges[i].max_color])
            }
            list.push(info)
        }
        result.attr_list = list

        return result
    }

    public GetCfgHarnessAdd(item_id: number) {
        for (var index in CfgMountData.harness_add) {
            if (CfgMountData.harness_add[index].harness_id == item_id) {
                return CfgMountData.harness_add[index]
            }
        }
    }

    public GetEquipExColor(item_id: number, type: number, value: number) {
        for (var index in CfgMountData.harness_add) {
            let oper = CfgMountData.harness_add[index]
            if (item_id == oper.harness_id && type == oper.add_type) {
                let rang1 = oper.range_1.split(":")
                if (value >= Number(rang1[0]) && value < Number(rang1[1])) {
                    return 0
                }
                let rang2 = oper.range_2.split(":")
                if (value >= Number(rang2[0]) && value < Number(rang2[1])) {
                    return 1
                }
                let rang3 = oper.range_3.split(":")
                if (value >= Number(rang3[0]) && value < Number(rang3[1])) {
                    return 2
                }
                let rang4 = oper.range_4.split(":")
                if (value >= Number(rang4[0]) && value < Number(rang4[1])) {
                    return 3
                }
                let rang5 = oper.range_5.split(":")
                if (value >= Number(rang5[0]) && value < Number(rang5[1])) {
                    return 4
                }
                let rang6 = oper.range_6.split(":")
                if (value >= Number(rang6[0]) && value < Number(rang6[1])) {
                    return 5
                }
                let rang7 = oper.range_7.split(":")
                if (value >= Number(rang7[0]) && value <= Number(rang7[1])) {
                    return 6
                }

            }
        }
    }

    public GetEquipExColorRange(item_id: number) {
        let list: { type: number, min: number, min_color: number, max: number, max_color: number }[] = []
        for (var index in CfgMountData.harness_add) {
            let oper = CfgMountData.harness_add[index]
            if (item_id == oper.harness_id) {
                let info = { type: 0, min: 0, min_color: 0, max: 0, max_color: 0 }
                info.type = oper.add_type
                if (oper.rate_1 > 0) {
                    let rang1 = oper.range_1.split(":")
                    info.min = Number(rang1[0])
                    info.min_color = 0
                    info.max = Number(rang1[1])
                    info.max_color = 0
                }

                if (oper.rate_2 > 0) {
                    let rang2 = oper.range_2.split(":")
                    if (info.min == null) {
                        info.min = Number(rang2[0])
                        info.min_color = 2
                    }
                    info.max = Number(rang2[1])
                    info.max_color = 2
                }

                if (oper.rate_3 > 0) {
                    let rang3 = oper.range_3.split(":")
                    if (info.min == null) {
                        info.min = Number(rang3[0])
                        info.min_color = 3
                    }
                    info.max = Number(rang3[1])
                    info.max_color = 3
                }

                if (oper.rate_4 > 0) {
                    let rang4 = oper.range_4.split(":")
                    if (info.min == null) {
                        info.min = Number(rang4[0])
                        info.min_color = 4
                    }
                    info.max = Number(rang4[1])
                    info.max_color = 4
                }

                if (oper.rate_5 > 0) {
                    let rang5 = oper.range_5.split(":")
                    if (info.min == null) {
                        info.min = Number(rang5[0])
                        info.min_color = 5
                    }
                    info.max = Number(rang5[1])
                    info.max_color = 5
                }

                if (oper.rate_6 > 0) {
                    let rang6 = oper.range_6.split(":")
                    if (info.min == null) {
                        info.min = Number(rang6[0])
                        info.min_color = 6
                    }
                    info.max = Number(rang6[1])
                    info.max_color = 6
                }

                if (oper.rate_7 > 0) {
                    let rang7 = oper.range_7.split(":")
                    if (info.min == null) {
                        info.min = Number(rang7[0])
                        info.min_color = 7
                    }
                    info.max = Number(rang7[1])
                    info.max_color = 7
                }

                list.push(info)
            }
        }

        return list
    }

    public GetEquipRed() {
        for (let i = 0; i < 4; i++) {
            if (this.GetTypeEquipRed(i) > 0) {
                return 1
            }

            if (this.GetTypeWashRed(i) > 0) {
                return 1
            }
        }

        return 0
    }

    public GetTypeEquipRed(type: number) {
        if (this.CheckEmpty()) { return 0 }

        let selects = this.GetEquipSelectList(type)
        if (this.harness_weak[type] == 0 && selects.length > 0) {
            return 1
        }
        return 0
    }

    public GetTypeWashRed(type: number) {
        if (this.CheckEmpty()) { return 0 }

        if (this.harness_weak[type] > 0) {
            let equip = MountData.Inst().GetDetailHarnessInfo(this.harness_weak[type])

            let with_ex = false
            for (var i in equip.ex_attr) {
                if (equip.ex_attr[i].add > 0) {
                    with_ex = true
                    break
                }
            }

            let num = Item.GetNum(CfgMountData.harness_gem_use[0].use_item_id)
            if (num >= CfgMountData.harness_gem_use[0].use_item_num && !with_ex) {
                return 1
            }
        }
        return 0
    }

    public get GetHarnessInfo() {
        return this.harness_info;
    }

    //根据下发的seq 获取马具购买列表
    public GetHarnessBuyList() {
        if (this.harness_info) {
            let seqArr = this.harness_info.buy_seq_list;
            let list = [];
            for (let i = 0; i < seqArr.length; i++) {
                list.push(CfgMountData.harness_buy.find(cfg => { return cfg.item_seq == seqArr[i] }));
            }
            return list;
        }
        return null;
    }
    public GetOtherData() {
        return CfgMountData.other[0];
    }
    public GetWashLockMark() {
        let flag = "";
        for (let i = 7; i >= 0; i--) {
            let check = this.harness_wash_mark[i]
            flag += check == null ? 0 : check
        }
        let lock_flag = parseInt(flag, 2);


        return lock_flag
    }

    public JumpAttrChangeByEquip(bag_index: number) {
        let ready = MountData.Inst().GetDetailHarnessInfo(bag_index)
        let cur_index = this.harness_weak[ready.harness_type]
        if (cur_index > 0) {
            let waeked = MountData.Inst().GetDetailHarnessInfo(cur_index)
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[waeked.base_attr_1.type]} ${"-"}${AttrHelper.Percent(waeked.base_attr_1.type, waeked.base_attr_1.add)}`, 0)
            if (waeked.base_attr_2.add > 0) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[waeked.base_attr_2.type]} ${"-"}${AttrHelper.Percent(waeked.base_attr_2.type, waeked.base_attr_2.add)}`, 0)
            }

            for (var i in ready.ex_attr) {
                if (waeked.ex_attr[i].add > 0) {
                    PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[waeked.ex_attr[i].type]} ${"-"}${AttrHelper.Percent(waeked.ex_attr[i].type, waeked.ex_attr[i].add)}`, 0)
                }
            }
        }

        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[ready.base_attr_1.type]} ${"+"}${AttrHelper.Percent(ready.base_attr_1.type, ready.base_attr_1.add)}`, 1)
        if (ready.base_attr_2.add > 0) {
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[ready.base_attr_2.type]} ${"+"}${AttrHelper.Percent(ready.base_attr_2.type, ready.base_attr_2.add)}`, 1)
        }


        for (var i in ready.ex_attr) {
            if (ready.ex_attr[i].add > 0) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[ready.ex_attr[i].type]} ${"+"}${AttrHelper.Percent(ready.ex_attr[i].type, ready.ex_attr[i].add)}`, 1)
            }
        }
    }

    public JumpAttrChangeByWash(marked: MountEquipDetail) {
        for (var i in marked.ex_attr) {
            if (marked.ex_attr[i].add > 0 && this.harness_wash_mark[i] != 1) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[marked.ex_attr[i].type]} ${"-"}${AttrHelper.Percent(marked.ex_attr[i].type, marked.ex_attr[i].add)}`, 0)
            }
        }

        let neo = this.GetDetailHarnessInfo(marked.bag_index)

        for (var i in neo.ex_attr) {
            if (neo.ex_attr[i].add > 0 && this.harness_wash_mark[i] != 1) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[neo.ex_attr[i].type]} ${"-"}${AttrHelper.Percent(neo.ex_attr[i].type, neo.ex_attr[i].add)}`, 0)
            }
        }
    }

    public SetEquipEffPos(pos: number) {
        let neo = this.GetDetailHarnessInfo(pos)
        this.equiped_eff_pos = neo.harness_type

        this.flush_info.equiped = this.flush_info.equiped + 1
    }

    public GetEquipEffPos() {
        return this.equiped_eff_pos
    }

    public UnLockCheck(item_id: number, need: number) {
        let num = Item.GetNum(item_id)
        let flag = num < need

        let config = Item.GetConfig(item_id);
        let list = GetWayData.Inst().GetWayList(config.get_way);

        if (flag) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Mount.LevelUpItemLackError,
                Item.GetName(item_id), list[0].desc));

            let show_call = Item.Create({ item_id: item_id, num: need - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
        }

        return flag
    }

    public SetWashEffMark(flag: boolean) {
        this.wash_eff_mark = flag
    }

    public GetWashEffMark() {
        return this.wash_eff_mark
    }

    public WashWarning(index: number) {
        let check = this.GetDetailHarnessInfo(index)

        for (var i in check.ex_attr) {
            let color = this.GetEquipExColor(check.item_id, check.ex_attr[i].type, check.ex_attr[i].add)
            if (color >= 5 && 1 != this.harness_wash_mark[i]) {
                return true
            }
        }

        return false
    }

    public EquipWashSel(master_index: number, index: number, is_sel?: boolean) {
        this.equip_wash_sels = this.equip_wash_sels ?? []
        if (undefined == is_sel) {
            return this.equip_wash_sels[master_index] ? this.equip_wash_sels[master_index][index] : false
        }
        this.equip_wash_sels[master_index] = this.equip_wash_sels[master_index] ?? []
        this.equip_wash_sels[master_index][index] = is_sel
    }
}

// 马具的详细信息
export type MountEquipDetail = {
    bag_index: number,//背包为止
    harness_type: number, // 装备位置
    name: string,// 物品名字
    item_id: number,// 物品id
    base_attr_1: { type: number, add: number },//主要属性1
    base_attr_2: { type: number, add: number },//主要属性2
    ex_attr: { type: number, add: number }[],//额外属性列表-- 没写就是没开，没开就是没有
    ex_attr_num: number,
    ex_attr_max: number, // 最大属性上限
    lockFlag?: number,
}

export type MountEquipItemShow = {
    is_empty: boolean,// 是否为空
    beg_index: number,// 背包位置
    harness_type: number,//装备位置
    item_info: { item_id: number },//装备物品信息
    attr_1_str: string,//属性1描述
    attr_2_str: string,//属性2描述
    type_name: string,//类型名字
}

export type MountEquipAttr = {
    index: number,//位置
    master_index: number,// 本体背包为止
    is_unlock: boolean,//是否解锁
    attr_str: string//属性描述 这里填入时为解析完成字符串
    unlock_item: number,//解锁货币
    unlock_need: number,//解锁货币需求数
    is_select: boolean,//当期是否锁定，默认首启动
    color: number,// 颜色
    show_select: boolean,// 是否展示选择
    show_empty: boolean,// 是否展示空属性
    is_empty: boolean, // 是否为空属性
}
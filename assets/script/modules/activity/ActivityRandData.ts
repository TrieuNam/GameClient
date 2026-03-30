//随机活动管理Data 非公用接口不可加到这里
import { CfgActivityData, CfgActivityRand } from "config/CfgActivity";
import { HandleBase, HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import { SMDTriggerNotify } from "data/SmartData";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { DataBase } from "../../data/DataBase";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";
import { ActivityData } from "./ActivityData";
import { ACTIVITY_ENTER_TYPE } from "./ActivityEnum";

export class ActivityRandData extends DataBase {
    private register_list: { [mod_key: number]: Function };
    private origin_list: { [mod_key: number]: any };
    private handleCollector: HandleCollector;
    private origin_handle: { [mod_key: number]: HandleBase };
    private activity_click_list: { [key: number]: Function };
    private activity_count_down_list: { [mod_key: number]: Function };
    private all_config_list: CfgActivityRand[][];
    private configs: { [key: number]: CfgActivityRand[] };
    private act_to_mod: { [act_type: number]: number };
    private mod_to_act: { [act_type: number]: number };

    //当前活动入口开启状态 当有新开启的入口时 强刷一下按钮列表
    private act_btn_list: { [mod_key: number]: boolean };

    constructor() {
        super();
        this.InitActivityRandData();
    }

    public InitActivityRandData() {
        this.register_list = {};
        this.origin_list = {};
        this.origin_handle = {};
        this.activity_click_list = {};
        this.activity_count_down_list = {};
        this.handleCollector = HandleCollector.Create();
        this.configs = {};
        this.act_btn_list = {};
        this.act_to_mod = {};
        this.mod_to_act = {};
    }

    //初始化活动入口配置
    public InitActivityRandList() {
        this.all_config_list = [
            CfgActivityData.rand,
            CfgActivityData.daily,
            CfgActivityData.new_sever_carnival,
            CfgActivityData.more_activity,
            CfgActivityData.add_recharge_activity,
            CfgActivityData.right_activity,
        ];
        for (let i = 0; i < this.all_config_list.length; i++) {
            this.configs[i] = this.InitActivityList(this.all_config_list[i]);
        }
        this.InitActToMod();
    }

    //初始化活动对应mod_key配置
    public InitActToMod() {
        for (let i = 0; i < CfgActivityData.gather.length; i++) {
            let cfg = CfgActivityData.gather[i];
            this.act_to_mod[cfg.act_type] = cfg.mod_key;
            this.mod_to_act[cfg.mod_key] = cfg.act_type;
        }
    }

    private InitActivityList(cfgs: CfgActivityRand[]) {
        let config = [];
        for (let i = 0; i < cfgs.length; i++) {
            let cfg = cfgs[i];
            if (cfg.is_open == 1) {
                if (typeof (cfg.red_dot) == "number") {
                    cfg.mod = ModManger.TabMod(cfg.red_dot);
                } else if (Mod[cfg.red_dot]) {
                    cfg.mod = Mod[cfg.red_dot];
                } else {
                    cfg.mod = ModManger.TabMod(cfg.mod_key);
                }
                config.push(cfg);
            }
        }
        return config;
    }

    //获取活动入口按钮列表
    public GetActBtnList(type: ACTIVITY_ENTER_TYPE) {
        let list = this.GetRandList(type);
        let open_list = [];
        for (let i = 0; i < list.length; i++) {
            let cfg = list[i].cfg;
            let mod_key = cfg.mod_key;
            if (list[i].is_open) {
                if (!this.act_btn_list[mod_key]) {
                    if (this.origin_list[mod_key]) {
                        SMDTriggerNotify(this.origin_list[mod_key])
                    }
                }
                this.act_btn_list[mod_key] = true;
                open_list.push(cfg);
            } else
                this.act_btn_list[mod_key] = false;
        }
        return open_list;
    }

    //获取开启列表
    private GetRandList(type: ACTIVITY_ENTER_TYPE) {
        let list = [];
        let config = this.configs[type];
        if (config)
            for (let i = 0; i < config.length; i++) {
                let is_open = this.IsRandOpen(config[i]);
                list.push({ cfg: config[i], is_open: is_open });
            }
        return list;
    }

    //获取某个模块是否开启
    private IsRandOpen(param: CfgActivityRand): boolean {
        let is_act_open = this.IsACtOpen(param.act_type);
        let is_fun_open = FunOpen.Inst().GetFunIsOpen(param.mod_key).is_open; //功能开启
        let is_register_open = this.GetRegisterOpen(param.mod_key);//注册的开启检查
        let is_audit = FunOpen.Inst().checkAudit(param.mod_key)

        return is_act_open && is_register_open && is_audit && is_fun_open;
    }

    //外部不可调用
    private GetRegisterOpen(mod_key: number) {
        let open_func = this.register_list[mod_key];
        if (open_func) {
            return open_func();
        }
        return true;
    }

    //(公用)活动是否开启 请求之前先判断
    public IsACtOpen(act_type: number) {
        let fun_open = FunOpen.Inst().GetFunIsOpen(this.act_to_mod[act_type]).is_open; //功能开启
        let act_open = !act_type || (ActivityData.Inst().IsOpen(act_type));  //活动开启
        return fun_open && act_open;
    }

    //活动列表是否有活动开启
    public CheckListOpen(config: CfgActivityRand[]) {
        for (let i = 0; i < config.length; i++) {
            if (this.IsRandOpen(config[i]))
                return true;
        }
        return false;
    }

    //右侧活动
    public CheckRightActivity(act_type: number) {
        let data = CfgActivityData.right_activity.find(cfg => {
            return cfg.act_type == act_type;
        });
        return data.is_open == 1;
    }

    //注册单个活动监听方式
    private RegisterCare(modkey: number, func: Function) {
        let handle = SMDHandle.Create(this.origin_list[modkey], func);
        this.origin_handle[modkey] = handle;
        this.handleCollector.KeyAdd(modkey + "", handle);
        return handle;
    }

    private CheckBtn(mod_key: number) {
        if (this.act_btn_list && this.mod_to_act[mod_key]) {
            let is_open = this.GetRegisterOpen(mod_key);
            if (this.act_btn_list[mod_key] != is_open) {
                ActivityData.Inst().CheckRandOpenData();
            }
        }
    }

    //是否有注册
    public IsRegister(modkey: number) {
        return this.register_list[modkey] != null;
    }

    //是否有自己的刷新源
    public IsHasOrigin(modkey: number) {
        return this.origin_list[modkey] != null;
    }

    //设置活动自己的提醒方式[存本地]
    public SetRemind(act_type: number, value: number) {
        LocalStorageHelper.PrefsInt(LocalStorageHelper.ActivityIsRemind(act_type), value);
    }

    //获取活动自己的提醒方式
    public GetRemind(act_type: number) {
        return LocalStorageHelper.PrefsInt(LocalStorageHelper.ActivityIsRemind(act_type));
    }


    //活动打开或者关闭 switch = true  打开 false 关闭
    public OpenClose(act_type: number) {
        let config = this.GetConfig(act_type);
        if (config && config.act_type && ViewManager.Inst().IsViewOpened(config.view_name)) {
            ViewManager.Inst().CloseView(config.view_name);
        }
    }

    //根据act_type获取获得随机活动配置 获取随机活动配置
    private GetConfig(act_type: number) {
        for (let i = 0; i < this.all_config_list.length; i++) {
            for (let j = 0; j < this.all_config_list[i].length; j++) {
                if (this.all_config_list[i][j].act_type == act_type)
                    return this.all_config_list[i][j];
            }
        }
    }

    public GetOriginList(modkey: number) {
        return this.origin_list[modkey];
    }
    //=======================注册接口===============================
    //外部注册自己的图标解锁条件
    public Register(modkey: number, check_func: Function, origin?: any) {
        if (this.register_list[modkey] == null) {
            this.register_list[modkey] = check_func;
        }
        if (this.origin_list[modkey] == null && origin) {
            this.origin_list[modkey] = origin;
        }
        this.RegisterCare(modkey, this.CheckBtn.bind(this, modkey))
    }

    //活动前往按钮注册,不走默认行为
    public CustomClickHandle(act_type: number, func: Function) {
        this.activity_click_list[act_type] = func;
    }

    //活动前往按钮注册,不走默认行为
    public CustomClickModHandle(mod_key: number, func: Function) {
        this.activity_click_list[mod_key] = func;
    }

    //执行活动自己的点击前往事件 key为act_type 或 mod_key 有返回true
    public OnClickHandle(key: number) {
        if (this.activity_click_list[key]) {
            this.activity_click_list[key]();
            return true;
        }
    }

    //注册主界面活动按钮下面倒计时 Time
    public RegisterCountDown(mod_key: number, func: Function) {
        this.activity_count_down_list[mod_key] = func;
    }

    public GetCountDown(mod_key: number) {
        return this.activity_count_down_list[mod_key];
    }

}


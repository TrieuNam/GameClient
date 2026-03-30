import { sys } from "cc";
import { CfgFunOpen } from "config/CfgFunOpen";
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { LoginData } from "modules/login/LoginData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TaskData } from "modules/task/TaskData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { PackageData } from "preload/PkgData";
import { TextHelper } from "../../helpers/TextHelper";


export class FunOpen extends BaseCtrl {
    private static audit_check: { [key: number]: number } = {
        13000: 0,
        12000: 0,
        7000: 0,
        8000: 0,
        9000: 0,
        14000: 0,
        6000: 3,
        2062: 0,
        7006: 0,
        2063: 0,
        2064: 0,
        2065: 0,
        2066: 0,
    }
    protected handleCollector: HandleCollector;

    checkOpenFuncs: Map<number | string, Function> = new Map<number | string, Function>();
    checkOpenFuncs2: Map<number | string, Function> = new Map<number | string, Function>();
    openedMap: Map<number | string, boolean> = new Map<number | string, boolean>();
    firstCheck: boolean = false
    initCtrl() {
        this.handleCollector = HandleCollector.Create();
        this.checkOpenFuncs.clear();
        this.openedMap.clear();
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.OnFunOpenChange.bind(this), "roleLevel")
        this.AddSmartDataCare(TaskData.Inst().result_info, this.OnFunOpenChange.bind(this), "is_change")
        EventCtrl.Inst().on(CommonEvent.FIRST_GET_SEVER_TIME, this.OnFunOpenChange, this, true);
    }
    //注册检查方法
    public RgCheckFunc(key: number | string, func: Function) {
        if (!this.checkOpenFuncs.has(key)) {
            this.checkOpenFuncs.set(key, func);
        }
    }
    //删除检查
    public ClearRgFunc(key: number | string) {
        this.checkOpenFuncs.delete(key)
    }
    //注册检查方法
    public RgCheckFunc2(key: number | string, func: Function) {
        if (!this.checkOpenFuncs2.has(key)) {
            this.checkOpenFuncs2.set(key, func);
        }
    }
    //删除检查
    public ClearRgFunc2(key: number | string) {
        this.checkOpenFuncs2.delete(key)
    }
    public AddSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }
    public RemoveSmartDataCare() {
        HandleCollector.Destory(this.handleCollector);
        this.handleCollector = null;
    }
    protected onDestroy(): void {
        this.RemoveSmartDataCare()
    }
    OnFunOpenChange() {
        let result
        this.checkOpenFuncs.forEach((func, key) => {
            result = this.GetFunIsOpen(key)
            func.call(func, key, result.is_open)
        });
        this.checkOpenFuncs2.forEach((func, key) => {
            result = this.GetFunIsOpen(key)
            func.call(func, key, result.is_open)
        });
        if (TaskData.Inst().result_info.is_change == true) {
            this.firstCheck = true;
        }
    }

    GetFunIsOpen(key: number | string) {
        let result = { is_open: true, content: "" }
        let role_level = RoleData.Inst().GetRoleLevel()
        let name = ""
        let ser_time = TimeCtrl.Inst().ServerStartTs
        let level, task
        if (CfgFunOpen && CfgFunOpen.funopen != null) {
            CfgFunOpen.funopen.forEach(element => {
                if (element.client_id == key) {
                    name = element.name
                    result.is_open = false
                    task = element.task
                    level = element.level
                    if (ser_time > 0 && element.time_stamp != "" && ser_time < element.time_stamp) {
                        level = element.old_level
                        task = element.old_task
                    }
                    if (task > 0) {
                        if (TaskData.Inst().IsTaskFinish(task)) {
                            result.is_open = true
                        } else {
                            result.is_open = false
                            result.content = Language.FunOpen.TaskTip
                        }
                    } else {
                        if (role_level >= level) {
                            result.is_open = true
                        } else {
                            result.is_open = false
                            result.content = TextHelper.Format(Language.FunOpen.LevelTip, element.level);
                        }
                    }
                } else if (element.class_name == key) {
                    name = element.name
                    result.is_open = false
                    task = element.task
                    level = element.level
                    if (ser_time > 0 && element.time_stamp != "" && ser_time < element.time_stamp) {
                        level = element.old_level
                        task = element.old_task
                    }
                    if (task > 0) {
                        result.content = Language.FunOpen.TaskTip
                        if (TaskData.Inst().IsTaskFinish(task)) {
                            result.is_open = true
                        } else {
                            result.is_open = false
                            result.content = Language.FunOpen.TaskTip
                        }
                    } else {
                        if (role_level >= level) {
                            result.is_open = true
                        } else {
                            result.is_open = false
                            result.content = TextHelper.Format(Language.FunOpen.LevelTip, level);
                        }
                    }
                }
            }
            );
        }
        let isAudit = this.checkAudit(+key);
        if (!isAudit) {
            result.is_open = false
        }
        if (this.openedMap.has(key) && this.openedMap.get(key) == false
            && result.is_open == true && this.firstCheck == true
            && name != "") {
            //console.log(key);

            // PublicPopupCtrl.Inst().Center(name + Language.FunOpen.OpenTip)
        }
        this.openedMap.set(key, result.is_open);
        return result
    }
    checkAudit(mod: number, page: number = 0) {
        if (LoginData.GetUrlParm() && !PackageData.Inst().getIsDebug()) {
            let audit: boolean
            if (sys.platform == sys.Platform.WECHAT_GAME) {
                audit = LoginData.GetUrlParm().param_list.switch_list.wx_audit_version
            } else {
                audit = LoginData.GetUrlParm().param_list.switch_list.audit_version
            }
            if (audit) {
                if (FunOpen.audit_check[mod] != undefined) {
                    return page != FunOpen.audit_check[mod]
                }
            }
        }
        return true
    }
    checkCanOpenView() {
        /* let level = RoleData.Inst().GetRoleLevel()
        CfgFunOpen.funopen.forEach(element => {
            
        }); */
    }
}
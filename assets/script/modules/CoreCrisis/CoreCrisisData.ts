import { CfgLimitCore } from "config/CfgLimitCore";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { Item } from "modules/bag/ItemData";

class CoreCrisisInfo {
    @smartdata
    need_flush: number;
}

export class CoreCrisisData extends DataBase {
    public base_info: any
    public flush_info: CoreCrisisInfo
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(CoreCrisisInfo);
        this.flush_info.need_flush = 0
    }

    public GetRedNum() {
        return 0
    }

    public SetCoreInfo(data: PB_SCLimitCoreInfo) {
        let info = {
            core_level: data.coreLevel
        }
        this.base_info = info

        this.flush_info.need_flush = this.flush_info.need_flush + 1
    }

    public GetCoreLevel(enum_mark: number) {
        if (this.base_info == undefined || this.base_info.core_level == undefined) { return 0 }

        // 警告，数组是0~5 要-1 其他照常
        return this.base_info.core_level[enum_mark - 1]
    }

    public GetCoreCfg(enum_mark: number, level: number) {
        let cfg = CfgLimitCore.core
        for (var index in cfg) {
            if (cfg[index].limit_level == level && cfg[index].limit_tpye == enum_mark) {
                return cfg[index]
            }
        }
    }

    // 返回为false时为没有被限制
    public CheckIsCoreLimiting(enum_mark: number, check_num: number) {

        // if(enum_mark == null || check_num == null)
        // {
        //     return false
        // }

        // let level = this.GetCoreLevel(enum_mark)
        // let cfg = this.GetCoreCfg(enum_mark,level)
        // // LogError("? ",enum_mark,cfg.parm,check_num)
        // let flag = cfg.parm < check_num
        // return flag
        return false
    }


    public GetCCparam(enum_mark: number) {
        let level = this.GetCoreLevel(enum_mark)
        let cfg = this.GetCoreCfg(enum_mark, level)

        return {
            mark_type: enum_mark,
            level: level,
            need_item: cfg.need_item_id,
            need_num: cfg.need_core_num
        }
    }

    // 获取红点
    public GetCoreRed(enum_mark: number) {
        let param = this.GetCCparam(enum_mark)

        let num = Item.GetNum(param.need_item)
        return 0
        // return (num >= param.need_num && param.need_num > 0) ? 1 : 0
    }
}

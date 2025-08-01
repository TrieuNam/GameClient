import { CfgJinRiFenXiang } from "config/CfgJinRiFenXiang";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from "data/SmartData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { RoleData } from "modules/role/RoleData";
import { TextHelper } from "../../helpers/TextHelper";

export class TodayShareCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaDailySharingInfo, func: this.OnDailyShare }
        ]
    }

    private OnDailyShare(data: PB_SCRaDailySharingInfo) {
        LogError("3023 每日分享信息?PB_SCRaDailySharingInfo", data)
        TodayShareData.Inst().OnDailyShareInfo(data);
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.TodayShare,
            TodayShareData.Inst().flush_info,
            TodayShareData.Inst().GetRedNum.bind(TodayShareData.Inst())));


    }

    // public CheckLinkShare() {
    //     let url = "http://cls-ylh02.huanyuantech.com/dev/get_share_gift.php?userId=" + LoginData.Inst().GetLoginData().accountId
    //     HTTP.GetJson(url, this.CheckLinkShareCallBack.bind(this));
    // }

    // public CheckLinkShareCallBack(statusCode: number, resp: any) {
    //     if (resp.msg == "success") {
    //         let info = {
    //             share_count: resp.share_count,
    //             share_gift_data: resp.share_gift_data,
    //         }
    //     }
    // }

    public OnViewInit(isOpen: boolean = false) {
        if (isOpen)
            EventCtrl.Inst().on(CommonEvent.PACK_WX_AROUSESHARESUC, this.onShare, this);
        else
            EventCtrl.Inst().off(CommonEvent.PACK_WX_AROUSESHARESUC, this.onShare, this);
    }

    private onShare(act_id: number) {
        if (act_id == ACTIVITY_TYPE.TodayShare) {
            TodayShareData.Inst().shared_mark = true
            TodayShareData.Inst().flush_info.info = TodayShareData.Inst().flush_info.info + 1
        }
    }
}

class TodayShareInfo {
    @smartdata
    info: number;
}

export class TodayShareData extends DataBase {
    public flush_info: TodayShareInfo;
    private fetch_times: number
    private share_info: any
    public shared_mark = false
    constructor() {
        super();
        this.createSmartData();
        this.fetch_times = 0
    }
    private createSmartData() {
        this.flush_info = CreateSMD(TodayShareInfo);
        this.flush_info.info = 0
    }

    public SetShareInfo(data: any) {
        this.share_info = data
        this.flush_info.info = this.flush_info.info + 1
    }

    public OnDailyShareInfo(data: PB_SCRaDailySharingInfo) {
        this.fetch_times = data.fetchCount
        this.flush_info.info = this.flush_info.info + 1
    }

    public GetIsOpen() {
        return false
        // if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.TodayShare)) {
        //     return false;
        // }
        // return !this.IsFetch()
    }

    public GetRewardShow() {
        let role_level = RoleData.Inst().GetRoleLevel()
        let config = CfgJinRiFenXiang.reward
        let cfg = null
        for (var index in config) {
            if (config[index].start_level <= role_level && config[index].end_level >= role_level) {
                cfg = config[index]
                break
            }
        }

        if (cfg == null) { return }
        let fix = []
        for (var index in cfg.reward_item) {
            let c_cfg = cfg.reward_item[index]
            let item = Item.Create({ item_id: c_cfg.item_id, num: c_cfg.num }, { is_num: true, is_click: true })
            fix.push(item)
        }

        return fix
    }

    public GetShareInfo() {
        return this.share_info
    }

    public GetTodayStatus() {
        return TextHelper.Format(Language.TodayShare.Status, this.fetch_times)
    }

    public GetTodayBtnStatus() {
        if (this.fetch_times > 0) {
            return {
                str: Language.TodayShare.BtnStatus[2],
                type: 2,
            }
        }
        else {
            if (this.IsShared()) {
                if (this.IsOpenDouble()) {
                    return {
                        str: Language.TodayShare.BtnStatus[1],
                        type: 1,
                    }
                } else {
                    return {
                        str: Language.TodayShare.BtnStatus[3],
                        type: 1,
                    }
                }

            }
            else {
                return {
                    str: Language.TodayShare.BtnStatus[0],
                    type: 0,
                }
            }
        }

    }

    public IsShared() {
        return this.shared_mark
    }

    public IsOpenDouble() {
        return CfgJinRiFenXiang.other[0].is_open == 1
    }

    public IsFetch() {
        return this.fetch_times > 0
    }

    public GetRedNum() {
        return 0
        // if (this.fetch_times > 0) {
        //     // LogError("?enter?!1")
        //     return 0
        // }

        // if (!this.IsShared()) {
        //     // LogError("?enter?!2")
        //     return 1
        // }

        // // LogError("?enter?!3")
        // return 1
    }


}
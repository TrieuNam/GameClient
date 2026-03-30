import { sys } from "cc";
import { CfgShouChongDingZhiData } from "config/CfgShouChongDingZhi";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { FirstChargeData } from "modules/first_charge/FirstChargeCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { ZhuanShuDingZhiPop } from "./ZhuanShuDingZhiPop";

export enum SHOUCHONGDINGZHI_REQ_TYPE {
    INFO = 0,
    FETCH_GIFT = 1,
}

export class ShouChongDingZhiCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaCustomizedGift, func: this.recvSCDingZhiInfo }
        ]
    }

    protected initCtrl() {
        // this.handleCollector.Add(SMDHandle.Create(FirstChargeData.Inst().ResultData, LeiChongYouLiData.Inst().FlushIconShow.bind(LeiChongYouLiData.Inst()), "info"));
        this.handleCollector.Add(RemindRegister.Create(Mod.LeiChong.ShouChongDingZhi, ShouChongDingZhiData.Inst().ResultData, ShouChongDingZhiData.Inst().AllRed.bind(ShouChongDingZhiData.Inst())));
    }

    private recvSCDingZhiInfo(data: PB_SCRaCustomizedGift) {
        ShouChongDingZhiData.Inst().SetResultInfo(data);
    }


}
export class ShouChongDingZhiResultData {
    @smartdata
    info: PB_SCRaCustomizedGift;
    @smartdata
    flush_red: boolean;
}
export class ShouChongDingZhiData extends DataBase {
    private result_data: ShouChongDingZhiResultData;

    // public isOpen = false;
    // public isShowPop = false;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(ShouChongDingZhiResultData);
    }
    public SetResultInfo(data: PB_SCRaCustomizedGift) {
        this.result_data.info = data;
        this.PopUpShow();
    }
    public get ResultData() {
        return this.result_data;
    }
    public SetFlush_red() {
        this.result_data.flush_red = !this.result_data.flush_red;
    }
    public GetGiftData() {
        return CfgShouChongDingZhiData.gift_configure.filter(cfg => {
            return cfg.start_level <= this.result_data.info.roleLevel && cfg.end_level >= this.result_data.info.roleLevel;
        })

        // if(type){
        //     return allData.slice(0,4);
        // }else{
        //     return allData[allData.length-1];
        // }
    }

    public GetBuyData() {
        return CfgShouChongDingZhiData.buy_configure.find(cfg => {
            return cfg.start_level <= this.result_data.info.roleLevel && cfg.end_level >= this.result_data.info.roleLevel;
        })
    }
    /**是否显示图标 */
    public IsDingZhiActShow() {
        if (FirstChargeData.Inst().IsFirstActShow()) {
            return false;
        }
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.ShouChongDingZhi)) {
            return false;
        }
        if (!this.result_data.info) {
            this.SendReq(SHOUCHONGDINGZHI_REQ_TYPE.INFO);
            return false;
        }
        if (!this.result_data.info.isOpen) {
            return false;
        }
        let isClose = 1;
        for (let i = 0; i < this.result_data.info.fetchFlags.length; i++) { //所有奖励领取完关闭入口
            if (this.result_data.info.fetchFlags[i] < 2) {
                isClose = 0;
                break;
            }
        }
        if (isClose) {
            return false;
        }
        return true;
    }
    public SendReq(type: SHOUCHONGDINGZHI_REQ_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.ShouChongDingZhi, type, p1);
    }

    //红点
    public GetRed() {
        for (let i = 0; i < this.result_data.info.fetchFlags.length; i++) {
            if (this.result_data.info.fetchFlags[i] == 1) {
                return 1;
            }
        }
        return 0;
    }

    //活动开启时的红点
    ActOpenRed() {
        let isOpen = sys.localStorage.getItem("ShouChongDingZhiOpenRed")
        if (!isOpen && this.result_data.info.isOpen) {
            return 1;
        }
        return 0;
    }
    public AllRed() {
        return this.GetRed() || this.ActOpenRed();
    }


    //是否是创角前3天
    public IsThreeDays() {
        let times = TimeCtrl.Inst().ServerTime - RoleData.Inst().ResultData.createTime;
        let day = times / 3600 / 24;
        if (Math.ceil(day) <= 3 && CfgShouChongDingZhiData.other[0].is_open) {
            return true;
        }
        return false;
    }


    //弹窗
    public PopUpShow() {
        if (this.result_data.info && this.result_data.info.isOpen && this.IsThreeDays() && !ViewManager.Inst().IsOpen(ZhuanShuDingZhiPop) && !FirstChargeData.Inst().IsFirstActShow()) {
            let tomr = sys.localStorage.getItem("DingZhiPopTime" + RoleData.Inst().GetRoleId());
            if (tomr) {
                if ((TimeCtrl.Inst().ServerTime - +tomr) > 0 && !this.result_data.info.hasBuyGift) { //未购买，每日首次登录 弹窗
                    //  ViewManager.Inst().OpenView(ZhuanShuDingZhiPop);
                }
            } else {
                // ViewManager.Inst().OpenView(ZhuanShuDingZhiPop);
            }
        }
    }

}
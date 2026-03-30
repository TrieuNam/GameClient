import { DataBase } from "data/DataBase";
import { smartdata, CreateSMD } from "data/SmartData";
import { Language } from "modules/common/Language";
import { LoginData } from "modules/login/LoginData";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { HTTP } from "../../helpers/HttpHelper";
import { MD5 } from "../../helpers/MD5";
import { PackageData } from "preload/PkgData";
import { Order_Data, RechargeType, OrderCtrl } from "./OrderCtrl";
import { RechargeCtrl, Recharge_Currency } from "./RechargeCtrl";


export class RechargeResultData {
    @smartdata
    is_change: boolean;
}

export class RechargeData extends DataBase {
    private chongzhi_info: PB_SCChongZhiInfo;
    private chongzhi_config: PB_SCChongZhiConfigInfo;
    private result_data: RechargeResultData;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.result_data = CreateSMD(RechargeResultData);
    }

    public get ResultData() {
        return this.result_data;
    }

    public GetChongZhiInfo() {
        return this.chongzhi_info;
    }

    public GetHistoryChongzhi() {
        return this.chongzhi_info ? this.chongzhi_info.historyChongzhi : 0;
    }
    /**充值信息 */
    public OnRecvChongZhiInfo(data: PB_SCChongZhiInfo) {
        this.chongzhi_info = data;
        this.result_data.is_change = !this.result_data.is_change;
    }

    /**充值信息改变*/
    public OnRecvChongZhiInfoChange(data: PB_SCChongZhiInfoChange) {
        this.chongzhi_info.historyChongzhi = data.historyChongzhi;
        this.chongzhi_info.historyChongzhiCount = data.historyChongzhiCount;
        this.chongzhi_info.todayChongzhi = data.todayChongzhi;
        this.chongzhi_info.chongzhiRewardTimes[data.seq] = data.times;
        this.result_data.is_change = !this.result_data.is_change;
    }

    /**充值信息列表 */
    public OnRecvChongZhiConfigInfo(data: PB_SCChongZhiConfigInfo) {
        this.chongzhi_config = data;
        this.result_data.is_change = !this.result_data.is_change;
    }

    /*商城里的充值物品信息 */
    public GetChargeInfoList() {
        let list: RechargeListInfo[] = [];
        if (this.chongzhi_config) {
            if (this.chongzhi_info)
                for (let i = 0; i < this.chongzhi_config.infoList.length; i++) {
                    let info = this.chongzhi_config.infoList[i];
                    let recharge_times = this.chongzhi_config ? this.chongzhi_info.chongzhiRewardTimes[info.seq] : 0;
                    list.push(new RechargeListInfo(info, recharge_times))
                }
        }
        else
            RechargeCtrl.Inst().SendChongZhiConfigReq();
        return list;
    }

    /**获取当前货币符号 */
    public GetLocalSign() {
        return Language.Recharge.GoldType[this.GetCurrencyType()];
    }

    /** 获取充值类型 区分地区 金额类型（0 ：人民币 1：新台币 2 ：美金）*/
    public GetCurrencyType() {
        let currency_type = Recharge_Currency.RMB;
        if (this.chongzhi_config)
            currency_type = this.chongzhi_config.currencyType;
        return currency_type;
    }

    /**充值 */
    public DoRecharge(charge_info: RechargeListInfo) {
        //gm充值
        // GMCmdCtrl.Inst().SendGMCommand("addchongzhi", add_gold + "");
        let pay_event_url = LoginData.GetUrlParm().param_list.pay_event_url;// HttpProperty.url_parm.param_list.pay_event_url;
        if (pay_event_url) {
            let type = 2;
            let spid = PackageData.Inst().getPackage_spid();
            let user_id = LoginData.Inst().GetLoginRespUserData().uid;
            let role_id = RoleData.Inst().GetRoleId();
            let serverID = LoginData.Inst().GetServerItemInfoById(LoginData.Inst().ResultData.currentId).id;
            let data = charge_info.info.moneyShow / 100;
            let time = Math.floor(TimeCtrl.Inst().ServerTime);
            let sign = MD5.encode(type + spid + user_id + role_id + serverID + data + time + "33cc62b07ae98fffddd923b178aa0a14");
            let url = pay_event_url + "?type=" + type + "&spid=" + spid + "&user_id=" + user_id + "&role_id=" + role_id + "&server_id=" + serverID +
                "&data=" + data + "&time=" + time + "&sign=" + sign;
            HTTP.GetJson(url);
        }
        let order_data = Order_Data.initOrder(charge_info.info.seq, RechargeType.BUY_TIME_TYPE_CHONGZHI, charge_info.info.moneyShow / 100, charge_info.info.addGold, "");
        OrderCtrl.generateOrder(order_data);
    }
}

export class RechargeListInfo {
    info: IPB_ChongzhiInfo;
    recharge_times: number;
    constructor(info: IPB_ChongzhiInfo, recharge_times: number) {
        this.info = info;
        this.recharge_times = recharge_times;
    }
}



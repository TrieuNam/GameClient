import { LogError } from "core/Debugger"
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl"
import { GMCmdCtrl } from "modules/gm_command/GMCmdCtrl";
import { LoginData } from "modules/login/LoginData";
import { DataHelper } from "../../helpers/DataHelper";
import { RechargeData } from "./RechargeData"

export enum Recharge_Currency {
    RMB = 0,                    //人民币
    New_Taiwan_Currency = 1,    //新台币
    DOLLAR = 2,                 //美元
}
export class RechargeCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCChongZhiInfo, func: this.OnRecvChongZhiInfo },
            { msgType: PB_SCChongZhiInfoChange, func: this.OnRecvChongZhiInfoChange },
            { msgType: PB_SCChongZhiConfigInfo, func: this.OnRecvChongZhiConfigInfo },
        ]
    }

    private OnRecvChongZhiInfo(data: PB_SCChongZhiInfo) {
        RechargeData.Inst().OnRecvChongZhiInfo(data);
    }

    private OnRecvChongZhiInfoChange(data: PB_SCChongZhiInfoChange) {
        RechargeData.Inst().OnRecvChongZhiInfoChange(data);
    }

    private OnRecvChongZhiConfigInfo(data: PB_SCChongZhiConfigInfo) {
        RechargeData.Inst().OnRecvChongZhiConfigInfo(data);
    }

    /**请求充值列表 */
    public SendChongZhiConfigReq() {
        let protocol = this.GetProtocol(PB_CSChongZhiConfigReq);
        protocol.currency = Recharge_Currency.RMB;
        protocol.spidStr = DataHelper.StringToByte(LoginData.Inst().GetServerInfo().spid) ;
        this.SendToServer(protocol);
    }

    /**请求万能卡购买 */
    public SendBuyByItem(num:number,money:number,add_pay_gold:number, type:number,param1:number,param2:number){
        let protocol = this.GetProtocol(PB_CSBuyCmdReq);
        protocol.num = num;
        protocol.buyMoney = money;
        protocol.addPayGold = add_pay_gold;
        protocol.buyType = type;
        protocol.buyParam_1 = param1;
        protocol.buyParam_2 = param2;
        this.SendToServer(protocol);
    }
}
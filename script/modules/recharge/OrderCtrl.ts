import { Singleton } from "core/Singleton";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { LoginData } from "modules/login/LoginData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { PackageData } from "preload/PkgData";
import { ChannelAgent } from "../../proload/ChannelAgent";
import { RechargeCtrl } from "./RechargeCtrl";
import { WanNengKaView } from "./WanNengKaView";
export class OrderCtrl extends Singleton {
    constructor() {
        super();
    }

    /**生成订单 
     * (直购gm:cmdbuy:role_id add_gold money type param1 param2)
    */
    public static generateOrder(orderInfo: Order_Data) {
        let has_item_num = Item.GetNum(CommonId.WanNengKa);
        let cost_item_num =  orderInfo.moneyAmount ;
        if (has_item_num >= cost_item_num) {
            let func = () => {
                let money = orderInfo.moneyAmount;
                let add_pay_gold = orderInfo.currencyAmount;
                RechargeCtrl.Inst().SendBuyByItem(cost_item_num, money, add_pay_gold, orderInfo.type, orderInfo.param1, orderInfo.param2);
            }
            ViewManager.Inst().OpenView(WanNengKaView, { cost_num: cost_item_num, call_Func: func })
            return;
        }

        let open_chongzhi = LoginData.GetUrlParm().param_list.switch_list.open_chongzhi;
        if (open_chongzhi)
            ChannelAgent.Inst().Mai(orderInfo);
        else
            PublicPopupCtrl.Inst().Center(Language.Recharge.noOpen)
    }
}

export class Order_Data {
    moneyAmount: number;			//金额
    currencyAmount: number;			//获得游戏币数量
    currencyName: string = "";		//游戏币名称
    productId: string = "";			//商品id  可以""
    productName: string;			//商品名称
    productDescription: string = "";//商品描述 = 商品名称
    count: number = 1;				//数量  一般都是1
    orderId: string;				//订单ID
    type: number;				    //充值类型
    param1: number;				    //param1
    param2: number;				    //param2
    /**创建订单信息
    *	@param seq 与服务端商定的param1
    *	@param type 充值类型（RechargeType 或者活动ID）
    *	@param moneyAmount 真实充值金额 
    *	@param currencyAmount (配置的钻石数)货币数量 
    *	@param productName 礼包名字
    *  @param chargeID 与服务端商定的param2
    */
    public static initOrder(seq: number | string, type: number, moneyAmount: number, currencyAmount: number, productName: string, chargeID = 0) {
        let orderData = new Order_Data();
        orderData.moneyAmount = moneyAmount;
        orderData.currencyAmount = currencyAmount;
        orderData.currencyName = Language.Recharge.Diamond;
        orderData.productId = "";
        orderData.productName = productName;
        orderData.productDescription = productName;
        orderData.count = 1;
        orderData.type = type;
        orderData.param1 = +seq;
        orderData.param2 = chargeID;
        // 生成订单ID		
        let serverID = LoginData.Inst().ResultData.currentId;
        let roleID = RoleData.Inst().GetRoleId();
        let agent_id = LoginData.Inst().GetServerInfo().spid;
        let userID = LoginData.Inst().GetLoginRespUserData().uid;
        let currentTime = Math.floor(TimeCtrl.Inst().ServerTime);
        let version = PackageData.Inst().getQueryData().version_info.assets_info.resources
        orderData.orderId = serverID + "_" + roleID + "_" + agent_id + "_" + userID + "_" + currentTime + "_"
            + version + "_" + type + "-" + seq + "-" + chargeID;
        return orderData;
    }
}

// 直购枚举
export enum RechargeType {
    BUY_TIME_TYPE_CHONGZHI = 1,//充值
    NEW_AREA_PREFERENTIAL = 2, //新服特惠 param1-seq
    MARKET_SHOP = 3,           //集市商店 param1-shop_good_seq[seq]
}
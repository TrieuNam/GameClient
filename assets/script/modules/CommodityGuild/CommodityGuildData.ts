import { CfgCommodityGuildData } from "config/CfgCommodityGuild";
import { LogError } from "core/Debugger";
import { CreateSMD, smartdata } from "data/SmartData";
import { AngelCtrl } from "modules/Angel/AngelCtrl";
import { DataBase } from "../../data/DataBase";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { RoleData } from "modules/role/RoleData";
import { ArenaData } from "modules/Arena/ArenaData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { ShopConfirmData } from "modules/shop/ShopData";
import { ViewManager } from "manager/ViewManager";
import { BuyConfirmView } from "modules/shop/BuyConfirmView";

/*
class LoginResultData{
    @smartdata
    result:number;
}
*/
export enum CommodityGuildType {
    REQ_TYPE_INFO = 0,
    REQ_TYPE_LOTTRY_DISCOUNT = 1,//抽取折扣
    REQ_TYPE_BUY_REWARD = 2,    //购买

}

export class CommodityGuildSmartData {
    @smartdata
    CommodityGuildInfo: PB_SCRaCommodityGuildInfo;

    // GuMoLayerInfo: PB_SCGuMoPagodaLayerInfo;
    // @smartdata
    // GuMoLayerFlush : boolean = false;
}

export class CommodityGuildData extends DataBase {
    //public ResultData : LoginResultData;
    public CommodityGuildSmartData: CommodityGuildSmartData;
    private CommodityGuildInfo: PB_SCRaCommodityGuildInfo;
    // private zhekou = 7
    private is_chou = false
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.CommodityGuildSmartData = CreateSMD(CommodityGuildSmartData);

    }
    public OnCommdityGuildInfo(data: PB_SCRaCommodityGuildInfo) {
        this.CommodityGuildInfo = data
        // LogError(data)
        this.CommodityGuildSmartData.CommodityGuildInfo = data

    }



    //商品列表
    public GetShopList() {
        var cfg = CfgCommodityGuildData.gift_configure;
        let lev: number = 0;
        let role_level = this.CommodityGuildInfo.openLevel || 1//RoleData.Inst().GetRoleLevel();
        // this.CommodityGuildInfo.openLevel;
        let i = 1;
        let data = [];
        let info
        for (const cards of cfg) {
            let num = cards.limit_convert_count <= this.GetItemBuyTime(cards.seq) ? cards.seq : 1000 - cards.seq
            info = {
                seq: cards.seq,
                pai: num,
                start_level: cards.start_level,
                end_level: cards.end_level,
                type: cards.type,
                reward_item: cards.reward_item,
                // stuff_num:cards.stuff_num,
                limit_type: cards.limit_type,
                limit_convert_count: cards.limit_convert_count,
                price_type: cards.price_type,
                original_price: cards.original_price,
            }
            data.push(info);
        }
        data.sort((a: any, b: any) => {
            let sortNumber = 0
            if (a.pai < b.pai) {
                sortNumber = 1;
            }
            if (a.pai > b.pai) {
                sortNumber = -1;
            }
            return sortNumber
        });

        return data.filter(cfg => {
            return cfg.start_level <= role_level && cfg.end_level >= role_level;
        });
        // return data;
    }

    //当前折扣
    public GetNowZhekou() {
        return this.CommodityGuildInfo.curDiscount
    }

    //是否抽取
    public GetIsChouqu() {
        return this.CommodityGuildInfo.curDiscount != 0
    }

    public SetIsChouqu(is_chou: boolean) {
        this.is_chou = is_chou
    }

    //商品已购买次数
    public GetItemBuyTime(seq: number) {
        return this.CommodityGuildInfo.purchasedTimes[seq]
    }

    public GetCommodityGuildRed() {
        return this.is_chou ? 0 : 1
    }

    //总红点
    public GetAllRed() {
        return this.CommodityGuildInfo ? (this.CommodityGuildInfo.curDiscount == 0 ? 1 : 0) : 0
    }

    //抽取折扣
    public SendCommodityChouQu() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CommodityGuild, CommodityGuildType.REQ_TYPE_LOTTRY_DISCOUNT)
    }

    //购买物品
    public SendCommodityBuyReward(seq: number) {
        //LogError("seq = "+ seq)
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CommodityGuild, CommodityGuildType.REQ_TYPE_BUY_REWARD, seq)
    }

    public sendBuy(shop_data: any) {
        let buy_fun: Function = () => {
            if (shop_data.item_id == ArenaData.Inst().GetChallengeCostId() && ArenaData.Inst().IsChallengeTimeMax()) {
                PublicPopupCtrl.Inst().Center(Language.Box.tip5);
            } else {
                // ShopCtrl.Inst().SendBuyReq(shop_data.index);
                this.SendCommodityBuyReward(shop_data.type)
            }
        };
        // LogError(shop_data)
        let has_buy_time = CommodityGuildData.Inst().GetItemBuyTime(shop_data.type);
        let limit_time = shop_data.limit_convert_count - has_buy_time
        let now_money = shop_data.original_price * this.CommodityGuildInfo.curDiscount / 10 | 0
        let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
            shop_data.reward_item.item_id,
            shop_data.reward_item.num,
            shop_data.price_type,
            now_money,
            buy_fun,
            limit_time);
        ViewManager.Inst().OpenView(BuyConfirmView, buy_confirm_data)
    }
}

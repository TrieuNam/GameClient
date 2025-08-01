import { CfgLimitCore } from "config/CfgLimitCore";
import { CfgShop, CfgShopData, CfgShopLabel } from "config/CfgShop";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RechargeData } from "modules/recharge/RechargeData";
import { RoleData } from "modules/role/RoleData";
import { DataBase } from "../../data/DataBase";
import { ShopBuyConfirmView } from "./ShopBuyConfirmView";
import { ShopCtrl } from "./ShopCtrl";
export class ShopResultData {
    @smartdata
    is_limit_change: boolean;
}
export class ShopData extends DataBase {
    private cur_show_pages: CfgShopLabel[];//当前展示的商店数据
    private limit_info: PB_SCShopInfo;
    public result_info: ShopResultData;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.result_info = CreateSMD(ShopResultData);
    }

    public SetSCShopInfo(data: PB_SCShopInfo) {
        this.limit_info = data;
        this.result_info.is_limit_change = !this.result_info.is_limit_change;
    }

    public GetShopData(page: number, shop_type: number) {
        let level = RoleData.Inst().GetRoleLevel();
        let cfg = CfgShopData.shop;
        let data: { [page_1: number]: any[] } = {};
        for (let i = 0; i < cfg.length; i++) {
            if (cfg[i].level > level)
                continue;
            let cfg_page = cfg[i].page;
            if (cfg_page != page)
                continue;
            let page_1 = cfg[i].page_1;
            if (!data[page_1]) {
                data[page_1] = [];
                data[page_1].push([]);
            }
            if (data[page_1][data[page_1].length - 1].length == 3)
                data[page_1].push([]);
            data[page_1][data[page_1].length - 1].push(cfg[i]);
        }
        let shop_datas: any[] = [];
        // if (page == 0 && level >= CfgLimitCore.other[0].level_open) {
        //     shop_datas.push(new CoreBoxData())
        // }
        for (let page in data) {
            if (shop_type == 0) {
                let cfg_label = CfgShopData.shop_label_1[page];
                shop_datas.push(cfg_label.name);
            }
            shop_datas = shop_datas.concat(data[page])
        }
        return shop_datas;
    }

    public InitTabData(mod_key: number) {
        let name;
        for (let i = 0; i < CfgShopData.skip.length; i++) {
            if (CfgShopData.skip[i].mod_key == mod_key) {
                name = CfgShopData.skip[i].name;
                this.cur_show_pages = [];
                let pages_info = CfgShopData.skip[i].page + "";
                let pages = pages_info.split("|");
                for (let i = 0; i < pages.length; i++) {
                    if (FunOpen.Inst().checkAudit(mod_key, +pages[i])) {
                        this.cur_show_pages.push(CfgShopData.shop_label[+pages[i]])
                    }
                }
            }
        }
        return { name: name, tab_data: this.cur_show_pages };
    }

    /**根据index返回标签页的数据 */
    public GetShopDataByPage(page: number) {
        if (!this.cur_show_pages) {
            return [];
        }
        let type = CfgShopData.shop_label[page].shop_type;
        if (type == 2) {
            let list = RechargeData.Inst().GetChargeInfoList();
            let data = [];
            for (let i = 0; i < list.length; i++) {
                if (i % 3 == 0) {
                    data.push([]);
                }
                data[Math.floor(i / 3)].push(list[i]);
            }
            return data;
        } else
            return this.GetShopData(page, type);
    }

    public sendBuy(shop_data: CfgShop) {
        let num = Item.GetNum(shop_data.exchange_item_id);
        let cost = shop_data.exchange_item_num;
        let limit_times = shop_data.param - ShopData.Inst().GetBuyCount(shop_data.index);
        if (num < cost) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(shop_data.exchange_item_id);
            return;
        }
        let buy_fun: Function = (num: number) => {
            ShopCtrl.Inst().SendBuyReq(shop_data.index, num);
        };
        let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
            shop_data.item_id,
            shop_data.item_num,
            shop_data.exchange_item_id,
            shop_data.exchange_item_num,
            buy_fun,
            shop_data.param > 0 ? limit_times : 999,
        );
        if (shop_data.param == 0 || limit_times > 0) {
            ViewManager.Inst().OpenView(ShopBuyConfirmView, buy_confirm_data)
        } else {
            buy_fun(1)
        }
    }

    public GetBuyCount(index: number) {
        let cfg = CfgShopData.shop[index];
        if (!this.limit_info) {
            return cfg.param;
        }
        for (let i = 0; i < this.limit_info.dataList.length; i++) {
            if (this.limit_info.dataList[i].index == index) {
                return this.limit_info.dataList[i].buyNum;
            }
        }
        return 0;
    }

    /**商城红点 */
    public GetRed() {
        let level = RoleData.Inst().GetRoleLevel();
        if (level < CfgLimitCore.other[0].level_open) {
            return 0;
        }
        // let data_ad = RoleData.Inst().AdInfo
        // let box_ad = data_ad.get(AdType.box_choujiang)
        // if (!box_ad) {
        //     return 1;
        // }
        // let co = RoleData.Inst().CfgAdTypeSeq(AdType.box_choujiang)
        // if (+co.ad_param - box_ad.todayCount <= 0) {
        //     return 0;
        // }
        // if (box_ad.nextFetchTime > 0)
        //     return 0;
        return 0;
    }
}

export class ShopConfirmData {
    item_id: number;//兑换得到的物品id
    item_num: number;
    exchange_item_id: number;//兑换消耗的物品id
    exchange_item_num: number;
    buy_fun: Function;
    limit_times: number;//限购次数
    constructor(item_id: number, item_num: number, exchange_item_id: number, exchange_item_num: number, buy_fun: Function, limit_times: number = -1) {
        this.item_id = item_id;
        this.item_num = item_num;
        this.exchange_item_id = exchange_item_id;
        this.exchange_item_num = exchange_item_num;
        this.buy_fun = buy_fun;
        this.limit_times = limit_times;
    }
}

export class CoreBoxData {
}

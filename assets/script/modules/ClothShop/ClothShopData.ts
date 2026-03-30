import { Language } from 'modules/common/Language';
import { DataBase } from "../../data/DataBase";
import { CfgClothShopDatashop, CfgClothShopData } from "config/CfgClothShop";
import { Item } from "modules/bag/ItemData";
import { FashionData } from 'modules/fashion/FashionData';
import { ClothShopCtrl } from './ClothShopCtrl';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { ShopConfirmData } from 'modules/shop/ShopData';
import { ShopBuyConfirmView } from 'modules/shop/ShopBuyConfirmView';
import { ViewManager } from 'manager/ViewManager';
import { GetCfgValue } from 'config/CfgCommon';

export class ClothShopData extends DataBase {

    // 根据page返回标签页的数据
    public GetShopDataByPage(page: number) {
        let cfg = CfgClothShopData.shop;
        let data: { [key: number]: any[] } = {};
        let shop_datas: any[] = [];

        for (let i = 0; i < cfg.length; i++) {
            if (cfg[i].shop_type != page) continue;
            let group_id = cfg[i].group_id;
            if (!data[group_id]) {
                data[group_id] = [];
                data[group_id].push([]);
            }
            if (data[group_id][data[group_id].length - 1].length == 3) {
                data[group_id].push([]);
            }
            data[group_id][data[group_id].length - 1].push(cfg[i]);
        }
        for (let group in data) {
            let str = this.GetGroupTitle(data[group][0][1]);
            shop_datas.push(str);
            shop_datas = shop_datas.concat(data[group])
        }
        return shop_datas;
    }

    public GetGroupTitle(data: CfgClothShopDatashop) {
        if (data.shop_type == 0) {
            let fashiondata = FashionData.Inst().CfgClothesItem(data.item_id)
            return fashiondata.suit_name;
        } else {
            let itemdata = Item.GetConfig(data.item_id);
            if (data.shop_type == 3) {
                return GetCfgValue(Language.ClothShop.QuaDesc, itemdata.color - 4);
            } else {
                return GetCfgValue(Language.ClothShop.QuaDesc, itemdata.color - 2);
            }
        }
    }

    public sendBuy(shop_data: CfgClothShopDatashop) {
        let num = Item.GetNum(shop_data.buy_item);
        let buy_num = shop_data.buy_item_num * shop_data.discount;
        if (num < buy_num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(shop_data.buy_item);
            return;
        }
        let buy_fun: Function = (num: number) => {
            ClothShopCtrl.Inst().SendBuyReq(shop_data.seq, num);
        };
        let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
            shop_data.item_id,
            shop_data.item_num,
            shop_data.buy_item,
            buy_num,
            buy_fun,
            999,
        );
        ViewManager.Inst().OpenView(ShopBuyConfirmView, buy_confirm_data)
    }

}


export let ClothShopIconName: { [key: number]: string } = {
    [0]: "ShiZhuang",
    [1]: "ZuoQi",
    [2]: "FaZhen",
    [3]: "ChongWu",
}
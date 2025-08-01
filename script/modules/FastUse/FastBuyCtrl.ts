import { CfgShopData } from "config/CfgShop";
import { Singleton } from "core/Singleton";
import { ViewManager } from "manager/ViewManager";
import { FastBuyView } from "./FastBuyView";

export class FastBuyCtrl extends Singleton{

    public checkFastBuy(id:number){
        let shop_cfg=CfgShopData.shop;
        for (let i = 0; i < shop_cfg.length;i++){
            if(shop_cfg[i].item_id==id){
                ViewManager.Inst().OpenView(FastBuyView, shop_cfg[i]);
                return;
            }
        }
    }
}
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';

export enum MysteryShopReq {
    Refresh = 0,//刷新物品
    Buy = 1,//购买商品 param-index[0, 32] 1631协议中的索引
    Open = 2,//打开界面
}
export class MysteryShopCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCMysteryShopInfo, func: this.recvMysteryShopInfo }
        ]
    }

    private recvMysteryShopInfo(data: PB_SCMysteryShopInfo) {
        MysteryShopeData.Inst().setMysteryShopInfo(data);
    }

    public SendMysteryShopReq(type: MysteryShopReq, param?: number) {
        let protocol = this.GetProtocol(PB_CSMysteryShopReq);
        protocol.opType = type;
        protocol.param = param ?? 0;
        this.SendToServer(protocol);
    }
}

import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from 'data/SmartData';
import { CfgShenMiData, CfgShenMiShop } from 'config/CfgShenMi';
import { ShopConfirmData } from '../ShopData';
import { ViewManager } from 'manager/ViewManager';
import { BuyConfirmView } from '../BuyConfirmView';
import { BagData } from 'modules/bag/BagData';
import { Item } from 'modules/bag/ItemData';
import { CfgItem } from 'config/CfgCommon';
import { ArenaData } from 'modules/Arena/ArenaData';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { Language } from 'modules/common/Language';

export class MysteryShopResultData {
    @smartdata
    shop_info: PB_SCMysteryShopInfo;
}

export class MysteryShopeData extends DataBase {
    mystery_shop_result_info: MysteryShopResultData;
    flags: number[] = [];
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.mystery_shop_result_info = CreateSMD(MysteryShopResultData);
    }

    public setMysteryShopInfo(data: PB_SCMysteryShopInfo) {
        this.mystery_shop_result_info.shop_info = data;
        this.flags = this.mystery_shop_result_info.shop_info.buyFlag.toString(2).split("").reverse().map(Number);
    }

    public GetShopInfo(): MysteryShopListData[] {
        let info_list = this.mystery_shop_result_info.shop_info;
        let cfgs = CfgShenMiData.shop;
        let flags = this.flags;
        let shop_info_list = [];
        for (let i = 0; i < info_list.indexList.length; i++) {
            let cfg = cfgs[info_list.indexList[i]];
            if(cfg){
                let flag = flags[i];
                let item_cell_data = Item.Create(new CfgItem(cfg.item_id, cfg.item_num), { is_num: true, is_click :false});
                shop_info_list.push(new MysteryShopListData(cfg, flag, i, item_cell_data));
            }
        }
        return shop_info_list;
    }

    public sendBuy(data: MysteryShopListData) {
        let flag = this.flags[data.index] ? this.flags[data.index]:0;
        let limit_times = 1 - flag;
        if (limit_times > 0) {
            let buy_fun: Function = () => {
                if (data.cfg.item_id == ArenaData.Inst().GetChallengeCostId() && ArenaData.Inst().IsChallengeTimeMax()){
                    PublicPopupCtrl.Inst().Center(Language.Box.tip5);
                }else{
                    this.flags[data.index] = 1;
                    MysteryShopCtrl.Inst().SendMysteryShopReq(MysteryShopReq.Buy, data.index);
                }
            };
            let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
                data.cfg.item_id,
                data.cfg.item_num,
                data.cfg.exchange_item_id,
                data.cfg.exchange_item_num,
                buy_fun,
                limit_times);
            ViewManager.Inst().OpenView(BuyConfirmView, buy_confirm_data)
        }
    }

    public getReFreshTime(): number {
        let cost_num = CfgShenMiData.other[0].shuaxinjuan_num;
        let num = BagData.Inst().getItemNum(this.getRefreshId());
        let times = Math.floor(num / cost_num); 
        return times;
    }

    public getRefreshId() {
        return CfgShenMiData.other[0].shuaxinjuan_id;
    }
}
export class MysteryShopListData {
    cfg: CfgShenMiShop;
    flag: number;
    index: number;
    item_cell_data:any;
    constructor(cfg: CfgShenMiShop, flag: number, index: number, item_cell_data:any) {
        this.cfg = cfg;
        this.flag = flag;
        this.index = index;
        this.item_cell_data = item_cell_data;
    }
}


import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { LuckyGiftCtrl, LuckyGiftData, LuckyGift_OP_TYPE } from "./LuckyGiftCtrl";
import { ViewManager } from "manager/ViewManager";
import { CfgLuckyGift } from "config/CfgLuckyGift";
import { Item } from "modules/bag/ItemData";
import { UH } from "../../helpers/UIHelper";
import { CommonId } from "modules/common/CommonEnum";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Language } from "modules/common/Language";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { ACTIVITY_ENTER_TYPE, ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { LooperHandle } from "data/HandleCollectorCfg";
import { TimeHelper } from "../../helpers/TimeHelper";
import { RechargeData } from "modules/recharge/RechargeData";
import { BaseItem } from "modules/common/BaseItem";
import { ItemCell } from "modules/extends/ItemCell";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { CfgActivityRand } from "config/CfgActivity";
import { Vec3 } from "cc";

@BaseView.registView
export class LuckyGiftView extends BaseView {

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "LuckyGift",
        ViewName: "LuckyGiftView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        TxtValue: <fgui.GTextField>null,
        TxtDesc1: <fgui.GTextField>null,
        TxtDesc2: <fgui.GTextField>null,
        TxtDesc3: <fgui.GTextField>null,
        TxtTime: <fgui.GTextField>null,
        List: <fgui.GList>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,
        BtnBuy: <CommonButtonBuy>null,
        StyleLoder: <fgui.GLoader>null,
    }

    protected extendsCfg = [
        { ResName: "ItemReward", ExtendsClass: LuckyGiftViewRewardItem }
    ];

    InitData(key: string) {
        this.viewNode.List.setVirtual();
        this.AddSmartDataCare(LuckyGiftData.Inst().ResultData, this.FlushData.bind(this), "is_gift_change");
        this.viewNode.BtnLeft.onClick(this.onGiftChangeClick.bind(this, -1));
        this.viewNode.BtnRight.onClick(this.onGiftChangeClick.bind(this, 1));
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this, 1));
        this.select_key = key;
        this.FlushData();
        this.handleCollector.Add(LooperHandle.Create(this.updateTime.bind(this)));
    }

    private select_key: string;
    private select_index: number = 0;
    private gift_data: { info: IPB_RaLuckCouttesyGiftDef, index: number, key: string }[] = [];
    private FlushData() {
        let gift_data = LuckyGiftData.Inst().GetGiftData();
        if (!gift_data || gift_data.length == 0) {
            ViewManager.Inst().CloseView(LuckyGiftView);
            return;
        }
        this.gift_data = gift_data;
        this.select_index = 0;
        if (this.select_key) {
            for (let i = 0; i < gift_data.length; i++) {
                if (gift_data[i].key == this.select_key) {
                    this.select_index = i;
                    break;
                }
            }
        }
        this.SetGiftData();
    }

    private SetGiftData() {
        this.checkBtnShow();
        let gift_info = this.gift_data[this.select_index];
        if (gift_info) {
            this.select_key = gift_info.key;
            let cfg = CfgLuckyGift.gift_configure[gift_info.info.giftSeq];
            this.viewNode.List.SetData(Item.DefaultCreateListItem(cfg.reward_item));
            UH.SetText(this.viewNode.TxtValue, Language.LuckyGift.value + RechargeData.Inst().GetLocalSign() + cfg.original_price);
            UH.SetText(this.viewNode.TxtDesc1, cfg.desc1);
            UH.SetText(this.viewNode.TxtDesc2, cfg.desc2);
            UH.SetText(this.viewNode.TxtDesc3, cfg.desc3);
            UH.SpriteName(this.viewNode.StyleLoder, "LuckyGift", "HengFu" + cfg.show_style);
            if (cfg.price_type == 3) {
                this.viewNode.BtnBuy.title = cfg.buy_money / 10 + "";
                this.viewNode.BtnBuy.SetIcon(true, "RenMinBiDaLv", "CommonButton")
            } else {
                let item_id = cfg.price_type == 1 ? CommonId.Diamond : CommonId.Gold;
                this.viewNode.BtnBuy.SetIcon(true, `Item${item_id}`, "CommonAtlas")
                this.viewNode.BtnBuy.title = cfg.buy_money + "";
            }
        }
    }

    private updateTime() {
        let gift_info = this.gift_data[this.select_index];
        if (gift_info) {
            let time = (gift_info.info.endTimestamp - TimeCtrl.Inst().ServerTime).toFixed(2);
            if (+time < 0) {
                return;
            }
            let time_desc = TimeHelper.TimeformatDHMS(time);
            if (+time < 60)
                time_desc = time_desc + ":" + time.split(".")[1];
            UH.SetText(this.viewNode.TxtTime, time_desc);
        }
    }
    private onGiftChangeClick(index_add: number) {
        this.select_index += index_add;
        this.SetGiftData();
    }

    public checkBtnShow() {
        this.viewNode.BtnLeft.visible = this.select_index != 0;
        this.viewNode.BtnRight.visible = this.select_index != this.gift_data.length - 1;
    }

    private onBuy() {
        let gift_info = this.gift_data[this.select_index];
        if (gift_info) {
            let cfg = CfgLuckyGift.gift_configure[gift_info.info.giftSeq];
            if (cfg.price_type == 3) {
                let order = Order_Data.initOrder(gift_info.index, ACTIVITY_TYPE.LuckyGift, cfg.buy_money / 10, cfg.buy_money, Language.LuckyGift.LuckyGift, 0);
                OrderCtrl.generateOrder(order);
            } else {
                let id = cfg.price_type == 1 ? CommonId.Diamond : CommonId.Gold;
                let has_num = Item.GetNum(id);
                if (has_num >= cfg.buy_money) {
                    LuckyGiftCtrl.Inst().SendReq(LuckyGift_OP_TYPE.Buy, gift_info.index);
                } else {
                    PublicPopupCtrl.Inst().ItemNotEnoughNotice(id)
                }
            }
        }
    }

    closeView() {
        let rand_list = ActivityRandData.Inst().GetActBtnList(ACTIVITY_ENTER_TYPE.Right);
        rand_list.sort(
            (a: CfgActivityRand, b: CfgActivityRand) => {
                return a.seq - b.seq;
            }
        )
        let index = -1;
        for (let i = 0; i < rand_list.length; i++) {
            if (rand_list[i].act_type == ACTIVITY_TYPE.LuckyGift) {
                index =  i;
                break;
            }
        }
        let close_func = () => {
            ViewManager.Inst().CloseView(LuckyGiftView);
        }
        if (index == -1) {
            close_func();
        } else {
            this.view.pivotX = 0.5
            this.view.pivotY = 0.5
            this.view.node.scale = new Vec3(0.9, 0.9, 0);
            let start_real_x = this.view.node.position.x;
            let start_real_y = this.view.node.position.y;
            let offsetX = 40;
            let offsetY = -40;
            let end_x = 680 + offsetX;// 800 - (50 + index * 110) + offsetX;
            let end_y = -905 - index * 120 + offsetY;  //-905 + offsetY;;// -150 + offsetY;

            let start_x = 400;
            let start_y = -750;

            let dis_x = end_x - start_x
            let dis_y = end_y - start_y

            fgui.GTween.to(start_x, end_x, 0.3)
                .setEase(fgui.EaseType.Linear)
                .onUpdate((tweener: fgui.GTweener) => {
                    let bili = +((tweener.value.x - start_x) / dis_x).toFixed(2)
                    this.view.node.scale = new Vec3(1 - bili, 1 - bili, 0);
                    let x = start_real_x + bili * dis_x
                    let y = start_real_y + bili * dis_y;
                    this.view.node.position = new Vec3(x, y, 0);
                }).onComplete(() => {
                    close_func();
                })
        }
    }

    CloseCallBack(): void {
    }

    InitUI() {

    }
}

class LuckyGiftViewRewardItem extends BaseItem {
    protected viewNode = {
        CellShow: <ItemCell>null,
        NameShow: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        super.SetData(data);
        this.viewNode.CellShow.SetData(data);
        UH.SetText(this.viewNode.NameShow, data.Name());
        this.viewNode.NameShow.fontSize = data.Name().toString().length < 6 ? 26 : 22;
    }
}


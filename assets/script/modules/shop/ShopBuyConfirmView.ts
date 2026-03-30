/**
 * 商城购买弹窗修改成这个带数量选择的，
 * 原其他引用不带数量购买弹窗的玩法不变不变
 */
import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ArenaData } from "modules/Arena/ArenaData";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ShopConfirmData } from "./ShopData";

const MAX_Buy_NUM = 100

@BaseView.registView
export class ShopBuyConfirmView extends BaseView {
    private confirm_data: ShopConfirmData;
    private cur_num: number = 1;
    private max_num: number;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShopBuyConfirm",
        ViewName: "ShopBuyConfirmView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        Cell: <ItemCell>null,
        IconCost: <fgui.GLoader>null,
        TxtCost: <fgui.GTextField>null,
        BtnBuy: <fgui.GButton>null,
        TxtDesc: <fgui.GTextField>null,
        TxtBuyNum: <fgui.GTextField>null,
        BtnJianShao: <fgui.GButton>null,
        BtnZengJia: <fgui.GButton>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    InitData(param: ShopConfirmData) {
        this.confirm_data = param;
        let name = Item.GetName(param.item_id);
        this.viewNode.Board.SetData(new BoardData(ShopBuyConfirmView, name));
        let cfg_item = new CfgItem(param.item_id, param.item_num);
        this.viewNode.Cell.SetData(Item.Create(cfg_item, { is_num: true, is_click: false }));
        UH.GoldIcon(this.viewNode.IconCost, param.exchange_item_id);
        UH.SetText(this.viewNode.TxtDesc, Item.GetDesc(param.item_id));
        this.viewNode.BtnBuy.onClick(this.onBuy.bind(this));
        this.viewNode.BtnZengJia.onClick(this.addNum.bind(this));
        this.viewNode.BtnJianShao.onClick(this.reduceNum.bind(this));
        // this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushMax.bind(this), "OtherChange");
        // this.FlushMax();
        this.FlushCostDesc();
    }

    public reduceNum() {
        if (this.cur_num <= 1) {
            PublicPopupCtrl.Inst().Center(Language.FastUse.tip2);
            return
        } else {
            this.cur_num -= 1;
            this.FlushCostDesc();
        }
    }

    public addNum() {
        let cost_id = this.confirm_data.exchange_item_id;
        let cost_num = this.confirm_data.exchange_item_num;
        let item_id = this.confirm_data.item_id;

        let max_num = this.confirm_data.limit_times ?? MAX_Buy_NUM
        if (this.cur_num >= max_num) {
            PublicPopupCtrl.Inst().Center(Language.FastUse.tip1);
            return
        }
        if (item_id == ArenaData.Inst().GetChallengeCostId()) {
            let fightTimes = ArenaData.Inst().GetChallengeTimeLimit() - ArenaData.Inst().GetFightTimes();
            if(this.cur_num >= fightTimes){
                PublicPopupCtrl.Inst().Center(Language.FastUse.tip5);
                return
            }
        }
        let need_cost = (this.cur_num + 1) * cost_num;
        let has_cost = BagData.Inst().getItemNum(cost_id);
        if(has_cost < need_cost){
            let name = Item.GetName(cost_id);
            PublicPopupCtrl.Inst().Center(Format(Language.FastUse.tip4, name));
            return
        }

        this.cur_num += 1;
        this.FlushCostDesc();
    }

    private FlushCostDesc() {
        let num = Item.GetNum(this.confirm_data.exchange_item_id);
        let cost = this.cur_num * this.confirm_data.exchange_item_num;
        let color = num < cost ? COLORS.Red1 : COLORS.White;
        UH.SetText(this.viewNode.TxtBuyNum, this.cur_num);
        UH.SetText(this.viewNode.TxtCost, cost, color);
    }

    // private FlushMax() {
    //     let cost_id = this.confirm_data.exchange_item_id;
    //     let cost_num = this.confirm_data.exchange_item_num;
    //     let item_id = this.confirm_data.item_id;
    //     let max_num = Math.floor(BagData.Inst().getItemNum(cost_id) / cost_num);
    //     if (this.confirm_data.limit_times != -1) {
    //         max_num = Math.min(max_num, this.confirm_data.limit_times);
    //     }
    //     if (item_id == ArenaData.Inst().GetChallengeCostId()) {
    //         let num = ArenaData.Inst().GetChallengeTimeLimit() - ArenaData.Inst().GetFightTimes();
    //         max_num = Math.min(max_num, num);
    //     }
    //     this.max_num = Math.min(max_num, MAX_Buy_NUM);
    //     this.max_num = Math.min(this.max_num, this.confirm_data.limit_times ?? MAX_Buy_NUM);
    //     this.cur_num = Math.min(this.cur_num, this.max_num);
    //     if (this.cur_num == 0 && this.max_num > 0)
    //         this.cur_num = 1;
    //     this.FlushCostDesc();
    // }

    private onBuy() {
        if (this.confirm_data.limit_times == 0) {
            PublicPopupCtrl.Inst().Center(Language.Common.buy_limit);
            return;
        }
        if (BagData.Inst().getItemNum(this.confirm_data.exchange_item_id) < this.confirm_data.exchange_item_num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(this.confirm_data.exchange_item_id)
        } else {
            if (this.confirm_data.limit_times != -1)
                this.confirm_data.limit_times = this.confirm_data.limit_times - this.cur_num;
            this.confirm_data.buy_fun(this.cur_num);
        }
        ViewManager.Inst().CloseView(ShopBuyConfirmView);
    }
}

import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";
import { BagData } from "modules/bag/BagData";
import { TextHelper } from "../../helpers/TextHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { BoardData } from "modules/common_board/BoardData";
import { Language } from "modules/common/Language";
import { CfgItem } from "config/CfgCommon";
import { CfgShop } from "config/CfgShop";
import { ShopData } from "modules/shop/ShopData";
import { ShopCtrl } from "modules/shop/ShopCtrl";
import { QualityColorStr } from "modules/common/ColorEnum";
import { Timer } from "modules/time/Timer";

const MAX_USE_NUM = 100
//快捷购买 
@BaseView.registView
export class FastBuyView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FastUse",
        ViewName: "FastUseView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnAdd: <fgui.GButton>null,
        BtnReduce: <fgui.GButton>null,
        BtnUse: <fgui.GButton>null,
        TxtNum: <fgui.GTextField>null,
        TxtDesc: <fgui.GTextField>null,
        Cell: <ItemCell>null,
        GpCost: <fgui.GGroup>null,
        IconCost: <fgui.GLoader>null,
        TxtCost: <fgui.GTextField>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    InitUI() {
        this.viewNode.BtnUse.onClick(this.onBuy.bind(this));
        this.viewNode.BtnReduce.onClick(this.reduceNum.bind(this));
        this.viewNode.BtnAdd.on(fgui.Event.TOUCH_BEGIN, this.onAddTouchBegin, this);
        this.viewNode.BtnAdd.on(fgui.Event.TOUCH_END, this.onAddTouchEnd, this);
    }

    private max_num: number;
    private cur_num: number;
    private _data: CfgShop;
    InitData(param: CfgShop) {
        this._data = param;
        this.viewNode.Cell.SetData(Item.Create(new CfgItem(param.item_id, 1), { is_gray: false, is_click: false, is_num: false }));
        let max_num = Math.floor(BagData.Inst().getItemNum(this._data.exchange_item_id) / this._data.exchange_item_num);
        if (this._data.quota_type) {
            max_num = Math.min(max_num, this._data.param - ShopData.Inst().GetBuyCount(this._data.index));
        }
        this.max_num = Math.min(max_num, MAX_USE_NUM) ;
        this.viewNode.Board.SetData(new BoardData(FastBuyView, Language.FastBuy.FastBuy));
        UH.SetText(this.viewNode.BtnUse.getTextField(), Language.ActCommon.Buy);
        this.cur_num = Math.min(1, this.max_num);
        this.setDesc();
        this.viewNode.GpCost.visible=true;
        UH.GoldIcon(this.viewNode.IconCost,param.exchange_item_id);
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushMax.bind(this), "OtherChange");
    }

    private FlushMax(){
       let max_num = Math.floor(BagData.Inst().getItemNum(this._data.exchange_item_id) / this._data.exchange_item_num);
        if (this._data.quota_type) {
            max_num = Math.min(max_num, this._data.param - ShopData.Inst().GetBuyCount(this._data.index));
        }
        this.max_num = Math.min(max_num, MAX_USE_NUM);
        this.cur_num = Math.min(this.cur_num, this.max_num);
        if (this.cur_num == 0 && this.max_num>0)
            this.cur_num=1;
        this.setDesc();
    }

    private add_delay_timer: any;
    private add_timer: any;
    private onAddTouchBegin(){
        this.addNum();
        this.add_delay_timer = Timer.Inst().AddRunTimer(this.StartAddNum.bind(this),1,1,false);
    }

    private StartAddNum(){
        Timer.Inst().CancelTimer(this.add_delay_timer);
        Timer.Inst().CancelTimer(this.add_timer);
        this.add_timer = Timer.Inst().AddRunTimer(this.addNum.bind(this), 0.5, -1,true);
    }

    public addNum() {
        if (this.cur_num >= this.max_num) {
            Timer.Inst().CancelTimer(this.add_timer);
            PublicPopupCtrl.Inst().Center(Language.FastUse.tip1);
            return
        }
        else {           
            this.cur_num += 1;
            this.setDesc();
        }
    }

    private onAddTouchEnd() {
        Timer.Inst().CancelTimer(this.add_delay_timer);
        Timer.Inst().CancelTimer(this.add_timer);
    }

    public reduceNum() {
        if (this.cur_num <= 1) {
            PublicPopupCtrl.Inst().Center(Language.FastUse.tip2);
            return
        } else {
            this.cur_num -= 1;
            this.setDesc();
        }
    }

    private onBuy() {
        if (this.cur_num > this.max_num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(this._data.exchange_item_id)
            return;
        } if (this.cur_num == 0) {
            PublicPopupCtrl.Inst().Center(Language.FastBuy.tip);
        }
        else if (this._data) {
            ShopCtrl.Inst().SendBuyReq(this._data.index, this.cur_num)
            // ViewManager.Inst().CloseView(FastBuyView);
        }
    }

    private setDesc() {
        let param_desc = TextHelper.Format(Language.FastBuy.desc, this.cur_num, TextHelper.ColorStr(Item.GetName(this._data.item_id), QualityColorStr[Item.GetColor(this._data.item_id)]));
        UH.SetText(this.viewNode.TxtDesc, param_desc);
        UH.SetText(this.viewNode.TxtNum, this.cur_num + "/" + this.max_num);
        UH.SetText(this.viewNode.TxtCost, this.cur_num *this._data.exchange_item_num);
    }
}


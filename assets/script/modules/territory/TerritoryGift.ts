import { GbufferStage, sys } from "cc";
import { CfgItem } from "config/CfgCommon";
import { CfgTerritoryGift, CfgTerritoryGiftCfg } from "config/CfgTerritoryGift";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { Order_Data, OrderCtrl } from "modules/recharge/OrderCtrl";
import { RoleData } from "modules/role/RoleData";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TerritoryData } from "./TerritoryData";
@BaseView.registView
export class TerritoryGift extends BaseView {
    data = TerritoryData.Inst()
    gift_data: CfgTerritoryGiftCfg = null
    protected viewRegcfg = {
        UIPackName: "TerritoryGift",
        ViewName: "TerritoryGift",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        List: <fgui.GList>null,
        BtnClose: <fgui.GButton>null,
        BtnBuy: <fgui.GButton>null,
        ValueDesc: <fgui.GTextField>null,
        Price: <fgui.GTextField>null,
        Title: <fgui.GTextField>null,
    }
    protected extendsCfg = [
        { ResName: "TerritoryRewardCell", ExtendsClass: TerritoryRewardCell },
    ];
    InitData(param: any): void {
        this.AddSmartDataCare(this.data.FlushData, this.FlushInfo.bind(this), "flush_gift")
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.TerritoryGift, 0)
        this.viewNode.BtnClose.onClick(this.OnClickClose, this)
        this.viewNode.BtnBuy.onClick(this.OnClickBuy, this)
        if (TerritoryData.Inst().GetGiftShowRedPoint() == 1) {
            TerritoryData.Inst().SetGiftShowRedPoint(0);
        }
    }
    FlushInfo() {
        let info = this.data.GetGiftShow()
        if (info == null || info == undefined) {
            ViewManager.Inst().CloseView(TerritoryGift);
            return
        }
        this.gift_data = info
        UH.SetText(this.viewNode.ValueDesc, info.desc)
        UH.SetText(this.viewNode.Price, Format(Language.Territory.Price2, info.gift_value))
        if (info.price_type == 3) {
            this.viewNode.BtnBuy.title = Format(Language.Territory.Price, info.price / 10)
        } else {
            this.viewNode.BtnBuy.title = Format(Language.Territory.Price, info.price)
        }
        UH.SetText(this.viewNode.Title, info.gift_name)
        this.viewNode.List.SetData(info.item)
    }
    OpenCallBack(): void {
        //根据是否购买按照低等级显示内容
        this.FlushInfo()
    }
    getShowCfg() {
        let flag = 0//当前未领取标记
        let level = RoleData.Inst().GetRoleLevel()
        CfgTerritoryGift.gift_configure.forEach(element => {
            if (element.seq == flag && level >= element.start_level) {
                element.price_type
                return element
            }
        });
        return
    }
    CloseCallBack(): void {

    }
    OnClickClose() {
        ViewManager.Inst().CloseView(TerritoryGift)
    }
    OnClickBuy() {
        if (this.gift_data) {
            let seq = this.gift_data.seq
            let money = this.gift_data.price
            let order_data = Order_Data.initOrder(seq, ACTIVITY_TYPE.TerritoryGift, money / 10, money, this.gift_data.gift_name);
            OrderCtrl.generateOrder(order_data);
        }
        // 0 信息 1 购买
        //ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.TerritoryGift, 1)
    }
}

class TerritoryRewardCell extends BaseItem {
    protected viewNode = {
        Cell: <ItemCell>null,
        Name: <fgui.GTextField>null,
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: CfgItem) {
        this._data = data;
        let item = Item.Create({ item_id: data.item_id, num: data.num }, { is_num: true })
        this.viewNode.Cell.SetData(item)
        UH.SetText(this.viewNode.Name, item.Name())
    }
    public GetData() {
        return this._data;
    }
} 
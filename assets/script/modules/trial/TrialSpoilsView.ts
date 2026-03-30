import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { EquipShiLian, Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ITEM_BIG_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCellShiLian } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TrialConfig } from "./TrialConfig";
import { TrialCtrl } from "./TrialCtrl";
import { TrialData } from "./TrialData";

@BaseView.registView
export class TrialSpoilsView extends BaseView {
    private operTime: number = 0

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialSpoils",
        ViewName: "TrialSpoilsView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        BtnConfirm: <fgui.GButton>null,
        BtnGiveUp: <fgui.GButton>null,

        CurrencyIcon: <fgui.GLoader>null,
        CurrencyNum: <fgui.GTextField>null,

        SpoilName: <fgui.GTextField>null,
        SpoilDesc: <fgui.GTextField>null,

        SpoilListM: <fgui.GList>null,
        SpoilList: <fgui.GList>null,
        BagList: <fgui.GList>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialSpoilsView));

        this.viewNode.BagList.setVirtual();

        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
        this.viewNode.BtnGiveUp.onClick(this.OnClickGiveUp, this);
        this.viewNode.SpoilList.itemRenderer = this.renderSpoilListItem.bind(this);
        this.viewNode.SpoilList.on(fgui.Event.CLICK_ITEM, this.OnClickSpoilItem, this);

        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushTrialInfoShow.bind(this), "TrialInfo");
        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushBagShow.bind(this), "TrialInfo");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemShow.bind(this), "OtherChange");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushTrialInfoShow.bind(this), "EquipShiLianChange");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushBagShow.bind(this), "EquipShiLianChange");
    }

    InitUI() {
        this.FlushTrialInfoShow();
        this.FlushItemShow();
        this.FlushBagShow();
    }

    private spoil_list_data: any[];

    private renderSpoilListItem(index: number, item: ItemCellShiLian) {
        item.SetData(this.spoil_list_data[index], { is_click: false });
    }

    private FlushTrialInfoShow() {
        this.viewNode.SpoilListM.SetData(TrialData.Inst().GetTrialInfoUseItemShow(), this.OnClickUseItem.bind(this));
        // this.viewNode.SpoilList.SetData(TrialData.Inst().GetTrialInfoRandomIdShow(), this.OnClickSpoilItem.bind(this));
        this.spoil_list_data = TrialData.Inst().GetTrialInfoRandomIdShow();
        this.viewNode.SpoilList.numItems = this.spoil_list_data.length;
        this.viewNode.SpoilList.OnSelectedItem(0);

    }

    private FlushItemShow() {
        let shilian_coin_id = TrialData.Inst().CfgShiLianOtherShiLianCoinId()
        UH.SpriteName(this.viewNode.CurrencyIcon, "CommonAtlas", `Item${shilian_coin_id}`);
        UH.SetText(this.viewNode.CurrencyNum, DataHelper.ConverMoney(+BagData.Inst().getItemNum(shilian_coin_id)));
    }

    private FlushBagShow() {
        this.viewNode.BagList.SetData(TrialData.Inst().GetTrialBagList(), this.OnClickBagItem.bind(this))
    }

    private FlushSpoilShow(data: any) {
        let item = <EquipShiLian>Item.Create(data)
        UH.SetText(this.viewNode.SpoilName, item.Name())
        UH.SetText(this.viewNode.SpoilDesc, item.GetDescShow())
    }

    private OnClickUseItem(item: ItemCellShiLian) {
        let data = item.GetData();
        let index = this.viewNode.SpoilListM.getChildIndex(item);
        if (-1 == data.itemId) {
            if (TrialData.Inst().GetTrialLockEnough()) {
                TrialCtrl.Inst().SendShiLianPagodaReqOpen(index)
            }
        }
    }

    private OnClickBagItem(item: ItemCellShiLian) {
    }

    private OnClickSpoilItem(item: ItemCellShiLian) {
        let data = item.GetData();
        this.FlushSpoilShow(data)
    }

    private OnClickConfirm() {
        if (this.OperTimeWait()) {
            return
        }
        ViewManager.Inst().CloseView(TrialSpoilsView);
        let sel_index = this.viewNode.SpoilList.selectedIndex
        TrialCtrl.Inst().SendShiLianPagodaReqChoice(sel_index);
        let item = this.viewNode.SpoilList.getChildAt(sel_index) as ItemCellShiLian;
        let data = item.GetData();
        let use_item = TrialData.Inst().GetTrialInfoUseItem()
        if (-1 == use_item.indexOf(data.itemId)) {
            let use_index = use_item.indexOf(0)
            if (-1 != use_index) {
                TrialCtrl.Inst().SendShiLianPagodaReqUse(use_index, data.itemId);
            }
        }
        let bag_items = BagData.Inst().getItemMap(ITEM_BIG_TYPE.EQUIP_SHILIAN)
        if (bag_items.has(data.itemId)) {
            let level = +bag_items.get(data.itemId)
            if (level < TrialConfig.TRIAL_SPOIL_LEVEL_MAX) {
                PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Trial.TrialTower.SpoilUpTips, Item.GetName(data.itemId), level + 1));
            }
        } else {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Trial.TrialTower.SpoilNewTips, Item.GetName(data.itemId)));
        }
    }

    private OnClickGiveUp() {
        TrialCtrl.Inst().SendShiLianPagodaReqChoice(-1);
        ViewManager.Inst().CloseView(TrialSpoilsView);
    }


    OperTimeWait() {
        let is_wait = TimeCtrl.Inst().ServerTime - this.operTime < 0.5
        if (!is_wait) {
            this.operTime = TimeCtrl.Inst().ServerTime
        }
        return is_wait
    }

}
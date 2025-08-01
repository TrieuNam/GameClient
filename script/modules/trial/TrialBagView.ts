import * as fgui from "fairygui-cc";
import { BagData } from "modules/bag/BagData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCellShiLian } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";
import { TrialCtrl } from "./TrialCtrl";
import { TrialData } from "./TrialData";

@BaseView.registView
export class TrialBagView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "TrialBag",
        ViewName: "TrialBagView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        CurrencyIcon: <fgui.GLoader>null,
        CurrencyNum: <fgui.GTextField>null,

        BtnSpoil: <fgui.GButton>null,

        SpoilList: <fgui.GList>null,
        BagList: <fgui.GList>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(TrialBagView));

        this.viewNode.BagList.setVirtual();

        this.viewNode.BtnSpoil.onClick(this.OnClickSpoil, this);

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

    private FlushTrialInfoShow() {
        this.viewNode.SpoilList.SetData(TrialData.Inst().GetTrialInfoUseItemShow(), this.OnClickUseItem.bind(this));
    }

    private FlushItemShow() {
        let shilian_coin_id = TrialData.Inst().CfgShiLianOtherShiLianCoinId()
        UH.SpriteName(this.viewNode.CurrencyIcon, "CommonAtlas", `Item${shilian_coin_id}`);
        UH.SetText(this.viewNode.CurrencyNum, DataHelper.ConverMoney(+BagData.Inst().getItemNum(shilian_coin_id).toString()));
    }

    private FlushBagShow() {
        this.viewNode.BagList.SetData(TrialData.Inst().GetTrialBagList(), this.OnClickBagItem.bind(this))
    }

    private OnClickSpoil() {
        let sel_index_bag = this.viewNode.BagList.selectedIndex
        let sel_index_use = this.viewNode.SpoilList.selectedIndex
        let bag_index = this.viewNode.BagList.itemIndexToChildIndex(sel_index_bag);
        let item_bag = this.viewNode.BagList.getChildAt(bag_index) as ItemCellShiLian;
        let item_use = this.viewNode.SpoilList.getChildAt(sel_index_use) as ItemCellShiLian;
        let data_bag = item_bag.GetData();
        let data_use = item_use.GetData();
        if (-1 == data_use.itemId) {
            PublicPopupCtrl.Inst().Center(Language.Trial.TrialTower.UseLockTips);
            return
        }
        if (0 == data_bag.itemId) {
            PublicPopupCtrl.Inst().Center(Language.Trial.TrialTower.BagEmptyTips);
            return
        }
        TrialCtrl.Inst().SendShiLianPagodaReqUse(sel_index_use, data_bag.itemId);
    }

    private OnClickUseItem(item: ItemCellShiLian) {
        // AudioManager.Inst().Play(AudioTag.TongYongClick);
        let data = item.GetData();
        let index = this.viewNode.SpoilList.getChildIndex(item);
        if (-1 == data.itemId) {
            if (TrialData.Inst().GetTrialLockEnough()) {
                TrialCtrl.Inst().SendShiLianPagodaReqOpen(index)
            }
        }
    }

    private OnClickBagItem(item: ItemCellShiLian) {
    }
}
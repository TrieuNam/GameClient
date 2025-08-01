import { GetCfgValue } from "config/CfgCommon";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { ItemCell } from "modules/extends/ItemCell";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishConfig } from "./FishConfig";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";

@BaseView.registView 
export class FishGetMonoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishGet",
        ViewName: "FishGetMonoView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlock,
    };
    protected viewNode = {
        BtnSell: <fgui.GButton>null,

        NameShow: <fgui.GRichTextField>null,
        SellNum: <fgui.GTextField>null,
        SellIcon: <fgui.GLoader>null,
        CellShow: <ItemCell>null,
        NewObj: <fgui.GImage>null,
        GpRecord: <fgui.GGroup>null,
    };


    InitData() {
        this.viewNode.BtnSell.onClick(this.OnClickSell, this);
    }

    InitUI() {
        this.FlushWaBaoItemInfo()

    }

    CloseCallBack() {
        FishData.Inst().IsAutoWabao()
    }

    FlushWaBaoItemInfo() {
        let itemInfo = FishData.Inst().ResultData.WaBaoItemInfo
        let itemData = itemInfo.itemData
        let itemId = itemData.itemId;
        let item = Item.Create({itemId:itemId});
        UH.SetText(this.viewNode.NameShow, item.QuaName());
        UH.SetText(this.viewNode.SellNum, Item.GetSfbPrice(itemId));
        UH.SetIcon(this.viewNode.SellIcon, Item.GetIconId(FishData.Inst().CfgOtherBoxUpItem()), ICON_TYPE.ITEM);
        this.viewNode.NewObj.visible = FishConfig.WaBaoResultType.yes_new_get == itemInfo.result
        this.viewNode.GpRecord.visible = FishConfig.WaBaoResultType.yes_new_record == itemInfo.result
        this.viewNode.CellShow.SetData(item);
    }

    OnClickSell() {
        FishCtrl.Inst().SendWaBaoReqSell();
        ViewManager.Inst().CloseView(FishGetMonoView);
    }
}
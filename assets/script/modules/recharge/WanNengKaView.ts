import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { CommonId, ICON_TYPE } from "modules/common/CommonEnum";
import { UH } from "../../helpers/UIHelper";
import { BagData } from "modules/bag/BagData";
import { TextHelper } from "../../helpers/TextHelper";
import { Language } from "modules/common/Language";

@BaseView.registView 
export class WanNengKaView extends BaseView {
    private call_func:Function;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "WanNengKa",
        ViewName: "WanNengKaView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Desc: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null,
        HasNum: <fgui.GTextField>null,
        BtnConfirm: <fgui.GButton>null,
    }

    InitData(param:{cost_num:number,call_Func:Function}) {
        this.call_func=param.call_Func;
        let icon = Item.GetIconId(CommonId.WanNengKa);
        UH.SetIcon(this.viewNode.Icon, icon, ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.Desc, TextHelper.Format(Language.Recharge.ItemBuyDesc,param.cost_num));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushNum.bind(this), "OtherChange");
        this.FlushNum();
        this.viewNode.BtnConfirm.onClick(this.OnConfirm.bind(this));
    }

    private FlushNum() {
        let has_num = Item.GetNum(CommonId.WanNengKa);
        UH.SetText(this.viewNode.HasNum, TextHelper.Format(Language.Recharge.ItemNum, has_num));
    }

    private OnConfirm(){
        this.call_func && this.call_func()
        ViewManager.Inst().CloseView(WanNengKaView)
    }
}
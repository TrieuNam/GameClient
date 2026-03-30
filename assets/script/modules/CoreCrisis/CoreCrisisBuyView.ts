import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ShopBoxItemCell } from "modules/shop/ShopBoxItem";
import { AdType } from "modules/common/CommonEnum";
import { CfgPetData } from "config/CfgPet";
import { CoreCrisisBoxData } from "../CoreCrisisBox/CoreCrisisBoxData";
import { CoreCrisisCtrl, LIMIT_CORE_OP_TYPE } from "modules/CoreCrisis/CoreCrisisCtrl";
import { CfgLimitCore } from "config/CfgLimitCore";


@BaseView.registView
export class CoreCrisisBuyView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CoreCrisisBuy",
        ViewName: "CoreCrisisBuyView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        List: <fgui.GList>null,
        BtnClose: <fgui.GButton>null,
    }

    protected extendsCfg = [
        { ResName: "CoreCrisisBuyItem", ExtendsClass: ShopBoxItemCell },
    ];

    InitData() {
        let buy_fun = (index: number) => {
            CoreCrisisBoxData.Inst().BoxQuality = index;
            CoreCrisisCtrl.Inst().SendCSLimitCoreReq(LIMIT_CORE_OP_TYPE.DRAW, index);
        }
        let data = [
            { index: 0, AdType: AdType.box_choujiang, buy_fun: buy_fun, price: 0 },
            { index: 1, AdType: AdType.box_choujiang, buy_fun: buy_fun, price: CfgLimitCore.other[0].price1 },
            { index: 2, AdType: AdType.box_choujiang, buy_fun: buy_fun, price: CfgLimitCore.other[0].price2 }]
        this.viewNode.List.SetData(data);
        this.viewNode.BtnClose.onClick(this.closeView.bind(this));
    }
}


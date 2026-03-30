
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BoxDrawView } from "modules/BoxDraw/BoxDrawView";
import { BaseView, boardCfg, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { AdType } from "modules/common/CommonEnum";
import { Language } from 'modules/common/Language';
import { Mod } from "modules/common/ModuleDefine";
import { CoreCrisisBgShow, CoreCrisisNameShow } from 'modules/common_board/CommonBoardCC';
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { RoleData } from "modules/role/RoleData";
import { InscriptionAtlasPanel } from './InscriptionAtlasPanel';
import { InscriptionCtrl, RUNE_REQ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";
import { InscriptionMainPanel } from './InscriptionMainPanel';
import { InscriptionResolvePanel } from './InscriptionResolvePanel';

@BaseView.registView
export class InscriptionView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "InscriptionMain",
        ViewName: "InscriptionView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode: { [key: string]: any } = {
        cc_bgshow: <CoreCrisisBgShow>null,
        cc_nameshow: <CoreCrisisNameShow>null,
        BtnTips: <fgui.GButton>null,
        BtnClose: <fgui.GButton>null,
    }

    protected boardCfg: boardCfg = {
        TabberCfg: [
            { panel: InscriptionMainPanel, viewName: "InscriptionMainPanel", titleName: Language.Inscription.MainTag[0], index: 0, modKey: Mod.Inscription.Center, isRemind: true },
            { panel: InscriptionAtlasPanel, viewName: "InscriptionAtlasPanel", titleName: Language.Inscription.MainTag[1], index: 1, modKey: Mod.Inscription.Atlas, isRemind: true },
            { panel: InscriptionResolvePanel, viewName: "InscriptionResolvePanel", titleName: Language.Inscription.MainTag[2], index: 2, modKey: Mod.Inscription.Resolve, isRemind: true },
            {
                panel: null, viewName: "", titleName: Language.Inscription.MainTag[3], index: 3, modKey: Mod.Inscription.Turntable, isRemind: true, click_func: () => {
                    ViewManager.Inst().OpenView(BoxDrawView, {
                        ad_type: AdType.inscription_tower_draw, price: [InscriptionData.Inst().CfgTowerPricePrice1(), InscriptionData.Inst().CfgTowerPricePrice2()], draw_func: (index: number) => {
                            InscriptionCtrl.Inst().SendCSRuneReq(RUNE_REQ_TYPE.RUNE_BOX, index);
                        }, rate_func: (index: number) => {
                            return InscriptionData.Inst().GetBoxDrawRateShow(index)
                        }
                    })
                }
            },
        ],
        // HideTabbar: true,
    };

    InitData() {
        this.viewNode.cc_bgshow.SetData({ core_mark: CoreCrisisType.Inscription })
        this.viewNode.cc_nameshow.SetData({ core_mark: CoreCrisisType.Inscription })

        this.viewNode.BtnClose.onClick(this.CloseView.bind(this));

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoDetail.bind(this), "flushneed");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoDetail.bind(this), "mainoper");
        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.flushInfoDetail.bind(this), "turntable_num_flush");
        this.AddSmartDataCare(CoreCrisisData.Inst().flush_info, this.flushInfoDetail.bind(this), "need_flush");
        this.AddSmartDataCare(RoleData.Inst().AdFlush, this.flushInfoDetail.bind(this));
    }

    InitUI() {
        this.flushInfoDetail()
    }

    private flushInfoDetail() {
        this.viewNode.cc_bgshow.FlushData()
    }

    private CloseView() {
        ViewManager.Inst().CloseView(InscriptionView)
    }


    CloseCallBack() {
        // GuideCtrl.Inst().ForceStop()
    }
}
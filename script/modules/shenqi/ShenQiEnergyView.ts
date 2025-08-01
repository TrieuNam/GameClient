import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UpLevelShowView } from "modules/UpLevelShow/UpLevelShowView";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ShenQiCtrl } from "./ShenQiCtrl";
import { ShenQiData } from "./ShenQiData";

@BaseView.registView
export class ShenQiEnergyView extends BaseView {
    private shenQiId: number
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ShenQiEnergy",
        ViewName: "ShenQiEnergyView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnConfirm: <fgui.GButton>null,
        BtnCancel: <fgui.GButton>null,

        DescShow: <fgui.GTextField>null,
    };

    CloseCallBack(): void {

    }

    InitData(param_t: any) {
        this.viewNode.Board.SetData(new BoardData(ShenQiEnergyView));
        this.viewNode.Board.SetTitleShow(false)

        this.viewNode.BtnConfirm.onClick(this.OnClickConfirm, this);
        this.viewNode.BtnCancel.onClick(this.OnClickCancel, this);

        this.shenQiId = param_t ? param_t.id : 0
        UH.SetText(this.viewNode.DescShow, TextHelper.Format(Language.ShenQi.ShenQiEnergy.DescShow, param_t ? param_t.num : 0))
    }

    InitUI() {
    }

    private OnClickConfirm() {
        ViewManager.Inst().CloseView(ShenQiEnergyView)
        ShenQiCtrl.Inst().SendShenQiReqLevelUp(this.shenQiId, true)

        let info = ShenQiData.Inst().GetShenQiInfoById(this.shenQiId)
        ViewManager.Inst().OpenView(UpLevelShowView, {
            level_before: info.level,
            level_after: info.level + 1,
        })
    }

    private OnClickCancel() {
        ViewManager.Inst().CloseView(ShenQiEnergyView)
    }
}
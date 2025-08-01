import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UH } from "../../helpers/UIHelper";
import { PetGuardCtrl } from "./PetGuardCtrl";
import { PetGuardData } from "./PetGuardData";
import { PetGuardDetailView } from "./PetGuardDetailView";

@BaseView.RegisterView
export class PetGuardView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "PetGuard",
        ViewName: "PetGuardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "PetGuardCell", ExtendsClass: PetGuardCell },
    ]
    protected viewNode = {
        Board: <CommonBoard2>null,
        List: <fgui.GList>null,
    }
    
    InitData() {
        this.viewNode.Board.SetData(new BoardData(PetGuardView,Language.PetGuard.MainTitle,29))
        this.AddSmartDataCare(PetGuardData.Inst().flush_info, this.flushInfoPanel.bind(this), "need_flush");

        this.flushInfoPanel()
    }
    flushInfoPanel() {
        let param = PetGuardData.Inst().GetViewDetail()
        this.viewNode.List.SetData(param.list)
    }
}

export class PetGuardCell extends fgui.GComponent {
    private viewNode = {
        MonsterIcon:<fgui.GLoader>null,
        Name:<fgui.GLabel>null,
        Complete:<fgui.GImage>null,
        BtnChallenge:<CommonButtonBuy>null,
        RedPoint:<RedPoint>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnChallenge.onClick(this.OnClickChallenge, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetIcon(this.viewNode.MonsterIcon, data.icon_id, ICON_TYPE.ITEM)
        UH.SetText(this.viewNode.Name, data.name)

        this.viewNode.Complete.visible = data.is_complete && ! data.is_red
        this.viewNode.BtnChallenge.visible = !data.is_complete || data.is_red
        this.viewNode.BtnChallenge.grayed = !data.is_challenge && !data.is_red
        this.viewNode.RedPoint.visible = data.is_red || data.is_challenge
        this.viewNode.RedPoint.SetNum(data.is_red ? 1 : 0 )

    }

    private OnClickChallenge()
    {
        if(!this.data.is_challenge && !this.data.is_red)
        {
            PublicPopupCtrl.Inst().Center(Language.PetGuard.ChallengeError)
            return 
        }
        ViewManager.Inst().OpenView(PetGuardDetailView, { stage:this.data.stage});
    }

}

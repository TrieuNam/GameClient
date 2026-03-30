import { Details } from "cc";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { KoKoRoShow, CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { PetData } from "./PetData";

@BaseView.registView 
export class PetEvolView extends BaseView {
    private view_param:any
    private up_data:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetEvol",
        ViewName: "PetEvolView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    }
    protected extendsCfg = [
        // { ResName: "BtnEvol", ExtendsClass: PetEvolBtnEvol },
        { ResName: "EvolAttr", ExtendsClass: PetEvolAttr },
    ]

    protected viewNode = {
        Board: <CommonBoard2>null,
        // BtnEvol: <PetEvolBtnEvol>null,
        BtnEvol: <fgui.GButton>null,
        attr_list: <fgui.GList>null,
        name: <fgui.GLabel>null,
        next_name: <fgui.GLabel>null,

        left_model: <UIModelShow>null,
        right_model: <UIModelShow>null,
        EvolRedPoint: <RedPoint>null,
        HuoBiIcon: <fgui.GLoader>null, 
        HuoBiNum: <fgui.GLabel>null, 
    };
    InitData(data:any) {
        this.viewNode.Board.SetData(new BoardData(PetEvolView,Language.Pet.EvolTitle));
        this.viewNode.BtnEvol.onClick(this.OnClickEvol.bind(this));

        this.view_param = data

        this.AddSmartDataCare(PetData.Inst().ResultData, this.flushPanelInfo.bind(this), "flush_evol_attr");

        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.SEND_EVO_ATTR, this.view_param.index);
        this.flushPanelInfo()
    }
    flushPanelInfo()
    {
        let detail = PetData.Inst().GetEvolDetail(this.view_param.index)

        this.viewNode.attr_list.SetData(detail.attr_list)
        UH.SetText(this.viewNode.name, detail.name);
        UH.SetText(this.viewNode.next_name, detail.next_name);
        this.viewNode.left_model.setPath(ResPath.Npc(detail.pet_res));
        this.viewNode.right_model.setPath(ResPath.Npc(detail.next_pet_res));
        // this.viewNode.BtnEvol.SetData(detail.up_data)

        this.up_data = detail.up_data

        let num = Item.GetNum(this.up_data.item_id)
        this.viewNode.EvolRedPoint.SetNum(num >= this.up_data.num ? 1 : 0)

        UH.SetText(this.viewNode.HuoBiNum,this.up_data.num)
        UH.SetIcon(this.viewNode.HuoBiIcon, Item.GetIconId(this.up_data.item_id), ICON_TYPE.ITEM);
    }

    OnClickEvol() {
        let num = Item.GetNum(this.up_data.item_id)
        if(num < this.up_data.num)
        {
            let show_call = Item.Create({ item_id: this.up_data.item_id, num: this.up_data.num - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);

            PublicPopupCtrl.Inst().Center(Language.Pet.NoItemsForEvol)
            return 
        }

        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.GRADE_UP_EVO,this.view_param.index)

        ViewManager.Inst().CloseView(PetEvolView);
    }
}


export class PetEvolBtnEvol extends fgui.GButton {
    private viewNode = {
        icon: <fgui.GLoader>null,
        num: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetIcon(this.viewNode.icon, Item.GetIconId(data.item_id), ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.num, data.num);
    }
}


export class PetEvolAttr extends fgui.GComponent {
    private viewNode = {
        attr_type: <fgui.GLabel>null,
        attr_value: <fgui.GLabel>null,

        attr_next_type: <fgui.GLabel>null,
        attr_next_value: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }

        this.data = data
        UH.SetText(this.viewNode.attr_type, data.type);
        UH.SetText(this.viewNode.attr_value, AttrHelper.Percent( data.type, data.add));
        UH.SetText(this.viewNode.attr_next_type, data.type);
        UH.SetText(this.viewNode.attr_next_value, AttrHelper.Percent( data.type, data.next_add) );
    }
}

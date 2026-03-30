import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AngelFesView } from "modules/AngelFes/AngelFesView";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView"
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class GemAtelierPicUpView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierMixSure",
        ViewName: "GemAtelierPicUpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board:<CommonBoard3>null,
        AttrList:<fgui.GList>null,
        BtnSure:<fgui.GButton>null,
        Before:<ItemCell>null,
        After:<ItemCell>null,
        BeforeQua:<fgui.GLoader>null,
        BeforeDraw:<fgui.GLoader>null,
        AfterQua:<fgui.GLoader>null,
        AfterDraw:<fgui.GLoader>null,
        BLevelStr:<fgui.GLabel>null,
        ALevelStr:<fgui.GLabel>null,
    }
    protected extendsCfg = [
        { ResName: "DoneAttrItem", ExtendsClass:  GemAtelierDoneAttrItem }
    ];

    InitData(param:any) {
        this.viewNode.Board.SetData(new BoardData(GemAtelierPicUpView,param.name))
        this.viewNode.AttrList.SetData(param.attrList)

        // this.viewNode.Before.SetData(param.b_item)
        // this.viewNode.After.SetData(param.a_item)
        UH.SpriteName(this.viewNode.BeforeQua,"CommonAtlas","PinZhi"+param.b_color)
        UH.SetIcon(this.viewNode.BeforeDraw,Item.GetIconId(param.item_id),ICON_TYPE.ITEM)
        UH.SetText(this.viewNode.BLevelStr,Language.GemAtelier.LvShow+param.b_level)

        UH.SpriteName(this.viewNode.AfterQua,"CommonAtlas","PinZhi"+param.a_color)
        UH.SetIcon(this.viewNode.AfterDraw,Item.GetIconId(param.item_id),ICON_TYPE.ITEM)
        UH.SetText(this.viewNode.ALevelStr,Language.GemAtelier.LvShow+param.a_level)
        this.viewNode.BtnSure.onClick(this.OnClickConfirm, this);
    }

    OnClickConfirm() {
        ViewManager.Inst().CloseView(GemAtelierPicUpView);
    }
}


export class GemAtelierDoneAttrItem extends fgui.GComponent {
    private viewNode = {
        attr_type:<fgui.GLabel>null,
        attr_value:<fgui.GLabel>null,

        next_attr_type:<fgui.GLabel>null,
        next_value:<fgui.GLabel>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        UH.SetText(this.viewNode.attr_type, AttrListName[data.att_type] );
        UH.SetText(this.viewNode.attr_value, AttrHelper.Percent(data.att_type,data.att_value) );

        UH.SetText(this.viewNode.next_attr_type, AttrListName[data.att_type] );
        UH.SetText(this.viewNode.next_value, AttrHelper.Percent(data.att_type,data.next_value) );
    }
}
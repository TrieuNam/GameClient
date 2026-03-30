import { CfgNewSuperStar } from "config/CfgStarmap";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { AttrListName, Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { StarMapCtrl, STAR_MAP_REQ_TYPE } from "./StarMapCtrl";
import { StarMapSuperData } from "./StarMapSuperData";

// 新版超星系节点激活弹框
@BaseView.registView
export class StarMapSuperNodeActive extends BaseView {

    protected viewRegcfg = {
        UIPackName: "StarMapSuperNewChild",
        ViewName: "SuperNodeActive",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        CurType: <fgui.GTextField>null,
        NextType: <fgui.GTextField>null,
        CurAdd: <fgui.GTextField>null,
        NextAdd: <fgui.GTextField>null,
        BtnUp: <fgui.GButton>null,
        CostCell: <ItemCell>null,
        Name: <fgui.GTextField>null,
        CostCount: <fgui.GTextField>null,
    };

    private node:CfgNewSuperStar;

    InitData(param_t?: any) {
        this.node = param_t.node;
        this.viewNode.Board.SetData(new BoardData(StarMapSuperNodeActive,"激活" + this.node.star_name));
        this.viewNode.BtnUp.onClick(this.OnBtnClick.bind(this));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItem.bind(this), "OtherChange");
    }

    OpenCallBack() {
        let att = this.node.jihuo_att[0];
        let att_name = AttrListName[att.type] + ":";
        UH.SetText(this.viewNode.CurType, att_name);
        UH.SetText(this.viewNode.NextType, att_name);
        UH.SetText(this.viewNode.CurAdd, 0);
        UH.SetText(this.viewNode.NextAdd, AttrHelper.Percent(att.type, att.add));

        let cost_item = this.node.cost_item[0];
        this.viewNode.CostCell.SetData(Item.Create({ item_id: cost_item.item_id }, { is_click: true }));
        UH.SetText(this.viewNode.Name, Item.GetName(cost_item.item_id))
        this.FlushItem();
    }

    FlushItem(){
        let cost_item = this.node.cost_item[0];
        let item_num = Item.GetNum(cost_item.item_id);
        let cost_num = cost_item.num * StarMapSuperData.Inst().GetStuffMultiple(this.node.route);
        let item_color = item_num >= cost_num ? COLORSTR.Green4 : COLORSTR.Red1
        UH.SetText(this.viewNode.CostCount, TextHelper.ColorStr(item_num + "/" + cost_num, item_color))
    }

    CloseCallBack() {
        //StarMapSuperData.Inst().selNodeInfo.star_node = null
    }

    OnBtnClick(){
        let cost_item = this.node.cost_item[0];
        let item_num = Item.GetNum(cost_item.item_id);
        let cost_num = cost_item.num * StarMapSuperData.Inst().GetStuffMultiple(this.node.route);
        if(item_num < cost_num){
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(cost_item.item_id)
            return
        }
        StarMapCtrl.Inst().SendCSStarMapReq(STAR_MAP_REQ_TYPE.NEW_BIG_UP, {param1:this.node.route});
        ViewManager.Inst().CloseView(StarMapSuperNodeActive);
        AudioManager.Inst().Play(AudioTag.JiHuo);
    }
}
import { CfgNewSuperStar } from "config/CfgStarmap";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { StarMapCtrl, STAR_MAP_REQ_TYPE } from "./StarMapCtrl";
import { StarMapSuperData } from "./StarMapSuperData";

@BaseView.registView
export class StarMapSuperSkillActive extends BaseView {

    protected viewRegcfg = {
        UIPackName: "StarMapSuperNewChild",
        ViewName: "SuperNodeSkillActive",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        SkillDesc: <fgui.GTextField>null,
        ItemCell: <ItemCell>null,
        ItemName: <fgui.GTextField>null,
        NeedNum: <fgui.GTextField>null,
        BtnUp: <fgui.GButton>null,
    };

    private node:CfgNewSuperStar;
    InitData(param_t?: any) {
        this.node = param_t.node;
        this.viewNode.Board.SetData(new BoardData(StarMapSuperSkillActive,"激活" + this.node.star_name)); 
        this.viewNode.BtnUp.onClick(this.OnBtnClick.bind(this));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItem.bind(this), "OtherChange");
    }

    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        UH.SetText(this.viewNode.SkillDesc, this.node.star_txt);

        let cost_item = this.node.cost_item[0];
        this.viewNode.ItemCell.SetData(Item.Create({ item_id: cost_item.item_id }, { is_click: true }));
        UH.SetText(this.viewNode.ItemName, Item.GetName(cost_item.item_id));

        this.FlushItem();
    }

    CloseCallBack() {
        //StarMapSuperData.Inst().selNodeInfo.star_node = null;
    }

    FlushItem(){
        let cost_item = this.node.cost_item[0];
        let item_num = Item.GetNum(cost_item.item_id);
        let cost_num = cost_item.num * StarMapSuperData.Inst().GetStuffMultiple(this.node.route);
        let item_color = item_num >= cost_num ? COLORSTR.Green3 : COLORSTR.Red1;
        UH.SetText(this.viewNode.NeedNum, TextHelper.ColorStr(item_num + "/" + cost_num, item_color));
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
        ViewManager.Inst().CloseView(StarMapSuperSkillActive);
        AudioManager.Inst().Play(AudioTag.JiHuo);
    }
}
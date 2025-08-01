import { HorizontalTextAlignment } from "cc";
import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class AdvDoubleView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "AdvDoubleReward",
        ViewName: "AdvDoubleRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    private tip_data:AdvDoubleViewData;
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

     protected viewNode = {
        Board:<CommonBoard3> null,
        Cell:<ItemCell> null,
        Desc:<fgui.GTextField>null,
        BtnAdv:<fgui.GButton> null,
        BtnGet:<fgui.GButton> null,
    };

    /* protected extendsCfg = [
        { ResName: "组件名", ExtendsClass: 拓展类 }
    ]; */

    InitData(param: AdvDoubleViewData) {
        this.tip_data = param;
        this.viewNode.Board.SetData(new BoardData(AdvDoubleView, param.title));
        UH.SetText(this.viewNode.Desc, param.desc);
        this.viewNode.BtnAdv.onClick(this.OnClickAdv, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet, this);
        param.align && (this.viewNode.Desc.align = param.align)

        this.viewNode.Cell.SetData(Item.Create(param.show_item,{ is_click: true ,is_num: true}));
    }

    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }

    OnClickGet(){
        //直接领
        ViewManager.Inst().CloseView(AdvDoubleView);
        this.tip_data && this.tip_data.get_func && this.tip_data.get_func();
    }

    OnClickAdv(){
        //看广告领
        ViewManager.Inst().CloseView(AdvDoubleView);
        this.tip_data && this.tip_data.adv_func && this.tip_data.adv_func();
    }

}

export class AdvDoubleViewData {
    title: string;
    desc: string;
    show_item : CfgItem[]
    adv_func: Function;
    get_func: Function;
    align = HorizontalTextAlignment.CENTER;
    constructor(title: string, desc: string, show_item : CfgItem[] , adv_func: Function, get_func?: Function, align?: HorizontalTextAlignment) {
        this.title = title;
        this.desc = desc;
        this.show_item = show_item;
        this.adv_func = adv_func;
        this.get_func = get_func;

        this.align = align;
    }
}
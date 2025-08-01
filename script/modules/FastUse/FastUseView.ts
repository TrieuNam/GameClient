import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";
import { BagData } from "modules/bag/BagData";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { BoardData } from "modules/common_board/BoardData";
import { Language } from "modules/common/Language";
import { CfgItem } from "config/CfgCommon";

//使用多个物品 
@BaseView.registView 
export class FastUseView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FastUse",
        ViewName: "FastUseView",
        LayerType: ViewLayer.Normal,
        ViewMask:ViewMask.BgBlock
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnAdd: <fgui.GButton>null,
        BtnReduce: <fgui.GButton>null,
        BtnUse: <fgui.GButton>null,
        TxtNum: <fgui.GTextField>null,
        TxtDesc: <fgui.GTextField>null,
        Cell: <ItemCell>null,
    }

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    private _data: FastData;
    private fast_info: FastInfo;
    private max_num: number;
    private cur_num: number;
    private cfg:any;
    InitData(param: FastData) {
        this._data = param;
        this.cfg = Item.GetConfig(this._data.item_cost_id);
        this.viewNode.Cell.SetData(Item.Create(new CfgItem(this._data.item_cost_id, 1), { is_gray: false, is_click: false, is_num: false }));
        let max_num = Math.floor(BagData.Inst().getItemNum(param.item_cost_id) / param.item_cost_num);
        if (param.maxNum) {
            this.max_num = Math.min(max_num, param.maxNum);
        }
        let cfg_fast_info: string = this.cfg.use.split("|");
        this.fast_info = {title: cfg_fast_info[0], param_type: +cfg_fast_info[1], desc: cfg_fast_info[2], btn_text: cfg_fast_info[3],};
        this.viewNode.Board.SetData(new BoardData(FastUseView, this.fast_info.title));
        UH.SetText(this.viewNode.BtnUse.getTextField(), this.fast_info.btn_text);
        this.cur_num = this.max_num ;
        this.setDesc();
    }

    InitUI() {
        this.viewNode.BtnUse.onClick(this.onUse.bind(this));
        this.viewNode.BtnAdd.onClick(this.addNum.bind(this));
        this.viewNode.BtnReduce.onClick(this.reduceNum.bind(this));
    }

    public addNum() {
        if (this.cur_num >= this.max_num) {
            PublicPopupCtrl.Inst().Center(Language.FastUse.tip1);
            return
        }
        else {
            this.cur_num += 1;
            this.setDesc();
        }
    }

    public reduceNum() {
        if (this.cur_num <= 1) {
            PublicPopupCtrl.Inst().Center(Language.FastUse.tip2);
            return
        } else {
            this.cur_num -= 1;
            this.setDesc();
        }
    }

    private onUse() {
        if (this.cur_num > this.max_num || this.cur_num == 0) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(this._data.item_cost_id)
            return;
        }
        this._data.use_fun(this.cur_num);
        ViewManager.Inst().CloseView(FastUseView);
    }

    private setDesc() {
        let cfg = Item.GetConfig(this._data.item_cost_id);
        let param = cfg.param ? cfg.param : 1;
        let num = this.cur_num * param;
        let param_desc;
        if (this.fast_info.param_type == FastUseDataType.Time) {
            let time_t = TimeHelper.FormatDHMS(num * 60)
            param_desc = TextHelper.Format(Language.UiTimeMeter.TimeStr1, time_t.hour + (time_t.day*24), time_t.minute, time_t.second);
        } else {
            param_desc = num;
        }
        // UH.SetText(this.viewNode.TxtDesc, TextHelper.Format(this.fast_info.desc, param_desc))
        UH.SetText(this.viewNode.TxtDesc,  this.fast_info.desc+param_desc);
        UH.SetText(this.viewNode.TxtNum, this.cur_num + "/" + this.max_num);
    }
}

export class FastData {
    maxNum: number;//最大数量 为0则不限购
    item_cost_id: number;//目标物品
    item_cost_num: number;//兑换一个目标物品消耗的数量
    use_fun: Function;
    constructor(maxNum: number, item_cost_id: number, use_fun: Function,  item_cost_num = 1) {
        this.maxNum = maxNum;
        this.item_cost_id = item_cost_id;
        this.item_cost_num = item_cost_num;
        this.use_fun = use_fun;
    }
}

type FastInfo={
    title:string;
    btn_text:string;
    desc:string;
    param_type: FastUseDataType;
}

enum FastUseDataType {
    Common = 0,
    Time =1,
} 
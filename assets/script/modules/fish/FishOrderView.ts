import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { COLORSTR, QualityColorOLStr, QualityColorStr } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { Currency } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";

@BaseView.registView
export class FishOrderView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishOrder",
        ViewName: "FishOrderView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        OrderList: <fgui.GList>null,
        Currency: <Currency>null,

        TimeShow: <TimeMeter>null,
    };

    protected extendsCfg = [
        { ResName: "ItemOrder", ExtendsClass: FishOrderViewOrderItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(FishOrderView));
        this.viewNode.Currency.SetCurrencyId(FishData.Inst().CfgOtherShuaXinItem(), true);

        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoTaskInfo.bind(this), "WaBaoTaskInfo");
    }

    InitUI() {
        this.FlushWaBaoTaskInfo()
        this.FlushTimeShow()
    }

    CloseCallBack() {
        this.viewNode.TimeShow.CloseCountDownTime()
    }

    FlushTimeShow() {
        this.FlushOrderTimeShow();
    }

    FlushOrderTimeShow() {
        this.viewNode.TimeShow.CloseCountDownTime()
        if (TimeCtrl.Inst().tomorrowStarTime > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(TimeCtrl.Inst().tomorrowStarTime, TimeFormatType.TYPE_TIME_0, Language.Fish.FishOrder.TimeShow)
            this.viewNode.TimeShow.SetCallBack(this.FlushOrderTimeShow.bind(this))
        }
        else {
            this.viewNode.TimeShow.SetTime("")
        }
    }


    FlushWaBaoTaskInfo() {
        this.viewNode.OrderList.SetData(FishData.Inst().GetWaBaoTaskListShow())
    }

    OnClickArrow() {
        // LogError("OnClickArrow")
        // this.viewNode.AttrList.
    }
}

class FishOrderViewOrderItem extends BaseItem {
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        DescShow: <fgui.GTextField>null,
        ProgressShow: <fgui.GTextField>null,
        StarShow1: <fgui.GImage>null,
        StarShow2: <fgui.GImage>null,
        StarShow3: <fgui.GImage>null,
        StarShow4: <fgui.GImage>null,
        StarShow5: <fgui.GImage>null,
        GetedObj: <fgui.GImage>null,
        BtnFlush: <fgui.GButton>null,
        BtnGet: <fgui.GButton>null,
        CellShow: <ItemCell>null,
        RedPointShow: <RedPoint>null,
    };

    protected onConstruct() {
        super.onConstruct()
        this.viewNode.BtnFlush.onClick(this.OnClickFlush, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet, this);
    }

    public SetData(data: any) {
        super.SetData(data);
        let co = data.co
        let progress = data.progress
        let flag = data.flag
        let color = QualityColorStr[co.color];
        let color_ol = QualityColorOLStr[co.color];

        UH.SetText(this.viewNode.NameShow, TextHelper.RichTextOutLine(TextHelper.ColorStr(GetCfgValue(Language.Fish.BoxTypeShows, co.param_0) ?? Item.GetName(co.param_0), color), color_ol, 2))
        UH.SetText(this.viewNode.DescShow, TextHelper.Format(Language.Fish.FishOrder.DescShow, co.param_1, GetCfgValue(Language.Fish.BoxTypeShows, co.param_0) ?? Item.GetName(co.param_0)))
        UH.SetText(this.viewNode.ProgressShow, TextHelper.Format(Language.Fish.FishOrder.OrderProgressShow, TextHelper.ColorStr(progress, progress < co.param_1 ? COLORSTR.Red1 : COLORSTR.Yellow2), co.param_1))

        this.viewNode.CellShow.SetData(Item.Create(co.task_item[0], { is_num: true }))
        this.viewNode.GetedObj.visible = flag
        this.viewNode.BtnGet.visible = !flag
        this.viewNode.BtnGet.grayed = progress < co.param_1
        this.viewNode.BtnFlush.visible = !flag
        this.viewNode.RedPointShow.SetNum((!flag && progress >= co.param_1) ? 1 : 0)

        for (let i = 1; i <= 5; i++) {
            GetCfgValue(this.viewNode, "StarShow" + i).visible = co.color >= i
        }
    }

    OnClickFlush() {
        FishCtrl.Inst().SendWaBaoReqFreshTask(this._data.index);
    }

    OnClickGet() {
        FishCtrl.Inst().SendWaBaoReqFetchTask(this._data.index);
        let task_item = this._data.co.task_item[0]
        let co = this._data.co
        let progress = this._data.progress
        if (progress >= co.param_1) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Fish.FishOrder.GetTips, Item.GetName(task_item.item_id), task_item.num))
        }
    }
}
import { math } from "cc";
import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AdventureCtrl, ADVENTURE_OP_TYPE } from "modules/adventure/AdventureCtrl";
import { AdventureData } from "modules/adventure/AdventureData";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { ItemCell } from "modules/extends/ItemCell";
import { TimeMeter } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { ColorStr, TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { MingXiangFastFetchView } from "./MingXiangFastFetchView";

@BaseView.registView
export class MingXiangView extends BaseView {
    private max_time: number;
    private num = 0;

    private time_handle: any;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MingXiang",
        ViewName: "MingXiangView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Title: <fgui.GRichTextField>null,
        Cell: <ItemCell>null,
        ProBar: <fgui.GProgressBar>null,
        TxtTime: <fgui.GTextField>null,
        BtnFastFetch: <CommonButtonBuy>null,
        BtnFetch: <CommonButtonBuy>null,
        TxtNum: <fgui.GTextField>null,
    }

    InitData() {
        this.max_time = AdventureData.Inst().GetMingXiangMax()
        this.viewNode.Cell.SetData(Item.Create(new CfgItem(CommonId.Box)));
        this.AddSmartDataCare(AdventureData.Inst().ResultData, this.FlushAll.bind(this), "main_fb_info");
        this.viewNode.BtnFetch.onClick(this.OnFetch.bind(this));
        this.viewNode.BtnFastFetch.onClick(this.OnFastFetch.bind(this));
        this.FlushAll();
        this.time_handle = Timer.Inst().AddRunTimer(this.FlushTime.bind(this), 1, -1, false);
    }

    InitUI() {
    }

    private FlushAll() {
        let cfg = AdventureData.Inst().GetCurLvCfg();
        if (cfg) {
            let desc = TextHelper.Format(Language.MingXiang.Box, cfg.now_box);
            desc = TextHelper.RichTextOutLine(desc, COLORSTR.Yellow2, 2)
            UH.SetText(this.viewNode.Title, desc)
        }
        this.FlushTime();
        let max_time = AdventureData.Inst().GetMingXiangMax();
        let cur_time = TimeCtrl.Inst().ServerTime;
        let lastFetchTime = AdventureData.Inst().ResultData.main_fb_info.lastFetchTime;
        this.viewNode.BtnFetch.ShowRedPoint(cur_time >= lastFetchTime + max_time);
        this.viewNode.BtnFastFetch.ShowRedPoint(AdventureData.Inst().ResultData.main_fb_info.diaFetchNum == 0);
    }

    private FlushTime() {
        let data = AdventureData.Inst().ResultData.main_fb_info;
        if (data) {
            let cfg = AdventureData.Inst().GetCurLvCfg();
            if (cfg) {
                let cur_time = Math.floor(TimeCtrl.Inst().ServerTime) ;
                let time = Math.min(this.max_time, cur_time - data.lastFetchTime);
                this.num = Math.floor(time * cfg.now_box / 86400);
                time = Math.max(time, 0);
                this.num = Math.max(this.num, 0);
                this.viewNode.ProBar.max = this.max_time;
                UH.SetText(this.viewNode.TxtNum,this.num);
                UH.SetText(this.viewNode.TxtTime, TimeHelper.TimeformatDHMS(time));
                this.viewNode.ProBar.value = time;
            }
        }
    }

     CloseCallBack() {
        Timer.Inst().CancelTimer(this.time_handle);
    }

    private OnFetch() {
        if (this.num <= 0) {
            PublicPopupCtrl.Inst().Center(Language.MingXiang.NoTip);
            return;
        }
        let data = AdventureData.Inst().ResultData.main_fb_info;
        if (data) {
            AdventureCtrl.Inst().SendAdventureReq(ADVENTURE_OP_TYPE.FETCH_GUAJI)
        }
    }

    private OnFastFetch(){
        ViewManager.Inst().OpenView(MingXiangFastFetchView);
    }
}



import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { CommonButton } from "modules/extends/CommonButton";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { TodayShareData, TodayShareCtrl } from "./TodayShareCtrl";

export class TodayShareView extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        TodayStatus: <fgui.GLabel>null,
        reward_list: <fgui.GList>null,
        loaderBg: <fgui.GLoader>null,
        BtnShare: <CommonButtonBuy>null,
        BtnDouble: <CommonButton>null,
        RedPoint: <RedPoint>null,
        TwiceRedPoint: <RedPoint>null,
    }
    private handleCollector: HandleCollector;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        // 刷底图
        this.viewNode.loaderBg.SetIcon("loader/serveractivity/today_share", () => { })
        this.viewNode.reward_list.SetData(TodayShareData.Inst().GetRewardShow())
        this.viewNode.BtnShare.onClick(this.onBtnClick.bind(this));
        this.viewNode.BtnDouble.onClick(this.onBtnDoubleClick.bind(this));
        
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.TodayShare, 0)
        this.addSmartDataCare(TodayShareData.Inst().flush_info, this.flushinfo.bind(this));

        this.flushinfo()
        TodayShareCtrl.Inst().OnViewInit(true);
    }
    
    public flushinfo() {
        let btn_status = TodayShareData.Inst().GetTodayBtnStatus()
        this.viewNode.BtnShare.SetTitle(btn_status.str);
        // this.viewNode.BtnShare.title = btn_status.str
        this.viewNode.BtnShare.visible = btn_status.type < 2

        UH.SetText(this.viewNode.TodayStatus, TodayShareData.Inst().GetTodayStatus())
        let is_open_double = TodayShareData.Inst().IsOpenDouble()
        this.viewNode.RedPoint.SetNum(TodayShareData.Inst().GetRedNum())
        this.viewNode.TwiceRedPoint.SetNum(TodayShareData.Inst().GetRedNum())
        this.viewNode.TwiceRedPoint.visible = TodayShareData.Inst().IsShared() && is_open_double
        this.viewNode.BtnDouble.visible = TodayShareData.Inst().IsShared() && is_open_double
        this.viewNode.BtnShare.x = (TodayShareData.Inst().IsShared() && is_open_double) ? 94 : 272
        this.viewNode.RedPoint.x = TodayShareData.Inst().IsShared() && is_open_double ? 335 : 509
    }

    protected onDestroy(): void {
        super.onDestroy();
        TodayShareCtrl.Inst().OnViewInit(false);
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    private onBtnClick() {
        if (!TodayShareData.Inst().IsShared()) {
            LogError("?进行一个 分享操作")
            ChannelAgent.Inst().OnMessage(GameToChannel.arouseShare, ACTIVITY_TYPE.TodayShare + "");
        } else if (!TodayShareData.Inst().IsFetch()) {
            LogError("? 进行一个领取操作?")
            ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.TodayShare, 1)
        }
        else {
            PublicPopupCtrl.Inst().Center(Language.TodayShare.FetchDone);
        }
    }
    
    private onBtnDoubleClick() {
        ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.today_share_twice, Language.adv.today_share)
    }
}
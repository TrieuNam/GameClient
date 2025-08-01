import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { AdType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { KnightCardData } from "./KnightCardData";

@BaseView.registView
export class KnightCardView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "KnightCard",
        ViewName: "KnightCardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        BtnClose: <fgui.GButton>null,

        ShowItem: <KnightCardViewItem>null,
        ShowList: <fgui.GList>null,
        GpTime: <fgui.GList>null,
        TimeShow: <TimeMeter>null,
    };

    protected extendsCfg = [
        { ResName: "KnightCardItem1", ExtendsClass: KnightCardViewItem },
        { ResName: "KnightCardItem2", ExtendsClass: KnightCardViewItem },
    ];

    InitData() {
        this.viewNode.BtnClose.onClick(this.OnClickClose, this);

        this.AddSmartDataCare(KnightCardData.Inst().ResultData, this.FlushShow.bind(this), "Info");
        // KnightCardCtrl.Inst().SendRandActivityOperaReqInfo();
    }

    InitUI() {
        this.FlushShow();
    }

    CloseCallBack() {
        this.viewNode.TimeShow.CloseCountDownTime()
    }


    FlushShow() {
        let show_list = KnightCardData.Inst().GetKnightCardShowList()
        this.viewNode.ShowItem.SetData(show_list[0])
        this.viewNode.ShowList.SetData(show_list.slice(1, show_list.length))

        let info = KnightCardData.Inst().ResultData.Info
        this.viewNode.TimeShow.CloseCountDownTime()
        if (info.refreshTime > TimeCtrl.Inst().ServerTime) {
            this.viewNode.TimeShow.StampTime(info.refreshTime, TimeFormatType.TYPE_TIME_5, Language.KnightCard.TimeShow)
            this.viewNode.TimeShow.SetCallBack(this.FlushShow.bind(this))
        }
        this.viewNode.GpTime.visible = info.refreshTime > TimeCtrl.Inst().ServerTime
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(KnightCardView)
    }
}


class KnightCardViewItem extends BaseItem {
    protected viewNode = {
        DescShow: <fgui.GTextField>null,
        BtnGet: <fgui.GButton>null,
        CellShow: <ItemCell>null,
        Received: <fgui.GGraph>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnGet.onClick(this.OnClickGet, this);
    }

    public SetData(data: any) {
        super.SetData(data);
        let info_get = KnightCardData.Inst().GetKnightCardGet(data.seq)
        this.viewNode.BtnGet.grayed = !info_get.can_get
        this.viewNode.BtnGet.visible = !info_get.is_get;
        this.viewNode.Received.visible = info_get.is_get;
        this.viewNode.BtnGet.title = info_get.is_get ? Language.KnightCard.BtnGetedShow : Language.KnightCard.BtnGetShow;
        this.viewNode.CellShow.SetData(Item.Create(data.guanggao_item, { is_num: data.seq < 5 }))
        this.viewNode.DescShow.visible = (1 != data.seq) && !info_get.is_get;
        if (1 == data.seq) {
            this.viewNode.BtnGet.y = 58;
        }
    }

    public OnClickGet() {
        let info_get = KnightCardData.Inst().GetKnightCardGet(this._data.seq)
        if (info_get.can_get) {
            if (1 == this._data.seq) {
                RoleCtrl.Inst().ReqAdverReward(AdType.knight_card, 0, 0, true);
            } else {
                let reward = this._data.guanggao_item
                ChannelAgent.Inst().advert(GameToChannel.wx_advert, AdType.knight_card, TextHelper.Format(Language.adv.knight_card, Item.GetName(reward.item_id), reward.num));
            }
        } else {
            PublicPopupCtrl.Inst().Center(info_get.is_get ? Language.KnightCard.GetedTips : Language.KnightCard.GetNotTips)
        }
    }
}
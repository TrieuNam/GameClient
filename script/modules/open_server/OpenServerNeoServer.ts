import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { TimeFormatType, TimeMeter } from 'modules/extends/TimeMeter';
import { OpenServerData } from './OpenServerData';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { TimeHelper } from '../../helpers/TimeHelper';
import { ColorStr, TextHelper } from '../../helpers/TextHelper';
import { Language } from 'modules/common/Language';
import { UH } from '../../helpers/UIHelper';
import { ItemCell } from 'modules/extends/ItemCell';
import { COLORS } from 'modules/common/ColorEnum';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { OpenServerCtrl, BOX_OPEN_REQ_TYPE, NEO_SERVER_REQ_TYPE } from './OpenServerCtrl';
import { CommonId, ICON_TYPE } from 'modules/common/CommonEnum';
import { BagData } from 'modules/bag/BagData';
import { OrderCtrl, Order_Data, RechargeType } from 'modules/recharge/OrderCtrl';
import { Timer } from 'modules/time/Timer';
import { UIEffectShow } from 'modules/scene_obj_spine/UIEffectShow';
import { EGLoader } from 'modules/extends/EGLoader';
import { CommonButtonBuy } from 'modules/common_button/CommonButtonBuy';

export class OpenServerNeoServer extends fgui.GComponent {
    private viewNode = {
        Timer: <fgui.GLabel>null,
        timer: <TimeMeter>null,
        server_list: <fgui.GList>null,
        loader: <EGLoader>null,
    }
    private time_timer: any;
    private realtime = 0
    private cache_timer = 0
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        // this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this))//,this.FlushUpdateTime.bind(this));
        OpenServerData.Inst().ForceFlushNeoServer()

        // 刷底图
        this.viewNode.loader.SetIcon("loader/open_server/TeHuiPeiTu", () => { })
        this.viewNode.server_list.setVirtual()
    }

    onDestroy() {
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined;
        this.realtime = 0;
    }

    public flushinfo() {
        let param = OpenServerData.Inst().GetNeoServerParam()
        this.cache_timer = param.timer
        this.viewNode.server_list.SetData(param.server_list)

        this.FlushFlushTime()
    }

    private FlushFlushTime() {
        let time = this.cache_timer - TimeCtrl.Inst().ServerTime;

        this.realtime = 0;
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined
        if (time > 0) {
            this.time_timer = Timer.Inst().AddCountDownTT(
                this.FlushUpdateTime.bind(this, time),
                this.FlushFlushTime.bind(this),
                time, 1);
        }
    }

    private FlushUpdateTime(total_time: number) {
        let time = Math.max(total_time - this.realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);

        let hour_show = (time_t.hour == 0 && time > 0) ? 1 : time_t.hour 
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, hour_show);
        UH.SetText(this.viewNode.Timer, Language.OpenServer.TimeLimit + t_str)

        this.realtime = this.realtime + 1
    }
}

export class OpenServerNeoServerCell extends fgui.GComponent {
    private viewNode = {
        title: <fgui.GLabel>null,
        reward_list: <fgui.GList>null,
        btn_buy: <CommonButtonBuy>null,
        limited: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.btn_buy.onClick(this.OnClickBuy.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
        UH.SetText(this.viewNode.title, data.name_box)

        UH.SetText(this.viewNode.limited, Language.OpenServer.NeoServerLimitType[data.limit_type]
            + (data.buy_times - data.buyed_times) + "/" + data.buy_times)

        this.viewNode.limited.visible = data.buy_times > 0
        this.viewNode.reward_list.SetData(data.rewars_list)
        if ( data.price_type != 3){
            this.viewNode.btn_buy.SetIcon(true, "Item" + (data.price_type == 1 ? CommonId.Diamond : CommonId.Gold),"CommonAtlas");
        }else{
            this.viewNode.btn_buy.SetIcon(true, "RenMinBiZhongLv", "CommonButton");
        }
        this.viewNode.btn_buy.title = data.price_type != 3 ? data.buy_money : data.buy_money/10;
        let is_gray = !this.CheckCanBuy();
        this.viewNode.btn_buy.grayed = is_gray
        this.viewNode.btn_buy.playEffect(is_gray ? null : 4164061)
    }
    private CheckCanBuy() {
        if (this.data.buy_times == 0) {
            return true
        }
        else {
            return this.data.buyed_times < this.data.buy_times
        }

    }
    private CheckEnough() {
        if (this.data.buy_times == 0) {
            return true
        }
        if (this.data.price_type == 3) {
            return true
        }
        else {
            if (this.data.price_type == 1) {
                let num = BagData.Inst().getItemNum(CommonId.Diamond);
                return num > this.data.buy_money
            }
            else {
                let num = BagData.Inst().getItemNum(CommonId.Gold);
                return num > this.data.buy_money
            }
        }
    }

    private OnClickBuy() {
        if (!this.CheckCanBuy()) {
            PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoServerTimeError)
            return
        }

        if (!this.CheckEnough()) {
            PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoServerNeedError)
            return
        }

        if (this.data.price_type == 3) {
            let order_data = Order_Data.initOrder(
                this.data.seq,
                RechargeType.NEW_AREA_PREFERENTIAL,
                this.data.buy_money/10,
                this.data.buy_money,
                this.data.name_box);
            OrderCtrl.generateOrder(order_data);
        }
        else {
            let item_id = this.data.price_type == 3 ? 0 : (this.data.price_type == 1 ? CommonId.Diamond : CommonId.Gold)
            let num = BagData.Inst().getItemNum(item_id);
            if (num < this.data.buy_money) {
                PublicPopupCtrl.Inst().Center(Language.OpenServer.NeoShopbuyError)
                return
            }
            OpenServerCtrl.Inst().SendCSNewAreaPreferentialReq(NEO_SERVER_REQ_TYPE.BUY_GIFT, this.data.type)
        }

    }
}

// export class OpenServerNeoServerBtn extends fgui.GButton {
//     private viewNode = {
//         title: <fgui.GLabel>null,
//         icon: <fgui.GLoader>null,
//         direct: <fgui.GLabel>null,
//         EffectShow: <UIEffectShow>null,
//     }
//     protected onConstruct() {
//         super.onConstruct();
//         ViewManager.Inst().RegNodeIofo(this.viewNode, this);
//     }
//     public SetData(data: any) {
//         if (data == null) {
//             return;
//         }
//         this.data = data;
//         UH.SetText(this.viewNode.title, data.num)
//         if (data.item_id > 0) {
//             UH.SetIcon(this.viewNode.icon, data.item_id, ICON_TYPE.ITEM);
//         }
//         this.viewNode.icon.visible = data.item_id > 0
//         this.viewNode.direct.visible = data.item_id == 0
//     }

//     public playEffect(id?: number) {
//         this.viewNode.EffectShow.StopAllEff();
//         if (id) {
//             this.viewNode.EffectShow.PlayEff(id);
//         }
//     }
// }
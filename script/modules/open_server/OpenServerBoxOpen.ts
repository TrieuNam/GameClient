import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { TimeFormatType, TimeMeter } from 'modules/extends/TimeMeter';
import { OpenServerData } from './OpenServerData';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { TimeHelper } from '../../helpers/TimeHelper';
import { TextHelper } from '../../helpers/TextHelper';
import { Language } from 'modules/common/Language';
import { UH } from '../../helpers/UIHelper';
import { ItemCell } from 'modules/extends/ItemCell';
import { COLORSTR } from 'modules/common/ColorEnum';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { OpenServerCtrl, BOX_OPEN_REQ_TYPE } from './OpenServerCtrl';
import { Timer } from 'modules/time/Timer';
import { UIEffectShow } from 'modules/scene_obj_spine/UIEffectShow';
import { Item } from 'modules/bag/ItemData';
import { EGLoader } from 'modules/extends/EGLoader';

export class OpenServerBoxOpen extends fgui.GComponent {
    private viewNode = {
        Timer: <fgui.GLabel>null,
        timer: <TimeMeter>null,
        box_list: <fgui.GList>null,
        loader: <EGLoader>null,
    }
    private cache_timer = 0
    private time_timer: any;
    private realtime = 0
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        // this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this))//,this.FlushUpdateTime.bind(this));
        OpenServerData.Inst().ForceFlushBoxOpen()

        // 刷底图
        this.viewNode.loader.SetIcon("loader/open_server/KaiXiangPeiTu", () => { })
        this.viewNode.box_list.setVirtual()
    }
    public flushinfo() {
        let param = OpenServerData.Inst().GetBoxOpenParam()
        this.cache_timer = param.timer
        this.viewNode.box_list.SetData(param.box_list)

        for (var index in param.box_list) {

            let oper = param.box_list[index]
            if (oper.cur_num >= oper.type_num && !oper.is_get) {
                this.viewNode.box_list.scrollToView(Number(index), true, true);
                break
            }
        }
        // 

        this.FlushFlushTime()
    }
    onDestroy() {
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined;
        this.realtime = 0;
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


export class OpenServerBoxOpenCell extends fgui.GComponent {
    private viewNode = {
        title: <fgui.GLabel>null,
        progress: <OpenServerBoxOpenBoxProgress>null,
        Rewards: <ItemCell>null,
        btn_get: <fgui.GButton>null,
        got: <fgui.GImage>null,
        wait_eff: <UIEffectShow>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.btn_get.onClick(this.OnClickGet.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;

        UH.SetText(this.viewNode.title, TextHelper.Format(Language.OpenServer.BoxOpenType[data.type_box_num],
            TextHelper.ColorStr(data.type_num, COLORSTR.Green3)))

        this.viewNode.progress.max = data.type_num
        this.viewNode.progress.value = data.cur_num

        let cur_num_show = data.cur_num > data.type_num ? data.type_num : data.cur_num
        UH.SetText(this.viewNode.progress.viewNode.title, cur_num_show + "/" + data.type_num)
        this.viewNode.got.visible = data.is_get
        this.viewNode.btn_get.visible = !data.is_get
        this.viewNode.btn_get.grayed = !this.CheckComplete()
        this.viewNode.Rewards.SetData(Item.Create({ item_id: data.reward_item.item_id, num: data.reward_item.num }, { is_num: true, eff: this.CheckComplete() && !data.is_get ? 4164011 : null }))
        if (this.CheckComplete() && !data.is_get) {
            this.viewNode.wait_eff.PlayEff(4164011)
        } else {
            this.viewNode.wait_eff.StopEff(4164011)
        }

    }
    private CheckComplete() {
        return this.data.cur_num >= this.data.type_num
    }
    private OnClickGet() {
        if (!this.CheckComplete()) {
            PublicPopupCtrl.Inst().Center(Language.OpenServer.LimitError)
            return
        }

        OpenServerCtrl.Inst().SendCSLuckUnpackingReq(BOX_OPEN_REQ_TYPE.RECEIVE, this.data.type)
    }
}

export class OpenServerBoxOpenBoxProgress extends fgui.GProgressBar {
    public viewNode = {
        title: <fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
}
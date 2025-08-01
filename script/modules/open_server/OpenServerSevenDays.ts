import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { ViewManager } from 'manager/ViewManager';
import { ItemCell } from 'modules/extends/ItemCell';
import { OpenServerBoxOpenBoxProgress } from './OpenServerBoxOpen';
import { UH } from '../../helpers/UIHelper';
import { COLORSTR } from 'modules/common/ColorEnum';
import { Language } from 'modules/common/Language';
import { TextHelper } from '../../helpers/TextHelper';
import { UIModelShow } from 'modules/scene_obj_spine/UIModelShow';
import { OpenServerData } from './OpenServerData';
import { TimeFormatType, TimeMeter } from 'modules/extends/TimeMeter';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { TimeHelper } from '../../helpers/TimeHelper';
import { ResPath } from 'utils/ResPath';
import { MountData } from 'modules/mount/MountData';
import { Timer } from 'modules/time/Timer';
import { UIEffectShow } from 'modules/scene_obj_spine/UIEffectShow';
import { RedPoint } from 'modules/extends/RedPoint';

export class OpenServerSevenDays extends fgui.GComponent {
    private viewNode = {
        BtnGet: <fgui.GButton>null,
        day_1: <OpenServerSevenDaysCell>null,
        day_2: <OpenServerSevenDaysCell>null,
        day_3: <OpenServerSevenDaysCell>null,
        day_4: <OpenServerSevenDaysCell>null,
        day_5: <OpenServerSevenDaysCell>null,
        day_6: <OpenServerSevenDaysCell>null,
        day_7: <OpenServerSevenDaysDCell>null,
        Timer: <fgui.GLabel>null,
        timer: <TimeMeter>null,
        RedPoint: <RedPoint>null,
    }
    private time_timer: any;
    private realtime = 0
    private cache_timer = 0
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        OpenServerData.Inst().ForceFlushSevenDays()

        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;
    }
    onDestroy() {
        Timer.Inst().CancelTimer(this.time_timer);
        this.time_timer = undefined;
        this.realtime = 0;
    }
    public flushinfo() {
        let param = OpenServerData.Inst().GetSevenParam()
        this.cache_timer = param.timer

        for (var index in param.seven_list) {
            (this.viewNode as any)["day_" + (Number(index) + 1)].SetData(param.seven_list[index])
        }

        let num = OpenServerData.Inst().GetOpenServerRed(0)
        this.viewNode.RedPoint.SetNum(num)
        this.FlushFlushTime()
        this.viewNode.BtnGet.grayed = num == 0
        this.viewNode.BtnGet.title = num == 0 ? Language.OpenServer.SevensDaysDone : Language.OpenServer.SevensDaysWait
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

    private OnClickGet() {
        OpenServerData.Inst().TryGetSevenRewards()
    }
}

export class OpenServerSevenDaysCell extends fgui.GComponent {
    private viewNode = {
        wait_bg: <fgui.GImage>null,
        done_bg: <fgui.GImage>null,
        item_name: <fgui.GLabel>null,
        wait_days: <fgui.GLabel>null,
        done_days: <fgui.GLabel>null,
        ItemCell: <ItemCell>null,
        dones: <fgui.GImage>null,
        eff_show: <UIEffectShow>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;


        UH.SetText(this.viewNode.wait_days, TextHelper.Format(Language.OpenServer.SevensDayShow, data.days))
        UH.SetText(this.viewNode.done_days, TextHelper.Format(Language.OpenServer.SevensDayShow, data.days))

        this.viewNode.ItemCell.SetData(data.item)
        UH.SetText(this.viewNode.item_name, data.item.QuaName())

        this.viewNode.wait_bg.visible = !data.is_done
        this.viewNode.wait_days.visible = !data.is_done
        this.viewNode.done_days.visible = data.is_done
        this.viewNode.done_bg.visible = data.is_done

        this.viewNode.dones.visible = data.is_done
        this.viewNode.item_name.visible = !data.is_done

        if (data.is_can) {
            this.viewNode.eff_show.PlayEff(4164011)
        }
        else {
            this.viewNode.eff_show.StopEff(4164011)
        }
    }

    private CheckComplete() {
        return false
    }

}

export class OpenServerSevenDaysDCell extends fgui.GComponent {
    private viewNode = {
        wait_bg: <fgui.GImage>null,
        done_bg: <fgui.GImage>null,
        item_name: <fgui.GLabel>null,
        wait_days: <fgui.GLabel>null,
        done_days: <fgui.GLabel>null,
        // ItemCell:<ItemCell>null,
        model_show: <UIModelShow>null,
        dones: <fgui.GImage>null,
        eff_show: <UIEffectShow>null,
        eff_show2: <UIEffectShow>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            return;
        }
        this.data = data;


        UH.SetText(this.viewNode.wait_days, TextHelper.Format(Language.OpenServer.SevensDayShow, data.days))
        UH.SetText(this.viewNode.done_days, TextHelper.Format(Language.OpenServer.SevensDayShow, data.days))

        // this.viewNode.ItemCell.SetData(data.item)
        let cfg = MountData.Inst().GetAwakeCfgByItemid(data.item.item_id)
        if (cfg != null) {
            this.viewNode.model_show.setPath(ResPath.Ride(cfg.mount_res));
        }

        UH.SetText(this.viewNode.item_name, data.item.QuaName())
        this.viewNode.item_name.visible = !data.is_done

        this.viewNode.wait_bg.visible = !data.is_done
        this.viewNode.wait_days.visible = !data.is_done
        this.viewNode.done_days.visible = data.is_done
        this.viewNode.done_bg.visible = data.is_done

        this.viewNode.dones.visible = data.is_done

        if (data.is_done) {
            this.viewNode.eff_show.StopEff(4164123)
            this.viewNode.eff_show2.StopEff(4164042)
        }
        else {
            this.viewNode.eff_show.PlayEff(4164123)
            this.viewNode.eff_show2.PlayEff(4164042)
        }
    }

    private CheckComplete() {
        return false
    }

}
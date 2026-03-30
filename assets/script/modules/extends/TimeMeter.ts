import * as fgui from "fairygui-cc";
import { Language } from "modules/common/Language";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { ViewManager } from "manager/ViewManager";
import { HorizontalTextAlignment, VerticalTextAlignment } from "cc";
import { COLORSTR } from "modules/common/ColorEnum";
import { UH } from "../../helpers/UIHelper";
import { TimeType } from "modules/common/CommonEnum";

/* 
    //创建计时器
    StampTime------创建时间 传入时间戳类型   服务端时间戳倒计时 支持刷新回调和结束回调
    TotalTime------创建时间 传入时间长度类型 从多少秒开始倒计时 支持刷新回调和结束回调
    CreateRunTime--创建累加时间 计时器       从0开始计时       支持刷新回调和结束回调
    CreateRunTimestamp 同上，需传入时间戳类型
    CreateActTime--创建活动时间 传入活动类型 活动剩余时间倒计时 支持刷新回调和结束回调
    
    CloseCountDownTime 关闭计时器
    SetCallBack----设置结束回调 和 刷新回调（可不传）
    SetShowCallBack自定义处理时间格式的函数 回调 t 时间表

    SetTime--------外部设置文字
    Outline--------描边
    Align===HorizontalTextAlignment 水平对齐方式
    VerticalAlign===VerticalTextAlignment 垂直对齐方式

    NoneZero===Bool 时间格式默认加零补位，true时不加零
*/

export enum TimeFormatType {
    /** 00:00:00 */
    TYPE_TIME_0,
    /** 3时2分1秒 */
    TYPE_TIME_1,
    /** s     (真的只有秒，不带修饰) */
    TYPE_TIME_2,
    /** 3天2时1分 */
    TYPE_TIME_3,
    /** 3天2时 */
    TYPE_TIME_4,
    /** 3时2分 */
    TYPE_TIME_5,
    /* 00:00  分秒*/
    TYPE_TIME_6,
}

export class TimeMeter extends fgui.GLabel {

    //初始化
    private viewNode = {
        title: <fgui.GRichTextField>null
    }

    protected onConstruct(): void {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
        this.realtime = 0;
        this.outlineCfg = { use: false, color: "", width: 2 };
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.CloseCountDownTime();
    }

    //展示类型，需要显示的文字，结束文字
    private show_type: TimeFormatType;
    private format_text?: string;
    private end_text?: string;

    private show_func?: Function;
    private complete_func?: Function;
    private update_func?: Function;

    private time_timer: any;
    private realtime: number;
    private start_time: number;
    private end_time: number;
    private outlineCfg = { use: false, color: "", width: 2 };

    /* 时间戳类型 倒计时
        stamp_time:时间戳
        show_type:时间显示类型
        format_text:需要传递的文字
        end_text:时间结束需要显示的文字
    */
    public StampTime(stamp_time: number, show_type?: number, format_text?: string, end_text?: string) {
        let total_time = stamp_time - TimeCtrl.Inst().ServerTime;
        this.TotalTime(total_time, show_type, format_text, end_text);
    }

    /* 时间长度 倒计时
        total_time:总时间(秒)
        show_type:时间显示类型
        format_text:需要传递的文字
        end_text:时间结束需要显示的文字
    */
    public TotalTime(total_time: number, show_type?: number, format_text?: string, end_text?: string) {
        this.show_type = show_type ?? TimeFormatType.TYPE_TIME_0;
        this.format_text = format_text;
        this.end_text = end_text;
        this.CreateTime(total_time);
    }

    /* 累加时间的计时器
        start_time:开始时间   CreateRunTime(秒，默认0)  CreateRunTimestamp(时间戳)
        end_time:结束时间，不传为无限
        show_type:时间显示类型
        format_text:需要传递的文字
        end_text:时间结束需要显示的文字
    */
    public CreateRunTime(start_time?: number, end_time?: number, show_type?: number, format_text?: string, end_text?: string) {
        this.start_time = start_time ?? 0;
        this.end_time = end_time;

        this.show_type = show_type ?? TimeFormatType.TYPE_TIME_0;
        this.format_text = format_text;
        this.end_text = end_text;

        this.CloseCountDownTime();
        this.time_timer = Timer.Inst().AddRunTimer(() => {
            this.SetTimeTransform(this.start_time);
            if (this.update_func != undefined) {
                this.update_func();
            }
            if (this.end_time != undefined && this.start_time >= this.end_time) {
                this.completeCallBack();
                Timer.Inst().CancelTimer(this.time_timer);
                this.time_timer = undefined;
            }
            this.start_time += 1;
        }, 1, end_time);
    }

    public CreateRunTimestamp(start_time: number, end_time?: number, show_type?: number, format_text?: string, end_text?: string) {
        start_time = Math.max(start_time - TimeCtrl.Inst().ServerTime, 0);
        if (end_time != undefined) {
            end_time = Math.max(end_time - TimeCtrl.Inst().ServerTime, 0);
        }
        this.CreateRunTime(start_time, end_time, show_type, format_text, end_text);
    }

    /* 创建活动时间倒计时
        act_type:活动号
        show_type:时间显示类型
        format_text:需要传递的文字
        end_text:时间结束需要显示的文字
    */
    public CreateActTime(act_type: number, show_type?: number, format_text?: string, end_text?: string) {
    }

    private CreateTime(total_time: number) {
        this.CloseCountDownTime();
        this.time_timer = Timer.Inst().AddCountDownTT(this.updateTime.bind(this, total_time), this.completeCallBack.bind(this), total_time, 1);
    }
    private updateTime(total_time: number) {
        this.SetTimeTransform(total_time - this.realtime);
        if (this.update_func != undefined) {
            this.update_func(this.realtime, total_time);
        }
        this.realtime += 1;
    }
    private completeCallBack() {
        if (this.complete_func != undefined) {
            this.complete_func();
        }
    }

    private SetTimeTransform(time: number) {
        time = Math.max(time, 0);
        let time_t = TimeHelper.FormatDHMS(time);
        let t_str = this.show_func != undefined ? this.show_func(time_t) : this.GetFormatTime(time_t, time);
        if (this.format_text != undefined && this.format_text != "") {
            let temp_str = TextHelper.Format(this.format_text, t_str);
            t_str = temp_str == this.format_text ? temp_str + t_str : temp_str;
        }

        if (time == 0 && this.end_text != undefined) {
            this.uiText = this.end_text;
        }
        else {
            this.uiText = t_str;
        }
    }

    private set uiText(value: string) {
        if(this.viewNode.title && this.viewNode.title._richText && this.viewNode.title._richText._updateRichTextStatus){
            if (this.outlineCfg.use) {
                value = TextHelper.RichTextOutLine(value, this.outlineCfg.color, this.outlineCfg.width);
            }
            UH.SetText(this.viewNode.title, value);
        }
    }

    /** 停止计时器 */
    public CloseCountDownTime() {
        if (this.time_timer != undefined) {
            Timer.Inst().CancelTimer(this.time_timer);
            this.time_timer = undefined;
            this.realtime = 0;
        }
    }

    /** 设置完成/更新回调
     * @param complete_func 完成回调
     * @param update_func 更新回调
     */
    public SetCallBack(complete_func?: Function, update_func?: Function) {
        this.complete_func = complete_func;
        this.update_func = update_func;
    }

    /** 设置自处理时间显示回调 */
    public SetShowCallBack(show_func?: Function) {
        this.show_func = show_func;
    }

    /** 外部修改文本 */
    public SetTime(text: string) {
        this.CloseCountDownTime();
        this.uiText = text;
    }

    //是否有描边 use:true显示，color:COLORSTR.XX
    public SetOutline(use: boolean, color: string = COLORSTR.White, width: number = 2) {
        this.outlineCfg.use = use;
        this.outlineCfg.color = color;
        this.outlineCfg.width = width;
    }

    //设置水平对齐方式 默认居中
    public set Align(value: HorizontalTextAlignment) {
        this.viewNode.title.align = value;
    }
    //设置垂直对齐方式 默认居中
    public set VerticalAlign(value: VerticalTextAlignment) {
        this.viewNode.title.verticalAlign = value;
    }

    //加零处理
    private none_zero: boolean = false;
    public set NoneZero(value: boolean) {
        this.none_zero = value;
    }

    private GetFormatTime(time_t: { day: number, hour: number, minute: number, second: number }, time: number): string {
        let t_str = "";
        if (this.show_type == TimeFormatType.TYPE_TIME_0) {
            t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr2, this.D2(time_t.hour + (time_t.day * 24)), this.D2(time_t.minute), this.D2(time_t.second));
        }
        else if (this.show_type == TimeFormatType.TYPE_TIME_1) {
            t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr3, this.D2(time_t.hour + (time_t.day*24)), this.D2(time_t.minute), this.D2(time_t.second));
        } else if (this.show_type == TimeFormatType.TYPE_TIME_2) {
            t_str = (time_t.hour * TimeType.TIME_HOUR_SECOND_NUM + time_t.minute * TimeType.TIME_MINUTE_SECOND_NUM + time_t.second).toString();
        }
        else if (this.show_type == TimeFormatType.TYPE_TIME_3) {
            t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr4, time_t.day, this.D2(time_t.hour), this.D2(time_t.minute));
        }
        else if (this.show_type == TimeFormatType.TYPE_TIME_4) {
            let hour = time_t.hour ? time_t.hour : 1;                
            t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr5, time_t.day, this.D2(hour));
        }
        else if (this.show_type == TimeFormatType.TYPE_TIME_5) {
            if (time_t.minute!=0)
                t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr7, this.D2(time_t.hour + (time_t.day * 24)), this.D2(time_t.minute));
            else
                t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr8, this.D2(time_t.minute), this.D2(time_t.second));
        }
        else if(this.show_type == TimeFormatType.TYPE_TIME_6){
            t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr9, this.D2(time_t.minute), this.D2(time_t.second));
        }
        return t_str;
    }

    private D2(value: number): string {
        return (this.none_zero == false && value < 10) ? "0" + value.toString() : value.toString();
    }

}
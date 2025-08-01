import { LogError } from 'core/Debugger';
import { HandleCollector } from 'core/HandleCollector';
import { Singleton } from 'core/Singleton';
import { LooperHandle } from 'data/HandleCollectorCfg';
import { Looper } from 'manager/Looper';
import { TimeCtrl } from './TimeCtrl';
export type TYPE_TIMER = { time: number }
//-----------导航至静态方法
//-----------导航至计时器
//刷新函数(UpdateTime) 比如 Timer.Inst().AddCountDownTT(update_func, complete_func, total_time, interval, init_call)
export class Timer extends Singleton {
    private handleCollector: HandleCollector;
    private func_list: Map<any, any>;

    constructor() {
        super();
        this.handleCollector = HandleCollector.Create();
        this.handleCollector.Add(LooperHandle.Create(this.Update.bind(this)));
        this.func_list = new Map<any, any>();
    }

    protected onDestroy() {
        super.onDestroy();
        HandleCollector.Destory(this.handleCollector);
        this.handleCollector = null;
    }

    private Update() {
        let do_list: any[] = [];
        let comp_list: any[] = [];
        let delete_list: any[] = [];

        this.func_list.forEach((info, handle) => {
            if (info[3] != undefined) {
                //计时器(用客户端时间)
                if (info[4] != undefined) {
                    if (this.ClientTime > info[4]) {
                        comp_list.push(info[3])
                        info[2] = 0;
                    }
                }
                //计时器(用服务器时间)
                if (info[5] != undefined) {
                    if (TimeCtrl.Inst().ServerTime > info[5]) {
                        comp_list.push(info[3])
                        info[2] = 0
                    }
                }
            }
            if (info[2] != undefined) {
                //[0,func][1,延迟时间][2,调用次数]
                if (this.ClientTime > handle.time) {
                    handle.time = handle.time + info[1]
                    do_list.push(info[0]);
                    if (info[2] > 0) {
                        info[2] -= 1;
                    }
                }
                if (0 === info[2]) {
                    delete_list.push(handle);
                }
            }
            else {
                //刷帧[0,func][1,次数][4,间隔时间]
                if (info[4] != undefined && info[1] - info[4] > 0) {
                    info[1] -= info[4];
                    do_list.push(info[0]);
                }
                else {
                    info[1] -= 1;
                }
                if (info[1] <= 0) {
                    comp_list.push(info[0])
                    delete_list.push(handle);
                }
            }
        })
        do_list.forEach((value: Function) => {
            value();
        })
        comp_list.forEach((value: Function) => {
            value();
        })
        delete_list.forEach((handle) => {
            this.CancelTimer(handle);
        })
    }

    private get ClientTime() {
        return TimeCtrl.Inst().ClientTime;
    }

    private new_ht(interval: number): { time: number } {
        return { time: TimeCtrl.Inst().ClientTime + interval };
    }

    //禁止使用
    /*
    //延迟frame_count帧执行func
    public AddDelayFrameTimer(func: Function, frame_count: number = 0): any {
        let handle = { frame_count: Looper.Inst().FrameCount + frame_count };
        this.func_list.set(handle, [func, frame_count]);
        return handle;
    }

    //延迟delay_time秒执行func
    public AddDelayTimer(func: Function, delay_time: number): any {
        let handle = this.new_ht(delay_time);
        this.func_list.set(handle, [func, delay_time, 1]);
        return handle;
    }
    */

    //-----------导航至计时器
    /**
     * 间隔interval秒执行一次func 
     * @param func 执行回调
     * @param interval 间隔 x 秒
     * @param times 次数
     * @param init_call 注册执行 默认为true
    */
    public AddRunTimer(func: Function, interval: number, times?: number, init_call?: boolean): TYPE_TIMER {
        let handle = this.new_ht(interval);
        this.func_list.set(handle, [func, interval, times ?? -1]);
        if (init_call == undefined || init_call) {
            func();
        }
        return handle;
    }

    //每间隔interval帧执行一次func [times总帧数（可能有1帧误差不用于做详细计算）]
    public AddRunFrameTimer(func: Function, interval: number, times?: number, init_call?: boolean): any {
        let handle = { frame_count: Looper.Inst().FrameCount };
        this.func_list.set(handle, [func, times ?? 1, undefined, undefined, interval]);
        if (init_call == undefined || init_call) {
            func();
        }
        return handle;
    }
    //AddCountDownTT 和 AddCountDownCT 区别是前者不受服务器时间影响,后者反之
    //TT理解为total_time   CT理解为complete_time
    //AddCountDownTT (每隔interval时间执行一次func,直到达到 total_time 自动注销,interval 默认为1,init_call 为true注册时执行一次update_func,默认为true)
    public AddCountDownTT(update_func: Function, complete_func: Function, total_time: number, interval?: number, init_call?: boolean): any {
        if (update_func == undefined || complete_func == undefined || total_time == undefined) {
            LogError("AddCountDownTT error");
            return undefined;
        }
        interval = interval ?? 1;
        let handle = this.new_ht(interval);
        this.func_list.set(handle, [update_func, interval, -1, complete_func, total_time + this.ClientTime])
        if (init_call == undefined || init_call) {
            update_func();
        }
        return handle;
    }

    public AddCountDownCT(update_func: Function, complete_func: Function, complete_time: number, interval?: number, init_call?: boolean): any {
        if (update_func == undefined || complete_func == undefined || complete_time == undefined) {
            LogError("AddCountDownTT error");
            return undefined;
        }
        interval = interval ?? 1;
        let handle = this.new_ht(interval);
        this.func_list.set(handle, [update_func, interval, -1, complete_func, undefined, complete_time])
        if (init_call == undefined || init_call) {
            update_func();
        }
        return handle;
    }

    //CancelTimer 传入注册前面4种Timer返回的时间句柄可以手动注销
    public CancelTimer(handle: any) {
        if (handle == undefined || handle == null)
            return;
        if (this.func_list.has(handle)) {
            this.func_list.delete(handle);
        }
    }

}


import { HandleBase, HandleCollector } from "core/HandleCollector";
import { ObjectPool } from "core/ObjectPool";
import { Looper } from "manager/Looper";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { Timer } from "modules/time/Timer";
import { DecoratorUtil, getName } from "utils/DecoratorUtil";
import { SmartDatRouter } from "./SmartData";

@DecoratorUtil.registClassName("SMDHandle")
export class SMDHandle extends HandleBase {
    smdata: any;
    keys: string[];

    static Create(smdata: any, func: Function, ...keys: string[]): HandleBase {
        let re = ObjectPool.Get(SMDHandle);
        re.init(func, null);
        re.smdata = smdata;
        re.keys = keys;
        return re;
    }

    onPoolReset(): void {
        super.onPoolReset();
        this.smdata = null;
        this.keys = null;
    }
}

@DecoratorUtil.registClassName("LooperHandle")
export class LooperHandle extends HandleBase {
    static Create(func: Function): HandleBase {
        let re = ObjectPool.Get(LooperHandle);
        re.init(func, null);
        return re;
    }
}

@DecoratorUtil.registClassName("RemindRegister")
export class RemindRegister extends HandleBase {
    modkey: number;
    smdata: any;
    keys: string[];

    static Create(modkey: number, origin: any, func: Function, ...keys: string[]) {
        let re = ObjectPool.Get(RemindRegister);
        re.init(func, null);
        re.modkey = modkey;
        re.smdata = origin;
        re.keys = keys;
        return re;
    }

    onPoolReset(): void {
        super.onPoolReset();
        this.modkey = null;
        this.smdata = null;
        this.keys = null;
    }
}

@DecoratorUtil.registClassName("RemindGroupMonitor")
export class RemindGroupMonitor extends HandleBase {
    group_id: any;
    init_call?: boolean;

    static Create(group_id: any, func: Function, init_call?: boolean) {
        let re = ObjectPool.Get(RemindGroupMonitor);
        re.init(func, null);
        re.group_id = group_id;
        re.init_call = init_call ?? true;
        return re;
    }

    onPoolReset(): void {
        super.onPoolReset();
        this.group_id = null;
        this.init_call = null;
    }
}

@DecoratorUtil.registClassName("FrameTimerHandle")
export class FrameTimerHandle extends HandleBase {
    interval : number;
    times : number;
    init_call : boolean;

    static Create(func: Function,interval:number,times?:number, init_call?: boolean) {
        let re = ObjectPool.Get(FrameTimerHandle);
        re.init(func, null);
        re.interval = interval;
        re.times = times ?? 1;
        re.init_call = init_call ?? true;
        return re;
    }
}

@DecoratorUtil.registClassName("CountDownTTTimerHandle")
export class CountDownTTTimerHandle extends HandleBase {
    interval : number;
    totalTime : number;
    init_call : boolean;
    completeFunc : Function;

    static Create(updateFunc: Function,comFunc:Function,totalTime:number,interval?:number, init_call?: boolean) {
        let re = ObjectPool.Get(CountDownTTTimerHandle);
        re.init(updateFunc, null);
        re.completeFunc = comFunc;
        re.interval = interval;
        re.totalTime = totalTime;
        re.init_call = init_call;
        return re;
    }
}


HandleCollector.SetCfg({
    [getName(SMDHandle)]: {
        register: function (handle: SMDHandle) {
            handle.handle = SmartDatRouter.AddDataCare(handle.smdata, handle.BindFunc, ...handle.keys);
        },
        unregister: function (handle: SMDHandle) {
            SmartDatRouter.RemoveDataCare(handle.handle);
        }
    },
    [getName(LooperHandle)]: {
        register: function (handle: LooperHandle) {
            handle.handle = Looper.Inst().BeginLoop(handle.BindFunc);
        }
        ,
        unregister: function (handle: LooperHandle) {
            Looper.Inst().StopLoop(handle.BindFunc);
        }
    },
    [getName(RemindRegister)]: {
        register: function (handle: RemindRegister) {
            handle.handle = RemindCtrl.Inst().Register(handle.modkey, handle.smdata, handle.BindFunc, ...handle.keys);
        },
        unregister: function (handle: RemindRegister) {
            RemindCtrl.Inst().UnRegister(handle.modkey, handle.handle);
        }
    },
    [getName(RemindGroupMonitor)]: {
        register: function (handle: RemindGroupMonitor) {
            handle.handle = RemindCtrl.Inst().RegisterGroup(handle.group_id, handle.BindFunc, handle.init_call);

        },
        unregister: function (handle: RemindGroupMonitor) {
            RemindCtrl.Inst().UnRegisterGroup(handle.group_id, handle.handle);
        }
    },
    [getName(FrameTimerHandle)]: {
        register: function (handle: FrameTimerHandle) {
            handle.handle = Timer.Inst().AddRunFrameTimer(handle.BindFunc, handle.interval, handle.times,handle.init_call);

        },
        unregister: function (handle: FrameTimerHandle) {
            Timer.Inst().CancelTimer(handle.handle);
        }
    },
    [getName(CountDownTTTimerHandle)]: {
        register: function (handle: CountDownTTTimerHandle) {
            handle.handle = Timer.Inst().AddCountDownTT(
                handle.BindFunc,()=>{
                    handle.removeSelfFromCollector();
                    handle.completeFunc();
                },handle.totalTime, handle.interval,handle.init_call);
        },
        unregister: function (handle: CountDownTTTimerHandle) {
            Timer.Inst().CancelTimer(handle.handle);
        }
    },

})
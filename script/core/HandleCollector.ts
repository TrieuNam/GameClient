import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { DecoratorUtil, getName } from "utils/DecoratorUtil";

@DecoratorUtil.registClassName("HandleBase")
export class HandleBase implements IPoolObject {
    key: string;
    func: Function;
    target: any = null;
    handle: any;
    collector : HandleCollector;
    private bindFunc: Function = null;
    protected init(func: Function, target: any) {
        // this.key = key;
        this.func = func;
        this.target = target;
    }

    get KeyName() {
        return getName(this.constructor);
    }

    get BindFunc() {
        if (!this.bindFunc) {
            if (this.target) {
                this.bindFunc = this.func.bind(this.target);
            }
            else {
                this.bindFunc = this.func;
            }
        }
        return this.bindFunc;
    }
    static D(self: HandleBase) {
        ObjectPool.Push(self);
    }
    removeSelfFromCollector(){
        if(this.collector && this.key != null && this.key !=undefined){
            this.collector.KeyRemove(this.key);
        }
    }
    onPoolReset(): void {
        this.key = null;
        this.func = null;
        this.target = null;
        this.handle = null;
        this.bindFunc = null;
        this.collector = null;
    }

}
type HandleCollectorCfg = {
    register: (han: HandleBase) => void,
    unregister: (han: HandleBase) => void,
}

type HandleCollectorCfgs = { [key: string]: HandleCollectorCfg };


export class HandleCollector implements IPoolObject {
    private static cfg: HandleCollectorCfgs;
    public static SetCfg(cfg: HandleCollectorCfgs) {
        HandleCollector.cfg = cfg;
    }

    public static Create() {
        return ObjectPool.Get(HandleCollector);
    }

    public static Destory(collector: HandleCollector) {
        ObjectPool.Push(collector);
    }



    private keyHandles = new Map<string, HandleBase>();
    private handles = new Set<HandleBase>();

    constructor() {

    }

    public RemoveAll() {
        for (let han of this.keyHandles.values()) {
            this.unregisterHandle(han);
            HandleBase.D(han);
        }
        this.keyHandles.clear();
        for (let han of this.handles) {
            this.unregisterHandle(han);
            HandleBase.D(han);
        }
        this.handles.clear();
    }

    public Add(handle: HandleBase) {
        this.registerHandle(handle);
        this.handles.add(handle);
    }

    public KeyAdd(key: string, handle: HandleBase) {
        handle.collector = this;
        handle.key = key;
        if (this.keyHandles.has(key)) {
            let oldHan = this.keyHandles.get(key);
            if (oldHan == handle) {
                //重复添加相同的handle，报错
            }
            else {
                this.unregisterHandle(oldHan);
                HandleBase.D(oldHan);
            }
        }
        this.registerHandle(handle);
        this.keyHandles.set(key, handle);
    }

    public KeyRemove(key: string) {
        if (!this.keyHandles.has(key)) {
            return;
        }
        let handle = this.keyHandles.get(key);
        this.keyHandles.delete(key);
        this.unregisterHandle(handle);
        HandleBase.D(handle);
    }

    private static getCfg(handleName: string) {
        return HandleCollector.cfg[handleName];
    }

    onPoolReset() {
        this.RemoveAll();
    }

    private registerHandle(handle: HandleBase) {
        let c = HandleCollector.getCfg(handle.KeyName);
        c.register(handle);
    }

    private unregisterHandle(handle: HandleBase) {
        let c = HandleCollector.getCfg(handle.KeyName);
        c.unregister(handle);
    }


}



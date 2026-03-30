import { IPoolObject, ObjectPool } from "core/ObjectPool";
import { Singleton } from "core/Singleton";
import { ResManager } from "manager/ResManager";
import { Timer } from "modules/time/Timer";
import { CommonEvent } from "./CommonEvent";
import { EventCtrl } from "./EventCtrl";

export class QuoteCtrl extends Singleton {
    // private _objWeakMap = new WeakMap();
    private _objQuote: { [key: string]: QuteItem } = {}
    static c_time = 20;
    constructor() {
        super();
        Timer.Inst().AddRunTimer(this.onRefurbish.bind(this), QuoteCtrl.c_time, -1, false);
    }

    onRefurbish() {
        for (const key in this._objQuote) {
            this.clean(key);
        }        
    }

    /**清理资源 会触发fgui package释放 */
    clean(key: string) {
        const element = this._objQuote[key];
        if (element._count <= 0) {
            delete this._objQuote[key];
            ObjectPool.Push(element);
        }
    }

    Add(key: string, type: CommonEvent) {
        let obj = this._objQuote[key];
        if (!obj) {
            this._objQuote[key] = obj = new QuteItem(key, type);
        }
        obj._count += 1;
    }

    Has(key: string): boolean {
        return this._objQuote[key] != undefined;
    }

    Remove(key: string) {
        let obj = this._objQuote[key];
        if (obj) {
            return obj.onDestory()
        }
    }

    /**移除依赖资源 */
    RemoveRef(key: string) {
        if (this.Remove(key)) {
            if (!ResManager.Inst().hasPackage(key)) {
                this.clean(key)
            }
        }
    }
}

export class QuteItem implements IPoolObject {
    reInit(key: string, type: CommonEvent): void {
        this._key = key;
        this._type = type;
    }
    onPoolReset(): void {
        this._count = 0;
        if (ResManager.Inst().hasPackage(this._key)) {
            EventCtrl.Inst().emit(this._type, this._key);
        }
        this._key = undefined;
        this._type = undefined;
    }
    constructor(key: string, type: CommonEvent) {
        this.reInit(key, type);
    }
    private _key: string;
    private _type: CommonEvent;
    _count: number = 0;
    onDestory() {
        this._count -= 1;
        if (this._count <= 0) {
            return true;
        }
        return false
    }
}

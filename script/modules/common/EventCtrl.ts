import { EventTarget } from "cc";
import { BagCtrl } from "modules/bag/BagCtrl"
import { CommonEvent } from "./CommonEvent";

export class EventCtrl extends BagCtrl {
    private _eventTarget = new EventTarget();

    on<TFunction extends (...any: any[]) => void>(type: CommonEvent, callback: TFunction, thisArg?: any, once?: boolean) {
        this._eventTarget.on(type, callback, thisArg, once);
    }
    off<TFunction extends (...any: any[]) => void>(type: CommonEvent, callback?: TFunction, thisArg?: any): void {
        this._eventTarget.off(type, callback, thisArg);
    }
    emit(type: CommonEvent, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any): void {
        this._eventTarget.emit(type, arg0, arg1, arg2, arg3, arg4);
    }
}
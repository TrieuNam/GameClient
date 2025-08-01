
// import { _decorator, Component, Node } from 'cc';

import { Debugger } from "./Debugger";

export class Singleton {
    static Inst<T extends {}>(this: new () => T): T {
        if (!(<any>this).instance) {
            (<any>this).instance = new this();
        }
        return (<any>this).instance;
    }

    constructor() {
        Debugger.ExportForDebug(this.constructor);
    }

    static Destroy() {
        if ((<any>this).instance) {
            (<any>this).instance.onDestroy();
            (<any>this).instance = null;
        }
    }

    protected onDestroy() {

    }
}
// export function singleton(name:string){
//     return function (target : Function){
//         // typeof(target).Inst = function(){
//         //     // let a = name;
//         //     let sig = (<any>globalThis)[name]
//         //     return sig;
//         // };
//         target.prototype.Inst = function(){
//             // let a = name;
//             let sig = (<any>globalThis)[name]
//             return sig;
//         }
//         return target;
//     }
// }





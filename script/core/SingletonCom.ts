import { Component } from "cc";
import { Debugger } from "core/Debugger";

export class SingletonCom extends Component {
    static Inst<T extends Component>(this: new () => T): T {
        return (<any>this).instance;
    }
    constructor() {
        super();

    }

    onLoad() {
        if (!(<any>this.constructor).instance) {
            (<any>this.constructor).instance = this;
        }
        else {
            console.error(`Single Create Twice:${this.constructor.name}`)
        }
        Debugger.ExportForDebug(this.constructor);
    }

    onDestroy() {
        if ((<any>this.constructor).instance == this) {
            (<any>this.constructor).instance = null;
        }
    }
}

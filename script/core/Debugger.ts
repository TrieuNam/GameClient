import { DEBUG } from 'cc/env';

export class Debugger {
    static LogError(msg: string, obj?: any) {
        if (obj != null) {
            console.error(`[${obj.constructor.name}] ERROR:${msg}`, obj);
        }
        else {
            console.error(msg);
        }
    }
    static ObjectToString(obj: any) {
        let keys = Object.getOwnPropertyNames(obj);
        let str = "{\n";
        for (let k of keys) {
            str = `${str}\t[${k}] = ${obj[k]}\n`
        }
        str = `${str}}`;
        return str;
    }
    static ExportForDebug(cons: Function) {
        // if (DEBUG) {
        //     (<any>globalThis)[cons.name] = cons;
        // }
    }
    static ExportGlobalForDebug(name: string, obj: any) {
        // if (DEBUG) {
        //     (<any>globalThis)[name] = obj;
        // }
    }
}

export function LogError(...objs: any[]) {
    if (DEBUG) {
        console.error(objs);
    }
}
export function Log(...objs: any) {
    if (DEBUG) {
        console.log(...objs);
    }
}
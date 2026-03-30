import { smartdata, SMDTriggerNotify } from "./SmartData";

export class SMDMap<K, V> extends Map
{

    @smartdata
    changeFlag = false;

    set(key: K, value: V): this {
        let oldV = this.get(key);
        let re = super.set(key, value);
        if (value !== oldV) {
            SMDTriggerNotify(this);
        }
        return re;
    }
    clear(): void {
        if (this.size > 0) {
            super.clear();
            SMDTriggerNotify(this);
        }
    }
    delete(key: K): boolean {
        let re = super.delete(key);
        if (re) {
            SMDTriggerNotify(this);
        }
        return re;
    }
}

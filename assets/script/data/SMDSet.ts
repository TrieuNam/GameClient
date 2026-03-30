import { SMDTriggerNotify } from "./SmartData";


export class SMDSet<T> extends Set<T>{
    add(value: T){
        let changed = !this.has(value);
        let re = super.add(value);
        if(changed){
            SMDTriggerNotify(this);
        }
        return re;
    }
    clear(): void{
        let changed = this.size > 0;
        super.clear();
        if(changed){
            SMDTriggerNotify(this);
        }
    }
    delete(value: T): boolean{
        let changed = this.has(value);
        let re = super.delete(value);
        if(changed){
            SMDTriggerNotify(this);
        }
        return re;
    }
}
import { Singleton } from "core/Singleton";
import { DataManager } from "manager/DataManager";

export class DataBase extends Singleton {
    constructor() {
        super();
        DataManager.Inst().RegisterData(this);
    }
    protected onSwitch() { }
}
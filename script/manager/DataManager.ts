import { Singleton } from "core/Singleton";
import { DataBase } from "data/DataBase";
import { CleanSMDCache } from "data/SmartData";


export class DataManager extends Singleton {

    private datas: Set<DataBase> = new Set<DataBase>();

    public RegisterData(data: DataBase) {
        this.datas.add(data);
    }
    onSwitch() {
        this.datas.forEach((data) => {
            (<any>data).onSwitch();
        })
    }
    onDestroy() {
        this.datas.forEach((data) => {
            (<any>data.constructor).Destroy();
        })
        this.datas.clear();
        CleanSMDCache();
        super.onDestroy();
    }

}
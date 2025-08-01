import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { CoreCrisisBoxType, CoreCrisisChipToType, CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { DataBase } from "../../data/DataBase";
import { CoreCrisisBoxView } from "./CoreCrisisBoxView";

/*
class LoginResultData{
    @smartdata
    result:number;
}
*/


export type CoreCrisisBoxRet = {
    type : CoreCrisisType,
    num : number,
}

export class CoreCrisisBoxData extends DataBase {  
    private openBoxRet : CoreCrisisBoxRet[] = [];
    private boxQuality : CoreCrisisBoxType;
    //public ResultData : LoginResultData;
    constructor(){
        super();
        this.openBoxRet.push({type:CoreCrisisType.Mount,num:0});
        this.openBoxRet.push({type:CoreCrisisType.Mount,num:0});
        this.openBoxRet.push({type:CoreCrisisType.Mount,num:0});
        this.boxQuality = CoreCrisisBoxType.High;
        // this.createSmartData();
    }

    // private createSmartData(){
    //     /*
    //     let self = this;
    //     self.ResultData = CreateSMD(LoginResultData);
    //     */
    // }

    public get OpenBoxRet() {
        return this.openBoxRet;
    }
    public get BoxQuality(){
        return this.boxQuality;
    }
    public set BoxQuality(qua:CoreCrisisBoxType){
        this.boxQuality = qua;
    }
    private static itemId2CoreCrisisType(itemId:number) : CoreCrisisType{
        return CoreCrisisChipToType[itemId];
        // return itemId - 40499;//
    }
    public SetBoxRet(proto:PB_SCGetItemNotice){
        // console.table(proto.itemList);
        if(proto.itemList.length < 3){  //开宝箱的物品一定要是3种
            console.error(`限制核心宝箱获取的物品类型小于3个，显示会出现错误！请联系服务器修复,下面的table是物品信息。BoxType=${this.boxQuality}`);
            // console.table(proto.itemList);
        }
        for(var key in proto.itemList){
            let idx = Number(key);
            if(idx >= 3){
                break;
            }
            this.openBoxRet[idx].type =CoreCrisisBoxData.itemId2CoreCrisisType(proto.itemList[key].itemId);
            this.openBoxRet[idx].num = Number(proto.itemList[key].num);
        }
        ViewManager.Inst().OpenView(CoreCrisisBoxView);
    }
}

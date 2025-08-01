import { LogError } from "core/Debugger";
import { CreateSMD, smartdata } from "data/SmartData";
import { DataBase } from "../../data/DataBase";

class FloatingTextResultItem{
    @smartdata
    desc:string;
}

class FloatingTextResultData{
    @smartdata
    result:FloatingTextResultItem[] = [];
    @smartdata
    val:number = 0;
}

class WaitViewData{
    @smartdata
    desc:string = "";
}

export class FloatingTextDate extends DataBase {  
    public resultData : any;
    private waitData = CreateSMD(WaitViewData);
    constructor(){
        super();
        this.createSmartData();
    }
    private createSmartData(){
        this.resultData = CreateSMD(FloatingTextResultData);
    }
    //--add飘字缓存(全部信息)
    public GetFloatText():any[]{
        return this.resultData;
    }

    public AddFloatText(data:any){
        this.resultData.result.push(data);
        this.FlushVal()
        // this.resultData.val = !this.resultData.val;

    }

    public FlushVal()
    {
        if(this.resultData.val < 10)
        {
            this.resultData.val = this.resultData.val + 1
        }
        else {
            this.resultData.val = 0
        }
    }

    public GetFloatQuene(){
        return this.resultData.result.shift();
    }

    public get WaitData(){
        return this.waitData;
    }

    public set WaitDesc(val:string){
        this.waitData.desc = val;
    }

    public get WaitDesc(){
        return this.waitData.desc;
    }
}
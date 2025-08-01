import { CfgActivityData } from "config/CfgActivity";
import { LogError } from "core/Debugger";
import { CreateSMD, smartdata } from "data/SmartData";
import { ACTIVITY_ENTER_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BoxFundData } from "modules/boxfund/BoxFundData";
import { DailyGiftData } from "modules/DailyGift/DailyGiftCtrl";
import { InviteFriendData } from "modules/invitefriend/InviteFriendData";
import { LevelFundData } from "modules/levelfund/LevelFundData";
import { WarOrderData } from "modules/warOrder/WarOrderData";
import { DataBase } from "../../data/DataBase";


class ServerAvtivityResultData {
    @smartdata
    flush: boolean;
    // result:number;
}


export class ServerActivityData extends DataBase {
    // public ResultData : ServerAvtivityResultData;
    constructor() {
        super();
        this.createSmartData();
    }
    private open_name: string
    private quick_name :string
    private createSmartData() {
        // let self = this;
        // this.ResultData = CreateSMD(ServerAvtivityResultData);
    }

    public GetOpenActivityList() {
        // return CfgActivityData.ceshi
        // return CfgActivityData.daily
        return ActivityRandData.Inst().GetActBtnList(ACTIVITY_ENTER_TYPE.DAILY)
    }

    public SetNowViewName(name: string) {
        this.open_name = name
    }

    public GetNowViewName() {
        return this.open_name
    }

    // public FlushRedPoint(){
    //     this.ResultData.flush = !this.ResultData.flush
    // }

    public GetServerIsOPen() {
        let data = this.GetOpenActivityList()
        return data.length != 0
    }

    public GetAllRed() {
        let red1 = LevelFundData.Inst().GetAllRed()
        let red2 = BoxFundData.Inst().GetAllRed()
        let red3 = InviteFriendData.Inst().GetAllRed()
        let red4 = DailyGiftData.Inst().GetRed()
        let red5 = WarOrderData.Inst().GetAllRed();

        let red = (red1 + red2 + red3 + red4 +red5) > 0 ? 1 : 0
        return red
    }

    public SetQuickOpen(name:string){
        this.quick_name = name 
    }

    public GetQuickOpen(){
        return this.quick_name
    }

    public ClearQuickOpen()
    {
        this.quick_name = null
    }
}

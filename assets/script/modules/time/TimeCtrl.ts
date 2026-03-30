import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { Singleton } from "core/Singleton";
import { SMDHandle } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata, SmartDatRouter } from "data/SmartData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { LoginData } from "modules/login/LoginData";
import { TextHelper } from "../../helpers/TextHelper";
import { Timer } from "./Timer";

class TimeResultData {
    @smartdata
    openDays: number = 0;
}

export class TimeCtrl extends BaseCtrl {
    public TimeInfo: TimeResultData;

    private timer: Singleton;

    private server_time: number = 0;            //!< 服务器当前时间戳
    private cur_day: number = -1;               //!< 服务器已开服天数
    private serverRealStartTime: number = 0;    //!< 服务器首次开服时间戳
    private serverRealCombineTime: number = 0;  //!< 服务器合服时间戳
    private last_req_time: number = 0;   //最后一次发送请求时间戳
    private timer_handle: any = null;

    constructor() {
        super();
        this.timer = Timer.Inst();
        this.createSmartData();
    }

    private createSmartData() {
        this.TimeInfo = CreateSMD(TimeResultData);
    }

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCTimeAck, func: this.receTimeAck },
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(SMDHandle.Create(LoginData.Inst().ResultData, this.onLogin.bind(this), "result"));
    }

    private receTimeAck(protocol: PB_SCTimeAck) {
        let is_first_get_time = !this.server_time   
        this.server_time = protocol.serverTime;
        this.serverRealStartTime = protocol.serverRealStartTime;
        this.serverRealCombineTime = protocol.serverRealCombineTime;
        this.last_req_time = this.ClientTime;
        if (this.cur_day != protocol.openDays) {
            this.cur_day = protocol.openDays;
            this.TimeInfo.openDays = protocol.openDays;
        }
        if (is_first_get_time) {
            EventCtrl.Inst().emit(CommonEvent.FIRST_GET_SEVER_TIME);
        }
    }

    public sendTimeReq() {
        let protocol = this.GetProtocol(PB_CSTimeReq);
        protocol.reserve = 0;
        this.SendToServer(protocol);
    }

    private onLogin() {
        if (this.timer_handle != null) {
            LogError("TimeCtrl SendTimeReq error");
            return;
        }
        this.sendTimeReq();
        this.timer_handle = Timer.Inst().AddRunTimer(function () {
            TimeCtrl.Inst().sendTimeReq();
        }, 10, undefined, true);
        this.handleCollector.RemoveAll();
    }

    //获取服务器时间
    public get ServerTime(): number {
        return this.server_time + (this.ClientTime - this.last_req_time);
    }

    //获取服务器开启天数
    public get CurOpenServerDay(): number {
        return this.cur_day
    }

    //获取服务器开服时间戳
    public get ServerStartTs(): number {
        return this.serverRealStartTime;
    }

    //获取本地时间
    public get ClientTime(): number {
        return new Date().getTime() / 1000
    }

    /**获取服务器今日零点时间戳 */
    public get todayStarTime(): number {
        return this.GetTimeDayStart(this.ServerTime);
    }

    /**获取服务器明日零点时间戳 */
    public get tomorrowStarTime(): number {
        return this.todayStarTime + 24 * 3600

    }

    //获取周几 周日为0
    public GetWeek() {
        let today = new Date(this.ServerTime * 1000);
        let week = today.getDay();
        return week;
    }

    //获取当前服务器当前开启天数
    public GetCurOpenServerDay() {
        return this.cur_day ?? 0
    }

    //获取某个时间当日0点时间戳
    public GetTimeDayStart(time: number) {
        let data = new Date(time * 1000);
        let h = data.getHours();
        let m = data.getMinutes();
        let s = data.getSeconds();
        return time - h * 3600 - m * 60 - s;
    }

    //获取下周一 0点的时间  有可能不是整点会多1-2秒 如00:00:01 
    public GetNextWeekMonTime() {
        let d = new Date();
        d.setDate(d.getDate() + (((1 + 7 - d.getDay()) % 7) || 7));
        let date1 = Math.floor(d.getTime() / 1000);
        let nowDate = new Date(this.ServerTime * 1000);
        let h = nowDate.getHours();
        let m = nowDate.getMinutes();
        let s = nowDate.getSeconds();
        return date1 - h * 3600 - m * 60 - s;
    }
}
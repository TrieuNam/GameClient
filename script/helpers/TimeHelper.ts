import { TimeType } from "modules/common/CommonEnum";
import { KeyFunction } from "modules/common/CommonType";
import { Language } from "modules/common/Language";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "./TextHelper";

enum TIME_NUM {
    //一分钟
    TIME_MINUTE_SECOND_NUM = 60,
    //一小时
    TIME_HOUR_SECOND_NUM = 3600,
    //一天
    TIME_DAY_SECOND_NUM = 86400,
    //一周
    TIME_WEEK_SECOND_NUM = 604800,
}
export let TimeHelper: KeyFunction = {};

//时间格式化    天/时/分/秒
TimeHelper.FormatDHMS = function (time: number) {
    let t = { day: 0, hour: 0, minute: 0, second: 0 };
    t.day = Math.floor(time / TimeType.TIME_DAY_SECOND_NUM);
    t.hour = Math.floor(time / TimeType.TIME_HOUR_SECOND_NUM) % 24;
    t.minute = Math.floor(time / TimeType.TIME_MINUTE_SECOND_NUM) % 60;
    t.second = Math.floor(time) % 60;
    return t;
}

//时间戳转换日期
TimeHelper.FormatUnixTimeDate = function (unixTime: number) {
    let t = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
    if (unixTime && unixTime > 0) {
        let date = new Date();
        date.setTime(unixTime * 1000);
        t.year = date.getFullYear();
        t.month = date.getMonth() + 1;
        t.day = date.getDate();
        t.hour = date.getHours();
        t.minute = date.getMinutes();
        t.second = date.getSeconds();
    }
    return t;
}


//时间显示格式2022-4-26 15:37:00(传入时间戳)
TimeHelper.TimeformatYMDHMS = function (unixTime: number): string {
    var date = new Date();
    date.setTime(unixTime * 1000);
    var y = date.getFullYear();
    let m: string | number = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d: string | number = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h: string | number = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute: string | number = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    let second: string | number = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}

TimeHelper.Ago = function(unixTime:number){
    let t = TimeHelper.FormatDHMS(TimeCtrl.Inst().ServerTime - unixTime)
    if(t.day > 0){
        return `${t.day}${Language.UiTimeMeter.TimeAgo[0]}`
    }else if(t.hour > 0){
        return `${t.hour}${Language.UiTimeMeter.TimeAgo[1]}`
    }else if(t.minute > 0){
        return `${t.minute}${Language.UiTimeMeter.TimeAgo[2]}`
    }else if(t.second > 0){
        return `${t.second}${Language.UiTimeMeter.TimeAgo[3]}`
    }
    return 0
}

//时间显示格式15:37:00(传入时间)
TimeHelper.TimeformatDHMS = function (time: number): string {
    let time_t = TimeHelper.FormatDHMS(time);
    return TextHelper.Format(Language.UiTimeMeter.TimeStr1, time_t.hour, time_t.minute, time_t.second)
}

//获取两个时间戳的天数
TimeHelper.GetDataDayNum = function (time_stamp:number, start_time:number){
    let day_num = Math.floor((TimeHelper.ChangDataTime(time_stamp) - TimeHelper.ChangDataTime(start_time)) / TIME_NUM.TIME_DAY_SECOND_NUM) + 1
    return day_num > 0 ? day_num:1;
}

//获取当前活动对应的服务器开启天数
TimeHelper.GetActOpenServerDay = function (act_type:number){

}
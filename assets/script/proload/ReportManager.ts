import { Singleton } from "core/Singleton";
import { LoginData } from "modules/login/LoginData";
import { PackageData } from "preload/PkgData";
import { Base64 } from "../helpers/Base64";
import { HTTP } from "../helpers/HttpHelper";



export class ReportManager extends Singleton {
    _loginTime: number;
    public sendPoint(type: ReportType, param: any = []) {
        let UrlParm = LoginData.GetUrlParm();
        if (!UrlParm)
            return;
        let data = this.getHttpParam(type, param);
        let url: string = LoginData.GetUrlParm().param_list.report_url + "?data=" + Base64.encode(data);
        // console.log("上报url：" + url)
        HTTP.GetJson(url);
    }

    private getHttpParam(type: ReportType, param: string[] = []) {
        let agent_id = PackageData.Inst().getSpid();
        if (agent_id == null)
            agent_id = PackageData.Inst().getPackage_spid();
        let PhomeUniqueid = PackageData.Inst().getDevice();
        let packageVersion = PackageData.Inst().getPkg();//4.包版本号
        let sourceVersion = LoginData.GetUrlParm() ? LoginData.GetUrlParm().version_info.assets_info.version : 0;
        sourceVersion = sourceVersion ? sourceVersion : PackageData.Inst().getVersion()
        let session_id = 0;

        let loginTime = this.getLoginTime();
        let netState = 1;
        let currentTime = Math.floor(new Date().getTime() / 1000);
        let imea = PackageData.Inst().getIMEA();
        let channelID = PackageData.Inst().getPlatSpid() ? PackageData.Inst().getPlatSpid() : 0;;

        let params = [
            //     	1 					2 					3
            type.toString(), agent_id.toString(), PhomeUniqueid.toString(),
            //4 							   5 			   				6 				  			7 			  				8 		            9
            packageVersion.toString(), sourceVersion.toString(), session_id.toString(), loginTime.toString(), netState.toString(), currentTime.toString(),
            //10 					   11 			         
            imea.toString(), channelID.toString()
        ];
        for (let i = 0; i < param.length; i++) {
            params.push(param[i].toString());
        }
        let str = "";
        for (let i = 0; i < params.length; i++) {
            str += params[i];
            if (i != params.length - 1) {
                str += "\t";
            }
        }
        // console.log("埋点内容：", params);
        return str;
    }

    private getLoginTime() {
        if (!this._loginTime) {
            this._loginTime = Math.floor(new Date().getTime() / 1000);
        }
        return this._loginTime;
    }
}

export enum ReportType {
    "loading" = 10,			    //进度条加载中
    "openGame" = 100,			//游戏启动
    "beginQuery" = 160,         //query开始
    "endQuery" = 180,           //query结束
    "beginLoadConfig" = 200,	//获取配置开始
    "endLoadConfig" = 300,		//获取配置结束
    "beginUpdataSource" = 400,	//更新资源开始
    "endUpdataSource" = 500,	//更新资源结束
    "beginLogin" = 600,			//登录验证开始
    "endLogin" = 700, 			//登录验证结束
    "beginConnectServer" = 800, //连接服务器开始
    "endConnectServer" = 900,	//连接服务器结束
    "beginCreateRole" = 1000,	//创建角色开始
    "endCreateRole" = 1100,		//创建角色结束
    "roleLogin" = 1200,         //角色登录
    "beginGame" = 2000,			//开始游戏
    "scoket" = 2100,			//心跳 等级变化
}
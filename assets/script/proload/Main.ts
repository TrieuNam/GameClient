import { sys } from "cc";
import "core/FairyGUIPatch";   // patch fairygui-cc GComponent.getChildByPath null guard
import { GetCfgValue } from "config/CfgCommon";
import { Singleton } from "core/Singleton";
import { CfgManager } from "manager/CfgManager";
import { NetManager } from "manager/NetManager";
import { ViewManager } from "manager/ViewManager";
import { CommonEvent } from "modules/common/CommonEvent";
import { ConstValue } from "modules/common/ConstValue";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { LoginInfo, LoginCtrl } from "modules/login/LoginCtrl";
import { LoginData } from "modules/login/LoginData";
import { LoginView, LoginAckResult } from "modules/login/LoginView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer, TYPE_TIMER } from "modules/time/Timer";
import { PackageData, url_parm, server_List_Info } from "preload/PkgData";
import { HTTP } from "../helpers/HttpHelper";
import { TextHelper } from "../helpers/TextHelper";
import { TimeHelper } from "../helpers/TimeHelper";
import { ChannelAgent, LoginVerify } from "./ChannelAgent";
import { ReportManager, ReportType } from "./ReportManager";
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";


export class Main extends Singleton {
    public is_create_role: boolean;
    constructor() {
        super();
    }

    public MainStart() {
        PackageData.Inst().init();
        ReportManager.Inst().sendPoint(ReportType.beginQuery);

        let url = PackageData.Inst().query_url;

        if (!/^https?:\/\/.*/.test(url)) {
            console.error("Invalid URL format:", url);
            return;
        }

        console.log("Sending HTTP GET to:", url);
        const startTime = Date.now();

        HTTP.GetJson(url, (status, resp, text) => {
            const duration = Date.now() - startTime;
            console.log(`HTTP GET completed in ${duration}ms`);

            this.httpCallBack(status, resp, text);
        });
    }

    private httpCallBack(statusCode: number, resp: url_parm | null, respText: string) {
        console.log("==== [HTTP Callback] ====");
        console.log("Status Code:", statusCode);
        console.log("Parsed Response (JSON):", resp);
        console.log("Raw Response Text:", respText);
        console.log("==========================");

        if (statusCode === 200 && resp) {
            // Lưu lại query data nếu có setter
            PackageData.Inst().setQueryData(resp);  // 👈 cần hàm này nếu bạn muốn cache

            // Sau đó mới gọi xử lý
            console.table(PackageData.Inst().getQueryData());
            this.onGetQueryData(resp);
        } else {
            console.error("HTTP request failed or response invalid");
        }
    }

    private onGetQueryData(resp: url_parm) {
        LoginData.Inst().SetServerInfo(resp.server_info);
        LoginData.Inst().SetPublishInfo(resp.param_list.publish_info);
        LoginData.SetUrlParm(resp);
        ChannelAgent.Inst().init();
        ViewManager.Inst().OpenView(LoginView);
        // ReportManager.Inst().sendPoint(ReportType.endQuery);
        ReportManager.Inst().sendPoint(ReportType.beginLoadConfig);
        CfgManager.Inst().Init();
        if (resp.param_list.switch_list.update_assets) {
            ReportManager.Inst().sendPoint(ReportType.beginUpdataSource);
            Main.Inst().getNewRES();
        }
    }

    /**
     * 更新资源
     */
    private getNewRES() {
    }

    public MainLogin(cb: (uInfo: LoginVerify) => void) {
        let device = sys.os;
        let userId = LoginData.Inst().GetLoginData().accountId;
        let token = LoginData.Inst().GetLoginData().token;
        let password = token ?? LoginData.Inst().GetLoginData().password;
        let verify_url = LoginData.GetUrlParm().param_list.verify_url;

        ReportManager.Inst().sendPoint(ReportType.beginLogin, ["0", verify_url]);

        const body = {
            username: userId,
            password: password,
            deviceId: device,
        };

        HTTP.PostJson(verify_url, body, (status, resp, text) => {
            this.LoginRet(cb, status, resp as LoginVerify, text);
        });
    }
    private timer_handle: any;
    private timeOut = 0;
    private LoginRet(cb: (uInfo: LoginVerify) => void, statusCode: number, data: LoginVerify, _respText?: string) {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10073, Report2Type.par_12());
        if (this.timer_handle) {
            Timer.Inst().CancelTimer(this.timer_handle);
            this.timer_handle = undefined;
        }
        if (statusCode == 200 && data && data.ret == 0 && data.user) {
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10074, Report2Type.par_12());
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10180, Report2Type.par_12());

            this.timeOut = 0;
            PublicPopupCtrl.Inst().HideWait();
            // ViewManager.Inst().CloseView(WaitView);
            LoginData.Inst().SetLoginData(data);
            cb(data);
            let account = LoginData.Inst().GetLoginRespUserData().account;
            ReportManager.Inst().sendPoint(ReportType.endLogin, [account, "true"]);
            if (data.role_data) {
                LoginData.Inst().SetRoleData(data.role_data);
            }
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10090, Report2Type.par_12());
        } else {
            if (data) {
                if (data.ret != 0) {
                    PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10078, Report2Type.par_12());
                }
                if (!data.user) {
                    PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10077, Report2Type.par_12());
                }
            }
            if (this.timeOut <= 5) {
                if (this.timeOut == 0) {
                    PublicPopupCtrl.Inst().ShowWait(Language.Login.WaitTips.tips1);
                    // ViewManager.Inst().OpenView(WaitView, { desc: Language.Login.WaitTips.tips1 });
                    ReportManager.Inst().sendPoint(ReportType.endLogin, ["0", "false"]);
                }
                this.timer_handle = Timer.Inst().AddRunTimer(this.MainLogin.bind(this, cb), 2, 1, false);
            } else {
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10075, Report2Type.par_12());
                cb(undefined);
                this.timeOut = 0
                PublicPopupCtrl.Inst().HideWait();
                // ViewManager.Inst().CloseView(WaitView);
                ChannelAgent.Inst().wxModal("提示", "登录失败，请检查网络状态后重试", null, null, false);
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10081, Report2Type.par_12());
            }
            this.timeOut += 1;
        }
    }
    private isConnect = 0;
    /**连接服务器ID 仅用于请求使用 */
    private _id_server: number;
    public connect(id_server: number) {
        if (this.isConnect > 0) {
            return
        }
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10250, Report2Type.par_12());
        PublicPopupCtrl.Inst().ShowWait(Language.Login.WaitTips.tips1);
        //刷新一次服务器状态
        let url = PackageData.Inst().getQueryData().param_list.server_stat_url;
        if (url) {
            url = `${url}?sid=${id_server}`;
            HTTP.GetJson(url, this.internalConnect.bind(this, id_server));
        }
        else {
            this.internalConnect(id_server, -1, null);
        }
    }

    private internalConnect(id_server: number, statusCode: number, data:
    { server_stat: { [key: string]: server_List_Info } }) {
        let currentInfo = LoginData.Inst().GetServerItemInfoById(id_server);
        if (currentInfo && statusCode == 200 && data && data.server_stat) {
            let si = data.server_stat[id_server.toString()];
            if (si) {
                console.log(`UpdateServerInfo,[${id_server}],open_time=${si.open_time},flag=${si.flag},ahead_time=${si.ahead_time}`)
                currentInfo.open_time = si.open_time;
                currentInfo.flag = si.flag;
                currentInfo.ahead_time = si.ahead_time;
            }
        }
        this._id_server = id_server
        // console.error(`id_server===`,id_server,currentInfo)
        let account = LoginData.Inst().GetLoginRespUserData().account;
        // let role_info = LoginData.Inst().GetServerRoleInfoById(currentInfo.id);
        // console.error(`role_info==`,currentInfo.id,"|",role_info,"|",LoginData.Inst()["server_role_list"]);
        // console.error(!role_info,"|",(0 == +role_info.vip),"|",+role_info.vip)
        // if (!role_info || 0 == +role_info.vip) {
        if (LoginData.Inst().GetLoginRespUserData().account_type != 1) {
            if (currentInfo.open_time > TimeCtrl.Inst().ServerTime + currentInfo.ahead_time) {
                PublicPopupCtrl.Inst().HideWait();
                let time_t = TimeHelper.FormatUnixTimeDate(currentInfo.open_time)
                PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Login.ServerTips.NotOpenTips, time_t.year, time_t.month, time_t.day, time_t.hour, time_t.minute, time_t.second), DialogTipsTypes.login);
                return
            } else {
                let tips = GetCfgValue(Language.Login.ServerTips.BadTips, currentInfo.flag)
                if (tips) {
                    PublicPopupCtrl.Inst().HideWait();
                    PublicPopupCtrl.Inst().DialogTips(tips, DialogTipsTypes.login);
                    return
                }
            }
        }
        this.isConnect = 1;
        // PublicPopupCtrl.Inst().ShowWait(Language.Login.WaitTips.tips1);
        // ViewManager.Inst().OpenView(WaitView, { desc: Language.Login.WaitTips.tips1 });
        ReportManager.Inst().sendPoint(ReportType.beginConnectServer, [account, currentInfo.id]);
        // Lấy session token từ login response để gửi kèm WebSocket URL (?token=xxx)
        const sessionToken = LoginData.Inst().GetLoginRespUserData()?.login_sign;
        NetManager.Inst().ConnectServer(currentInfo.ip, currentInfo.port, (suc, _opt) => {
            if (suc) {
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10230, Report2Type.par_12());
                Main.Inst().sendLoginReq();
            }
            else {
                PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10240, Report2Type.par_12());
                PublicPopupCtrl.Inst().HideWait();
                this.isConnect = 0;
                ChannelAgent.Inst().wxModal("提示", "网络已断开，请检查网络状态后重试", () => {
                    ChannelAgent.Inst().RestartProgram();
                    // let MainAgent = (window as any)['MainAgent'];
                    // MainAgent.exitMiniProgram();
                }, null, false);
                // MainAgent
            }
        }, 10, sessionToken);
    }

    private ht_waitLoginResult: TYPE_TIMER;
    private sendLoginReq() {
        let currentInfo = LoginData.Inst().GetServerItemInfoById(this._id_server);
        let account = LoginData.Inst().GetLoginRespUserData().account;
        ReportManager.Inst().sendPoint(ReportType.endConnectServer, [account, currentInfo.id]);
        var info: LoginInfo = {
            loginTime: Date.parse(new Date().toString()),
            loginStr: LoginData.Inst().GetLoginRespUserData().login_sign,
            pname: LoginData.Inst().GetLoginRespUserData().account,
            server: currentInfo.id,
            platSpid: LoginData.Inst().palt_spid,
        }
        let last_server_list = LoginData.Inst().GetLastServerList();
        this.is_create_role = true;
        for (let i = 0; i < last_server_list.length; i++) {
            if (last_server_list[i].id == currentInfo.id) {
                this.is_create_role = false;
                break;
            }
        }
        if (this.is_create_role) {
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10150, Report2Type.par_12());
            ReportManager.Inst().sendPoint(ReportType.beginCreateRole, [account, currentInfo.id, LoginData.Inst().GetLoginRespUserData().account]);
            ChannelAgent.Inst().Behaveious(ConstValue.BehaveType.CreatRole)
        }

        this.isConnect = 2;
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10190, Report2Type.par_12());
        LoginCtrl.Inst().SendLoginReq(info);
        if (this.ht_waitLoginResult) {
            Timer.Inst().CancelTimer(this.ht_waitLoginResult)
            this.ht_waitLoginResult = undefined;
        }
        this.ht_waitLoginResult = Timer.Inst().AddRunTimer(this.endlLogin.bind(this), 3, 1, false)
    }

    private endlLogin(succ = false) {
        if (this.isConnect) {
            if (this.ht_waitLoginResult) {
                Timer.Inst().CancelTimer(this.ht_waitLoginResult)
                this.ht_waitLoginResult = undefined;
            }
            PublicPopupCtrl.Inst().HideWait();
            this.isConnect = 0;
            if (!succ) {
                if (this.is_create_role) {
                    PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10170, Report2Type.par_12());
                }
                if (LoginData.Inst().ResultData.result == LoginAckResult.LOGIN_RESULT_SUC) {
                    // Timeout: server không phản hồi trong 3s → hiển thị lỗi, cho phép thử lại
                    PublicPopupCtrl.Inst().Center(Language.Login.WaitTips.tips1 ? "连接超时，请重试" : "连接超时，请重试");
                } else {
                    // Server phản hồi với mã lỗi → hiển thị lỗi cụ thể
                    PublicPopupCtrl.Inst().Center(`连接失败 (${LoginData.Inst().ResultData.result})`);
                }
            }
        }
    }

    public onLoginResult(data: PB_SCLoginToAccount) {
        LoginData.Inst().ResultData.currentId = this._id_server
        let resultData = LoginData.Inst().ResultData;
        resultData.result = data.result;
        resultData.resultFlush = !resultData.resultFlush;
        let server = LoginData.Inst().GetCurServerInfo()
        let ip = server?.ip;
        LoginData.Inst().HTTPS = false;
        if (ip) {
            ConstValue.HTTPS_VALUE.forEach(element => {
                if (ip.indexOf(element) != -1) {
                    LoginData.Inst().HTTPS = true;
                    return;
                }
            });
            let ips = ip.split("//");
            server.noHeandIp = ips[ips.length - 1];
        }
        if (resultData.result == LoginAckResult.LOGIN_RESULT_SUC) {
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10210, Report2Type.par_12());
            EventCtrl.Inst().emit(CommonEvent.LOGIN_SUCC);
        } else {
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10220, Report2Type.par_12());
        }
        if (this.is_create_role) {
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10160, Report2Type.par_12());
            let currentInfo = LoginData.Inst().GetServerItemInfoById(LoginData.Inst().ResultData.currentId);
            let account = LoginData.Inst().GetLoginRespUserData().account;
            ReportManager.Inst().sendPoint(ReportType.endCreateRole, [account, currentInfo.id, LoginData.Inst().GetLoginRespUserData().account]);
        }
        // Chỉ gọi endlLogin(true) khi login thành công; nếu server trả về lỗi thì
        // endlLogin(false) sẽ hiển thị thông báo lỗi và cho phép thử lại.
        this.endlLogin(resultData.result == LoginAckResult.LOGIN_RESULT_SUC);
    }

    //请求隐私政策
    public RequestUserProtocol() {
        let url = LoginData.GetUrlParm().param_list.user_protocol_url ?? "http://localhost:8083/api/c2s/fetch_privacy_notice";
        let spid = LoginData.Inst().GetServerInfo().spid ?? "dev";
        url += "?spid=" + spid;
        HTTP.GetJson(url, this.UserProtocolCallBack);
    }

    //隐私政策回调
    private UserProtocolCallBack(_statusCode: number, resp: any) {
        if (resp && resp.ret == 0) {
            LoginData.Inst().SetLoginUserProtocol(resp.data);
        }
    }
}
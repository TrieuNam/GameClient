import { sys, HorizontalTextAlignment } from "cc";
import { NATIVE } from "cc/env";
import { LogError } from "core/Debugger";
import { Singleton } from "core/Singleton";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { OPEM_PARAM, msgType, ERRORCODE } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { ConstValue } from "modules/common/ConstValue";
import { EventCtrl } from "modules/common/EventCtrl";
import { CommonTipView, CommonTipData } from "modules/common_help/CommonTipView";
import { KnightCardData } from "modules/knight_card/KnightCardData";
import { LoginData } from "modules/login/LoginData";
import { LoginView } from "modules/login/LoginView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Order_Data } from "modules/recharge/OrderCtrl";
import { RoleCtrl } from "modules/role/RoleCtrl";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { PackageData } from "preload/PkgData";
import { wexin, PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";
import { HTTP } from "../helpers/HttpHelper";
import { UtilHelper } from "../helpers/UtilHelper";
import { Main } from "./Main";
import { RepairEngine } from "./RepairEngine";




export class ChannelAgent extends Singleton {
    private MainAgent: any;
    private _isAgent = false
    public static get wx(): wexin {
        return (window as any)['wx'] as wexin
    }
    init() {
        RepairEngine.repair();
        this.MainAgent = (window as any)['MainAgent'];
        if (this.MainAgent) {
            let result_init = this.MainAgent.init(this);
            if (!result_init) {
                this._isAgent = false;
            } else {
                this._isAgent = true
            }
        }
    }

    OnInit(param: { result: boolean }) {

    }

    get isAgent() {
        return this.MainAgent != undefined && this._isAgent;
    }


    public GetUserInfo() {
        let loginCtrl = LoginData.Inst();
        let data_server = loginCtrl.GetLoginRespUserData();
        let roleinfo = RoleData.Inst();
        let server_info = loginCtrl.GetCurServerInfo();
        if (server_info && data_server && roleinfo)
            return {
                "server_id": server_info.id,
                "server_name": server_info.name,
                "user_id": data_server.uid,
                "role_id": roleinfo.GetRoleId(),
                "role_name": roleinfo.GetRoleName(),
                "level": roleinfo.GetRoleLevel(),
            }
        else {
            return {
                "server_id": 0,
                "server_name": 0,
                "user_id": 0,
                "role_id": 0,
                "role_name": 0,
                "level": 0,
            }
        }
    }

    public login() {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10071, Report2Type.par_12());
        if (this.MainAgent) {
            this.MainAgent.login();
        }
    }

    public OnLogin(param: { account: string, token: string }) {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10072, Report2Type.par_12());
        LoginData.Inst().GetLoginData().accountId = param.account
        LoginData.Inst().GetLoginData().token = param.token;
        Main.Inst().MainLogin((uInfo: LoginVerify) => {
            let loginView = ViewManager.Inst().getView<LoginView>(LoginView);
            if (loginView) {
                loginView.onVerify(uInfo, true);
            }
            console.log("wx login openid = ", uInfo.user.openid);
            let param = new OPEM_PARAM()
            param.type = msgType.openid
            param.value = uInfo.user.openid
            this.postMessageToOD(param)
            if (!uInfo) {
                PublicPopupCtrl.Inst().Center("登录失败")
            }
        });
    }

    public Mai(orderInfo: Order_Data) {
        if (this.MainAgent) {
            let result = this.MainAgent.Mai(orderInfo)
            if (result)
                return
        }
        if (LoginData.GetUrlParm().param_list.gm_buy_url && LoginData.GetUrlParm().param_list.switch_list.open_gm) {//gm充值
            let url = LoginData.GetUrlParm().param_list.gm_buy_url + "?money=" + orderInfo.moneyAmount + "&app_order_id=" + orderInfo.orderId;
            console.log("充值url:" + url)
            HTTP.GetJson(url);
        }
    }

    /**
     * 发信息给sdk
     * @param type  GameToChannel
     * @param msg 参数
     * @param msg1 参数
     * @returns 
     */
    public OnMessage(type: string, msg?: string, msg1?: string) {
        if (this.MainAgent) {
            this.MainAgent.OnMessage(type, msg, msg1);
        }
    }

    /**
     * 广告视频接口
     * @param type 客户端消息类型
     * @param adType 表里的广告id 
     * @param tip 视频cd提示
     * @param is_dia 是否消耗钻石 1：钻石 0：非钻石
     * @param param 等级基金，宝箱基金活动序号
     */
    public advert(type: string, adType: string | number, tip: string, is_dia = 0, param: number = 0) {
        if (KnightCardData.Inst().GetKnightCardIsBuy()) {
            RoleCtrl.Inst().ReqAdverReward(+adType, is_dia, param);
            return
        }
        let msgs = `${adType}-${is_dia}-${param}`;
        if (this.MainAgent) {
            this.OnMessage(type, msgs, tip);
        } else {
            RoleCtrl.Inst().ReqAdverReward(+adType, is_dia, param);
        }
    }

    public Behaveious(type: string) {
        if (this.MainAgent) {
            this.MainAgent.Behaveious(type);
        }
    }

    private wx_advertTIme = 0;
    private Message(type: string, msg: string) {
        switch (type) {
            case ChannelToGame.tip:
                PublicPopupCtrl.Inst().Center(msg);
                break;
            case ChannelToGame.wx_advertS:
                this.wx_advertTIme = TimeCtrl.Inst().ServerTime >> 0;
                break
            case ChannelToGame.wx_advertE:
                EventCtrl.Inst().emit(CommonEvent.PACK_WX_ADVERTSUC)
                let params = msg.split("-");
                let adType = +params[1];
                let is_dia = +params[2];
                let param = +params[3];
                RoleCtrl.Inst().ReqAdverReward(adType, is_dia, param);

                // let adv_url = PackageData.Inst().getQueryData().param_list.adv_gift_url;
                // if (adv_url) {
                //     let params = msg.split("-");
                //     let sTime = this.wx_advertTIme;
                //     let eTime = TimeCtrl.Inst().ServerTime >> 0;
                //     let sign = params[0];
                //     let type = params[1];
                //     let loginCtrl = LoginData.Inst();
                //     let data_server = loginCtrl.GetLoginRespUserData();
                //     let roleinfo = RoleData.Inst();

                //     let p1 = PackageData.Inst().getSpid();
                //     let p2 = loginCtrl.GetCurServerInfo().id;
                //     let p3 = data_server.uid;
                //     let p4 = roleinfo.GetRoleId();
                //     let p5 = roleinfo.GetRoleLevel();
                //     let p6 = type
                //     let p7 = sTime;
                //     let p8 = eTime;
                //     let md5_sign = MD5.encode(p2 + p3 + p4 + p5 + p6 + p7 + p8 + sign);
                //     let reqUrl: string = adv_url +
                //         "?spid=" + p1 +
                //         "&server_id=" + p2 +
                //         "&user_id=" + p3 +
                //         "&role_id=" + p4 +
                //         "&level=" + p5 +
                //         "&type=" + p6 +
                //         "&time_beg=" + p7 +
                //         "&time_end=" + p8 +
                //         "&sign=" + md5_sign;
                //     HTTP.GetString(reqUrl, () => {

                //     });
                // }
                break;
            case ChannelToGame.menuShareSuc:
                EventCtrl.Inst().emit(CommonEvent.PACK_WX_MENUSHARESUC)
                break;
            case ChannelToGame.arouseShareSuc:
                let actId = +msg;
                EventCtrl.Inst().emit(CommonEvent.PACK_WX_AROUSESHARESUC, msg);
                break;
            case ChannelToGame.bearouseShareSuc:
                EventCtrl.Inst().emit(CommonEvent.PACK_WX_BE_AROUSESHARESUC, msg);
                break;
            case ChannelToGame.avatar:
                if (msg)
                    EventCtrl.Inst().emit(CommonEvent.PACK_WX_BE_AVATAR, JSON.parse(msg) as wx_User);
                break;
            case ChannelToGame.EnterGame:
                AudioManager.Inst().Play(AudioTag.TongYongClick);
                Main.Inst().connect(LoginData.Inst().ResultData.currentId);
                break;
        }

    }

    public CheckContent(type: string, msg: string, cb: (result: boolean, msg: string) => void): boolean {
        if (this.MainAgent) {
            this.MainAgent.CheckContent(type, msg, cb);
            return true
        }
        return false;
    }

    public reportError(error: ERRORCODE) {
        if (this.MainAgent) {
            this.MainAgent.reportError(error);
            return true
        }
    }

    public CopyText(text: string) {
        if (sys.platform == sys.Platform.WECHAT_GAME || NATIVE) {
            if (this.MainAgent) {
                this.MainAgent.CopyText(text);
            }
        } else {
            UtilHelper.copyStr(text);
            PublicPopupCtrl.Inst().Center("复制成功")
        }
    }

    public Report() {
        let loginCtrl = LoginData.Inst();
        let data_server = loginCtrl.GetLoginRespUserData();
        // let data_login = loginCtrl.GetLoginData();
        let roleinfo = RoleData.Inst();
        let url = LoginData.GetUrlParm().param_list.role_report_url;
        let reqUrl: string = url +
            "?spid=" + PackageData.Inst().getSpid() +
            "&server_id=" + loginCtrl.GetCurServerInfo().id +
            "&user_id=" + data_server.uid +
            "&role_id=" + roleinfo.GetRoleId() +
            "&role_name=" + roleinfo.GetRoleName() +
            "&level=" + roleinfo.GetRoleLevel() +
            "&vip=" + 0;
        HTTP.GetJson(reqUrl);
        this.Behaveious(ConstValue.BehaveType.LevelUp);
    }

    public wxModal(title: string, content: string, confirm_func: any, cancel_func: any, showCancel: boolean, confirmText?: string, cancelText?: string) {
        if (this.MainAgent) {
            this.MainAgent.wxModal(title, content, confirm_func, cancel_func, showCancel, confirmText, cancelText);
        }
        else {
            PublicPopupCtrl.Inst().Center(`弹框提示|${title}|${content}}`);
            if (confirm_func) {
                confirm_func();
            }
        }
    }

    public ExitProgram() {
        if (this.MainAgent) {
            this.MainAgent.exitMiniProgram();
        }
        else {
            // game.restart();
            // game.end();
            PublicPopupCtrl.Inst().Center(`退出游戏,编辑器模式请手动关闭`);
            ViewManager.Inst().OpenView(CommonTipView, new CommonTipData("提示", "连接失败是否重启游戏", () => {
                // game.restart();
                // game.end();
                window && window.location && window.location.reload && window.location.reload();
            }, HorizontalTextAlignment.LEFT));

        }
    }


    public RestartProgram() {
        if (this.MainAgent) {
            this.MainAgent.restartMiniProgram();
        }
        else {
            // game.restart();
            // game.end();
            PublicPopupCtrl.Inst().Center(`重启游戏,编辑器模式请手动重启`);
        }
    }

    //开放域传输信息
    //param = CommonStruct.OpenDataParam
    public postMessageToOD(param: any) {
        const gl_window = window as any
        let env = gl_window.wx || gl_window.tt || gl_window.swan;
        if (env) {
            console.log('Message posted');
            env.getOpenDataContext().postMessage(param);
        } else {
            console.log('env is null, param = ', param)
        }
    }

    public checkGameRes(resources: string) {
        let pkg_resources = PackageData.Inst().getQueryData().version_info.assets_info.resources;
        if (pkg_resources != resources) {
            this.wxModal("提示", "检测到有数据更新，请点击确定重新进入游戏", () => {
                ChannelAgent.wx.restartMiniProgram();
            }, null, false);
            LogError("restartMiniProgram")
        }
    }
}
export let tuiSongID = {
    Escort: "0",
    box: "1",
    arena: "2",
    fish: "3",
    shilian: "4",
    gumo: "5",
    mont: "6",
    territoryBerobbed: "8", //领地资源被抢
    territoryRobBedef: " 9",//领地抢夺资源遭到抵抗
}
export let GameToChannel = {
    KeFu: "KeFu",
    /**分享 */
    arouseShare: "arouseShare",
    /**打开激励视频 */
    wx_advert: "wx_advert",
    /**检查是否被邀请 */
    arouseShareCheck: "arouseShareChceck",

    showEnterGame: "showEnterGame",
    /**打开竞技场 */
    view_o_Arena: "view_o_Arena",
    /**关闭竞技场 */
    view_c_Arena: "view_c_Arena",

    /**打开航海 */
    view_o_Escort: "view_o_Escort",
    /**关闭航海 */
    view_c_Escort: "view_c_Escort",

    tuisong: "tuisong"

}
let ChannelToGame = {
    /**激励视频成功 */
    wx_advertE: "wx_advert-e",
    /**激励视频开始 */
    wx_advertS: "wx_advert-s",

    /**绑定手机成功 */
    bindPhoneSuc: "bindPhone-1",
    /**提示 */
    tip: "tip",
    /**主菜单分享 */
    menuShareSuc: "menuShare-1",
    /**分享成功 */
    arouseShareSuc: "arouseShare-1",
    /**被邀请人进游戏 */
    bearouseShareSuc: "arouseShare-2",


    avatar: "avatar",
    EnterGame: "EnterGame"
}


//--------------------------渠道登录--------------------------
export class LoginVerify {
    ret: number;
    msg: string;
    user: User;
    role_data: { [key: string]: RoleDatum };
}

export class RoleDatum {
    server_id: string;
    role_id: string;
    role_name: string;
    level: string;
    vip: string;
    last_login_time: number;
}

export class User {
    spid: string;
    merger_spid: string;
    account_spid: string;
    account: string;
    account_type: number;
    fcm_flag: number;
    login_time: number;
    uid: string;
    openid: string;
    login_sign: string;
}
//----------------------end 渠道登录 end----------------------

export type wx_User = {
    nickName: string,
    gender: string,
    language: string,
    city: string,
    province: string,
    country: string,
    avatarUrl: string,
}
//----------------------end 渠道登录 end----------------------


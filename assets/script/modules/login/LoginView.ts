import { sys } from "cc";
import { LogError } from "core/Debugger";
import { FrameTimerHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { CameraManager } from "manager/CameraManager";
import { CfgManager } from "manager/CfgManager";
import { ViewManager } from "manager/ViewManager";
import { AnnounceCtrl } from "modules/Announce/AnnounceCtrl";
import { UserProtocolView } from "modules/UserProtocol/UserProtocolView";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BaseView, viewRegcfg, ViewLayer } from "modules/common/BaseView";
import { OPEM_PARAM, msgType, ERRORCODE } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { ConstValue } from "modules/common/ConstValue";
import { EventCtrl } from "modules/common/EventCtrl";
import { Language } from "modules/common/Language";
import { CommonButton } from "modules/extends/CommonButton";
import { EGLoader } from "modules/extends/EGLoader";
import { GuideView } from "modules/guide/GuideView";
import { MainView } from "modules/main/MainView";
import { TopLayerView } from "modules/main/TopLayerView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { Timer } from "modules/time/Timer";
import { server_List_Info, PackageData } from "preload/PkgData";
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ChannelAgent, LoginVerify, GameToChannel } from "../../proload/ChannelAgent";
import { Main } from "../../proload/Main";
import { AgeTipView } from "./AgeTipView";
import { LoginData } from "./LoginData";
import { ServerSelectView } from "./ServerSelectView";




export enum LoginAckResult {
    LOGIN_RESULT_SUC = 0,               //!< 0 成功
    LOGIN_NO_THREAD = -1,
    LOGIN_SERVER_ERROR = -2,            //!< 2 服务器发生错误
    LOGIN_RESULT_EXIST = -3,
    LOGIN_SCENE_NOT_EXIST = -4,         //!< 4 场景不存在 
    LOGIN_RESULT_NO_GATEWAY = -5,       //!< 5 网关不存在
    LOGIN_RESULT_NO_ROLE = -6,          //!< 6 没有角色
    LOGIN_THREAD_BUSY = -7,
    LOGIN_LOGIN_FORBID = -8,            //!< 8 已被封号
    LOGIN_ANTI_WALLOW = -9,
    LOGIN_FORBID_NEW_ROLE = -10,        //!< 10 禁止创建新号
};


@BaseView.registView
export class LoginView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Login",
        ViewName: "LoginView",
        LayerType: ViewLayer.Normal,
    };
    protected viewNode = {
        accountInput: <fgui.GTextInput>null,
        passInput: <fgui.GTextInput>null,
        ButtonLogin: <CommonButton>null,
        bg: <EGLoader>null,
        logo: <EGLoader>null,
        login: <fgui.GGroup>null,
        change: <fgui.GButton>null,
        play: <fgui.GButton>null,
        notice: <fgui.GButton>null,
        BtnAgeTip: <fgui.GButton>null,
        BtnProtocol: <fgui.GButton>null,
        PublishInfo: <fgui.GTextField>null,
        fullscreen: <fgui.GComponent>null,
        server: <fgui.GGroup>null,
        version: <fgui.GLabel>null,
    };

    private account: string = "";
    private password: string = "";
    private resultData: any;

    private currentInfo: server_List_Info;

    InitData() {
        let self = this;
        let _account = sys.localStorage.getItem("Account");
        if (_account) {
            self.account = _account;
        }
        let _password = sys.localStorage.getItem("PassWord");
        if (_account) {
            self.password = _password;
        }
        self.resultData = LoginData.Inst().ResultData;
        self.AddSmartDataCare(self.resultData, self.isLoginResult.bind(self), "resultFlush");
        self.AddSmartDataCare(self.resultData, self.freshCurrentId.bind(self), "currentId");
        self.AddSmartDataCare(self.resultData, self.ShowUserProtocol.bind(self), "user_protocol_change");
        RoleData.Inst().inGame = false;
        EventCtrl.Inst().on(CommonEvent.LOGIN_SUCC_ROLEDATA, this.onRoleData, this, true);

        // self.AddSmartDataCare(CreateRoleData.Inst().FinishCreateData, self.isFinishCreate.bind(self));
    }

    InitUI() {
        let self = this;
        self.viewNode.accountInput.text = self.account;
        self.viewNode.passInput.text = self.password;
        self.viewNode.ButtonLogin.onClick(self.onClickLogin, self);

        self.viewNode.change.onClick(self.onClickChange.bind(self));
        self.viewNode.play.onClick(self.onClickPlay.bind(self));
        self.viewNode.notice.onClick(self.onClickNotice.bind(self));
        self.viewNode.BtnAgeTip.onClick(self.onClickAgeTip.bind(self));
        self.viewNode.BtnProtocol.onClick(self.onClickProtocol.bind(self));
        UH.SetText(self.viewNode.version, TextHelper.Format(Language.Login.version, PackageData.Inst().getQueryData().version_info.assets_info.resources))

        // self.setLastLogin();
        this.ShowUserProtocol();

        this.FlushPublishInfo();

        // AnnounceCtrl.Inst().TryOpenAnnounce()
    }
    private ttime: any;
    private _readyWatchdogTimer: any;
    private onRoleData() {
        let readyChcek = () => {
            const commonLoaded = ViewManager.Inst().commonPkgLoaded;
            const mainOpened = ViewManager.Inst().IsOpened(MainView);
            const topOpened = ViewManager.Inst().IsOpened(TopLayerView);
            const ready = commonLoaded && mainOpened && topOpened;
            if (!ready) {
                console.log("[login-ready] waiting", { commonLoaded, mainOpened, topOpened });
            }
            return ready;
        }
        if (readyChcek()) {
            ViewManager.Inst().CloseView(LoginView);
        }
        else {
            PublicPopupCtrl.Inst().ShowWait(Language.Login.WaitTips.tips1);
            // Watchdog: nếu sau 15s UI vẫn chưa sẵn sàng thì buộc vào game
            if (!this._readyWatchdogTimer) {
                this._readyWatchdogTimer = Timer.Inst().AddRunTimer(() => {
                    this._readyWatchdogTimer = null;
                    this.handleCollector.KeyRemove("WaitViewReady");
                    PublicPopupCtrl.Inst().HideWait();
                    ViewManager.Inst().CloseView(LoginView);
                }, 15, 1, false);
            }
            this.handleCollector.KeyAdd("WaitViewReady", FrameTimerHandle.Create(() => {
                if (readyChcek()) {
                    this.handleCollector.KeyRemove("WaitViewReady");
                    if (this._readyWatchdogTimer) {
                        Timer.Inst().CancelTimer(this._readyWatchdogTimer);
                        this._readyWatchdogTimer = null;
                    }
                    if (!this.ttime) {
                        this.ttime = Timer.Inst().AddRunTimer(() => {
                            PublicPopupCtrl.Inst().HideWait();
                            // ViewManager.Inst().CloseView(WaitView);
                            ViewManager.Inst().CloseView(LoginView);
                        }, 1.5, 1, false)
                    }
                }
            }, 1, 999999999, false));
        }
    }

    private refreshBgSize() {
        let self = this;
        let imgWidth = 800;//self.viewNode.bg.width;
        let imgHeight = 1500;//self.viewNode.bg.height;
        let scWidth = self.viewNode.fullscreen.width;
        let scHeight = self.viewNode.fullscreen.height;
        let imgAsp = imgWidth / imgHeight;
        let scAsp = scWidth / scHeight;
        // console.error(`screen:[${scWidth},${scHeight}],img:[${self.viewNode.bg.width},${self.viewNode.bg.height}]`);
        var scale = 1.0;
        if (imgAsp >= scAsp) {
            scale = scHeight / imgHeight;
        }
        else {
            scale = scWidth / imgWidth;
        }
        self.viewNode.bg.width = scale * imgWidth;
        self.viewNode.bg.height = scale * imgHeight;

    }
    DoOpenWaitHandle() {
        let self = this;
        let waitHandle = self.createWaitHandle("loadBG")
        self.AddWaitHandle(waitHandle);
        self.viewNode.logo.SetIcon(PackageData.Inst().getLogin_logo())
        self.viewNode.bg.SetIcon(PackageData.Inst().getLogin_bg(), () => {
            waitHandle.complete = true;
            self.refreshBgSize()
            // self.viewNode.bg.width = 1125 * (fgui.GRoot.inst.height / 1500);

            this.firstSceneCallBack()
        })
    }

    firstSceneCallBack() {
        let firstSceneEnd = (window as any)['firstSceneEnd'];
        if (firstSceneEnd) {
            firstSceneEnd();
            (window as any)['firstSceneEnd'] = undefined;
        }
        // let firstSceneEndAfter = (window as any)['firstSceneEndAfter'];
        // if (firstSceneEndAfter) {
        //     firstSceneEndAfter();
        //     (window as any)['firstSceneEndAfter'] = undefined;
        // }
        CameraManager.Inst().CameraShow();
        // View.instance.setDesignResolutionSize(800,2000,2);
        ViewManager.Inst().windowSizeChange();
        this.ReSetWindowSize();
    }

    WindowSizeChange() {
        this.refreshBgSize()
        // this.viewNode.bg.width = 1125 * (fgui.GRoot.inst.height / 1500);
    }

    private FlushPublishInfo() {
        let publish_info = LoginData.Inst().GetPublishInfo()
        UH.SetText(this.viewNode.PublishInfo, publish_info ? `${publish_info.company}\n${publish_info.game_num}` : "")
    }



    private freshCurrentId() {
        let self = this;
        self.currentInfo = LoginData.Inst().GetServerItemInfoById(self.resultData.currentId);
        self.viewNode.change.title = self.currentInfo.name;

    }


    private isLoginResult() {
        let self = this;
        if (self.resultData.result == LoginAckResult.LOGIN_RESULT_SUC) {
            // if (CreateRoleData.Inst().FinishCreateData.isFinishSign !== -1) {
            //     ViewManager.Inst().OpenView(CreateRoleView);
            // }
            // ViewManager.Inst().CloseView(LoginView);
            ChannelAgent.Inst().Behaveious(ConstValue.BehaveType.EnterServer)

        }
    }

    private isFinishCreate() {
        // if (CreateRoleData.Inst().IsCreateRole()) {
        //     ViewManager.Inst().CloseView(LoginView);
        // } else {
        //     ViewManager.Inst().OpenView(CreateRoleView);
        // }
        ViewManager.Inst().CloseView(LoginView);
    }

    private onClickLogin() {
        if (ChannelAgent.Inst().isAgent) {
            ChannelAgent.Inst().login()
            return
        }
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        let self = this;
        self.account = LoginData.Inst().GetLoginData().accountId = self.viewNode.accountInput.text;
        self.password = LoginData.Inst().GetLoginData().password = self.viewNode.passInput.text;
        if (self.account.length === 0) {
            return;
        }
        sys.localStorage.setItem("Account", self.account);
        sys.localStorage.setItem("PassWord", self.password);
        if (!LoginData.GetUrlParm())
            return;
        this.viewNode.ButtonLogin.visible = false;
        this.viewNode.login.visible = false;
        Main.Inst().MainLogin((uInfo: LoginVerify) => {
            this.onVerify(uInfo)
        });
    }

    public onVerify(uInfo: LoginVerify, showEneter = true) {
        let t = this;
        if (uInfo) {
            console.log("login openid = ", uInfo.user.openid);
            let param = new OPEM_PARAM()
            param.type = msgType.openid
            param.value = uInfo.user.openid
            ChannelAgent.Inst().postMessageToOD(param)

            this.viewNode.ButtonLogin.visible = false;
            t.viewNode.play.visible = showEneter;
            if (sys.platform != sys.Platform.WECHAT_GAME || PackageData.Inst().getIsDebug()) {
                t.viewNode.server.visible = true;
            }
            ChannelAgent.Inst().OnMessage(GameToChannel.showEnterGame)
            t.freshCurrentId();
        } else {
            this.viewNode.ButtonLogin.visible = true;
            if (!ChannelAgent.Inst().isAgent) {
                t.viewNode.login.visible = true;
            }
        }
    }

    private onClickPlay() {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_12006, Report2Type.par_12());
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10094, Report2Type.par_12());

        if (!CfgManager.Inst().IsLoadComplete(this.onClickPlay.bind(this))) {
            LogError("配置未加载完成，请重试");
            return;
        }
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10095, Report2Type.par_12());
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10100, Report2Type.par_12());

        AudioManager.Inst().Play(AudioTag.TongYongClick);
        Main.Inst().connect(LoginData.Inst().ResultData.currentId);
        // NetManager.Inst().ConnectServer(this.currentInfo.ip, this.currentInfo.port, this.sendLoginReq.bind(this));
        // ViewManager.Inst().CloseView(LoginView);
    }

    // private sendLoginReq(event: any) {
    //     if (event.type !== "error") {
    //         let self = this;
    //         var info: LoginInfo = {
    //             loginTime: Date.parse(new Date().toString()),
    //             loginStr: self.account,
    //             pname: self.account,
    //             server: self.currentInfo.id,
    //             platSpid: LoginData.Inst().palt_spid,
    //         }
    //         LoginCtrl.Inst().SendLoginReq(info);
    //     } else {
    //         PublicPopupCtrl.Inst().Center("服务器连接失败");
    //     }
    // }

    private onClickChange() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenView(ServerSelectView);
    }
    CloseCallBack(): void {
        ViewManager.Inst().OpenView(GuideView)
        Timer.Inst().CancelTimer(this.ttime)
        this.ttime = undefined;
        Timer.Inst().CancelTimer(this._readyWatchdogTimer);
        this._readyWatchdogTimer = undefined;
    }
    OpenCallBack(): void {
        PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10080, Report2Type.par_12());
        try {
            ViewManager.Inst().LoadCommonPack(() => {
                ViewManager.Inst().OpenView(MainView);
                ViewManager.Inst().OpenView(TopLayerView);
                //ViewManager.Inst().OpenView(OpenDataView)
            });
            // if (ViewManager.Inst().IsOpen(CreateRoleView)) {
            //     this.onClickLogin();
            //     ViewManager.Inst().CloseView(CreateRoleView);
            // }
            Main.Inst().RequestUserProtocol();

            AudioManager.Inst().PlayBg(AudioTag.ZhuJieMian);

            if (ChannelAgent.Inst().isAgent) {
                this.viewNode.login.visible = false;
                this.viewNode.ButtonLogin.visible = false;
                ChannelAgent.Inst().login()
            }
        } catch (e) {
            ChannelAgent.Inst().reportError(ERRORCODE.err2)
            PreloadToolFuncs.report2(Report2Type.ID_12, Report2Type.ID_10270, Report2Type.par_12());
            ChannelAgent.Inst().wxModal("提示", "登录出错，请检查网络状态后重试", () => {
                ChannelAgent.Inst().RestartProgram();
                // let MainAgent = (window as any)['MainAgent'];
                // MainAgent.exitMiniProgram();
            }, null, false);
        }
    }

    private onClickNotice() {
        AnnounceCtrl.Inst().TryOpenAnnounce()
    }

    private ShowUserProtocol() {
        let user_data = LoginData.Inst().GetLoginUserProtocol();
        // this.viewNode.BtnProtocol.visible = user_data != null;
        this.viewNode.BtnProtocol.visible =false;
    }

    private onClickAgeTip() {
        ViewManager.Inst().OpenView(AgeTipView);
    }

    private onClickProtocol() {
        ViewManager.Inst().OpenView(UserProtocolView);
    }

}
import { _decorator, Component, sys } from 'cc';
import { DEBUG, PREVIEW, DEV } from 'cc/env';
import { NodePools } from 'core/NodePools';
import { CtrlManager } from 'manager/CtrlManager';
import { MsgIdManger } from 'manager/MsgIdManger';
import { NetManager } from 'manager/NetManager';
import { ViewManager } from 'manager/ViewManager';
import { CommonEvent } from 'modules/common/CommonEvent';
import { EventCtrl } from 'modules/common/EventCtrl';
import { Language } from 'modules/common/Language';
import { FillView } from 'modules/fillblank/FillView';
import { LoginView } from 'modules/login/LoginView';
import { MaskView } from 'modules/main/MaskView';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { Main } from './proload/Main';
import { ReportManager, ReportType } from './proload/ReportManager';
import { WaitView } from 'modules/login/WaitView';
import { LoginData } from "modules/login/LoginData";




const { ccclass, property } = _decorator;

@ccclass('GameStart')
export class GameStart extends Component {
    private managerInitCount: number = 0;
    private needInitCount: number = 2;

    onLoad() {
    }
    start() {
        let self = this;
        Main.Inst();
        NetManager.Inst().Init();
        // CameraManager.Inst().Init();
        ViewManager.Inst().Init(() => {
            MsgIdManger.Inst().Init();
            CtrlManager.Inst().Init();
            self.managerInitCount++;
            self.initComplete()
            ViewManager.Inst().OpenView(FillView);
            ViewManager.Inst().OpenView(MaskView);
        });
        NodePools.Inst().Init(() => {
            self.managerInitCount++;
            self.initComplete()
        });
        // InputManager.Inst().Init();
    }

    private initComplete() {
        let self = this;
        if (self.managerInitCount === self.needInitCount) {
            self.gameStart();
            self.managerInitCount = 0;
        }
    }

    private gameStart() {
        EventCtrl.Inst().on(CommonEvent.NET_CLOSE, this.onClose, this);
        EventCtrl.Inst().on(CommonEvent.NET_RECONS, this.onRecons, this);
        EventCtrl.Inst().on(CommonEvent.NET_RECON, this.onRecon, this);
        EventCtrl.Inst().on(CommonEvent.LOGIN_SUCC, this.onCon, this);
        ReportManager.Inst().sendPoint(ReportType.openGame);
        Main.Inst().MainStart();
    }

    update() {
    }

    private onRecons() {
        PublicPopupCtrl.Inst().ShowWait(Language.Login.WaitTips.def);
         if (!ViewManager.Inst().IsOpen(WaitView)) {
             ViewManager.Inst().OpenView(WaitView);
         }
    }

    private onRecon() {
         let currentInfo = LoginData.Inst().GetServerItemInfoById(LoginData.Inst().ResultData.currentId);
         PublicPopupCtrl.Inst().ShowWait(Language.Login.WaitTips.def);
         NetManager.Inst().ConnectServer(currentInfo.ip, currentInfo.port, Main.Inst().sendLoginReq.bind(Main.Inst()),999);
         if (!ViewManager.Inst().IsOpen(WaitView)) {
             ViewManager.Inst().OpenView(WaitView);
             NetManager.Inst().ConnectServer(currentInfo.ip, currentInfo.port, Main.Inst().sendLoginReq.bind(Main.Inst()));
         } else {

             NetManager.Inst().ConnectServer(currentInfo.ip, currentInfo.port, Main.Inst().sendLoginReq.bind(Main.Inst()), NetManager.Inst().AutoReconnect());
         }
    }

    private onClose() {
        if (!ViewManager.Inst().IsOpen(LoginView)) {
            NetManager.Inst().NetNodeStateClosed();
            ViewManager.Inst().OpenView(LoginView);
        }
    }

    private onCon() {
         PublicPopupCtrl.Inst().HideWait();
         if (ViewManager.Inst().IsOpen(WaitView)) {
             ViewManager.Inst().CloseView(WaitView);
         }
    }
}
export const IS_EDITOR = DEBUG && PREVIEW && DEV && sys.isMobile == false;
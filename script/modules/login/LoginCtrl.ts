import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonTipData, CommonTipView } from "modules/common_help/CommonTipView";

import { NetManager } from "manager/NetManager";
import { ViewManager } from "manager/ViewManager";
import { Language } from "modules/common/Language";
import { PackageData } from "preload/PkgData";
import { Main } from "../../proload/Main";
import { LoginView } from "./LoginView";

export type LoginInfo = {
    loginTime: number;
    loginStr: string;
    pname: string;
    server: number;
    platSpid: number;

}

export class LoginCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCHeartbeatResp, func: this.recvHeartbeatResp },
            { msgType: PB_SCLoginToAccount, func: this.recvLoginResult },
            { msgType: PB_SCDisconnectNotice, func: this.recvDisconnectNotice }
        ]
    }

    private recvDisconnectNotice(data: PB_SCDisconnectNotice) {
        if (1 == data.reason) {
            ViewManager.Inst().OpenView(CommonTipView, new CommonTipData(Language.Login.OtherLoginTitle, Language.Login.OtherLoginTips, () => {
                NetManager.Inst().NetNodeStateClosed();
                ViewManager.Inst().OpenView(LoginView);
            }));
        }
    }

    private recvHeartbeatResp() {

    }

    private recvLoginResult(data: PB_SCLoginToAccount) {
        Main.Inst().onLoginResult(data)
    }

    public SendLoginReq(data: LoginInfo) {
        let self = this;
        let protocol = self.GetProtocol(PB_CSLoginToAccount);
        protocol.loginTime = data.loginTime;
        protocol.loginStr = data.loginStr;
        protocol.pname = data.pname;
        protocol.server = data.server;
        protocol.platSpid = data.platSpid;
        protocol.deviceId = PackageData.Inst().getDevice()
        this.SendToServer(protocol);
    }
}


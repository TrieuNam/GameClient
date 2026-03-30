
import * as fgui from "fairygui-cc";
import { BasePanel } from "modules/common/BasePanel";
import { ROLE_SETTING_TYPE } from "modules/common/CommonEnum";
import { RoleData } from "modules/role/RoleData";
import { AudioManager } from "modules/audio/AudioManager";
import { LoginData } from "modules/login/LoginData";
import { ViewManager } from "manager/ViewManager";
import { UserProtocolView } from "modules/UserProtocol/UserProtocolView";
import { LogError } from "core/Debugger";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { HTTP } from "../../helpers/HttpHelper";
import { AnnounceCtrl } from "modules/Announce/AnnounceCtrl";
import { Language } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { FairyGUI } from "csharp";
import { MD5 } from "../../helpers/MD5";
import { PackageData } from "preload/PkgData";

export class RoleSettingSettingPanel extends BasePanel {

    protected viewNode = {
        TogMusic: <fgui.GButton>null,
        TogAudio: <fgui.GButton>null,
        TogVibrate: <fgui.GButton>null,
        BtnProto: <fgui.GButton>null,
        InputField: <fgui.GTextInput>null,
        InputTips: <fgui.GTextField>null,
        BtnExchange: <fgui.GButton>null,
        BtnNotice: <fgui.GButton>null,
    };

    InitPanelData() {
        this.viewNode.TogMusic.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.TogAudio.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.TogVibrate.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);
        this.viewNode.BtnProto.onClick(this.OnClickUserProtocol.bind(this));
        this.viewNode.BtnExchange.onClick(this.OnClickExchange.bind(this));
        this.viewNode.BtnNotice.onClick(this.OnClickNotice.bind(this));
        this.viewNode.InputField.on(fgui.Event.TEXT_CHANGE, () => {
            this.viewNode.InputTips.visible = "" == this.viewNode.InputField.text
        })
    }

    InitPanel() {
        this.FlushSetingInfo()
    }

    FlushSetingInfo() {
        this.viewNode.TogMusic.selected = 0 == RoleData.Inst().GetRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingMusic)
        this.viewNode.TogAudio.selected = 0 == RoleData.Inst().GetRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingAudio)
        this.viewNode.TogVibrate.selected = 0 == RoleData.Inst().GetRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingVibrate)
    }


    private OnClickExchange() {
        let ex_card = LoginData.GetUrlParm().param_list.gift_fetch_url
        // LogError("?sfed" , this.viewNode.InputField.text)

        if (this.viewNode.InputField.text == "") {
            PublicPopupCtrl.Inst().Center(Language.CDKeyExchange.EmptyHint)
            return
        }

        let orgin_sign = PackageData.Inst().getSpid() + LoginData.Inst().ResultData.currentId + LoginData.Inst().GetLoginData().accountId +
            RoleData.Inst().GetRoleId() + RoleData.Inst().GetRoleLevel() + this.viewNode.InputField.text + Math.floor(TimeCtrl.Inst().ServerTime) +
            "33cc62b07ae98fffddd923b178aa0a14"

        // let orgin_sign = "{$this->input["+"dev"+"]}"+
        // "{$this->input["+LoginData.Inst().ResultData.currentId+"]}"+
        // "{$this->input["+LoginData.Inst().GetLoginData().accountId+"]}"+
        // "{$this->input["+RoleData.Inst().GetRoleId()+"]}"+
        // "{$this->input["+RoleData.Inst().GetRoleLevel()+"]}"+
        // "{$this->input["+this.viewNode.InputField.text+"]}"+
        // "{$this->input["+Math.floor(TimeCtrl.Inst().ServerTime)+"]}"+
        // "33cc62b07ae98fffddd923b178aa0a14"
        // let sign = FairyGUI.BuilderUtil.Encrypt_MD5(orgin_sign)

        // LogError("sign:",orgin_sign)
        let url = ex_card +
            "?spid=" + PackageData.Inst().getSpid() +
            "&server=" + LoginData.Inst().ResultData.currentId +
            "&user=" + LoginData.Inst().GetLoginData().accountId +
            "&role=" + RoleData.Inst().GetRoleId() +
            "&level=" + RoleData.Inst().GetRoleLevel() +
            "&vip=" + "0" +
            "&card=" + this.viewNode.InputField.text +
            "&time=" + Math.floor(TimeCtrl.Inst().ServerTime) +
            "&sign=" + MD5.encode(orgin_sign)
        HTTP.GetJson(url, this.ExchangeRet.bind(this));


        // LogError("?Dsaf",url)
    }

    private ExchangeRet(statusCode: number, resp: any) {
        // LogError("?dgge",statusCode)
        // LogError("?data",resp)
        if (resp.ret > -1) {
            PublicPopupCtrl.Inst().Center(Language.CDKeyExchange.RetCode[resp.ret])
        }
    }

    private OnClickNotice() {
        AnnounceCtrl.Inst().TryOpenAnnounce()
    }

    onChangedEnd(target: fgui.GComponent) {
        switch (target._name) {
            case "TogMusic":
                RoleData.Inst().ChangeRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingMusic, this.viewNode.TogMusic.selected ? 0 : 1)
                if (this.viewNode.TogMusic.selected) {
                    AudioManager.Inst().RePlayBg()
                } else {
                    AudioManager.Inst().StopBg()
                }
                break;
            case "TogAudio":
                RoleData.Inst().ChangeRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingAudio, this.viewNode.TogAudio.selected ? 0 : 1)
                break;
            case "TogVibrate":
                RoleData.Inst().ChangeRoleSystemSetInfo(ROLE_SETTING_TYPE.SettingVibrate, this.viewNode.TogVibrate.selected ? 0 : 1)
                break;
        }
    }

    private OnClickUserProtocol() {
        if (LoginData.Inst().GetLoginUserProtocol())
            ViewManager.Inst().OpenView(UserProtocolView)
    }
}

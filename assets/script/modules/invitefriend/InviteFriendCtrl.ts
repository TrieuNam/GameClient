import { LogError } from "core/Debugger";
import { RemindRegister } from "data/HandleCollectorCfg";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { LoginData } from "modules/login/LoginData";
import { RoleData } from "modules/role/RoleData";
import { HTTP } from "../../helpers/HttpHelper";
import { ChannelAgent, GameToChannel } from "../../proload/ChannelAgent";
import { InviteFriendData } from "./InviteFriendData";


export class InviteFriendCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaFriendInfo, func: this.OnInviteFriendInfo }
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.InviteFriend, InviteFriendData.Inst().ResultData, InviteFriendData.Inst().GetAllRed.bind(InviteFriendData.Inst())));
        EventCtrl.Inst().on(CommonEvent.LOGIN_SUCC_ROLEDATA, this.check, this);
    }
    private check() {
        EventCtrl.Inst().on(CommonEvent.PACK_WX_BE_AROUSESHARESUC, this.onShare, this);
        ChannelAgent.Inst().OnMessage(GameToChannel.arouseShareCheck)
    }
    private OnInviteFriendInfo(data: PB_SCRaFriendInfo) {
        // LoginData.Inst().resultData.result = data.result;
        LogError("3020 邀请信息?PB_SCRaFriendInfo", data)
        InviteFriendData.Inst().OnInviteFriendInfo(data);
        let id = RoleData.Inst().GetRoleId()
        LogError("id = " + id)
    }

    public InviteFriend() {
        let msg = "" + ACTIVITY_TYPE.InviteFriend + "-" + LoginData.Inst().GetLoginRespUserData().uid + "-" + RoleData.Inst().GetRoleId() + "-" + LoginData.Inst().GetCurServerInfo().id
        ChannelAgent.Inst().OnMessage(GameToChannel.arouseShare, msg);
    }

    private onShare(param: string) {
        let params = param.split("-");
        let act_id: number = +params[0];
        if (act_id == ACTIVITY_TYPE.InviteFriend) {
            let s_uid: string = params[1];
            let s_roleId: string = params[2];
            let s_serverId: string = params[3];
            let url = `${LoginData.GetUrlParm().param_list.wx_shareplay_url}?userId=${LoginData.Inst().GetLoginRespUserData().uid}&share_userId=${s_uid}&roleId=${RoleData.Inst().GetRoleId()}&share_roleId=${s_roleId}&share_serverId=${s_serverId}`
            HTTP.GetJson(url, (statusCode: number, resp: any, respText: string) => {
                // console.log(respText);
            })
        }
    }
}


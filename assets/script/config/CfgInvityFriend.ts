import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem } from "./CfgCommon";

const resPath = "config/baozilaile_auto";

export function _CreateCfgInviteFriend(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgInviteFriendData = <_CfgInviteFriendData>jsonAss.json;
        Debugger.ExportGlobalForDebug("CfgSkillSystem", CfgInviteFriendData);
        func(err == null);
    })
}

class CfgInviteFriendOther {
    type:number;
    invitation_friend_num:number;
    reward_item:CfgItem[];
}


class _CfgInviteFriendData {
    reward:CfgInviteFriendOther[];
}

export let CfgInviteFriendData: _CfgInviteFriendData = null;
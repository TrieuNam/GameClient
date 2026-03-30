import { CfgInviteFriendData } from "config/CfgInvityFriend";
import { LogError } from "core/Debugger";
import { bit } from "core/net/bit";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { DataBase } from "../../data/DataBase";


class InviteFriendSmartData {
    @smartdata
    result: PB_SCRaFriendInfo;
}


export class InviteFriendData extends DataBase {
    public ResultData: InviteFriendSmartData;
    private InvteFriendInfo: PB_SCRaFriendInfo;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.ResultData = CreateSMD(InviteFriendSmartData);
    }

    public OnInviteFriendInfo(data: PB_SCRaFriendInfo) {
        this.InvteFriendInfo = data
        this.ResultData.result = data
    }

    public GetInviteList() {
        let cfg = CfgInviteFriendData.reward;

        let data = [];
        let info
        for (const cards of cfg) {
            let num = (cards.invitation_friend_num <= this.GetInviteJindu() && this.GetInviteIsGet(cards.type)) ? cards.type : 1000 - cards.type
            info = {
                type: cards.type,
                pai: num,
                invitation_friend_num: cards.invitation_friend_num,
                reward_item: cards.reward_item,
            }
            data.push(info);
        }
        data.sort((a: any, b: any) => {
            let sortNumber = 0
            if (a.pai < b.pai) {
                sortNumber = 1;
            }
            if (a.pai > b.pai) {
                sortNumber = -1;
            }
            return sortNumber
        });
        return data
    }

    public GetInviteJindu() {
        return this.InvteFriendInfo.friendCount
    }

    public GetInviteIsGet(type: number) {
        // return false
        // return bit.d2b(this.InvteFriendInfo.rewardFlag)[32-type] == 1
        if (this.InvteFriendInfo && this.InvteFriendInfo.rewardFlag != undefined) {
            return bit.d2b(this.InvteFriendInfo.rewardFlag)[32 - type] == 1
        }
        return false
    }

    public SendInviteAllInfo() {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.InviteFriend, 0)
    }

    public SendInviteGetReward(seq: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.InviteFriend, 1, seq)
    }

    public GetAllRed() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.InviteFriend)) {
            return 0;
        } 
        let cfg = this.GetInviteList()
        let invite_num = this.GetInviteJindu()
        for (const info of cfg) {
            if (info.invitation_friend_num <= invite_num && !this.GetInviteIsGet(info.type)) {
                return 1
            }
        }
        return 0
    }

    public GetInviteIsClose() {
        let cfg = CfgInviteFriendData.reward;
        for (const info of cfg) {
            if (!this.GetInviteIsGet(info.type)) {
                return true
            }
        }
        return false

    }
}   

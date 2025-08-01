import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMod, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RemindCtrl } from 'modules/remind/RemindCtrl';
import { ServerActivityData } from './ServerActivityData';
import { ServerActivityView } from './ServerActivityView';

export class ServerActivityCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            //{ msgType: PB_SCLoginToAccount, func: this.recvLoginResult }
        ]
    }
    protected initCtrl() {
        this.OnInits();
        // this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.view, ServerActivityData.Inst().ResultData, ServerActivityData.Inst().GetAllRed.bind(ServerActivityData.Inst())));
    }
    /*
    private recvLoginResult(data: PB_SCLoginToAccount) {
        LoginData.Inst().resultData.result = data.result;
    }
    */
    private OnInits() {
        //监听红点
        // RemindCtrl.Inst().RegisterGroup(Mod.ServerActivity,() => { ServerActivityData.Inst().FlushRedPoint()}, true)

    }
    ModCfg(): regMod[] {
        return [
            { modKey: Mod.ServerActivity.AdEquity, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.MonthlyCardFish, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.WarOrder, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.ScoreFund, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.TodayShare, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.DailyGift, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.MonthlyCard, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.InviteFriend, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.LevelFund, vClass: ServerActivityView },
            { modKey: Mod.ServerActivity.BoxFund, vClass: ServerActivityView },
        ]
    }

}


import { RemindRegister } from 'data/HandleCollectorCfg';
import { BaseCtrl, regMod, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { RemindCtrl } from 'modules/remind/RemindCtrl';
import { MoreServerActivityData } from './MoreServerActivityData';
import { MoreServerActivityView } from './MoreServerActivityView';

export class MoreServerActivityCtrl extends BaseCtrl {

    MsgCfg(): regMsg[] {
        return [
            //{ msgType: PB_SCLoginToAccount, func: this.recvLoginResult }
        ]
    }
    protected initCtrl() {
        this.OnInits();

        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.view, MoreServerActivityData.Inst().ResultData, MoreServerActivityData.Inst().GetAllRed.bind(MoreServerActivityData.Inst())));
    }
    /*
    private recvLoginResult(data: PB_SCLoginToAccount) {
        LoginData.Inst().resultData.result = data.result;
    }
    */
    private OnInits() {
        //监听红点
        RemindCtrl.Inst().RegisterGroup(Mod.MoreServer,() => { MoreServerActivityData.Inst().FlushRedPoint()}, true)
        
    }

    ModCfg(): regMod[] {
        return [
            { modKey: Mod.MoreServer.CommodityGuild, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.CaveLoot, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.WeekendRecharge, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.BoxManor, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.AffordPresent, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.WeekHaoLi, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.NewServerCompetition, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.WeekLianChong, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.ShenQiDuoBao, vClass: MoreServerActivityView },
            { modKey: Mod.MoreServer.JiFenChouJiang, vClass: MoreServerActivityView },
        ]
    }
}


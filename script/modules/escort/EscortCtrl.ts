import { RemindRegister } from 'data/HandleCollectorCfg';
import { Item } from 'modules/bag/ItemData';
import { ENUM_BATTLE } from 'modules/battle/BattleConf';
import { BattleCtrl } from 'modules/battle/BattleCtrl';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { CommonEvent } from 'modules/common/CommonEvent';
import { EventCtrl } from 'modules/common/EventCtrl';
import { Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { TimeCtrl } from 'modules/time/TimeCtrl';
import { Timer } from 'modules/time/Timer';
import { DataHelper } from '../../helpers/DataHelper';
import { Format } from '../../helpers/TextHelper';
import { EscortData, ESCORT_OPER_TYPE, ESCORT_RET_TYPE, SEscortReport } from './EscortData';

export class EscortCtrl extends BaseCtrl {
    data: EscortData = EscortData.Inst()
    handle: any = null;
    handle_list: {}[] = []
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCEscortRet, func: this.recvEscortResult },
            { msgType: PB_SCEscortRoleInfo, func: this.recvEscortRoleInfo },
            { msgType: PB_SCEscortShipListInfo, func: this.recvEscortShipListInfo },
            { msgType: PB_SCEscortReportListInfo, func: this.recvEscortReportListInfo },
            { msgType: PB_SCEscortInterceptListInfo, func: this.recvEscortInterceptListInfo },
            { msgType: PB_SCEscortShipInfo, func: this.recvEscortShipInfo },
        ]
    }
    initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Dungeon.Escort, this.data.FlushData, this.data.GetRedPoint.bind(this.data)));
        EventCtrl.Inst().on(CommonEvent.FIRST_GET_SEVER_TIME, this.StartGhostTimer, this, true);
    }

    private recvEscortResult(data: PB_SCEscortRet) {
        this.data.ResultData = data;
        //console.log(data);
        if (data.type == ESCORT_RET_TYPE.SHIP_UP) {
            if (data.p1 == 1) {
                //ViewManager.Inst().OpenView(EscortQualityUp, data.p2)
            } else {
                PublicPopupCtrl.Inst().Center(Language.Escort.QuaNoChange)
            }
        } else if (data.type == ESCORT_RET_TYPE.SET_SAIL) {
            //启航请求一下记录列表
            this.SendEcsortReq(ESCORT_OPER_TYPE.SHIP_LIST_INFO_REQ)
            this.SendEcsortReq(ESCORT_OPER_TYPE.REPORT_LIST_INFO_REQ)
            this.SendEcsortReq(ESCORT_OPER_TYPE.INTERCEPT_LIST_INFO_REQ)
        } else if (data.type == ESCORT_RET_TYPE.TARGET_INTERCEPT) {
            //PublicPopupCtrl.Inst().Center("拦截" + data.p1 + "号船成功，被拦截次数为"     + data.p2)
            //console.log("拦截" + data.p1 + "号船成功，被拦截次数为" + data.p2);
            this.SendEcsortReq(ESCORT_OPER_TYPE.SHIP_LIST_INFO_REQ)
            this.SendEcsortReq(ESCORT_OPER_TYPE.INTERCEPT_LIST_INFO_REQ)

        } else if (data.type == ESCORT_RET_TYPE.HELP) {
            PublicPopupCtrl.Inst().Center(Language.Escort.HelpTip)
            this.SendEcsortReq(ESCORT_OPER_TYPE.SHIP_LIST_INFO_REQ)
        } else if (data.type == ESCORT_RET_TYPE.ADD_REPORT) {
            //有新纪录显示红点
            //console.log("记录信息新增1111");
            this.data.new_report = true
            this.data.FlushData.flush_role_info = !this.data.FlushData.flush_role_info
        } else if (data.type == ESCORT_RET_TYPE.DAMAGE_CHANGE) {
            this.data.RoleData.maxDamage = data.p1;
            this.data.FlushData.flush_ghost = !this.data.FlushData.flush_ghost;
            this.data.FlushData.flush_ghost_reward_index = !this.data.FlushData.flush_ghost_reward_index;
        } else if (data.type == ESCORT_RET_TYPE.HARM_REWARD) {
            this.data.RoleData.rewardIndex = data.p1;
            this.data.FlushData.flush_ghost = !this.data.FlushData.flush_ghost;
        }
    }
    //注意smdata的类型要一致才会刷新不然就不会，就算字段一样也不会
    recvEscortRoleInfo(data: PB_SCEscortRoleInfo) {
        this.data.RoleData = data;
        this.data.FlushData.flush_role_info = !this.data.FlushData.flush_role_info;
        //console.log(data);
    }
    public SendEcsortReq(type?: number, p1?: number) {
        if (type == ESCORT_OPER_TYPE.INTERCEPT) {
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.ESCORT_INTERCEPT, ESCORT_OPER_TYPE.INTERCEPT, p1);
        } else if (type == ESCORT_OPER_TYPE.OPER_BOSS_FIGHT) {
            EscortData.Inst().ClearFirstRemind();
            this.data.FlushData.flush_ghost_reward_index = !this.data.FlushData.flush_ghost_reward_index;
            BattleCtrl.Inst().reqFight(ENUM_BATTLE.ESCORT_BOSS, type);
        } else {
            let protocol = this.GetProtocol(PB_CSEscortReq);
            protocol.type = type ?? 0
            protocol.p1 = p1 ?? 0
            this.SendToServer(protocol);
            //console.log("请求护送协议", protocol)
        }
    }

    recvEscortShipListInfo(data: PB_SCEscortShipListInfo) {
        //console.log("船只列表信息", data);
        this.data.MyShip = data.myShip;
        this.data.ShipList = data.shipList;
        this.data.FlushData.flush_ship_list = !this.data.FlushData.flush_ship_list
        this.handle_list.forEach(element => {
            Timer.Inst().CancelTimer(element);
        });
        this.handle_list = []
        if (this.data.MyShip != null && this.data.MyShip.length > 0) {
            this.data.MyShip.forEach(element => {
                if(element.overTime > TimeCtrl.Inst().ClientTime){
                    let handle = Timer.Inst().AddCountDownCT(this.update_func.bind(this), this.complete_func.bind(this), element.overTime)
                    this.handle_list.push(handle)
                }
            });
            /* if (this.data.MyShip[0].overTime > TimeCtrl.Inst().ClientTime) {
                //开个倒计时
                if (this.handle != null) {
                    Timer.Inst().CancelTimer(this.handle);
                }
                //console.log("开启倒计时了");
                this.handle = Timer.Inst().AddCountDownCT(this.update_func.bind(this), this.complete_func.bind(this), this.data.MyShip[0].overTime)
            } */
        }
    }
    update_func() {
        
    }
    complete_func() {
        //this.data.FlushData.flush_role_info = !this.data.FlushData.flush_role_info
        this.data.FlushData.flush_ship_list = !this.data.FlushData.flush_ship_list
    }
    recvEscortReportListInfo(data: PB_SCEscortReportListInfo) {
        //console.log(data);
        //console.log("收到护送记录列表");
        let new_data: SEscortReport[] = []
        for (let index = 0; index < data.reportList.length; index++) {
            let temp = new SEscortReport();
            temp.report_desc = DataHelper.BytesToString(data.reportList[index]);
            temp.report_time = data.reportTime[index];
            temp.result = temp.report_desc.match(/{.*}/)
            if (temp.result != null) {
                let str_list = temp.result[0].split(",")
                let str = temp.report_desc.slice(0, temp.result.index)
                for (let index = 0; index < str_list.length; index++) {
                    const element = str_list[index];
                    if (index != str_list.length - 1) {
                        str = str + this.exe((element.split(";"))) + ",";
                    } else {
                        str = str + this.exe((element.split(";")));
                    }
                }
                temp.result_str = str
            } else {
                temp.result_str = temp.report_desc
            }
            new_data.push(temp)
        }
        this.data.ReportData = new_data
        this.data.FlushData.flush_report = !this.data.FlushData.flush_report
    }
    exe(str_list: string[]) {
        let str = ""
        if (str_list[0] == "{i") {
            let num = str_list[2].slice(0, str_list[2].length - 1)
            str = str + Format(Language.Escort.ItemDesc, Item.GetName(+str_list[1]), +num)
        }
        return str
    }
    recvEscortInterceptListInfo(data: PB_SCEscortInterceptListInfo) {
        //console.log("拦截列表下发");
        //console.log(data);

        this.data.InterceptData = data;
        this.data.FlushData.flush_intercept = !this.data.FlushData.flush_intercept
    }
    recvEscortShipInfo(data: PB_SCEscortShipInfo) {
        //console.log("请求船只信息下发");

        //console.log(data);
        this.data.ShipInfoList[data.info.ship.shipKey] = data.info;
    }

    public StartGhostTimer() {
        EscortData.GhostTimer();
    }

    protected onDestroy() {
        super.onDestroy();
        Timer.Inst().CancelTimer(EscortData.Inst().ghost_timer);
    }
}


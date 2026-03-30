import { CfgActivityData } from "config/CfgActivity";
import { CreateSMD, smartdata } from "data/SmartData";
import { SMDMap } from "data/SMDMap";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { NewServerCompetitionCtrl } from "modules/new_server_competition/NewServerCompetitionCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataBase } from "../../data/DataBase";
import { ACTIVITY_TYPE, ActStatusType } from "./ActivityEnum";
import { ActivityRandData } from "./ActivityRandData";

export class ActivityResultData {
    @smartdata
    is_activity_status_change: boolean;//当前激活活动变化[用于活动列表监听]
}

export class ActivityData extends DataBase {
    private result_data: ActivityResultData;
    private activity_status_event: PB_SCActivityStatus;
    public activity_status_list: { [act_type: number]: PB_SCActivityStatus } = {};
    public activity_status_notify: SMDMap<number, boolean>;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.activity_status_notify = CreateSMD<SMDMap<number, boolean>>(SMDMap);
        this.result_data = CreateSMD(ActivityResultData);
    }

    public SetActivityStatus(protocol: PB_SCActivityStatus) {
        this.CheckActivityStatusChange(protocol);
        this.activity_status_event = protocol;
        this.activity_status_list[protocol.activityType] = protocol;
        this.activity_status_notify.set(protocol.activityType, !this.activity_status_notify.get(protocol.activityType));
    }

    public get ResuleData() {
        return this.result_data;
    }
    //检查当前激活活动是否变化
    private CheckActivityStatusChange(protocol: PB_SCActivityStatus) {
        if (this.activity_status_event && protocol.activityType == this.activity_status_event.activityType && this.activity_status_event.status == protocol.status)
            return;
        if (protocol.status == ActStatusType.Close) {
            ActivityRandData.Inst().OpenClose(protocol.activityType);
        };
        this.CheckRandOpenData();
        this.CheckRandOpenOthers(protocol);
    }

    // 主界面随机活动图标强制手动刷新
    public CheckRandOpenData() {
        this.result_data.is_activity_status_change = !this.result_data.is_activity_status_change;
    }

    public CheckRandOpenOthers(protocol: PB_SCActivityStatus) {
        if (protocol.status == ActStatusType.Open) {
            if (protocol.activityType == ACTIVITY_TYPE.NewServerCompetition) {
                let res = FunOpen.Inst().GetFunIsOpen(Mod.MoreServer.NewServerCompetition)
                if (res.is_open) {
                    NewServerCompetitionCtrl.Inst().SendRandActivityOperaReqEndTimes();
                }
            }
        };
    }

    //获取活动信息 活动状态接口
    public GetActivityStatusInfo(act_type: ACTIVITY_TYPE) {
        return this.activity_status_list[act_type];
    }

    //获取当前激活活动状态
    public GetActivityEventStatus() {
        let status = this.activity_status_event.status;
        return status ? status : ActStatusType.Close;
    }

    //获取当前激活活动
    public GetActivityEvent() {
        return this, this.activity_status_event;
    }

    //获取活动状态
    public GetActivityStatus(act_type: ACTIVITY_TYPE): ActStatusType {
        let status_info = this.GetActivityStatusInfo(act_type);
        if (!status_info)
            return ActStatusType.Close;
        return status_info.status;
    }

    //活动状态是否开启
    public IsOpen(act_type: ACTIVITY_TYPE): boolean {
        return this.GetActivityStatus(act_type) == ActStatusType.Open;
    }

    //获取活动开启时间戳
    public GetStartStampTime(act_type: ACTIVITY_TYPE): number {
        let act_info = this.GetActivityStatusInfo(act_type)
        return act_info ? act_info.param_1 : 0;
    }

    //获取活动结束时间戳
    public GetEndStampTime(act_type: ACTIVITY_TYPE) {
        let act_info = this.GetActivityStatusInfo(act_type);
        return act_info ? act_info.param_2 : 0;
    }

    //获取活动下一个状态的时间戳 或 活动结束时间戳
    public GetNextStateStampTime(act_type: ACTIVITY_TYPE) {
        let act_info = this.GetActivityStatusInfo(act_type);
        return act_info ? act_info.nextStatusSwitchTime : 0;
    }
    
}
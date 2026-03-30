import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { RoleData } from "modules/role/RoleData";
import { PackageData } from "preload/PkgData";
import { ChannelAgent } from "../../proload/ChannelAgent";
import { TaskData } from "./TaskData";
import { PreloadToolFuncs, Report2Type } from "preload/PreloadToolFuncs";


export class TaskCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCTaskProgressInfo, func: this.recvTaskInfo }
        ]
    }

    private recvTaskInfo(data: PB_SCTaskProgressInfo) {
        TaskData.Inst().setTaskInfo(data);
    }

    public SendFetchTaskReq() {
        const curTask = TaskData.Inst().GetCurTaskInfo();
        if (!curTask || !curTask.cfg) {
            console.warn("[TaskCtrl] SendFetchTaskReq skipped: current task is missing");
            return;
        }

        let protocol = this.GetProtocol(PB_CSFetchTaskRewardReq);
        let cfg_task = curTask.cfg;
        let exp = RoleData.Inst().GetRoleExp();
        PreloadToolFuncs.report2(Report2Type.ID_13, cfg_task.task_id + "", [cfg_task.guide_id, "-", exp + "", cfg_task.condition, PackageData.Inst().getDevice()]);
        this.SendToServer(protocol);
    }
}

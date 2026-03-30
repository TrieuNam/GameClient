import { CfgTaskData, CfgTaskList } from "config/CfgTask";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from 'data/SmartData';

export class TaskResultData {
    @smartdata
    is_change: boolean;
}

export class TaskData extends DataBase {
    public result_info: TaskResultData;
    private task_info: PB_SCTaskProgressInfo;
    private last_task_info: PB_SCTaskProgressInfo;
    private task_cfg: { [task_id: number]: CfgTaskList }
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_info = CreateSMD(TaskResultData);
    }
    protected onSwitch(): void {
        this.task_info = undefined;
        this.last_task_info = undefined;
    }
    public setTaskInfo(data: PB_SCTaskProgressInfo) {
        this.last_task_info = this.task_info
        this.task_info = data;
        this.result_info.is_change = !this.result_info.is_change;
    }
    public getTaskInfo() {
        return this.task_info;
    }
    public getLastTaskInfo(){
        return this.last_task_info
    }
    public GetCurTaskInfo() {
        let task_info = this.getTaskInfo();
        let cfg = null;
        if (task_info) {
            cfg = this.GetTaskCfg(task_info.id);
        }
        if (cfg) {
            return { cfg: cfg, pro: task_info.progress };
        }
        return null;
    }

    /**根据任务id判断任务是否完成 */
    public IsTaskFinish(id: number) {
        let task_info = this.task_info;
        if (!task_info) {
            return false;
        }
        let is_finish = false;
        if (task_info.id > id) {
            is_finish = true;
        } else if (task_info.id == id) {
            let cfg = this.GetTaskCfg(task_info.id);
            is_finish = task_info.progress >= cfg.task_plan;
        }
        return is_finish;
    }

    /**根据任务id获取配置 */
    public GetTaskCfg(task_id: number) {
        if (!this.task_cfg) {
            this.task_cfg = {};
            let cfg = CfgTaskData.task_list;
            for (let i = 0; i < cfg.length; i++) {
                this.task_cfg[cfg[i].task_id] = cfg[i];
            }
        }
        return this.task_cfg[task_id];
    }
}


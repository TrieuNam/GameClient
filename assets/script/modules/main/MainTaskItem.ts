import { CfgTaskData } from "config/CfgTask";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Item } from "modules/bag/ItemData";
import { COLORSTR } from "modules/common/ColorEnum";
import { ICON_TYPE, ITEM_BIG_TYPE } from "modules/common/CommonEnum";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TaskCtrl } from "modules/task/TaskCtrl";
import { TaskData } from "modules/task/TaskData";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
export class MainTaskItem extends fgui.GComponent {
    private task_info: any;
    private viewNode = {
        RewardIcon: <fgui.GLoader>null,
        RewardIconItem: <TaskIconItem>null,
        TxtRewardNum: <fgui.GTextField>null,
        ConditionShow: <fgui.GRichTextField>null,
        ProgressShow1: <fgui.GTextField>null,
        ProgressShow2: <fgui.GTextField>null,
        ProgressShow3: <fgui.GTextField>null,
        Block: <fgui.GGraph>null,
        EffectShow: <UIEffectShow>null,
    };
    guide_ui_key: string = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.RewardIcon.onClick(this.onClickIcon.bind(this));
        this.viewNode.Block.onClick(this.onClickFetch.bind(this));
        this.guide_ui_key = GuideCtrl.Inst().AddGuideUi("TaskFetchButton", this.viewNode.Block)
    }
    onDestroy() {
        GuideCtrl.Inst().ClearGuideUi(this.guide_ui_key)
    }
    public FlushData() {
        let task_info = this.task_info = TaskData.Inst().GetCurTaskInfo();
        //console.log(task_info)
        let last_task_info = TaskData.Inst().getLastTaskInfo();
        if (task_info != null && last_task_info != undefined
            && last_task_info.id != task_info.cfg.task_id
            && this.task_info.pro < this.task_info.cfg.task_plan
            && task_info.cfg.is_auto == 1) {
            GuideCtrl.Inst().Start(this.task_info.cfg.guide_id)
        }
        //console.log(last_task_info)
        if (task_info) {
            this.visible = true;
            UH.SetText(this.viewNode.ConditionShow, TextHelper.RichTextOutLine(`${task_info.cfg.task_des}`, COLORSTR.Yellow2, 2));
            let reward_info = task_info.cfg.reward[0];
            UH.SetText(this.viewNode.TxtRewardNum, "x" + reward_info.num);
            if (Item.GetBigType(reward_info.item_id) == ITEM_BIG_TYPE.PET) {
                this.viewNode.RewardIconItem.SetIcon(reward_info.item_id);
                this.viewNode.RewardIcon.visible = false;
                this.viewNode.RewardIconItem.visible = true;
            } else {
                UH.SetIcon(this.viewNode.RewardIcon, Item.GetIconId(reward_info.item_id), ICON_TYPE.ITEM);
                this.viewNode.RewardIcon.visible = true;
                this.viewNode.RewardIconItem.visible = false;
            }
            if (task_info.pro >= task_info.cfg.task_plan) {
                this.viewNode.ProgressShow1.visible = true
                UH.SetText(this.viewNode.ProgressShow2, "")
                UH.SetText(this.viewNode.ProgressShow3, "")
                this.playEffect(true);
            } else {
                let pro = task_info.pro;
                if (task_info.cfg.task_plan == 1) {
                    pro = 0;
                }
                this.viewNode.ProgressShow1.visible = false
                UH.SetText(this.viewNode.ProgressShow2, `${pro}`)
                UH.SetText(this.viewNode.ProgressShow3, `/${task_info.cfg.task_plan}`)
                this.playEffect(false);
                if (task_info.cfg.task_id == CfgTaskData.task_list[0].task_id) {
                    this.onClickFetch();
                }
            }
        } else {
            this.visible = false;
        }
    }

    public playEffect(isPlay: boolean) {
        if (isPlay) {
            this.viewNode.EffectShow.PlayEff(4164039);
        } else {
            this.viewNode.EffectShow.StopEff(4164039);
        }
    }

    private onClickIcon() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        if (!this.onClickFetch()) {
            //需要显示通用物品信息弹窗
        }
    }

    private onClickFetch() {
        const info = this.task_info;
        const cfg = info ? info.cfg : null;

        if (!info || !cfg) {
            return false;
        }

        if (info.pro >= cfg.task_plan) {
            TaskCtrl.Inst().SendFetchTaskReq();
            // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
            return true;
        }

        if (cfg.guide_id != null) {
            GuideCtrl.Inst().Start(cfg.guide_id)
            return true;
        }

        return false;
    }
}

export class TaskIconItem extends fgui.GComponent {
    private viewNode = {
        icon: <fgui.GLoader>null,
        mask: <fgui.GImage>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetIcon(item_id: number) {
        UH.SetIcon(this.viewNode.icon, Item.GetIconId(item_id), ICON_TYPE.ITEM);
    }
}
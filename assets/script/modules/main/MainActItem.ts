
import { CfgActivityRand } from "config/CfgActivity";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle, RemindGroupMonitor } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ModManger } from "manager/ModManger";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_ENTER_TYPE, MainActIconTitle } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { COLORSTR, COLORS } from "modules/common/ColorEnum";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { CommonEvent } from "modules/common/CommonEvent";
import { EventCtrl } from "modules/common/EventCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { UH } from "../../helpers/UIHelper";

export class MainActItem extends fgui.GComponent {
    private act_type: ACTIVITY_ENTER_TYPE;
    private handleCollector: HandleCollector;
    private _rand_list: CfgActivityRand[] = [];
    private viewNode = {
        List: <fgui.GList>null,
    };

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.List.itemRenderer = this.renderListItem.bind(this);
    }

    private renderListItem(index: number, item: ButtonAct) {
        item.SetData(this._rand_list[index]);
    }

    public InitData(act_type: ACTIVITY_ENTER_TYPE) {
        this.act_type = act_type;
        this.AddRoleListener();
        EventCtrl.Inst().on(CommonEvent.NET_BEFORE_SWITCH, this.AddRoleListener, this);
        EventCtrl.Inst().on(CommonEvent.NET_SWITCH, this.FlushList, this);
        this.handleCollector.Add(SMDHandle.Create(ActivityData.Inst().ResuleData, this.FlushList.bind(this), "is_activity_status_change"));
        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().ResultData, this.FlushList.bind(this), "roleLevel"));
        this.FlushList();
    }

    private FlushOnRole() {
        if (RoleData.Inst().GetRoleLevel() > 0) {
            this.FlushList();
        }
    }

    private AddRoleListener() {
        this.handleCollector.KeyRemove("role_init");
        let handle = SMDHandle.Create(RoleData.Inst().ResultData, this.FlushOnRole.bind(this), "roleinfo");
        this.handleCollector.KeyAdd("role_init", handle);
    }

    public FlushList() {
        let rand_list = ActivityRandData.Inst().GetActBtnList(this.act_type);
        rand_list.sort(
            (a: CfgActivityRand, b: CfgActivityRand) => {
                if (this.act_type == ACTIVITY_ENTER_TYPE.RAND)
                    return b.seq - a.seq;
                else
                    return a.seq - b.seq;
            }
        );
        this._rand_list = rand_list;
        this.viewNode.List.numItems = rand_list.length;
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }
}

export class ButtonAct extends fgui.GButton {
    private handleCollector: HandleCollector;
    private rand_data = ActivityRandData.Inst();
    private bg_effect_timer_handle: any;
    private icon_effect_timer_handle: any;
    private viewNode = {
        RedPoint: <RedPoint>null,
        NameShow: <fgui.GTextField>null,
        TimeShow: <TimeMeter>null,
        Icon: <fgui.GLoader>null,
        BgEffectShow: <UIEffectShow>null,
        IconEffectShow: <UIEffectShow>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.onClick(this.onClickItem.bind(this));
    }

    private _data: CfgActivityRand;
    public SetData(data: CfgActivityRand) {
        this.visible = true;
        this._data = data;
        if (this.handleCollector) {
            this.handleCollector.RemoveAll()
        } else {
            this.handleCollector = HandleCollector.Create();
        }
        this.handleCollector.Add(RemindGroupMonitor.Create(data.mod, this.freshRedPoint.bind(this), true));
        if (MainActIconTitle[data.mod_key] && MainActIconTitle[data.mod_key].origin_data) {
            this.handleCollector.Add(SMDHandle.Create(MainActIconTitle[data.mod_key].origin_data, this.FlushBtnItem.bind(this)))
        }
        if (this.rand_data.GetCountDown(this._data.mod_key) && ActivityRandData.Inst().GetOriginList(data.mod_key)) {
            this.handleCollector.Add(SMDHandle.Create(ActivityRandData.Inst().GetOriginList(data.mod_key), this.FlushTime.bind(this)))
        }
        this.FlushBtnItem();
        this.FlushTime();
        this.viewNode.NameShow.strokeColor = data.is_special_gift ? COLORS.Orange2 : COLORS.Yellow2;
    }

    public PlayBgEffect(effect_id: number | string) {
        Timer.Inst().CancelTimer(this.bg_effect_timer_handle);
        this.viewNode.BgEffectShow.StopAllEff(null);
        if (effect_id) {
            this.viewNode.BgEffectShow.visible = true;
            this.viewNode.BgEffectShow.PlayEff(effect_id);
            let time = this._data ? this._data.lower_special_effect_time : 1;
            this.bg_effect_timer_handle = Timer.Inst().AddRunTimer(this.PlayBgEffect.bind(this, effect_id), time, 1, false);
        } else {
            this.viewNode.BgEffectShow.visible = false;
        }
    }

    public PlayIconEffect(effect_id: number | string) {
        Timer.Inst().CancelTimer(this.icon_effect_timer_handle);
        this.viewNode.IconEffectShow.StopAllEff();
        if (effect_id) {
            this.viewNode.IconEffectShow.visible = true;
            this.viewNode.IconEffectShow.PlayEff(effect_id);
            let time = this._data ? this._data.over_special_effect_time : 1;
            this.icon_effect_timer_handle = Timer.Inst().AddRunTimer(this.PlayIconEffect.bind(this, effect_id), time, 1, false);
        } else {
            this.viewNode.IconEffectShow.visible = false;
        }
    }

    public freshRedPoint() {
        if (this._data) {
            let num = RemindCtrl.Inst().GetGroupNum(this._data.mod);
            this.viewNode.RedPoint.SetNum(num);
        }
    }

    public FlushTime() {
        this.viewNode.TimeShow.CloseCountDownTime();
        let count_down = this.rand_data.GetCountDown(this._data.mod_key);
        if (count_down) {
            let time = count_down();
            if (time > 0) {
                this.viewNode.TimeShow.visible = true;
                this.viewNode.TimeShow.TotalTime(time, TimeFormatType.TYPE_TIME_0);
            } else {
                this.viewNode.TimeShow.visible = false;
            }
        } else {
            this.viewNode.TimeShow.visible = false;
        }
    }

    private _icon: string = "_icon";
    public FlushBtnItem() {
        let title = this._data.text;
        let icon = this._data.sprite;
        let lower_effect = this._data.lower_special_effect_id;
        let over_effect = this._data.over_special_effect_id;
        let custom_data = MainActIconTitle[this._data.mod_key];
        if (custom_data) {
            let data = custom_data.func();
            if (data) {
                if (data.title) title = data.title;
                if (data.icon) icon = data.icon;
                if (data.lower_effect) lower_effect = data.lower_effect
                if (data.over_effect || data.type == ACTIVITY_ENTER_TYPE.MORE) over_effect = data.over_effect
            }
        }
        UH.SetText(this.viewNode.NameShow, title);
        if (icon != this._icon) {
            this._icon = icon;
            this.PlayBgEffect(lower_effect)
            this.PlayIconEffect(over_effect)
        }
        let is_effect = over_effect != null && over_effect != "";
        if (icon && !is_effect) {
            UH.SetIcon(this.viewNode.Icon, icon, ICON_TYPE.ACT);
            this.viewNode.Icon.visible = true;
        } else
            this.viewNode.Icon.visible = false;
    }

    private onClickItem() {
        if (this._data) {
            if (this.rand_data.OnClickHandle(this._data.act_type)) return;
            if (this.rand_data.OnClickHandle(this._data.mod_key)) return;

            if (ModManger.Inst().IsView(Number(this._data.mod_key))) {
                ViewManager.Inst().OpenViewByKey(this._data.mod_key);
            } else {
                ViewManager.Inst().OpenView(this._data.view_name);
            }
        }
    }

    protected onDestroy(): void {
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
        super.onDestroy();
    }
}
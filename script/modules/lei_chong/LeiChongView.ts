import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { LeiChongCell, LeiChongYouLiPanel } from "./LeiChongYouLi/LeiChongYouLiPanel";
import { LeiChongPanelGroup } from "./LeiChongPanelGroup";
import { CfgActivityRand } from "config/CfgActivity";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { ACTIVITY_ENTER_TYPE } from "modules/activity/ActivityEnum";
import { ActivityData } from "modules/activity/ActivityData";
import { RoleData } from "modules/role/RoleData";
import { BaseItemGB } from "modules/common/BaseItem";
import { LeiChongData } from "./LeiChongData";
import { RedPoint } from "modules/extends/RedPoint";
import { UH } from "../../helpers/UIHelper";
import { HandleCollector } from "core/HandleCollector";
import { ModManger } from "manager/ModManger";
import { RemindGroupMonitor } from "data/HandleCollectorCfg";
import { RemindCtrl } from "modules/remind/RemindCtrl";
import { Timer } from "modules/time/Timer";
import { ContinuePresentCell, ContinuePresentView } from "modules/ContinuePresent/ContinuePresentView";
import { GiftItem, TianXuanCell, TianXuanPanel } from "./TianXuanZhiLi/TianXuanPanel";
import { DingZhiPuTongItem, DingZhiTeBieItem, ShouChongDingZhiPanel } from "./ShouChongDingZhi/ShouChongDingZhiPanel";
import { ShouChongDingZhiData } from "./ShouChongDingZhi/ShouChongDingZhiCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TianXuanResultData, TianXuanZhiLiData } from "./TianXuanZhiLi/TianXuanZhiLiCtrl";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";

@BaseView.registView
export class LeiChongView extends BaseView {
    private act_data: CfgActivityRand[] = [];//活动按钮数据
    private sel_idx: number;//选中活动index
    private sel_type: number;//选中活动id

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "LeiChong",
        ViewName: "LeiChongView",
        LayerType: ViewLayer.Buttom,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "BtnAct", ExtendsClass: LeiChongBtn },
        { ResName: "LeiChongPanelGroup", ExtendsClass: LeiChongPanelGroup },

        { ResName: "LeiChongCell", ExtendsClass: LeiChongCell },
        { ResName: "PanelLeiChongYouLi", ExtendsClass: LeiChongYouLiPanel },

        { ResName: "ContinuePresentCell", ExtendsClass: ContinuePresentCell },
        { ResName: "ContinuePresentView", ExtendsClass: ContinuePresentView },
        { ResName: "TianXuanZhiLiView", ExtendsClass: TianXuanPanel },
        { ResName: "TianXuanCell", ExtendsClass: TianXuanCell },
        { ResName: "GiftItem", ExtendsClass: GiftItem },

        { ResName: "ShouChongDingZhiView", ExtendsClass: ShouChongDingZhiPanel },
        { ResName: "DingZhiPuTongItem", ExtendsClass: DingZhiPuTongItem },
        { ResName: "DingZhiTeBieItem", ExtendsClass: DingZhiTeBieItem },
        { ResName: "BtnCanChangeBg", ExtendsClass: CommonButtonBuy },

    ];

    protected viewNode = {
        PanelGroup: <LeiChongPanelGroup>null,
        BtnReturn: <fgui.GButton>null,
        ActList: <fgui.GList>null,
    }
    InitData(data: any){ //活动id
        this.sel_type = data?? 0;
        this.FlushAct();
    }
    InitUI() {
        this.viewNode.BtnReturn.onClick(this.CloseView.bind(this));
        this.viewNode.ActList.on(fgui.Event.CLICK_ITEM, this.OnChangeAct, this);
        this.AddSmartDataCare(ActivityData.Inst().ResuleData, this.FlushAct.bind(this), "is_activity_status_change");
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushAct.bind(this), "roleLevel");
        //关闭天选之礼
        this.AddSmartDataCare(TianXuanZhiLiData.Inst().ResultData, this.FlushAct.bind(this), "closeAct");
        //this.FlushAct();
    }

    /**活动按钮变化更新 */
    private FlushAct() {
        this.act_data = LeiChongData.Inst().GetOpenActivityList();
        if (this.act_data.length > 0) {
            this.viewNode.ActList.SetData(this.act_data);
            let sel_idx = 0;
            if (this.sel_type) {
                for (let i = 0; i < this.act_data.length; i++) {
                    if (this.act_data[i].act_type == this.sel_type) {
                        sel_idx = i;
                        break;
                    }
                }
            }
            this.viewNode.ActList.selectedIndex = sel_idx;
            this.OnChangeAct();
        } else {
            this.CloseView();
        }
    }

    /**切换选中活动 */
    private OnChangeAct() {
        if (this.viewNode.ActList.selectedIndex != this.sel_idx) {
            let index = this.viewNode.ActList.selectedIndex;
            if (this.act_data[index]) {
                let act_type = this.act_data[index].act_type;
                this.sel_idx = index;
                this.sel_type = act_type;
                this.viewNode.PanelGroup.ChangePanel(act_type);
            }
        }
    }

    private CloseView() {
        ViewManager.Inst().CloseView(LeiChongView);
    }
}


class LeiChongBtn extends BaseItemGB {
    private handleCollector: HandleCollector;

    protected viewNode = {
        icon: <fgui.GLoader>null,
        icon_select: <fgui.GLoader>null,
        RedPoint: <RedPoint>null,
    };
    protected _data: CfgActivityRand = null;
    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    public SetData(data: CfgActivityRand) {
        this._data = data;
        UH.SpriteName(this.viewNode.icon, "LocalizationAtlas", "_Loc" + data.sprite + "1");
        UH.SpriteName(this.viewNode.icon_select, "LocalizationAtlas", "_Loc" + data.sprite + "2");
        this.addRemindCare(ModManger.TabMod(data.mod_key));
    }


    private addRemindCare(mod: number) {
        let self = this;
        this.handleCollector.Add(RemindGroupMonitor.Create(mod, self.freshRedPoint.bind(self, mod)));
    }

    private freshRedPoint(group: any) {
        this.viewNode.RedPoint.SetNum(RemindCtrl.Inst().GetGroupNum(group));
    }
}


import { SpriteFrame } from "cc";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_ENTER_TYPE } from "modules/activity/ActivityEnum";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BaseView } from "modules/common/BaseView";
import { CommonId } from "modules/common/CommonEnum";
import { Mod } from "modules/common/ModuleDefine";
import { Currency } from "modules/extends/Currency";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { RoleData } from "modules/role/RoleData";
import { RoleSettingView } from "modules/role_setting/RoleSettingView";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UH } from "../../helpers/UIHelper";
import { MainActItem } from "./MainActItem";
import { MainButtonModR } from "./MainBottom";
import { MainCapItem, RoleAvatarItem } from "./MainItems";

@BaseView.registerComp
export class MainTop extends fgui.GComponent {
    private handleCollector: HandleCollector;
    private role_cap: number = 0;

    private viewNode = {
        NameShow: <fgui.GTextField>null,
        RoleAvatar: <RoleAvatarItem>null,
        ExpShow: <fgui.GProgressBar>null,
        CapShow: <MainCapItem>null,
        Currency1: <Currency>null,
        Currency2: <Currency>null,
        ActItem: <MainActItem>null,
        UIEffectShow: <UIEffectShow>null,
        BtnOther: <MainButtonModR>null,
    };

    protected onConstruct() {
        this.handleCollector = HandleCollector.Create();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this)
    }

    protected onEnable(): void {
        super.onEnable();
        ViewManager.Inst().registComp(MainTop, this)
    }

    protected onDisable(): void {
        super.onDisable();
        this.viewNode.UIEffectShow.StopEff(4164026);
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        this.handleCollector.Add(handle);
    }

    public InitData() {
        this.viewNode.RoleAvatar.onClick(this.OnClickAvatar, this);
        this.viewNode.BtnOther.onClick(this.onBtnClick.bind(this));

        this.addSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleInfoShow.bind(this));
        this.addSmartDataCare(RoleData.Inst().MainFlush, this.FlushRoleHeadInfo.bind(this), "flush_red");

        this.viewNode.Currency1.SetCurrencyId(CommonId.Diamond);
        this.viewNode.Currency2.SetCurrencyId(CommonId.Gold);
        this.viewNode.Currency1.BtnAddShow(false, { x: 40, y: 2 });
        this.viewNode.Currency2.BtnAddShow(false, { x: 40, y: 2 });

        this.viewNode.BtnOther.SetData({ ModKey: Mod.Other.View, mod: Mod.Other });
        GuideCtrl.Inst().AddGuideUi("BtnMainOther", this.viewNode.BtnOther);

        this.viewNode.ActItem.InitData(ACTIVITY_ENTER_TYPE.RAND);
        this.InitView();
    }

    private InitView() {
        this.FlushRoleInfoShow();
        this.FlushRoleHeadInfo()
    }
    FlushRoleHeadInfo() {
        let num = RoleData.Inst().GetSettingRedPoint()
        //console.log("邮件红点数量", num);

        this.viewNode.RoleAvatar.SetNum(num)
    }
    public FlushRoleInfoShow() {
        UH.SetText(this.viewNode.NameShow, RoleData.Inst().GetRoleName());
        // UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Common.LevelShow, RoleData.Inst().GetRoleLevel()));
        this.viewNode.RoleAvatar.SetData(RoleData.Inst().ResultData.roleinfo)
        this.viewNode.CapShow.SetData(RoleData.Inst().GetCapability());

        let role_cap = RoleData.Inst().GetCapability();

        this.viewNode.ExpShow.value = RoleData.Inst().GetRoleExp();
        this.viewNode.ExpShow.max = RoleData.Inst().GetRoleExpByLevel(RoleData.Inst().GetRoleLevel());

        // if (this.role_cap > 0 && role_cap > this.role_cap) {
        //     this.viewNode.UIEffectShow.PlayEff(4164026)
        // } else {
        //     this.viewNode.UIEffectShow.StopEff(4164026)
        // }
        this.role_cap = role_cap;
        if (RoleData.Inst().avatar_out_texture) {
            this.viewNode.RoleAvatar.SeSpriteFrame(RoleData.Inst().avatar_out_texture as SpriteFrame)
        } else
            this.viewNode.RoleAvatar.DefaultShow()
    }
    private OnClickAvatar() {
        ViewManager.Inst().OpenView(RoleSettingView)
    }

    private onBtnClick() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        ViewManager.Inst().OpenViewByKey(this.viewNode.BtnOther.GetData().ModKey);
    }

}
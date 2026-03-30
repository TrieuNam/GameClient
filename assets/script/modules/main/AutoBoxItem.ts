import { CfgFunOpen } from "config/CfgFunOpen";
import { LogError } from "core/Debugger";
import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { AUTO_STATUS, BoxData } from "modules/box/BoxData";
import { BaseItem } from "modules/common/BaseItem";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { LocalStorageHelper } from "../../helpers/LocalStorageHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { MainBoxAutoButton } from "./MainBoxAutoButton";
export class AutoBoxItem extends BaseItem {
    private handleCollector: HandleCollector;

    protected viewNode = {
        BtnBoxAuto: <MainBoxAutoButton>null,
        AutoBoxTip: <fgui.GGroup>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.handleCollector = HandleCollector.Create();
        this.addSmartDataCare(BoxData.Inst().GetboxResultData(), this.FlushBoxAuto.bind(this), "auto_statu");
        this.viewNode.BtnBoxAuto.onClick(this.onBtnClick.bind(this));
        GuideCtrl.Inst().AddGuideUi("BtnBoxAuto", this.viewNode.BtnBoxAuto);
        this.viewNode.BtnBoxAuto.InitData();
        this.checkFunOpen();
    }

    private addSmartDataCare(smdata: any, callback: Function, ...keys: string[]) {
        let self = this;
        var handle = SMDHandle.Create(smdata, callback, ...keys)
        self.handleCollector.Add(handle);
    }

    public InitData() {
    }
    private onBtnClick() {
        AudioManager.Inst().Play(AudioTag.TongYongClick);
        this.viewNode.AutoBoxTip.visible = false
        if (FunOpen.Inst().GetFunIsOpen(Mod.BoxTrust.View).is_open) {
            BoxData.Inst().onClickAuto();
        } else {
            let open_leven;
            for(let i = 0;i<CfgFunOpen.funopen.length;i++){
                if(CfgFunOpen.funopen[i].client_id == Mod.BoxTrust.View){
                    open_leven = CfgFunOpen.funopen[i].level;
                    break;
                }
            }
            let tip = TextHelper.Format(Language.Box.tip8,open_leven);
            PublicPopupCtrl.Inst().Center(tip);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.handleCollector) {
            HandleCollector.Destory(this.handleCollector);
            this.handleCollector = null;
        }
    }

    private box_auto_status = BoxData.Inst().getAutoStatus();
    private FlushBoxAuto() {
        let status = BoxData.Inst().getAutoStatus();
        if (this.box_auto_status == status)
            return;
        this.box_auto_status = status;
        switch (status) {
            case AUTO_STATUS.START:
                // case AUTO_STATUS.STOP:
                this.viewNode.BtnBoxAuto.PlayAuto();
                break;
            case AUTO_STATUS.OVER:
                this.viewNode.BtnBoxAuto.StopAuto();
                break;
        }
    }

    private checkFunOpen() {
        let auto_open_t = FunOpen.Inst().GetFunIsOpen(Mod.BoxTrust.View);
        this.viewNode.BtnBoxAuto.grayed = !auto_open_t.is_open
        if (!auto_open_t.is_open) {
            FunOpen.Inst().RgCheckFunc(Mod.BoxTrust.View, this.OnFunOpenChange.bind(this))
        } 
        // else {
        //     let is_tiped = LocalStorageHelper.PrefsInt(LocalStorageHelper.AutoBoxOpenTip());
        //     if (is_tiped != 1) {
        //         this.viewNode.AutoBoxTip.visible = true
        //     }
        // }
    }

    OnFunOpenChange(key: number | string, is_open: boolean) {
        if (!RoleData.Inst().GetRoleId())
            return;
        this.viewNode.BtnBoxAuto.grayed = !is_open
        if (is_open) {
            let is_tiped = LocalStorageHelper.PrefsInt(LocalStorageHelper.AutoBoxOpenTip());
            if (is_tiped != 1) {
                this.viewNode.AutoBoxTip.visible = true
            }
        }
        if (is_open) {
            FunOpen.Inst().ClearRgFunc(key)
        }
    }
}

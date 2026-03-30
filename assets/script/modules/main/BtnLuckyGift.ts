import { BaseItemGB } from "modules/common/BaseItem";
import { HandleCollector } from "core/HandleCollector";
import { LuckyGiftData } from "modules/LuckyGift.ts/LuckyGiftCtrl";
import { SMDHandle } from "data/HandleCollectorCfg";
import { UH } from "../../helpers/UIHelper";
import * as fgui from "fairygui-cc";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { ViewManager } from "manager/ViewManager";
import { Mod } from "modules/common/ModuleDefine";

export class BtnLuckyGift extends BaseItemGB {
    private handleCollector: HandleCollector;
    private time_handle:any;
    protected viewNode = {
        icon: <fgui.GLoader>null,
        title: <fgui.GTextField>null,
    };

    public InitData() {
        this.handleCollector = HandleCollector.Create();
        this.handleCollector.Add(SMDHandle.Create(LuckyGiftData.Inst().ResultData, this.FlushBtn.bind(this)));
        this.onClick(this.onClickBtn.bind(this));
        this.FlushBtn();
    }

    private FlushBtn() {
        let is_show = LuckyGiftData.Inst().IsLuckyGiftShow();
        this.visible = is_show;
        if (!is_show)
            return;
        let data = LuckyGiftData.Inst().ActIconTitleShow();
        UH.SetText(this.viewNode.title, data.title);
        UH.SetIcon(this.viewNode.icon, data.icon, ICON_TYPE.ACT);
        //time
    }

    private onClickBtn(){
        ViewManager.Inst().OpenViewByKey(Mod.LuckyGift.View)
    }
}
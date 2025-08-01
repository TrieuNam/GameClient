import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ResManager } from "manager/ResManager";
import { ResPath } from "utils/ResPath";
import { BaseCtrl } from "./BaseCtrl";
import { CommonEvent } from "./CommonEvent";
import { EventCtrl } from "./EventCtrl";
import { ExtraPackLink } from "./ExtraPackLink";
import { QuoteCtrl } from "./QuoteCtrl";

// loadpack要与removepack搭配使用
// loadpack需要追加加载完成后的callback函数
export class ExtraPack extends BaseCtrl{
    public LoadPack(packName:string,callback:Function ){
        const path = ResPath.UIPackage(packName);
        let has = ResManager.Inst().hasPackage(packName);
        let hasLoading = QuoteCtrl.Inst().Has(packName);
        QuoteCtrl.Inst().Add(packName, CommonEvent.FGUI_PACKAGE);
        if (!has) {
            if (hasLoading) {
                EventCtrl.Inst().on(CommonEvent.FGUI_PACKAGE_ONLOAD, this.onOnePackLoadByEvent, this)
            } else
                fgui.UIPackage.loadPackage(path, (error: any, pkg: fgui.UIPackage) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    ResManager.Inst().onLoadPackage(packName);
                    this.onOnePackLoad(packName,callback);
                })
        } else {
            this.onOnePackLoad(packName,callback);
        }
    }

    private onOnePackLoadByEvent(name: string) {
        this.onOnePackLoad(name,null) ;
    }

    private onOnePackLoad(name: string,callback:Function) {
        EventCtrl.Inst().off(CommonEvent.FGUI_PACKAGE_ONLOAD, this.onOnePackLoadByEvent, this)
        if (callback != null) {
            callback(name)
        }
    }

    public RemovePack(packName:string)
    {
        QuoteCtrl.Inst().Remove(packName);
    }

    public CheckIsLoading(viewName:string)
    {
        let packName = this.FindExtraPackByName(viewName)
        if (packName != null) {
            let has = ResManager.Inst().hasPackage(packName);
            let hasLoading = QuoteCtrl.Inst().Has(packName);

            // 没有 且 加载中
            if (!has && hasLoading) {
                return true
            }
        }

        return false
    }

    private FindExtraPackByName(viewName:string)
    {
        for (var check in ExtraPackLink) {
            for (var check_index in ExtraPackLink[check]) {
                if (ExtraPackLink[check][check_index] == viewName) {
                    return check
                }
            }
        }

        return null
    }
}
import { CfgFunOpen } from "config/CfgFunOpen";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { RoleData } from "modules/role/RoleData";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class LevelupView extends BaseView {
    //data = TerritoryData.Inst()
    protected viewRegcfg = {
        UIPackName: "LevelUp",
        ViewName: "LevelupView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Level1: <fgui.GTextField>null,
        Level2: <fgui.GTextField>null,
        OpenLevel: <fgui.GTextField>null,
        CloseTimer: <TimeMeter>null,
        List: <fgui.GList>null,
        TopGroup: <fgui.GGroup>null,
        DownGroup: <fgui.GGroup>null,
    }
    protected extendsCfg = [
        { ResName: "FunctionItem", ExtendsClass: LevelupFunctionItem },
    ];

    InitData(param: any): void {
        this.viewNode.CloseTimer.SetCallBack(this.closeview.bind(this));
        this.viewNode.CloseTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, TextHelper.ColorStr(Language.Common.CloseTip, COLORSTR.Yellow1));
    }
    private closeview() {
        ViewManager.Inst().CloseView(LevelupView)
    }
    FlushLevelInfo() {
        let level = RoleData.Inst().GetRoleLevel()
        UH.SetText(this.viewNode.Level1, Format(Language.Common.LevelShow, level - 1))
        UH.SetText(this.viewNode.Level2, Format(Language.Common.LevelShow, level))
        let list: any = []
        CfgFunOpen.funopen.forEach(element => {
            if (level >= element.level_min && level <= element.level_max) {
                list.push(element)
            }
        });
        if (list.length > 0) {
            this.viewNode.TopGroup.y = 181
            this.viewNode.DownGroup.visible = true
            UH.SetText(this.viewNode.OpenLevel, Format(Language.Common.OpenLevel, list[0].level_open))
        } else {
            this.viewNode.TopGroup.y = 302
            this.viewNode.DownGroup.visible = false
            UH.SetText(this.viewNode.OpenLevel, "")
        }
        this.viewNode.List.SetData(list)
    }
    InitUI(): void {

    }

    DoOpenWaitHandle(): void {

    }

    OpenCallBack(): void {
        this.FlushLevelInfo()
    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}

class LevelupFunctionItem extends BaseItem {
    protected viewNode = {
        Name: <fgui.GTextField>null,
        Icon: <fgui.GLoader>null
    };
    protected _data: any = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this._data = data;
        UH.SetText(this.viewNode.Name, data.name)
        UH.SpriteName(this.viewNode.Icon, "LevelUp", data.client_icon)
    }
    public GetData() {
        return this._data;
    }
}
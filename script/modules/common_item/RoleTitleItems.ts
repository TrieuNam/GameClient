
import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { Language } from "modules/common/Language";
import { RoleConfig } from "modules/role/RoleConfig";
import { RoleData } from "modules/role/RoleData";
import { UH } from "../../helpers/UIHelper";

export class RoleTitleItem1 extends BaseItem {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        LevelSp: <fgui.GLoader>null,
        LevelShow: <fgui.GTextField>null,
        TitleShow: <fgui.GTextField>null,
        GpHave: <fgui.GGroup>null,
        GpEmpty: <fgui.GGroup>null,
    };

    public SetData(data: any) {
        let info = RoleData.Inst().GetRoleTitleInfo(data.title ?? 0)
        UH.SpriteName(this.viewNode.BgSp, "CommonAtlas", GetCfgValue(RoleConfig.TitleColor2BgSp1, info ? info.title_color : 0))
        UH.SpriteName(this.viewNode.LevelSp, "CommonAtlas", GetCfgValue(RoleConfig.TitleColor2LevelSp1, info ? info.title_color : 0))
        UH.SetText(this.viewNode.TitleShow, info ? info.name : "")
        UH.SetText(this.viewNode.LevelShow, data.level ?? 0)
        this.viewNode.GpHave.visible = undefined != info
        this.viewNode.GpEmpty.visible = undefined == info
    }
}

export class RoleTitleItem2 extends BaseItem {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        LevelSp: <fgui.GLoader>null,
        LevelShow: <fgui.GTextField>null,
        TitleShow: <fgui.GTextField>null,
        GpHave: <fgui.GGroup>null,
        GpEmpty: <fgui.GGroup>null,
    };

    public SetData(data: any) {
        let info = RoleData.Inst().GetRoleTitleInfo(data.title)
        UH.SpriteName(this.viewNode.BgSp, "CommonAtlas", GetCfgValue(RoleConfig.TitleColor2BgSp2, info ? info.title_color : 0))
        UH.SpriteName(this.viewNode.LevelSp, "CommonAtlas", GetCfgValue(RoleConfig.TitleColor2LevelSp2, info ?  info.title_color : 0))
        UH.SetText(this.viewNode.TitleShow, info ? info.name : "")
        UH.SetText(this.viewNode.LevelShow, data.level)
        this.viewNode.GpHave.visible = undefined != info
        this.viewNode.GpEmpty.visible = undefined == info
    }
}
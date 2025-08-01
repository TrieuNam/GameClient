
import { error, sys } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AttrHelper } from "../../helpers/AttrHelper";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ItemRecyclingBag } from "./ItemRecyclingBag";
import { ItemRecyclingData } from "./ItemRecyclingData";
@BaseView.registView
export class ItemRecycling extends BaseView {
    data = ItemRecyclingData.Inst()
    cur_level = -1
    cur_exp = -1
    protected viewRegcfg = {
        UIPackName: "ItemRecycling",
        ViewName: "ItemRecycling",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,
        BtnOpen: <fgui.GButton>null,
        ExpBar: <fgui.GProgressBar>null,
        Level: <fgui.GTextField>null,
        ExpValue: <fgui.GRichTextField>null,
        Attr1: <fgui.GTextField>null,
        Attr2: <fgui.GTextField>null,
        Attr3: <fgui.GTextField>null,
        Attr4: <fgui.GTextField>null,
        Value1: <fgui.GTextField>null,
        Value2: <fgui.GTextField>null,
        Value3: <fgui.GTextField>null,
        Value4: <fgui.GTextField>null,
        EffectShow: <UIEffectShow>null,
        RedPoint: <RedPoint>null,
        AttrGroup1: <fgui.GGroup>null,
        AttrGroup2: <fgui.GGroup>null,
        AttrGroup3: <fgui.GGroup>null,
        AttrGroup4: <fgui.GGroup>null,
    }
    InitData(param: any): void {
        this.viewNode.Board.SetData(new BoardData(ItemRecycling, Language.ItemRecycling.Title, 28))
        this.viewNode.BtnOpen.onClick(this.OnClickOpen.bind(this))
        this.AddSmartDataCare(this.data.FlushData, this.FlushLevelInfo.bind(this), "flush_info")
        this.AddSmartDataCare(this.data.FlushData, this.FlushLevelInfo.bind(this), "flush_bag")
    }
    FlushBagInfo() {
        this.viewNode.RedPoint.SetNum(this.data.GetRedPoint())
    }
    OnClickOpen() {
        ViewManager.Inst().OpenView(ItemRecyclingBag)

    }
    InitUI(): void {
        // UH.SetText(this.viewNode.Level, "LV.1")
        // this.viewNode.ExpBar.max = 9999
        // this.viewNode.ExpBar.value = 1520
        // UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue, 1520, 9999))
    }

    FlushLevelInfo() {
        this.viewNode.RedPoint.SetNum(this.data.GetRedPoint())
        let level = this.data.level
        let exp = this.data.exp as number
        if (this.cur_exp != -1 || this.cur_level != -1) {
            if (this.cur_exp != exp || this.cur_level != level) {
                this.viewNode.EffectShow.PlayEff(4164131)
                if (this.cur_level != level) {
                    if (this.cur_level == 0) {
                        let cfg = this.data.GetLevelCfg(level)
                        cfg.up_att.forEach(element => {
                            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} +${AttrHelper.Percent(element.type, element.add)}`, 1)
                        });
                    } else {
                        let old_cfg = this.data.GetLevelCfg(this.cur_level)
                        let cfg = this.data.GetLevelCfg(level)
                        cfg.up_att.forEach((element, index) => {
                            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} +${AttrHelper.Percent(element.type, element.add - old_cfg.up_att[index].add)}`, 1)
                        });
                    }
                }
            }
        }
        this.cur_exp = exp
        this.cur_level = level
        UH.SetText(this.viewNode.Level, Format(Language.Common.LevelShow, level))
        if (level == 0) {
            let cur_cfg = this.data.GetLevelCfg(level)
            this.viewNode.ExpBar.max = cur_cfg.up_exp
            this.viewNode.ExpBar.value = exp
            UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue, exp, cur_cfg.up_exp))
            let cfg = this.data.GetLevelCfg(1)
            let attr = cfg.up_att[0]
            this.SetAttrInfo(this.viewNode.Attr1, this.viewNode.Value1, attr, 0, this.viewNode.AttrGroup1)
            attr = cfg.up_att[1]
            this.SetAttrInfo(this.viewNode.Attr2, this.viewNode.Value2, attr, 0, this.viewNode.AttrGroup2)
            attr = cfg.up_att[2]
            this.SetAttrInfo(this.viewNode.Attr3, this.viewNode.Value3, attr, 0, this.viewNode.AttrGroup3)
            attr = cfg.up_att[3]
            this.SetAttrInfo(this.viewNode.Attr4, this.viewNode.Value4, attr, 0, this.viewNode.AttrGroup4)
        } else {
            let cfg = this.data.GetLevelCfg(level)
            if (cfg == null || cfg.up_exp == 0) {
                this.viewNode.ExpBar.max = 1
                this.viewNode.ExpBar.value = 1
                UH.SetText(this.viewNode.ExpValue, Language.ItemRecycling.MaxLevel)
            } else {
                this.viewNode.ExpBar.max = cfg.up_exp
                this.viewNode.ExpBar.value = exp
                UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue, exp, cfg.up_exp))
            }
            if (cfg == null) {
                cfg = this.data.GetLevelCfg(level - 1)
            }
            let attr = cfg.up_att[0]
            this.SetAttrInfo(this.viewNode.Attr1, this.viewNode.Value1, attr, null, this.viewNode.AttrGroup1)
            attr = cfg.up_att[1]
            this.SetAttrInfo(this.viewNode.Attr2, this.viewNode.Value2, attr, null, this.viewNode.AttrGroup2)
            attr = cfg.up_att[2]
            this.SetAttrInfo(this.viewNode.Attr3, this.viewNode.Value3, attr, null, this.viewNode.AttrGroup3)
            attr = cfg.up_att[3]
            this.SetAttrInfo(this.viewNode.Attr4, this.viewNode.Value4, attr, null, this.viewNode.AttrGroup4)
        }
    }
    SetAttrInfo(type: fgui.GTextField, add: fgui.GTextField, attr: any, level?: number, group?: fgui.GGroup) {
        if (attr) {
            UH.SetText(type, AttrListName[attr.type])
            if (level != null && level == 0) {
                UH.SetText(add, "+" + AttrHelper.Percent(attr.type, 0))
            } else {
                UH.SetText(add, "+" + AttrHelper.Percent(attr.type, attr.add))
            }
            group.visible = true
        } else {
            group.visible = false
        }
    }
    OpenCallBack(): void {
        //刷新属性
        this.FlushLevelInfo()
    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Equip, Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { AttrItem } from "modules/common_item/AttrItem";
import { EnChantData } from "modules/Enchant/EnchantData";
import { ItemCellEquip } from "modules/extends/ItemCell";
import { FunOpen } from "modules/guide/FunOpen";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { EquipEnchantShow } from "./EquipEnchantShow";

@BaseView.registView
export class EquipInfoView extends BaseView {
    private Show_item:Equip
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "EquipInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        NameShow: <fgui.GRichTextField>null,
        CellShow: <ItemCellEquip>null,
        // CapShow: <MainCapItem>null,
        AttrShow: <AttrItem>null,
        EnchantShow: <EquipEnchantShow>null,
        bg: <fgui.GImage>null,
        // bg2:<fgui.GImage>null,
        // s_bg:<fgui.GGroup>null,
        LevelShow: <fgui.GTextField>null,
        BtnClose: <fgui.GButton>null,
        // AttrList: <fgui.GList>null,
        // BtnArrow: <fgui.GButton>null,
    };

    protected extendsCfg = [
        { ResName: "EquipEnchantShow", ExtendsClass: EquipEnchantShow },
    ]

    InitUI() {
        this.viewNode.BtnClose.onClick(this.OnClickClose.bind(this));

    }

    InitData(item: Equip) {
        this.Show_item = item
        UH.SetText(this.viewNode.NameShow, item.QuaNameOL())
        // this.viewNode.CellShow.SetData(item.Vo(), { is_click: false });
        this.FlushCellShow()
        let is_on_self = BagData.Inst().GetEquipIsSelf(item.Vo().equipType,item.Vo().itemId)
        // this.viewNode.CapShow.SetData(item.Cap());
        let attr_list = item.GetAttrList();
        let item1 = <Equip>Item.Create(item.Vo(), { is_click: false });
        UH.SetText(this.viewNode.LevelShow, TextHelper.Format(Language.Common.LevelShow, item1.Level()))
        this.viewNode.AttrShow.SetData(attr_list);
        // this.viewNode.CellShow.SetData(item);
        let is_open = FunOpen.Inst().GetFunIsOpen(Mod.EquipEnchant.Main).is_open && is_on_self
        if (FunOpen.Inst().GetFunIsOpen(Mod.EquipEnchant.Main)) {
            this.viewNode.EnchantShow.SetData(item)
        }
        this.viewNode.EnchantShow.visible = is_open
        // this.viewNode.bg.visible = !is_open
        // this.viewNode.s_bg.visible = is_open

        this.viewNode.bg.height = is_open ? 934 : 676
        this.viewNode.AttrShow.height = is_open ? 586 : 414
        
        this.AddSmartDataCare(EnChantData.Inst().ResultData, this.FlushCellShow.bind(this), "ChantOneInfo");


    }
    OnClickClose() {
        ViewManager.Inst().CloseView(EquipInfoView)
    }

    FlushCellShow(){
        this.viewNode.CellShow.SetData(this.Show_item.Vo(), { is_click: false });

    }
    OnClickArrow() {
        LogError("OnClickArrow")
        // this.viewNode.AttrList.
    }
}
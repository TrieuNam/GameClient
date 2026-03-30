import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { ItemCell, ItemCellEquip } from "modules/extends/ItemCell";
import { AttrHelper } from "../../helpers/AttrHelper";
import { BoxData } from "modules/box/BoxData";
import { BoxEquipItem, EquipAddAttCell, EquipAttCell } from "modules/box/BoxEquipView";
import { EquipBagData } from "./EquipBagData";
import { EquipBagCtrl, EQUIP_OP_TYPE } from "./EquipBagCtrl";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { Timer } from "modules/time/Timer";
import { FunOpen } from "modules/guide/FunOpen";
import { Mod } from "modules/common/ModuleDefine";
import { Language } from "modules/common/Language";
import { CfgItem } from "config/CfgCommon";

@BaseView.registView
export class BagEquipConpareView extends BaseView {
    private cur_equip_index: number = 0;
    private tran_change_pos: fgui.Transition;
    private is_traning = false;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Box",
        ViewName: "BoxEquipView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock
    };

    protected viewNode:any = {
        Bg: <fgui.GImage>null,
        BtnSale: <fgui.GButton>null,
        BtnClose: <fgui.GButton>null,
        BtnEquip: <fgui.GButton>null,
        BtnChange: <fgui.GButton>null,
        equip0: <BoxEquipItem>null,
        equip1: <BoxEquipItem>null,
    }

    protected extendsCfg = [
        { ResName: "EquipAttCell", ExtendsClass: EquipAttCell },
        { ResName: "EquipAddAttCell", ExtendsClass: EquipAddAttCell },
        { ResName: "BoxEquipItem", ExtendsClass: BoxEquipItem },
    ];

    private bag_equip: IPB_EquipBagData;//当前正在处理的装备数据
    InitData() {
        this.viewNode.BtnClose.onClick(this.CloseView.bind(this))
        this.viewNode.BtnSale.onClick(this.onSell.bind(this))
        this.viewNode.BtnEquip.onClick(this.onEquip.bind(this));
        this.viewNode.BtnChange.onClick(this.OnCLickChange.bind(this));
        this.tran_change_pos = this.view.getTransition("change_pos");

        this.AddSmartDataCare(EquipBagData.Inst().ResultData, this.FlushData.bind(this), "is_change");
        this.FlushData(true);
        this.FlushBtnChangeShow()
    }

    private OnCLickChange() {
        BoxData.Inst().sale_state = BoxData.Inst().sale_state == 0 ? 1 : 0
        this.FlushBtnChangeShow()
    }

    private FlushBtnChangeShow() {
        this.viewNode.BtnChange.visible = FunOpen.Inst().GetFunIsOpen(Mod.EquipEnchant.Main).is_open
        this.viewNode.BtnSale.title = BoxData.Inst().sale_state == 0 ? Language.Box.Sale : Language.Box.Enchant
    }


    private FlushData(is_init: boolean = false) {
        if (EquipBagData.Inst().IsEquipToDetail()) {
            let cur_type = this.bag_equip ? this.bag_equip.bagData.equipType : -1;
            let bag_equip = EquipBagData.Inst().GetEquipData(cur_type);//需要处理的背包装备
            if (!bag_equip) {
                cur_type = -1;
                bag_equip = EquipBagData.Inst().GetEquipData(cur_type);
            }
            if (!bag_equip) {
                this.CloseView();
                return;
            }

            this.bag_equip = bag_equip;
            cur_type = bag_equip.bagData.equipType;
            let role_equip = BagData.Inst().GetEquipItemInfo(cur_type);//人物身上的装备数据
            if (!role_equip) {
                this.viewNode.equip0.visible = this.viewNode.BtnSale.visible = false;
                this.viewNode.Bg.height = 538;
            } else {
                this.viewNode.equip0.visible = this.viewNode.BtnSale.visible = true
                this.viewNode.Bg.height = 944;
            }

            let func_setData = () => {
                let cur_equip = this.viewNode["equip" + this.cur_equip_index]
                let box_equip = this.viewNode["equip" + Math.abs(this.cur_equip_index - 1)];
                box_equip.SetData({ equip_data: bag_equip.bagData, cur_equip_data: role_equip, is_new: false })
                if (role_equip)
                    cur_equip.SetData({ equip_data: role_equip, cur_equip_data: null, is_new: false })
            }

            if (is_init) {
                func_setData();
            } else {
                this.tran_change_pos.play(() => {
                    this.is_traning = false;
                });
                if (this.cur_equip_index == 0)
                    this.cur_equip_index = 1;
                func_setData();
            }

        } else {
            this.CloseView();
        }
    }

    private onEquip() {
        if (this.bag_equip && !this.is_traning) {
            this.is_traning = true;
            EquipBagCtrl.Inst().SendEquipReq(EQUIP_OP_TYPE.WEAR, this.bag_equip.index)
            AudioManager.Inst().Play(AudioTag.ChuanDaiZhaungBei);
        }
    }

    private onSell() {
        if (this.bag_equip) {
            let func = () => {
                EquipBagCtrl.Inst().SendEquipReq(EQUIP_OP_TYPE.SELL, this.bag_equip.index)
            }
            BoxData.Inst().CheckSale(this.bag_equip.bagData, func);
        }
    }

    private CloseView() {
        ViewManager.Inst().CloseView(BagEquipConpareView)
    }
}

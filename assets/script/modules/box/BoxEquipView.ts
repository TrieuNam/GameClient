import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { ItemCell } from "modules/extends/ItemCell";
import { FunOpen } from "modules/guide/FunOpen";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PublicPopupData } from "modules/public_popup/PublicPopupData";
import { CocHighPerfList } from "../../ccomponent/CocHighPerfList";
import { UH } from "../../helpers/UIHelper";
import { BoxData } from "./BoxData";

@BaseView.registView
@BaseView.regNewView
export class BoxEquipView extends BaseView {
    private is_change: boolean

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Box",
        ViewName: "BoxEquipView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    protected viewNode = {
        Bg: <fgui.GImage>null,
        BtnSale: <fgui.GButton>null,
        BtnClose: <fgui.GButton>null,
        BtnEquip: <fgui.GButton>null,
        BtnChange: <fgui.GButton>null,
        equip0: <BoxEquipItem>null,
        equip1: <BoxEquipItem>null,
        gp_btn: <fgui.GGroup>null,
    }

    protected extendsCfg = [
        { ResName: "EquipAttCell", ExtendsClass: EquipAttCell },
        { ResName: "EquipAddAttCell", ExtendsClass: EquipAddAttCell },
        { ResName: "BoxEquipItem", ExtendsClass: BoxEquipItem },
    ];

    private box_data: BoxData;
    guide_ui_key: string = null;
    private cur_equip_index: number = 0;
    private tran_change_pos: fgui.Transition;
    private is_traning = false;
    private by_0 = 0;
    private by_1 = 0;
    InitData() {
        this.is_change = false
        let self = this;
        self.box_data = BoxData.Inst()
        self.AddSmartDataCare(self.box_data.GetboxResultData(), self.setData.bind(self), "equip_info")
    }

    InitUI() {
        let self = this;
        self.cur_equip_index = 0;
        self.is_traning = false;
        self.guide_ui_key = GuideCtrl.Inst().AddGuideUi("BoxEquipButton", self.viewNode.BtnEquip)
        self.viewNode.BtnClose.onClick(self.CloseView.bind(self))
        self.viewNode.BtnSale.onClick(self.onSell.bind(self))
        self.viewNode.BtnEquip.onClick(self.onEquip.bind(self))
        self.viewNode.BtnChange.onClick(self.OnCLickChange.bind(self))
        self.tran_change_pos = self.view.getTransition("change_pos");

        self.setData(true)
        self.FlushBtnChangeShow()

        if (!this.by_0) {
            this.by_0 = this.viewNode.equip0.y;
            this.by_1 = this.viewNode.equip1.y;
        } else {
            this.viewNode.equip0.y = this.by_0;
            this.viewNode.equip1.y = this.by_1;
        }
    }

    private setData(is_init: boolean = false) {
        let self = this;
        let box_equip_data = self.box_data.GetBoxEquipInfo();
        if (!box_equip_data || !box_equip_data.equipInfo || !box_equip_data.equipInfo.itemId) {
            self.CloseView();
            return
        }
        let cur_equip_data = this.box_data.GetBoxEquippedBefore();
        if (!cur_equip_data) {
            cur_equip_data = BagData.Inst().GetEquipItemInfo(box_equip_data.equipInfo.equipType);
        }
        if (!cur_equip_data) {
            self.viewNode.equip0.visible = self.viewNode.BtnSale.visible = false;
            self.viewNode.Bg.height = 538;
        } else {
            self.viewNode.equip0.visible = self.viewNode.BtnSale.visible = true
            self.viewNode.Bg.height = 944;
        }
        this.viewNode.gp_btn.ensureBoundsCorrect();

        let func_setData = () => {
            let cur_equip = (this.viewNode as any)["equip" + this.cur_equip_index]
            let box_equip = (this.viewNode as any)["equip" + Math.abs(this.cur_equip_index - 1)];

            box_equip.SetData({ equip_data: box_equip_data.equipInfo, cur_equip_data: cur_equip_data, is_new: box_equip_data.isNew == 1 })
            if (cur_equip_data) {
                cur_equip.SetData({ equip_data: cur_equip_data, cur_equip_data: null, is_new: false })
            }
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
    }

    private onEquip() {
        this.is_change = true
        if (!this.is_traning) {
            this.is_traning = true;
            BoxData.Inst().onEquip();
            AudioManager.Inst().Play(AudioTag.ChuanDaiZhaungBei);
            BoxData.Inst().ShowEquipEff = true;
        }
    }

    private onSell() {
        if (!this.is_traning) {
            let box_equip_data = this.box_data.GetBoxEquipInfo();
            if (box_equip_data) {
                if (BoxData.Inst().sale_state == 0) {
                    BoxData.Inst().CheckSale(box_equip_data.equipInfo, BoxData.Inst().sendSale.bind(BoxData.Inst()))
                } else {
                    BoxData.Inst().CheckSale(box_equip_data.equipInfo, BoxData.Inst().sendEnchant.bind(BoxData.Inst()))
                }
            }
        }
    }

    private OnCLickChange() {
        BoxData.Inst().sale_state = BoxData.Inst().sale_state == 0 ? 1 : 0
        PublicPopupCtrl.Inst().Center(Language.Box.ChangeState[BoxData.Inst().sale_state])
        this.FlushBtnChangeShow()
    }

    private FlushBtnChangeShow() {
        this.viewNode.BtnChange.visible = FunOpen.Inst().GetFunIsOpen(Mod.EquipEnchant.Main).is_open
        this.viewNode.BtnSale.title = BoxData.Inst().sale_state == 0 ? Language.Box.Sale : Language.Box.Enchant
    }


    CloseCallBack() {
        if (this.is_change) {
            PublicPopupData.Inst().MainAttrShow = true
        }
        GuideCtrl.Inst().ClearGuideUi(this.guide_ui_key)
    }
    private CloseView() {
        ViewManager.Inst().CloseView(BoxEquipView)
    }
}

export class EquipAttCell extends fgui.GComponent {
    private viewNode = {
        TxtAttName: <fgui.GTextField>null,
        RTxtNum: <fgui.GTextField>null,
        LoderCompare: <fgui.GLoader>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: { att_name: string, num: number, compare_num: number }) {
        if (data != null) {
            UH.SetText(this.viewNode.TxtAttName, data.att_name);
            UH.SetText(this.viewNode.RTxtNum, data.num);
            if (data.num != data.compare_num) {
                this.viewNode.LoderCompare.visible = true;
                UH.SpriteName(this.viewNode.LoderCompare, "Box", data.num > data.compare_num ? "JianTouLv" : "JianTouHong")
            }
            else
                this.viewNode.LoderCompare.visible = false;
        }
    }
}

export class EquipAddAttCell extends fgui.GComponent {
    private viewNode = {
        TxtAttName: <fgui.GTextField>null,
        RTxtNum: <fgui.GTextField>null,
        TxtDesc: <fgui.GTextField>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: { att_name: string, num: number, desc: string }) {
        if (data != null) {
            UH.SetText(this.viewNode.TxtAttName, data.att_name);
            UH.SetText(this.viewNode.RTxtNum, data.num);
            UH.SetText(this.viewNode.TxtDesc, data.desc);
        }
    }
}

export class BoxEquipItem extends fgui.GComponent {
    private viewNode = {
        ListAtt: <fgui.GList>null,
        ListAddAtt: <fgui.GList>null,
        EquipItem: <ItemCell>null,
        TxtName: <fgui.GTextField>null,
        TxtEquipLv: <fgui.GTextField>null,
        ImgNew: <fgui.GTextField>null,
    };

    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    protected onEnable(): void {
        this.viewNode.ListAtt._container.addComponent(CocHighPerfList)
        this.viewNode.ListAddAtt._container.addComponent(CocHighPerfList)
    }

    public SetData(data: { equip_data: IPB_EquipData, cur_equip_data?: IPB_EquipData, is_new: boolean }) {
        if (data != null) {
            let equip_data = data.equip_data;
            this.viewNode.EquipItem.SetData(Item.Create(new CfgItem(equip_data.itemId), { is_click: false }));
            let nc = Item.QuaColorById(equip_data.itemId)
            let outc = Item.QuaColorOLById(equip_data.itemId)
            this.viewNode.TxtName.color = nc;
            this.viewNode.TxtName.strokeColor = outc;
            this.viewNode.TxtName.stroke = 2;
            UH.SetText(this.viewNode.TxtName, Item.GetName(equip_data.itemId));
            UH.SetText(this.viewNode.TxtEquipLv, "Lv." + Item.GetLevel(equip_data.itemId));
            this.viewNode.ListAtt.SetData(BoxData.Inst().GetEquipAttListData(equip_data, data.cur_equip_data));
            this.viewNode.ListAddAtt.SetData(BoxData.Inst().GetEquipAddAttListData(equip_data));
            this.viewNode.ImgNew.visible = data.is_new;
        }
    }
}
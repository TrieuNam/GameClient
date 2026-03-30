import { CfgItem } from "config/CfgCommon";
import { CfgAllPetCloth, CfgPetSkillLevel } from "config/CfgPetCloth";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { PET_OP_TYPE, PetCtrl } from "modules/Pet/PetCtrl";
import { PetData } from "modules/Pet/PetData";
import { PetRelicsEnter, PetRelicsView } from "modules/PetRelics/PetRelicsView";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer } from 'modules/common/BaseView';
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { Currency2 } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { PetClothData } from "./PetClothData";
import { PetHuanHuaSkillUpView } from "./PetHuanHuaSkillUpView";
import { PetHuanHuaTips } from "./PetHuanHuaTips";
@BaseView.registView
export class PetHuanHuaMain extends BaseView {
    private select_index = 0;
    protected viewRegcfg = {
        UIPackName: "PetHuanHua",
        ViewName: "PetHuanHuaMainView",
        LayerType: ViewLayer.Normal,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        BtnRight: <fgui.GButton>null,
        BtnLeft: <fgui.GButton>null,
        LbPetName: <fgui.GTextField>null,
        LbLevel: <fgui.GTextField>null,
        uiModelShow: <UIModelShow>null,
        BtnReturn: <fgui.GButton>null,
        GpUnlocked: <fgui.GGroup>null,
        BtnUnlocked: <fgui.GButton>null,
        ItemNeed: <ItemCell>null,
        GpUpLevel: <fgui.GGroup>null,
        BtnReplace: <CommonButtonBuy>null,
        BtnUpLevel: <CommonButtonBuy>null,
        ListRes: <fgui.GList>null,
        ListSkill: <fgui.GList>null,
        BtnShishi: <fgui.GButton>null,
        BtnChaunShuo: <fgui.GButton>null,
        redShishi: <RedPoint>null,
        redChuanshuo: <RedPoint>null,
        redUpLevel: <RedPoint>null,
        redUnlocked: <RedPoint>null,
        LbNum: <fgui.GRichTextField>null,
        BtnYhh: <fgui.GButton>null,
        EffectShow: <UIEffectShow>null,
        ModelShow: <UIModelShow>null,
        LevelEffect: <fgui.GGroup>null,
        BtnRelics: <PetRelicsEnter>null,
        CurrencyShow: <Currency2>null,
        GpUnlockedDesc: <Currency2>null,
        BtnClothShop: <fgui.GButton>null,
    };
    public InitData(data: any) {
        this.viewNode.BtnReturn.onClick(this.onBtnClick.bind(this, "BtnReturn"));
        this.viewNode.BtnLeft.onClick(this.onBtnClick.bind(this, "BtnLeft"));
        this.viewNode.BtnRight.onClick(this.onBtnClick.bind(this, "BtnRight"));
        this.viewNode.BtnUpLevel.onClick(this.onBtnClick.bind(this, "BtnUpLevel"));
        this.viewNode.BtnReplace.onClick(this.onBtnClick.bind(this, "BtnReplace"));
        this.viewNode.BtnUnlocked.onClick(this.onBtnClick.bind(this, "BtnUnlocked"));
        this.viewNode.BtnShishi.onClick(this.onBtnClick.bind(this, "BtnShishi"));
        this.viewNode.BtnChaunShuo.onClick(this.onBtnClick.bind(this, "BtnChaunShuo"));
        this.viewNode.BtnRelics.onClick(this.onBtnClick.bind(this, "BtnRelics"));
        this.viewNode.BtnClothShop.onClick(this.onBtnClick.bind(this, "BtnClothShop"));
        this.viewNode.ListRes.on(fgui.Event.CLICK_ITEM, this.onClickRes, this);
        this.viewNode.ListRes.setVirtual();
        this.viewNode.ListSkill.setVirtual();
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "flush_cloth_up");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.flushBtn.bind(this), "flush_cloth_wear");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "flush_cloth_wear");
        this.ShowModelData(this.select_index);
        this.FlushList();


    }
    InitUI() {


    }
    protected extendsCfg = [
        { ResName: "PetHuanHuaCell", ExtendsClass: PetHuanHuaCell },
        { ResName: "PetHuanHuaSkillItem", ExtendsClass: PetHuanHuaSkillItem },
    ];



    public FlushList() {

        this.viewNode.ListRes.SetData(PetClothData.Inst().GerAllPetClothData(PetClothData.Inst().CurQualityIndex));
        PetClothData.Inst().CurSelectIndex = this.select_index;
        this.viewNode.ListRes.selectedIndex = this.select_index;
        this.viewNode.BtnShishi.titleColor = this.viewNode.BtnShishi.selected ? COLORS.Yellow1 : COLORS.Yellow4;
        this.viewNode.BtnChaunShuo.titleColor = this.viewNode.BtnChaunShuo.selected ? COLORS.Yellow1 : COLORS.Yellow4;
        this.SetSkillInfo();


        // 
    }
    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }
    private timeOut2: any;
    CloseCallBack() {
        clearTimeout(this.timeOut2);
    }
    private onBtnClick(name: string) {
        let cur = PetClothData.Inst().GerAllPetClothData(PetClothData.Inst().CurQualityIndex)[this.select_index];
        switch (name) {
            case "BtnReturn":
                ViewManager.Inst().CloseView(PetHuanHuaMain);
                break;
            case "BtnLeft":
                this.viewNode.ListRes.selectedIndex = this.select_index == 0 ? this.select_index : this.select_index--;
                let toIndx = this.select_index - 1 < 0 ? this.select_index : this.select_index - 1;
                this.viewNode.ListRes.scrollToView(toIndx);
                this.ShowModelData(this.select_index);
                this.FlushList();
                break;
            case "BtnRight":
                this.viewNode.ListRes.selectedIndex = this.select_index == this.viewNode.ListRes.numItems - 1 ? this.select_index : this.select_index++;
                if (this.select_index > 3) {
                    let toIndx = this.select_index + 1 > this.viewNode.ListRes.numItems - 1 ? this.select_index : this.select_index + 1;
                    this.viewNode.ListRes.scrollToView(toIndx);
                }
                this.ShowModelData(this.select_index);
                this.FlushList();
                break;
            case "BtnUpLevel":
                ViewManager.Inst().OpenView(PetHuanHuaSkillUpView, PetClothData.Inst().GerAllPetClothData(PetClothData.Inst().CurQualityIndex)[this.select_index]);
                break;
            case "BtnReplace":
                for (let i = 0; i < PetData.Inst().PetAllInfo.clothList.length; i++) {
                    if (PetData.Inst().PetAllInfo.clothList[i].petIndex == PetData.Inst().CurShowPetIndex) {
                        PetData.Inst().PetAllInfo.clothList[i].petIndex = 0;
                    }
                }
                let temp = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.itemId == cur.id })
                if (temp && temp.petIndex) {
                    ViewManager.Inst().OpenView(PetHuanHuaTips, cur.id);
                } else {
                    PetCtrl.Inst().SendPetReq(PET_OP_TYPE.CLOTH_WEAR, PetData.Inst().CurShowPetIndex, cur.id);
                    PublicPopupCtrl.Inst().Center(Language.PetHuanHua.repTips);
                }
                break;
            case "BtnUnlocked":
                if (Item.GetNum(cur.id)) {
                    //PetCtrl.Inst().SendPetReq(PET_OP_TYPE.CLOTH_UP, cur.id);
                    //PublicPopupCtrl.Inst().Center(Language.Fish.FishCollectReward.BtnActived);
                    //显示特效
                    this.viewNode.LevelEffect.visible = true
                    this.viewNode.EffectShow.PlayEff(4164140)
                    this.timeOut2 = setTimeout(() => {
                        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.CLOTH_UP, cur.id, 0);
                        PublicPopupCtrl.Inst().Center(Language.Fish.FishCollectReward.BtnActived);
                        this.viewNode.LevelEffect.visible = false
                    }, 4000);
                } else {
                    // let name = TextHelper.Format(Language.PetHuanHua.Tip1, cur.name);
                    // PublicPopupCtrl.Inst().Center(name);
                    let co = PetClothData.Inst().GetPetSkillDataById(cur.id)
                    let jihuo = co.jihuo[0]
                    PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Fashion.ActiveTips, jihuo.num, Item.GetName(jihuo.item_id), co.name), DialogTipsTypes.fashion_active, () => {
                        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.CLOTH_UP, cur.id, 1);
                        if (BagData.Inst().getItemNum(jihuo.item_id) >= jihuo.num) {
                            this.viewNode.LevelEffect.visible = true
                            this.viewNode.EffectShow.PlayEff(4164140)
                            this.timeOut2 = setTimeout(() => {
                                PublicPopupCtrl.Inst().Center(Language.Fish.FishCollectReward.BtnActived);
                                this.viewNode.LevelEffect.visible = false
                            }, 4000);
                        }
                    }, false, Language.Common.active)
                    return
                }

                break;
            case "BtnShishi":
                PetClothData.Inst().CurQualityIndex = 7;
                this.select_index = 0
                this.FlushList();
                this.ShowModelData(this.select_index)
                break;
            case "BtnChaunShuo":
                // PublicPopupCtrl.Inst().Center(Language.PetHuanHua.Tip2);
                // // this.viewNode.BtnShishi.titleColor = COLORS.Yellow1;
                // // this.viewNode.BtnChaunShuo.titleColor = COLORS.Yellow4;
                // this.viewNode.BtnShishi.selected = true;
                PetClothData.Inst().CurQualityIndex = 8;
                this.select_index = 0
                this.FlushList();
                this.ShowModelData(this.select_index)
                break;
            case "BtnRelics":
                ViewManager.Inst().OpenView(PetRelicsView, { cloth_id: cur.id })
                break;
            case "BtnClothShop":
                ViewManager.Inst().OpenViewByKey(Mod.ClothShopView.PetShop)
                break;
        }
    }
    // closeView() {
    //     ViewManager.Inst().CloseView(PetHuanHuaMainView);
    // }

    private OnClickChange(index: number) {

    }
    private onClickRes(item: PetHuanHuaCell, event: fgui.Event) {
        let index = this.viewNode.ListRes.selectedIndex;
        if (index != this.select_index) {
            this.select_index = this.viewNode.ListRes.selectedIndex;
            this.ShowModelData(index);
            this.FlushList();
        }
    }
    private ShowModelData(index: number) {
        let curData = PetClothData.Inst().GerAllPetClothData(PetClothData.Inst().CurQualityIndex)[index];
        if (curData.res_id) {
            this.viewNode.uiModelShow.setPath(ResPath.Npc(curData.res_id));
            this.viewNode.ModelShow.setPath(ResPath.Npc(curData.res_id));
            UH.SetText(this.viewNode.LbPetName, curData.name);
        }
    }
    private SetSkillInfo() {

        let cur = PetClothData.Inst().GerAllPetClothData(PetClothData.Inst().CurQualityIndex)[this.select_index];
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.itemId == cur.id });
        let skill = cloth ? cloth.level : 1;
        let skillData = PetClothData.Inst().GetSkillDataByIdAndLevel(cur.id, skill);
        this.viewNode.ListSkill.SetData(skillData);
        // let num = Item.GetNum(cur.id);
        this.viewNode.GpUpLevel.visible = cloth ? true : false;
        this.viewNode.GpUnlocked.visible = cloth ? false : true;
        // this.viewNode.BtnRelics.visible = cloth ? true : false;

        this.viewNode.redUnlocked.SetNum(0);
        this.viewNode.redUpLevel.SetNum(0);
        this.viewNode.BtnUpLevel.SetTitle(Language.Common.shengji);
        this.viewNode.BtnUpLevel.enabled = true;
        this.viewNode.BtnYhh.visible = false;

        let index = PetData.Inst().CurShowPetIndex
        let huanhua_id = cur.id
        this.viewNode.BtnUpLevel.x = 449
        this.viewNode.redUpLevel.x = 669
        this.viewNode.BtnReplace.visible = true

        if (cloth && cloth.petIndex == index) {
            this.viewNode.BtnReplace.visible = false
            this.viewNode.BtnUpLevel.x = 270
            this.viewNode.redUpLevel.x = 518
        }


        if (!cloth) {
            //激活消耗
            let needNum = PetClothData.Inst().GetUpSkillLevelData(cur.id, 1);
            let num = Item.GetNum(cur.id);
            let isEnough = num >= needNum ? Language.PetHuanHua.numTip1 : Language.PetHuanHua.numTip0;
            UH.SetText(this.viewNode.LbNum, TextHelper.Format(isEnough, num, needNum));
            this.viewNode.ItemNeed.SetData(Item.Create(new CfgItem(cur.id, needNum), { is_click: true, is_gray: false, eff: -1 }));
            //this.viewNode.redShishi.SetNum(PetClothData.Inst().GetRed(cur.id,1))
            this.viewNode.redUnlocked.SetNum(PetClothData.Inst().GetRed(cur.id, 1));

            let show_currency = num < needNum
            let co = PetClothData.Inst().GetPetSkillDataById(cur.id)
            let jihuo = co.jihuo[0]
            this.viewNode.CurrencyShow.SetCurrencyId(jihuo.item_id, jihuo.num)
            this.viewNode.GpUnlockedDesc.visible = !show_currency
            this.viewNode.ItemNeed.visible = !show_currency
            this.viewNode.LbNum.visible = !show_currency
            this.viewNode.CurrencyShow.visible = show_currency
            this.viewNode.BtnUnlocked.y = show_currency ? 1302 : 1403

        } else {

            if (cloth.petIndex) {
                this.viewNode.BtnYhh.visible = true;
            }
            this.viewNode.redUpLevel.SetNum(PetClothData.Inst().GetRed(cur.id, cloth.level + 1));
            if (PetClothData.Inst().GetUpSkillLevelData(cur.id, cloth.level + 1) == null) {
                this.viewNode.BtnUpLevel.SetTitle(Language.PetHuanHua.BtnTitle1);
                this.viewNode.BtnUpLevel.enabled = false;
            }
        }

        let level = cloth ? cloth.level : 0;
        UH.SetText(this.viewNode.LbLevel, Language.Mount.LvTitle + level);




    }
    private onSwitchItem(index: number) {


    }
    flushBtn() {
        let cur = PetClothData.Inst().GerAllPetClothData(PetClothData.Inst().CurQualityIndex)[this.select_index];
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.itemId == cur.id })
        if (cloth.petIndex) {
            this.viewNode.BtnYhh.visible = true;
        }
    }
}


export class PetHuanHuaCell extends BaseItemGB {
    protected viewNode = {
        Cell: <ItemCell>null,
        LbName: <fgui.GTextField>null,
        ImgLock: <fgui.GObject>null,
        redPoint: <RedPoint>null,
    };
    private list_data: any;
    public SetData(data: CfgAllPetCloth) { // CfgAllPetCloth
        this.data = data;
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.itemId == data.id })
        let isLock = cloth ? false : true;
        if (!isLock) {
            this.viewNode.redPoint.SetNum(PetClothData.Inst().GetRed(data.id, cloth.level + 1))
        } else {
            this.viewNode.redPoint.SetNum(PetClothData.Inst().GetRed(data.id, 1))
        }
        this.viewNode.Cell.SetData(Item.Create(new CfgItem(data.id), { is_click: false, is_gray: isLock, eff: isLock ? -1 : undefined }));
        this.viewNode.ImgLock.visible = this.viewNode.LbName.grayed = isLock;
        UH.SetText(this.viewNode.LbName, data.name);

    }

}

export class PetHuanHuaSkillItem extends fgui.GComponent {
    private viewNode = {
        IconFrame: <fgui.GLoader>null,
        IconSkill: <fgui.GLoader>null,
        LbSkillName: <fgui.GTextField>null,
        LbSkillDesc: <fgui.GRichTextField>null,
        GpUnlocked: <fgui.GGroup>null,
    };
    private list_data: any;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: CfgPetSkillLevel) {
        this.data = data;
        let isLock = PetData.Inst().PetAllInfo.clothList.find(cfg => { return cfg.itemId == data.id }) ? false : true;
        this.viewNode.GpUnlocked.visible = isLock;
        let valueCol = COLORSTR.Green3;
        let txt = PetClothData.Inst().GetText(data.skill_txt, valueCol);
        UH.SpriteName(this.viewNode.IconFrame, "PetHuanHua", "skillFrame_" + data.skill_color);
        UH.SetIcon(this.viewNode.IconSkill, data.skill_icon, 1);
        UH.SetText(this.viewNode.LbSkillName, data.skill_name);
        UH.SetText(this.viewNode.LbSkillDesc, txt);


    }

}

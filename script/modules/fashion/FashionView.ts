
import { CfgAttrUp } from "config/CfgCommon";
import { CfgFashionClothes } from "config/CfgFashion";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagCtrl, KNAPSACK_REQ_TYPE } from "modules/bag/BagCtrl";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORS, QualityColor, } from "modules/common/ColorEnum";
import { ItemColor } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { tabberInfo } from "modules/common_board/CommonBoard5";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { MainCapItem } from "modules/main/MainItems";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { Format, TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FASHION_TYPE, FashionData } from "./FashionData";
import { FashionUplevel } from "./FashionUplevel";


@BaseView.registView
export class FashionView extends BaseView {
    data: FashionData = FashionData.Inst()
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: Language.Fashion.TabName[3], index: 0, modKey: Mod.Fashion.HuDun, isRemind: true },
        { panel: null, viewName: "", titleName: Language.Fashion.TabName[2], index: 1, modKey: Mod.Fashion.KaiJia, isRemind: true },
        { panel: null, viewName: "", titleName: Language.Fashion.TabName[1], index: 2, modKey: Mod.Fashion.WuQi, isRemind: true },
        { panel: null, viewName: "", titleName: Language.Fashion.TabName[0], index: 3, modKey: Mod.Fashion.TouKui, isRemind: true },
    ]

    protected viewRegcfg = {
        UIPackName: "Fashion",
        ViewName: "FashionView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Fashion.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard2>null,
        TabList: <fgui.GList>null,
        ClothesList: <fgui.GList>null,
        AttrList: <fgui.GList>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,
        BtnUplevel: <fgui.GButton>null,
        BtnHuanHua: <fgui.GButton>null,
        ModelShow: <UIModelShow>null,
        BtnCancel: <fgui.GButton>null,
        CapItem: <MainCapItem>null,
        Name: <fgui.GTextField>null,
        CurType: <fgui.GTextField>null,
        CurAdd: <fgui.GTextField>null,
        RedPoint: <RedPoint>null,
        HuanHuaRed: <RedPoint>null,
        ClothesList2: <fgui.GList>null,
        Opera: <fgui.GGroup>null,
        BtnPreview: <fgui.GButton>null,
        BtnUplevel2: <fgui.GButton>null,
        BtnBlock: <fgui.GButton>null,
        OperaBg: <fgui.GImage>null,
        BtnClothShop: <fgui.GButton>null,
    };

    protected extendsCfg = [
        { ResName: "ClothesItem2", ExtendsClass: FashionClothesItem },
        { ResName: "ClothesItem", ExtendsClass: FashionClothesItem2 },
        { ResName: "AttrItem", ExtendsClass: FashionAttrItem },
        { ResName: "AttrItem2", ExtendsClass: FashionAttrItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(FashionView, Language.Fashion.Title))
        // this.viewNode.TabList.SetData(this.tabbarCfg)
        // this.viewNode.TabList.on(fgui.Event.CLICK_ITEM, this.OnClickTabItem, this)//这样写才能触发onseletitem

        this.AddSmartDataCare(this.data.FlushData, this.FlushTabShow.bind(this), "flush_all", "flush_single")
        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushTabShow.bind(this, true), "appearance")
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemChange.bind(this), "OtherChange")

        this.viewNode.BtnLeft.onClick(this.OnClickLeft, this)
        this.viewNode.BtnRight.onClick(this.OnClickRight, this)
        this.viewNode.BtnUplevel.onClick(this.OnClickUplevel, this)
        this.viewNode.BtnHuanHua.onClick(this.OnClickHuanHua, this)
        this.viewNode.BtnCancel.onClick(this.OnClickHuanHua, this)
        this.viewNode.BtnClothShop.onClick(this.OnClickClothShop, this)

        this.viewNode.BtnPreview.onClick(this.OnClickPreview, this)
        this.viewNode.BtnUplevel2.onClick(this.OnClickUplevel, this)
        this.viewNode.BtnBlock.onClick(this.OnClickBlock, this)
    }
    OnClickBlock() {
        this.viewNode.Opera.visible = false
    }
    OnClickClothShop() {
        ViewManager.Inst().OpenViewByKey(Mod.ClothShopView.View)
    }
    FlushItemChange() {
        // let clothes_type = this.data.select_index
        // let clothes_data = this.data.GetClothesData(clothes_type)
        // let data = clothes_data[this.viewNode.ClothesList.selectedIndex]
        let suit_id = this.data.select_index
        let clothes_data = this.data.GetClothesData2()
        let clothes_list = clothes_data[suit_id]
        let data = clothes_list[this.viewNode.ClothesList2.selectedIndex]
        let clothes_type = data.clothes_type

        let info = this.data.GetClothesInfo(data.clothes_id)
        if (info == null) {
            let num = Item.GetNum(data.clothes_item)
            this.viewNode.BtnUplevel.grayed = num <= 0
        } else {
            if (this.data.active_info[data.clothes_id] == null && info.level == 1) {
                this.viewNode.HuanHuaRed.SetNum(1)
            } else {
                this.viewNode.HuanHuaRed.SetNum(0)
            }
            let levelCfg = this.data.GetClothesLevel(data.clothes_id, info.level)
            let num = Item.GetNum(levelCfg.up_item)
            this.viewNode.BtnUplevel.grayed = num <= 0
        }
    }
    OnClickUplevel() {
        //检查最大级飘提示
        /* let data = this.data.select_clothes
        let info = this.data.GetClothesInfo(data.clothes_id)
        if (info == null) {

        } else {
            let nextCfg = this.data.GetClothesLevel(data.clothes_id, info.level + 1)
            if (nextCfg == null) {
                PublicPopupCtrl.Inst().Center(Language.Fashion.FashionMax)
                return
            }
        } */
        // let data = this.data.select_clothes
        // let get_data = new CommGetData(Item.GetName(data.clothes_item), data.jihuo_att, Item.GetColor(data.clothes_item), 1, CommGetType.Fashion, 1, data.clothes_item)
        // ViewManager.Inst().OpenView(CommonGetView2, get_data);
        ViewManager.Inst().OpenView(FashionUplevel)
    }
    OnClickHuanHua() {
        let data = this.data.select_clothes
        let info = this.data.GetClothesInfo(data.clothes_id)
        if (!info || info.level <= 0) {
            PublicPopupCtrl.Inst().Center(Language.Fashion.LevelTip)
            return
        }
        if (this.data.active_info[data.clothes_id] == null) {
            this.viewNode.HuanHuaRed.SetNum(0)
            this.data.active_info[data.clothes_id] = info.level
        }
        BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.SHI_ZHUANG_USE, [data.clothes_id])

        let is_onbody = this.data.GetClothesOnBody(data.clothes_type, data.clothes_id)
        PublicPopupCtrl.Inst().Center(is_onbody ? Language.Fashion.HuanHuaCancel : Language.Fashion.HuanHuaSuccess)
        let levelCfg = this.data.GetClothesLevel(data.clothes_id, info.level)
        if (levelCfg) {
            if (levelCfg.dangqian_att.length == 0) {
                data.jihuo_att.forEach(element => {
                    if (!is_onbody) {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} +${AttrHelper.Percent(element.type, element.add)}`, 1)
                    } else {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} -${AttrHelper.Percent(element.type, element.add)}`, 0)
                    }
                });
            } else {
                levelCfg.dangqian_att.forEach(element => {
                    if (!is_onbody) {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} +${AttrHelper.Percent(element.type, element.add)}`, 1)
                    } else {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} -${AttrHelper.Percent(element.type, element.add)}`, 0)
                    }
                });
            }
        }

    }
    OnClickLeft() {
        //this.viewNode.ClothesList.scrollToView(0)
        this.viewNode.ClothesList.scrollPane.scrollLeft()
    }
    OnClickRight() {
        // let clothes_type = this.data.select_index
        // let clothes_data = this.data.GetClothesData(clothes_type)
        // this.viewNode.ClothesList.scrollToView(clothes_data.length - 1)
        this.viewNode.ClothesList.scrollPane.scrollRight()
    }
    OnClickTabItem() {
        //console.log("选中标签也1111");

        let select_index = this.viewNode.TabList.selectedIndex;
        //console.log(select_index);
        this.data.select_index = select_index


        //this.data.FlushData.tab_flush = !this.data.FlushData.tab_flush

        //console.log(this.tabbarCfg[select_index]);
        //this.FlushTabShow()
        let clothes_type = this.data.select_index
        let clothes_data = this.data.GetClothesData(clothes_type)
        //console.log(clothes_data);
        //let x = this.viewNode.ClothesList.scrollPane.posX


        /* this.viewNode.ClothesList.setVirtual()
        this.viewNode.ClothesList.SetData(clothes_data)
        this.viewNode.ClothesList.on(fgui.Event.CLICK_ITEM, this.OnClickClothes, this)
        this.viewNode.ClothesList.scrollToView(0)
        this.viewNode.ClothesList.OnSelectedItem(0) */
    }
    FlushTabShow(flag: boolean) {
        /* let clothes_type = this.data.select_index
        let clothes_data = this.data.GetClothesData(clothes_type) */
        //console.log(clothes_data);
        //let x = this.viewNode.ClothesList.scrollPane.posX
        //this.viewNode.ClothesList.setVirtual()
        //console.log("Flush tab show");

        /* this.viewNode.ClothesList.SetData(clothes_data) */
        //console.log("刷新数据");

        this.FlushTopList()

        let clothes_data = this.data.GetClothesData2()
        let data = clothes_data[this.viewNode.ClothesList.selectedIndex]
        let suit_id = this.data.select_index = this.viewNode.ClothesList.selectedIndex
        //console.log(data);
        //this.viewNode.ClothesList2.setVirtual() 不可移动的列表不能设置未虚拟列表不然抛异常
        let index = this.data.clothes_index

        this.viewNode.ClothesList2.SetData(data)
        if (flag != true) {
            this.viewNode.ClothesList2.OnSelectedItem(index)
        }

        let clothes_list = clothes_data[suit_id]
        let c_data = clothes_list[this.viewNode.ClothesList2.selectedIndex]
        let clothes_type = c_data.clothes_type
        let is_onbody = this.data.GetClothesOnBody(clothes_type, c_data.clothes_id)

        this.viewNode.BtnHuanHua.visible = !is_onbody;
        this.viewNode.BtnCancel.visible = is_onbody;
        //this.OnClickClothes(flag)

        //this.viewNode.ClothesList.scrollToView(this.data.clothes_index)
        //this.viewNode.ClothesList.OnSelectedItem(this.data.clothes_index)

        //this.viewNode.ClothesList.scrollToView(0)
        //this.viewNode.ClothesList.OnSelectedItem(0)


        //this.viewNode.ClothesList.OnSelectedItem(0)
        // if (clothes_data.length < this.data.clothes_index) {
        //     this.viewNode.ClothesList.OnSelectedItem(0)
        // } else {
        //     //虚拟列表不能如此没办法
        // }
    }
    //刷新时装显示
    OnClickClothes(flag: boolean) {
        //console.log("点击装备");
        /* let clothes_type = this.data.select_index
        let clothes_data = this.data.GetClothesData(clothes_type)
        let data = clothes_data[this.viewNode.ClothesList.selectedIndex] */

        let suit_id = this.data.select_index
        let clothes_data = this.data.GetClothesData2()
        let clothes_list = clothes_data[suit_id]
        let data = clothes_list[this.viewNode.ClothesList2.selectedIndex]
        let clothes_type = data.clothes_type

        /* this.data.clothes_index = this.viewNode.ClothesList.selectedIndex */
        this.data.clothes_index = this.viewNode.ClothesList2.selectedIndex
        this.data.select_clothes = data
        //根据等级显示属性
        let info = this.data.GetClothesInfo(data.clothes_id)
        let is_onbody = this.data.GetClothesOnBody(clothes_type, data.clothes_id)

        this.viewNode.BtnHuanHua.visible = !is_onbody
        this.viewNode.BtnCancel.visible = is_onbody
        //console.log(Item.GetName(data.clothes_item));

        UH.SetText(this.viewNode.Name, Item.GetName(data.clothes_item))
        if (ItemColor.Color == Item.GetColor(data.clothes_item)) {
            this.viewNode.Name.color = COLORS.White
            TextHelper.TextGradualChange(this.viewNode.Name, [COLORS.ColorDown, COLORS.ColorDown, COLORS.ColorUp, COLORS.ColorUp])
        } else {
            TextHelper.TextGradualChange(this.viewNode.Name, [COLORS.White, COLORS.White, COLORS.White, COLORS.White])
            this.viewNode.Name.color = QualityColor[Item.GetColor(data.clothes_item)]
        }
        if (info == null) {
            //this.viewNode.AttrList.SetData(data.jihuo_att)
            let attr = data.jihuo_att[0]
            UH.SetText(this.viewNode.CurType, AttrListName[attr.type] + ":")
            UH.SetText(this.viewNode.CurAdd, AttrHelper.Percent(attr.type, attr.add));
            this.viewNode.BtnUplevel.text = Language.Fashion.Title2[0]
            this.viewNode.CapItem.SetData(0)
        } else {
            this.viewNode.BtnUplevel.text = Language.Fashion.Title2[1]
            let levelCfg = this.data.GetClothesLevel(data.clothes_id, info.level)
            if (info.level == 1) {
                //this.viewNode.AttrList.SetData(data.jihuo_att)
                let attr = data.jihuo_att[0]
                UH.SetText(this.viewNode.CurType, AttrListName[attr.type] + ":")
                UH.SetText(this.viewNode.CurAdd, AttrHelper.Percent(attr.type, attr.add));
            } else {
                //this.viewNode.AttrList.SetData(levelCfg.dangqian_att)
                let attr = levelCfg.dangqian_att[0]
                UH.SetText(this.viewNode.CurType, AttrListName[attr.type] + ":")
                UH.SetText(this.viewNode.CurAdd, AttrHelper.Percent(attr.type, attr.add));
            }
            this.viewNode.CapItem.SetData(levelCfg.score)
        }
        /* this.viewNode.RedPoint.SetNum(this.data.GetClothesRedPoint(data)) */
        if (clothes_type == FASHION_TYPE.TOU_KUI) {
            this.viewNode.OperaBg.x = 516
            this.viewNode.BtnPreview.x = 524
            this.viewNode.BtnUplevel2.x = 524
            //this.viewNode.ModelShow.setHeadSkin(data.res_id);
        } else if (clothes_type == FASHION_TYPE.HU_DUN) {
            this.viewNode.OperaBg.x = 112
            this.viewNode.BtnPreview.x = 120
            this.viewNode.BtnUplevel2.x = 120
            //this.viewNode.ModelShow.setShiledSkin(data.res_id);
        } else if (clothes_type == FASHION_TYPE.WU_QI) {
            this.viewNode.OperaBg.x = 381
            this.viewNode.BtnPreview.x = 389
            this.viewNode.BtnUplevel2.x = 389
            //this.viewNode.ModelShow.setWeaponSkin(data.res_id);
        } else if (clothes_type == FASHION_TYPE.KAI_JIA) {
            this.viewNode.OperaBg.x = 246
            this.viewNode.BtnPreview.x = 254
            this.viewNode.BtnUplevel2.x = 254
            //this.viewNode.ModelShow.setBodySkin(data.res_id);
        }
        if (flag != true) {
            this.viewNode.Opera.visible = true
        }
        //this.FlushItemChange()
    }

    InitUI() {
        this.viewNode.ModelShow.setPath(ResPath.ActorRole(10001), RoleData.Inst().GetAppearanceRes(false, false));
    }

    DoOpenWaitHandle() {
    }
    OnClickPreview() {
        let suit_id = this.data.select_index
        let clothes_data = this.data.GetClothesData2()
        let clothes_list = clothes_data[suit_id]
        let data = clothes_list[this.viewNode.ClothesList2.selectedIndex]
        let clothes_type = data.clothes_type
        if (clothes_type == FASHION_TYPE.TOU_KUI) {
            this.viewNode.ModelShow.setHeadSkin(data.res_id);
        } else if (clothes_type == FASHION_TYPE.HU_DUN) {
            this.viewNode.ModelShow.setShiledSkin(data.res_id);
        } else if (clothes_type == FASHION_TYPE.WU_QI) {
            this.viewNode.ModelShow.setWeaponSkin(data.res_id);
        } else if (clothes_type == FASHION_TYPE.KAI_JIA) {
            this.viewNode.ModelShow.setBodySkin(data.res_id);
        }
    }
    OpenCallBack() {
        //this.viewNode.TabList.OnSelectedItem(0)
        this.viewNode.Opera.visible = false
        let clothes_data = this.data.GetClothesData2()

        this.viewNode.ClothesList.setVirtual()
        this.viewNode.ClothesList.SetData(clothes_data)
        this.viewNode.ClothesList.on(fgui.Event.CLICK_ITEM, this.OnClickClothes2, this)
        this.viewNode.ClothesList.scrollToView(0)
        this.viewNode.ClothesList.OnSelectedItem(0)
    }
    FlushTopList() {
        this.viewNode.ModelShow.setAppearance(RoleData.Inst().GetAppearanceRes(false, false));
        let clothes_data = this.data.GetClothesData2()
        this.viewNode.ClothesList.SetData(clothes_data)
        this.viewNode.ClothesList.selectedIndex = this.data.select_index;
        //this.viewNode.ClothesList.OnSelectedItem(this.data.select_index)
    }
    OnClickClothes2() {
        let clothes_data = this.data.GetClothesData2()
        let data = clothes_data[this.viewNode.ClothesList.selectedIndex]
        this.data.select_index = this.viewNode.ClothesList.selectedIndex
        //console.log(data);
        //this.viewNode.ClothesList2.setVirtual() 不可移动的列表不能设置未虚拟列表不然抛异常
        this.viewNode.ClothesList2.SetData(data)
        this.viewNode.ClothesList2.on(fgui.Event.CLICK_ITEM, this.OnClickClothes, this)
        this.viewNode.ClothesList2.OnSelectedItem(this.data.clothes_index)
        this.viewNode.Opera.visible = false
    }
    CloseCallBack() {
        this.data.click_jihuo = false;
    }
}

export class FashionClothesItem extends BaseItemGB {
    fashion_data = FashionData.Inst()
    protected viewNode = {
        Cell: <ItemCell>null,
        Level: <fgui.GTextField>null,
        Lock: <fgui.GGroup>null,
        EffecShow: <UIEffectShow>null,
        RedPoint: <RedPoint>null,
    };
    _data: CfgFashionClothes;
    old_level: number = -1
    is_playing: boolean = false
    SetData(data: CfgFashionClothes) {
        this._data = data
        let cell_eff = 0
        let info = this.fashion_data.GetClothesInfo(data.clothes_id)
        if (info == null) {
            cell_eff = -1
            UH.SetText(this.viewNode.Level, "")
            this.viewNode.Lock.visible = true
            this.old_level = 0
        } else {
            if (this.fashion_data.click_jihuo && this.old_level == 0 && info.level == 1 && !this.is_playing) {
                this.viewNode.EffecShow.PlayEff(4164015)
                this.is_playing = true
                this.fashion_data.click_jihuo = false
            }
            this.old_level = info.level
            this.viewNode.Lock.visible = false
            UH.SetText(this.viewNode.Level, Format(Language.Common.LevelShow, info.level))
        }
        this.viewNode.Cell.SetData(Item.Create({ item_id: data.clothes_item }, { is_click: false, eff: cell_eff }))
        this.viewNode.RedPoint.SetNum(this.fashion_data.GetClothesRedPoint(data))
    }
}

export class FashionClothesItem2 extends BaseItemGB {
    fashion_data = FashionData.Inst()
    protected viewNode = {
        Cell: <ItemCell>null,
        Level: <fgui.GTextField>null,
        Lock: <fgui.GGroup>null,
        //EffecShow: <UIEffectShow>null,
        RedPoint: <RedPoint>null,
        Name: <fgui.GTextField>null
    };
    _data: CfgFashionClothes;
    //old_level: number = -1
    //is_playing: boolean = false
    SetData(data: CfgFashionClothes[]) {
        let all = data[0]
        this.viewNode.Lock.visible = false
        UH.SetText(this.viewNode.Name, all.suit_name)
        this.viewNode.Cell.SetData(Item.Create({ item_id: all.suit_icon }, { is_click: false }))
        //红点需要收集
        let num = 0
        data.forEach(element => {
            num = num + this.fashion_data.GetClothesRedPoint(element)
        });
        this.viewNode.RedPoint.SetNum(num > 0 ? 1 : 0)
    }
}

export class FashionAttrItem extends BaseItem {

    protected viewNode = {
        Desc: <fgui.GTextField>null,
        Value: <fgui.GTextField>null,
    };
    _data: CfgAttrUp;
    SetData(data: CfgAttrUp) {
        this._data = data
        //console.log(data);
        UH.SetText(this.viewNode.Desc, AttrListName[data.type] + ":");
        UH.SetText(this.viewNode.Value, AttrHelper.Percent(data.type, data.add));
    }
}


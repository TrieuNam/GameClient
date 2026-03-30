import { CfgAttrUp } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { AudioManager, AudioTag } from "modules/audio/AudioManager";
import { BagCtrl, KNAPSACK_REQ_TYPE } from "modules/bag/BagCtrl";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from 'modules/common/BaseView';
import { COLORS } from "modules/common/ColorEnum";
import { AttrListName, Language } from 'modules/common/Language';
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { Currency2 } from "modules/extends/Currency";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FashionData } from "./FashionData";
@BaseView.RegisterView
export class FashionUplevel extends BaseView {
    data = FashionData.Inst()
    cur_attrs: CfgAttrUp[] = null
    next_attrs: CfgAttrUp[] = null
    protected viewRegcfg = {
        UIPackName: "Fashion",
        ViewName: "FashionUplevel",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard3>null,
        CostDesc: <fgui.GTextField>null,
        CostCount: <fgui.GTextField>null,
        BtnUp: <fgui.GButton>null,
        CostCell: <ItemCell>null,
        AttrList1: <fgui.GList>null,
        AttrList2: <fgui.GList>null,
        NoNext: <fgui.GTextField>null,
        Name: <fgui.GTextField>null,
        CurType: <fgui.GTextField>null,
        NextType: <fgui.GTextField>null,
        CurAdd: <fgui.GTextField>null,
        NextAdd: <fgui.GTextField>null,
        MaxLevel: <fgui.GTextField>null,
        NextGroup: <fgui.GGroup>null,
        GgLvupDetails: <fgui.GGroup>null,
        ImgMaxLv: <fgui.GImage>null,
        CurrencyShow: <Currency2>null,
        BgCost: <fgui.GImage>null,
    };

    /* protected extendsCfg = [
        { ResName: "组件名", ExtendsClass: 拓展类 }
    ]; */

    InitData() {
        this.viewNode.Board.SetData(new BoardData(FashionUplevel))
        this.viewNode.BtnUp.onClick(this.OnClickUp, this)
        this.AddSmartDataCare(this.data.FlushData, this.FlushFashionShow.bind(this), "flush_single")
    }
    FlushFashionShow() {
        this.OpenCallBack()
    }
    OnClickUp() {
        let data = this.data.select_clothes
        let info = this.data.GetClothesInfo(data.clothes_id)
        if (info == null) {
            if (Item.GetNum(data.clothes_item) > 0) {
                this.data.click_jihuo = true
                ViewManager.Inst().CloseView(FashionUplevel)
                AudioManager.Inst().Play(AudioTag.JiHuo)
                BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.SHI_ZHUANG_LEVEL_UP, [data.clothes_id, 0])
            } else {
                let jihuo = data.jihuo[0]
                PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Fashion.ActiveTips, jihuo.num, Item.GetName(jihuo.item_id), Item.GetName(data.clothes_item)), DialogTipsTypes.fashion_active, () => {
                    BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.SHI_ZHUANG_LEVEL_UP, [data.clothes_id, 1])
                }, false, Language.Common.active)
            }
        } else {

            let nextCfg = this.data.GetClothesLevel(data.clothes_id, info.level + 1)
            if (nextCfg == null) {
                PublicPopupCtrl.Inst().Center(Language.Fashion.FashionMax)
            } else {
                BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.SHI_ZHUANG_LEVEL_UP, [data.clothes_id, 0])
                let levelCfg = this.data.GetClothesLevel(data.clothes_id, info.level)
                if (Item.GetNum(levelCfg.up_item) > 0) {
                    AudioManager.Inst().Play(AudioTag.ShengJi)
                    let is_onbody = this.data.GetClothesOnBody(data.clothes_type, data.clothes_id)
                    if (is_onbody) {
                        if (this.cur_attrs && this.next_attrs) {
                            for (let index = 0; index < this.next_attrs.length; index++) {
                                const element = this.next_attrs[index];
                                const element2 = this.cur_attrs[index]
                                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[element.type]} +${AttrHelper.Percent(element.type, element.add - element2.add)}`, 1)
                            }
                        }
                    }
                }
            }
        }
    }

    InitUI() {
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
        let data = this.data.select_clothes
        //console.log(data.clothes_id);
        UH.SetText(this.viewNode.Name, Item.GetName(data.clothes_item))
        let info = this.data.GetClothesInfo(data.clothes_id)
        this.cur_attrs = null
        this.next_attrs = null
        let maxLv = false;
        let show_currency = false
        if (info == null) {
            //为激活
            maxLv = false;
            this.viewNode.MaxLevel.visible = false;
            this.viewNode.Board.SetTitle(Language.Fashion.Title2[0])
            UH.SetText(this.viewNode.CostDesc, Language.Fashion.CostDesc[0])
            this.viewNode.CostCell.SetData(Item.Create({ item_id: data.clothes_item }))
            let nextCfg = this.data.GetClothesLevel(data.clothes_id, 1)
            let needItemNum = nextCfg ? nextCfg.up_item_num : 1;
            UH.SetText(this.viewNode.CostCount, `${Item.GetNum(data.clothes_item)}/${needItemNum}`)
            this.viewNode.CostCount.color = Item.GetNum(data.clothes_item) >= needItemNum ? COLORS.Green1 : COLORS.Red1
            this.viewNode.BtnUp.title = Language.Fashion.Title2[0]
            //this.viewNode.AttrList1.SetData(data.jihuo_att)
            let attr = data.jihuo_att[0]
            UH.SetText(this.viewNode.CurType, AttrListName[attr.type] + ":")
            UH.SetText(this.viewNode.CurAdd, AttrHelper.Percent(attr.type, 0));

            let levelCfg = this.data.GetClothesLevel(data.clothes_id, 2)
            //attr = levelCfg.dangqian_att[0]
            UH.SetText(this.viewNode.NextType, AttrListName[attr.type] + ":")
            UH.SetText(this.viewNode.NextAdd, AttrHelper.Percent(attr.type, attr.add));
            // this.viewNode.AttrList2.SetData(levelCfg.dangqian_att)
            show_currency = Item.GetNum(data.clothes_item) < needItemNum
            let jihuo = data.jihuo[0]
            this.viewNode.CurrencyShow.SetCurrencyId(jihuo.item_id, jihuo.num)
        } else {
            this.viewNode.Board.SetTitle(Language.Fashion.Title2[1])
            UH.SetText(this.viewNode.CostDesc, Language.Fashion.CostDesc[1])
            let levelCfg = this.data.GetClothesLevel(data.clothes_id, info.level)
            this.viewNode.CostCell.SetData(Item.Create({ item_id: levelCfg.up_item }))
            let nextCfg = this.data.GetClothesLevel(data.clothes_id, info.level + 1)
            let needItemNum = nextCfg ? nextCfg.up_item_num : 1;
            UH.SetText(this.viewNode.CostCount, `${Item.GetNum(levelCfg.up_item)}/${needItemNum}`);
            this.viewNode.CostCount.color = Item.GetNum(levelCfg.up_item) >= needItemNum ? COLORS.Green1 : COLORS.Red1
            if (info.level == 1) {
                this.cur_attrs = data.jihuo_att
                let attr = data.jihuo_att[0]
                UH.SetText(this.viewNode.CurType, AttrListName[attr.type] + ":")
                UH.SetText(this.viewNode.CurAdd, AttrHelper.Percent(attr.type, attr.add));
                //this.viewNode.AttrList1.SetData(data.jihuo_att)
            } else {
                this.cur_attrs = levelCfg.dangqian_att
                let attr = levelCfg.dangqian_att[0]
                UH.SetText(this.viewNode.CurType, AttrListName[attr.type] + ":")
                UH.SetText(this.viewNode.CurAdd, AttrHelper.Percent(attr.type, attr.add));
                //this.viewNode.AttrList1.SetData(levelCfg.dangqian_att)
            }

            this.viewNode.MaxLevel.visible = false
            this.viewNode.NextGroup.visible = true
            if (nextCfg == null) {
                this.viewNode.MaxLevel.visible = true
                this.viewNode.NextGroup.visible = false
                this.viewNode.BtnUp.grayed = true;
                this.viewNode.BtnUp.title = Language.Fashion.Title2[2]
                maxLv = true;
                // let attr = levelCfg.dangqian_att[0]
                // UH.SetText(this.viewNode.NextType, AttrListName[attr.type] + ":")
                // UH.SetText(this.viewNode.NextAdd, AttrHelper.Percent(attr.type, 0));
                //this.viewNode.AttrList2.visible = false
                // this.viewNode.NoNext.visible = true
            } else {
                //this.viewNode.NoNext.visible = false
                // this.viewNode.AttrList2.visible = true
                // this.viewNode.AttrList2.SetData(nextCfg.dangqian_att)
                this.viewNode.BtnUp.title = Language.Fashion.Title2[1]
                this.next_attrs = nextCfg.dangqian_att
                let attr = nextCfg.dangqian_att[0]
                UH.SetText(this.viewNode.NextType, AttrListName[attr.type] + ":")
                UH.SetText(this.viewNode.NextAdd, AttrHelper.Percent(attr.type, attr.add));
                maxLv = false;
            }
        }
        this.viewNode.GgLvupDetails.visible = !maxLv && !show_currency;
        this.viewNode.ImgMaxLv.visible = maxLv;
        this.viewNode.CurrencyShow.visible = show_currency;
        this.viewNode.BgCost.visible = !show_currency;
    }

    CloseCallBack() {
    }
}
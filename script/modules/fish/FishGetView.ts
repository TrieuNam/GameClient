import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { Timer } from "modules/time/Timer";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishConfig } from "./FishConfig";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";

@BaseView.registView
export class FishGetView extends BaseView {
    private timer_handle_anim: any = null;
    private anim_co = {
        speed: 20,
        interval: 0.02,
    }

    private box: any[]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishGet",
        ViewName: "FishGetView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };
    protected viewNode = {
        // BtnBox: <fgui.GButton>null,
        BtnSell: <fgui.GButton>null,

        NameShow: <fgui.GRichTextField>null,
        SellNum: <fgui.GTextField>null,
        SellIcon: <fgui.GLoader>null,
        TypeName: <fgui.GTextField>null,
        AttrList: <fgui.GList>null,
        ShowList: <fgui.GList>null,
        QuaIcon: <fgui.GLoader>null,
        ItemIcon: <fgui.GLoader>null,
        NewObj: <fgui.GImage>null,
        GpRecord: <fgui.GGroup>null,

        AnimIcon1: <fgui.GLoader>null,
        AnimIcon2: <fgui.GLoader>null,
        AnimQuaIcon1: <fgui.GLoader>null,
        AnimQuaIcon2: <fgui.GLoader>null,
    };

    protected extendsCfg = [
        { ResName: "ItemAttr", ExtendsClass: FishGetViewAttrItem },
        { ResName: "ItemShow", ExtendsClass: FishGetViewShowItem },
        { ResName: "ItemShowAttr", ExtendsClass: FishGetViewShowAttrItem },
    ];

    InitData() {
        // this.viewNode.BtnBox.onClick(this.OnClickBox, this);
        this.viewNode.BtnSell.onClick(this.OnClickSell, this);
        this.viewNode.ShowList.on(fgui.Event.CLICK_ITEM, this.OnClickShowItem, this);

        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoItemInfo.bind(this), "WaBaoCollectionFlush");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoGetAnim.bind(this), "WaBaoGetAnim");
    }

    InitUI() {
        this.FlushWaBaoItemInfo()

    }

    CloseCallBack() {
        FishData.Inst().IsAutoWabao()
        Timer.Inst().CancelTimer(this.timer_handle_anim)
    }

    FlushWaBaoItemInfo() {
        let itemInfo = FishData.Inst().ResultData.WaBaoItemInfo
        let itemData = itemInfo.itemData
        let itemId = itemData.itemId
        let item = Item.Create({ itemId: itemId })
        let wabao_type = Item.GetWaBaoType(itemId)
        UH.SetText(this.viewNode.NameShow, item.QuaName())
        UH.SetText(this.viewNode.SellNum, Item.GetSfbPrice(itemId))
        UH.SetText(this.viewNode.TypeName, GetCfgValue(Language.Fish.BoxTypeShows, Item.GetWaBaoType(itemId)))
        UH.SetIcon(this.viewNode.SellIcon, Item.GetIconId(FishData.Inst().CfgOtherBoxUpItem()), ICON_TYPE.ITEM);
        this.viewNode.NewObj.visible = FishConfig.WaBaoResultType.yes_new_get == itemInfo.result
        this.viewNode.GpRecord.visible = FishConfig.WaBaoResultType.yes_new_record == itemInfo.result
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${Item.GetColor(itemData.itemId)}`)
        UH.SetIcon(this.viewNode.ItemIcon, Item.GetIconId(itemData.itemId), ICON_TYPE.KaoGu);
        this.viewNode.ItemIcon.visible = true
        this.viewNode.QuaIcon.visible = true

        let attrs = []
        if (itemData.attrType1 > 0) {
            attrs.push({ attrType: itemData.attrType1, attrValue: itemData.attrValue1 })
        }
        if (itemData.attrType2 > 0) {
            attrs.push({ attrType: itemData.attrType2, attrValue: itemData.attrValue2 })
        }
        this.viewNode.AttrList.SetData(attrs)

        let co = FishData.Inst().CfgGatherInfo(FishData.Inst().GetWaBaoInfoCollectionLevel())
        this.box = []
        let num = +GetCfgValue(co, `num_${wabao_type + 1}`)
        let co_next = FishData.Inst().CfgGatherInfoNext(wabao_type + 1, num + 1)
        for (let i = 0; i < FishConfig.BOX_ITEMS_MAX; i++) {
            this.box.push({ type: wabao_type, index: i, is_open: i < num, level: co_next ? co_next.level : 0 });
        }
        this.viewNode.ShowList.SetData(this.box);
    }

    FlushWaBaoGetAnim() {
        let get_anim = FishData.Inst().ResultData.WaBaoGetAnim;
        let itemInfo = FishData.Inst().ResultData.WaBaoItemInfo

        UH.SpriteName(this.viewNode.AnimQuaIcon1, "CommonAtlas", `PinZhi${Item.GetColor(itemInfo.itemData.itemId)}`)
        UH.SpriteName(this.viewNode.AnimQuaIcon2, "CommonAtlas", `PinZhi${Item.GetColor(get_anim.itemData ? get_anim.itemData.itemId : 0)}`)
        UH.SetIcon(this.viewNode.AnimIcon1, Item.GetIconId(itemInfo.itemData.itemId), ICON_TYPE.KaoGu);
        UH.SetIcon(this.viewNode.AnimIcon2, Item.GetIconId(get_anim.itemData ? get_anim.itemData.itemId : 0), ICON_TYPE.KaoGu);
        this.viewNode.AnimIcon1.x = 0
        this.viewNode.AnimIcon1.y = 0
        let pos1 = this.viewNode.AnimIcon1.globalToLocal(this.viewNode.ItemIcon.localToGlobal().x, this.viewNode.ItemIcon.localToGlobal().y,)
        let pos2 = this.viewNode.AnimIcon1.globalToLocal(get_anim.pos.x, get_anim.pos.y)
        let pos_x = pos1.x - pos2.x
        let pos_y = pos1.y - pos2.y

        this.viewNode.AnimIcon1.x = pos1.x
        this.viewNode.AnimIcon1.y = pos1.y
        this.viewNode.AnimIcon2.x = pos2.x;
        this.viewNode.AnimIcon2.y = pos2.y;

        this.viewNode.AnimQuaIcon1.x = pos1.x
        this.viewNode.AnimQuaIcon1.y = pos1.y
        this.viewNode.AnimQuaIcon2.x = pos2.x;
        this.viewNode.AnimQuaIcon2.y = pos2.y;

        this.viewNode.AnimIcon1.visible = true
        this.viewNode.AnimIcon2.visible = undefined != get_anim.itemData;
        this.viewNode.AnimQuaIcon1.visible = true
        this.viewNode.AnimQuaIcon2.visible = undefined != get_anim.itemData;

        this.viewNode.QuaIcon.visible = false
        this.viewNode.ItemIcon.visible = false
        get_anim.cbs && get_anim.cbs();
        this.viewNode.ShowList.touchable = false
        this.viewNode.BtnSell.touchable = false

        Timer.Inst().CancelTimer(this.timer_handle_anim)
        this.timer_handle_anim = Timer.Inst().AddCountDownTT(() => {
            this.viewNode.AnimIcon1.x = this.viewNode.AnimIcon1.x - pos_x / this.anim_co.speed
            this.viewNode.AnimIcon1.y = this.viewNode.AnimIcon1.y - pos_y / this.anim_co.speed
            this.viewNode.AnimIcon2.x = this.viewNode.AnimIcon2.x + pos_x / this.anim_co.speed
            this.viewNode.AnimIcon2.y = this.viewNode.AnimIcon2.y + pos_y / this.anim_co.speed

            this.viewNode.AnimQuaIcon1.x = this.viewNode.AnimQuaIcon1.x - pos_x / this.anim_co.speed
            this.viewNode.AnimQuaIcon1.y = this.viewNode.AnimQuaIcon1.y - pos_y / this.anim_co.speed
            this.viewNode.AnimQuaIcon2.x = this.viewNode.AnimQuaIcon2.x + pos_x / this.anim_co.speed
            this.viewNode.AnimQuaIcon2.y = this.viewNode.AnimQuaIcon2.y + pos_y / this.anim_co.speed
        }, () => {
            this.viewNode.AnimIcon1.visible = false
            this.viewNode.AnimIcon2.visible = false
            this.viewNode.AnimQuaIcon1.visible = false
            this.viewNode.AnimQuaIcon2.visible = false
            get_anim.cbe && get_anim.cbe();
            this.viewNode.ShowList.touchable = true
            this.viewNode.BtnSell.touchable = true
            if (undefined == get_anim.itemData) {
                ViewManager.Inst().CloseView(FishGetView);
            } else {
                let itemData = get_anim.itemData
                if (itemData.attrType1 > 0) {
                    PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType1]} -${AttrHelper.Percent(itemData.attrType1, itemData.attrValue1)}`, 0)
                }
                if (itemData.attrType2 > 0) {
                    PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType2]} -${AttrHelper.Percent(itemData.attrType2, itemData.attrValue2)}`, 0)
                }
            }
            let itemData = itemInfo.itemData
            if (itemData.attrType1 > 0) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType1]} +${AttrHelper.Percent(itemData.attrType1, itemData.attrValue1)}`, 1)
            }
            if (itemData.attrType2 > 0) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType2]} +${AttrHelper.Percent(itemData.attrType2, itemData.attrValue2)}`, 1)
            }
        }, this.anim_co.interval * this.anim_co.speed, this.anim_co.interval, false)
    }

    // OnClickBox() {
    //     let has_empty = false
    //     for(let i = 0; i < this.box.length; i ++){
    //         let info = this.box[i]
    //         let item = FishData.Inst().GetWaBaoCollectionListInfoItem(info.type, info.index)
    //         has_empty = info.is_open && (undefined == item || 0 == item.itemData.itemId)
    //         if(has_empty){
    //             break
    //         }
    //     }
    //     FishCtrl.Inst().SendWaBaoReqPutCollection();
    //     if(has_empty){
    //         ViewManager.Inst().CloseView(FishGetView);

    //         let itemData = FishData.Inst().ResultData.WaBaoItemInfo.itemData
    //         if(itemData.attrType1 > 0){
    //             PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType1]} +${AttrHelper.Percent(itemData.attrType1, itemData.attrValue1)}`, 1)
    //         }
    //         if(itemData.attrType2 > 0){
    //             PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType2]} +${AttrHelper.Percent(itemData.attrType2, itemData.attrValue2)}`, 1)
    //         } 
    //     }
    // }

    OnClickSell() {
        FishCtrl.Inst().SendWaBaoReqSell();
        ViewManager.Inst().CloseView(FishGetView);
    }

    OnClickShowItem(item: FishGetViewShowItem) {
        let data = item.GetData();
        if (!data.is_open) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Fish.FishBox.NextTips, data.level))
        }
    }
}

class FishGetViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType]);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue));
    }
}

class FishGetViewShowAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType])
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue))
    }
}

class FishGetViewShowItem extends BaseItem {
    private StateController: fgui.Controller;

    protected viewNode = {
        NameShow: <fgui.GRichTextField>null,
        AttrList: <fgui.GList>null,
        BtnBox: <fgui.GButton>null,
        QuaIcon: <fgui.GLoader>null,
        ItemIcon: <fgui.GLoader>null,
        EmptyShow: <fgui.GImage>null,
        GpOpen: <fgui.GGroup>null,
        GpClose: <fgui.GGroup>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnBox.onClick(this.OnClickBox, this);
        this.StateController = this.getController("StateShow");
    }

    public SetData(data: any) {
        super.SetData(data);
        this.StateController.selectedIndex = data.is_open ? 0 : 1
        this.viewNode.BtnBox.visible = data.is_open
        if (!data.is_open) {
            return
        }

        let item = FishData.Inst().GetWaBaoCollectionListInfoItem(data.type, data.index)
        let is_empty = undefined == item || 0 == item.itemData.itemId
        this.viewNode.QuaIcon.visible = !is_empty
        this.viewNode.ItemIcon.visible = !is_empty
        this.viewNode.EmptyShow.visible = is_empty

        if (!is_empty) {
            let itemData = item.itemData
            let item_info = Item.Create(itemData)
            UH.SetText(this.viewNode.NameShow, item_info.QuaNameOL())
            UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${Item.GetColor(itemData.itemId)}`)
            UH.SetIcon(this.viewNode.ItemIcon, Item.GetIconId(itemData.itemId), ICON_TYPE.KaoGu);

            let attrs = []
            if (itemData.attrType1 > 0) {
                attrs.push({ attrType: itemData.attrType1, attrValue: itemData.attrValue1 })
            }
            if (itemData.attrType2 > 0) {
                attrs.push({ attrType: itemData.attrType2, attrValue: itemData.attrValue2 })
            }
            this.viewNode.AttrList.SetData(attrs)
        } else {
            this.viewNode.NameShow.visible = false
            this.viewNode.AttrList.visible = false
        }
    }

    public OnClickSell() {
        let item = FishData.Inst().GetWaBaoCollectionListInfoItem(this._data.type, this._data.index)
        let itemData = item.itemData
        FishData.Inst().WaBaoSellEffect(itemData.itemId);
        FishCtrl.Inst().SendWaBaoReqCollectionSell(this._data.type, this._data.index)
        if (itemData.attrType1 > 0) {
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType1]} -${AttrHelper.Percent(itemData.attrType1, itemData.attrValue1)}`, -1)
        }
        if (itemData.attrType2 > 0) {
            PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[itemData.attrType2]} -${AttrHelper.Percent(itemData.attrType2, itemData.attrValue2)}`, -1)
        }
    }

    public OnClickBox() {
        let item = FishData.Inst().GetWaBaoCollectionListInfoItem(this._data.type, this._data.index)
        let is_empty = undefined == item || 0 == item.itemData.itemId
        FishData.Inst().SetWabaoGetAnim(!is_empty ? item.itemData : undefined, this.viewNode.ItemIcon.localToGlobal(), () => {
            FishCtrl.Inst().SendWaBaoReqPutCollection(this._data.type, this._data.index);
        }, () => {
            this.viewNode.QuaIcon.visible = false
            this.viewNode.ItemIcon.visible = false
        })
    }
}
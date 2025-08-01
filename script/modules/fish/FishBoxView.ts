import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { ICON_TYPE } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { HelpView } from "modules/common_help/CommonHelpView";
import { RedPoint } from "modules/extends/RedPoint";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishBoxUpView } from "./FishBoxUpView";
import { FishConfig } from "./FishConfig";
import { FishData } from "./FishData";

@BaseView.registView
export class FishBoxView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishBox",
        ViewName: "FishBoxView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        BtnReturn: <fgui.GButton>null,
        BtnUp: <fgui.GButton>null,
        BtnHelp: <fgui.GButton>null,

        ShowList: <fgui.GList>null,
        RedPointShow: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "ItemAttr", ExtendsClass: FishBoxViewAttrItem },
        { ResName: "ItemList", ExtendsClass: FishBoxViewListItem },
        { ResName: "ItemShow", ExtendsClass: FishBoxViewShowItem },
        { ResName: "ItemTop", ExtendsClass: FishBoxViewTopItem },
        { ResName: "ItemType", ExtendsClass: FishBoxViewTypeItem },
    ];

    InitData() {
        this.viewNode.BtnReturn.onClick(this.OnClickReturn, this);
        this.viewNode.BtnUp.onClick(this.OnClickUp, this);
        this.viewNode.BtnHelp.onClick(this.OnClickHelp, this);

        this.viewNode.ShowList.itemProvider = this.GetListItemResource.bind(this);

        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoInfo.bind(this), "WaBaoInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoInfo.bind(this), "WaBaoCollectionFlush");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoCollectionBookInfo.bind(this), "WaBaoCollectionBookInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushWaBaoCollectionBookInfo.bind(this), "WaBaoBookListInfo");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushWaBaoCollectionBookInfo.bind(this), "OtherChange");
        this.viewNode.BtnHelp.visible = FunOpen.Inst().GetFunIsOpen(Mod.Guild.Main).is_open

    }

    InitUI() {
        this.FlushWaBaoInfo()
        this.FlushWaBaoCollectionBookInfo()
    }

    FlushWaBaoInfo() {
        let co = FishData.Inst().CfgGatherInfo(FishData.Inst().GetWaBaoInfoCollectionLevel())
        let list: any[] = []
        list.push({ type: -1 })
        for (let i = 0; i < FishConfig.BOX_TYPE_MAX; i++) {
            let num = +GetCfgValue(co, `num_${i + 1}`)
            let co_next = FishData.Inst().CfgGatherInfoNext(i + 1, num + 1)
            this.CalcBoxItems(i, list, num, co_next ? co_next.level : 0)
        }
        this.showList = list
        this.viewNode.ShowList.SetData(this.showList);
    }

    FlushWaBaoCollectionBookInfo() {
        this.viewNode.RedPointShow.SetNum(1 == FishData.Inst().GetWabaoBoxUpRedPoint() ? 1 : 0)
    }

    CalcBoxItems(type: number = 0, list: any[] = [], num: number, level: number) {
        list.push({ type: type })
        let box = []
        for (let i = 0; i < FishConfig.BOX_ITEMS_PER; i++) {
            box.push({ type: type, index: i, is_open: i < num, level: level });
        }
        list.push(box)
        let box2 = []
        for (let i = 3; i < FishConfig.BOX_ITEMS_MAX; i++) {
            box2.push({ type: type, index: i, is_open: i < num, level: level });
        }
        list.push(box2)
    }

    private showList: any[]

    private GetListItemResource(index: number) {
        let data = this.showList[index];
        if (undefined != data.type) {
            if (-1 == data.type) {
                return fgui.UIPackage.getItemURL("FishBox", "ItemTop");
            } else {
                return fgui.UIPackage.getItemURL("FishBox", "ItemType");
            }
        }
        else {
            return fgui.UIPackage.getItemURL("FishBox", "ItemList");
        }
    }

    OnClickReturn() {
        ViewManager.Inst().CloseView(FishBoxView);
    }

    OnClickUp() {
        ViewManager.Inst().OpenView(FishBoxUpView);
    }

    OnClickHelp() {
        ViewManager.Inst().OpenView(HelpView, 9);
    }
}

export class FishBoxViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.attrType])
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.attrType, data.attrValue))
    }
}

export class FishBoxViewTopItem extends BaseItem {
}

export class FishBoxViewTypeItem extends BaseItem {
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
    };
    public SetData(data: any) {
        UH.SetText(this.viewNode.NameShow, GetCfgValue(Language.Fish.BoxTypeShows, data.type))
    }
}

export class FishBoxViewListItem extends BaseItem {
    protected viewNode = {
        ShowList: <fgui.GList>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.ShowList.on(fgui.Event.CLICK_ITEM, this.OnClickShowItem, this);
    }

    public SetData(data: any) {
        this.viewNode.ShowList.SetData(data)
    }

    OnClickShowItem(item: FishBoxViewShowItem) {
        let data = item.GetData();
        if (!data.is_open) {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Fish.FishBox.NextTips, data.level))
        }
    }
}

export class FishBoxViewShowItem extends BaseItem {
    private StateController: fgui.Controller;

    protected viewNode = {
        NameShow: <fgui.GRichTextField>null,
        AttrList: <fgui.GList>null,
        QuaIcon: <fgui.GLoader>null,
        ItemIcon: <fgui.GLoader>null,
        EmptyShow: <fgui.GImage>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.StateController = this.getController("StateShow");
    }

    public SetData(data: any) {
        super.SetData(data);
        this.StateController.selectedIndex = data.is_open ? 0 : 1
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
}

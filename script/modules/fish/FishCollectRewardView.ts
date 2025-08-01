import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BagData } from "modules/bag/BagData";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCellFishCollect } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { FishCtrl } from "./FishCtrl";
import { FishData } from "./FishData";

@BaseView.registView
export class FishCollectRewardView extends BaseView {
    orbMapSel: number

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "FishCollectReward",
        ViewName: "FishCollectRewardView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard2>null,
        RewardList: <fgui.GList>null,
    };

    protected extendsCfg = [
        { ResName: "ItemCollectReward", ExtendsClass: FishCollectRewardViewCollectRewardItem },
        { ResName: "ItemCollectRewardUp", ExtendsClass: FishCollectRewardViewCollectRewardUpItem },
        { ResName: "ItemAttr", ExtendsClass: FishCollectRewardViewAttrItem }
    ];

    InitData(param_t: any = []) {
        this.orbMapSel = param_t.orb_map ?? 0


        this.viewNode.Board.SetData(new BoardData(FishCollectRewardView, GetCfgValue(Language.Fish.FishCollectReward.TitleShows, this.orbMapSel)));
        this.viewNode.RewardList.setVirtual();
        this.viewNode.RewardList.itemProvider = this.GetListItemResource.bind(this);

        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushIntegrityInfo.bind(this), "WaBaoIntegrityFlush");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushIntegrityInfo.bind(this), "WaBaoCollectionBookInfo");
        this.AddSmartDataCare(FishData.Inst().ResultData, this.FlushIntegrityInfo.bind(this), "WaBaoBookListInfo");
    }

    InitUI() {
        this.FlushIntegrityInfo()
    }

    private GetListItemResource(index: number) {
        return fgui.UIPackage.getItemURL("FishCollectReward", 0 == this.orbMapSel ? "ItemCollectRewardUp" : "ItemCollectReward");
    }

    FlushIntegrityInfo() {
        this.viewNode.RewardList.SetData(FishData.Inst().CfgPictureInfo(this.orbMapSel))
    }
}

export class FishCollectRewardViewCollectRewardItem extends BaseItem {
    private has_gray: boolean
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        AttrList: <fgui.GList>null,
        ItemList: <fgui.GList>null,
        BtnActive: <fgui.GButton>null,
        RedPointShow: <RedPoint>null,
        ObjActive: <fgui.GTextField>null,
    };

    protected onConstruct() {
        super.onConstruct();

        this.viewNode.BtnActive.onClick(this.OnClickActive, this);
    }

    public SetData(data: any) {
        super.SetData(data)
        UH.SetText(this.viewNode.NameShow, data.handbook_name)
        let list = []
        let attrs = []
        let strs = data.handbook_treasure.toString().split("|")
        let is_active = FishData.Inst().GetWaBaoCollectionBookActived(data.orb_map, data.handbook_type);
        this.has_gray = false;
        for (let i = 0; i < strs.length; i++) {
            let itemId = + strs[i]
            let is_gray = data.orb_map > 0 ? (undefined == FishData.Inst().GetWaBaoIntegrityInfoItem(itemId)) : (0 == FishData.Inst().GetWaBaoCollectionBookInfoItem(data.handbook_type));
            this.has_gray = this.has_gray || is_gray
            list.push({ itemId: + strs[i], is_gray: is_gray, is_click: !is_gray })
        }
        for (let i = 0; i < data.jihuo_att.length; i++) {
            let attr = data.jihuo_att[i]
            attrs.push({ type: attr.type, add: attr.add, is_gray: !is_active })
        }
        this.viewNode.BtnActive.touchable = !is_active
        this.viewNode.BtnActive.visible = !is_active
        this.viewNode.ObjActive.visible = is_active;
        this.viewNode.BtnActive.title = !is_active ? Language.Fish.FishCollectReward.BtnActive : Language.Fish.FishCollectReward.BtnActived
        this.viewNode.ItemList.SetData(list)
        this.viewNode.AttrList.SetData(attrs)
        this.viewNode.RedPointShow.SetNum(!this.has_gray && !is_active ? 1 : 0)

    }

    OnClickActive() {
        if (!this.has_gray) {
            PublicPopupCtrl.Inst().Center(Language.Fish.FishCollectReward.ActiveSucc)
            let attr_list = this._data.jihuo_att
            for (let attr of attr_list) {
                PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr.type]} +${AttrHelper.Percent(attr.type, attr.add)}`, 1)
            }
        }
        FishCtrl.Inst().SendWaBaoReqActivateBook(this._data.orb_map, this._data.handbook_type)
    }

}

export class FishCollectRewardViewCollectRewardUpItem extends BaseItem {
    private is_enough = false;

    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        AttrList: <fgui.GList>null,
        CellShow: <ItemCellFishCollect>null,

        CurLevel: <fgui.GTextField>null,
        NextLevel: <fgui.GTextField>null,
        CostNum: <fgui.GRichTextField>null,
        BtnUp: <fgui.GRichTextField>null,

        GpUp: <fgui.GGroup>null,
        GpMax: <fgui.GGroup>null,

        RedPointShow: <RedPoint>null,
    };

    protected onConstruct() {
        super.onConstruct();
        this.viewNode.BtnUp.onClick(this.OnClickUp, this);
    }

    public SetData(data: any) {
        super.SetData(data);
        let list = []
        let attrs1 = new Map()
        let attrs2 = []
        let strs = data.handbook_treasure.toString().split("|")
        let has_gray = false
        let cur_level = FishData.Inst().GetWaBaoCollectionBookInfoItem(data.handbook_type)
        let co_ch = FishData.Inst().CfgCollectibleHandbookInfo(data.handbook_type, cur_level > 0 ? cur_level : 1)
        let have_num = BagData.Inst().getItemNum(co_ch.up_item_id);
        this.is_enough = have_num >= co_ch.up_item_num
        let is_max = 0 == co_ch.up_item_id
        this.viewNode.GpUp.visible = !is_max
        this.viewNode.GpMax.visible = is_max
        for (let i = 0; i < strs.length; i++) {
            let itemId = + strs[i]
            let is_gray = 0 == cur_level
            has_gray = has_gray || is_gray
            list.push({ itemId: + strs[i], is_gray: is_gray, is_click: !is_gray })
        }
        for (let i = 0; i < data.jihuo_att.length; i++) {
            let attr = data.jihuo_att[i]
            attrs1.set(attr.type, { type: attr.type, add: attr.add, is_gray: has_gray })
        }
        for (let i = 0; i < co_ch.up_att.length; i++) {
            let attr = co_ch.up_att[i]
            if (attrs1.has(attr.type)) {
                attrs1.get(attr.type).add = attrs1.get(attr.type).add + attr.add
            } else {
                attrs1.set(attr.type, { type: attr.type, add: attr.add, is_gray: has_gray })
            }
        }
        for (let [key, value] of attrs1) {
            attrs2.push(value);
        }
        UH.SetText(this.viewNode.NameShow, data.handbook_name)
        this.viewNode.CellShow.SetData(list[0])
        this.viewNode.AttrList.SetData(attrs2)

        UH.SetText(this.viewNode.CurLevel, TextHelper.Format(Language.Fish.FishCollectReward.CurLevel, cur_level));
        UH.SetText(this.viewNode.NextLevel, cur_level + 1);
        UH.SetText(this.viewNode.CostNum, TextHelper.Format(this.is_enough ? Language.Fish.FishCollectReward.CostNumEnough : Language.Fish.FishCollectReward.CostNumNotEnough, have_num, co_ch.up_item_num));

        this.viewNode.GpUp.visible = !is_max;
        this.viewNode.GpMax.visible = is_max;
        this.viewNode.BtnUp.grayed = !this.is_enough;

        this.viewNode.RedPointShow.SetNum(this.is_enough && !is_max ? 1 : 0)
    }

    OnClickUp() {
        if (this.is_enough) {
            PublicPopupCtrl.Inst().Center(Language.Fish.FishCollectReward.UpSucc);
            let cur_level = FishData.Inst().GetWaBaoCollectionBookInfoItem(this._data.handbook_type)
            let co_ch = FishData.Inst().CfgCollectibleHandbookInfo(this._data.handbook_type, cur_level > 0 ? cur_level : 1)
            let is_max = 0 == co_ch.up_item_id
            if (!is_max) {
                if (0 == cur_level) {
                    let attr_list = this._data.jihuo_att
                    for (let attr of attr_list) {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr.type]} +${AttrHelper.Percent(attr.type, attr.add)}`, 1)
                    }
                } else {
                    let co_ch_n = FishData.Inst().CfgCollectibleHandbookInfo(this._data.handbook_type, cur_level + 1)
                    let attr_list = []
                    let attrs1 = new Map()
                    for (let element of co_ch_n.up_att) {
                        attrs1.set(element.type, { type: element.type, add: element.add })
                    }
                    for (let element of co_ch.up_att) {
                        if (attrs1.has(element.type)) {
                            attrs1.get(element.type).add = attrs1.get(element.type).add - element.add
                        }
                    }
                    for (let [key, value] of attrs1) {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[value.type]} +${AttrHelper.Percent(value.type, value.add)}`, 1)
                    }
                }
            }
        }
        FishCtrl.Inst().SendWaBaoReqCollectionBookLevelUp(this._data.handbook_type);
    }
}

export class FishCollectRewardViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrShow: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        this.viewNode.AttrShow.grayed = data.is_gray
        UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Fish.FishCollectReward.AttrShow, AttrListName[data.type], AttrHelper.Percent(data.type, data.add)))
    }
}



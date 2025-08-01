import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BagCtrl, KNAPSACK_REQ_TYPE } from "modules/bag/BagCtrl";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { AttrListName } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { RedPoint } from "modules/extends/RedPoint";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { RoleConfig } from "./RoleConfig";
import { RoleData } from "./RoleData";


@BaseView.registView
export class RoleTitleView extends BaseView {

    private titleSelIndex: number

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "RoleTitle",
        ViewName: "RoleTitleView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected extendsCfg = [
        { ResName: "ItemShow", ExtendsClass: RoleTitleViewShowItem },
        { ResName: "ItemTitle", ExtendsClass: RoleTitleViewTitleItem },
        { ResName: "ItemAttr", ExtendsClass: RoleTitleViewAttrItem },
    ];

    protected viewNode = {
        Board: <CommonBoard2>null,
        TitleShow: <RoleTitleViewTitleItem>null,
        TitleList: <fgui.GList>null,
        GetWayShow: <fgui.GTextField>null,
        EquipedShow: <fgui.GImage>null,
        BtnEquip: <fgui.GButton>null,
        AttrList: <fgui.GList>null,
        LineShow: <fgui.GImage>null,
        EmptyShow: <fgui.GTextField>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(RoleTitleView));
        this.viewNode.BtnEquip.onClick(this.OnClickEquip, this);

        this.viewNode.TitleList.setVirtual();
        this.viewNode.TitleList.on(fgui.Event.CLICK_ITEM, this.OnClickTitleItem, this);

        this.AddSmartDataCare(RoleData.Inst().ResultData, this.FlushRoleInfo.bind(this), "roleinfo");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushTitleList.bind(this), "TitleItemChange");
    }

    InitUI() {
        this.FlushRoleInfo()
        this.FlushTitleList()
    }

    FlushRoleInfo() {
        let title_id = RoleData.Inst().GetTitleId()
        let info = RoleData.Inst().GetRoleTitleInfo(title_id)
        this.viewNode.TitleShow.SetData(info)
        this.FlushTitleList()
    }

    FlushTitleList() {
        this.titleSelIndex = this.titleSelIndex ?? 0
        let title_list = RoleData.Inst().GetRoleTitleShowList()
        this.viewNode.TitleList.SetData(title_list)
        this.viewNode.TitleList.scrollToView(this.titleSelIndex)
        this.viewNode.TitleList.selectedIndex = this.titleSelIndex
        let index = this.viewNode.TitleList.itemIndexToChildIndex(this.titleSelIndex);
        let item = this.viewNode.TitleList.getChildAt(index)
        this.OnClickTitleItem(<RoleTitleViewShowItem>item)
    }

    FlushTitleInfo(data: any) {
        let is_using = RoleData.Inst().GetTitleId() == data.for_item_id
        let is_have = BagData.Inst().getItemNum(data.for_item_id) > 0
        UH.SetText(this.viewNode.GetWayShow, (!is_using && !is_have) ? data.desc : "")
        this.viewNode.EquipedShow.visible = is_using
        this.viewNode.BtnEquip.visible = !is_using && is_have
        let attr_list = Item.GetTitleAttr(data.for_item_id)
        this.viewNode.LineShow.visible = attr_list.length > 0
        this.viewNode.EmptyShow.visible = 0 == attr_list.length
        this.viewNode.AttrList.SetData(Item.GetTitleAttr(data.for_item_id))
    }

    private OnClickTitleItem(item: RoleTitleViewShowItem) {
        let data = item.GetData();
        this.titleSelIndex = this.viewNode.TitleList.selectedIndex
        this.FlushTitleInfo(data);
        RoleData.Inst().SetTitleRedInfo(data.for_item_id, 0);
        item.FlushRedPointShow();
    }

    private OnClickEquip() {
        let sel_index = this.viewNode.TitleList.selectedIndex
        let index = this.viewNode.TitleList.itemIndexToChildIndex(sel_index);
        let item = this.viewNode.TitleList.getChildAt(index) as RoleTitleViewTitleItem;
        let data = item.GetData();
        BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.USE, [data.for_item_id, 1, 0])
        // let title_wearing = RoleData.Inst().GetTitleId()
        // let attr_list = []
        // if (title_wearing > 0) {
        //     attr_list = Item.GetTitleAttr(title_wearing)
        //     for (let attr of attr_list) {
        //         PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr.type]} -${AttrHelper.Percent(attr.type, attr.add)}`, 0)
        //     }
        // }
        // attr_list = Item.GetTitleAttr(data.for_item_id)
        // for (let attr of attr_list) {
        //     PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr.type]} +${AttrHelper.Percent(attr.type, attr.add)}`, 1)
        // }
    }

}

class RoleTitleViewShowItem extends BaseItemGB {
    protected viewNode = {
        TitleItem: <RoleTitleViewTitleItem>null,
        Geted: <fgui.GImage>null,
        NotGet: <fgui.GImage>null,
        GpUsing: <fgui.GList>null,

        RedPointShow: <RedPoint>null,
    };

    public SetData(data: any) {
        super.SetData(data);

        let is_using = RoleData.Inst().GetTitleId() == data.for_item_id
        let is_have = BagData.Inst().getItemNum(data.for_item_id) > 0
        this.viewNode.TitleItem.SetData(data)
        this.viewNode.GpUsing.visible = is_using
        this.viewNode.Geted.visible = !is_using && is_have
        this.viewNode.NotGet.visible = !is_using && !is_have

        this.FlushRedPointShow();
    }

    public FlushRedPointShow() {
        let tri = RoleData.Inst().TitleRedInfo;
        this.viewNode.RedPointShow.SetNum((tri.get(this._data.for_item_id) ?? 0) > 0 ? 1 : 0)
    }
}

class RoleTitleViewTitleItem extends BaseItemGB {
    protected viewNode = {
        BgSp: <fgui.GLoader>null,
        TitleShow: <fgui.GTextField>null,
        TitleEmpty: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SpriteName(this.viewNode.BgSp, "CommonAtlas", GetCfgValue(RoleConfig.TitleColor2BgSp1, data ? data.title_color : 0))
        UH.SetText(this.viewNode.TitleShow, data ? data.name : "")
        this.viewNode.TitleEmpty.visible = undefined == data
    }
}

export class RoleTitleViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,
    };

    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, AttrListName[data.type]);
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.type, data.add));
    }
}
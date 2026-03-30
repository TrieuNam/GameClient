
import { math, sys } from "cc";
import { CfgItemRetrieve } from "config/CfgItemRetrieve";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { ItemCell } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { Format } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { ItemRecyclingCtrl } from "./ItemRecyclingCtrl";
import { ItemRecyclingData } from "./ItemRecyclingData";
@BaseView.registView
export class ItemRecyclingBag extends BaseView {
    data = ItemRecyclingData.Inst()
    AddValue: fgui.GImage = undefined
    is_select_all = false
    protected viewRegcfg = {
        UIPackName: "ItemRecyclingBag",
        ViewName: "ItemRecyclingBag",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "ItemCellRecy", ExtendsClass: ItemCellRecyItem },
    ];
    protected viewNode = {
        Board: <CommonBoard3>null,
        BtnSelect: <fgui.GButton>null,
        BtnSend: <fgui.GButton>null,
        ExpBar: <fgui.GProgressBar>null,
        Level: <fgui.GTextField>null,
        ExpValue: <fgui.GRichTextField>null,
        List: <fgui.GList>null,
        NoneDesc: <fgui.GTextField>null,
    }
    InitData(param: any): void {
        this.viewNode.Board.SetData(new BoardData(ItemRecyclingBag, Language.ItemRecycling.Title2))
        this.viewNode.BtnSelect.onClick(this.OnClickSelect.bind(this))
        this.viewNode.BtnSend.onClick(this.OnClickSend.bind(this))
        this.AddValue = this.viewNode.ExpBar.getChild("bar2")
        this.viewNode.List.on(fgui.Event.CLICK_ITEM, this.onClickItem, this);
        this.viewNode.List.itemRenderer = this.renderListItem.bind(this);
        this.viewNode.List.setVirtual();
        this.viewNode.List.numItems = 8;
        this.AddSmartDataCare(this.data.FlushData, this.FlushLevelInfo.bind(this), "flush_bag")
    }
    OnClickSelect() {
        //ViewManager.Inst().CloseView(ItemRecyclingBag)
        if (this.is_select_all == true) {
            this.viewNode.List.clearSelection()
            this.is_select_all = false
        } else {
            this.viewNode.List.selectAll()
            this.is_select_all = true
        }
        this.FlushLevelInfo()
    }
    OnClickSend() {
        console.error(this.viewNode.List.getSelection());
        let res: number[] = []
        this.viewNode.List.getSelection().forEach(element => {
            res.push(this.data.bag_list[element].itemId)
        });
        if (res.length > 0) {
            ItemRecyclingCtrl.Inst().SendItemRecycleLevelUpReq(res)
            ViewManager.Inst().CloseView(ItemRecyclingBag)
        } else {
            PublicPopupCtrl.Inst().Center(Language.ItemRecycling.NoSelect)
        }
    }
    onClickItem(item: ItemCellRecyItem) {
        //console.error("点击", item);
        if (this.data.bag_list.length != 1) {
            this.is_select_all = false
        } else {
            this.is_select_all = item.selected
        }
        this.FlushLevelInfo()
    }
    renderListItem(index: number, obj: ItemCellRecyItem) {
        //console.error("渲染", index, obj);

    }
    InitUI(): void {

    }
    FlushLevelInfo() {
        this.viewNode.List.SetData(this.data.bag_list)
        this.viewNode.NoneDesc.visible = this.data.bag_list.length == 0
        let level = this.data.level
        let exp = this.data.exp as number
        let add_exp = 0
        let select_idxs = this.viewNode.List.getSelection()
        if (select_idxs.length > 0) {
            select_idxs.forEach(element => {
                let info = this.data.bag_list[element]
                let data = this.data.GetItemCfg(info.itemId)
                if (data) {
                    add_exp = add_exp + data.experience_retrieve * (info.num as number)
                }
            });
        }
        UH.SetText(this.viewNode.Level, Format(Language.Common.LevelShow, level))
        if (level == 0) {
            let cur_cfg = this.data.GetLevelCfg(level)
            this.viewNode.ExpBar.max = cur_cfg.up_exp
            this.viewNode.ExpBar.value = exp
            if (add_exp == 0) {
                UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue, exp, cur_cfg.up_exp))
                this.AddValue.fillAmount = 0
            } else {
                UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue2, exp, add_exp, cur_cfg.up_exp))
                let total: number = (+exp + +add_exp)
                this.AddValue.fillAmount = math.clamp01(total / cur_cfg.up_exp)
            }
        } else {
            let cfg = this.data.GetLevelCfg(level)
            if (cfg == null) {
                //最大级
                this.viewNode.ExpBar.max = 1
                this.viewNode.ExpBar.value = 1
                UH.SetText(this.viewNode.ExpValue, Language.ItemRecycling.MaxLevel)
                this.AddValue.fillAmount = 0
                return
            }
            if (cfg.up_exp == 0) {
                this.viewNode.ExpBar.max = 1
                this.viewNode.ExpBar.value = 1
                UH.SetText(this.viewNode.ExpValue, Language.ItemRecycling.MaxLevel)
            } else {
                this.viewNode.ExpBar.max = cfg.up_exp
                this.viewNode.ExpBar.value = exp
                if (add_exp == 0) {
                    UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue, exp, cfg.up_exp))
                    this.AddValue.fillAmount = 0
                } else {
                    UH.SetText(this.viewNode.ExpValue, Format(Language.ItemRecycling.ExpValue2, exp, add_exp, cfg.up_exp))
                    let total: number = (+exp + +add_exp)
                    this.AddValue.fillAmount = math.clamp01(total / cfg.up_exp)
                }
            }
        }
    }
    OpenCallBack(): void {
        //let data = CfgItemRetrieve.retrieve

        this.FlushLevelInfo()
    }

    CloseCallBack(): void {

    }

    WindowSizeChange() {

    }
}

class ItemCellRecyItem extends BaseItemGB {
    protected viewNode = {
        Name: <fgui.GTextField>null,
        Select: <fgui.GImage>null,
        Cell: <ItemCell>null,
        RbTxt: <fgui.GTextField>null,
    };
    protected _data: IPB_ItemData = null;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: IPB_ItemData) {
        this._data = data;
        let item = Item.Create({ item_id: data.itemId }, { is_click: false })
        UH.SetText(this.viewNode.Name, item.QuaName())
        this.viewNode.Cell.SetData(item)
        UH.SetText(this.viewNode.RbTxt, DataHelper.ConverMoney(data.num as number))
    }
    public GetData() {
        return this._data;
    }
}
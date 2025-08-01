import { ViewManager } from "manager/ViewManager";
import { Equip, EquipShiLian, Item } from "modules/bag/ItemData";
// import { BagCtrl, BagReqType } from "modules/bag/BagCtrl";
// import { Equip, Item, ItemData } from "modules/bag/ItemData";
import { ICON_TYPE, ITEM_BIG_TYPE } from "modules/common/CommonEnum";
import { KeyFunction } from "modules/common/CommonType";
import { EquipInfoView } from "modules/item_info/EquipInfoView";
import { EquipShiLianInfoView } from "modules/item_info/EquipShiLianInfoView";
// import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { Color } from "cc";
import { FishInfoView } from "modules/fish/FishInfoView";
import { FashionInfoView } from "modules/item_info/FashionInfoView";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { ItemCell } from "./ItemCell";

export let CellFlushs: KeyFunction = {};

CellFlushs.ReadyItem = function (cell: ItemCell): void {
    let data = cell.GetData();
    if (data == null) {
        return;
    }
    CellFlushs.SetIconQua(cell, data);
    CellFlushs.SetIcon(cell, data);
    CellFlushs.SetNum(cell, data);
    CellFlushs.MakeGrey(cell, data);
    CellFlushs.PlayEff(cell, data.eff != 0 ? data.eff : Item.GetSpecialEffects(data.item_id));
    CellFlushs.SetPiece(cell, data);
    CellFlushs.SetIconTxt(cell, data);
    CellFlushs.SetKuang(cell, data);
}

CellFlushs.SetIconQua = function (cell: ItemCell, data: any): void {
    // if (!data.is_gray) {
    UH.SpriteName(cell.view.QuaIcon, "CommonAtlas", `PinZhi${Item.GetQuality(data.item_id)}`);
    // }
    // else {
    //     UH.SpriteName(cell.view.QuaIcon, "CommonAtlas", `PinZhi1`);
    // }
}

CellFlushs.SetIcon = function (cell: ItemCell, data: any): void {
    let icon_id = data.IconId() ?? 0;
    icon_id = data.vo && data.vo.extra_data ? data.vo.extra_data.icon_id : icon_id;
    if (icon_id != 0) {
        UH.SetIcon(cell.view.Icon, icon_id, ICON_TYPE.ITEM);
    }
}

CellFlushs.SetNum = function (cell: ItemCell, data: any): void {
    if (cell == null || cell == undefined) {
        return;
    }
    if (cell.Config("is_num") == false) {
        return;
    }
    if (data.IsNum()) {
        let num = data.num;
        cell.view.RbImg.visible = num != 0
        cell.view.RbTxt.text = (num != 0) ? DataHelper.ConverMoney(num) : "";
    }
}

CellFlushs.MakeGrey = function (cell: ItemCell, data: any): void {
    // cell.view.QuaIcon.grayed = data.is_gray;
    cell.view.Icon.grayed = data.is_gray;
    cell.view.Icon.color = data.black_icon ? Color.BLACK : Color.WHITE;
    cell.view.MaskShow.visible = data.mask_icon
}

CellFlushs.PlayEff = function (cell: ItemCell, eff: number): void {
    if (cell.view.UIEffectShow) {
        if (eff != -1 && eff != 0) {
            cell.view.UIEffectShow.sortingOrder = eff < 0 ? 10 : 0
            cell.view.UIEffectShow.PlayEff(Math.abs(eff))
        } else {
            cell.view.UIEffectShow.StopAllEff();
        }
    }
}

CellFlushs.SetPiece = function (cell: ItemCell, data: any): void {
    cell.view.PieceShow.visible = ITEM_BIG_TYPE.DEBRIS == data.BigType()
}

CellFlushs.SetIconTxt = function (cell: ItemCell, data: any): void {
    cell.view.IconTxt.text = data.IconTxt();
}

CellFlushs.SetKuang = function (cell: ItemCell, data: any): void {
    let res = data.Kuang();
    if (res) {
        UH.SpriteName(cell.view.Kuang, "CommonAtlas", res);
        cell.view.Kuang.visible = true;
    } else {
        cell.view.Kuang.visible = false;
    }
}

CellFlushs.CheckInit = function (cell: ItemCell): void {
    if (!IsEmpty(cell.Config("bg_name"))) {
        UH.SpriteName(cell.view.BGImg, "CommonAtlas", cell.Config("bg_name"));
    }
    else {
        UH.SpriteName(cell.view.BGImg, "CommonAtlas", `WuPinKuangKong`);
    }
}

CellFlushs.CheckIocn = function (cell: ItemCell): void {
    if (!IsEmpty(cell.Config("bg_name"))) {
        UH.SpriteName(cell.view.BGImg, "CommonAtlas", cell.Config("bg_name"));
    }
    else {
        UH.SpriteName(cell.view.BGImg, "CommonAtlas", `WuPinKuangKong`);
    }
}


export let CellClicks: { [key: number]: Function } = {};

CellClicks[-1] = function (data: Item): void {
    let itemConfig = Item.GetConfig(data.ItemId());
    if ((itemConfig.item_type == 1 && itemConfig.show_type == 2) || (itemConfig.item_type == 11 && itemConfig.show_type == 1)) {
        ViewManager.Inst().OpenView(FashionInfoView, data);
    } else {
        ViewManager.Inst().OpenView(ItemInfoView, data);
    }
}

CellClicks[ITEM_BIG_TYPE.EQUIP] = function (data: Equip): void {
    if (data.Vo() instanceof PB_EquipData)
        ViewManager.Inst().OpenView(EquipInfoView, data);
}

CellClicks[ITEM_BIG_TYPE.EQUIP_ANGEL] = function (data: Equip): void {
    ViewManager.Inst().OpenView(EquipInfoView, data);
}


CellClicks[ITEM_BIG_TYPE.EQUIP_SHILIAN] = function (data: EquipShiLian): void {
    ViewManager.Inst().OpenView(EquipShiLianInfoView, data);
}

CellClicks[ITEM_BIG_TYPE.WA_BAO] = function (data: Item): void {
    ViewManager.Inst().OpenView(FishInfoView, data);
}


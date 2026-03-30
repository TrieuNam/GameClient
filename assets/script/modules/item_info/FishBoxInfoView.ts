
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { AttrItem } from "modules/common_item/AttrItem";
import { FishBoxView } from "modules/fish/FishBoxView";
import { FishData } from "modules/fish/FishData";
import { MainCapItem } from "modules/main/MainItems";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class FishBoxInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "FishBoxInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard4>null,
        BtnEnter: <fgui.GButton>null,
        LevelShow: <fgui.GLabel>null,
        AttCell: <AttrItem>null,
        CapShow: <MainCapItem>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(FishBoxInfoView));
        this.viewNode.BtnEnter.onClick(this.OnClickEnter, this);

        UH.SetText(this.viewNode.LevelShow, `Lv.${FishData.Inst().ResultData.WaBaoInfo.collectionLevel}`)

        let map: Map<number, number> = new Map()
        for (let value of FishData.Inst().ResultData.WaBaoCollectionListInfo.values()) {
            for (let value2 of value.values()) {
                let itemData = value2.itemData
                if (itemData.attrType1 > 0) {
                    if (map.has(itemData.attrType1)) {
                        map.set(itemData.attrType1, map.get(itemData.attrType1) + itemData.attrValue1)
                    } else {
                        map.set(itemData.attrType1, itemData.attrValue1)
                    }
                }
                if (itemData.attrType2 > 0) {
                    if (map.has(itemData.attrType2)) {
                        map.set(itemData.attrType2, map.get(itemData.attrType2) + itemData.attrValue2)
                    } else {
                        map.set(itemData.attrType2, itemData.attrValue2)
                    }
                }
            }
        }
        let attr_list = []
        for (let [key, value] of map) {
            attr_list.push({ type: key, add: value })
        }
        this.viewNode.AttCell.SetData(attr_list);
        this.viewNode.CapShow.SetData(AttrHelper.GetPower(attr_list, false))
    }

    OnClickEnter() {
        ViewManager.Inst().CloseView(FishBoxInfoView);
        ViewManager.Inst().OpenView(FishBoxView);
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(FishBoxInfoView);
    }
}
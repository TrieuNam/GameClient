
import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { CommonComboBox } from "modules/box/BoxTrustView";
import { BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { ItemColor } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCellBlock } from "modules/extends/ItemCell";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { DialogTipsTypes } from "modules/public_popup/PublicPopupData";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { BlockCtrl } from "./BlockCtrl";
import { BlockData } from "./BlockData";

@BaseView.registView
export class BlockComposeView extends BaseView {
    static IsComposed: boolean
    private selQua: number
    private selColor: number
    private timer_handle: any = null;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BlockCompose",
        ViewName: "BlockComposeView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard2>null,

        BtnClose: <fgui.GButton>null,
        BtnCompose: <fgui.GButton>null,

        BagList: <fgui.GList>null,

        CellShow0: <ItemCellBlock>null,
        CellShow1: <ItemCellBlock>null,
        CellShow2: <ItemCellBlock>null,
        CellShow3: <ItemCellBlock>null,

        CbQuality: <CommonComboBox>null,
        CbColor: <CommonComboBox>null,
        UIEffectShow: <UIEffectShow>null,
    };

    protected extendsCfg = [
        { ResName: "BagItem", ExtendsClass: BlockComposeViewBagItem },
        // { ResName: "AttrItem", ExtendsClass: BlockAchieveViewAttrItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(BlockComposeView));
        this.viewNode.Board.SetBtnCloseVisible(false)

        this.viewNode.BtnClose.onClick(this.OnClickClose, this);
        this.viewNode.BtnCompose.onClick(this.OnClickCompose, this);

        this.viewNode.CellShow1.onClick(this.OnClickCell.bind(this, 0));
        this.viewNode.CellShow2.onClick(this.OnClickCell.bind(this, 1));
        this.viewNode.CellShow3.onClick(this.OnClickCell.bind(this, 2));

        this.viewNode.BagList.setVirtual();

        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushBagList.bind(this), "FlushInfo");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushItem0.bind(this), "FlushInfoCompose");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushItem0Fail.bind(this), "FlushInfoComposeFail");

        let params_qua = BlockData.Inst().GetQualityParam()
        let params_color = BlockData.Inst().GetColorParam()
        this.viewNode.CbQuality.items = BlockData.Inst().GetQualityDesc();
        this.viewNode.CbQuality.items_rich = BlockData.Inst().GetQualityColor();
        this.viewNode.CbQuality.values = params_qua;
        this.viewNode.CbQuality.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);

        this.viewNode.CbColor.items = BlockData.Inst().GetColorDesc();
        this.viewNode.CbColor.items_rich = BlockData.Inst().GetColorColor();
        this.viewNode.CbColor.values = params_color;
        this.viewNode.CbColor.on(fgui.Event.STATUS_CHANGED, this.onChangedEnd, this);

        this.selQua = +params_qua[params_qua.length - 1]
        this.selColor = +params_color[params_color.length - 1]
        this.viewNode.CbQuality.value = `${this.selQua}`
        this.viewNode.CbColor.value = `${this.selColor}`

        BlockComposeView.IsComposed = false
    }

    InitUI() {
        this.FlushBagList();
    }

    CloseCallBack() {
        Timer.Inst().CancelTimer(this.timer_handle)
    }

    FlushShow() {
        let selection = this.viewNode.BagList.getSelection()
        for (let i = 1; i <= 3; i++) {
            let item = GetCfgValue(this.viewNode, "CellShow" + i)
            let is_show = undefined != selection[i - 1]
            item.visible = is_show
            if (is_show) {
                item.SetData(this.show_list[selection[i - 1]], { is_click: false })
            }
        }
        this.viewNode.CellShow0.visible = false
    }

    private show_list: any[]

    FlushBagList() {
        this.show_list = BlockData.Inst().GetBlockBagList(this.selQua, this.selColor)
        this.viewNode.BagList.SetData(this.show_list, this.show_list.length > 0 ? this.OnClickBagItem.bind(this) : undefined, -1)
    }

    FlushItem0() {
        Timer.Inst().CancelTimer(this.timer_handle)
        if (BlockComposeView.IsComposed) {
            BlockComposeView.IsComposed = false
            this.timer_handle = Timer.Inst().AddRunTimer(() => {
                this.viewNode.CellShow0.visible = true
                this.viewNode.CellShow0.SetData(BlockData.Inst().InfoBlockListLast, { is_click: false })
                this.FlushBagList()
            }, 1, 1, false)
        }
    }

    FlushItem0Fail() {
        Timer.Inst().CancelTimer(this.timer_handle)
        if (BlockComposeView.IsComposed) {
            BlockComposeView.IsComposed = false
            this.timer_handle = Timer.Inst().AddRunTimer(() => {
                PublicPopupCtrl.Inst().Center(Language.Block.BlockCompose.FailTips)
                this.FlushBagList()
            }, 1, 1, false)
        }
    }

    OnClickClose() {
        ViewManager.Inst().CloseView(BlockComposeView)
    }

    OnClickCompose() {
        let selection = this.viewNode.BagList.getSelection()
        if (selection.length < 3) {
            PublicPopupCtrl.Inst().Center(Language.Block.BlockCompose.SelNum)
            return
        }
        let data = this.show_list[selection[0]]
        let color = Item.GetColor(data.blockId)
        let co_block = BlockData.Inst().CfgBlockUpByColor(color)
        PublicPopupCtrl.Inst().DialogTips(TextHelper.Format(Language.Block.BlockCompose.ComposeTips, co_block.rate / 100), DialogTipsTypes.block_compose, () => {
            let indexs = []
            for (let index of selection) {
                let data = this.show_list[index]
                indexs.push(data.blockIndex)
            }
            BlockCtrl.Inst().SendShenQiReqCompose(indexs[0], indexs[1], indexs[2])
            BlockComposeView.IsComposed = true
            this.viewNode.BagList.clearSelection()
            this.FlushShow()
            this.viewNode.UIEffectShow.PlayEff(4169017)
        })
    }

    private OnClickCell(pos: number) {
        let selection = this.viewNode.BagList.getSelection()
        if (selection[pos]) {
            this.viewNode.BagList.removeSelection(selection[pos])
            this.FlushShow();
        }
    }

    private OnClickBagItem(item1: BlockComposeViewBagItem) {
        let data1 = item1.GetData();
        let selection = this.viewNode.BagList.getSelection()
        let item_index1 = this.viewNode.BagList.childIndexToItemIndex(this.viewNode.BagList.getChildIndex(item1))
        if (ItemColor.Pink == Item.GetColor(data1.blockId)) {
            PublicPopupCtrl.Inst().Center(Language.Block.BlockCompose.MaxMap)
            this.viewNode.BagList.removeSelection(item_index1)
            return
        }
        if (selection.length > 0) {
            if (data1.mapId > 0) {
                PublicPopupCtrl.Inst().Center(Language.Block.BlockCompose.SelMap)
                this.viewNode.BagList.removeSelection(item_index1)
                return
            }
        }
        if (selection.length > 0) {
            for (let element of selection) {
                let data2 = this.show_list[element]
                if (!BlockData.Inst().IsBlockSameQua(data1.blockId, data2.blockId)) {
                    PublicPopupCtrl.Inst().Center(Language.Block.BlockCompose.SelSame)
                    this.viewNode.BagList.removeSelection(item_index1)
                    return
                }
            }
        }
        if (selection.length > 3) {
            PublicPopupCtrl.Inst().Center(Language.Block.BlockCompose.SelNum)
            this.viewNode.BagList.removeSelection(item_index1)
            return
        }
        this.FlushShow();
    }

    onChangedEnd(target: fgui.GComponent) {
        this.viewNode.BagList.clearSelection()
        this.FlushShow()
        switch (target._name) {
            case "CbQuality":
                this.selQua = + this.viewNode.CbQuality.value;
                break;
            case "CbColor":
                this.selColor = + this.viewNode.CbColor.value;
                break;
        }
        this.FlushBagList()
    }
}

export class BlockComposeViewBagItem extends BaseItemGB {
    protected viewNode = {
        CellShow: <ItemCellBlock>null,
        GpInlay: <fgui.GGroup>null,
    };
    public SetData(data: IPB_SCBlockNode) {
        super.SetData(data)
        this.viewNode.CellShow.SetData(data, { is_click: false })
        this.viewNode.GpInlay.visible = data.mapId > 0
    }
}

// export class BlockAchieveViewAttrItem extends BaseItem {
//     protected viewNode = {
//         AttrShow: <fgui.GTextField>null,

//     };
//     public SetData(data: any) {
//         // this.viewNode.AttrShow.grayed = data.is_gray
//         // UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Fish.FishCollectReward.AttrShow, AttrListName[data.type], AttrHelper.Percent(data.type, data.add)))
//     }
// }

import { GetCfgValue } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { QualityColor, QualityColorOL } from "modules/common/ColorEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { BlockConfig } from "./BlockConfig";
import { BlockCtrl } from "./BlockCtrl";
import { BlockData } from "./BlockData";

@BaseView.registView
export class BlockModelView extends BaseView {
    guide_tag: string[] = []
    private bagSelIndex: number

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BlockModel",
        ViewName: "BlockModelView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard3>null,

        BtnChange: <fgui.GButton>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,

        StateSp: <fgui.GLoader>null,
        NameShow: <fgui.GRichTextField>null,
        QuaShow: <fgui.GTextField>null,

        BagList: <fgui.GList>null,
        AttrList: <fgui.GList>null,

        StateAttr: <fgui.GTextField>null,
    };

    protected extendsCfg = [
        { ResName: "BagItem", ExtendsClass: BlockModelViewBagItem },
        { ResName: "AttrItem", ExtendsClass: BlockModelViewAttrItem },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(BlockModelView));

        this.viewNode.BtnChange.onClick(this.OnClickChange, this);
        this.viewNode.BtnLeft.onClick(this.OnClickLeft, this);
        this.viewNode.BtnRight.onClick(this.OnClickRight, this);

        this.viewNode.BagList.setVirtual()
        this.viewNode.BagList.on(fgui.Event.CLICK_ITEM, this.OnClickBagItem, this);

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushBagList.bind(this), "BlockModelItemChange");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushBagList.bind(this), "FlushInfoInlay", "FlushInfoRemove");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushMapWear.bind(this), "FlushInfoMapWear");
        // this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushShow.bind(this), "FlushInfo");
        // this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushModel.bind(this), "FlushInfoInlay", "FlushInfoRemove", "FlushInfoAchieve");

        // this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockShopBtn", this.viewNode.BtnShop))
        // this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockFillBtn", this.viewNode.BtnFill))
        // this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockComposeBtn", this.viewNode.BtnCompose))
        this.bagSelIndex = -1
    }

    InitUI() {
        this.FlushBagList();
        this.FlushMapWear();
    }

    CloseCallBack() {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
    }

    FlushBagList() {
        let show_list = BlockData.Inst().GetModelBagList()
        if (this.bagSelIndex < 0) {
            for (let [key, val] of show_list.entries()) {
                if (val.item_id == BlockData.Inst().InfoMapId) {
                    this.bagSelIndex = key
                }
            }
        }
        this.viewNode.BagList.SetData(show_list)
        this.viewNode.BagList.scrollToView(this.bagSelIndex)
        this.viewNode.BagList.selectedIndex = this.bagSelIndex
        let index = this.viewNode.BagList.itemIndexToChildIndex(this.bagSelIndex);
        let item = this.viewNode.BagList.getChildAt(index)
        this.OnClickBagItem(<BlockModelViewBagItem>item)
    }

    FlushShow() {
        let sel_index = this.viewNode.BagList.selectedIndex
        let index = this.viewNode.BagList.itemIndexToChildIndex(sel_index);
        let bag_item = this.viewNode.BagList.getChildAt(index) as BlockModelViewBagItem;
        let data = bag_item.GetData();

        let co = Item.GetConfig(data.item_id)
        let item = Item.Create({ item_id: data.item_id }, { is_click: false })
        UH.SetText(this.viewNode.StateAttr, co.model[0] ? TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[co.model[0].type], AttrHelper.Percent(co.model[0].type, co.model[0].add)) :
            (co.model_after[0] ? TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[co.model_after[0].type], AttrHelper.Percent(co.model_after[0].type, co.model_after[0].add)) : Language.Block.BlockFill.Wu))
        UH.SetText(this.viewNode.NameShow, item.QuaNameOL());
        UH.SetText(this.viewNode.QuaShow, TextHelper.Format(Language.Block.BlockModel.QuaShow, GetCfgValue(Language.Common.ColorName, co.block_color_min)))

        this.viewNode.QuaShow.strokeColor = QualityColorOL[co.block_color_min];
        this.viewNode.QuaShow.color = QualityColor[co.block_color_min];

        let blocks = BlockData.Inst().GetBlocksByModelId(data.item_id)
        let nums: any[] = []
        let num: number = 0
        for (let element of blocks) {
            let colors = element.color.toString().split('').map(Number);
            while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                colors.unshift(0);
            }
            for (let color of colors) {
                nums[color] = (nums[color] ?? 0) + 1
                num++;
            }
        }
        let list = []
        let co_model = BlockData.Inst().CfgBlockModelByModelId(data.item_id)
        for (let element of co_model) {
            list.push({ type: element.block[0].type, add: element.block[0].add, num: 1, block_type: element.block_type })
        }
        UH.SpriteName(this.viewNode.StateSp, "BlockModel", co.model[0] ? "WeiMan" : "Man");
        this.viewNode.AttrList.SetData(list)
    }


    FlushMapWear() {
        let sel_index = this.viewNode.BagList.selectedIndex
        let index = this.viewNode.BagList.itemIndexToChildIndex(sel_index);
        let item = this.viewNode.BagList.getChildAt(index) as BlockModelViewBagItem;
        let data = item.GetData();

        let is_wear = BlockData.Inst().InfoMapId == data.item_id
        this.viewNode.BtnChange.title = is_wear ? Language.Block.BlockFill.BtnWearing : Language.Block.BlockFill.BtnWear
        this.viewNode.BtnChange.touchable = !is_wear
        this.viewNode.BtnChange.grayed = is_wear
    }


    OnClickChange() {
        let sel_index = this.viewNode.BagList.selectedIndex
        let index = this.viewNode.BagList.itemIndexToChildIndex(sel_index);
        let item = this.viewNode.BagList.getChildAt(index) as BlockModelViewBagItem;
        let data = item.GetData();
        BlockCtrl.Inst().SendShenQiReqMapWear(data.item_id)
    }

    OnClickLeft() {
        this.viewNode.BagList.scrollPane.scrollLeft()
    }

    OnClickRight() {
        this.viewNode.BagList.scrollPane.scrollRight()
    }

    private OnClickBagItem(item: BlockModelViewBagItem) {
        let data = item.GetData();
        this.bagSelIndex = this.viewNode.BagList.selectedIndex
        // BlockData.Inst().FlushData.ModelSel = data
        this.FlushShow();
        this.FlushMapWear();
    }
}

export class BlockModelViewBagItem extends BaseItemGB {
    protected viewNode = {
        NameShow: <fgui.GTextField>null,
        CellShow: <ItemCell>null,
    };
    public SetData(data: any) {
        super.SetData(data)
        let item = Item.Create(data, { is_click: false })
        UH.SetText(this.viewNode.NameShow, item.QuaNameOL())
        this.viewNode.CellShow.SetData(item)
    }
}

export class BlockModelViewAttrItem extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        AttrShow: <fgui.GTextField>null,

    };
    public SetData(data: any) {
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Block${data.block_type}`);
        UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[data.type], AttrHelper.Percent(data.type, data.add * data.num)))
    }
}
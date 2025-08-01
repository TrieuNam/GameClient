import { CfgBlockData } from "config/CfgBlock";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGP } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { AttrListName } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard4 } from "modules/common_board/CommonBoard4";
import { ItemCell } from "modules/extends/ItemCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { BlockConfig } from "./BlockConfig";
import { BlockData } from "./BlockData";
import { BlockView } from "./BlockView";

@BaseView.registView
export class BlockEnterView extends BaseView {
    guide_tag: string[] = []
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BlockEnter",
        ViewName: "BlockEnterView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board: <CommonBoard4>null,

        BtnEnter: <fgui.GButton>null,

        NameShow: <fgui.GRichTextField>null,
        CellShow: <ItemCell>null,

        AttrList: <fgui.GList>null,
        ProgressShow: <BlockEnterViewProgressNum>null,
    };

    protected extendsCfg = [
        { ResName: "AttrItem", ExtendsClass: BlockEnterViewAttrItem },
        { ResName: "ProgressNum", ExtendsClass: BlockEnterViewProgressNum },
    ];


    InitUI() {
        this.FlushInfo()
    }

    InitData(param_t: any) {
        this.viewNode.Board.SetData(new BoardData(BlockEnterView));
        this.viewNode.BtnEnter.onClick(this.OnClickEnter, this);

        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockEnterBtn", this.viewNode.BtnEnter))
    }

    CloseCallBack() {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
    }

    FlushInfo() {
        let map_id = BlockData.Inst().InfoMapId;
        let item = Item.Create({ item_id: map_id }, { is_click: false })

        this.viewNode.CellShow.SetData(item)
        UH.SetText(this.viewNode.NameShow, item.QuaNameOL());

        let blocks = BlockData.Inst().GetBlocksByModelId(map_id)
        let nums: any[] = []
        let num: number = 0
        for (let element of blocks) {
            let colors = element.color.toString().split('').map(Number);
            while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                colors.unshift(0);
            }
            for (let color of colors) {
                if (color > 0) {
                    nums[color] = (nums[color] ?? 0) + 1
                    num++;
                }
            }
        }
        let attrs = new Map()
        let co_model = BlockData.Inst().CfgBlockModelByModelId(map_id)
        for (let element of co_model) {
            if (nums[element.block_type] && nums[element.block_type] > 0) {
                attrs.set(element.block[0].type, element.block[0].add * nums[element.block_type])
            }
        }
        let co = Item.GetConfig(map_id)
        for (let element of co.model) {
            if (blocks.length > 0) {
                if (attrs.has(element.type)) {
                    attrs.set(element.type, attrs.get(element.type) + element.add * blocks.length)
                } else {
                    attrs.set(element.type, element.add * blocks.length)
                }
            }
        }
        if (BlockConfig.MODEL_POS_MAX == num) {
            for (let element of co.model_after) {
                if (attrs.has(element.type)) {
                    attrs.set(element.type, attrs.get(element.type) + element.add)
                } else {
                    attrs.set(element.type, element.add)
                }
            }
        }
        for (let element of CfgBlockData.model_level) {
            let active_info = BlockData.Inst().GetAchieveActive(element.seq, element.model_num)
            if (active_info.is_active) {
                for (let element2 of element.achieve) {
                    if (attrs.has(element2.type)) {
                        attrs.set(element2.type, attrs.get(element2.type) + element2.add)
                    } else {
                        attrs.set(element2.type, element2.add)
                    }
                }
            }
        }
        let attr_list = []
        for (let [key, value] of attrs) {
            attr_list.push({ type: key, add: value })
        }
        this.viewNode.AttrList.SetData(attr_list)

        this.viewNode.ProgressShow.value = num
        this.viewNode.ProgressShow.max = BlockConfig.MODEL_POS_MAX
        this.viewNode.ProgressShow.FlushShow()
    }


    OnClickEnter() {
        ViewManager.Inst().OpenView(BlockView)
    }
}


export class BlockEnterViewAttrItem extends BaseItem {
    protected viewNode = {
        AttrName: <fgui.GTextField>null,
        AttrVal: <fgui.GTextField>null,

    };
    public SetData(data: any) {
        UH.SetText(this.viewNode.AttrName, `${AttrListName[data.type]}：`)
        UH.SetText(this.viewNode.AttrVal, AttrHelper.Percent(data.type, data.add))
    }
}

export class BlockEnterViewProgressNum extends BaseItemGP {
    protected viewNode = {
        ProgressShow: <fgui.GTextField>null,

    };
    public FlushShow() {
        UH.SetText(this.viewNode.ProgressShow, `${this.value}/${this.max}`)
    }
}

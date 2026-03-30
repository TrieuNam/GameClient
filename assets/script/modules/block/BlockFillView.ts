
import { Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { CommonComboBox } from "modules/box/BoxTrustView";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, viewRegcfg } from "modules/common/BaseView";
import { AttrListName, Language } from "modules/common/Language";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCellBlock } from "modules/extends/ItemCell";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { BlockConfig } from "./BlockConfig";
import { BlockCtrl } from "./BlockCtrl";
import { BlockData } from "./BlockData";
import { BlockModelView } from "./BlockModelView";

@BaseView.registView
export class BlockFillView extends BaseView {
    guide_tag: string[] = []
    private selQua: number
    private selColor: number

    private effect_showing: boolean = false
    TwShow: fgui.GTweener = null;

    static dragItem: BlockFillViewDragItem
    static dragList: any
    static dragAdd: boolean
    static viewY: number

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "BlockFill",
        ViewName: "BlockFillView",
        LayerType: ViewLayer.Buttom,
    };
    protected viewNode = {
        // Board: <CommonBoard2>null,

        BtnReturn: <fgui.GButton>null,
        BtnEquip: <fgui.GButton>null,
        BtnOff: <fgui.GButton>null,
        BtnModel: <fgui.GButton>null,
        BtnLeft: <fgui.GButton>null,
        BtnRight: <fgui.GButton>null,

        BgSp: <EGLoader>null,
        BgSp2: <EGLoader>null,

        BagList: <fgui.GList>null,
        AttrList: <fgui.GList>null,

        NameShow: <fgui.GTextField>null,
        AttrShow: <fgui.GTextField>null,

        CbQuality: <CommonComboBox>null,
        CbColor: <CommonComboBox>null,

        DragItem: <BlockFillViewDragItem>null,
        ModelItem: <BlockFillViewModelItem>null,
    };

    protected extendsCfg = [
        { ResName: "BagItem", ExtendsClass: BlockFillViewBagItem },
        { ResName: "AttrItem", ExtendsClass: BlockFillViewAttrItem },

        { ResName: "DragItem", ExtendsClass: BlockFillViewDragItem },
        { ResName: "ModelItem", ExtendsClass: BlockFillViewModelItem },
        { ResName: "BlockItem", ExtendsClass: BlockFillViewBlockShow },
    ];

    DoOpenWaitHandle() {
        let self = this;
        let waitHandle = self.createWaitHandle("loadBG")
        self.AddWaitHandle(waitHandle);
        self.viewNode.BgSp.SetIcon(`loader/block/BeiJing2`, () => {
            self.viewNode.BgSp2.SetIcon(`loader/block/BeiJing3`, () => {
                waitHandle.complete = true;
            })
        })
    }

    InitData() {
        // this.viewNode.Board.SetData(new BoardData(BlockFillView));

        this.viewNode.BtnReturn.onClick(this.OnClickReturn, this);
        this.viewNode.BtnEquip.onClick(this.OnClickEquip, this);
        this.viewNode.BtnOff.onClick(this.OnClickOff, this);
        this.viewNode.BtnModel.onClick(this.OnClickModel, this);
        this.viewNode.BtnLeft.onClick(this.OnClickLeft, this);
        this.viewNode.BtnRight.onClick(this.OnClickRight, this);

        this.viewNode.DragItem.on(fgui.Event.DRAG_END, this.onDragEnd, this);
        this.viewNode.DragItem.draggable = true
        BlockFillView.dragItem = this.viewNode.DragItem
        BlockFillView.dragList = this.viewNode.BagList
        BlockFillView.viewY = this.view.y

        this.viewNode.BagList.setVirtual()

        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushBagList.bind(this), "FlushInfo");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushShow.bind(this), "FlushInfoInlay", "FlushInfoRemove", "FlushInfoMapWear");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushModel.bind(this), "FlushInfoInlay", "FlushInfoRemove", "FillRemoveIndexFlush", "FlushInfoMapWear");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushBagList.bind(this), "FlushInfoInlay", "FlushInfoRemove");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushEffectShow.bind(this), "FlushInfoInlay", "FlushInfoMapWear", "FlushInfoRemove");

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

        BlockData.Inst().FillRemoveIndex = -1

        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockFillEquipBtn", this.viewNode.BtnEquip))
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockFillModelBtn", this.viewNode.BtnModel))
    }

    InitUI() {
        this.FlushShow();
        this.FlushBagList();
        this.FlushMapWear();
        this.FlushModel();
        this.FlushEffectShow();
    }

    CloseCallBack(): void {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []
        if (this.TwShow) {
            this.TwShow.kill();
            this.TwShow = null
        }
    }

    FlushShow() {
        let infoMapId = BlockData.Inst().InfoMapId
        let blocks = BlockData.Inst().GetBlocksByModelId(infoMapId)
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
        let list = []
        let co = Item.GetConfig(infoMapId)
        let co_model = BlockData.Inst().CfgBlockModelByModelId(infoMapId)
        UH.SetText(this.viewNode.NameShow, co.name)
        for (let element of co_model) {
            list.push({ type: element.block[0].type, add: element.block[0].add, num: nums[element.block_type] ?? 0, block_type: element.block_type })
        }
        this.viewNode.AttrList.SetData(list)

        if (co.model[0]) {
            if (blocks.length > 0) {
                UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[co.model[0].type], AttrHelper.Percent(co.model[0].type, co.model[0].add * blocks.length)))
            } else {
                UH.SetText(this.viewNode.AttrShow, Language.Block.BlockFill.Wu)
            }
        } else if (co.model_after[0] && num == BlockConfig.MODEL_POS_MAX) {
            UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[co.model_after[0].type], AttrHelper.Percent(co.model_after[0].type, co.model_after[0].add)))
        } else {
            UH.SetText(this.viewNode.AttrShow, Language.Block.BlockFill.Wu)
        }
    }

    FlushBagList() {
        let show_list = BlockData.Inst().GetBlockBagList(this.selQua, this.selColor)
        this.viewNode.BagList.SetData(show_list)
    }

    FlushMapWear() {
        let infoMapId = BlockData.Inst().InfoMapId
        let is_wear = true
        this.viewNode.BtnEquip.title = is_wear ? Language.Block.BlockFill.BtnWearing : Language.Block.BlockFill.BtnWear
        this.viewNode.BtnEquip.touchable = !is_wear
        this.viewNode.BtnEquip.grayed = is_wear
    }

    FlushEffectShow() {
        let infoMapId = BlockData.Inst().InfoMapId
        let blocks = BlockData.Inst().GetBlocksByModelId(infoMapId)
        let num: number = 0
        for (let element of blocks) {
            let colors = element.color.toString().split('').map(Number);
            while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                colors.unshift(0);
            }
            for (let color of colors) {
                if (color > 0) {
                    num++;
                }
            }
        }
        this.EffectShow(BlockConfig.MODEL_POS_MAX == num)
    }

    EffectShow(is_show: boolean) {
        if (!is_show) {
            this.effect_showing = false
            if (this.TwShow) {
                this.TwShow.kill();
                this.TwShow = null
            }
            for (let i = 0; i < BlockConfig.MODEL_POS_MAX; i++) {
                this.viewNode.ModelItem.EffectShow(i, false)
            }
        } else if (!this.effect_showing) {
            this.PlayEffect()
        }
    }

    PlayEffect() {
        let show: Function
        let cur_index: number
        switch (Math.floor(Math.random() * 3)) {
            case 0:
                for (let i = 0; i < BlockConfig.MODEL_POS_MAX; i++) {
                    this.viewNode.ModelItem.EffectShow(i, true)
                }
                this.TwShow = fgui.GTween.delayedCall(3).onComplete(() => {
                    this.PlayEffect()
                })
                break;
            case 1:
                cur_index = 0
                let path1 = BlockConfig.EffectPaths1[Math.floor(Math.random() * BlockConfig.EffectPaths1.length)]
                show = () => {
                    this.viewNode.ModelItem.EffectShow(path1[cur_index], true)
                    this.TwShow = fgui.GTween.delayedCall(0.3).onComplete((tweener: fgui.GTweener) => {
                        cur_index++;
                        if (cur_index >= path1.length) {
                            this.PlayEffect()
                        } else {
                            show();
                        }
                    })
                }
                show();
                break;
            case 2:
                cur_index = 0
                let path2 = BlockConfig.EffectPaths2[Math.floor(Math.random() * BlockConfig.EffectPaths2.length)]
                show = () => {
                    for (let element of path2[cur_index]) {
                        this.viewNode.ModelItem.EffectShow(element, true)
                    }
                    this.TwShow = fgui.GTween.delayedCall(0.3).onComplete((tweener: fgui.GTweener) => {
                        cur_index++;
                        if (cur_index >= path2.length) {
                            this.PlayEffect()
                        } else {
                            show();
                        }
                    })
                }
                show();
                break;
        }
    }

    private model_list: any[]

    FlushModel() {
        let infoMapId = BlockData.Inst().InfoMapId
        this.model_list = BlockData.Inst().GetBlockModelInfoShow(infoMapId)
        this.viewNode.ModelItem.SetData(this.model_list)
    }


    OnClickReturn() {
        ViewManager.Inst().CloseView(BlockFillView)
    }

    OnClickEquip() {
        let infoMapId = BlockData.Inst().InfoMapId
        BlockCtrl.Inst().SendShenQiReqMapWear(infoMapId)
    }

    OnClickOff() {
        let infoMapId = BlockData.Inst().InfoMapId
        let blocks = BlockData.Inst().GetBlocksByModelId(infoMapId)
        if (0 == blocks.length) {
            PublicPopupCtrl.Inst().Center(Language.Block.BlockFill.Block0Tips)
            return
        }
        for (let element of blocks) {
            BlockCtrl.Inst().SendShenQiReqRemove(infoMapId, element.blockIndex);
        }
    }

    OnClickModel() {
        ViewManager.Inst().OpenView(BlockModelView)
    }

    OnClickLeft() {
        this.viewNode.BagList.scrollPane.scrollLeft()
    }

    OnClickRight() {
        this.viewNode.BagList.scrollPane.scrollRight()
    }

    onChangedEnd(target: fgui.GComponent) {
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

    // 0   1   2   3   4   5
    // 6   7   8   9   10  11
    // 12  13  14  15  16  17
    // 18  19  20  21  22  23
    // 24  25  26  27  28  29
    // 30  31  32  33  34  35

    // 0 1 2
    // 3 4 5
    // 6 7 8

    onDragEnd() {
        this.viewNode.DragItem.visible = false

        let data = this.viewNode.DragItem.GetData()
        let infoMapId = BlockData.Inst().InfoMapId

        let disx = this.viewNode.DragItem.x - 116
        let disy = this.viewNode.DragItem.y - 123
        let posx = Math.round(disx / 101 + 1)
        let posy = Math.round(disy / 101 + 1)
        if (posx >= 1 && posx <= 6 && posy >= 1 && posy <= 6) {
            let colors = data.color.toString().split('').map(Number);
            while (colors.length < BlockConfig.BLOCK_POS_NUM) {
                colors.unshift(0);
            }
            let pos_s = posx - 1 + (posy - 1) * 6
            let succ = true
            for (let [index, color] of colors.entries()) {
                if (color > 0) {
                    let offset_x = (((index + 1) % 3 === 0) ? 3 : (index + 1) % 3) - 1;
                    let offset_y = Math.floor((index + 1) / 3) - ((index + 1) % 3 === 0 ? 1 : 0);
                    let pos = pos_s + offset_x + offset_y * 6
                    if (posx + offset_x > 6 || posy + offset_y > 6 || undefined == this.model_list[pos] || this.model_list[pos].color > 0) {
                        succ = false
                    }
                }
            }
            if (succ) {
                BlockData.Inst().FillRemoveIndex = -2
                if (!BlockFillView.dragAdd) {
                    BlockCtrl.Inst().SendShenQiReqRemove(infoMapId, data.blockIndex);
                }
                BlockCtrl.Inst().SendBlockReqInlay(infoMapId, data.blockIndex, posx, posy)
            } else {
                BlockData.Inst().FillRemoveIndex = -1
            }
        } else {
            if (!BlockFillView.dragAdd) {
                BlockData.Inst().FillRemoveIndex = -2
                BlockCtrl.Inst().SendShenQiReqRemove(infoMapId, data.blockIndex);
            } else {
                BlockData.Inst().FillRemoveIndex = -1
            }
        }
    }
}

export class BlockFillViewBagItem extends BaseItem {
    protected viewNode = {
        CellShow: <ItemCellBlock>null,
        GpInlay: <fgui.GGroup>null,
    };

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.CellShow.draggable = true
        this.viewNode.CellShow.on(fgui.Event.DRAG_START, this.OnDragBlock, this)
    }

    public SetData(data: IPB_SCBlockNode) {
        super.SetData(data)
        this.viewNode.CellShow.SetData(data, { is_click: false })
        this.viewNode.GpInlay.visible = data.mapId > 0
    }


    private OnDragBlock(evt: fgui.Event) {
        var item: fgui.GObject = fgui.GObject.cast(evt.currentTarget);
        item.stopDrag();
        BlockFillView.dragList.stopDrag();

        BlockFillView.dragAdd = true
        BlockFillView.dragItem.SetData(this._data);
        const dragPos = item.localToGlobal(new Vec2(0, 0).x, new Vec2(0, 0).y);
        BlockFillView.dragItem.setPosition(dragPos.x, dragPos.y - 2 * BlockFillView.viewY);
        BlockFillView.dragItem.visible = true
        BlockFillView.dragItem.startDrag(evt.touchId);
    }
}

export class BlockFillViewAttrItem extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        AttrShow: <fgui.GTextField>null,

    };
    public SetData(data: any) {
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Block${data.block_type}`);
        UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[data.type], AttrHelper.Percent(data.type, data.add * data.num)))
    }
}

export class BlockFillViewDragItem extends BaseItem {
    protected viewNode = {
        BlockList: <fgui.GList>null,
    };

    public SetData(data: IPB_SCBlockNode) {
        super.SetData(data)
        let colors = data.color.toString().split('').map(Number);
        while (colors.length < BlockConfig.BLOCK_POS_NUM) {
            colors.unshift(0);
        }
        let colors_drag = colors.map((num: number, index: number) => {
            return {
                color: num,
                block: data
            }
        });
        this.viewNode.BlockList.SetData(colors_drag)
    }
}

export class BlockFillViewModelItem extends BaseItem {
    protected viewNode = {
        BlockList: <fgui.GList>null,
    };

    public SetData(data: any) {
        super.SetData(data)
        this.viewNode.BlockList.SetData(data)
    }

    public EffectShow(index: number, is_show: boolean) {
        let item = <BlockFillViewBlockShow>this.viewNode.BlockList.getChildAt(index)
        if (item) {
            item.EffectShow(is_show)
        }
    }
}

export class BlockFillViewBlockShow extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        UIEffectShow: <UIEffectShow>null,
    };

    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

        this.viewNode.icon.draggable = true
        this.viewNode.icon.on(fgui.Event.DRAG_START, this.OnDragBlock, this)
    }

    public SetData(data: { color: number, block?: IPB_SCBlockNode }) {
        super.SetData(data)
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Block${data.color}`);
    }

    private OnDragBlock(evt: fgui.Event) {
        var item: fgui.GObject = fgui.GObject.cast(evt.currentTarget);
        item.stopDrag();
        BlockFillView.dragList.stopDrag();

        if (this._data.color > 0) {
            BlockFillView.dragAdd = false
            BlockFillView.dragItem.SetData(this._data.block);
            const dragPos = item.localToGlobal(new Vec2(0, 0).x, new Vec2(0, 0).y);
            BlockFillView.dragItem.setPosition(dragPos.x, dragPos.y - 2 * BlockFillView.viewY);
            BlockFillView.dragItem.visible = true
            BlockFillView.dragItem.startDrag(evt.touchId);
            BlockData.Inst().FillRemoveIndex = this._data.block.blockIndex
        }
    }

    public EffectShow(is_show: boolean) {
        if (is_show) {
            this.viewNode.UIEffectShow.StopEff(4208002)
            this.viewNode.UIEffectShow.PlayEff(4208002)
        } else {
            this.viewNode.UIEffectShow.StopEff(4208002)
        }
    }

}
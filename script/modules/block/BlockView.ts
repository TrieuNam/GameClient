
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseItem, BaseItemGB } from "modules/common/BaseItem";
import { BaseView, ViewLayer, viewRegcfg } from "modules/common/BaseView";
import { AttrListName, Language } from "modules/common/Language";
import { EGLoader } from "modules/extends/EGLoader";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { GuideCtrl } from "modules/guide/GuideCtrl";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { BlockAchieveView } from "./BlockAchieveView";
import { BlockComposeView } from "./BlockComposeView";
import { BlockConfig } from "./BlockConfig";
import { BlockData } from "./BlockData";
import { BlockFillView } from "./BlockFillView";
import { BlockShopView } from "./BlockShopView";

@BaseView.registView
export class BlockView extends BaseView {
    guide_tag: string[] = []
    private bagSelIndex: number

    private effect_showing: boolean = false
    TwShow: fgui.GTweener = null;

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "Block",
        ViewName: "BlockView",
        LayerType: ViewLayer.Buttom,
    };
    protected viewNode = {
        // Board: <CommonBoard2>null,

        BtnReturn: <fgui.GButton>null,
        BtnCompose: <fgui.GButton>null,
        BtnShop: <fgui.GButton>null,
        BtnAchieve: <fgui.GButton>null,
        BtnFill: <fgui.GButton>null,

        BgSp: <EGLoader>null,
        // BgSp2: <EGLoader>null,

        // BagList: <fgui.GList>null,
        AttrList: <fgui.GList>null,

        AttrShow: <fgui.GTextField>null,
        ModelItem: <BlockViewViewModelItem>null,

        RedPointAchieve: <RedPoint>null,
    };

    protected extendsCfg = [
        { ResName: "BagItem", ExtendsClass: BlockViewBagItem },
        { ResName: "AttrItem", ExtendsClass: BlockViewAttrItem },
        { ResName: "ModelItem", ExtendsClass: BlockViewViewModelItem },
        { ResName: "BlockItem", ExtendsClass: BlockViewBlockShow },
    ];

    DoOpenWaitHandle() {
        let self = this;
        let waitHandle = self.createWaitHandle("loadBG")
        self.AddWaitHandle(waitHandle);
        self.viewNode.BgSp.SetIcon(`loader/block/BeiJing1`, () => {
            waitHandle.complete = true;
            // self.viewNode.BgSp2.SetIcon(`loader/block/BeiJing3`, () => {
            // })
        })
    }

    InitData() {
        // this.viewNode.Board.SetData(new BoardData(BlockView));

        this.viewNode.BtnReturn.onClick(this.OnClickReturn, this);
        this.viewNode.BtnCompose.onClick(this.OnClickCompose, this);
        this.viewNode.BtnShop.onClick(this.OnClickShop, this);
        this.viewNode.BtnAchieve.onClick(this.OnClickAchieve, this);
        this.viewNode.BtnFill.onClick(this.OnClickFill, this);

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushBagList.bind(this), "BlockModelItemChange");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushShow.bind(this), "FlushInfoInlay", "FlushInfoRemove", "FlushInfoMapWear");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushBagList.bind(this), "FlushInfoInlay", "FlushInfoRemove");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushModel.bind(this), "FlushInfoInlay", "FlushInfoRemove", "FlushInfoAchieve", "FlushInfoMapWear");
        this.AddSmartDataCare(BlockData.Inst().FlushData, this.FlushEffectShow.bind(this), "FlushInfoInlay", "FlushInfoMapWear", "FlushInfoRemove");

        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockShopBtn", this.viewNode.BtnShop))
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockFillBtn", this.viewNode.BtnFill))
        this.guide_tag.push(GuideCtrl.Inst().AddGuideUi("BlockComposeBtn", this.viewNode.BtnCompose))
    }

    InitUI() {
        this.FlushBagList();
        this.FlushShow();
        this.FlushModel();
        this.FlushEffectShow();
    }

    CloseCallBack() {
        this.guide_tag.forEach(element => {
            GuideCtrl.Inst().ClearGuideUi(element)
        });
        this.guide_tag = []

        if (this.TwShow) {
            this.TwShow.kill();
            this.TwShow = null
        }
    }

    FlushBagList() {
        // let show_list = BlockData.Inst().GetModelBagList()
        // this.viewNode.BagList.SetData(show_list, show_list.length > 0 ? this.OnClickBagItem.bind(this) : undefined, this.bagSelIndex)
    }

    FlushShow() {
        let infoMapId = BlockData.Inst().InfoMapId
        if (0 == infoMapId) {
            return
        }

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

    FlushModel() {
        let infoMapId = BlockData.Inst().InfoMapId
        if (0 == infoMapId) {
            return
        }

        let list = BlockData.Inst().GetBlockModelShow(infoMapId)
        this.viewNode.ModelItem.SetData(list)

        this.viewNode.RedPointAchieve.SetNum(BlockData.Inst().GetBlockAchieveRedPoint())
    }

    FlushEffectShow() {
        let infoMapId = BlockData.Inst().InfoMapId
        if (0 == infoMapId) {
            return
        }

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


    OnClickReturn() {
        ViewManager.Inst().CloseView(BlockView)
    }

    OnClickCompose() {
        ViewManager.Inst().OpenView(BlockComposeView)
    }

    OnClickShop() {
        ViewManager.Inst().OpenView(BlockShopView)
    }

    OnClickAchieve() {
        ViewManager.Inst().OpenView(BlockAchieveView)
    }

    OnClickFill() {
        let infoMapId = BlockData.Inst().InfoMapId
        if (0 == infoMapId) {
            PublicPopupCtrl.Inst().Center(Language.Block.BlockModel.EmptyTips)
            return
        }
        ViewManager.Inst().OpenView(BlockFillView)
    }

    private OnClickBagItem(item: BlockViewBagItem) {
        // let data = item.GetData();
        // this.bagSelIndex = this.viewNode.BagList.selectedIndex
        // BlockData.Inst().FlushData.ModelSel = data
        // this.FlushShow();
        // this.FlushModel();
    }
}

export class BlockViewBagItem extends BaseItemGB {
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

export class BlockViewAttrItem extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        AttrShow: <fgui.GTextField>null,

    };
    public SetData(data: any) {
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Block${data.block_type}`);
        UH.SetText(this.viewNode.AttrShow, TextHelper.Format(Language.Block.BlockFill.AttrShow, AttrListName[data.type], AttrHelper.Percent(data.type, data.add * data.num)))
    }
}

export class BlockViewViewModelItem extends BaseItem {
    protected viewNode = {
        BlockList: <fgui.GList>null,
    };

    public SetData(data: any) {
        super.SetData(data)
        this.viewNode.BlockList.SetData(data)
    }

    public EffectShow(index: number, is_show: boolean) {
        let item = <BlockViewBlockShow>this.viewNode.BlockList.getChildAt(index)
        if (item) {
            item.EffectShow(is_show)
        }
    }
}

export class BlockViewBlockShow extends BaseItem {
    protected viewNode = {
        icon: <fgui.GLoader>null,
        UIEffectShow: <UIEffectShow>null,
    };

    public SetData(data: number) {
        super.SetData(data)
        UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Block${data}`);
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
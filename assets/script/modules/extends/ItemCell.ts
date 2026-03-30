import { CfgItem } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Equip, EquipShiLian, Item, ItemCache } from "modules/bag/ItemData";
import { BoxData } from "modules/box/BoxData";
import { BaseItemGB, BaseItemGL } from "modules/common/BaseItem";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { EnChantData } from "modules/Enchant/EnchantData";
// import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { BlockConfig } from "modules/block/BlockConfig";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { IsEmpty } from "../../helpers/UtilHelper";
import { CellClicks, CellFlushs } from "./ItemCellFuncs";

export class ItemCell extends fgui.GComponent {
    private viewNode: { [key: string]: any } = {
        BGImg: <fgui.GLoader>null,
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        PieceShow: <fgui.GImage>null,
        RbImg: <fgui.GImage>null,
        RbTxt: <fgui.GTextField>null,
        UIEffectShow: <UIEffectShow>null,
        MaskShow: <fgui.GImage>null,
        IconTxt: <fgui.GTextField>null,
        Kuang: <fgui.GLoader>null,
    };
    private _data: any = null;
    private _config: any = null;
    public constructor() {
        super();
    }
    protected onConstruct(): void {
        this.onClick(this.OnClick, this);
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    //data == Item.New
    public SetData(data: any): void {
        if (!data) {
            this.ClearFlush();
            return
        }
        if (this._data) {
            if (data.vo.id != data.id) {
                this.ClearFlush();
            }
            if (this.view.UIEffectShow) {
                this.view.UIEffectShow.StopAllEff()
            }
        }
        this._data = data;
        CellFlushs.CheckInit(this);
        CellFlushs.ReadyItem(this);
    }
    //这里的view是Item的子节点
    public get view(): any {
        return this.viewNode;
    }
    //ClearFlush
    private ClearFlush() {
        this.view.Icon.icon = null;
        this.view.QuaIcon.icon = null;
        this.view.RbTxt.text = "";
        this.view.RbImg.visible = false
        this.view.PieceShow.visible = false
        this.view.MaskShow.visible = false
        this.view.IconTxt.text = "";
        this.view.Kuang.visible = false
        if (this.view.UIEffectShow) {
            this.view.UIEffectShow.StopAllEff()
        }
    }
    //OnClick外部点击
    private OnClick(): void {
        if (this._data == null) {
            return;
        }
        if (this.Config("is_click") == false) {
            return;
        }
        if (this._data.IsClick() == false) {
            return;
        }
        if (this._data.ItemId() != 0) {
            let big_type = this._data.BigType();
            if (CellClicks[big_type]) {
                CellClicks[big_type](this._data);
            } else {
                CellClicks[-1](this._data)
            }
        }
    }
    //onDestroy
    protected onDestroy(): void {
        if (this._data) {
            ItemCache.Destory(this._data);
            this._data = null;
        }
    }

    public IsNotHasNeedPopup(need_num?: number): boolean {
        if (this.GetData() != null) {
            if (Item.GetNum(this.GetData().ItemId()) < (need_num ?? 1)) {
                PublicPopupCtrl.Inst().Center(this.GetData().Name() + Language.Common.NotHasTip);
                PublicPopupCtrl.Inst().GetWay(this.GetData().ItemId());
                return true;
            }
        }
        return false;
    }

    public IsNotHasNeedTips(need_num?: number): boolean {
        if (this.GetData() != null) {
            if (Item.GetNum(this.GetData().ItemId()) < (need_num ?? 1)) {
                PublicPopupCtrl.Inst().Center(this.GetData().Name() + Language.Common.NotHasTip);
                return true;
            }
        }
        return false;
    }

    //Item.New
    public GetData(): any {
        return this._data;
    }

    //UI 自定义配置 JSON写法
    public Config(key?: string): any {
        if (this.data != undefined) {
            if (this._config == null) {
                this._config = JSON.parse(this.data);
            }
        }
        if (this._config && key != null) {
            return this._config[key]
        }
        return this._config;
    }
}

export class ItemCellEquip extends BaseItemGL {
    private equip_compare = -1
    private effect_show = true
    public viewNode = {
        ItemCell: <ItemCell>null,
        icon: <fgui.GImage>null,
        NotOpen: <fgui.GTextField>null,
        LevelShow: <fgui.GTextField>null,
        UIEffectShow: <UIEffectShow>null,
        Shuang: <fgui.GGroup>null,
        Dan: <fgui.GGroup>null,
        EnchantNum1: <fgui.GLoader>null,
        EnchantNum2: <fgui.GLoader>null,
        EnchantNum3: <fgui.GLoader>null,
        arrow2: <fgui.GImage>null,
        arrow1: <fgui.GImage>null,
    };
    protected onConstruct(): void {
        // this.onClick(this.OnClick, this);
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.viewNode.UIEffectShow.LoadEff(4164015)
    }

    protected onDisable(): void {
        super.onDisable()
        this.viewNode.UIEffectShow.StopEff(4164015)
    }

    public SetData(data: any, is?: any) {
        this._data = data
        let isEmpty = IsEmpty(data) || data.notOpen
        // let isLock = !isEmpty && 
        if (isEmpty) {
            this.viewNode.ItemCell.SetData(null);
            UH.SetText(this.viewNode.LevelShow, "")
            this.viewNode.NotOpen.visible = data ? data.notOpen : false
            UH.SetText(this.viewNode.NotOpen, data ? data.name : "")
            this.equip_compare = 0
            this.viewNode.Dan.visible = false
            this.viewNode.Shuang.visible = false
        } else {
            let item = <Equip>Item.Create(data, is);
            let equip_compare = item.ItemCompare();
            if (this.effect_show && this.equip_compare > -1 && equip_compare != this.equip_compare && BoxData.Inst().ShowEquipEff) {
                BoxData.Inst().ShowEquipEff = false
                this.viewNode.UIEffectShow.StopEff(4164015)
                this.viewNode.UIEffectShow.PlayEff(4164015)
            }
            this.equip_compare = equip_compare;
            this.viewNode.ItemCell.SetData(item);
            UH.SetText(this.viewNode.LevelShow, item.Level() > 0 ? `Lv.${item.Level()}` : "")
            this.viewNode.NotOpen.visible = data.notOpen ?? false
            let is_on_self = BagData.Inst().GetEquipIsSelf(data.equipType, data.itemId)
            if (!is_on_self) {
                this.viewNode.Dan.visible = false
                this.viewNode.Shuang.visible = false
            } else {
                this.FLushEnchantLevel(data.equipType)
            }
        }
        this.viewNode.icon.visible = isEmpty;
    }
    public EffectShow(visible: boolean) {
        this.effect_show = visible
    }

    public FLushEnchantLevel(equipType: number) {
        let data = EnChantData.Inst().GetEquipEnchantLevel(equipType) || {}
        if (data == undefined) {
            return
        }
        let level = data.level
        let time = data.endTime
        let ten = Math.floor(level / 10)
        let one = level % 10
        this.viewNode.Dan.visible = ten == 0 && time > TimeCtrl.Inst().ServerTime
        this.viewNode.Shuang.visible = ten != 0 && time > TimeCtrl.Inst().ServerTime
        UH.SpriteName(this.viewNode.EnchantNum1, "CommonAtlas", TextHelper.Format("Enchant{0}", ten));
        UH.SpriteName(this.viewNode.EnchantNum2, "CommonAtlas", TextHelper.Format("Enchant{0}", one));
        UH.SpriteName(this.viewNode.EnchantNum3, "CommonAtlas", TextHelper.Format("Enchant{0}", one));
        this.viewNode.arrow1.visible = time > TimeCtrl.Inst().ServerTime
        this.viewNode.arrow2.visible = time > TimeCtrl.Inst().ServerTime
        this.viewNode.EnchantNum3.visible = one != 0
    }
}

export class ItemCellAngel extends BaseItemGL {
    protected viewNode = {
        ItemCell: <ItemCell>null,
        LevelShow: <fgui.GTextField>null,
        icon: <fgui.GImage>null,
    };

    public SetData(data: CfgItem, is?: any) {
        let isEmpty = IsEmpty(data);
        if (isEmpty) {
            this.viewNode.ItemCell.visible = false;
            UH.SetText(this.viewNode.LevelShow, "")
        } else {
            this.viewNode.ItemCell.visible = true;
            let item = <Equip>Item.Create(data, is);
            this.viewNode.ItemCell.SetData(item);
            UH.SetText(this.viewNode.LevelShow, item.Level() > 0 ? `Lv.${item.Level()}` : "")
        }
    }
}

export class ItemCellShiLian extends BaseItemGB {
    protected viewNode = {
        CellShow: <ItemCell>null,
        LockShow: <fgui.GImage>null,
        LevelShow: <fgui.GTextField>null,
    };

    public SetData(data: CfgItem, is?: any) {
        super.SetData(data);
        if (data.itemId > 0) {
            let item = <EquipShiLian>Item.Create(data, is);
            UH.SetText(this.viewNode.LevelShow, (is && is.no_level) ? "" : `Lv.${item.Level()}`)
            this.viewNode.CellShow.SetData(item)
        } else {
            this.viewNode.CellShow.SetData(null)
            UH.SetText(this.viewNode.LevelShow, "")
        }
        this.viewNode.LockShow.visible = -1 == data.itemId
    }
}

export class ItemCellFishCollect extends BaseItemGB {
    protected viewNode = {
        CellShow: <ItemCell>null,
        NameShow: <fgui.GRichTextField>null,
    };

    public SetData(data: any, is?: any) {
        super.SetData(data);
        let item = Item.Create({ itemId: data.itemId }, { is_click: data.is_click ?? true, black_icon: data.is_gray, mask_icon: data.is_gray })
        this.viewNode.CellShow.SetData(item)
        UH.SetText(this.viewNode.NameShow, item.QuaNameOL(2, null, data.is_gray ? "???" : null))
    }
}

export class ItemCellFishEquip extends BaseItemGL {
    protected viewNode = {
        Icon: <fgui.GLoader>null,
        QuaIcon: <fgui.GLoader>null,
        LevelShow: <fgui.GTextField>null,
        effShow: <UIEffectShow>null,
    };
    protected onConstruct(): void {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        super.SetData(data)

        UH.SetIcon(this.viewNode.Icon, data.item_icon, ICON_TYPE.ITEM);
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${data.item_color}`)
        UH.SetText(this.viewNode.LevelShow, `Lv.${data.item_level}`)
    }

    public LevelShow(visible: boolean) {
        this.viewNode.LevelShow.visible = visible
    }
    public effShow(isShow: boolean, effId: number) {
        if (isShow) {
            //this.viewNode.effShow.visible = true;
            this.viewNode.effShow.PlayEff(effId);
        } else {
            this.viewNode.effShow.StopEff(effId, true);
            // this.viewNode.effShow.visible = false;
        }
    }
}

export class ItemCellBlock extends BaseItemGB {
    protected viewNode = {
        QuaIcon: <fgui.GLoader>null,
        BlockList: <fgui.GList>null,
    };

    public SetData(data: IPB_SCBlockNode, is?: any) {
        let item = Item.Create({ item_id: data.blockId }, is)
        UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", `PinZhi${item.Color()}`)
        let colors = data.color.toString().split('').map(Number);
        while (colors.length < BlockConfig.BLOCK_POS_NUM) {
            colors.unshift(0);
        }
        this.viewNode.BlockList.SetData(colors)
    }
}
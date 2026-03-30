import { HandleCollector } from "core/HandleCollector";
import { SMDHandle } from "data/HandleCollectorCfg";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { CommonId, CommonIdAdd, ICON_TYPE } from "modules/common/CommonEnum";
import { Mod } from "modules/common/ModuleDefine";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
// import { RoleData } from "modules/role/RoleData";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";


export class Currency extends fgui.GComponent {
    private viewNode = {
        icon: <fgui.GLoader>null,
        NumShow: <fgui.GTextField>null,
        BtnAdd: <fgui.GButton>null,
    };

    private currnecyType: number;
    private handleCollector: HandleCollector;

    public constructor() {
        super();
        this.handleCollector = HandleCollector.Create();
    }

    protected onConstruct(): void {
        let self = this;
        ViewManager.Inst().RegNodeIofo(this.viewNode, self);
        self.viewNode.BtnAdd.onClick(self.OnClickAdd, self)
        var handle = SMDHandle.Create(BagData.Inst().BagItemData, self.freshNumber.bind(self), "OtherChange")
        self.handleCollector.Add(handle);
    }

    private freshNumber() {
        let self = this;
        let num = BagData.Inst().getItemNum(self.currnecyType);
        let text = DataHelper.ConverMoney(+num);
        self.viewNode.NumShow.text = text;
    }

    private OnClickAdd() {
        if (CommonIdAdd[this.currnecyType]) {
            ViewManager.Inst().OpenView(ItemInfoView, Item.Create({ itemId: this.currnecyType }));
            return
        }
        switch (this.currnecyType) {
            case CommonId.Diamond:
                ViewManager.Inst().OpenViewByKey(Mod.Shop.DiamondShop)
                break;
            case CommonId.Gold:
                ViewManager.Inst().OpenViewByKey(Mod.Shop.GoldShop)
                break;
        }
    }

    public SetCurrencyId(item_id: number, icon_show: boolean = false) {
        let self = this;
        self.currnecyType = item_id;
        if (icon_show) {
            UH.SetIcon(this.viewNode.icon, Item.GetIconId(item_id), ICON_TYPE.ITEM);
        } else {
            UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Item${self.currnecyType}`);
        }
        this.viewNode.icon.setScale(icon_show ? 0.6 : 1, icon_show ? 0.6 : 1)
        self.freshNumber();
    }


    public BtnAddShow(visible: boolean, pos_num?: any) {
        this.viewNode.BtnAdd.visible = visible
        if (pos_num) {
            this.viewNode.NumShow.setPosition(pos_num.x, pos_num.y)
        }
    }

    protected onDestroy() {
        let self = this;
        HandleCollector.Destory(self.handleCollector);
        self.handleCollector = null;
    }

}

export class Currency2 extends fgui.GComponent {
    private viewNode = {
        icon: <fgui.GLoader>null,
        NumShow: <fgui.GTextField>null,
    };

    private currnecyType: number;

    protected onConstruct(): void {
        let self = this;
        ViewManager.Inst().RegNodeIofo(this.viewNode, self);
    }


    public SetCurrencyId(item_id: number, num: number, icon_show: boolean = false) {
        let self = this;
        self.currnecyType = item_id;
        if (icon_show) {
            UH.SetIcon(this.viewNode.icon, Item.GetIconId(item_id), ICON_TYPE.ITEM);
        } else {
            UH.SpriteName(this.viewNode.icon, "CommonAtlas", `Item${self.currnecyType}`);
        }
        UH.SetText(self.viewNode.NumShow, num);
    }

}
import { Button, Node } from "cc";
import { DEBUG } from "cc/env";
import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from "modules/common/Language";
import { ItemCell } from "modules/extends/ItemCell";
import { GetWayData } from "modules/getway/GetWayData";
import { GMCmdCtrl } from "modules/gm_command/GMCmdCtrl";
import { Timer } from "modules/time/Timer";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";



@BaseView.registView
export class ItemInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "ItemInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Name: <fgui.GLabel>null,
        ItemCall: <ItemCell>null,
        Level: <fgui.GRichTextField>null,
        Desc: <fgui.GLabel>null,
        lb_add: <fgui.GLabel>null,
        GetWayList: <fgui.GList>null,
        GetWay: <fgui.GGroup>null,
    };
    private item_id: number
    private Controller: fgui.Controller;
    private timer_handle: any = null;
    InitData(item: any) {
        this.item_id = item.item_id
        this.Controller = this.view.getController("Detail");

        this.ShowBaseInfo()
        this.ShowGetWay()
        this.viewNode.GetWayList.on(fgui.Event.CLICK_ITEM, this.OnClickGetWay, this);
    }

    CloseCallBack() {
        Timer.Inst().CancelTimer(this.timer_handle)
    }
    private ShowBaseInfo() {
        this.viewNode.ItemCall.SetData(Item.Create(
            { item_id: this.item_id }, { is_num: false, is_click: false }))


        let co = Item.GetConfig(this.item_id);
        UH.SetText(this.viewNode.Name, Item.GetName(this.item_id) + (DEBUG ? this.item_id : ""));

        let level = Item.GetLevel(this.item_id)
        this.viewNode.Level.visible = level != null
        if (level != null) {
            // UH.SetText(this.viewNode.Level, Language.GetWay.LevelShow+level );
            UH.SetText(this.viewNode.Level, TextHelper.RichTextOutLine(Language.GetWay.LevelShow + level, COLORSTR.Black, 2));
        }

        let desc = Item.GetDesc(this.item_id)
        this.viewNode.Desc.visible = desc != null
        if (desc != null) {
            UH.SetText(this.viewNode.Desc, desc);
        }
        if (DEBUG) {
            this.viewNode.lb_add.touchable = true
            this.viewNode.lb_add._touchDisabled = false
            this.viewNode.lb_add.visible = true;
            this.viewNode.lb_add.onClick(() => {
                GMCmdCtrl.Inst().SendGMCommand("additem", this.item_id + " 100");
            })
            // let node = new Node()
            // let btn = new Button()
            // this.view.node.addChild(btn.node)
            // btn.node.on(Node.EventType.TOUCH_START, () => {
            //     GMCmdCtrl.Inst().SendGMCommand("additem", this.item_id + " 100");
            // })
        }
    }

    private ShowGetWay() {
        let co = Item.GetConfig(this.item_id);
        // 没填或者没有
        if (co.get_way == null || co.get_way == "") {
            this.Controller.selectedIndex = 1
            return
        }

        let list = GetWayData.Inst().GetWayList(co.get_way)
        // 填了但是没有解析出来
        if (list.length == 0) {
            this.Controller.selectedIndex = 1
            return
        }

        this.viewNode.GetWayList.SetData(list)

        // 解决闪的问题
        Timer.Inst().CancelTimer(this.timer_handle)
        this.timer_handle = Timer.Inst().AddRunFrameTimer(() => {
            this.viewNode.GetWayList.visible = true
        }, 3, 1, false)
    }

    private OnClickGetWay(item: GetWayItem) {
        if (item.data.open_panel == null) {
            ViewManager.Inst().CloseView(ItemInfoView)
            return
        }

        ViewManager.Inst().OpenViewByKey(item.data.open_panel);
        if (ViewManager.Inst().IsOpen(ItemInfoView))
            ViewManager.Inst().CloseView(ItemInfoView)
    }
}

export class GetWayItem extends fgui.GButton {
    private viewNode = {
        title: <fgui.GLabel>null,
    };
    protected onConstruct(): void {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        this.data = data
        LogError(data.desc)
        UH.SetText(this.viewNode.title, data.desc);
    }
}

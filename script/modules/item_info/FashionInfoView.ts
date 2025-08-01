import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { AttrItem } from "modules/common_item/AttrItem";
import { ItemCell, ItemCellEquip } from "modules/extends/ItemCell";
import { GetWayData } from "modules/getway/GetWayData";
import { MainCapItem } from "modules/main/MainItems";
import { AttrHelper } from "../../helpers/AttrHelper";
import { UH } from "../../helpers/UIHelper";
import { DEBUG } from "cc/env";
import { TextHelper } from "../../helpers/TextHelper";
import { COLORSTR } from "modules/common/ColorEnum";
import { Timer } from "modules/time/Timer";
import { GetWayItem } from "./ItemInfoView";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { RoleData } from "modules/role/RoleData";
import { FashionData, FASHION_TYPE } from "modules/fashion/FashionData";
import { AngelData } from "modules/Angel/AngelData";
import { MountData } from "modules/mount/MountData";
import { PetClothData } from "modules/PetCloth/PetClothData";
import { GMCmdCtrl } from "modules/gm_command/GMCmdCtrl";

@BaseView.registView
export class FashionInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "ItemInfo",
        ViewName: "FashionInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Name: <fgui.GLabel>null,
        ItemCall: <ItemCell>null,
        Level: <fgui.GRichTextField>null,
        Desc: <fgui.GLabel>null,
        GetWayList: <fgui.GList>null,
        GetWay: <fgui.GGroup>null,
        CapShow: <MainCapItem>null,
        ModelShow: <UIModelShow>null,
        lb_add: <fgui.GLabel>null,
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
        if (PetClothData.Inst().GetPetSkillDataById(this.item_id)) {  //宠物幻化
            let info = PetClothData.Inst().GetPetSkillDataById(this.item_id);
            this.viewNode.ModelShow.setPath(ResPath.Npc(info.res_id));
            return;
        }

        this.viewNode.ModelShow.setPath(ResPath.ActorRole(10001), RoleData.Inst().GetAppearanceRes(true));
        if (AngelData.Inst().GetAngelResCfgItem(this.item_id)) {
            let info = AngelData.Inst().GetAngelResCfgItem(this.item_id)
            this.viewNode.ModelShow.setAngelSkin(info.angle_res_id);
            this.viewNode.CapShow.SetData(AttrHelper.GetPower(info.jihuo_att, false) ?? 0)
        } else {
            let info_mount = MountData.Inst().CfgMountJiHuoItemLevel1(this.item_id)
            if (info_mount) {
                this.viewNode.ModelShow.setMountSkin(info_mount.mount_res || info_mount.res_id);
                this.viewNode.CapShow.SetData(AttrHelper.GetPower(info_mount.up_att || info_mount.jihuo_att, false) ?? 0)
            } else {
                let itemConfig = Item.GetConfig(this.item_id);
                if (itemConfig.item_type == 1) {
                    this.setSkin(this.item_id);
                } else {
                    let giftList = Item.GetGiftlist(this.item_id);
                    if (giftList && giftList.length) {
                        for (let i = 0; i < giftList.length; i++) {
                            this.setSkin(giftList[i].item_id);
                        }
                    }
                }
            }
        }
    }

    private setSkin(itemId: number) {
        let info = FashionData.Inst().CfgClothesItem(itemId)
        if (info) {
            if (info.clothes_type == FASHION_TYPE.TOU_KUI) {
                this.viewNode.ModelShow.setHeadSkin(info.res_id);
                // this.viewNode.ModelShow.flushMain()
            } else if (info.clothes_type == FASHION_TYPE.HU_DUN) {
                this.viewNode.ModelShow.setShiledSkin(info.res_id);
                // this.viewNode.ModelShow.flushMain()
            } else if (info.clothes_type == FASHION_TYPE.WU_QI) {
                this.viewNode.ModelShow.setWeaponSkin(info.res_id);
                // this.viewNode.ModelShow.flushMain()
            } else if (info.clothes_type == FASHION_TYPE.KAI_JIA) {
                this.viewNode.ModelShow.setBodySkin(info.res_id);
            }
            this.viewNode.CapShow.SetData(AttrHelper.GetPower(info.jihuo_att, false) ?? 0)
        }
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
            ViewManager.Inst().CloseView(FashionInfoView)
            return
        }

        ViewManager.Inst().OpenViewByKey(item.data.open_panel);
        ViewManager.Inst().CloseView(FashionInfoView)
    }
}

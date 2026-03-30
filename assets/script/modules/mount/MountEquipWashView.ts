import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonConfirmTipData, CommonConfirmTipView } from "modules/common_help/CommonConfirmTipView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { UIEffectShow } from '../scene_obj_spine/UIEffectShow';
import { MountEquipAttrColor } from "./MountConfig";
import { MOUNR_REQ_TYPE, MountCtrl } from "./MountCtrl";
import { MountData, MountEquipDetail } from "./MountData";
import { MountEquipPosShow } from "./MountEquipShow";
import { MountEquipWashPreView } from "./MountEquipWashPreView";


@BaseView.registView
export class MountEquipWashView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "MountEquipWash",
        RelyOnPack: ["MountEquipSure", "MountEquipOp"],
        ViewName: "MountEquipWashView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "WashViewShow", ExtendsClass: MountEquipWashAttrShow },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        title: <fgui.GLabel>null,

        HuoBiIcon1: <fgui.GLoader>null,
        HuoBiIcon2: <fgui.GLoader>null,
        HuoBiIcon3: <fgui.GLoader>null,
        HuoBiIcon4: <fgui.GLoader>null,
        HuoBi1: <fgui.GLabel>null,
        HuoBi2: <fgui.GLabel>null,
        HuoBi3: <fgui.GLabel>null,
        HuoBi4: <fgui.GLabel>null,

        EquipShow: <MountEquipPosShow>null,
        BtnWashPre: <fgui.GButton>null,
        BtnWash1: <fgui.GButton>null,
        BtnWash2: <fgui.GButton>null,
        attr_list: <fgui.GList>null,

        BtnClose: <fgui.GButton>null,
    }
    private view_param: { bag_index: number; } = null
    private look_num = 0
    private wash_mark: MountEquipDetail
    InitData(param: { bag_index: number }) {
        MountData.Inst().SetWashEffMark(false)
        MountData.Inst().WashLockMark(-1)
        this.viewNode.Board.SetData(new BoardData(MountEquipWashView, null));

        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this, false), "washflush");
        this.AddSmartDataCare(MountData.Inst().flush_info, this.flushInfoPanel.bind(this, false), "needflush");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushInfoPanel.bind(this), "OtherItemChange");

        this.viewNode.BtnWashPre.onClick(this.OnClickWashPre.bind(this));
        this.viewNode.BtnWash1.onClick(this.OnClickWash1.bind(this));
        this.viewNode.BtnWash2.onClick(this.OnClickWash2.bind(this));
        this.viewNode.BtnClose.onClick(this.OnClickClose.bind(this));
        this.view_param = param

        this.flushInfoPanel()
    }
    OnClickClose() {
        ViewManager.Inst().CloseView(MountEquipWashView)
    }
    CloseCallBack() {

    }
    flushInfoPanel() {
        let param = MountData.Inst().GetEquipWashDeatil(this.view_param.bag_index)

        UH.SetIcon(this.viewNode.HuoBiIcon1, Item.GetIconId(param.oper_item), ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.HuoBiIcon2, Item.GetIconId(param.oper_item2), ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.HuoBiIcon3, Item.GetIconId(param.oper_item), ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.HuoBiIcon4, Item.GetIconId(param.oper_item2), ICON_TYPE.ITEM)

        UH.SetText(this.viewNode.HuoBi1, Item.GetNum(param.oper_item))
        UH.SetText(this.viewNode.HuoBi2, Item.GetNum(param.oper_item2))
        UH.SetText(this.viewNode.HuoBi3, param.oper_need)
        UH.SetText(this.viewNode.HuoBi4, param.oper_need2)

        this.viewNode.EquipShow.SetData(param.oper_target)
        this.viewNode.attr_list.SetData(param.oper_attrs)
        this.look_num = param.oper_attr_num

        // if(this.wash_mark != null)
        // {
        // MountData.Inst().JumpAttrChangeByWash(this.wash_mark)
        //     this.wash_mark = null
        // }
        MountData.Inst().SetWashEffMark(false)
    }

    OnClickWashPre() {
        ViewManager.Inst().OpenView(MountEquipWashPreView, { bag_index: this.view_param.bag_index });
    }
    OnClickWash1() {
        // 不应该允许玩家全锁
        let lock_num = MountData.Inst().CheckWashLockMark()
        if (lock_num >= this.look_num) {
            PublicPopupCtrl.Inst().Center(Language.Mount.WashLimit);
            return
        }
        let param = MountData.Inst().GetEquipWashDeatil(this.view_param.bag_index)
        if (MountData.Inst().WashWarning(this.view_param.bag_index)) {
            ViewManager.Inst().OpenView(CommonConfirmTipView,
                new CommonConfirmTipData(Language.Mount.WashTitle,
                    Language.Mount.WashContent, () => {
                        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.ENTRY_REFRESH, this.view_param.bag_index, MountData.Inst().GetWashLockMark(), param.oper_item)
                        MountData.Inst().SetWashEffMark(true)
                    }));
            return
        }

        // this.wash_mark = MountData.Inst().GetDetailHarnessInfo(this.view_param.bag_index)

        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.ENTRY_REFRESH, this.view_param.bag_index, MountData.Inst().GetWashLockMark(), param.oper_item)
        MountData.Inst().SetWashEffMark(true)
    }

    OnClickWash2() {
        // 不应该允许玩家全锁
        let lock_num = MountData.Inst().CheckWashLockMark()
        if (lock_num >= this.look_num) {
            PublicPopupCtrl.Inst().Center(Language.Mount.WashLimit);
            return
        }
        let param = MountData.Inst().GetEquipWashDeatil(this.view_param.bag_index)
        if (MountData.Inst().WashWarning(this.view_param.bag_index)) {
            ViewManager.Inst().OpenView(CommonConfirmTipView,
                new CommonConfirmTipData(Language.Mount.WashTitle,
                    Language.Mount.WashContent, () => {
                        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.ENTRY_REFRESH, this.view_param.bag_index, MountData.Inst().GetWashLockMark(), param.oper_item2)
                        MountData.Inst().SetWashEffMark(true)
                    }));
            return
        }

        // this.wash_mark = MountData.Inst().GetDetailHarnessInfo(this.view_param.bag_index)

        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.ENTRY_REFRESH, this.view_param.bag_index, MountData.Inst().GetWashLockMark(), param.oper_item2)
        MountData.Inst().SetWashEffMark(true)
    }

}

export class MountEquipWashAttrShow extends fgui.GButton {
    private is_select = false
    private viewNode = {
        show_attr: <fgui.GGroup>null,
        show_lock: <fgui.GGroup>null,

        attr_color: <fgui.GLoader>null,
        attr_str: <fgui.GLabel>null,
        is_select: <fgui.GImage>null,
        lock_area: <fgui.GGraph>null,

        need_icon: <fgui.GLoader>null,
        need_num: <fgui.GLabel>null,

        unlock_area: <fgui.GLabel>null,
        select_bg: <fgui.GImage>null,
        show_select: <fgui.GGroup>null,

        eff: <UIEffectShow>null,
    };
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.lock_area.onClick(this.OnClickLock.bind(this));
        this.viewNode.unlock_area.onClick(this.OnClickUnlock.bind(this));

    }

    public SetData(data: any) {
        if (data == null) {
            return
        }
        this.data = data
        // LogError("??f ",data.index, data.is_select,this.is_select,data.show_select)
        // this.is_select = data.is_select
        this.viewNode.show_attr.visible = data.is_unlock
        this.viewNode.show_lock.visible = !data.is_unlock

        this.viewNode.show_select.visible = data.show_select

        UH.SpriteName(this.viewNode.attr_color, "MountMain", MountEquipAttrColor[data.color])

        UH.SetText(this.viewNode.attr_str, data.attr_str)

        UH.SetIcon(this.viewNode.need_icon, Item.GetIconId(data.unlock_item), ICON_TYPE.ITEM);
        UH.SetText(this.viewNode.need_num, data.unlock_need)

        this.viewNode.select_bg.visible = data.show_select

        if (MountData.Inst().GetWashEffMark() && !this.viewNode.is_select.visible && data.is_unlock) {
            this.viewNode.eff.PlayEff(4164130)
        }

        let is_sel = this.data.is_select
        this.viewNode.is_select.visible = is_sel
        if(data.is_unlock){
            MountData.Inst().WashLockMark(is_sel ? 1 : 0, this.data.index)
        }
    }

    // 这里的锁定是锁词条，不被洗掉
    public OnClickLock() {
        if (!this.data.show_select) {
            return
        }
        MountData.Inst().WashLockMark(this.viewNode.is_select.visible ? 0 : 1, this.data.index)
        MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.SET_LOCK_FLAG, this.data.master_index, MountData.Inst().GetWashLockMark());
    }

    public GetIsSelect() {
        return MountData.Inst().EquipWashSel(this.data.master_index, this.data.index)
    }

    // 这里的解锁是指解锁词条
    public OnClickUnlock() {
        if (MountData.Inst().UnLockCheck(this.data.unlock_item, this.data.unlock_need)) {
            return
        }

        ViewManager.Inst().OpenView(CommonConfirmTipView,
            new CommonConfirmTipData(Language.Mount.UnlockTitle,
                TextHelper.Format(Language.Mount.UnlockContent, this.data.unlock_need), () => {
                    MountCtrl.Inst().SendCSMountReq(MOUNR_REQ_TYPE.UNLOCK, this.data.master_index)
                    PublicPopupCtrl.Inst().Center(Language.Mount.UnlockSuccess)
                }));

    }
}
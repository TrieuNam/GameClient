import { CfgAttrUp } from "config/CfgCommon";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BoxData } from "modules/box/BoxData";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { COLORS, COLORSTR, QualityColor } from "modules/common/ColorEnum";
import { ICON_TYPE, ItemColor } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { CommGetData, CommGetType } from "modules/common_account/CommonGetView";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { FASHION_TYPE, FashionData } from "modules/fashion/FashionData";
import { MountData } from "modules/mount/MountData";
import { RoleData } from "modules/role/RoleData";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
import { AttrHelper } from "../../helpers/AttrHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";

@BaseView.registView
export class CommonGetView2 extends BaseView {
    private _data: CommGetData;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "CommonGet2",
        ViewName: "CommonGetView2",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Name: <fgui.GTextField>null,
        CloseTimer: <TimeMeter>null,
        Model: <UIModelShow>null,
        //EffectShow: <UIEffectShow>null,
        Icon: <fgui.GLoader>null,
        Type1: <fgui.GTextField>null,
        Type2: <fgui.GTextField>null,
        Type3: <fgui.GTextField>null,
        Value1: <fgui.GTextField>null,
        Value2: <fgui.GTextField>null,
        Value3: <fgui.GTextField>null,
        Di1: <fgui.GImage>null,
        Di2: <fgui.GImage>null,
        Di3: <fgui.GImage>null,

        noaml_text: <fgui.GImage>null,
        wake_text: <fgui.GImage>null,
    }

    InitData(param: CommGetData) {
        this.viewNode.CloseTimer.SetCallBack(this.closeView.bind(this));
        this.AddSmartDataCare(BoxData.Inst().box_result_data,
            this.FlushData.bind(this),
            "flush_shizhuang");
        this.FlushData(param);
    }

    public FlushData(param: CommGetData) {
        if (!param)
            param = this._data;
        if (!param)
            this.closeView();
        if (param.res_id) {
            switch (param.type) {
                case CommGetType.Npc:
                    this.viewNode.Model.setPath(ResPath.Npc(param.res_id));
                    this.viewNode.Model.scaleX = this.viewNode.Model.scaleY = param.sc ?? 1;
                    break;
                case CommGetType.Ride:
                    this.viewNode.Model.setPath(ResPath.Ride(param.res_id));
                    this.viewNode.Model.scaleX = this.viewNode.Model.scaleY = param.sc ?? 1;
                    break;
                case CommGetType.Effect:
                    //this.viewNode.EffectShow.PlayEff(param.res_id);
                    break;
                case CommGetType.FazhenIcon:
                    UH.SetIcon(this.viewNode.Icon, param.res_id, ICON_TYPE.FaZhen);
                    break;
                case CommGetType.Fashion:
                    param = FashionData.Inst().GetFashionShowData();
                    let appearance = RoleData.Inst().GetAppearanceRes(true)
                    let info_mount = MountData.Inst().CfgMountJiHuoItemLevel1(param.item_id)
                    if (info_mount) {
                        appearance.surfaceMount = info_mount.mount_res || info_mount.res_id;
                        // this.viewNode.Model.setMountSkin(info_mount.mount_res || info_mount.res_id);
                        // this.viewNode.CapShow.SetData(AttrHelper.GetPower(info_mount.up_att || info_mount.jihuo_att, false) ?? 0)
                    } else {
                        let info = FashionData.Inst().CfgClothesItem(param.item_id)
                        if (info) {
                            if (info.clothes_type == FASHION_TYPE.TOU_KUI) {
                                appearance.surfaceHead = info.res_id;

                                // this.viewNode.Model.setHeadSkin(info.res_id);
                            } else if (info.clothes_type == FASHION_TYPE.HU_DUN) {
                                appearance.surfaceShield = info.res_id;

                                // this.viewNode.Model.setShiledSkin(info.res_id);
                            } else if (info.clothes_type == FASHION_TYPE.WU_QI) {
                                appearance.surfaceWeapon = info.res_id;

                                // this.viewNode.Model.setWeaponSkin(info.res_id);
                            } else if (info.clothes_type == FASHION_TYPE.KAI_JIA) {
                                appearance.surfaceBody = info.res_id;

                                // this.viewNode.Model.setBodySkin(info.res_id);
                            }
                        }
                    }
                    this.viewNode.Model.setPath(ResPath.ActorRole(10001), appearance);
                    break;
            }
        }
        this._data = param;
        this.viewNode.CloseTimer.TotalTime(6, TimeFormatType.TYPE_TIME_2, TextHelper.ColorStr(Language.Common.CloseTip, COLORSTR.Yellow1));
        UH.SetText(this.viewNode.Name, param.name);
        if (ItemColor.Color == param.color) {
            this.viewNode.Name.color = COLORS.White
            TextHelper.TextGradualChange(this.viewNode.Name, [COLORS.ColorDown, COLORS.ColorDown, COLORS.ColorUp, COLORS.ColorUp])
        } else {
            TextHelper.TextGradualChange(this.viewNode.Name, [COLORS.White, COLORS.White, COLORS.White, COLORS.White])
            this.viewNode.Name.color = QualityColor[param.color]
        }
        // this.viewNode.Name.color = QualityColor[param.color];
        this.viewNode.noaml_text.visible = param.is_nomal
        this.viewNode.wake_text.visible = !param.is_nomal
        this.nullAttr(this.viewNode.Type1, this.viewNode.Value1, this.viewNode.Di1)
        this.nullAttr(this.viewNode.Type2, this.viewNode.Value2, this.viewNode.Di2)
        this.nullAttr(this.viewNode.Type3, this.viewNode.Value3, this.viewNode.Di3)
        if (param.attr[0]) {
            this.setAttr(param.attr[0], this.viewNode.Type1, this.viewNode.Value1, this.viewNode.Di1)
        }
        if (param.attr[1]) {
            this.setAttr(param.attr[1], this.viewNode.Type2, this.viewNode.Value2, this.viewNode.Di2)
        }
        if (param.attr[2]) {
            this.setAttr(param.attr[2], this.viewNode.Type3, this.viewNode.Value3, this.viewNode.Di3)
        }
    }

    private setAttr(param: CfgAttrUp, typeTx: fgui.GTextField, valueTx: fgui.GTextField, diImg: fgui.GImage) {
        UH.SetText(typeTx, AttrListName[param.type] + "：")
        UH.SetText(valueTx, "+" + AttrHelper.Percent(param.type, param.add))
        diImg.visible = true
    }
    private nullAttr(typeTx: fgui.GTextField, valueTx: fgui.GTextField, diImg: fgui.GImage) {
        UH.SetText(typeTx, "")
        UH.SetText(valueTx, "")
        diImg.visible = false
    }

    InitUI() {
    }

    closeView() {
        if (this._data && this._data.call_back) {
            this._data.call_back();
        }
        ViewManager.Inst().CloseView(CommonGetView2)
    }
}

import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { RoleTitleItem2 } from "modules/common_item/RoleTitleItems";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { MainCapItem } from "modules/main/MainItems";
import { OtherRoleData } from "./OtherRoleCtrl";
import { UH } from "../../helpers/UIHelper";
import { ViewManager } from "manager/ViewManager";
import { BATTLE_ATTR, EQUIP_TYPE } from "modules/common/CommonEnum";
import { ResPath } from "utils/ResPath";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { DataHelper } from "../../helpers/DataHelper";
import { OrterRoleAttrInfoView } from "./OrterRoleAttrInfoView";
import { MainAngelButton } from "modules/main/MainAngelButton";
import { MainMountButton } from "modules/main/MainMountButton";
import { BaseItem } from "modules/common/BaseItem";
import { Language } from "modules/common/Language";
import { SceneObjDrawerSpine } from "modules/scene_obj_spine/SceneObjDrawerSpine";
import { CommonStruct } from "modules/common/CommonStruct";

@BaseView.registView
export class OrterRoleInfoView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "OrterRoleInfo",
        ViewName: "OrterRoleInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };
    protected viewNode = {
        ListEquip: <fgui.GList>null,
        ListExtra: <fgui.GList>null,
        ListAttrs: <fgui.GList>null,
        TitlrCell: <RoleTitleItem2>null,
        BtnAttr: <fgui.GButton>null,
        BtnAngel: <MainAngelButton>null,
        BtnMount: <MainMountButton>null,
        ModelShow: <UIModelShow>null,
        AvatarCell: <AvatarCell>null,
        TxtName: <fgui.GTextField>null,
        TxtScore: <fgui.GTextField>null,
        // CapItem: <MainCapItem>null,
        BtnClose: <fgui.GButton>null,
    }
    InitData() {
        this.viewNode.BtnClose.onClick(this.OnCloseView.bind(this));
        this.viewNode.BtnAttr.onClick(this.OnAttrContrast.bind(this));
        this.FlushData();
    }

    protected extendsCfg = [
        { ResName: "OtherRoleExtraCell", ExtendsClass: OtherRoleExtraCell },
    ];

    private FlushData() {
        let role_data = OtherRoleData.Inst().GetOtherRoleRet();
        UH.SetText(this.viewNode.TxtName, DataHelper.BytesToString(role_data.roleinfo.name));
        // this.viewNode.CapItem.SetData(role_data.roleinfo.cap);
        this.viewNode.AvatarCell.SetData(new AvatarData(role_data.roleinfo.headPicId, role_data.roleinfo.level, DataHelper.BytesToString(role_data.roleinfo.headChar)));
        this.viewNode.TitlrCell.SetData({ title: role_data.roleinfo.titleId, level: role_data.roleinfo.knightLevel });
        let appear = SceneObjDrawerSpine.GetAppearanceRes(CommonStruct.AppearanceParam(role_data.appearance), true, true);
        this.viewNode.ModelShow.setPath(ResPath.ActorRole(10001), appear);
        UH.SetText(this.viewNode.TxtScore, OtherRoleData.Inst().GetDescByType());

        let list: IPB_EquipData[] = [];
        for (let i = EQUIP_TYPE.INVALID + 1; i < EQUIP_TYPE.Max; i++) {
            list.push(role_data.equipList[i]);
        }
        this.viewNode.ListEquip.SetData(list);

        let attrs = [];
        for (let i = BATTLE_ATTR.HP; i < BATTLE_ATTR.TRUE_DAMAGE; i++) {
            attrs.push({ attrType: i, attrValue: role_data.roleAttrList[i].attrValue });
        }
        this.viewNode.ListAttrs.SetData(attrs);

        this.viewNode.BtnAngel.SetData(role_data.angelAppearance);

        this.viewNode.BtnMount.FlushData(OtherRoleData.Inst().GetMountInfo());

        let list_extra = [];
        list_extra[0] = { icon_package: "Main", icon_name: "BaoShi", name: Language.GemAtelier.MainTitle, qua: role_data.gemLevel }
        list_extra[1] = { icon_package: "Main", icon_name: "ShiZhuang", name: Language.Fashion.Title, qua: OtherRoleData.Inst().GetShiZhuangLevel() }
        list_extra[2] = { icon_package: "Main", icon_name: "XingTu", name: Language.StarMap.MainTitle, qua: role_data.starMapLevel }
        list_extra[3] = {  icon_package: "Main", icon_name: "MingWen", name: Language.Inscription.MainTitle,qua:0}
        list_extra[4] = {  icon_package: "Main", icon_name: "ZhanGui", name: Language.Fish.MainTitle, qua: 0 }
        list_extra[5] = {  icon_package: "", icon_name: "", name:"", qua: 0 }

        this.viewNode.ListExtra.SetData(list_extra);

    }

    private OnAttrContrast() {
        ViewManager.Inst().OpenView(OrterRoleAttrInfoView)
    }
    private OnCloseView() {
        ViewManager.Inst().CloseView(OrterRoleInfoView);
    }
}

class OtherRoleExtraCell extends BaseItem {
    protected viewNode = {
        QuaIcon: <fgui.GLoader>null,
        Icon: <fgui.GLoader>null,
        Name: <fgui.GTextField>null,
        NotOpen: <fgui.GTextField>null,
    }

    public SetData(data: { icon_package: string, icon_name: string, name: string, qua: number }) {
        if (data.qua == 0) {
            this.viewNode.NotOpen.visible = true;
            this.viewNode.QuaIcon.visible = this.viewNode.Icon.visible = this.viewNode.Name.visible = false;
        } else {
            UH.SpriteName(this.viewNode.QuaIcon, "CommonAtlas", "PinZhi" + data.qua);
            UH.SpriteName(this.viewNode.Icon, data.icon_package, data.icon_name);
            UH.SetText(this.viewNode.Name, data.name);
            this.viewNode.NotOpen.visible = false;
            this.viewNode.QuaIcon.visible = this.viewNode.Icon.visible = this.viewNode.Name.visible = true;
        }
    }
}

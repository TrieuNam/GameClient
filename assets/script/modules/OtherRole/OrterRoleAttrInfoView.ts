import * as fgui from "fairygui-cc";
import { BaseItem } from "modules/common/BaseItem";
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { tabberInfo } from "modules/common_board/CommonBoard5";
import { AvatarCell, AvatarData } from "modules/extends/AvatarCell";
import { PetAvatarCell, PetAvatarData } from "modules/extends/PetAvatarCell";
import { PetData } from "modules/Pet/PetData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { AttrHelper } from "../../helpers/AttrHelper";
import { DataHelper } from "../../helpers/DataHelper";
import { UH } from "../../helpers/UIHelper";
import { OtherRoleData } from "./OtherRoleCtrl";

@BaseView.registView
export class OrterRoleAttrInfoView extends BaseView {
    tabbarCfg: tabberInfo[] = [
        { panel: null, viewName: "", titleName: "主角", index: 0 },
        { panel: null, viewName: "", titleName: "宠物", index: 1 }
    ]
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "OrterRoleAttrInfo",
        ViewName: "OrterRoleAttrInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };
    protected viewNode = {
        ListAttr: <fgui.GList>null,
        HeadMy: <OtherRoleHead>null,
        HeadEqual: <OtherRoleHead>null,
        ListTab: <fgui.GList>null,
        Board: <CommonBoard2>null,
    }

    protected extendsCfg = [
        { ResName: "OtherRoleHead", ExtendsClass: OtherRoleHead },
        { ResName: "OtherRoleAttrCell", ExtendsClass: OtherRoleAttrCell },
        { ResName: "OrtherRoleLineCell", ExtendsClass: OrtherRoleLineCell },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(OrterRoleAttrInfoView));
        this.viewNode.ListAttr.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.ListAttr.setVirtual();
        this.viewNode.ListTab.SetData(this.tabbarCfg);
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.OnClickListItem, this);
        this.viewNode.ListTab.selectedIndex = 0;
        this.FlushData();
    }

    private FlushData() {
        let list_attr = OtherRoleData.Inst().GetAttrInfo(this.viewNode.ListTab.selectedIndex);
        this.viewNode.ListAttr.SetData(list_attr);
        this.viewNode.ListAttr.refreshVirtualList();

        let info = OtherRoleData.Inst().GetOtherRoleRet();
        let other_head_data = new OtherRoleHeadData();
        let my_head_data = new OtherRoleHeadData();
        if (this.viewNode.ListTab.selectedIndex == 0) {
            other_head_data.level = info.roleinfo.level;
            other_head_data.cap = info.roleinfo.cap;
            other_head_data.name = DataHelper.BytesToString(info.roleinfo.name);
            other_head_data.head_pic = info.roleinfo.headPicId;

            my_head_data.level = RoleData.Inst().GetRoleLevel();
            my_head_data.cap = RoleData.Inst().GetCapability();
            my_head_data.name = RoleData.Inst().GetRoleName();
            my_head_data.head_pic = RoleData.Inst().GetRoleHeadPic();
        } else if (PetData.Inst().IsPetEmbattle() && OtherRoleData.Inst().IsOtherPetEmbattle()) {
            let pet_info = info.petList.find(info => info.petId > 0)
            other_head_data.pet_id = pet_info.petId;
            other_head_data.petOrder = pet_info.petOrder;
            other_head_data.level = pet_info.petLevel;
            other_head_data.cap = pet_info.petCap;
            let my_pet_info = PetData.Inst().GetPetInfo(PetData.Inst().PetAllInfo.fightPetIndex.find(index => index > 0));
            if (my_pet_info) {
                my_head_data.pet_id = my_pet_info.petId;
                my_head_data.cap = my_pet_info.capability;
                my_head_data.level = my_pet_info.petLevel;
                my_head_data.petOrder = my_pet_info.petOrder;
            }
        }
        this.viewNode.HeadEqual.SetData(other_head_data);
        this.viewNode.HeadMy.SetData(my_head_data);

    }

    private GetListItemResource(index: number) {
        if (index == 4 || index == 12)
            return fgui.UIPackage.getItemURL("OrterRoleAttrInfo", "OrtherRoleLineCell");
        else
            return fgui.UIPackage.getItemURL("OrterRoleAttrInfo", "OtherRoleAttrCell");
    }

    private OnClickListItem() {
        let index = this.viewNode.ListTab.selectedIndex;
        if (index == 0) {
            this.viewNode.ListTab.selectedIndex = 0;
            this.FlushData();
        } else {
            if (!PetData.Inst().IsPetEmbattle() || !OtherRoleData.Inst().IsOtherPetEmbattle()) {
                PublicPopupCtrl.Inst().Center(Language.Arena.NoPet);
                this.viewNode.ListTab.selectedIndex = 0;
                return;
            }
            this.viewNode.ListTab.selectedIndex = 1;
            this.FlushData();
        }
    }
}
class OrtherRoleLineCell extends BaseItem {
    public SetData() {

    }
}
class OtherRoleAttrCell extends BaseItem {
    protected viewNode = {
        ImgContras: <fgui.GLoader>null,
        TxtMyNum: <fgui.GTextField>null,
        TxtType: <fgui.GTextField>null,
        TxtEqualNum: <fgui.GTextField>null,
    }

    public SetData(data: { my_num: number, other_num: number, type: number }) {
        UH.SetText(this.viewNode.TxtType, AttrListName[data.type]);
        UH.SetText(this.viewNode.TxtMyNum, AttrHelper.Percent(data.type, data.my_num));
        UH.SetText(this.viewNode.TxtEqualNum, AttrHelper.Percent(data.type, data.other_num));
        if (data.my_num == data.other_num) {
            this.viewNode.ImgContras.visible = false;
        } else {
            this.viewNode.ImgContras.visible = true;
            let res = +data.my_num > +data.other_num ? "JianTouLv" : "JianTouHong2"
            UH.SpriteName(this.viewNode.ImgContras, "CommonAtlas", res)
        }
    }
}

class OtherRoleHead extends BaseItem {
    protected viewNode = {
        AvatarCell: <AvatarCell>null,
        TxtName: <fgui.GTextField>null,
        CapItem: <fgui.GTextField>null,
        PetAvatarCell: <PetAvatarCell>null,
    }

    public SetData(data: OtherRoleHeadData) {
        if (data.pet_id) {
            this.viewNode.PetAvatarCell.visible = true;
            this.viewNode.AvatarCell.visible = false;
            UH.SetText(this.viewNode.TxtName, PetData.Inst().GetPetCfg(data.pet_id).pet_name);
            this.viewNode.PetAvatarCell.SetData(new PetAvatarData(data.pet_id, data.petOrder, -1,data.level));
        } else {
            this.viewNode.PetAvatarCell.visible = false;
            this.viewNode.AvatarCell.visible = true;
            UH.SetText(this.viewNode.TxtName, data.name);
            this.viewNode.AvatarCell.SetData(new AvatarData(data.head_pic, data.level));

        }
        UH.SetText(this.viewNode.CapItem, data.cap);
    }
}

class OtherRoleHeadData {
    cap: number;
    name: string;
    level: number;
    pet_id: number;
    petOrder: number;
    head_pic: number;
}

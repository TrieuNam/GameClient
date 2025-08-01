import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BoardData } from "modules/common_board/BoardData";
import { Language } from "modules/common/Language";
import { TabPetSkill } from "./PetSkillSelView";
import { SkillCell } from "modules/extends/SkillCell";
import { ViewManager } from "manager/ViewManager";
import { CfgPetSkill } from "config/CfgPet";
import { PetData } from "./PetData";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";
import { COLORS, QualityColor, QualityColorOL } from "modules/common/ColorEnum";
import { ItemColor } from "modules/common/CommonEnum";
import { BaseItem } from "modules/common/BaseItem";
import { SkillInfoView } from "modules/item_info/SkillInfoView";

@BaseView.registView
export class PetSkillMapView extends BaseView {
    private skill_map_data: { [page: number]: { cfg: CfgPetSkill, is_active: number }[] };
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetSkill",
        ViewName: "PetSkillMapView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        ListSkill: <fgui.GList>null,
        ListTab: <fgui.GList>null,
    }

    protected extendsCfg = [
        { ResName: "TabPetSkill", ExtendsClass: TabPetSkill },
        { ResName: "PetSkillMapCell", ExtendsClass: PetSkillMapCell },
    ];

    InitData() {
        this.viewNode.Board.SetData(new BoardData(PetSkillMapView))
        this.viewNode.ListSkill.setVirtual();
        this.viewNode.ListTab.SetData(Language.Pet.PetSkillMap.tab);
        this.viewNode.ListTab.selectedIndex = 0;
        this.skill_map_data = PetData.Inst().GetSkillMapData();
        this.FlushListByTab();
    }

    InitUI() {
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.FlushListByTab, this);
    }

    public FlushListByTab() {
        if (this.skill_map_data) {
            let data = this.skill_map_data[this.viewNode.ListTab.selectedIndex];
            if (data) {
                this.viewNode.ListSkill.SetData(data);
            }
        }
    }
}

class PetSkillMapCell extends BaseItem {
    protected viewNode = {
        Cell: <SkillCell>null,
        TxtName: <fgui.GTextField>null,
        GpLock:<fgui.GGroup>null,
        Block:<fgui.GGraph>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Block.onClick(this.OnClick.bind(this));
    }
    public SetData(data: { cfg: CfgPetSkill, is_active: number }) {
        this._data = data;
        this.viewNode.Cell.SetData(data.cfg.skill_id);
        if (data.is_active == 1) {
            let item_id = data.cfg.skill_item_id;
            UH.SetText(this.viewNode.TxtName, Item.GetName(item_id), Item.QuaColor(item_id));
            this.viewNode.TxtName.strokeColor = Item.QuaColorOL(item_id);
            this.viewNode.TxtName.stroke=2;
        } else {
            UH.SetText(this.viewNode.TxtName, Language.Pet.lock,COLORS.Yellow2);
            this.viewNode.TxtName.stroke = 0;
        }
        this.viewNode.GpLock.visible = data.is_active != 1;
    }

    public OnClick() {
        ViewManager.Inst().OpenView(SkillInfoView, this._data.cfg.skill_id)
    }
}
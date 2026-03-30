import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { UH } from "../../helpers/UIHelper";
import { ItemCell } from "modules/extends/ItemCell";
import { CfgPetSkill } from "config/CfgPet";
import { PetData } from "./PetData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { BoardData } from "modules/common_board/BoardData";
import { Item } from "modules/bag/ItemData";
import { CfgItem } from "config/CfgCommon";
import { Language } from "modules/common/Language";
import { NetNodeState } from "core/net/NetNode";

@BaseView.registView
export class PetSkillSelView extends BaseView {
    private skill_list: { [skill_page: number]: { cfg: CfgPetSkill, is_studyed: boolean }[] };
    private pet: IPB_SCRolePetData;
    private call_back: Function;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetSkill",
        ViewName: "PetSkillSelView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        ListTab: <fgui.GList>null,
        ListSkill: <fgui.GList>null,
        BtnSelect: <fgui.GButton>null,
        TogHide: <fgui.GButton>null,
        None:<fgui.GTextField>null,
    }
    protected extendsCfg = [
        { ResName: "TabPetSkill", ExtendsClass: TabPetSkill },
        { ResName: "PetSkillSelCell", ExtendsClass: PetSkillSelCell },
    ];

    InitData(data:{ pet: IPB_SCRolePetData ,call_back:Function} ) {
        this.viewNode.Board.SetData(new BoardData(PetSkillSelView) );
        this.pet = data.pet;
        this.call_back = data.call_back;
        this.viewNode.ListTab.SetData(Language.Pet.pet_skill_tab);
        this.viewNode.ListTab.selectedIndex=0;
        this.viewNode.ListSkill.setVirtual();
        this.FlushListByTog();
    }

    InitUI() {
        this.viewNode.TogHide.onClick(this.FlushListByTog.bind(this));
        this.viewNode.BtnSelect.onClick(this.SelectSkill.bind(this));
        this.viewNode.ListTab.on(fgui.Event.CLICK_ITEM, this.FlushListByTab, this);
    }

    public FlushListByTog() {
        let is_ex = this.viewNode.TogHide.selected;
        this.skill_list = PetData.Inst().GetSkillBookList(  this.pet.skillList );
        this.FlushListByTab();
    }

    public FlushListByTab(){
        if (this.skill_list){
            let data = this.skill_list[this.viewNode.ListTab.selectedIndex];
            this.viewNode.ListSkill.SetData(data);
            this.viewNode.None.visible=data.length==0;
            if (data.length == 0)
                this.viewNode.ListSkill.selectedIndex = -1
            else
                this.viewNode.ListSkill.selectedIndex = 0;
        }
    }

    private SelectSkill(){
        if (this.viewNode.ListSkill.selectedIndex == -1){
            PublicPopupCtrl.Inst().Center(Language.Pet.no_select_skill);
        }else{
            this.call_back(this.skill_list[this.viewNode.ListTab.selectedIndex][this.viewNode.ListSkill.selectedIndex].cfg);
            ViewManager.Inst().CloseView(PetSkillSelView);
        }
    }

}

export class TabPetSkill extends fgui.GButton {
    protected viewNode = {
        title_select: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        UH.SetText(this.viewNode.title_select, this.title);
    }

    public SetData(title:string){
        this.title=title;
        UH.SetText(this.viewNode.title_select, title);
    }
}

class PetSkillSelCell extends fgui.GButton {
    protected viewNode = {
        Cell: <ItemCell>null,
        TxtName: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: { cfg: CfgPetSkill, is_studyed: boolean }) {
        this.grayed =data.is_studyed;
        this.viewNode.Cell.SetData (Item.Create(new CfgItem(data.cfg.skill_item_id,Item.GetNum(data.cfg.skill_item_id)),{ is_num:true,is_gray:data.is_studyed}));
        UH.SetText(this.viewNode.TxtName,Item.GetName(data.cfg.skill_item_id),Item.QuaColor(data.cfg.skill_item_id));
        this.viewNode.TxtName.strokeColor = Item.QuaColorOL(data.cfg.skill_item_id);
    }
}
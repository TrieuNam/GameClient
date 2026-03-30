import { ViewManager } from "manager/ViewManager";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { ItemCell } from "modules/extends/ItemCell";
import { BoardData } from "modules/common_board/BoardData";
import { CfgAllPetCloth } from "config/CfgPetCloth";
import { UH } from "../../helpers/UIHelper";
import { Item } from "modules/bag/ItemData";
import { CfgItem } from "config/CfgCommon";
import { PetClothData } from "./PetClothData";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { PetCtrl, PET_OP_TYPE } from "modules/Pet/PetCtrl";
import { Language } from "modules/common/Language";
import { ColorStr, TextHelper } from "../../helpers/TextHelper";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PetData } from "modules/Pet/PetData";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { UIModelShow } from "modules/scene_obj_spine/UIModelShow";
import { ResPath } from "utils/ResPath";
@BaseView.registView
export class PetHuanHuaSkillUpView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "PetHuanHuaSkillUp",
        ViewName: "PetHuanHuaSkillUpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlock,
    };

    // protected onDestroy(): void {
    //     super.onDestroy();

    // }
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        Board: <CommonBoard3>null,
        Cell: <ItemCell>null,
        LbName: <fgui.GTextField>null,
        BtnUpLevel: <CommonButtonBuy>null,
        ListSkill: <fgui.GList>null,
        LbNum: <fgui.GRichTextField>null,
        EffectShow: <UIEffectShow>null,
        ModelShow: <UIModelShow>null,
        LevelEffect: <fgui.GGroup>null
    };
    private petClothData: CfgAllPetCloth;
    public InitData(data: CfgAllPetCloth) {
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushList.bind(this), "flush_cloth_up");
        this.petClothData = data;
        this.viewNode.Board.SetData(new BoardData(PetHuanHuaSkillUpView));
        this.viewNode.BtnUpLevel.onClick(this.OnClickUpLevl.bind(this));
        this.viewNode.ListSkill.setVirtual();
        //this.viewNode.ListSkill.itemRenderer = this.GetListItemResource.bind(this);
        this.FlushList();
    }
    InitUI() {


    }
    // protected onConstruct() {
    //     super.onConstruct();
    //     ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    //     // this.addSmartDataCare(WarOrderData.Inst().WarOrderSmartData, this.FlushList.bind(this));


    // }
    protected extendsCfg = [
        { ResName: "PetHuanHuaSkillUpItem", ExtendsClass: PetHuanHuaSkillUpItem },
        { ResName: "PetHuanHuaCurDesc", ExtendsClass: PetHuanHuaCurDesc },
        { ResName: "SkillDescItem", ExtendsClass: SkillDescItem },
        { ResName: "SkillUpItem2", ExtendsClass: SkillUpItem2 },
    ];



    private list_data: any[];
    public FlushList() {
        if (PetClothData.Inst().GetUpSkillLevelData(this.petClothData.id, PetData.Inst().PetAllInfo.clothList.find(cfg => {return cfg.itemId == this.petClothData.id}).level +1) == null) { //PetClothData.Inst().GetUpSkillLevelData(this.petClothData.id,PetClothData.Inst().ClothUpList[this.petClothData.id]+1) == null
            // this.viewNode.BtnUpLevel.SetTitle("已满级");
            // this.viewNode.BtnUpLevel.enabled = false;
            clearTimeout(this.timeOut);
            clearTimeout(this.timeOut2);
            ViewManager.Inst().CloseView(PetHuanHuaSkillUpView);
            return;
        }
        this.viewNode.ModelShow.setPath(ResPath.Npc(this.petClothData.res_id));
        let needNum = PetClothData.Inst().GetUpSkillLevelData(this.petClothData.id, PetData.Inst().PetAllInfo.clothList.find(cfg => {return cfg.itemId == this.petClothData.id}).level +1);
        let num = Item.GetNum(this.petClothData.id);
        let isEnough = num >= needNum ? Language.PetHuanHua.numTip1 : Language.PetHuanHua.numTip0;
        UH.SetText(this.viewNode.LbNum, TextHelper.Format(isEnough, num, needNum));
        this.viewNode.Cell.SetData(Item.Create(new CfgItem(this.petClothData.id, needNum), { is_click: true, is_gray: false, eff: -1 }));
        UH.SetText(this.viewNode.LbName, this.petClothData.name);
        let curData = PetClothData.Inst().GetSkillDataByIdAndLevel(this.petClothData.id, 1);
        this.list_data = curData;
        this.viewNode.ListSkill.SetData(curData);
        //this.viewNode.ListSkill.numItems = curData.length;

        //this.viewNode.ListSkill.refreshVirtualList();
    }

    DoOpenWaitHandle() {
    }

    OpenCallBack() {
    }

    CloseCallBack() {
    }

    closeView() {
        ViewManager.Inst().CloseView(PetHuanHuaSkillUpView);
        clearTimeout(this.timeOut);
        clearTimeout(this.timeOut2);
    }
    private timeOut: any;
    private timeOut2: any;
    //点击升级按钮
    private OnClickUpLevl() {
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => {return cfg.itemId == this.petClothData.id})
        if (Item.GetNum(this.petClothData.id) >= PetClothData.Inst().GetUpSkillLevelData(this.petClothData.id,cloth.level + 1)) {
            if (cloth.level < 9) {
                this.viewNode.BtnUpLevel.enabled = false;
                this.timeOut = setTimeout(() => {
                    this.viewNode.BtnUpLevel.enabled = true;
                }, 500);
                //this.timeOut;
            }
            this.viewNode.LevelEffect.visible = true
            this.viewNode.EffectShow.PlayEff(4164140)
            this.timeOut2 = setTimeout(() => {
                PetCtrl.Inst().SendPetReq(PET_OP_TYPE.CLOTH_UP, this.petClothData.id);
                PublicPopupCtrl.Inst().Center(Language.PetHuanHua.upTips);
                this.viewNode.LevelEffect.visible = false
            }, 4000);

        } else {
            let name = TextHelper.Format(Language.PetHuanHua.Tip1, this.petClothData.name);
            PublicPopupCtrl.Inst().Center(name);
        }

    }
    private GetListItemResource(index: number, item: PetHuanHuaSkillUpItem) {
        item.SetData(this.list_data[index]);
    }


}
export class PetHuanHuaSkillUpItem extends fgui.GComponent {
    private viewNode = {
        IconFrame: <fgui.GLoader>null,
        IconSkill: <fgui.GLoader>null,
        LbSkillName: <fgui.GTextField>null,
        Listdesc: <fgui.GList>null,
    };
    private list_data: any[] = [];
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        //this.viewNode.Listdesc.setVirtual();
        this.viewNode.Listdesc.itemProvider = this.GetListItemResource.bind(this);
    }
    public SetData(data: any) {
        this.data = data;
        this.list_data = [];
        UH.SpriteName(this.viewNode.IconFrame, "PetHuanHua", "skillFrame_" + data.skill_color);
        UH.SetIcon(this.viewNode.IconSkill, data.skill_icon, 1);
        UH.SetText(this.viewNode.LbSkillName, data.skill_name);
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => {return cfg.itemId == data.id})
        let curLevel = PetClothData.Inst().GetSkillDataBySkillIconAndLevel(data.skill_icon, cloth.level);
        let nextLevel = PetClothData.Inst().GetSkillDataBySkillIconAndLevel(data.skill_icon, cloth.level + 1);
        this.list_data.push({ isNext: 0, data: curLevel });
        this.list_data.push("string");
        if (nextLevel)
            this.list_data.push({ isNext: 1, data: nextLevel });
        this.viewNode.Listdesc.SetData(this.list_data);
        this.viewNode.Listdesc.numItems = 3;
        // this.viewNode.Listdesc.SetData(this.list_data);
        //
    }
    private GetListItemResource(index: number) {
        let data = this.list_data[index];
        if (typeof (data) == "string")
            return fgui.UIPackage.getItemURL("PetHuanHuaSkillUp", "SkillUpItem2");
        else
            return fgui.UIPackage.getItemURL("PetHuanHuaSkillUp", "PetHuanHuaCurDesc");
    }

}
// 滚动高度130
export class PetHuanHuaCurDesc extends fgui.GComponent {
    private viewNode = {
        ListDesc: <fgui.GList>null,
    };
    private list_data: any;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.ListDesc.setVirtual();
        this.viewNode.ListDesc.itemRenderer = this.GetListItemResource.bind(this);
    }
    public SetData(data: any) {
        this.list_data = data;
        this.viewNode.ListDesc.numItems = 1;

    }
    private GetListItemResource(index: number, item: SkillDescItem) {
        item.SetData(this.list_data.data, this.list_data.isNext);
    }
    // public getTest(t: any){
    //     console.log("---getTest---",t);

    // }

}
export class SkillDescItem extends fgui.GComponent {
    private viewNode = {
        LbDesc: <fgui.GRichTextField>null,
    };
    private list_data: any;
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: any, isNext: number) {
        this.data = data;
        this.viewNode.LbDesc.color = COLORS.Yellow5;
        let valueCol = COLORSTR.Yellow7;
        let cloth = PetData.Inst().PetAllInfo.clothList.find(cfg => {return cfg.itemId == data.id})
        let desc = PetClothData.Inst().GetSkillDataBySkillIconAndLevel(data.skill_icon, cloth.level);
        if (isNext) {
            this.viewNode.LbDesc.color = COLORS.Blue2;
            valueCol = COLORSTR.Green3;
            desc = PetClothData.Inst().GetSkillDataBySkillIconAndLevel(data.skill_icon, cloth.level + 1);
        }
        //if(desc){
        let txt = PetClothData.Inst().GetText(desc.skill_txt, valueCol);
        UH.SetText(this.viewNode.LbDesc, txt)
        //}

        //    let e = this.parent.parent as PetHuanHuaCurDesc;
        //     e.getTest(this.height);
    }

}
export class SkillUpItem2 extends fgui.GComponent {
    private viewNode = {

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);

    }
    public SetData(data: any) {
        this.data = data;



    }

}
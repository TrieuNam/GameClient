import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BaseItem } from "modules/common/BaseItem";
import { PetData, PetGemData, PetGemOnceResultData } from "./PetData";
import { BagData } from "modules/bag/BagData";
import { BoardData } from "modules/common_board/BoardData";
import { CfgAttrUp } from "config/CfgCommon";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { PetGemLvItem } from "./PetGemView";
import { CfgPetData } from "config/CfgPet";
import { AttrListName, Language } from "modules/common/Language";
import { AttrItemCell } from "modules/common_item/AttrItem";
import { AttrHelper } from "../../helpers/AttrHelper";
import { PetGemStoreData, PetGemStoreView } from "./PetGemStoreView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PetGemOnceUpSelectView } from "./PetGemOnceUpSelectView";
import { Item } from "modules/bag/ItemData";
import { TextHelper } from "../../helpers/TextHelper";

@BaseView.registView
export class PetGemUpView extends BaseView {
    private select_gem_data: PetGemData;
    private next_gem_data: PetGemData;
    private select_gem_index: number;
    private next_attr_data: { att_data: CfgAttrUp, cur_add: number }[];
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemUp",
        ViewName: "PetGemUpView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        Gem: <PetGemLvItem>null,
        GemNext: <PetGemLvItem>null,
        ListAttrBase: <fgui.GList>null,
        ListAttrNextBase: <fgui.GList>null,
        BtnUp: <fgui.GButton>null,
        GpGemNextInfo: <fgui.GGroup>null,
        Tip: <fgui.GRichTextField>null,
        BtnOnce: <fgui.GButton>null,
        TipUp: <fgui.GButton>null,
        TxtNextGemName: <fgui.GTextField>null,
        TxtGemName: <fgui.GTextField>null,
    }
    protected extendsCfg = [
        { ResName: "PetGemUpAttCell2", ExtendsClass: AttrItemCell },
        { ResName: "PetGemUpAttCell3", ExtendsClass: PetGemUpAttCell3 },
    ];

    InitData(param: PetGemData) {
        UH.SetText(this.viewNode.Tip, Language.Pet.GemUpTip)
        this.select_gem_data = param;
        this.viewNode.Board.SetData(new BoardData(PetGemUpView));
        this.viewNode.BtnUp.onClick(this.onGemUp.bind(this));
        // this.viewNode.BtnSelect.onClick(this.OnChangeGem.bind(this));
        this.viewNode.BtnOnce.onClick(this.OnOnce.bind(this));
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushSelect.bind(this), "is_ts_gem_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushUpRet.bind(this), "flush_gem_up_ret");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushSelect.bind(this), "OtherChange");
        this.FlushSelect();
    }

    private FlushSelect() {
        if (this.select_gem_data) {
            this.viewNode.BtnUp.enabled = true;
            this.viewNode.GemNext.visible = true;
            let id = this.select_gem_data.item_id;
            this.viewNode.Gem.SetData(this.select_gem_data);
            let attr
            let attr_next
            let next_item_id;
            let next_level = this.select_gem_data.level + 1;
            let cfg;
            let cfg_next: any;
            let is_ts = id == PetData.Inst().GetTsGemId();
            let gem_name:string;
            let next_gem_name: string;
            let base_gem_name: string;
            if (is_ts) {
                cfg = CfgPetData.pet_ts_gem[this.select_gem_data.level - 1];
                cfg_next = CfgPetData.pet_ts_gem[next_level - 1];
                this.select_gem_index = this.select_gem_data.bag_index;
                base_gem_name = Item.GetName(CfgPetData.pet_ts_gem[0].to_item_id);
                gem_name = Item.GetName(cfg.to_item_id);
                if (cfg_next){
                    next_gem_name = Item.GetName(cfg_next.to_item_id);
                    next_item_id=id;
                }
            } else {
                cfg = PetData.Inst().GetPetGemCfg()[id];
                base_gem_name = Item.GetName(PetData.Inst().GetGemCfgByLevel()[cfg.gem_type][1].gem_id);
                cfg_next = PetData.Inst().GetGemCfgByLevel()[cfg.gem_type][next_level];
                this.select_gem_index = null;
                gem_name = Item.GetName(cfg.gem_id);
                if (cfg_next){
                    next_gem_name = Item.GetName(cfg_next.gem_id);
                    next_item_id = cfg_next.gem_id;
                }
            }
            attr = cfg.up_att;
            if (!cfg_next) {
                //最大等级
                this.viewNode.GpGemNextInfo.visible = false;
                this.next_gem_data = null;
                UH.SetText(this.viewNode.TipUp, Language.Pet.GemMaxTip);
            } else {
                this.viewNode.GpGemNextInfo.visible = true;
                attr_next = cfg_next.up_att;
                this. next_attr_data = [];
                for (let i = 0; i < attr_next.length; i++) {
                    let type = attr_next[i].type;
                    let value = 0;
                    for (let j = 0; j < attr.length; j++) {
                        if (attr[j].type == type) {
                            value = attr[j].add;
                            break;
                        }
                    }
                    this.next_attr_data.push({ att_data: attr_next[i], cur_add: value  });
                }
                this.next_gem_data = new PetGemData(next_item_id, next_level, this.select_gem_data.pet_index, this.select_gem_data.bag_index);
                this.viewNode.GemNext.SetData(this.next_gem_data);
                this.viewNode.ListAttrNextBase.SetData(this.next_attr_data);
                UH.SetText(this.viewNode.TxtNextGemName, next_gem_name);
                let up_desc = PetData.Inst().CheckGemUpOne(this.select_gem_data) ? Language.Pet.CanUp : Language.Pet.NoItems;
                let desc;
                if(PetData.Inst().CheckGemUpOne(this.select_gem_data)){
                    desc = TextHelper.Format(Language.Pet.UpTip, cfg.gem_level1, base_gem_name, up_desc);
                }else{
                    let curNum;
                    if(is_ts){
                        curNum = Item.GetNum(CfgPetData.pet_ts_gem[0].to_item_id);
                    }else{
                        cfg = PetData.Inst().GetPetGemCfg()[id];
                        curNum = Item.GetNum(PetData.Inst().GetGemCfgByLevel()[cfg.gem_type][1].gem_id);
                    }
                    desc = TextHelper.Format(Language.Pet.UpTip2, cfg.gem_level1-curNum, base_gem_name, up_desc);
                }
                
                UH.SetText(this.viewNode.TipUp, desc);
            }
            this.viewNode.ListAttrBase.SetData(attr);
            UH.SetText(this.viewNode.TxtGemName, gem_name);
        } else {
            this.viewNode.BtnUp.enabled = false;
        }
    }

    // private OnChangeGem() {
    //     let pet_inst = PetData.Inst();
    //     let store_data = new PetGemStoreData();
    //     store_data.title = Language.Pet.GemUp;
    //     store_data.func_show = pet_inst.GetUpLevelGemList.bind(pet_inst);
    //     store_data.func_select_call = (gem_data: PetGemData) => {
    //         ViewManager.Inst().CloseView(PetGemStoreView);
    //         this.select_gem_data = gem_data;
    //         this.FlushSelect();
    //     }
    //     ViewManager.Inst().OpenView(PetGemStoreView, store_data)
    // }


    private FlushUpRet() {
        this.Touchable = true;
        if (PetData.Inst().gem_up_ret) {
            this.select_gem_data = this.next_gem_data;
            this.CheckNextLevelAttrChange();
            this.FlushSelect();
        }
    }

    public onGemUp() {
        if (this.select_gem_data) {
            if (this.next_gem_data) {
                PetData.Inst().DoGemUpOne(this.select_gem_data);
                this.Touchable = false;
            } else {
                PublicPopupCtrl.Inst().Center(Language.Pet.GemMaxTip);
            }
        }
    }

    public CheckNextLevelAttrChange(){
        if (this.next_attr_data){
            for (let i = 0; i < this.next_attr_data.length;i++){
                let num = this.next_attr_data[i].att_data.add - this.next_attr_data[i].cur_add
                if (num>0){
                    let att_type = this.next_attr_data[i].att_data.type;
                    let att_add = num;
                    let name = AttrListName[att_type]
                    PublicPopupCtrl.Inst().CenterAttr(`${name} +${AttrHelper.Percent(att_type, att_add)}`, 1)
                }
            }
        }
    }

    private OnOnce() {
        ViewManager.Inst().OpenView(PetGemOnceUpSelectView)
    }
}

class PetGemUpAttCell3 extends BaseItem {
    protected viewNode = {
        ImgUp: <fgui.GImage>null,
        TxtNum: <fgui.GTextField>null,
        TxtName: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: { att_data: CfgAttrUp, cur_add: number }) {
        UH.SetText(this.viewNode.TxtName, AttrListName[data.att_data.type] + ":");
        UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.att_data.type, data.att_data.add));
        this.viewNode.ImgUp.visible = data.att_data.add > data.cur_add;
    }
}



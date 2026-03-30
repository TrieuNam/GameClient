import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { BaseItem } from "modules/common/BaseItem";
import { PetData, PetGemData } from "./PetData";
import { UH } from "../../helpers/UIHelper";
import { CfgPetData } from "config/CfgPet";
import { Item } from "modules/bag/ItemData";
import { ViewManager } from "manager/ViewManager";
import { AttrListName, Language } from "modules/common/Language";
import { AttrHelper } from "../../helpers/AttrHelper";
import { BoardData } from "modules/common_board/BoardData";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { PetCtrl, PET_OP_TYPE } from "./PetCtrl";
import { PetGemLvItem } from "./PetGemView";
import {  COLORSTR, QualityColor } from "modules/common/ColorEnum";
import { TextHelper } from "../../helpers/TextHelper";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { BagData } from "modules/bag/BagData";
import { CommonButtonBuy } from "modules/common_button/CommonButtonBuy";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";

@BaseView.registView
export class PetGemWashView extends BaseView {
    private gem_index: number = -1;
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemWash",
        ViewName: "PetGemWashView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Board: <CommonBoard3>null,
        TxtNum: <fgui.GTextField>null,
        ListAttr: <fgui.GList>null,
        GemCell: <PetGemLvItem>null,
        BtnWash: <CommonButtonBuy>null,
        BtnAdd: <fgui.GButton>null,
        TxtTip: <fgui.GRichTextField>null,
        TxtBaseAtt: <fgui.GRichTextField>null,
        TipNone: <fgui.GTextField>null,
        CostIcon: <fgui.GLoader>null,
    }
    protected extendsCfg = [
        { ResName: "PetGemWashCell", ExtendsClass: PetGemWashCell },
    ];

    InitData(gem_index: number) {
        this.gem_index = gem_index;
        this.viewNode.Board.SetData(new BoardData(PetGemWashView));
        UH.SetText(this.viewNode.TxtTip, Language.Pet.WashTip)
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushCostNum.bind(this), "is_gem_wash_flag_change");
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushSelectGemData.bind(this), "is_ts_gem_change");
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushCostNum.bind(this), "OtherChange");
        this.viewNode.BtnWash.onClick(this.onWash.bind(this));
        // this.viewNode.BtnAdd.onClick(this.ChangeGem.bind(this));
        this.FlushSelectGemData();
    }

    private attr_len:number=0;
    private FlushSelectGemData() {
        if (this.gem_index != -1) {
            let gem_data = PetData.Inst().SetPetGemWahInfo(this.gem_index);
            if (gem_data) {
                this.viewNode.GemCell.SetData(new PetGemData(PetData.Inst().GetTsGemId(), gem_data.level, 0, gem_data.gem_index))
                this.viewNode.TipNone.visible = gem_data.atttr_data.length == 0;
                let len = gem_data.atttr_data.length ;
                this.viewNode.ListAttr.columnCount = len > 5 ? 2 : 1;
                let list=[];
                list.push(...gem_data.atttr_data)
                list.push({});
                this.viewNode.ListAttr.SetData(list);
                if (this.attr_len && len > this.attr_len && len > 10) {
                    let num = Math.ceil((len - 10)/2) ;
                    let y = num*65;
                    let list_scrollPane = this.viewNode.ListAttr.scrollPane;
                    if (list_scrollPane && list_scrollPane.posY != y)
                        list_scrollPane.setPosY(y, false);
                }
                this.attr_len =len;
                this.viewNode.GemCell.visible = true;
                this.viewNode.BtnWash.enabled = true;
                this.FlushCostNum();
                let cfg = CfgPetData.pet_ts_gem[gem_data.level - 1];
                if (cfg) {
                    let base_attr = "";
                    for (let i = 0; i < cfg.up_att.length; i++) {
                        let type = cfg.up_att[i].type;
                        let add = cfg.up_att[i].add;
                        base_attr += AttrListName[type] + "：" + TextHelper.ColorStr(AttrHelper.Percent(type, add), COLORSTR.Yellow5) + "\n"
                    }
                    UH.SetText(this.viewNode.TxtBaseAtt, base_attr);
                }
                return;
            }
        }
        this.viewNode.BtnWash.enabled = false;
        this.viewNode.GemCell.visible = false;
    }

    private FlushCostNum() {
        let gem_data = PetData.Inst().pet_gem_wash_data;
        if (gem_data) {
            let cost_cfg = PetData.Inst().GetWashLockCost(gem_data.lock_num)
            let cost = cost_cfg.use_item_num;
            let item_id = cost_cfg.use_item_id;
            UH.SetIcon(this.viewNode.CostIcon, Item.GetIconId(item_id), ICON_TYPE.ITEM);
            let num = Item.GetNum(item_id);
            let col = num >= cost ? COLORSTR.Green4 : COLORSTR.Red1;
            UH.SetText(this.viewNode.TxtNum, TextHelper.ColorStr(cost,col)  + "/" + num);
            let cfg = CfgPetData.pet_ts_gem[gem_data.level - 1];
            let max_num = cfg.up_att_num;
            let is_select_all = gem_data.lock_num == max_num;
            this.viewNode.BtnWash.ShowRedPoint(num >= cost && !is_select_all);
            this.viewNode.BtnWash.enabled = !is_select_all;
        }
    }

    // private ChangeGem() {
    //     let pet_inst = PetData.Inst();
    //     let store_data = new PetGemStoreData();
    //     store_data.title = Language.Pet.GemWash;
    //     store_data.func_show = pet_inst.GetAllTsGem.bind(pet_inst);
    //     store_data.func_select_call = (gem_data: PetGemData) => {
    //         this.gem_index = gem_data.bag_index;
    //         this.FlushSelectGemData();
    //         ViewManager.Inst().CloseView(PetGemStoreView)
    //     }
    //     ViewManager.Inst().OpenView(PetGemStoreView, store_data)
    // }

    private onWash() {
        let gem_data = PetData.Inst().pet_gem_wash_data;
        if (!gem_data)
            return;
        // if (gem_data.atttr_data.length == 0) {
        //     PublicPopupCtrl.Inst().Center(Language.Pet.no_wash_attr);
        //     return;
        // }
        let cost_cfg = PetData.Inst().GetWashLockCost(gem_data.lock_num);
        let cost_num = cost_cfg.use_item_num;
        let id = cost_cfg.use_item_id
        let has_num = Item.GetNum(id);
        if (cost_num > has_num) {
            PublicPopupCtrl.Inst().ItemNotEnoughNotice(id)
            return
        }
        let flag = "";
        for (let i = gem_data.atttr_data.length - 1; i >= 0; i--) {
            flag += gem_data.atttr_data[i].flag;
        }
        let lock_flag = parseInt(flag, 2);
        PetCtrl.Inst().SendPetReq(PET_OP_TYPE.TS_GEM_REFRESH, gem_data.gem_index, lock_flag)
    }

    InitUI() {
    }

    CloseCallBack(): void {
        PetData.Inst().pet_gem_wash_data = null;
    }

}

class PetGemWashCell extends BaseItem {
    protected viewNode = {
        TxtAttrName: <fgui.GTextField>null,
        TxtAttrNum: <fgui.GTextField>null,
        Tog: <fgui.GButton>null,
        Effect:<UIEffectShow>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.Tog.onClick(this.onChangeFlag.bind(this));
    }

    public SetData(data: { type: number, value: number, flag: number, index: number }) {
        if (this._data && (this._data.type != data.type || this._data.value != data.value)&& data.type) {
            this.viewNode.Effect.PlayEff(4164130)
        }
        this._data = data;
        if(data.type){
            this.visible=true;
            UH.SetText(this.viewNode.TxtAttrName, AttrListName[data.type] + "：");
            UH.SetText(this.viewNode.TxtAttrNum, AttrHelper.Percent(data.type, data.value));
            let colorNum = PetData.Inst().GetGemQualityByTypeAndValue(data.type,data.value);
            if(colorNum)
                this.viewNode.TxtAttrNum.color = colorNum;
            this.viewNode.Tog.selected = data.flag == 1;
        }else{
            this.visible=false;
        }
    }

    private onChangeFlag() {
        if (this._data)
            PetData.Inst().changeWashFlag(this._data.index);
    }
}
import { BaseView, ViewLayer, ViewMask, viewRegcfg } from "modules/common/BaseView";
import * as fgui from "fairygui-cc";
import { PetData, PetGemData } from "./PetData";
import { UH } from "../../helpers/UIHelper";
import { CfgPetData } from "config/CfgPet";
import { Item } from "modules/bag/ItemData";
import { CfgAttrUp } from "config/CfgCommon";
import { ViewManager } from "manager/ViewManager";
import { AttrItemCell } from "modules/common_item/AttrItem";
import { TextHelper } from "../../helpers/TextHelper";
import { AttrListName, Language } from "modules/common/Language";
import { PetGemLvItem } from "./PetGemView";
import { AttrHelper } from "../../helpers/AttrHelper";
import { Log } from "core/Debugger";
import { COLORS } from "modules/common/ColorEnum";

@BaseView.registView
export class PetGemInfoView extends BaseView {
    private pet_gem_data: PetGemData;
    private list_data:any[];

    protected viewRegcfg: viewRegcfg = {
        UIPackName: "PetGemInfo",
        ViewName: "PetGemInfoView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };

    protected viewNode = {
        Bg: <fgui.GImage>null,
        TxtTitle: <fgui.GTextField>null,
        GemCell: <PetGemLvItem>null,
        BtnClose: <fgui.GButton>null,
        ListAttr: <fgui.GList>null,
        ListBg: <fgui.GImage>null,
    }
    protected extendsCfg = [
        { ResName: "PetGemAttrCell", ExtendsClass: AttrItemCell2 },
    ];

    InitData(data: PetGemData) {
        this.AddSmartDataCare(PetData.Inst().ResultData, this.FlushData.bind(this), "is_ts_gem_change");
        this.viewNode.ListAttr.itemProvider = this.GetListItemResource.bind(this);
        this.viewNode.ListAttr.setVirtual();
        this.pet_gem_data = data;
        
        
        this.FlushData();
    }

    private FlushData() {
        let data: PetGemData = this.pet_gem_data;
        if (!data)
            return;
        this.viewNode.GemCell.SetData(data);
        this.viewNode.BtnClose.onClick(this.closeView.bind(this));
        let attr:any[]=[];
        attr.push(Language.Common.basic_attr);
        let is_ts = data.item_id == PetData.Inst().GetTsGemId();
        let item_id = data.item_id;
        if (is_ts) {
            let gem = PetData.Inst().GetGemInfo(data.bag_index);
            if (gem) {
                let cfg = CfgPetData.pet_ts_gem[gem.gemLevel - 1];
                item_id = cfg.to_item_id;
                attr = attr.concat(cfg.up_att);
                if (gem.attrType.length>0){
                    attr.push(Language.Common.add_attr);
                }
                for (let i = 0; i < gem.attrType.length; i++) {
                    attr.push({is_ts:1,data:new CfgAttrUp(gem.attrType[i], gem.attrValue[i])});
                }
                if (gem.attrType.length > 0) {
                    this.viewNode.Bg.height = 763;
                    this.viewNode.ListBg.height = 440;
                    this.viewNode.ListAttr.height=400;
                } else {
                    this.viewNode.Bg.height = 563;
                    this.viewNode.ListBg.height = 244;
                    this.viewNode.ListAttr.height = 210;
                }
            }
        } else {
            let cfg = PetData.Inst().GetPetGemCfg()[data.item_id];
            attr=attr .concat (cfg.up_att);
            this.viewNode.Bg.height = 563;
        }
        this.list_data=attr;
        this.viewNode.ListAttr.SetData(attr);
        this.viewNode.ListAttr.refreshVirtualList();
        UH.SetText(this.viewNode.TxtTitle, Item.GetName(item_id), Item.QuaColor(item_id));
        this.viewNode.TxtTitle.strokeColor = Item.QuaColorOL(data.item_id)
    }

    private GetListItemResource(index: number) {
        let data = this.list_data[index];
        if (typeof (data) == "string")
            return fgui.UIPackage.getItemURL("CommonItem", "AttrTitleCell");
        else 
            return fgui.UIPackage.getItemURL("PetGemInfo", "PetGemAttrCell");
    }

    closeView(){
        ViewManager.Inst().CloseView(PetGemInfoView);
    }

    InitUI() {
    }
}

export class AttrItemCell2 extends fgui.GComponent {
    private viewNode = {
        TxtName: <fgui.GTextField>null,
        TxtNum: <fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data:any) {
        if(data.is_ts){ //洗练出来的属性才会变化颜色
            UH.SetText(this.viewNode.TxtName, AttrListName[data.data.type] + ":");
            UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.data.type, data.data.add));
            let colorNum = PetData.Inst().GetGemQualityByTypeAndValue(data.data.type,data.data.add);
            if(colorNum)
                this.viewNode.TxtNum.color = colorNum;
        }else{
            this.viewNode.TxtNum.color = COLORS.White;
            UH.SetText(this.viewNode.TxtName, AttrListName[data.type] + ":");
            UH.SetText(this.viewNode.TxtNum, AttrHelper.Percent(data.type, data.add));
        }
        
    }
}

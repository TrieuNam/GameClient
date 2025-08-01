import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { BagData } from "modules/bag/BagData";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { GemIconCfg, GemShowPos } from "./GemAtelierConfig";
import { GemAtelierCtrl, GEM_ATELIER_REQ_TYPE } from "./GemAtelierCtrl";
import { GemAtelierData } from "./GemAtelierData";
import { GemLevelShowCell } from "./GemAtelierInsetView";
import { GemAtelierOneKeyView } from "./GemAtelierOneKeyView";
import { GemShowItem } from "./GemChangeTargetView";

@BaseView.registView 
export class GemAtelierGemUpView extends BaseView {
    private show_list:any
    private target:any
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "GemAtelierUpGrade",
        RelyOnPack: ["GemAtelierInset"],
        ViewName: "GemAtelierGemUpView",
        LayerType: ViewLayer.Normal,
        ViewMask :ViewMask.BgBlockClose,
    };
    protected extendsCfg = [
        { ResName: "GemShowItem", ExtendsClass: GemShowItem },
        { ResName: "GemShowPart", ExtendsClass: GemShowPart },
        { ResName: "LevelShowCell", ExtendsClass: GemLevelShowCell },
    ]
    protected viewNode = {
        Board: <CommonBoard3>null,
        GemShow: <GemShowPart>null,
        GemList: <fgui.GList>null,
        BtnUp: <fgui.GButton>null,
        BtnOneKey: <fgui.GButton>null,

        next_name: <fgui.GLabel>null,
        need_num_show: <fgui.GLabel>null,
        can_level_up: <fgui.GLabel>null,
    };

    InitData() {
        this.viewNode.Board.SetData(new BoardData(GemAtelierGemUpView,Language.GemAtelier.UpGradeTitle));
        this.viewNode.GemList.on(fgui.Event.CLICK_ITEM,this.OnClickGemList,this);
        this.viewNode.BtnUp.onClick(this.OnClickGemUp, this);
        this.viewNode.BtnOneKey.onClick(this.OnClickGemOneKeyUp, this);

        this.AddSmartDataCare(BagData.Inst().BagItemData, this.flushGemList.bind(this), "GemItemChange");
        
        this.flushGemList()
    }
    CloseCallBack(){

    }
    private flushGemList() {
        this.viewNode.GemList.clearSelection()

        this.show_list = GemAtelierData.Inst().GetGemUpList()
        this.viewNode.GemList.SetData(this.show_list)

        this.FlushGemShow()
    }

    private OnClickGemList(item:GemShowItem) {
        this.target = item.data
        this.FlushGemShow()
    }

    private FlushGemShow() {
        this.viewNode.GemShow.SetData(this.target)    

        this.viewNode.next_name.visible = this.target!=null
        this.viewNode.need_num_show.visible = this.target!=null
        this.viewNode.can_level_up.visible = this.target!=null
        
        if(this.target!=null){
            
            let item_cfg =Item.GetConfig(this.target.item_id)
            let num = Item.GetNum(this.target.item_id)
            let next_item = item_cfg.id 
            let need = 3
            let level = item_cfg.gem_level
            
            UH.SetText(this.viewNode.next_name,Item.GetName(next_item))
            UH.SetText(this.viewNode.need_num_show,TextHelper.Format(Language.GemAtelier.GemUpNeed,need,level))
            this.viewNode.can_level_up.visible = num >= need
        }
    }

    private OnClickGemUp() {
        if(this.target == null)
        {
            PublicPopupCtrl.Inst().Center(Language.GemAtelier.GemUpEmpty)
            return 
        }
        

        GemAtelierCtrl.Inst().SendCSGemReq(GEM_ATELIER_REQ_TYPE.LEVEL_UP,{
            param1:this.target.item_id,
            // param2:0,
        })
        let num = BagData.Inst().getItemNum(this.target.item_id)
        if(num >= 3)
        {
            this.target = null
        }
        
    }

    private OnClickGemOneKeyUp() {
        ViewManager.Inst().OpenView(GemAtelierOneKeyView);
    }
}

// {item_id;}
export class GemShowPart extends fgui.GComponent {
    private viewNode = {
        GemShow: <fgui.GLoader>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }
    public SetData(data: any) {
        if (data == null) {
            this.viewNode.GemShow.visible = false
            return;
        }

        this.data = data
        this.viewNode.GemShow.visible = true
        let icon = GemIconCfg["id_" +data.gem_id]
        let pos = GemShowPos["id_" +data.gem_id]

        
        this.viewNode.GemShow.visible = icon != null
        if(icon){
            this.viewNode.GemShow.setPosition(pos.x,pos.y)
            UH.SpriteName(this.viewNode.GemShow, "GemAtelierUpGrade", icon)
        }
        
    }
}

import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { BaseView, viewRegcfg, ViewLayer, ViewMask } from "modules/common/BaseView";
import { ICON_TYPE } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisView } from "modules/CoreCrisis/CoreCrisisView";
import { GetWayData } from "modules/getway/GetWayData";
import { ItemInfoView } from "modules/item_info/ItemInfoView";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { ShopCtrl } from "modules/shop/ShopCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { StarMapCtrl, STAR_MAP_REQ_TYPE } from "./StarMapCtrl";
import { StarMapData } from "./StarMapData";

@BaseView.registView
export class StarMapOneKeyView extends BaseView {
    protected viewRegcfg: viewRegcfg = {
        UIPackName: "StarMapExtra",
        ViewName: "StarMapOneKeyView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose,
    };
    protected viewNode = {
        Board:<CommonBoard3>null,
        num_1:<fgui.GLabel>null,
        num_2:<fgui.GLabel>null,
        num_3:<fgui.GLabel>null,
        icon_1:<fgui.GLoader>null,
        icon_2:<fgui.GLoader>null,
        icon_3:<fgui.GLoader>null,
        BtnSure:<fgui.GButton>null,
    }
    private param:any
    //private UpLevelNum = 0;
    private satrList: any;
    InitData(param:{type:number,grade:number}) {
        this.viewNode.Board.SetData(new BoardData(StarMapOneKeyView, Language.GemAtelier.GemOneKeyUp));
        this.viewNode.BtnSure.onClick(this.OnClickSure.bind(this));
        this.satrList = StarMapData.Inst().GetIsUpLevel(param.type,param.grade)
        this.param = StarMapData.Inst().StarMapOneKeyCheck(param.type,param.grade)
        UH.SetText(this.viewNode.num_1, this.param.num_1)
        UH.SetText(this.viewNode.num_2, this.param.num_2)
        UH.SetText(this.viewNode.num_3, this.param.num_3)
        UH.SetIcon(this.viewNode.icon_1, this.param.icon_1,ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.icon_2, this.param.icon_2,ICON_TYPE.ITEM)
        UH.SetIcon(this.viewNode.icon_3, this.param.icon_3,ICON_TYPE.ITEM)

    }

    OnClickSure()
    {
        let num = Item.GetNum(this.param.key_item)
        let config = Item.GetConfig(this.param.key_item);
        let list = GetWayData.Inst().GetWayList(config.get_way);
        // let needArr = [];
        // for(let i = 0;i < this.satrList.length;i++){
        //     needArr.push(this.satrList.list[i].id)
        // }
        if(num <  this.param.num_3 &&  this.param.num_3 > 0)
        {
            PublicPopupCtrl.Inst().Center(TextHelper.Format(Language.Mount.LevelUpItemLackError,
                Item.GetName(this.param.key_item), list[0].desc));

            let show_call = Item.Create({ item_id: this.param.key_item, num: this.param.num_3 - num })
            ViewManager.Inst().OpenView(ItemInfoView, show_call);
            return 
        }

        if(this.param.num_2 > 0)
        {
            // ShopCtrl.Inst().SendBuyReq(this.param.send_index, this.param.num_2);
            StarMapCtrl.Inst().SendCSStarMapReq(STAR_MAP_REQ_TYPE.LEVEL_UP_ONE_KEY,{
                param1:this.param.type,
                param2:this.param.grade,
                paramlist:this.satrList,
                param4:this.param.send_index,
                param5:this.param.num_2
            })
        }
        else {
            StarMapCtrl.Inst().SendCSStarMapReq(STAR_MAP_REQ_TYPE.LEVEL_UP_ONE_KEY,{
                param1:this.param.type,
                param2:this.param.grade,
                paramlist:this.satrList,
              
            })
        }

        
        StarMapData.Inst().JumpAttrFromOneKey(this.param.type,this.param.grade,this.satrList)
        ViewManager.Inst().CloseView(StarMapOneKeyView)
    }
}
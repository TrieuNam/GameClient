import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ViewManager } from "manager/ViewManager";
import { UH } from "../../helpers/UIHelper";
import { TextHelper } from "../../helpers/TextHelper";
import { Language } from 'modules/common/Language';
import { ItemCell } from "modules/extends/ItemCell";
import { CfgItem } from "config/CfgCommon";
import { DungeonCtrl, LINGZHU_OP_TYPE } from "modules/dungeon/DungeonCtrl";
import { DungeonData } from "modules/dungeon/DungeonData";
import { COLORSTR } from "modules/common/ColorEnum";
import { Mod } from 'modules/common/ModuleDefine';
import { BoardData } from 'modules/common_board/BoardData';
import { Item } from "modules/bag/ItemData";
import { CommonId } from "modules/common/CommonEnum";
import { BagData } from "modules/bag/BagData";
import { ChiefDungeonView } from "modules/dungeon/ChiefDungeonView";
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';

@BaseView.registView 
export class ChiefDungeonMopView extends BaseView {
    private item_list:any;
    private target_seq :number
    private is_quick :boolean
    private view_param:any
    private count:number
    // 大坑：同一个包只能启动唯一一个界面
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "DungeonExtra",
        ViewName: "ChiefDungeonMopView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        Board:<CommonBoard3>null,
        RewardList: <fgui.GList>null,     
        Cost: <fgui.GGroup>null,
        CostImage : <fgui.GLoader>null,
        Num: <fgui.GLabel>null,
        BtnSure: <fgui.GButton> null,
        TimeShow: <fgui.GLabel>null,
    }
    InitData(param:any){

        this.viewNode.Board.SetData(new BoardData(ChiefDungeonMopView, param.name));
        this.view_param = param
    
    }

    InitUI() {
        this.item_list = this.view_param.item_list
        // this.viewNode.RewardList.SetData(this.item_list)
        this.viewNode.RewardList.itemRenderer = this.onRenderItem.bind(this);
        this.viewNode.RewardList.numItems = this.item_list.length;

        UH.SetText(this.viewNode.TimeShow, TextHelper.Format(Language.Dungeon.TodayLastTime, this.view_param.last_time));

        this.viewNode.Cost.visible = !this.view_param.is_free
        // UH.SpriteName(this.viewNode.CostImage,"Dungeon","jkj");
        UH.GoldIcon(this.viewNode.CostImage,CommonId.Diamond)
        UH.SetText(this.viewNode.Num, this.view_param.cost_num);

        this.viewNode.BtnSure.onClick(this.ClickSure.bind(this));
        this.target_seq = this.view_param.param_seq
        this.is_quick = this.view_param.is_quick
        this.count = this.view_param.count
    }
    private onRenderItem(index: number, item: ItemCell) {
        item.SetData(Item.Create({item_id:this.item_list[index].item_id,num:this.item_list[index].num},{is_num :true}));//);
    }

    private CloseView() {
        ViewManager.Inst().CloseView(ChiefDungeonMopView)
    }

    private ClickSure(){
        let num = BagData.Inst().getItemNum(CommonId.Diamond)
        if(num < this.view_param.cost_num){
            PublicPopupCtrl.Inst().Center(Language.Dungeon.DiamondLack)
            return 
        }

        // LogError("?count !",this.count)
        DungeonCtrl.Inst().SendCSLingZhuReq(LINGZHU_OP_TYPE.Mop,this.target_seq,this.count)

        this.CloseView()
    }
}
import { LogError } from 'core/Debugger';
import { _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { BaseView, boardCfg, ViewLayer, ViewMask, viewRegcfg } from 'modules/common/BaseView';
import { CommonBoard3 } from "modules/common_board/CommonBoard3";
import { DuoBaoTypeBtn, LoopMineView } from './LoopMineView';
import { ViewManager } from 'manager/ViewManager';
import { ItemCell } from 'modules/extends/ItemCell';
import { UH } from '../../helpers/UIHelper';
import { Language } from 'modules/common/Language';
import { BoardData } from 'modules/common_board/BoardData';
import { LoopMineData } from './LoopMineData';
import { LoopMineRecordView } from './LoopMineRecordView';
import { Item } from 'modules/bag/ItemData';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { LoopMineCtrl, DUO_BAO_REQ_TYPE } from './LoopMineCtrl';
import { ICON_TYPE } from 'modules/common/CommonEnum';
import { AudioManager, AudioTag } from 'modules/audio/AudioManager';
import { TextHelper } from '../../helpers/TextHelper';
import { CommonButtonBuy } from 'modules/common_button/CommonButtonBuy';

@BaseView.registView 
export class LoopMineResult extends BaseView {
    private cache_one_flag:boolean
    private cache_ten_flag:boolean
    private param:any    
    protected viewRegcfg:viewRegcfg = {
        UIPackName: "LoopMineExtra",
        ViewName: "LoopMineResult",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    protected viewNode = {
        BtnOne:<fgui.GButton>null,
        BtnTen:<CommonButtonBuy>null,
        RewardList:<fgui.GList>null,
        ClickJump:<fgui.GGraph>null,
        ShowJump:<fgui.GImage>null,
        CostNum1:<fgui.GLabel>null,
        CostNum2:<fgui.GLabel>null,
        CostItem1:<fgui.GLoader>null,
        CostItem2:<fgui.GLoader>null,
    }
    protected extendsCfg = [
        { ResName: "RewardShow", ExtendsClass: LoopRewardCell },
    ]

    InitData(data:any) {
        this.param = data
        let flush_param = LoopMineData.Inst().GetLoopParam(this.param.show_type);
        let surplus = 0;
        for(let i = 0;i<flush_param.itemlist.length;i++){
            surplus += flush_param.itemlist[i].last_time;
        }
        let Num = surplus < 10 ? surplus:10;
        let btnTitle = TextHelper.Format(Language.LoopMine.BtnTitle,Num);
        this.viewNode.BtnTen.SetTitle(btnTitle);
        let item_param =  LoopMineData.Inst().GetItemParam(this.param.show_type,Num)
        UH.SetIcon(this.viewNode.CostItem1, item_param.item_id, ICON_TYPE.ITEM);
        UH.SetIcon(this.viewNode.CostItem2, item_param.item_id, ICON_TYPE.ITEM);
        this.cache_one_flag = item_param.flag_one
        this.cache_ten_flag = item_param.flag_ten
        UH.SetText(this.viewNode.CostNum1,item_param.one_str)
        UH.SetText(this.viewNode.CostNum2,item_param.ten_str)

        this.viewNode.BtnOne.onClick(this.OnClickOne.bind(this));
        this.viewNode.BtnTen.onClick(this.OnClickTen.bind(this));
        this.viewNode.ClickJump.onClick(this.OnClickJump.bind(this));

        this.viewNode.ShowJump.visible = LoopMineData.Inst().GetJumpPlay()

        this.viewNode.RewardList.SetData(this.param.reward)
        
    }
    private OnClickJump() {
        LoopMineData.Inst().SetJumpPlay(!this.viewNode.ShowJump.visible)
        this.viewNode.ShowJump.visible = !this.viewNode.ShowJump.visible
    }
    private OnClickOne() {
        if(!this.cache_one_flag){
            PublicPopupCtrl.Inst().Center(Language.LoopMine.ItemLackError);
            return 
        }
        if(!LoopMineData.Inst().WithDrawTime(this.param.show_type)){
            PublicPopupCtrl.Inst().Center(Language.LoopMine.NeedReflush);
            return 
        }

        LoopMineData.Inst().SetLoopMark(this.param.show_type,1)
        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.DRAW,{param1:this.param.show_type,param2:1})
        ViewManager.Inst().CloseView(LoopMineResult)
    }
    private OnClickTen() {
        if(!this.cache_ten_flag){
            PublicPopupCtrl.Inst().Center(Language.LoopMine.ItemLackError);
            return 
        }
        if(!LoopMineData.Inst().WithDrawTime(this.param.show_type)){
            PublicPopupCtrl.Inst().Center(Language.LoopMine.NeedReflush);
            return 
        }

        LoopMineData.Inst().SetLoopMark(this.param.show_type,10)
        LoopMineCtrl.Inst().SendCSDuoBaoReq(DUO_BAO_REQ_TYPE.DRAW,{param1:this.param.show_type,param2:10})
        ViewManager.Inst().CloseView(LoopMineResult)
    }
    OpenCallBack() {
        AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
    }
}

export class LoopRewardCell extends fgui.GComponent {
    private viewNode = {
        ItemCall:<ItemCell>null,
        ItemName:<fgui.GLabel>null,
    }
    protected onConstruct() {
        super.onConstruct();
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        if (data == null) { return; }
        this.data = data;
        let item = Item.Create(
            {item_id:data.itemId,num:data.num}, 
            { is_num: true, is_click: false }
        )
        UH.SetText(this.viewNode.ItemName, item.QuaName());
        this.viewNode.ItemCall.SetData(item)
    }
}
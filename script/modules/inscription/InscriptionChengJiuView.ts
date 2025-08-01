import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TrailRewardPreview } from "modules/trial/TrailRewardPreview";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { InscriptionCtrl, Inscription_CJ_TYPE } from "./InscriptionCtrl";
import { InscriptionData } from "./InscriptionData";

@BaseView.registView
export class InscriptionChengJiuView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "InscriptionChengJiu",
        ViewName: "InscriptionChengJiuView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    private reward_data : any;
    private rechagre_data : any;
    private phase = 1

    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        // Name: <fgui.GTextField>null,
        RewardList:<fgui.GList> null,
        // StarNum:<fgui.GTextField> null,
        BtnBuy:<fgui.GButton> null,
        BtnYiJian:<fgui.GButton> null,
        BtnRewardShow:<fgui.GButton> null,
        BtnClose:<fgui.GButton> null,
    };

    protected extendsCfg = [
        // { ResName: "CaveLootTaskItem", ExtendsClass: CaveLootTaskItem },
        { ResName: "InscriptionChengJiuRender", ExtendsClass: InscriptionChengJiuRender },
        { ResName: "InscriptionChengJiuCell", ExtendsClass: InscriptionChengJiuCell },

    ]; 

    InitData() {
        this.data = InscriptionData.Inst()
        this.viewNode.RewardList.itemRenderer = this.renderTaskListItem.bind(this);
        this.viewNode.RewardList.setVirtual();
        this.viewNode.BtnBuy.onClick(this.OnClickJingJie.bind(this));
        this.viewNode.BtnYiJian.onClick(this.OnClickYiJian.bind(this));
        this.viewNode.BtnRewardShow.onClick(this.OnClickJiangLi.bind(this));
        this.viewNode.BtnClose.onClick(this.OnClickClose.bind(this));

        this.AddSmartDataCare(InscriptionData.Inst().flush_info, this.FlushAllInfo.bind(this), "chengjiu_info");
    }

    InitUI() {
        this.FlushAllInfo()
    }
    
    private FlushAllInfo(){
        this.FlushRewardView();
        this.FlushOtherInfo();
    }
    
    public FlushRewardView(){
        this.reward_data = this.data.GetChengJiuRewardData(this.phase);
        this.viewNode.RewardList.numItems = this.reward_data.length;
    }

    public FlushOtherInfo(){
        let money_data = this.data.GetChengJiuCost(this.phase);
        let money = money_data[0].buy_money / 10;
        this.viewNode.BtnBuy.title = money.toString();

        this.viewNode.BtnBuy.visible = !this.data.GetChengJiuPhaseBuy(this.phase);
    }

    private renderTaskListItem(index: number, item: InscriptionChengJiuRender) {
        item.SetData(this.reward_data[index]);
    }

    private OnClickJingJie(){
        let money_data = this.data.GetChengJiuCost(this.phase);
        let money = money_data[0].buy_money;
        let order_data = Order_Data.initOrder(this.phase, ACTIVITY_TYPE.InscripeChengJiu, money / 10, money, "");
        OrderCtrl.generateOrder(order_data);
    }

    private OnClickYiJian(){
        // LogError("OnClickYiJian");
        InscriptionCtrl.Inst().SendChengJiuReq(Inscription_CJ_TYPE.YIJIAN);
    }

    private OnClickJiangLi(){
        let param = {
            common_list : InscriptionData.Inst().GetRewardPreviewShowData(1),
            special_list : InscriptionData.Inst().GetRewardPreviewShowData(2),
        };
        ViewManager.Inst().OpenView(TrailRewardPreview,param);
    }

    private OnClickClose(){
        ViewManager.Inst().CloseView(InscriptionChengJiuView);
    }
}


export class InscriptionChengJiuRender extends fgui.GComponent {
    private viewNode = {
        Num: <fgui.GTextField> null,
        Common:<InscriptionChengJiuCell> null,
        Higher1:<InscriptionChengJiuCell> null,
        Higher2:<InscriptionChengJiuCell> null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
    }

    public SetData(data: any) {
        this.data = data;
        let pass_level = InscriptionData.Inst().GetPassLevel();
        UH.SetText(this.viewNode.Num, data.num);
        
        UH.ActivatorPosition(this.viewNode.Higher1,(data.higher_reward.length == 1 ),500,-1,448,-1);
        this.viewNode.Higher2.visible = this.data.higher_reward.length != 1
        // LogError("InscriptionChengJiuRender  data = " , data)
        // LogError("length = "+this.data.higher_reward.length)
        if (this.data.higher_reward.length == 1){

            this.viewNode.Common.SetData({item:data.reward,is_get:InscriptionData.Inst().GetChengJiuCommonGet(data.seq),is_lock:data.num > pass_level,seq:data.seq});
            this.viewNode.Higher1.SetData({item:data.higher_reward[0],is_get:InscriptionData.Inst().GetChengJiuHigherGet(data.seq),is_lock:data.num > pass_level || !InscriptionData.Inst().GetChengJiuPhaseBuy(this.data.phase),seq:data.seq});
        }else{
            this.viewNode.Common.SetData({item:data.reward,is_get:InscriptionData.Inst().GetChengJiuCommonGet(data.seq),is_lock:data.num > pass_level,seq:data.seq});
            this.viewNode.Higher1.SetData({item:data.higher_reward[0],is_get:InscriptionData.Inst().GetChengJiuHigherGet(data.seq),is_lock:data.num > pass_level || !InscriptionData.Inst().GetChengJiuPhaseBuy(this.data.phase),seq:data.seq});
            this.viewNode.Higher2.SetData({item:data.higher_reward[1],is_get:InscriptionData.Inst().GetChengJiuHigherGet(data.seq),is_lock:data.num > pass_level || !InscriptionData.Inst().GetChengJiuPhaseBuy(this.data.phase),seq:data.seq});
        }

    }
}

export class InscriptionChengJiuCell extends fgui.GComponent {
    private viewNode = {
        Cell:<ItemCell> null,
        redPoint:<RedPoint> null,
        get:<fgui.GGroup> null,
        lock:<fgui.GGroup> null,
        BtnGet:<fgui.GButton> null,
        effect:<UIEffectShow> null
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
    }

    public SetData(data: any) {
        this.data = data;
        this.viewNode.Cell.SetData(Item.Create(data.item,{ is_click: true ,is_num: true}));
        this.viewNode.lock.visible = data.is_lock;
        this.viewNode.get.visible = data.is_get;
        this.viewNode.BtnGet.visible = !data.is_get && !data.is_lock;
        this.viewNode.redPoint.SetNum((!data.is_get && !data.is_lock) ? 1 : 0);
        if (!data.is_get && !data.is_lock){
            this.viewNode.effect.PlayEff(4164011)
        }else{
            this.viewNode.effect.StopEff(4164011)
        }
    }

    

    // private TaskrenderListItem(index: number, item: ItemCell) {
    //     item.SetData(Item.Create(this.data.reward_item[index],{ is_num: true}));
    // }
    private OnClickGet(){
        // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
        // CaveLootData.Inst().SendTaskGift(this.data.task_type)
        LogError("OnClickGet this.data.seq = "+this.data.seq);
        InscriptionCtrl.Inst().SendChengJiuReq(Inscription_CJ_TYPE.FETCH,this.data.seq);
    }
}


import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { CaveLootRechargeItem, CaveLootShopItem } from "modules/caveloot/CaveLootActivityView";
import { CaveLootData } from "modules/caveloot/CaveLootData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { Language } from "modules/common/Language";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { ItemCell } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TextHelper } from "../../helpers/TextHelper";
import { UH } from "../../helpers/UIHelper";
import { TrailRewardPreview } from "./TrailRewardPreview";
import { Trail_CJ_TYPE, TrialCtrl } from "./TrialCtrl";
import { TrialData } from "./TrialData";

@BaseView.registView
export class TrailChengJiuView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "TrailChengJiu",
        ViewName: "TrailChengJiuView",
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
        StarNum:<fgui.GTextField> null,
        BtnJIngJie:<fgui.GButton> null,
        BtnYiJian:<fgui.GButton> null,
        BtnJiangLi:<fgui.GButton> null,
        BtnClose:<fgui.GButton> null,
    };

    protected extendsCfg = [
        // { ResName: "CaveLootTaskItem", ExtendsClass: CaveLootTaskItem },
        { ResName: "TrailChengJiuRender", ExtendsClass: TrailChengJiuRender },
        { ResName: "TraiChengJiuItem", ExtendsClass: TraiChengJiuItem },

    ]; 

    InitData() {
        this.data = TrialData.Inst()
        this.viewNode.RewardList.itemRenderer = this.renderTaskListItem.bind(this);
        this.viewNode.RewardList.setVirtual();
        this.viewNode.BtnJIngJie.onClick(this.OnClickJingJie.bind(this));
        this.viewNode.BtnYiJian.onClick(this.OnClickYiJian.bind(this));
        this.viewNode.BtnJiangLi.onClick(this.OnClickJiangLi.bind(this));
        this.viewNode.BtnClose.onClick(this.OnClickClose.bind(this));

        this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushAllInfo.bind(this), "TrialChengJiuInfo");
    }

    InitUI() {
        this.FlushAllInfo()

    }

    private FlushAllInfo(){
        this.FlushRewardView();
        this.FlushOtherInfo();
    }

    public FlushRewardView(){
        this.reward_data = this.data.GetTrailChengJiuRewardData(this.phase);
        this.viewNode.RewardList.numItems = this.reward_data.length;
    }

    public FlushOtherInfo(){
        let money_data = TrialData.Inst().GetTrailChengJiuCost(this.phase);
        let money = money_data[0].buy_money / 10;
        this.viewNode.BtnJIngJie.title =  money.toString();

        let star_num = this.data.GetTrailAllStarNum();
        UH.SetText(this.viewNode.StarNum,star_num);

        this.viewNode.BtnJIngJie.visible = !this.data.GetTrailChengJiuPhaseBuy(this.phase)
    }

    private renderTaskListItem(index: number, item: TrailChengJiuRender) {
        item.SetData(this.reward_data[index]);
    }

    private OnClickJingJie(){
        let money_data = TrialData.Inst().GetTrailChengJiuCost(this.phase);
        let money = money_data[0].buy_money;
        let order_data = Order_Data.initOrder(this.phase, ACTIVITY_TYPE.GuMoChengJiu, money / 10, money, "");
        OrderCtrl.generateOrder(order_data);
    }

    private OnClickYiJian(){
        // LogError("OnClickYiJian");
        TrialCtrl.Inst().SendChengJiuReq(Trail_CJ_TYPE.YIJIAN);
    }

    private OnClickJiangLi(){
        let param = {
            common_list : TrialData.Inst().GetRewardPreviewShowData(1),
            special_list : TrialData.Inst().GetRewardPreviewShowData(2),
        };
        ViewManager.Inst().OpenView(TrailRewardPreview,param);
    }

    private OnClickClose(){
        ViewManager.Inst().CloseView(TrailChengJiuView);
    }
}


export class TrailChengJiuRender extends fgui.GComponent {
    private viewNode = {
        NumBg:<fgui.GLoader> null,
        StarNeed: <fgui.GTextField> null,
        Common:<TraiChengJiuItem> null,
        Higher1:<TraiChengJiuItem> null,
        Higher2:<TraiChengJiuItem> null,

    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        // this.viewNode.BtnLingQu.onClick(this.OnClickGet.bind(this))
    }

    public SetData(data: any) {
        this.data = data;
        let star = TrialData.Inst().GetTrailAllStarNum();
        let sprite_name = star >= this.data.star_num ? "JiangLiZhuangTai1" : "JiangLiZhuangTai2";
        UH.SpriteName(this.viewNode.NumBg, "TrailChengJiu", sprite_name);
        UH.SetText(this.viewNode.StarNeed, data.star_num);
        
        UH.ActivatorPosition(this.viewNode.Higher1,(data.higher_reward.length == 1 ),450,-5,395,-5);
        this.viewNode.Higher2.visible = this.data.higher_reward.length != 1
        // LogError("TrailChengJiuRender  data = " , data)
        // LogError("length = "+this.data.higher_reward.length)
        if (this.data.higher_reward.length == 1){

            this.viewNode.Common.SetData({item:data.reward,is_get:TrialData.Inst().GetTrailChengJiuCommonGet(data.reward_seq),is_lock:data.star_num > star,seq:data.reward_seq});
            this.viewNode.Higher1.SetData({item:data.higher_reward[0],is_get:TrialData.Inst().GetTrailChengJiuHigherGet(data.reward_seq),is_lock:data.star_num > star || !TrialData.Inst().GetTrailChengJiuPhaseBuy(this.data.phase),seq:data.reward_seq});
        }else{
            this.viewNode.Common.SetData({item:data.reward,is_get:TrialData.Inst().GetTrailChengJiuCommonGet(data.reward_seq),is_lock:data.star_num > star,seq:data.reward_seq});
            this.viewNode.Higher1.SetData({item:data.higher_reward[0],is_get:TrialData.Inst().GetTrailChengJiuHigherGet(data.reward_seq),is_lock:data.star_num > star || !TrialData.Inst().GetTrailChengJiuPhaseBuy(this.data.phase),seq:data.reward_seq});
            this.viewNode.Higher2.SetData({item:data.higher_reward[1],is_get:TrialData.Inst().GetTrailChengJiuHigherGet(data.reward_seq),is_lock:data.star_num > star || !TrialData.Inst().GetTrailChengJiuPhaseBuy(this.data.phase),seq:data.reward_seq});
        }

    }

    // private TaskrenderListItem(index: number, item: ItemCell) {
    //     item.SetData(Item.Create(this.data.reward_item[index],{ is_num: true}));
    // }
    // private OnClickGet(){
    //     // AudioManager.Inst().Play(AudioTag.HuoDeJingLi);
    //     CaveLootData.Inst().SendTaskGift(this.data.task_type)
    // }
}

export class TraiChengJiuItem extends fgui.GComponent {
    private viewNode = {
        Cell:<ItemCell> null,
        get:<fgui.GGroup> null,
        lock:<fgui.GGroup> null,
        redPoint:<RedPoint> null,
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
        TrialCtrl.Inst().SendChengJiuReq(Trail_CJ_TYPE.FETCH,this.data.seq);
    }
}


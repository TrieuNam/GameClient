import { LogError } from "core/Debugger";
import * as fgui from "fairygui-cc";
import { ViewManager } from "manager/ViewManager";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { BagData } from "modules/bag/BagData";
import { Equip, Item } from "modules/bag/ItemData";
import { CaveLootRechargeItem, CaveLootShopItem } from "modules/caveloot/CaveLootActivityView";
import { CaveLootData } from "modules/caveloot/CaveLootData";
import { BaseView, ViewLayer, ViewMask } from "modules/common/BaseView";
import { COLORS, COLORSTR } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { AttrListName, Language } from "modules/common/Language";
import { BoardData } from "modules/common_board/BoardData";
import { CommonBoard2 } from "modules/common_board/CommonBoard2";
import { CommonConfirmTipData, CommonConfirmTipView } from "modules/common_help/CommonConfirmTipView";
import { EquipBagCtrl, EQUIP_OP_TYPE } from "modules/EquipBag/EquipBagCtrl";
import { ItemCell, ItemCellEquip } from "modules/extends/ItemCell";
import { RedPoint } from "modules/extends/RedPoint";
import { TimeFormatType, TimeMeter } from "modules/extends/TimeMeter";
import { OrderCtrl, Order_Data } from "modules/recharge/OrderCtrl";
import { UIEffectShow } from "modules/scene_obj_spine/UIEffectShow";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";
import { UH } from "../../helpers/UIHelper";
import { EnchantConversView } from "./EnchantConversView";
import { EnchantCost, EnChantData } from "./EnchantData";

@BaseView.registView
export class EnchantView extends BaseView {

    protected viewRegcfg = {
        UIPackName: "Enchant",
        ViewName: "EnchantView",
        LayerType: ViewLayer.Normal,
        ViewMask: ViewMask.BgBlockClose
    };
    private cache_timer = 0;
    private Item: Equip;
    private level_data :any;
    private list_data :any;
    private Item_vo:any;
    private part_data:any;
    /* protected boardCfg = {
        BoardTitle: Language.Temp.Title,
        TabberCfg: [
            { panel: TempPanel, viewName: "TempPanel", titleName: Language.Temp.TabberTemp },
        ]
    }; */

    protected viewNode = {
        // Name: <fgui.GTextField>null,
        BtnZhuanHua:<fgui.GButton>null,
        Board: <CommonBoard2>null,
        timer:<TimeMeter>null,
        EnchantTime:<fgui.GTextField> null,
        state:<fgui.GTextField>null,
        btn_cancel:<fgui.GButton>null,

        itemnum_1:<fgui.GTextField>null,
        itemnum_2:<fgui.GTextField>null,
        itemnum_3:<fgui.GTextField>null,
        itemnum_4:<fgui.GTextField>null,

        //中部
        ShowCell:<ItemCellEquip>null,
        level:<fgui.GTextField>null,
        Add:<fgui.GTextField>null,
        next:<fgui.GTextField>null,
        desc:<fgui.GTextField>null,
        AddNotMax:<fgui.GGroup>null,
        Pro:<fgui.GProgressBar>null,
        cost_list:<fgui.GList>null,
        cost_num:<fgui.GTextField>null,
        ActiveNum:<fgui.GTextField>null,

        BtnFuMo:<fgui.GButton>null,
    };

    protected extendsCfg = [
        { ResName: "EnchantCostCell", ExtendsClass: EnchantCostCell },
        // { ResName: "TrailChengJiuRender", ExtendsClass: TrailChengJiuRender },
        // { ResName: "TraiChengJiuItem", ExtendsClass: TraiChengJiuItem },

    ]; 

    InitData(item:Equip) {
        this.data = EnChantData.Inst();
        this.Item = item;
        // LogError("item = ",item)

        this.Item_vo = this.Item.Vo()
        // let item_vo =  this.Item.Vo()

        this.viewNode.cost_list.itemRenderer = this.renderTaskListItem.bind(this);
        this.viewNode.cost_list.setVirtual();
        this.viewNode.BtnZhuanHua.onClick(this.OnClickBtnZhuanhua.bind(this));
        this.viewNode.btn_cancel.onClick(this.OnClickCancelEnchant.bind(this));
        this.viewNode.BtnFuMo.onClick(this.OnClickFuMo.bind(this));


        this.viewNode.Board.SetData(new BoardData(EnchantView,Language.Enchant.Title,27));
        this.viewNode.timer.SetCallBack(this.FlushFlushTime.bind(this),this.FlushUpdateTime.bind(this));
        this.AddSmartDataCare(BagData.Inst().BagItemData, this.FlushItemNum.bind(this), "OtherChange");
        this.AddSmartDataCare(EnChantData.Inst().ResultData, this.FlushAllInfo.bind(this), "ChantOneInfo");

        // this.AddSmartDataCare(TrialData.Inst().ResultData, this.FlushAllInfo.bind(this), "TrialChengJiuInfo");
    }

    InitUI() {
        this.FlushAllInfo()
    }
    
    private FlushAllInfo(){
        this.part_data = EnChantData.Inst().GetEquipEnchantLevel(this.Item_vo.equipType)
        this.FlushItemNum();
        this.LevelChangeShow()
        this.FlushFlushTime()
    }

    private FlushItemNum(){
        this.FlushNeedCost();
        this.FlushItemHasShow()
    }

    public FlushNeedCost(){
        this.list_data = EnChantData.Inst().GetEnchantCost(this.Item_vo.equipType,this.part_data.level)
        // LogError("FlushNeedCost  list_data = ",this.list_data)
        this.viewNode.cost_list.numItems = this.list_data.length;
    }


    private FlushItemHasShow(){
        UH.SetText(this.viewNode.itemnum_1,BagData.Inst().getItemNum(EnchantCost.MOFEN))
        UH.SetText(this.viewNode.itemnum_2,BagData.Inst().getItemNum(EnchantCost.FALI))
        UH.SetText(this.viewNode.itemnum_3,BagData.Inst().getItemNum(EnchantCost.SHENGMING))
        UH.SetText(this.viewNode.itemnum_4,BagData.Inst().getItemNum(EnchantCost.MOHE))

    }

    private FlushEquipCell(){
        this.viewNode.ShowCell.SetData(this.Item.Vo(), { is_click: false });
    }

    private LevelChangeShow(){
        this.FlushEquipCell()
        // let item_vo =  this.Item.Vo()
        this.level_data = EnChantData.Inst().GetEquipEnchantLevelData(this.Item_vo.equipType,this.part_data.level)

        //强化介绍
        UH.SetText(this.viewNode.level,TextHelper.Format(Language.Enchant.EnchantLevel,this.part_data.level,this.data.MaxEnchantLevel))
        UH.SetText(this.viewNode.desc,this.level_data.dec2)
        // if (typeof(this.level_data.att_type) == "string"){
        //     let attr_data = this.level_data.att_type.split("|")
        //     let str = ""
        //     for (let i = 0 ; i < attr_data.length ; i ++ ){
        //         str = str + AttrListName[attr_data[i]]
        //     }
        //     UH.SetText(this.viewNode.Add,TextHelper.Format(Language.Enchant.ShowBuffDesc,str,this.level_data.parm/100) )
        // }else{
        //     UH.SetText(this.viewNode.Add,TextHelper.Format(Language.Enchant.ShowBuffDesc,AttrListName[this.level_data.att_type],this.level_data.parm/100) )
        // }

        UH.SetText(this.viewNode.Add,this.level_data.dec + "：" + this.level_data.parm/100)

        // AttrListName[data.type]
        this.viewNode.AddNotMax.visible = this.part_data.level != this.data.MaxEnchantLevel
        if (this.part_data.level != this.data.MaxEnchantLevel){
            let next_data = EnChantData.Inst().GetEquipEnchantLevelData(this.Item_vo.equipType,this.part_data.level + 1)
            UH.SetText(this.viewNode.next,next_data.parm/100 + "%")
        }
       
        //进度条
        this.viewNode.Pro.max = this.level_data.fumo_exp
        this.viewNode.Pro.value = this.part_data.exp

        //花费
        let color = Item.GetNum(CommonId.Gold) >= this.level_data.num1 ? COLORS.White : COLORS.Red1
        UH.SetText(this.viewNode.cost_num,this.level_data.num1)
        this.viewNode.cost_num.color = color
        let active_num = this.data.GetHasEnchantNum()
        if (active_num == 0){
            UH.SetText(this.viewNode.ActiveNum,TextHelper.Format(Language.Enchant.IsActive[1]))
        }else{
            UH.SetText(this.viewNode.ActiveNum,TextHelper.Format(Language.Enchant.IsActive[0],active_num,this.data.MaxEnchantNum))
        }
    }

    private renderTaskListItem(index: number, item: EnchantCostCell) {
        item.SetData(this.list_data[index]);
    }

    private OnClickBtnZhuanhua(){
        ViewManager.Inst().OpenView(EnchantConversView)
    }

    private OnClickCancelEnchant(){
        ViewManager.Inst().OpenView(CommonConfirmTipView, new CommonConfirmTipData(Language.Login.OtherLoginTitle, Language.Enchant.CancelEnchant, () => {
            EquipBagCtrl.Inst().SendEquipReq(EQUIP_OP_TYPE.CancelEnchant,this.Item_vo.equipType)
        }));
    }

    private OnClickFuMo(){
        let num = this.data.GetHasEnchantNum()
        // LogError("num = "+num)
        if ( num == this.data.MaxEnchantNum && EnChantData.Inst().GetIsForthEnchant(this.Item_vo.equipType) ){
            ViewManager.Inst().OpenView(CommonConfirmTipView, new CommonConfirmTipData(Language.Login.OtherLoginTitle, Language.Enchant.StillEnchant, () => {
                EquipBagCtrl.Inst().SendEquipReq(EQUIP_OP_TYPE.Enchant,this.Item_vo.equipType)
            }));
        }else{
            EquipBagCtrl.Inst().SendEquipReq(EQUIP_OP_TYPE.Enchant,this.Item_vo.equipType)
        }

    }

    private FlushFlushTime() {
        this.cache_timer = this.part_data.endTime
        let time = this.cache_timer-TimeCtrl.Inst().ServerTime;
        this.viewNode.timer.visible = time > 0
        let state = time > 0 ? Language.Enchant.State[0] : Language.Enchant.State[1]
        UH.SetText(this.viewNode.state,state)

        this.viewNode.btn_cancel.visible = time > 0
        this.viewNode.timer.TotalTime(time, TimeFormatType.TYPE_TIME_4);
    }
    
    private FlushUpdateTime(realtime:number,total_time:number) {
        let time = Math.max(total_time - realtime, 0);
        let time_t = TimeHelper.FormatDHMS(time);
        let t_str = TextHelper.Format(Language.UiTimeMeter.TimeStr1, time_t.day * 24 + time_t.hour, time_t.minute , time_t.second);
        UH.SetText(this.viewNode.EnchantTime,t_str)
    }
}


export class EnchantCostCell extends fgui.GComponent {
    private viewNode = {
        Cell:<ItemCell> null,
        num:<fgui.GTextField>null,
    };
    protected onConstruct() {
        ViewManager.Inst().RegNodeIofo(this.viewNode, this);
        
        // this.viewNode.BtnGet.onClick(this.OnClickGet.bind(this));
    }
    
    public SetData(data: any) {
        this.data = data;
        this.viewNode.Cell.SetData(Item.Create({item_id:data.item},{is_click:true}))
        let has_num = BagData.Inst().getItemNum(data.item)
        has_num = has_num >= data.num ? data.num : has_num
        let color = has_num >= data.num ? COLORSTR.Yellow2 : COLORSTR.Red1
        UH.SetText(this.viewNode.num,TextHelper.Format(Language.Enchant.NeedNUm,color,has_num,data.num))
    }
}
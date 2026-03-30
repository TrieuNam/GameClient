import { CfgShenQiDuoBao } from "config/CfgShenQiDuoBao";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { smartdata, CreateSMD } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { Item } from "modules/bag/ItemData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { COLORSTR } from "modules/common/ColorEnum";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { BuyConfirmView } from "modules/shop/BuyConfirmView";
import { ShopConfirmData } from "modules/shop/ShopData";
import { off } from "puerts";
import { TextHelper } from "../../helpers/TextHelper";

export enum SHENQIDRAW_REQ_TYPE{
    INFO = 0,               // 请求进度
    BUY_GIFT = 1,           // 购买礼包[seq] -- 直购除外
    FETCH_TASK_REWARD = 2,  // 领取任务奖励[seq]
}

export class ShenQiDrawCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaShenqiDuobao, func: this.onSCRaShenqiDuobao },
        ]
    }
    
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.ShenQiDuoBao,
            ShenQiDrawData.Inst().flush_info,
            ShenQiDrawData.Inst().GetRedNum.bind(ShenQiDrawData.Inst())));
    }

    private onSCRaShenqiDuobao(protocol:PB_SCRaShenqiDuobao)
    {
        LogError("3037?神器夺宝活动下发",protocol)
        ShenQiDrawData.Inst().SetShenQiInfo(protocol)
    }

    public SendShenqiDuobaoReq(operaType:number,param1:number)
    {
        LogError("3000?神器夺宝?2067",operaType,param1)
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.ShenQiDuoBao,operaType,param1,0,0)
    }
}

class  ShenQiDrawInfo {
    @smartdata
    need_flush: number;

}

export class  ShenQiDrawData extends DataBase {
    public flush_info: ShenQiDrawInfo
    private role_level:number
    private tasks_list:IPB_SCRaShenqiDuobaoTask[]
    private gifts_list:IPB_SCRaShenqiDuobaoGift[]
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(ShenQiDrawInfo);
        this.flush_info.need_flush = 0
    }

    public GetRedNum()
    {
        return this.GetTypeRed(0)
    }

    public GetTabList()
    {
        return [
            {title:Language.ShenQiDuoBao.TabTitle[0],type:0},
            {title:Language.ShenQiDuoBao.TabTitle[1],type:1},
        ]
    }


    public GetViewDetail(type:number)
    {
        let result = []
        if(type == 0)
        {
            let opers = this.tasks_list
            for(var index in opers)
            {
                let cfg = this.GetDrawRewardCfg(0,this.role_level,opers[index].taskSeq)
                let rewards: any[] = []
                if(cfg != null)
                {
                    for(var check in cfg.reward_item)
                    {
                        let oper = cfg.reward_item[check]
                        let info = {
                            item_info:{item_id:oper.item_id,num:oper.num}
                        }
                        rewards.push(info)
                    }
                    let is_complete = opers[index].progress>=cfg.parameter
                    let is_got = opers[index].hasFetched
                    let color = opers[index].progress >= cfg.parameter ? COLORSTR.Green4 : COLORSTR.Red1
                    let show_progress = opers[index].progress > cfg.parameter ? cfg.parameter : opers[index].progress
                    let info = {
                        seq:opers[index].taskSeq,
                        title_show:cfg.describe+"( "+TextHelper.ColorStr(show_progress,color)+"/"+cfg.parameter+" )",//"0 "+opers[index].taskSeq+" "+opers[index].progress+"/"+cfg.parameter,                    value:"",
                        oper_str:is_complete ? (is_got ? Language.ShenQiDuoBao.BtnGot : Language.ShenQiDuoBao.BtnWait) : Language.ShenQiDuoBao.BtnDoing,
                        is_complete:is_complete,
                        is_got:is_got,
                        show_type:0,
                        rewards:rewards,
                        price_type:0,
                        price_num:0,
                        need_icon:0,
                        is_limit_buy:false,
                        sort_order:is_complete ? (is_got ? 0 : 2) : 1,
                        is_limit:true,
                        gift_value: "",
                        icon_price: 0,
                        gift_price: 0,
                    } 
                    result.push(info)
    
                    result.sort((a: any, b: any) => {return b.sort_order - a.sort_order})
                }
            }
        }
        else if(type == 1)
        {
            let opers = this.gifts_list
            for(var index in opers)
            {
                let cfg = this.GetDrawGiftCfg(1, this.role_level, opers[index].giftSeq)
                if (cfg != null) {
                    let rewards: any[] = []
                    for(var check in cfg.reward_item)
                    {
                        let oper = cfg.reward_item[check]
                        let info = {
                            item_info:{item_id:oper.item_id,num:oper.num}
                        }
                        rewards.push(info)
                    }
                    // for (var check in cfg.reward_item) {
                    // let oper = cfg.reward_item[check]
                    // LogError("????",oper)
                    // let reward_info = {
                    //     item_info: { item_id: cfg.reward_item.item_id, num: cfg.reward_item.num }
                    // }
                    // rewards.push(reward_info)
                    // }

                    let is_limit_buy = opers[index].buyTimes >= cfg.limit_convert_count && cfg.limit_convert_count > 0
                    let color = opers[index].buyTimes < cfg.limit_convert_count ? COLORSTR.Green4 : COLORSTR.Yellow1

                    let need_icon = 0
                    if (cfg.price_type == 1) {
                        need_icon = Item.GetIconId(CommonId.Diamond)
                    }
                    else if (cfg.price_type == 2) {
                        need_icon = Item.GetIconId(CommonId.Gold)
                    }
                    else if (cfg.price_type == 3) {
                        need_icon = -1
                    }
                    
                    let show_buy = cfg.limit_convert_count - opers[index].buyTimes
                    let title = Language.ShenQiDuoBao.LimitType[cfg.limit_type] + "( " + TextHelper.ColorStr(show_buy, color) + "/" + cfg.limit_convert_count + " )"
                    let info = {
                        seq: opers[index].giftSeq,
                        title_show: title,
                        icon_price: need_icon,
                        gift_price: need_icon > 0 ? Language.ShenQiDuoBao.ValueIconShow : Language.ShenQiDuoBao.ValueShow ,
                        gift_value: cfg.value,
                        value: cfg.value,
                        oper_str: "",
                        is_complete: false,
                        is_got: false,
                        show_type: 1,
                        rewards: rewards,
                        price_type: cfg.price_type,
                        price_num: cfg.price_type == 3 ? cfg.price / 10 : (cfg.price == 0 ? Language.ShenQiDuoBao.Free : cfg.price),
                        is_limit_buy: is_limit_buy,
                        need_icon: need_icon,
                        sort_order: is_limit_buy ? 0 : 1,
                        limit_time: cfg.limit_convert_count - opers[index].buyTimes,
                        is_limit:cfg.limit_type != 1
                    }
                    result.push(info)

                    result.sort((a: any, b: any) => { return b.sort_order - a.sort_order })
                }
            }
        }

        return result
    }

    public SetShenQiInfo(data:PB_SCRaShenqiDuobao)
    {
        this.role_level = data.roleLevel
        this.tasks_list = data.tasks
        this.gifts_list = data.gifts

        this.flush_info.need_flush = this.flush_info.need_flush + 1
    }

    public GetTypeRed(type:number)
    {
        if(this.flush_info.need_flush == 0)
        {
            return 0
        }

        
        if(this.gifts_list == undefined || this.tasks_list == undefined)
        {
            return 0
        }

        if(type == 0)
        {
            let list = this.GetViewDetail(0)
            for(var index in list)
            {
                if(list[index].is_complete && ! list[index].is_got)
                {
                    return 1
                }
            }
        }
        return 0
    }

    // 根据等级区段，类型，seq寻找配置
    public GetDrawRewardCfg(type:number,role_level:number,seq:number)
    {
        let cfg = CfgShenQiDuoBao.reward 
        for(var index in cfg)
        {
            if(role_level <= cfg[index].end_level && role_level >= cfg[index].start_level && seq == cfg[index].seq)
            {
                return cfg[index]
            }
        }

        return null
    }

    public GetDrawGiftCfg(type:number,role_level:number,seq:number)
    {
        let cfg = CfgShenQiDuoBao.gift_configuration
        for(var index in cfg)
        {
            if(role_level <= cfg[index].end_level && role_level >= cfg[index].start_level && seq == cfg[index].seq)
            {
                return cfg[index]
            }
        }

        return null
    }

    public GetPriceItem(type:number)
    {
        if(type == 1){
            return CommonId.Diamond
        }
        else if(type == 2){
            return CommonId.Gold
        }
        else if(type == 3){
            return 0
        }
        else if(type == 4)
        {
            return 0
        }
    }

    public TryBuy(param:any)
    {
        let buy_fun: Function = () => {
            ShenQiDrawCtrl.Inst().SendShenqiDuobaoReq(SHENQIDRAW_REQ_TYPE.BUY_GIFT,param.seq)
        };
        let limit_time = param.limit

        let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
            param.item_id,
            param.num,
            this.GetPriceItem(param.price_type),
            param.price,
            buy_fun,
            limit_time);


        ViewManager.Inst().OpenView(BuyConfirmView,buy_confirm_data)
    }

}
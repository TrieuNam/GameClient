import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { TimeType } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { CfgChaoZhiXianLi } from '../../config/CfgChaoZhiXianLi';
import { TextHelper } from "../../helpers/TextHelper";
import { TimeHelper } from "../../helpers/TimeHelper";

export class AffordPresentCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaChaoZhiXianLiInfo, func: this.onSCRaChaoZhiXianLiInfo },
        ]
    }
    
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.MoreServer.AffordPresent,
            AffordPresentData.Inst().flush_info,
            AffordPresentData.Inst().GetRedNum.bind(AffordPresentData.Inst())));
    }

    private onSCRaChaoZhiXianLiInfo(protocol:PB_SCRaChaoZhiXianLiInfo)
    {
        LogError("3028?超值献礼下发",protocol)
        AffordPresentData.Inst().SetAffordPresentInfo(protocol)
    }
    public SendAffordPresentReq(operaType:number,param1:number)
    {
        LogError("3000?超值献礼领取?2067",operaType,param1)
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.ChaoZhiXianLi,operaType,param1,0,0)
    }
}

class AffordPresentInfo {
    @smartdata
    need_flush: number;

}

export class AffordPresentData extends DataBase {
    public flush_info: AffordPresentInfo
    private base_info = {
        level:0,
        buy_mark:0,
        item_num:[0,0,0,0,0],
    }
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.flush_info = CreateSMD(AffordPresentInfo);
        this.flush_info.need_flush = 0
    }

    public SetAffordPresentInfo(protocol:PB_SCRaChaoZhiXianLiInfo)
    {
        this.base_info.level = protocol.level
        this.base_info.buy_mark = protocol.buyMark
        this.base_info.item_num = protocol.itemNum

        this.flush_info.need_flush = this.flush_info.need_flush + 1
    }

    public GetPresentDetail(){

        let buy_cfg = this.GetBuyCfg()
        let price = buy_cfg.price
        let timer = ActivityData.Inst().GetEndStampTime(ACTIVITY_TYPE.ChaoZhiXianLi);
        let cfg_list = this.GetGiftCfg()
        let date_list = []
        for(var index in cfg_list)
        {
            let info = {
                seq:cfg_list[index].seq,
                item_data:{item_id:cfg_list[index].item_id},
                days:TextHelper.Format(Language.AffordPresent.Days,cfg_list[index].active_times),
                got_flag:this.base_info.item_num[Number(index)] > 0,
                can_get:this.GetTodayGet(cfg_list[index].active_times),
                num_show:this.base_info.item_num[index] == 0 ? 
                (cfg_list[index].num_down == cfg_list[index].num_up ? cfg_list[index].num_up : cfg_list[index].num_down+"~"+cfg_list[index].num_up) 
                : this.base_info.item_num[index]
            }
            date_list.push(info)
        }
        
 
        let can_buy = this.base_info.buy_mark == 0 && this.GetCanBuy()

        return {
            dates:date_list,
            timer:timer,
            price:price /10,
            d_price:buy_cfg.buy_reward_item.num,
            can_buy:can_buy,
        }
    }

    public GetTodayGet(index:number){
        let today = this.GetToday()
        return index <= today && this.base_info.buy_mark == 1
    }

    public GetGiftCfg()
    {
        let cfg = CfgChaoZhiXianLi.gift_configure
        let list = []
        for(var index in cfg)
        {
            if(this.base_info.level >= cfg[index].start_level 
                && this.base_info.level <= cfg[index].end_level)
            {
                list.push(cfg[index])
            }
        }

        list.sort((a: any, b: any) => {return a.seq - b.seq})

        return list
    }

    public GetBuyCfg()
    {
        let cfg = CfgChaoZhiXianLi.buy_configure
        for(var index in cfg)
        {
            if(this.base_info.level >= cfg[index].start_level 
                && this.base_info.level <= cfg[index].end_level)
            {
                return cfg[index]
            }
        }

        return cfg[0]
    }

    public GetToday()
    {
        let act_start = ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.ChaoZhiXianLi);
        let start_t = TimeHelper.FormatDHMS(act_start);
        let today_t = TimeHelper.FormatDHMS(TimeCtrl.Inst().ServerTime);

        // LogError("?start_t",start_t)
        // LogError("?today_t",today_t)
        let day_index = today_t.day - start_t.day + 1

        let check = Math.floor((TimeCtrl.Inst().ServerTime - act_start) / TimeType.TIME_DAY_SECOND_NUM) +1

        return check //day_index
    }

    public GetCanBuy()
    {
        let cfg = CfgChaoZhiXianLi.other[0]
        let day_index = this.GetToday()

        return cfg.buy_times >= day_index
    }

    public GetRedNum()
    {
        if(this.base_info.level == undefined)
        {
            return 0
        }
        let day_index = this.GetToday()
        let buyed = this.base_info.buy_mark == 1

        for(let i = 0;i<5;i++)
        {
            if(this.base_info.item_num[i] == 0 && day_index >= (i+1) && buyed)
            {
                return 1
            }
        }

        return 0
    }
}
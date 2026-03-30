import { CfgBoxManorData } from "config/CfgBoxManor";
import { LogError } from "core/Debugger";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ActivityData } from "modules/activity/ActivityData";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { RoleData } from "modules/role/RoleData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { DataBase } from "../../data/DataBase";
import { TimeHelper } from "../../helpers/TimeHelper";


class BoxManorResultData{
    @smartdata
    result:PB_SCRaChestManorInfo;
}


export class BoxManorData extends DataBase {  
    public ResultData : BoxManorResultData;
    private BoxManorInfo : PB_SCRaChestManorInfo;

    constructor(){
        super();
        this.createSmartData();
    }

    private createSmartData(){
        this.ResultData = CreateSMD(BoxManorResultData);
    }

    public OnBoxManorInfo(data:PB_SCRaChestManorInfo){
        this.ResultData.result = data;
        this.BoxManorInfo = data;
    }

    public GetManorList(){
        let level = this.BoxManorInfo.openLevel || 1//RoleData.Inst().GetRoleLevel()
        let day = this.GetFunOpenDay()
        day = day > 3 ? 3 : day
        let cfg = CfgBoxManorData.reward.filter(cfg => {
            return cfg.start_level <= level && cfg.end_level >= level && cfg.refresh_every_day == day;
        });

        let data = [];
        let info
        for (const cards of cfg ){
            let num = cards.buy_times <= this.GetHasBuyTime(cards.seq)  ? cards.seq : 1000 - cards.seq
            info = {
                seq: cards.seq,
                pai:num,
                start_level: cards.start_level,
                end_level: cards.end_level,
                type: cards.type,
                reward_item:cards.reward_item,
                limit_type: cards.limit_type,
                price_type: cards.price_type,
                gift_color: cards.gift_color,
                gift_name: cards.gift_name,
                buy_money: cards.buy_money,
                buy_times: cards.buy_times,
                original_price: cards.original_price,
            }
            data.push(info);
        }
        data.sort((a: any, b: any) => {
            let sortNumber = 0
            if (a.pai < b.pai) {
                sortNumber = 1;
            }
            if (a.pai > b.pai) {
                sortNumber = -1;
            }
            return sortNumber
        });
        return data
    }


    public GetHasBuyTime(seq:number){
        return this.BoxManorInfo.buyTimes[seq]
    }

    public SendBuyGift(seq:number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.BoxManor,1,seq)
    }

    public GetFunOpenDay(){
        let day = TimeHelper.FormatDHMS(TimeCtrl.Inst().ServerTime - ActivityData.Inst().GetStartStampTime(ACTIVITY_TYPE.BoxManor)).day
        return day + 1
    }
}

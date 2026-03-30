import { CfgCaveLootData } from "config/CfgCaveLoot";
import { LogError } from "core/Debugger";
import { bit } from "core/net/bit";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ArenaData } from "modules/Arena/ArenaData";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { BuyConfirmView } from "modules/shop/BuyConfirmView";
import { ShopConfirmData, ShopData } from "modules/shop/ShopData";
import { DataBase } from "../../data/DataBase";


class LoginResultData{
    @smartdata
    result:PB_SCRaCaveLootInfo;
    // @smartdata
    // flush:boolean;
}


export class CaveLootData extends DataBase {  
    public ResultData : LoginResultData;
    private CaveLootInfo : PB_SCRaCaveLootInfo;
    private mark_parm:any;

    constructor(){
        super();
        this.createSmartData();
    }

    private createSmartData(){
        let self = this;
        self.ResultData = CreateSMD(LoginResultData);
    }

    public GetMainSpecialItemShow(){
        return CfgCaveLootData.rare_item_show
    }
    
    //抽奖配置
    public GetCaveLootOtherConfig(){
        return CfgCaveLootData.luck_draw_configuration[0]
    }

    //距离下次保底剩余次数
    public GetBaoDiTimes(){
        let has_buy = this.CaveLootInfo.lotteryCount    //已抽奖次数
        let max_times = this.GetCaveLootOtherConfig().bao_di_times
        return max_times - has_buy % max_times
    }

    // 1 普通 2 珍稀
    public GetShowProData(type:number){
        let role_level = this.CaveLootInfo.openLevel || 1;
        return CfgCaveLootData.rate_show.filter(cfg => {
            return cfg.name_id == type && cfg.start_level <= role_level && role_level <= cfg.end_level;
        });
    }

    //任务列表
    public GetTaskList(){
        let level = this.CaveLootInfo.openLevel  || 1;
        let cfg = CfgCaveLootData.reward.filter(cfg => {
            return cfg.start_level <= level && level <= cfg.end_level;
        });
        // let B_data = []
        // for (const v of cfg){
        //     for (let i = 0 ; i < this.CaveLootInfo.rewardReceive.length ; i ++){
        //         if (this.CaveLootInfo.rewardReceive[i] == v.task_id && (i == v.task_type )){
        //             B_data.push(v)
        //         }
        //     }
        // }

        let data = [];
        let info
        for (const cards of cfg ){
            let num = (this.GetTaskIsGet(cards.task_id,cards.task_type)) ? cards.type : 1000 - cards.type
            // let num = 0
            if (!this.GetTaskIsGet(cards.task_id,cards.task_type) && this.GetTaskJindu(cards.task_type) >= cards.parameter ){
                num = 2000 - cards.type
            }
            info = {
                // seq: cards.seq,
                pai:num,
                start_level: cards.start_level,
                end_level: cards.end_level,
                type: cards.type,
                reward_item:cards.reward_item,
                task_id: cards.task_id,
                task_type: cards.task_type,
                describe: cards.describe,
                parameter: cards.parameter,
                pretaskid: cards.pretaskid,
                is_refresh: cards.is_refresh,
                // discount: cards.discount,
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

    //任务进度
    public GetTaskJindu(seq:number){
        return this.CaveLootInfo.taskParam[seq]
    }

    //任务奖励是否领取
    public GetTaskIsGet(task_id:number,task_type:number){
        return this.CaveLootInfo.rewardReceive[task_type] > task_id
    }

    //充值奖励列表
    public GetRechargeList(){
        let role_level = this.CaveLootInfo.openLevel || 1//RoleData.Inst().GetRoleLevel()
        let cfg = CfgCaveLootData.recharge.filter(cfg => {
            return cfg.start_level <= role_level && cfg.end_level >= role_level;
        });

        let data = [];
        let info
        for (const cards of cfg ){
            let num = (this.GetRechargeIsGet(cards.seq)) ? cards.seq : 1000 - cards.seq
            info = {
                seq: cards.seq,
                pai:num,
                start_level: cards.start_level,
                end_level: cards.end_level,
                type: cards.type,
                reward_item:cards.reward_item,
                diamond: cards.diamond,
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

    //充值数
    public GetRechargeNum(){
        // return 589
        return this.CaveLootInfo.totalChongzhi
    }

    //充值奖励是否领取
    public GetRechargeIsGet(seq:number){
        return bit.d2b(this.CaveLootInfo.chongzhiReceiveFlag)[32-seq] == 1
        // return false
    }


    public GetShopList(){
        let role_level =  this.CaveLootInfo.openLevel || 1//RoleData.Inst().GetRoleLevel()
        let cfg = CfgCaveLootData.gift_configuration.filter(cfg => {
            return cfg.start_level <= role_level && cfg.end_level >= role_level;
        });

        let data = [];
        let info
        for (const cards of cfg ){
            let num = (cards.limit_convert_count <= this.GetShopItemBuyTime(cards.seq) && cards.limit_type != 1) ? cards.seq : 1000 - cards.seq
            info = {
                seq: cards.seq,
                pai:num,
                start_level: cards.start_level,
                end_level: cards.end_level,
                type: cards.type,
                reward_item:cards.reward_item,
                limit_type: cards.limit_type,
                limit_convert_count: cards.limit_convert_count,
                price_type: cards.price_type,
                diamond_num: cards.diamond_num,
                cfg_or: cards.cfg_or,
                price: cards.price,
                discount: cards.discount,
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

    public GetShopItemBuyTime(seq:number){
        return this.CaveLootInfo.buyTimes[seq]
    }
    
    //总红点
    public GetAllRed(){
        let res = FunOpen.Inst().GetFunIsOpen(Mod.MoreServer.CaveLoot)
        if (!res.is_open || !this.CaveLootInfo) {
            return 0
        }
        let red1 = this.GetTaskRed()
        let red2 = this.GetRechagreRed()
        // LogError(red1 + " + " + red2)
        return (red1 + red2) > 0 ? 1 : 0
    }

    public OnCaveLootInfo(data:PB_SCRaCaveLootInfo){
        this.CaveLootInfo = data
        this.ResultData.result = data
    }

    public SendGetInfo(){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CaveLoot,0)
    }
    //买礼包
    public SendBuyGift(seq:number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CaveLoot,1,seq)
    }
    //抽奖1次
    public SendChouJiangOne(){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CaveLoot,2)
    }
    //抽奖10次
    public SendChouJiangTen(){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CaveLoot,3)
    }
    //领取任务奖励
    public SendTaskGift(task_type:number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CaveLoot,4,task_type)
    }
    //领取充值奖励
    public SendRechargeReward(seq:number){
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.CaveLoot,5,seq)
    }

    
    public MarkItemNotice(param:any){ this.mark_parm = param 
    // this.ResultData.flush = !this.ResultData.flush
    }
    public GetMarkItemNotice(){ return this.mark_parm }
    public ClearItemNotice(){ this.mark_parm = null }

    public GetTaskRed(){
        let task_data = this.GetTaskList()
        for (const info of task_data){
            if (info.parameter <= this.GetTaskJindu(info.task_type) && !this.GetTaskIsGet(info.task_id,info.task_type)){
                return 1
            }
        }
        return 0
    }

    public GetRechagreRed(){
        let recharge_data = this.GetRechargeList()
        for (const info of recharge_data){
            if (info.diamond <= this.CaveLootInfo.totalChongzhi && !this.GetRechargeIsGet(info.seq)){
                return 1
            }
        }
        return 0
    }

    public SendChouJiang(index:number){
        // LogError(index)
        if (index == 1){
            CaveLootData.Inst().SendChouJiangOne()
        }else{
            CaveLootData.Inst().SendChouJiangTen()
        }
    }

    public sendBuy(shop_data: any) {
        let buy_fun: Function = () => {
            if(shop_data.item_id==ArenaData.Inst().GetChallengeCostId()&&ArenaData.Inst().IsChallengeTimeMax()){
                PublicPopupCtrl.Inst().Center(Language.Box.tip5);
            }else{
                // ShopCtrl.Inst().SendBuyReq(shop_data.index);
                this.SendBuyGift(shop_data.seq)
            }
        };
        // LogError("data = ",shop_data)
        // LogError(shop_data)
        let has_buy_time = this.GetShopItemBuyTime(shop_data.seq);
        let limit_time = shop_data.limit_convert_count - has_buy_time
        if (shop_data.limit_type == 1 )[
            limit_time = 99
        ]
        
        let now_money = shop_data.price
        let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
            shop_data.reward_item.item_id,
            shop_data.reward_item.num,
            shop_data.price_type + 40000,
            now_money,
            buy_fun,
            limit_time);
        ViewManager.Inst().OpenView(BuyConfirmView, buy_confirm_data)
    }


}

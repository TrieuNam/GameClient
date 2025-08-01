import { CfgItem } from "config/CfgCommon";
import { CfgWarOrderData } from "config/CfgWarOrder";
import { Log, LogError } from "core/Debugger";
import { bit } from "core/net/bit";
import { CreateSMD, smartdata } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { ContinuePresentCtrl } from "modules/ContinuePresent/ContinuePresentCtrl";
import { RoleData } from "modules/role/RoleData";
import { ServerActivityData } from "modules/serveractivity/ServerActivityData";
import { DataBase } from "../../data/DataBase";
import { DataHelper } from "../../helpers/DataHelper";


export class WarOrderSmartData {
    @smartdata
    WarOrderInfo: PB_SCRaWarOrderInfo;

    // GuMoLayerInfo: PB_SCGuMoPagodaLayerInfo;
    // @smartdata
    // GuMoLayerFlush : boolean = false;
}

export class WarOrderData extends DataBase {  
    //public ResultData : LoginResultData;
    public WarOrderSmartData: WarOrderSmartData;
    private WarOrderInfo:PB_SCRaWarOrderInfo = null;
    private ceshi = true
    constructor(){
        super();
        this.createSmartData();
    }

    private createSmartData(){
        // let self = this;
        this.WarOrderSmartData = CreateSMD(WarOrderSmartData);
    }

    public OnWarOrderInfo(data:PB_SCRaWarOrderInfo){
        this.WarOrderInfo = data;
        this.WarOrderSmartData.WarOrderInfo = data;
        this.GetCurLevel();
        
        // ServerActivityData.Inst().FlushRedPoint()
    }
    //获得活动开启时的角色等级对应的等级奖励表数据
    public GetLevelRewradList(){
        return CfgWarOrderData.grade_reward.filter(cfg =>{
            return this.WarOrderInfo.openLevel >= cfg.open_level && this.WarOrderInfo.openLevel <= cfg.end_level && this.GetTimestampSeq() == cfg.time_seq ;
        });
    }
    //根据当前战令等级以及需要购买的等级获得表数据 
    public GetLevelRewradListByBuyLevel(orderLevel: number,buyLevel: number){   
        let dataList = new Array();
        let index = 0;
        for(let i = orderLevel;i <= orderLevel+ buyLevel -1; i++){
            if(orderLevel >= CfgWarOrderData.other[0].grade_time){
                return;
            }
            dataList.push(CfgWarOrderData.grade_reward[i]);
        }
        return dataList;
    }
    //获取对应时间戳索引的每日任务表 1 每日任务 2每周任务
    public GetTaskListByType(type: number){
        let data;
        let d1 = [];
        let d2 = [];
        if(type == 1){
            data = CfgWarOrderData.dailytask.filter(cfg =>{
                return this.WarOrderInfo.openLevel >= cfg.grade_start && this.WarOrderInfo.openLevel <= cfg.grade_end && this.GetTimestampSeq() == cfg.time_seq;
            });
        }else if(type == 2){
            data = CfgWarOrderData.weeklytasks.filter(cfg =>{
                return this.WarOrderInfo.openLevel >= cfg.grade_start && this.WarOrderInfo.openLevel <= cfg.grade_end && this.GetTimestampSeq() == cfg.time_seq;
            });
        }
        
        for(let i = 0;i < data.length;i++){
            if(this.GetTaskFalg(data[i].seq,type)){
                d1.push(data[i]);
            }else{
                d2.push(data[i]);
            }
        }
        return d2.concat(d1);
    }

    //  //获取对应时间戳索引的每周任务表
    //  public GetWeeklyTasks(){
    //     let data;
    //     let d1 = [];
    //     let d2 = [];
    //     return CfgWarOrderData.weeklytasks.filter(cfg =>{
    //         return this.WarOrderInfo.openLevel >= cfg.grade_start && this.WarOrderInfo.openLevel <= cfg.grade_end && this.GetTimestampSeq() == cfg.time_seq;
    //     });
    // }

    //获得战令等级对应的等级奖励表数据
    public GetOrderRewradList(level: number){
        return CfgWarOrderData.grade_reward.filter(cfg =>{
            return this.WarOrderInfo.openLevel >= cfg.open_grade && this.WarOrderInfo.openLevel <= cfg.end_level && this.GetTimestampSeq() == cfg.time_seq && level ==cfg.open_grade;
        });
    }
    //获取当前时间戳索引
    public GetTimestampSeq(){
        for(let i = 0; i<CfgWarOrderData.reset_time.length;i++){
            if(CfgWarOrderData.reset_time[i].reset_time == this.WarOrderInfo.timeSeqTimestamp){
                return CfgWarOrderData.reset_time[i].seq;
            }
        }
    }
    //获取下个月重置时间戳
    public GetNextMonTime(){
        return this.GetTimestampSeq() + 1 == CfgWarOrderData.reset_time.length? CfgWarOrderData.reset_time[this.GetTimestampSeq()].reset_time : CfgWarOrderData.reset_time[this.GetTimestampSeq()+1].reset_time;
    }

    //展示奖励列表 1 普通 2 高级
    public GetWarOrderRewardShowList(sort_seq:number){ 
        return CfgWarOrderData.item_reward.filter(cfg => {
            return cfg.sort_seq == sort_seq;
        });
    }
    //返回购买等级需要花费多少钻石
    public GetBuyLevelValue(list: any[]): number{
        let value = 0;
        list.forEach(v =>{
            value+= (v.open_exp/CfgWarOrderData.other[0].get_experience);
        });
        return value
    }
    // //当前战令等级
    public GetCurLevel(): number{
        return this.WarOrderInfo.level;
    }
    //获取下一级数据,当满级时 获取最高级的数据
    public GetCurData(){
       for(let i = 0;i < CfgWarOrderData.grade_reward.length; i++){
            if(CfgWarOrderData.grade_reward[i].open_grade == this.GetCurLevel() + 1){
                return CfgWarOrderData.grade_reward[i];
            }
       }
       return CfgWarOrderData.grade_reward[CfgWarOrderData.grade_reward.length - 1];
    }

    //当前索引是否领取type 1 普通 2 高级
    public GetRewardGet(seq:number,type:number){
        if (type == 1 && this.WarOrderInfo != null){
            
            return DataHelper.ToBinary(+WarOrderData.Inst().WarOrderSmartData.WarOrderInfo.commonFetchFalg)[seq] == 1;
        }else if (type == 2 && this.WarOrderInfo != null){
            // return this.LevelFundInfo.seniorFetchFlag.toString(2).split("").reverse().map(Number)[seq]==1;
            return DataHelper.ToBinary(+WarOrderData.Inst().WarOrderSmartData.WarOrderInfo.seniorFetchFalg)[seq] == 1;
        }
        return false
    }
       //任务完成标识 1 每日任务 2 每周任务
    public GetTaskFalg(seq:number,type:number){
        if (type == 1 && this.WarOrderInfo != null){
            return DataHelper.ToBinary(this.WarOrderInfo.dayTaskFalg)[seq] == 1;
        }else if (type == 2 && this.WarOrderInfo != null){
            // return this.LevelFundInfo.seniorFetchFlag.toString(2).split("").reverse().map(Number)[seq]==1;
            return DataHelper.ToBinary(this.WarOrderInfo.weekTaskFalg)[seq] == 1;
        }
        return false
    }
    /**
     * 获取需要购买等级 累计获得的奖励
     * @param buy_level 购买的等级
     * @returns 
     */
    public GetBuyLevelReward(buy_level: number){
        let list = this.GetLevelRewradListByBuyLevel(WarOrderData.Inst().GetCurLevel(),buy_level);
        let dataList: CfgItem[] = [];
        let rewardList:{ [key: number]: number } = {};
        if(list.length){
            for(let v = 0; v<list.length;v++){
                rewardList[list[v].ordinary_item.item_id] = 0;
                for(let j=0;j<list[v].senior_item.length;j++){
                    rewardList[list[v].senior_item[j].item_id] =  0;
                }
            }
            for(let v = 0; v<list.length;v++){
                rewardList[list[v].ordinary_item.item_id] = rewardList[list[v].ordinary_item.item_id] + list[v].ordinary_item.num;
                for(let m=0;m<list[v].senior_item.length;m++){
                    rewardList[list[v].senior_item[m].item_id] =  rewardList[list[v].senior_item[m].item_id] + list[v].senior_item[m].num;
                }
            }
            for (let key in rewardList){
                dataList.push(new CfgItem(+key,rewardList[key]));
            }
           return dataList;
        }else{
            return dataList;
        }
    }

    //任务进度 
    /**
     * 
     * @param type 1 每日任务类型 2 每周任务类型 
     * @returns 
     */
    public GetTaskReceive(type: number){
        if(type == 1){
            return this.WarOrderInfo.dayTaskNum;
        }else if(type == 2){
            return this.WarOrderInfo.weekTaskNum;
        }
    }

    //活动是否结束
    public GetIsActiveOver(){
        // let max = this.GetMaxPause()
        if(this.WarOrderInfo){
            let is_over = true;
            if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.WarOrder) || this.GetLevelRewradList().length < 1) {
                is_over = false;
            }
            return is_over
        }
         return false;
    }

    public GetAllRed(){
       // let max = this.GetMaxPause()
        let red = 0
        if(ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.WarOrder)){
            let data = this.GetLevelRewradList();
            data.forEach(v =>{
                if(this.WarOrderInfo.level >= v.open_grade){
                    if(!this.GetRewardGet(v.seq,1) || (!this.GetRewardGet(v.seq,2) && this.WarOrderInfo.isBuy)){
                        red = 1;
                        return red;
                    }
                }
            })
        }
        return red
    }
    //当前领取list的位置
    public GetLevelListIndex(){
        let data = this.GetLevelRewradList();
        let index =0;
        for(let i = 0;i<data.length;i++){
            if(this.WarOrderInfo.level >= data[i].open_grade){
                if(!this.GetRewardGet(data[i].seq,1) || (!this.GetRewardGet(data[i].seq,2) && this.WarOrderInfo.isBuy)){
                   // index = data[i].seq;
                    return data[i].seq;
                }
            }
        }
        
         return this.GetCurLevel();
       
        
    }
    /**
     * 
     * @param type  1领取等级奖励p1：seq ,2一键领取等级奖励, 3购买等级p1：level
     * @param seq 
     */
    public SendWarOrderReward(type: number,seq?:number){
        if(type == 2 || type == 0){
            ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WarOrder,type);
        }else{
            ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.WarOrder,type,seq);
        }
       
    }
}

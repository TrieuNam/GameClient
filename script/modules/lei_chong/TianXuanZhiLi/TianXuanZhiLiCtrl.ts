import { CfgTianXuanZhiLiData } from "config/CfgTianXuanZhiLi";
import { DataBase } from "data/DataBase";
import { SMDHandle, RemindRegister } from "data/HandleCollectorCfg";
import { smartdata, CreateSMD } from "data/SmartData";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { Mod } from "modules/common/ModuleDefine";
import { FirstChargeData } from "modules/first_charge/FirstChargeCtrl";
import { TimeCtrl } from "modules/time/TimeCtrl";
export enum TianXuan_OP_TYPE{
    INFO = 0, // 0 请求个人活动数据
    BUY_GIFT, // 1 购买礼包（直购除外）[seq]
    FETCH_FREE_GIFT, //领取免费奖励
}
export class TianXuanZhiLiCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaTianXuanGift, func: this.recvSCTianXuanZhiLiInfo}
        ]
    }

    protected initCtrl() {
       // this.handleCollector.Add(SMDHandle.Create(FirstChargeData.Inst().ResultData, LeiChongYouLiData.Inst().FlushIconShow.bind(LeiChongYouLiData.Inst()), "info"));
        this.handleCollector.Add(RemindRegister.Create(Mod.LeiChong.TianXuanZhiLi, TianXuanZhiLiData.Inst().ResultData, TianXuanZhiLiData.Inst().GetRed.bind(TianXuanZhiLiData.Inst())));
    }

    private recvSCTianXuanZhiLiInfo(data: PB_SCRaTianXuanGift) {
       TianXuanZhiLiData.Inst().SetTianXuanInfo(data);
    }

   
}
export class TianXuanResultData{
    @smartdata
    info: PB_SCRaTianXuanGift;
    @smartdata
    closeAct: boolean;
}

export class TianXuanZhiLiData extends DataBase { 
    private result_data: TianXuanResultData;
    private ceshi = true
    constructor(){
        super();
        this.createSmartData();
    }

    private createSmartData(){
        let self = this;
        self.result_data = CreateSMD(TianXuanResultData);
    }
    public SetTianXuanInfo(data: PB_SCRaTianXuanGift) {
        this.result_data.info = data;
        if(this.result_data.info.giftOpenTimestamp <= 0){
            this.result_data.closeAct = !this.result_data.closeAct;
        }
    }
    public get ResultData() {
        return this.result_data;
    }
    //根据等级区间获取相应的基础配置  
    // public GetBaseCfgByLevel(){
    //     let level = RoleData.Inst().GetRoleLevel();
    //     for(let i = 0;i < CfgTianXuanZhiLiData.base_configuration.length; i++){
    //         if(level >= CfgTianXuanZhiLiData.base_configuration[i].level_min && level <= CfgTianXuanZhiLiData.base_configuration[i].level_max){
    //             return CfgTianXuanZhiLiData.base_configuration[i];
    //         }
    //     }
    //     return null;
    // }

    //根据道具组获取相应的礼包配置
    // public GetGiftCfgByGroupId(group_id: number){
    //     return CfgTianXuanZhiLiData.gift_configuration.filter((cfg)=>{
    //         return cfg.group_id == group_id;
    //     })
    // }
    //根据seq获取对应配置
    public GetGiftBySeq(seq: number){
        for(let i = 0;i < CfgTianXuanZhiLiData.gift_configuration.length; i++){
            if(CfgTianXuanZhiLiData.gift_configuration[i].seq == seq){
                return CfgTianXuanZhiLiData.gift_configuration[i];
            }
        }
        return null;
    }
    //根据服务端下发seq[]获取显示对应档位
    public GetGiftCfgBySeqs(){
        let curData = this.result_data.info.gifts;
        let list = [];
        if(curData){
            for(let i = 0;i<curData.length;i++){
                let sort = 0;
                let gift = this.GetGiftBySeq(curData[i].seq);
                if(gift.limit_convert_count <= curData[i].buyNum){
                    sort = 1;
                }
                list.push({sort:sort,data:gift});
            }
            return list.sort((a,b)=>{
                return a.sort - b.sort;
            });
        }
    }
    //获取其他配置
    public GetOtherCfg(){
        return CfgTianXuanZhiLiData.other[0];
    }
    //获取礼包标题
    public GetTitle(){
        let data = this.GetOtherCfg();
        return data.desc.split("|");
    }

    public SendReq(type: TianXuan_OP_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.TianXuanZhiLi, type, p1);
    }
     /**是否显示累充图标 */
     public IsTianXuanActShow() {
        if (FirstChargeData.Inst().IsFirstActShow()) {
            return false;
        }
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.TianXuanZhiLi)) {
            return false;
        }
        if (!this.result_data.info) {
            TianXuanZhiLiData.Inst().SendReq(TianXuan_OP_TYPE.INFO);
            return false;
        }
        if(this.result_data.info.giftOpenTimestamp <= 0 || (this.result_data.info.giftCloseTimestamp - TimeCtrl.Inst().ServerTime) < 0){
            return false;
        }
        return true;
    }

    public GetRed(){
        if(this.result_data.info.giftOpenTimestamp>0 && (this.result_data.info.giftCloseTimestamp - TimeCtrl.Inst().ServerTime) > 0){
            if(!this.result_data.info.hasFetchFreeGift){
                return 1;
            }
        }
        return 0;
    }
}
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { DataBase } from 'data/DataBase';
import { CreateSMD, smartdata, SMDTriggerNotify } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import {  RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import {  FirstChargeData } from 'modules/first_charge/FirstChargeCtrl';
import { ActivityData } from 'modules/activity/ActivityData';
import { CfgLeiChong } from 'config/CfgLeiChong';
import { DataHelper } from '../../helpers/DataHelper';
import { RechargeData } from 'modules/recharge/RechargeData';
import { Mod } from 'modules/common/ModuleDefine';
import { ActivityRandData } from 'modules/activity/ActivityRandData';

export enum LeiChong_OP_TYPE {
    INFO = 0, //请求信息
    FETCH = 1 //请求领取
}
export class LeiChongCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaLeiChongInfo, func: this.recvSCLeiChongInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(SMDHandle.Create(FirstChargeData.Inst().ResultData, LeiChongData.Inst().FlushIconShow.bind(LeiChongData.Inst()), "info"));
        this.handleCollector.Add(SMDHandle.Create(RechargeData.Inst().ResultData, LeiChongData.Inst().FlushSMD.bind(LeiChongData.Inst()), "is_change"));
        this.handleCollector.Add(RemindRegister.Create(Mod.LeiChong.View, LeiChongData.Inst().ResultData, LeiChongData.Inst().GetRed.bind(LeiChongData.Inst())));
    }

    private recvSCLeiChongInfo(data: PB_SCRaLeiChongInfo) {
        LeiChongData.Inst().SetLeiChongInfo(data);
    }

    public SendReq(type: LeiChong_OP_TYPE,p1?:number) {
        ActivityCtrl.Inst(). SendAngelReq(ACTIVITY_TYPE.LeiChong,type,p1);
    }
}

export class LeiChongResultData {
    @smartdata
    info: PB_SCRaLeiChongInfo;
}
export class LeiChongData extends DataBase {
    private result_data: LeiChongResultData;
    constructor() {
        super();
        this.createSmartData();
    }

    public get ResultData(){
        return this.result_data;
    }
    
    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(LeiChongResultData);
    }

    public SetLeiChongInfo(data: PB_SCRaLeiChongInfo){
        this.result_data.info=data;
    }

    public GetLeiChongData(){
        let cfg=CfgLeiChong.reward;
        let list=[];
        let cur_value=RechargeData.Inst().GetHistoryChongzhi()/10;
        let next_target =0;
        if(this.result_data.info){
            let flag= DataHelper.ToBinary(this.result_data.info.fetchFlag);
            for(let i=0;i<cfg.length;i++){
                let achieve=cur_value>=cfg[i].diamond/10;
                if(next_target==0&&!achieve){
                    next_target=cfg[i].diamond/10;
                }
                list.push({cfg:cfg[i],flag:flag[i]?flag[i]:0,achieve:achieve});
            }
        }
        if(next_target==0){
            next_target = CfgLeiChong.reward[CfgLeiChong.reward.length - 1].diamond / 10;
        }
        list.sort((a,b)=>{
            return a.flag - b.flag;
        })
        cur_value>next_target&&(cur_value=next_target);
        return {list:list,cur_value:cur_value,next_target:next_target}
    }

    /**
     * 有影响累充入口显示的数据更新，
     * 刷新一下累充入口显示
    **/
    private is_firstcharge_iconshow_change:boolean;
    public FlushIconShow(){
        let is_firstcharge_iconshow_change=FirstChargeData.Inst().IsFirstActShow();
        if(is_firstcharge_iconshow_change!== this.is_firstcharge_iconshow_change)
        ActivityData.Inst().CheckRandOpenData();        
    }

    public FlushSMD(){
        SMDTriggerNotify(this.result_data);
    }

    /**是否显示累充图标 */
    public IsLeiChongActShow(){
        if (!FirstChargeData.Inst().IsFirstRecharge()){
            return false;
       }
       if(!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.LeiChong)){
            return false;
        }
        if(!this.result_data.info){
           LeiChongCtrl.Inst().SendReq(LeiChong_OP_TYPE.INFO);
           return false;
        }
        let flag = DataHelper.ToBinary(this.result_data.info.fetchFlag);
        let cfg=CfgLeiChong.reward;
        for (let i = 0; i < cfg.length; i++) {
            if (flag[i]!=1)
                return true;
        }
        return false;
    }

    /**红点 */
    public GetRed(){
        if(!this.result_data.info){
            return 0;
         }
         if(!RechargeData.Inst().GetChongZhiInfo()){
            return 0;
         } 
         let cfg=CfgLeiChong.reward;
         let cur_value=RechargeData.Inst().GetHistoryChongzhi();
         let flag=DataHelper.ToBinary(this.result_data.info.fetchFlag);
         for(let i=0;i<cfg.length;i++){
            if(cur_value>=cfg[i].diamond&&flag[i]!=1){
                return 1;
            }
         }

         return 0;
    }
}
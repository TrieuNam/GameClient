import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { DataBase } from 'data/DataBase';
import { CreateSMD, smartdata } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { ActivityData } from 'modules/activity/ActivityData';
import { ViewManager } from 'manager/ViewManager';
import { FirstChargeView } from './FirstChargeView';
import { ShouChongDingZhiData } from 'modules/lei_chong/ShouChongDingZhi/ShouChongDingZhiCtrl';

export enum FirstCharge_OP_TYPE {
    INFO = 0, //请求信息
    FETCH = 1 //请求领取
}
export class FirstChargeCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaFirstChongInfo, func: this.recvSCFirstChargeInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.FirstCharge.View, FirstChargeData.Inst().ResultData, FirstChargeData.Inst().GetRed.bind(FirstChargeData.Inst())));
    }

    private recvSCFirstChargeInfo(data: PB_SCRaFirstChongInfo) {
        FirstChargeData.Inst().SetFirstChargeInfo(data);
        if(data.fetchMark==1&&ViewManager.Inst().IsOpen(FirstChargeView)){
            ViewManager.Inst().CloseView(FirstChargeView);
        }
    }

    public SendReq(type: FirstCharge_OP_TYPE) {
        ActivityCtrl.Inst(). SendAngelReq(ACTIVITY_TYPE.FirstCharge,type);
    }
}

export class FirstChargeResultData {
    @smartdata
    info: PB_SCRaFirstChongInfo;
}
export class FirstChargeData extends DataBase {
    private result_data: FirstChargeResultData;
    constructor() {
        super();
        this.createSmartData();
    }

    public get ResultData(){
        return this.result_data;
    }
    
    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(FirstChargeResultData);
    }

    public SetFirstChargeInfo(data: PB_SCRaFirstChongInfo){
        this.result_data.info=data;
        if(data.fetchMark == 1)
            ShouChongDingZhiData.Inst().PopUpShow();  //首充过后，判断是否弹出首充定制弹窗
    }

    /**是否显示首充图标 */
    public IsFirstActShow(){
        if(!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.FirstCharge)){
            return false;
        }
        if(!this.result_data.info){
           FirstChargeCtrl.Inst().SendReq(FirstCharge_OP_TYPE.INFO);
           return false;
        }
        return this.result_data.info.fetchMark != 1;
    }

    /**是否首充过 */
    public IsFirstRecharge() {
        if (!this.result_data.info) {
            return false;
        }
        return this.result_data.info.fetchMark == 1;
    }

    /**红点 */
    public GetRed(){
        if(!this.result_data.info){
            return;
         } 
         return this.result_data.info.fetchMark != 1&& this.result_data.info.firstChongMark ==1 ? 1: 0;
    }
}
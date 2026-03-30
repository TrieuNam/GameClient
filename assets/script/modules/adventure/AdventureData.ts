import { ERigidBodyType } from "cc";
import { CfgMaoXianData } from "config/CfgMaoxian";
import { CfgPetAdvance } from "config/CfgPet";
import { LogError } from "core/Debugger";
import { CreateSMD, smartdata, SMDTriggerNotify } from "data/SmartData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Timer } from "modules/time/Timer";
import { DataBase } from "../../data/DataBase";

export class AdventureResultData {
    @smartdata
    main_fb_info: PB_SCMainFbInfo;
}

export class AdventureData extends DataBase {
    private adventure_result_data: AdventureResultData;
    public is_close_view: boolean;
    private timer:any;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.adventure_result_data = CreateSMD(AdventureResultData);
    }

    public SetSCMainFbInfo(data: PB_SCMainFbInfo){
        let self=this;
        self.adventure_result_data.main_fb_info=data;
        this.StartMingXiangTipTimer();
        LogError("冒险协议",data)
    }

    public get ResultData() {
        let self = this;
        return self.adventure_result_data;
    }

    public GetMaxLevel(){
        let self = this;
        return CfgMaoXianData.clearance[CfgMaoXianData.clearance.length - 1].level;
    }

    public IsMaxLevel(){
        let self = this;
        return self.adventure_result_data.main_fb_info.level == self.GetMaxLevel();
    }

    public GetCurLvCfg(level?:number){
        let self = this;
        let lv = level ? level: self.adventure_result_data.main_fb_info.level+1;
        let max_lv = self.GetMaxLevel()
        if (lv > max_lv)
            lv = max_lv;
        return CfgMaoXianData.clearance[lv - 1];
    }

    public GetCurChapterCfg(){
        let self=this;
        let cur_stage = self.adventure_result_data.main_fb_info.stage+1;
        return CfgMaoXianData.jieduan_reward[cur_stage -1];
    }

    public GetChapterRed(){
        let fb_info = this.ResultData.main_fb_info;
        if (fb_info) {
            let stage_cfg = this.GetCurChapterCfg();
            if (stage_cfg)
                return fb_info.level >= stage_cfg.clearance_condition ? 1 : 0;
        }
        return 0;
    }

    public GetRedNum() {
        if (this.GetMingXiangRed()==1)
            return 1;
        return this.GetChapterRed();
    }

    //首次进入冒险，打完第一关之后，自动关闭冒险界面
    public CheckCloseAdventure(){
        if (this.ResultData.main_fb_info){
            this.is_close_view = this.ResultData.main_fb_info.level == 0;
        }
    }

    /**冒险当前关卡 */
    public GetAdventureLevel(){
        return this.ResultData.main_fb_info?this.ResultData.main_fb_info.level:1;
    }

    /*******冥想收益********* */
    public GetNextMingXiangLevelName(){
        let cfg = this.GetCurLvCfg();
        if(cfg.now_box==cfg.next_show)
            return;
        let cfgs = CfgMaoXianData.clearance
        for(let i=0;i<cfgs.length;i++){
            if (cfgs[i].now_box==cfg.next_show){
                if (cfgs[i-1])
                    return cfgs[i-1].name;
            }
        }
    }

    public GetMingXiangMax(){
        return CfgMaoXianData.other[0].max_time*3600;
    }
    
    public IsMingXiangStart() {
        if (this.GetAdventureLevel()+1 >= CfgMaoXianData.other[0].start_level)
            return true;
        return false;
    }

    public GetMingXiangRed() {
        if (!this.ResultData.main_fb_info)
            return 0;
        if (this.ResultData.main_fb_info.lastFetchTime == 0)
            return 0;
        if (!this.IsMingXiangStart())
            return 0;
        let max_time = this.GetMingXiangMax();
        let cur_time = TimeCtrl.Inst().ServerTime;
        let lastFetchTime = this.ResultData.main_fb_info.lastFetchTime;
        if (cur_time >= lastFetchTime + max_time || this.ResultData.main_fb_info.diaFetchNum == 0) {
            return 1;
        }
        return 0;
    }

    public StartMingXiangTipTimer() {
        if (!this.ResultData.main_fb_info)
            return ;
        Timer.Inst().CancelTimer(this.timer);
        let max_time = this.GetMingXiangMax();
        let next_time = this.ResultData.main_fb_info.lastFetchTime + max_time;
        let cur_time = Math.floor(TimeCtrl.Inst().ServerTime);
        let time=next_time-cur_time;
        if(time>0){
            this.timer=Timer.Inst().AddRunTimer(()=>{
                SMDTriggerNotify(this.ResultData, "main_fb_info")
            },time,1,false);
        }

    }
}
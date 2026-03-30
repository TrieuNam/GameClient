import { CfgGuideConfig, CfgGuideData, CfgGuideStep } from "config/CfgGuide";
import { CreateSMD, smartdata } from "data/SmartData";
import { DataBase } from "../../data/DataBase";
import { GuideView } from "./GuideView";

/*
class LoginResultData{
    @smartdata
    result:number;
}
*/

export class GuideData extends DataBase {
    //public ResultData : LoginResultData;
    guide_list: CfgGuideStep[][];
    guide_view: GuideView = null;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        /*
        let self = this;
        self.ResultData = CreateSMD(LoginResultData);
        */
    }
    /**
     * name
     */
    public name() {

    }

    //获取当前指引信息
    public GetGuideCfg(id: number): CfgGuideConfig {
        let cfg = CfgGuideData.guide_list.find(cfg => cfg.id == id);
        return cfg ? cfg : null;
    }
    //获取当前指引步骤列表
    public GetStepCfg(id: number): CfgGuideStep[] {
        if (!this.guide_list) {
            this.guide_list = [];
        }
        if (!this.guide_list[id]) {
            this.guide_list[id] = [];
            CfgGuideData.guide.forEach(cfg => {
                if (cfg.step_id == id) {
                    this.guide_list[id].push(cfg);//从0开始
                }
            });
        }
        return this.guide_list[id];
    }
    //设置指引界面
    public SetGuideView(view: GuideView) {
        this.guide_view = view;
    }
    public GetGuideView() {
        return this.guide_view
    }
}

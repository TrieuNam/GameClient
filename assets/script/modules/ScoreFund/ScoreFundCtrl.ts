import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { DataBase } from 'data/DataBase';
import { CreateSMD, smartdata, SMDTriggerNotify } from 'data/SmartData';
import { ActivityCtrl } from 'modules/activity/ActivityCtrl';
import { ACTIVITY_TYPE } from 'modules/activity/ActivityEnum';
import { CfgHelper } from '../../helpers/CfgHelper';
import { RoleData } from 'modules/role/RoleData';
import { CfgScoreFund, CfgScoreFundPhase, CfgScoreFundReward, CfgScoreFundRewardShow } from 'config/CfgScoreFund';
import { CfgItem } from 'config/CfgCommon';
import { DataHelper } from '../../helpers/DataHelper';
import { ActivityRandData } from 'modules/activity/ActivityRandData';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { Mod } from 'modules/common/ModuleDefine';
import { TextHelper } from '../../helpers/TextHelper';
import { Language } from 'modules/common/Language';

export enum ScoreFund_OP_TYPE {
    INFO = 0, //请求信息
    FETCH = 1 //请求领取 p1:seq
}

export class ScoreFundCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaCapacityFundInfo, func: this.recvSCScoreFundInfo }
        ]
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.ServerActivity.ScoreFund, ScoreFundData.Inst().ResultData, ScoreFundData.Inst().GetRed.bind(ScoreFundData.Inst())));
        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().ResultData, this.OnLevelChange.bind(this), "roleLevel"));
        this.handleCollector.Add(SMDHandle.Create(RoleData.Inst().ResultData, this.OnLevelChange.bind(this), "roleCap"));
    }

    private recvSCScoreFundInfo(data: PB_SCRaCapacityFundInfo) {
        ScoreFundData.Inst().SetScoreFundInfo(data);
    }

    public SendReq(type: ScoreFund_OP_TYPE, p1?: number) {
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.ScoreFund, type, p1);
    }

    public OnLevelChange() {
        SMDTriggerNotify(ScoreFundData.Inst().ResultData);
    }
}
export class ScoreFundResultData {
    @smartdata
    info: PB_SCRaCapacityFundInfo;
}
export class ScoreFundData extends DataBase {
    private result_data: ScoreFundResultData;
    private cfgs: { [phase: number]: CfgScoreFundReward[] };
    private cfgs_reward_show: { [phase: number]: { [sort_seq: number]: CfgScoreFundRewardShow[] }}
    constructor() {
        super();
        this.createSmartData();
    }

    public get ResultData() {
        return this.result_data;
    }

    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(ScoreFundResultData);
    }

    public GetCfg() {
        if (!this.cfgs) {
            this.cfgs = CfgHelper.reSetdatas(CfgScoreFund.gift_configure, ["phase"], true);
        }
        return this.cfgs;
    }

    public SetScoreFundInfo(data: PB_SCRaCapacityFundInfo) {
        this.result_data.info = data;
    }

    public GetListByPhase(phase: number) {
        let cfgs = this.GetCfg()[phase];
        let list_data = [];
        for (let i = 0; i < cfgs.length; i++) {
            list_data.push(this.GetItemData(cfgs[i]));
        }
        return list_data;
    }


    public GetItemData(cfg: CfgScoreFundReward) {
        let score = RoleData.Inst().GetCapability();
        let common_flag = DataHelper.ToBinary(this.result_data.info.commonFetchFlag);
        let is_fetch = common_flag[cfg.seq] == 1;
        let is_lock = !is_fetch && score < cfg.score;
        let red = !is_lock && !is_fetch ? 1 : 0;
        let is_click = is_fetch || is_lock;
        let common_item_data = new ScoreFundRewardData(cfg.ordinary_item, is_fetch, is_lock, red, is_click);
        let senior_item_data = [];
        let buy_flag = DataHelper.ToBinary(this.result_data.info.phaseBuyFlag);
        let senior_flag = DataHelper.ToBinary(this.result_data.info.seniorFetchFlag);
        let title = TextHelper.Format(Language.ScoreFund.title, score, cfg.score);
        for (let i = 0; i < cfg.senior_item.length; i++) {
            let is_fetch = senior_flag[cfg.seq] == 1;
            let is_buy = ScoreFundData.Inst().IsBuy(cfg.phase);
            let is_lock = buy_flag[cfg.phase] != 1 || (!is_fetch && score < cfg.score);
            let red = !is_lock && !is_fetch ? 1 : 0;
            let is_click = is_fetch || score < cfg.score || !is_buy;
            senior_item_data.push(new ScoreFundRewardData(cfg.senior_item[i], is_fetch, is_lock, red, is_click));
        }
        return { common_data: common_item_data, senior_data: senior_item_data, title: title, cfg: cfg };
    }

    public IsBuy(phase: number) {
        let buy_flag = DataHelper.ToBinary(this.result_data.info.phaseBuyFlag);
        return buy_flag[phase] == 1;
    }

    public GetRed() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.ScoreFund)) {
            return 0;
        }
        if (!this.result_data.info) {
            ScoreFundCtrl.Inst().SendReq(ScoreFund_OP_TYPE.INFO);
            return 0;
        }

        for (let i = 0; i < CfgScoreFund.phase_configure.length; i++) {
            if (this.GetRedByPhase(CfgScoreFund.phase_configure[i]))
                return 1; 
        }
        return 0;
    }

    public GetRedByPhase(cfg: CfgScoreFundPhase) {
        let role_level = RoleData.Inst().GetRoleLevel();
        let buy_flag = DataHelper.ToBinary(this.result_data.info.phaseBuyFlag);
        let common_flag = DataHelper.ToBinary(this.result_data.info.commonFetchFlag);
        let senior_flag = DataHelper.ToBinary(this.result_data.info.seniorFetchFlag);
        let score = RoleData.Inst().GetCapability();
        if (role_level >= cfg.show_level) {
            let phase = cfg.phase;
            let is_buy: boolean = buy_flag[phase] == 1;
            let cfgs = this.GetCfg()[phase];
            for (let y = 0; y < cfgs.length; y++) {
                if (score >= cfgs[y].score) {
                    if (!common_flag[cfgs[y].seq])
                        return 1;
                    if (is_buy && !senior_flag[cfgs[y].seq])
                        return 1;
                }
            }
        }
        return 0;
    }

    public IsScoreFundOpen(){
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.ScoreFund)) {
            return false;
        }
        if (!this.result_data.info) {
            ScoreFundCtrl.Inst().SendReq(ScoreFund_OP_TYPE.INFO);
            return false;
        }
        let role_level = RoleData.Inst().GetRoleLevel();
        let buy_flag = DataHelper.ToBinary(this.result_data.info.phaseBuyFlag);
        let common_flag = DataHelper.ToBinary(this.result_data.info.commonFetchFlag);
        let senior_flag = DataHelper.ToBinary(this.result_data.info.seniorFetchFlag);
        let score = RoleData.Inst().GetCapability();
        for(let i=0;i<CfgScoreFund.gift_configure.length;i++){
            let seq = CfgScoreFund.gift_configure[i].seq;
            if (common_flag[seq] != 1 || senior_flag[seq] !=1)
                return true;
        }
        return false;
    }

    public GetRewardShowCfg(){
        if (!this.cfgs_reward_show){
            this.cfgs_reward_show={}
            for(let i=0;i<CfgScoreFund.item_reward.length;i++){
                let phase = CfgScoreFund.item_reward[i].phase;
                let sort_seq = CfgScoreFund.item_reward[i].sort_seq;
                if (!this.cfgs_reward_show[phase])
                    this.cfgs_reward_show[phase]={}
                if (!this.cfgs_reward_show[phase][sort_seq])
                    this.cfgs_reward_show[phase][sort_seq] = [];
                this.cfgs_reward_show[phase][sort_seq].push(CfgScoreFund.item_reward[i])
            }
        }
        return this.cfgs_reward_show;
    }
}

export class ScoreFundRewardData {
    item: CfgItem;
    is_fetch: boolean;
    is_lock: boolean;
    red: number;
    is_click: boolean;
    constructor(item: CfgItem, is_fetch: boolean, is_lock: boolean, red: number, is_click: boolean) {
        this.item = item;
        this.is_fetch = is_fetch;
        this.is_lock = is_lock;
        this.red = red;
        this.is_click = is_click;
    }
}
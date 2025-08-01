import { CfgKnightsBook, CfgKnightsData } from 'config/CfgKnights';
import { LogError } from 'core/Debugger';
import { DataBase } from 'data/DataBase';
import { RemindRegister } from 'data/HandleCollectorCfg';
import { CreateSMD, smartdata } from 'data/SmartData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { AttrListName, Language } from 'modules/common/Language';
import { Mod } from 'modules/common/ModuleDefine';
import { FunOpen } from 'modules/guide/FunOpen';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { AttrHelper } from '../../helpers/AttrHelper';
import { DataHelper } from '../../helpers/DataHelper';
import { TextHelper } from '../../helpers/TextHelper';

export enum MANUAL_OP_TYPE {
    FETCH = 1,    //p:seq
    LEVEL_UP = 2, //p:level
}
export class ManualCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCKnightsInfo, func: this.recvSCManualInfo },
            { msgType: PB_SCKnightsConditionInfo, func: this.recsSCConditionInfo },
        ]
    }
    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Other.Manual, ManualData.Inst().result_data, ManualData.Inst().GetRed.bind(ManualData.Inst())));
    }
    private recvSCManualInfo(data: PB_SCKnightsInfo) {
        ManualData.Inst().setManualInfo(data);
    }

    private recsSCConditionInfo(data: PB_SCKnightsConditionInfo) {
        ManualData.Inst().setConditionInfo(data);
    }

    public SendGetReq(type: MANUAL_OP_TYPE, param: number) {
        let protocol = this.GetProtocol(PB_CSKnightsReq);
        protocol.opType = type;
        protocol.param1 = param;
        this.SendToServer(protocol);
    }
}

export class ManualResultData {
    @smartdata
    info: PB_SCKnightsInfo;

    @smartdata
    condition_info: PB_SCKnightsConditionInfo;

    // @smartdata
    // show_level: number;//展示的等级
}

export class ManualData extends DataBase {
    result_data: ManualResultData;
    private manual_boox_data: { [level: number]: CfgKnightsBook[] };
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        let self = this;
        self.result_data = CreateSMD(ManualResultData);
    }

    protected onSwitch(): void {
        this.result_data.info = undefined;
    }

    public setManualInfo(data: PB_SCKnightsInfo) {
        // if (!this.result_data.show_level){
        //     this.result_data.show_level=data.level;
        // }
        LogError("骑士团数据", data)
        if (this.result_data.info) {
            let flag = this.GetManualFlag();
            let new_flag = this.GetManualFlag(data.flag);
            if (data.level > this.result_data.info.level) {
                this.PopLevelAttDesc(this.result_data.info.level);
            } else
                for (let i = 0; i < 3; i++) {
                    if (flag[i] == 0 && new_flag[i] == 1) {
                        this.PopConditionAttDesc(this.result_data.info.level, i);
                        break;
                    }
                }
        }
        this.result_data.info = data;
    }

    public setConditionInfo(data: PB_SCKnightsConditionInfo) {
        this.result_data.condition_info = data;
    }

    public GetLevel() {
        let max_lv = CfgKnightsData.knights_reward.length;
        let cur_lv = this.result_data.info ? this.result_data.info.level : 0;
        return cur_lv > max_lv ? max_lv : cur_lv;
    }

    public IsMaxLevel() {
        let max_lv = CfgKnightsData.knights_reward.length;
        return this.result_data.info && this.result_data.info.level >= max_lv;
    }

    public GetManualFlag(flag_info?: number) {
        if (!flag_info && this.result_data.info) {
            flag_info = this.result_data.info.flag
        }
        let flag: any[]
        if (!flag_info) {
            flag = [];
        } else
            flag = flag_info.toString(2).split("").reverse().map(Number);
        flag = flag.slice(1);
        if (flag.length < 3) {
            for (let i = 0; i < 3; i++) {
                flag[i] = flag[i] ? flag[i] : 0;
            }
        }
        return flag;
    }

    public GetLvRewardData(level: number) {
        return CfgKnightsData.knights_reward[level - 1];
    }

    public GetBookData() {
        if (!this.manual_boox_data) {
            this.manual_boox_data = {};
            let cfgs = CfgKnightsData.knights_book;
            for (let i = 0; i < cfgs.length; i++) {
                let level = cfgs[i].level;
                if (!this.manual_boox_data[level]) {
                    this.manual_boox_data[level] = [];
                }
                this.manual_boox_data[level].push(cfgs[i]);
            }
        }
        return this.manual_boox_data;
    }

    public GetLvBookData(level: number) {
        return this.GetBookData()[level];
    }

    public GetListData() {
        let flag = this.GetManualFlag();
        let level = this.GetLevel();
        let cfg_book = this.GetLvBookData(level);
        let data = [];
        for (let i = 0; i < cfg_book.length; i++) {
            let cfg = cfg_book[i];
            let info: any = {};
            info.flag = flag[i];//已激活
            // info.name = TextHelper.Format(Language.Manual.condition_desc[cfg.condition], cfg.param_1);
            info.name = cfg.dec;
            info.pro = this.result_data.condition_info.contitionList[i];
            info.param = cfg.param_1;
            info.isFinish = info.pro >= cfg.param_1;//已完成
            info.desc = AttrListName[cfg.att_type] + "+" + AttrHelper.Percent(cfg.att_type, cfg.att_num);
            info.seq = cfg.seq;
            data.push(info);
        }
        return data;
    }

    /**条件完成属性飘字 */
    public PopConditionAttDesc(level: number, condition: number) {
        let cfg_level = this.GetLvBookData(level);
        let cfg = cfg_level[condition];
        let desc = AttrListName[cfg.att_type] + "+" + AttrHelper.Percent(cfg.att_type, cfg.att_num);
        PublicPopupCtrl.Inst().Center(desc);
    }

    /**等级提升属性飘字 */
    public PopLevelAttDesc(level: number) {
        let cfg = this.GetLvRewardData(level);
        let desc = TextHelper.Format(Language.Manual.add_money, cfg.icon_up);
        PublicPopupCtrl.Inst().Center(desc);
    }

    public GetAddMoney() {
        let level = this.GetLevel();
        let cfg = this.GetLvRewardData(level - 1);
        let cfg_next = this.GetLvRewardData(level);
        return [cfg ? cfg.icon_up : 0, cfg_next.icon_up]
    }

    public GetAllAdd() {
        let level = this.GetLevel();
        let att_add: { [att_type: number]: number } = {};
        let flag = this.GetManualFlag()
        for (let x = 1; x <= level; x++) {
            let cfg_book = this.GetLvBookData(x);
            for (let i = 0; i < cfg_book.length; i++) {
                if (!att_add[cfg_book[i].att_type]) {
                    att_add[cfg_book[i].att_type] = 0;
                }
                if (x != level || flag[i] == 1)
                    att_add[cfg_book[i].att_type] += cfg_book[i].att_num;
            }
        }
        let cfg_reward = this.GetLvRewardData(level - 1);
        if (cfg_reward) {
            att_add[cfg_reward.jihuo_att[0].type] = cfg_reward.jihuo_att[0].add;
        }
        let list = [];
        for (let att_type in att_add) {
            let attr = {
                attrType: +att_type,
                attrValue: att_add[att_type],
            }
            list.push(attr);
        }
        return list;
    }

    public IsRewardCanFetch() {
        if (!this.result_data.info)
            return false;
        let level = this.GetLevel();
        let cfg_book = this.GetLvBookData(level);
        let flag = this.GetManualFlag();
        for (let i = 0; i < cfg_book.length; i++) {
            if (flag[i] != 1) {
                return false;
            }
        }
        let level_reward_flag = DataHelper.ToBinary(this.result_data.info.levelFlag);
        return level_reward_flag[level] != 1;
    }

    public GetRed() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Mod.Other.Manual);
        if (!open_t.is_open) {
            return 0;
        }
        let level = this.GetLevel();
        let cfg_book = this.GetLvBookData(level);
        if (cfg_book) {
            let flag = this.GetManualFlag();
            for (let i = 0; i < cfg_book.length; i++) {
                let pro = this.result_data.condition_info.contitionList[i];
                let param = cfg_book[i].param_1;
                let isFinish = pro >= param;//已完成
                if (flag[i] != 1 && isFinish) {
                    return 1;
                }
            }
        } else {
            return 0;
        }
        return this.IsRewardCanFetch() ? 1 : 0;
    }

    // public ChangeShowLevel(){
    //     this.result_data.show_level = this.GetLevel();
    // }
}
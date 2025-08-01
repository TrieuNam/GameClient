import { CfgAngelFesData } from "config/CfgAngelFes";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { RemindRegister } from "data/HandleCollectorCfg";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { ActivityCtrl } from "modules/activity/ActivityCtrl";
import { ACTIVITY_TYPE } from "modules/activity/ActivityEnum";
import { ActivityRandData } from "modules/activity/ActivityRandData";
import { BaseCtrl, regMsg } from "modules/common/BaseCtrl";
import { CommonId } from "modules/common/CommonEnum";
import { Language } from "modules/common/Language";
import { Mod } from "modules/common/ModuleDefine";
import { FunOpen } from "modules/guide/FunOpen";
import { BuyConfirmView } from "modules/shop/BuyConfirmView";
import { ShopConfirmData } from "modules/shop/ShopData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { TextHelper } from "../../helpers/TextHelper";

export class AngelFesCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCRaFaZhenGalaInfo, func: this.onSCRaFaZhenGalaInfo },
            //         { msgType: PB_SCRuneRet, func: this.onSCRuneRet },
        ]
    }

    private onSCRaFaZhenGalaInfo(protocol: PB_SCRaFaZhenGalaInfo) {
        LogError("3024?阵法盛典下发?2063", protocol)
        AngelFesData.Inst().SetAngelFesInfo(protocol)
    }

    public SendAngelFesReq(operaType: number, param1: number) {
        LogError("3000?阵法盛典购买?", operaType, param1)
        ActivityCtrl.Inst().SendAngelReq(ACTIVITY_TYPE.FaZhenGala, operaType, param1, 0, 0)
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.AngelFes.Main,
            AngelFesData.Inst().flush_info,
            AngelFesData.Inst().GetRedNum.bind(AngelFesData.Inst())));
    }
}

class AngelFesInfo {
    @smartdata
    flush_need: number;
    @smartdata
    show_time: number;
}

export class AngelFesData extends DataBase {
    public flush_info: AngelFesInfo;
    private base_info: any
    constructor() {
        super();
        this.createSmartData();
        this.base_info = {}
    }

    private createSmartData() {
        this.flush_info = CreateSMD(AngelFesInfo);
        this.flush_info.flush_need = 0
        this.flush_info.show_time = 0
    }

    public SetAngelFesInfo(protocol: PB_SCRaFaZhenGalaInfo) {
        this.base_info.level = protocol.level
        this.base_info.end_timestamp = protocol.endTimestamp
        this.base_info.fetch_flag = protocol.fetchFlag
        this.base_info.task_num = protocol.taskNum
        this.base_info.gift_num = protocol.giftNum

        this.flush_info.flush_need = this.flush_info.flush_need + 1

        this.flush_info.show_time = (protocol.endTimestamp - TimeCtrl.Inst().ServerTime) > 0 ? 1 : 0
    }

    public CheckTime() {
        this.flush_info.show_time = (this.base_info.end_timestamp - TimeCtrl.Inst().ServerTime) > 0 ? 1 : 0
    }

    public GetViewParam() {
        return {
            timer: this.base_info.end_timestamp,
        }
    }

    public GetTask0List() {
        let role_level = this.base_info.level

        let list = []
        for (var index in CfgAngelFesData.task_configuration) {
            let cfg = CfgAngelFesData.task_configuration[index]
            if (cfg.start_level <= role_level && cfg.end_level >= role_level) {
                let oper = cfg
                if (oper.task_show == 1) {
                    let num = this.GetTaskParam(oper.task_id)
                    let is_got = this.GetTaskIsGot(oper.task_id)
                    let is_complete = num >= oper.parameter
                    let info = {
                        task_id: oper.task_id,
                        reward_id: oper.reward_item.item_id,
                        reward_num: oper.reward_item.num,
                        desc: oper.describe,
                        task_num: num > oper.parameter ? oper.parameter : num,
                        task_max: oper.parameter,
                        btn_name: is_complete ? (is_got ? Language.AngelFes.BtnDone : Language.AngelFes.BtnComplete) : Language.AngelFes.BtnUnComplete,
                        is_complete: is_complete,
                        is_done: is_got,
                        sort: (!is_got) ? 0 : 1
                    }
                    list.push(info)
                }
            }
        }

        list.sort((a: any, b: any) => { return a.sort - b.sort })

        return list
    }

    // 根据类型获取任务进度
    public GetTaskParam(type: number) {
        return this.base_info.task_num[type]
    }

    public GetTask1List() {
        let role_level = this.base_info.level

        let list = []
        for (var index in CfgAngelFesData.task_configuration) {
            let cfg = CfgAngelFesData.task_configuration[index]
            if (cfg.start_level <= role_level && cfg.end_level >= role_level) {
                let oper = cfg
                if (oper.task_show == 2) {
                    let num = this.GetTaskParam(oper.task_id)
                    let is_got = this.GetTaskIsGot(oper.task_id)
                    let is_complete = num >= oper.parameter

                    let info = {
                        task_id: oper.task_id,
                        reward_id: oper.reward_item.item_id,
                        reward_num: oper.reward_item.num,
                        desc: oper.describe,
                        task_num: num > oper.parameter ? oper.parameter : num,
                        task_max: oper.parameter,
                        btn_name: is_complete ? (is_got ? Language.AngelFes.BtnDone : Language.AngelFes.BtnComplete) : Language.AngelFes.BtnUnComplete,
                        is_complete: is_complete,
                        is_done: is_got,
                        sort: (!is_got) ? 0 : 1
                    }
                    list.push(info)
                }
            }
        }
        list.sort((a: any, b: any) => { return a.sort - b.sort })

        return list
    }

    public GetShopList() {
        let role_level = this.base_info.level

        let list = []
        for (var index in CfgAngelFesData.gift_configuration) {
            let cfg = CfgAngelFesData.gift_configuration[index]
            if (cfg.start_level <= role_level && cfg.end_level >= role_level) {
                let oper = cfg
                let buy_time = this.GetBuyGiftTime(oper.type)
                let limit_str = TextHelper.Format(Language.AngelFes.GiftLimit[oper.limit_type], (buy_time + "/" + oper.limit_convert_count))

                let price_str = oper.price_type == 3 ? (oper.price / 10) : oper.price
                let info = {
                    seq: oper.type,
                    id: oper.reward_item.item_id,
                    num: oper.reward_item.num,
                    is_limit: oper.limit_type > 1,
                    limit: limit_str,
                    limit_full: buy_time == oper.limit_convert_count,
                    limit_time: oper.limit_convert_count,
                    price: price_str,
                    is_free: oper.price_type == 4,
                    off_show: oper.discount < 10,
                    off_str: oper.discount + Language.AngelFes.Offset,
                    price_num: oper.price,
                    price_item: this.GetPriceItem(oper.price_type),
                    price_type: oper.price_type,
                    sort: (buy_time == oper.limit_convert_count) ? 1 : 0
                }
                list.push(info)
            }
        }

        list.sort((a: any, b: any) => { return a.sort - b.sort })
        return list
    }

    public GetRedNum() {
        if (!ActivityRandData.Inst().IsACtOpen(ACTIVITY_TYPE.FaZhenGala)
            || !FunOpen.Inst().GetFunIsOpen(Mod.AngelFes.Main).is_open || AngelFesData.Inst().flush_info.show_time == 0) {
            return 0
        }

        let red_num = this.GetRed0Num() + this.GetRed1Num() + this.GetFreeGiftRed();
        return red_num > 0 ? 1 : 0
    }
    //免费礼包红点
    public GetFreeGiftRed() {
        // let data = this.GetShopList();
        // for (let i = 0; i < data.length; i++) {
        //     if (data[i].price_type == 4) {
        //         if (!data[i].limit_full) {
        //             return 1;
        //         }
        //     }
        // }
        // return 0;
        return 0
    }
    public GetRed0Num() {
        let list0 = this.GetTask0List()
        for (var index in list0) {
            if (list0[index].is_complete && !list0[index].is_done) {
                return 1
            }
        }

        return 0
    }

    public GetRed1Num() {
        let list1 = this.GetTask1List()
        for (var index in list1) {
            if (list1[index].is_complete && !list1[index].is_done) {
                return 1
            }
        }

        return 0
    }

    public GetTaskIsGot(index: number) {
        return this.base_info.fetch_flag.toString(2).split("").reverse().map(Number)[index] == 1
    }

    public GetBuyGiftTime(type: number) {
        return this.base_info.gift_num[type]
    }

    public GetPriceItem(type: number) {
        if (type == 1) {
            return CommonId.Diamond
        }
        else if (type == 2) {
            return CommonId.Gold
        }
        else if (type == 3) {
            return 0
        }
        else if (type == 4) {
            return 0
        }
    }

    public TryBuy(param: any) {
        let buy_fun: Function = () => {
            AngelFesCtrl.Inst().SendAngelFesReq(2, param.seq)
        };
        let limit_time = param.limit

        let buy_confirm_data: ShopConfirmData = new ShopConfirmData(
            param.item_id,
            param.num,
            this.GetPriceItem(param.price_type),
            param.price,
            buy_fun,
            limit_time);

        ViewManager.Inst().OpenView(BuyConfirmView, buy_confirm_data)
    }

    public GetEndTime() {
        let time = this.base_info.end_timestamp
        return time == null ? 0 : time
    }
}
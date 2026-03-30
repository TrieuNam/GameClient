import { LogError } from 'core/Debugger';
import { RemindRegister, SMDHandle } from 'data/HandleCollectorCfg';
import { SMDTriggerNotify } from 'data/SmartData';
import { BagData } from 'modules/bag/BagData';
import { BaseCtrl, regMsg } from 'modules/common/BaseCtrl';
import { Mod } from 'modules/common/ModuleDefine';
import { CoreCrisisData } from 'modules/CoreCrisis/CoreCrisisData';
import { MountData } from "modules/mount/MountData";

export enum MOUNR_REQ_TYPE {
    LEVEL_UP = 0, // 升级 P:id
    GRADE_UP = 1, // 升阶 P:id
    EXPLORE = 2,  // 探索
    SET_APP = 3,  // 设置幻化 P:id

    PIFU_UP = 4,  // 皮肤升级 P:id p2:0消耗物品 1:消耗钻石
    SET_PIFU = 5,  // 设置皮肤 P:id

    WEAR = 6,   //穿戴马具 p: 背包index
    DECOMPOSE = 7,  //分解  p: 背包index
    UNLOCK = 8,     //词条解锁 p: 背包index
    ENTRY_REFRESH = 9,  //词条洗炼 p: 背包index     p2:上锁标识位(位运算)  p3:消耗的物品id
    BUY = 10,   //购买马具  p:index[0,3]
    REFRESH_BUY = 11,   //刷新购买马具  p:0 金币刷新，1钻石刷新
    OPEN_BUY = 12,  //打开马具抽取页面
    SET_LOCK_FLAG = 13,//设置锁定 p:背包index p2:上锁标识符(位运算)
}

export class MountCtrl extends BaseCtrl {
    MsgCfg(): regMsg[] {
        return [
            { msgType: PB_SCMountInfo, func: this.onSCMountInfo },
            { msgType: PB_SCMountOpRet, func: this.onSCMountOpRet },
            { msgType: PB_SCMountHarnessListInfo, func: this.onSCMountHarnessListInfo },
            { msgType: PB_SCMountHarnessOneInfo, func: this.onSCMountHarnessOneInfo },
            { msgType: PB_SCMountHarnessInfo, func: this.onSCMountHarnessInfo },
        ]
    }

    // 坐骑信息
    private onSCMountInfo(protocol: PB_SCMountInfo) {
        LogError("2140?坐骑信息?onSCMountInfo", protocol)
        MountData.Inst().SetSCMountInfo(protocol)
    }

    // 坐骑请求
    public SendCSMountReq(type: MOUNR_REQ_TYPE, param?: number, param2?: number, param3?: number) {
        LogError("2141?坐骑请求?SendCSMountReq", type, param, param2 == null ? 0 : param2)
        let protocol = this.GetProtocol(PB_CSMountReq);
        protocol.reqType = type;
        protocol.param = param;
        protocol.param2 = param2 == null ? 0 : param2;
        protocol.param3 = param3 == null ? 0 : param3;
        this.SendToServer(protocol);
    }

    // 坐骑回调信息（单独下发)
    private onSCMountOpRet(protocol: PB_SCMountOpRet) {
        LogError("2142?坐骑回调信息?onSCMountOpRet", protocol)
        MountData.Inst().SetSCMountOpRet(protocol)
    }

    // 坐骑马具列表（总
    private onSCMountHarnessListInfo(protocol: PB_SCMountHarnessListInfo) {
        LogError("2143?马具列表信息?onSCMountHarnessListInfo", protocol)
        MountData.Inst().SetSCMountHarnessList(protocol)
    }

    // 坐骑单个马具
    private onSCMountHarnessOneInfo(protocol: PB_SCMountHarnessOneInfo) {
        LogError("2144?坐骑回调信息?onSCMountOpRet", protocol)
        MountData.Inst().SetSCMountHarnessOneInfo(protocol)
    }

    // 坐骑购买信息（只取
    private onSCMountHarnessInfo(protocol: PB_SCMountHarnessInfo) {
        LogError("2145?坐骑回调信息?onSCMountOpRet", protocol)
        MountData.Inst().SetSCMountHarnessInfo(protocol)
    }

    protected initCtrl() {
        this.handleCollector.Add(RemindRegister.Create(Mod.Mount.Up, MountData.Inst().flush_info, MountData.Inst().GetRedNum.bind(MountData.Inst())));
        // this.handleCollector.Add(RemindRegister.Create(Mod.Mount.Up, BagData.Inst().BagItemData, MountData.Inst().GetRedNum.bind(MountData.Inst())));
        // this.handleCollector.Add(RemindRegister.Create(Mod.Mount.Up, CoreCrisisData.Inst().flush_info, MountData.Inst().GetRedNum.bind(MountData.Inst())));

        this.handleCollector.Add(SMDHandle.Create(CoreCrisisData.Inst().flush_info,
            MountData.Inst().FlushCoreCrisis.bind(MountData.Inst()), "need_flush"));
        this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData,
            MountData.Inst().FlushItemChange.bind(MountData.Inst()), "OtherChange"));

        this.handleCollector.Add(RemindRegister.Create(Mod.Mount.HuanHua, MountData.Inst().flush_info, MountData.Inst().GetAngelResAllRed.bind(MountData.Inst())));
        this.handleCollector.Add(RemindRegister.Create(Mod.Mount.Equip, MountData.Inst().flush_info, MountData.Inst().GetEquipRed.bind(MountData.Inst())));
        // this.handleCollector.Add(SMDHandle.Create(BagData.Inst().BagItemData, this.BagNumChange.bind(this), "OtherChange"));
    }

    private BagNumChange() {
        SMDTriggerNotify(MountData.Inst().flush_info)
    }
}
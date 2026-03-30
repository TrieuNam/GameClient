
import { CfgShenQiData } from "config/CfgShenQi";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { BagData } from "modules/bag/BagData";
import { ItemColor } from "modules/common/CommonEnum";
import { Mod } from "modules/common/ModuleDefine";
import { CoreCrisisType } from "modules/CoreCrisis/CoreCrisisConfig";
import { CoreCrisisData } from "modules/CoreCrisis/CoreCrisisData";
import { FunOpen } from "modules/guide/FunOpen";
import { ShenQiView } from "./ShenQiView";

export class ShenQiResultData {
    @smartdata
    ListInfo: PB_SCShenQiListInfo = new PB_SCShenQiListInfo();

    @smartdata
    OtherInfo: PB_SCShenQiOtherInfo = new PB_SCShenQiOtherInfo();

    @smartdata
    DrawInfo: PB_SCShenQiDrawInfo = new PB_SCShenQiDrawInfo();

    @smartdata
    RecordInfo: PB_SCShenQiRecordInfo = new PB_SCShenQiRecordInfo();

    @smartdata
    FlushInfo: boolean = false;
}

export class ShenQiData extends DataBase {
    public ResultData: ShenQiResultData;

    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.ResultData = CreateSMD(ShenQiResultData);
    }

    public SetShenQiListInfo(protocol: PB_SCShenQiListInfo) {
        this.ResultData.ListInfo = protocol
    }

    public SetShenQiOneInfo(protocol: PB_SCShenQiOneInfo) {
        this.ResultData.ListInfo.shenqiList[protocol.id] = protocol.shenqiData
        this.ResultData.FlushInfo = !this.ResultData.FlushInfo
    }

    public SetShenQiOtherInfo(protocol: PB_SCShenQiOtherInfo) {
        this.ResultData.OtherInfo = protocol
    }

    public SetShenQiDrawInfo(protocol: PB_SCShenQiDrawInfo) {
        ShenQiView.IsDrawing = true
        this.ResultData.DrawInfo = protocol
    }

    public SetShenQiRecordInfo(protocol: PB_SCShenQiRecordInfo) {
        this.ResultData.RecordInfo = protocol
    }

    public CfgOtherShenQiEnergyId() {
        return CfgShenQiData.other[0].shenqi_energy_id ?? 0;
    }

    public CfgOtherShenQiChip() {
        return CfgShenQiData.other[0].shenqi_chip ?? 0;
    }

    public CfgOtherShenQiLotteryCost() {
        return CfgShenQiData.other[0].lottery_cost ?? 0;
    }

    public CfgOtherShenQiFreeRaffle() {
        return CfgShenQiData.other[0].free_raffle ?? 0;
    }

    public CfgOtherShenQiLevelNum() {
        return CfgShenQiData.other[0].level_num ?? 1;
    }

    public CfgOtherShenQiNumsByColor(color: number) {
        let nums = 0
        CfgShenQiData.turntable.forEach(element => {
            if (1 == element.type && color == element.color) {
                nums++;
            }
        })
        return nums
    }

    public CfgOtherShenQiEnergyByColor(color: number) {
        let co = CfgShenQiData.turntable.find(cfg => cfg.type == 1 && cfg.color == color);
        return co ? co.shenqi_energy : 0
    }

    public CfgShenQiInfoByCell(cell: number) {
        return CfgShenQiData.turntable.find(cfg => cfg.cell == cell);
    }

    public CfgShenQiInfoById(id: number) {
        return CfgShenQiData.shenqi_type.find(cfg => cfg.id == id);
    }

    public CfgShenQiInfoByIdLevel(id: number, level: number) {
        return CfgShenQiData.shenqi_type.find(cfg => cfg.id == id && cfg.level == level);
    }

    public GetShenQiShowList() {
        let show_list: any[] = []
        CfgShenQiData.turntable.forEach(element => {
            show_list.push(element)
        }
        )
        return show_list
    }

    public GetShenQiAttrShowList() {
        let show_list: any[] = []
        CfgShenQiData.activation_att.forEach(element => {
            show_list.push(element)
        }
        )
        return show_list
    }

    public GetShenQiInfoById(id: number) {
        return this.ResultData.ListInfo.shenqiList[id]
    }

    public GetShenQiProgressInfo(color: number) {
        let val = 0
        let max = this.CfgOtherShenQiLevelNum()
        CfgShenQiData.turntable.forEach(element => {
            if (1 == element.type && color == element.color) {
                let info = this.GetShenQiInfoById(element.pram)
                // let co = this.CfgShenQiInfoByIdLevel(element.pram, info.level + 1)
                val = val + info.level
                // max = max + (co ? co.exp : 0);

            }
        }
        )
        return { val, max }
    }

    public GetShenQiQuaLevel(color: number) {
        let level = 0
        for (let element of CfgShenQiData.turntable) {
            if (1 == element.type && color == element.color) {
                let info = this.GetShenQiInfoById(element.pram)
                level = level + info.level
            }
        }
        return level
    }

    public GetShenQiIsWearing(id: number) {
        return this.ResultData.OtherInfo.wearingId == id
    }

    public GetShenQiRecordShowList() {
        let show_list: any[] = []
        this.ResultData.RecordInfo.recordList.forEach(element => {
            if (element.time > 0) {
                show_list.push(element)

            }
        })
        return show_list
    }

    public GetMaxColor() {
        let info = this.ResultData.OtherInfo
        let color = ItemColor.Green
        if (info) {
            let co = this.CfgShenQiInfoById(info.wearingId ?? 0)
            color = co ? co.quality : color
        }
        return color
    }

    public GetShenQiRedNum() {
        let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.ShenQi.Main));
        if (!open_t.is_open) {
            return 0
        }

        if (CoreCrisisData.Inst().GetCoreRed(CoreCrisisType.ShenQi) == 1) {
            return 1
        }

        if ((ShenQiData.Inst().ResultData.OtherInfo.freeTimes > 0) || (BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiEnergyId()) >= ShenQiData.Inst().CfgOtherShenQiLotteryCost())) {
            return 1
        }

        let energy_num = BagData.Inst().getItemNum(ShenQiData.Inst().CfgOtherShenQiChip())
        for (let element of CfgShenQiData.turntable) {
            if (1 == element.type) {
                let info = ShenQiData.Inst().GetShenQiInfoById(element.pram)
                let co_next = ShenQiData.Inst().CfgShenQiInfoByIdLevel(element.pram, info.level + 1)
                if (co_next && ((info.level > 0 ? energy_num : 0) + info.num >= co_next.exp)) {
                    return 1

                }
            }
        }
        return 0
    }
}

import { math, sys, System } from "cc";
import { CfgItemRetrieve } from "config/CfgItemRetrieve";
import { CfgTerritoryData } from "config/CfgTerritory";
import { LogError } from "core/Debugger";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { ViewManager } from "manager/ViewManager";
import { Item } from "modules/bag/ItemData";
import { Mod } from "modules/common/ModuleDefine";
import { FishData } from "modules/fish/FishData";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { Long } from "protobufjs";
export class SItemRecyFlush {
    @smartdata
    flush_info: boolean = false
    @smartdata
    flush_red: boolean = false
    @smartdata
    flush_bag: boolean = false
}

export class ItemRecyclingData extends DataBase {
    FlushData: SItemRecyFlush = null
    level: number = 0
    exp: number | Long = 0
    bag_list: IPB_ItemData[] = []
    constructor() {
        super();
        this.createSmartData();
    }
    private createSmartData() {
        this.FlushData = CreateSMD(SItemRecyFlush);
    }
    protected onSwitch(): void {
        this.level = 0
        this.exp = 0
        this.bag_list = []
    }
    GetLevelCfg(level: number) {
        return CfgItemRetrieve.level[level]
    }
    GetItemCfg(item_id: number) {
        return CfgItemRetrieve.retrieve.find(cfg => { return cfg.seq == item_id })
    }
    SetInfo(data: IPB_SCItemRecycleInfo) {
        this.level = data.level
        this.exp = data.exp
        this.FlushData.flush_info = !this.FlushData.flush_info
    }
    SetAllInfo(data: IPB_SCItemRecycleListInfo) {
        this.bag_list = data.itemList ?? []
        this.FlushData.flush_bag = !this.FlushData.flush_bag
    }
    SetOneInfo(data: IPB_SCItemRecycleOneInfo) {
        if (this.bag_list) {
            let index = this.bag_list.findIndex(item => { return item.itemId == data.itemData.itemId })
            if (index == -1) {
                if (data.itemData.num != 0) {
                    this.bag_list.push(data.itemData)
                }
            } else {
                if (data.itemData.num == 0) {
                    //这里有问题
                    let temp: IPB_ItemData[] = []
                    this.bag_list[index] = null
                    this.bag_list.forEach(element => {
                        if (element != null) {
                            temp.push(element)
                        }
                    });
                    this.bag_list = temp
                } else {
                    this.bag_list[index] = data.itemData
                }
            }
        }
        this.FlushData.flush_bag = !this.FlushData.flush_bag
    }

    GetRedPoint() {
        let res = FunOpen.Inst().GetFunIsOpen(Mod.ItemRecycling.Main)
        if (res.is_open == false) {
            return 0
        }
        if (this.level != 0) {
            let cfg = this.GetLevelCfg(this.level)
            if (cfg == null) {
                return 0
            }
        }
        return (this.bag_list.length > 0 ? 1 : 0)
    }
}
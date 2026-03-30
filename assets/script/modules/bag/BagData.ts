import { DataBase } from "data/DataBase";
import { SMDMap } from "data/SMDMap";
import { CreateSMD, smartdata } from "data/SmartData";
import { BlockCtrl } from "modules/block/BlockCtrl";
import { BlockData } from "modules/block/BlockData";
import { EQUIP_TYPE, ITEM_BIG_TYPE, ITEM_BIG_TYPE_SORT } from "modules/common/CommonEnum";
import { AttrListName } from "modules/common/Language";
import { PublicPopupCtrl } from "modules/public_popup/PublicPopupCtrl";
import { RoleData } from "modules/role/RoleData";
import { AttrHelper } from "../../helpers/AttrHelper";
import { BagCtrl, KNAPSACK_REQ_TYPE } from "./BagCtrl";
import { Item } from "./ItemData";

export class BagItemData {
    @smartdata
    OtherChange: boolean; // 被动消耗类数据发生改变
    @smartdata
    EquipShiLianChange: boolean; //战利品数据发生变化 
    @smartdata
    GemItemChange: boolean; //宝石物品数据发生变化
    @smartdata
    TitleItemChange: boolean; //宝石物品数据发生变化
    @smartdata
    FragItemChange: boolean; //碎片物品数据发生变化
    @smartdata
    WaBaoItemChange: boolean; //挖宝物品数据发生变化
    @smartdata
    HarnessItemChange: boolean; //挖宝物品数据发生变化
    @smartdata
    BlockItemChange: boolean; //积木物品数据发生变化
    @smartdata
    BlockModelItemChange: boolean; //积木模型物品数据发生变化
}

export class BagData extends DataBase {
    public EquipmentData: SMDMap<number, IPB_EquipData>;
    public ItemData: SMDMap<number, number>;
    public BagItemData: BagItemData;
    public ItemTypeData: Map<number, Map<number, number>>

    constructor() {
        super();
        this.createSmartData();
    }

    public setAllItemInfo(data: PB_SCKnapsackAllInfo) {
        for (let i = 0; i < data.itemList.length; i++) {
            this.setItemNum(data.itemList[i]);
        }
    }

    public setSingleItemInfo(data: PB_SCKnapsackSingleInfo) {
        this.setItemNum(data.item, true)
    }

    protected onSwitch() {
        if (this.EquipmentData) {
            this.EquipmentData.clear();
        }
        if (this.ItemData) {
            this.ItemData.clear();
        }
        if (this.ItemTypeData) {
            this.ItemTypeData.clear();
        }
    }

    public setItemNum(data: IPB_ItemData, isSingle = false) {

        this.ItemData.set(data.itemId, data.num);

        let big_type = Item.GetBigType(data.itemId)
        switch (big_type) {
            case ITEM_BIG_TYPE.OTHER:/*  */
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.OtherChange = !this.BagItemData.OtherChange
                break
            case ITEM_BIG_TYPE.EQUIP_SHILIAN:
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.EquipShiLianChange = !this.BagItemData.EquipShiLianChange
                break;
            case ITEM_BIG_TYPE.GEM:
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.GemItemChange = !this.BagItemData.GemItemChange
                break;
            case ITEM_BIG_TYPE.TITLE_ITEM:
                if (isSingle) {
                    let attr_list = Item.GetTitleAttr(data.itemId)
                    for (let attr of attr_list) {
                        PublicPopupCtrl.Inst().CenterAttr(`${AttrListName[attr.type]} +${AttrHelper.Percent(attr.type, attr.add)}`, 1)
                    }
                    if (0 == RoleData.Inst().GetTitleId()) {
                        BagCtrl.Inst().SendCSKnapsackReq(KNAPSACK_REQ_TYPE.USE, [data.itemId, 1, 0])
                    } else {
                        RoleData.Inst().SetTitleRedInfo(data.itemId, data.num);
                    }
                }
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.TitleItemChange = !this.BagItemData.TitleItemChange
                break;
            case ITEM_BIG_TYPE.DEBRIS:
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.FragItemChange = !this.BagItemData.FragItemChange
                break;
            case ITEM_BIG_TYPE.WA_BAO:
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.WaBaoItemChange = !this.BagItemData.WaBaoItemChange
                break;
            case ITEM_BIG_TYPE.Block:
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.BlockItemChange = !this.BagItemData.BlockItemChange
                break;
            case ITEM_BIG_TYPE.BlockModel:
                if (isSingle) {
                    if (0 == BlockData.Inst().InfoMapId) {
                        BlockCtrl.Inst().SendShenQiReqMapWear(data.itemId)
                    }
                }
                this.ItemTypeData.set(big_type, this.getItemMap(big_type, data));
                this.BagItemData.BlockModelItemChange = !this.BagItemData.BlockModelItemChange
                break;
            // case ITEM_BIG_TYPE :
            //     this.BagItemData.EquipmentShiLianChange
            //     break;
        }
    }

    public getItemMap(big_type: number, data?: IPB_ItemData) {
        let map = this.ItemTypeData.get(big_type)
        map = map ? map : new Map()
        if (data) {
            map.set(data.itemId, data.num)
        }
        return map
    }

    public getItemNum(item_id: number) {
        let num = this.ItemData.get(+item_id);
        return num ? +num : 0;
    }

    private createSmartData() {
        this.EquipmentData = CreateSMD<SMDMap<number, IPB_EquipData>>(SMDMap);
        this.ItemData = CreateSMD<SMDMap<number, number>>(SMDMap);
        this.BagItemData = CreateSMD(BagItemData);
        this.ItemTypeData = new Map()
    }
    public SetEquipListInfo(index: number, data: IPB_EquipData) {
        this.EquipmentData.set(index, data);
    }

    //获取单个装备信息 装备索引index
    public GetEquipItemInfo(index: number): IPB_EquipData {
        return this.EquipmentData.get(index);
    }

    public GetEquipmentItemList(): IPB_EquipData[] {
        let list: IPB_EquipData[] = [];
        for (let i = EQUIP_TYPE.INVALID + 1; i < EQUIP_TYPE.Max; i++) {
            list.push(BagData.Inst().GetEquipItemInfo(ITEM_BIG_TYPE_SORT[i]));
        }
        return list;
    }

    public GetNumByItemId(item_id: number): number {
        let count = 0
        // let bagType = Item.GetBagType(item_id);
        // if (bagType > 0) {
        //     if (self.allBagDataMap.has(bagType)) {
        //         let data = self.allBagDataMap.get(bagType);
        //         for (const iterator of data) {
        //             if (count !== 0 && item_id !== iterator.itemData.itemId) break;
        //             if (item_id === iterator.itemData.itemId) {
        //                 count = count + iterator.itemData.itemNum;
        //                 //break;
        //             }
        //         }
        //     }
        // }
        return count;
    }

    public GetEquipIsSelf(type: number, id: number) {
        let equip_list_data: IPB_EquipData[] = BagData.Inst().GetEquipmentItemList();
        if (equip_list_data) {
            for (let i = 0; i < equip_list_data.length; i++) {
                let equip = equip_list_data[i];
                if (equip != undefined && equip.equipType == type && equip.itemId == id) {
                    return true
                }
            }
        }
        return false
    }
}
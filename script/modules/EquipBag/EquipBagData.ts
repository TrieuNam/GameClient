import { ForwardPipeline } from "cc";
import { DataBase } from "data/DataBase";
import { CreateSMD, smartdata } from 'data/SmartData';

export class EquipResultData {
    @smartdata
    is_change: boolean;
}

const EQUIP_BAG_MAX = 256 //装备背包最大数量

export class EquipBagData extends DataBase {
    private result_info: EquipResultData;
    private equip_bag_list: Map<number, IPB_EquipBagData>;//背包数据  
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {
        this.result_info = CreateSMD(EquipResultData);
        this.equip_bag_list=new Map();
    }

    public get ResultData(){
        return this.result_info;
    }

    /**装备背包总数据 */
    public SetEquipBagListInfo(data: PB_SCEquipBagListInfo){
        for(let i=0;i<data.bagList.length;i++ ){
            this.SetEquipBagInfo(data.bagList[i]);
        }
    }

    /**装备背包单个数据 */
    public SetEquipBagOneInfo(data:PB_SCEquipBagOneInfo){
        this.SetEquipBagInfo(data.bagData);
        this.result_info.is_change = !this.result_info.is_change;
    }

    /**处理下发的装备数据 */
    public SetEquipBagInfo(data: IPB_EquipBagData){
        if(data.bagData.itemId==0){
             this.equip_bag_list.delete(data.index);
        }else{
            this.equip_bag_list.set(data.index,data);
        }
    }

    /**装备背包是否上限 */
    public IsEquipBagMax(){
        return this.equip_bag_list.size >= EQUIP_BAG_MAX;
    }

    /**背包内是否有装备未处理 */
    public IsEquipToDetail(){
        return this.equip_bag_list.size > 0;
    }

    /**
     * 取装备数据
     * @param type 部位，为-1时取任一装备
     */
    public GetEquipData(type: number) {
        let data: IPB_EquipBagData;
        this.equip_bag_list.forEach((value, key) => {
            if (type == -1 || value.bagData.equipType == type) {
                data = value;
                return;
            }
        })
        return data;
    }
}
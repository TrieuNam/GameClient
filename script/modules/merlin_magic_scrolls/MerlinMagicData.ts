import { CfgScrollItem, CfgScrollItemData } from "config/CfgScrollItem";
import { DataBase } from "data/DataBase";
import { smartdata, CreateSMD } from "data/SmartData";

export class SMerlinFlush {
    @smartdata
    flush_info: boolean = false//切换
    @smartdata
    flush_list: boolean = false
    @smartdata
    flush_bot: boolean = false
    @smartdata
    flush_log: boolean = false
    @smartdata
    flush_red: boolean = false
}
export class ScrollQuaList {
    color: number = 0
    list: CfgScrollItem[]
}
export class MerlinMagicData extends DataBase {
    FlushData: SMerlinFlush = null
    item_qua_map: ScrollQuaList[] = []
    scroll_list: IPB_ScrollData[] = null
    constructor() {
        super();
        this.createSmartData();
    }
    private createSmartData() {
        this.FlushData = CreateSMD(SMerlinFlush);
    }
    protected onSwitch(): void {
    }

    //获取卷轴按品质分类
    GetPokedexScroll() {
        if (this.item_qua_map.length == 0) {
            let item_map = Object.values(CfgScrollItemData)
            let temp_list: any[] = []
            item_map.forEach(element => {
                if (!temp_list[element.color]) {
                    temp_list[element.color] = []
                }
                temp_list[element.color].push(element)
            });
            for (const key in temp_list) {
                if (Object.prototype.hasOwnProperty.call(temp_list, key)) {
                    const element = temp_list[key];
                    const data = new ScrollQuaList()
                    data.color = +key
                    data.list = element
                    this.item_qua_map.push(data)
                }
            }
            this.item_qua_map = this.item_qua_map.reverse()
        }
        return this.item_qua_map
    }
}
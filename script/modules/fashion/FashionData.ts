import { CfgFashion, CfgFashionClothes, CfgFashionClothesUp } from "config/CfgFashion";
import { LogError } from "core/Debugger";
import { CreateSMD, smartdata } from "data/SmartData";
import { Item } from "modules/bag/ItemData";
import { Mod } from "modules/common/ModuleDefine";
import { CommGetData, CommGetType } from "modules/common_account/CommonGetView";
import { FunOpen } from "modules/guide/FunOpen";
import { RoleData } from "modules/role/RoleData";
import { DataBase } from "../../data/DataBase";

/*
class LoginResultData{
    @smartdata
    result:number;
}
*/
export enum FASHION_TYPE {
    HU_DUN,
    KAI_JIA,
    WU_QI,
    TOU_KUI,
}
export class SFashionFlush {
    @smartdata
    select_index: number
    @smartdata
    tab_flush: boolean
    @smartdata
    flush_all: boolean
    @smartdata
    flush_single: boolean
}

export class FashionData extends DataBase {
    //public ResultData : LoginResultData;
    FlushData: SFashionFlush = null;

    FashionList: IPB_ShiZhuangData[] = [];

    select_index: number = 0
    clothes_index: number = 0
    select_clothes: CfgFashionClothes;

    clothes_list: CfgFashionClothes[][] = []//根据类型存的
    clothes_list2: CfgFashionClothes[][] = []
    clothes_level_list: CfgFashionClothesUp[][] = []
    click_jihuo: boolean = false
    active_info: number[] = [];

    private fashion_show_data: CommGetData;
    constructor() {
        super();
        this.createSmartData();
    }

    private createSmartData() {


        this.FlushData = CreateSMD(SFashionFlush);

    }

    GetClothesData(clothes_type: number) {
        if (this.clothes_list[clothes_type] == null) {
            this.clothes_list[clothes_type] = []
            CfgFashion.clothes.forEach(element => {
                if (element.clothes_type == clothes_type) {
                    this.clothes_list[clothes_type].push(element)
                }
            });
        }
        return this.clothes_list[clothes_type]
    }
    GetClothesData2() {
        if (this.clothes_list2[0] == null) {
            CfgFashion.clothes.forEach(element => {
                if (this.clothes_list2[element.suit_id - 1] == null) {
                    this.clothes_list2[element.suit_id - 1] = []
                }
                this.clothes_list2[element.suit_id - 1].push(element)
            });
        }
        return this.clothes_list2
    }
    GetClothesLevel(clothes_id: number, level: number) {
        if (this.clothes_level_list[clothes_id] == null) {
            this.clothes_level_list[clothes_id] = []
            CfgFashion.clothes_up.forEach(element => {
                if (element.clothes_id == clothes_id) {
                    this.clothes_level_list[clothes_id].push(element);
                }
            });
        }
        return this.clothes_level_list[clothes_id][level - 1]
    }

    GetClothesInfo(clothes_id: number) {
        let info: IPB_ShiZhuangData = null
        this.FashionList.forEach(element => {
            if (element.id == clothes_id) {
                info = element
            }
        });
        return info
    }
    //level > 0 激活 
    //是否穿戴
    GetClothesOnBody(clothes_type: number, clothes_id: number) {
        switch (clothes_type) {
            case FASHION_TYPE.HU_DUN:
                return RoleData.Inst().ResultData.appearance.surfaceShield == clothes_id
            case FASHION_TYPE.KAI_JIA:
                return RoleData.Inst().ResultData.appearance.surfaceBody == clothes_id
            case FASHION_TYPE.WU_QI:
                return RoleData.Inst().ResultData.appearance.surfaceWeapon == clothes_id
            case FASHION_TYPE.TOU_KUI:
                return RoleData.Inst().ResultData.appearance.surfaceHead == clothes_id
            default:
                return false
        }
    }
    GetFashionItemId(clothes_id: number): number {
        let item_id = 0
        CfgFashion.clothes.forEach(element => {
            if (clothes_id == element.clothes_id) {
                item_id = element.clothes_item
            }
        });
        return item_id
    }

    GetCFGFashionClothesId(clothes_id: number): CfgFashionClothes {
        let item;
        CfgFashion.clothes.forEach(element => {
            if (clothes_id == element.clothes_id) {
                item = element;
                return;
            }
        });
        return item;
    }

    GetCFGFashionResId(res_id: number): CfgFashionClothes {
        let item;
        CfgFashion.clothes.forEach(element => {
            if (res_id == element.res_id) {
                item = element;
                return;
            }
        });
        return item;
    }

    GetMaxQua() {
        let qua_level = 3
        this.FashionList.forEach(element => {
            let item_id = this.GetFashionItemId(element.id)
            qua_level = Math.max(Item.GetQuality(item_id), qua_level)
        });
        return qua_level
    }
    GetActiveRedPoint() {
        let num = 0
        for (let index = 0; index < 4; index++) {
            num = this.GetRedPointByClothesType(index)
            if (num > 0) {
                break
            }
        }
        return num
    }
    GetClothesRedPoint(element: CfgFashionClothes) {
        let num = 0;
        let info = this.GetClothesInfo(element.clothes_id)
        if (info == null) {
            if (Item.GetNum(element.clothes_item) > 0) {
                num = 1
            }
        } else {
            let levelCfg = this.GetClothesLevel(element.clothes_id, info.level)
            let nextCfg = this.GetClothesLevel(element.clothes_id, info.level + 1)
            if (nextCfg != null) {
                if (Item.GetNum(levelCfg.up_item) >= nextCfg.up_item_num) {
                    num = 1
                }
            }
        }
        return num
    }
    GetRedPointByClothesType(type: number) {
        let num = 0
        let data = this.GetClothesData(type)
        if (data == null) {
            return num
        }
        data.forEach(element => {
            if (this.GetClothesRedPoint(element) > 0) {
                num = 1
            }
        });
        return num
    }
    /* GetUplevelRedPoint() {
        let num = 0
        CfgFashion.clothes.forEach(element => {
            let info = this.GetClothesInfo(element.clothes_id)
            if (info != null) {
                let levelCfg = this.GetClothesLevel(element.clothes_id, info.level)
                let nextCfg = this.GetClothesLevel(element.clothes_id, info.level + 1)
                if (nextCfg != null) {
                    if (Item.GetNum(levelCfg.up_item) > 0) {
                        num = 1
                    }
                }
            }
        });
        return num
    } */
    GetRedPoint() {
        //可激活 
        //可升
        let num = 0
        let res = FunOpen.Inst().GetFunIsOpen(Mod.Fashion.View)
        if (!res.is_open) {
            return num
        }
        num = this.GetActiveRedPoint()
        /* if (num == 1) {
            return num
        }
        num = this.GetUplevelRedPoint() */
        return num


        // let result = FunOpen.Inst().GetFunIsOpen(Mod.Fashion.View)
        // if (result.is_open == false) {
        //     return 0;
        // }


    }

    CfgClothesItem(item_id: number) {
        return CfgFashion.clothes.find(cfg => cfg.clothes_item == item_id);
    }

    ClothesTotalLevel() {
        let level = 0
        this.FashionList.forEach(element => {
            level = level + element.level
        });
        return level
    }

    //时装获得展示页面数据
    public SetFashionShowData(item_id: number,call_back:Function=null) {
        let cfg_data: CfgFashionClothes = this.CfgClothesItem(item_id);
        LogError("设置时装获得展示页面数据", cfg_data)
        this.fashion_show_data = new CommGetData(
            Item.GetName(cfg_data.clothes_item),
            cfg_data.jihuo_att,
            Item.GetColor(cfg_data.clothes_item),
            1,
            CommGetType.Fashion,
            1,
            cfg_data.clothes_item,
            call_back);

    }
    public GetFashionShowData() {
        return this.fashion_show_data;
    }
}

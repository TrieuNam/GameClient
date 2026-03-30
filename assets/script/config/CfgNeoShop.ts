import { JsonAsset } from "cc";
import { ResManager } from "manager/ResManager";
import { Debugger } from "core/Debugger";
import { CfgItem,CfgAttrUp } from "./CfgCommon";

const resPath = "config/jishishangdian_auto";

export function _CreateCfgNeoShop(func: (suc: boolean) => void) {
    ResManager.Inst().Load<JsonAsset>(resPath, (err, jsonAss) => {
        CfgNeoShopData = <_CfgNeoShopData>jsonAss.json;
        func(err == null);
    })
}

class CfgNeoShopConfig {
    type:number;
    item_group:number;
    level_min:number;
    level_max:number;
 }

class CfgNeoShopItemGroup{
    group_id:number;
    seq:number;
    item:any;
    rate:number;
    price_type:number;
    price:number;
    limit_convert_count:number;
    discount:number;
}

class CfgOther {
    auto_time:number; // 自动刷新时间 0=不自动刷新
    manual_price_type:number; // 手动刷新消耗货币类型
    manual_price:number; // 手动刷新需要货币数
    item_first:number; //0 不支持道具刷新，1 支持道具刷新
    item:any; // 道具id 
    time_refresh_free:number; // 免年费刷新时间 秒
    time:number;     // 活动持续时间 天
    is_open:number; // 是否开启
    daily_refresh_times:number;
}

class _CfgNeoShopData {
    shop_configuration:CfgNeoShopConfig[];
    item_group:CfgNeoShopItemGroup[];
    other:CfgOther[];
}

export let CfgNeoShopData: _CfgNeoShopData = null;

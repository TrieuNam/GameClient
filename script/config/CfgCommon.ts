import { BATTLE_ATTR } from "modules/common/CommonEnum";

export class CfgItem {
    item_id: number;
    num: number;

    constructor(item_id: number, num: number=1) {
        this.item_id = item_id;
        this.num = num;
    }

    get itemId(){
        return this.item_id;
    }
}

export class CfgItemGift {
    item_id: number;
    num: number;
    rate: number;

    constructor(item_id: number, num: number=1, rate: number=0) {
        this.item_id = item_id;
        this.num = num;
        this.rate = rate;
    }

    get itemId(){
        return this.item_id;
    }
}


export class CfgAttrUp  {
    type: BATTLE_ATTR;
    add: number;
    constructor(type: number, value: number) {
        this.type = type;
        this.add = value;
    }
}

export function GetCfgValue(cfg:any, key:string|number)
{
    return cfg[key];
}
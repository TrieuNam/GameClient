import { Vec2 } from "cc";
import { CfgNewSuperStar, CfgStarMapData } from "config/CfgStarmap";
import { CreateSMD, smartdata, SMDTriggerNotify } from "data/SmartData";
import { Item } from "modules/bag/ItemData";
import { DataBase } from "../../data/DataBase";

export interface IStarMapSuperNewGroupItemData{
    star_id?: number;
    list?:CfgNewSuperStar[];
}

export enum StarMapNodeState{
    Hide = 0,       // 未激活
    CanActive = 1,  // 可激活
    Show = 2,       // 已激活
}

class SelNodeInfo{
    @smartdata
    star_node:CfgNewSuperStar;

    pos:Vec2;
}

class StarSuperInfo{
    @smartdata
    bigStarMapLevel:number[]        // index是线路， value 是当前激活到哪个节点
    @smartdata
    bigStarConsume:number[]         // index是线路， value 是当前线路消耗的倍数
}

export class StarMapSuperData extends DataBase {
    selNodeInfo:SelNodeInfo;
    starInfo:StarSuperInfo;

    constructor(){
        super();
        this.createSmartData();
    }

    private createSmartData(){
        this.selNodeInfo = CreateSMD(SelNodeInfo);
        this.starInfo = CreateSMD(StarSuperInfo);
    }


    SetStarSuperInfo(protocol:PB_SCStarMapInfo){
        this.starInfo.bigStarMapLevel = [];
        this.starInfo.bigStarConsume = [];
        if(protocol == null){
            return
        }
        for(let route = 0; route < protocol.nbStarList.length; ++route){
            this.starInfo.bigStarMapLevel.push(protocol.nbStarList[route].bigStarMapLevel);
            this.starInfo.bigStarConsume.push(protocol.nbStarList[route].bigStarConsume);
        }
    }
    GetStarSuperInfo(){
        return this.starInfo
    }
    SetRouteLevel(route:number, value:number){
        SMDTriggerNotify(this.starInfo, "bigStarMapLevel");
        this.starInfo.bigStarMapLevel[route] = value;
    }
    GetRouteLevel(route:number){
        return this.starInfo.bigStarMapLevel[route] ?? -1;
    }
    SetRouteConsume(route:number, value:number){
        SMDTriggerNotify(this.starInfo, "bigStarConsume");
        this.starInfo.bigStarConsume[route] = value;
    }
    GetRouteConsume(route:number){
        return this.starInfo.bigStarConsume[route] ?? 1;
    }


    GetNodeState(route:number, id:number):StarMapNodeState{
        let level = this.GetRouteLevel(route);
        if(id - level > 1 ){
            return StarMapNodeState.Hide;
        }else if(id - level == 1){
            return StarMapNodeState.CanActive;
        }else{
            return StarMapNodeState.Show;
        }
    }

    GetNodeStateByData(data:CfgNewSuperStar):StarMapNodeState{
        return this.GetNodeState(data.route, data.star_id);
    }

    // 获取线路消耗的材料倍数
    GetStuffMultiple(route:number){
        return this.GetRouteConsume(route);
    }

    GetGroupItemDatas():IStarMapSuperNewGroupItemData[]{
        let list:IStarMapSuperNewGroupItemData[] = [{}];
        let cfg = CfgStarMapData.new_superstar;
        let node_cfg;
        for(let i = 0; i < cfg.length; ++i){
            node_cfg = cfg[i];
            if(list[node_cfg.star_id + 1] == null){
                let data:IStarMapSuperNewGroupItemData = {
                    star_id:node_cfg.star_id,
                    list:[],
                }
                list[node_cfg.star_id + 1] = data;
            }
            list[node_cfg.star_id + 1].list.push(node_cfg);
        }
        list.push({})
        return list;
    }

    // 超星系节点信息
    GetNodeLevelCfg(route:number, id:number):CfgNewSuperStar{
        let cfg = CfgStarMapData.new_superstar;
        return cfg.find((v)=>{
            return v.route == route && v.star_id == id;
        })
    }


    // 所有属性
    GetSuperStarAllAttr(){
        let map = new Map();
        let cfg = CfgStarMapData.new_superstar;
        for(var v of cfg){
            var state = this.GetNodeStateByData(v);
            if(state == StarMapNodeState.Show){
                if(v.jihuo_att.length > 0){
                    var attr = v.jihuo_att[0];
                    if(!map.has(attr.type)){
                        map.set(attr.type, {attrType: attr.type, attrValue: attr.add});
                    }else{
                        map.get(attr.type).attrValue += attr.add;
                    }
                }
            }
        }
        return Array.from(map.values());
    }

    GetSuperStarResetItem(){
        let cfg = CfgStarMapData.new_superstar;
        let item_map = new Map();
        cfg.forEach(v=>{
            var state = this.GetNodeStateByData(v);
            if(state == StarMapNodeState.Show){
                let cost_item = v.cost_item[0];
                let item_num = this.GetStuffMultiple(v.route) * cost_item.num;
                if(!item_map.has(cost_item.item_id)){
                    item_map.set(cost_item.item_id,{item_id: cost_item.item_id, num: item_num});
                }else{
                    item_map.get(cost_item.item_id).num += item_num;
                }
            }
        })

        let list:any[] = [];
        item_map.forEach(value => {
            list.push(Item.Create(value,{is_num:true}));
        });
        return list;
    }

    //是否满足激活条件 1可激活 0不可激活 -1已激活
    GetActiveFlag(data:CfgNewSuperStar):number{
        let state = this.GetNodeStateByData(data);
        if(state == StarMapNodeState.Show){
            return -1;
        }else if(state == StarMapNodeState.Hide){
            return 0
        }else{
            let has_num = Item.GetNum(data.cost_item[0].item_id);
            if(has_num >= data.cost_item[0].num){
                return 1
            }else{
                return 0
            }
        }
    }

    //红点提醒
    GetSuperRemind(){
        let cfg = CfgStarMapData.new_superstar;
        for(var v of cfg){
            let flag = this.GetActiveFlag(v);
            if(flag > 0){
                return 1;
            }
        }
        return 0;
    }
}

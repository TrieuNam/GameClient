
import { LogError } from 'core/Debugger';
import { DataBase } from "../../data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { COLORSTR } from "modules/common/ColorEnum";
import { Language } from 'modules/common/Language';
import { CfgServerBoxOpenData } from "config/CfgSeverBoxOpen";
import { CfgNeoServerData } from 'config/CfgNeoServer';
import { Item } from 'modules/bag/ItemData';
import { RoleData } from 'modules/role/RoleData';
import { CfgSevenDaysData } from 'config/CfgSevenDay';
import { OpenServerCtrl, SEVEN_DAY_REQ_TYPE } from './OpenServerCtrl';
import { PublicPopupCtrl } from 'modules/public_popup/PublicPopupCtrl';
import { CfgNeoShopData } from 'config/CfgNeoShop';
import { CommonId } from 'modules/common/CommonEnum';
import { Mod } from 'modules/common/ModuleDefine';
import { FunOpen } from 'modules/guide/FunOpen';
import { OpenServerBoxOpen } from './OpenServerBoxOpen';
import { OpenServerNeoServer } from './OpenServerNeoServer';
import { OpenServerNeoShop } from './OpenServerNeoShop';
import { OpenServerSevenDays } from './OpenServerSevenDays';
import { TimeCtrl } from 'modules/time/TimeCtrl';

class OpenServerInfo {
    @smartdata 
    sevendays_needflush:number;
    @smartdata 
    boxopen_needflush:number;
    @smartdata 
    neoserver_needflush:number;
    @smartdata 
    neoshop_needflush:number;
}

export let OpenServerBase: { [key: number]: any } = {
    [0]:{index:0,name:Language.OpenServer.Title[0],icon:"QiRiDengLu",panel_res:"ex_SevenDays"},
    [1]:{index:1,name:Language.OpenServer.Title[1],icon:"KaiXiangDaJi",panel_res:"ex_BoxOpen"},
    [2]:{index:2,name:Language.OpenServer.Title[2],icon:"XinFuTeHui",panel_res:"ex_NeoServer"},
    [3]:{index:3,name:Language.OpenServer.Title[3],icon:"JiShiShangDian",panel_res:"ex_NeoShop"},
}

export class OpenServerData extends DataBase{
    public flush_info: OpenServerInfo;
    public box_open_info:any
    public neo_server_info:any
    public seven_days_info:any
    public neo_shop_info:any
    private end_timer:any
    

    constructor() {
        super();
        this.createSmartData();
        this.end_timer = []
    }
    private createSmartData() {
        this.flush_info = CreateSMD(OpenServerInfo);
        this.flush_info.sevendays_needflush = 0
        this.flush_info.boxopen_needflush = 0
        this.flush_info.neoserver_needflush = 0
        this.flush_info.neoshop_needflush = 0
    }

    // 七日签到
    public SetSevenDaysInfo(data:PB_SCSevenDaySignInfo){
        let info = {
            end_timestamp: data.endTimestamp,   
            days:data.days,
            receive_flag:data.receiveFlag,
        }
        this.seven_days_info = info
        
        this.end_timer[Mod.OpenServer.ServerDays] = data.endTimestamp
        this.flush_info.sevendays_needflush = this.flush_info.sevendays_needflush + 1
    }

    public ForceFlushSevenDays()
    {
        this.flush_info.sevendays_needflush = this.flush_info.sevendays_needflush + 1
    }

    // 开箱大吉
    public SetBoxOpenInfo(data:PB_SCLuckUnpackingInfo){
        let info = {
            end_timestamp: data.endTimestamp,   
            receive_flag: data.receiveFlag,   
            open_box_num: data.openBoxNum,   
            box_level: data.boxLevel,   
        }
        this.box_open_info = info
        this.end_timer[Mod.OpenServer.OpenBox] = data.endTimestamp
        this.flush_info.boxopen_needflush = this.flush_info.boxopen_needflush + 1
    }

    public ForceFlushBoxOpen()
    {
        this.flush_info.boxopen_needflush = this.flush_info.boxopen_needflush + 1
    }

    // 新服特惠
    public SetNeoServerInfo(data:PB_SCNewAreaPreferentialInfo){
        let info = {
            end_timestamp: data.endTimestamp,   
            buy_times: data.buyTimes,   
        }
        this.neo_server_info = info

        this.end_timer[Mod.OpenServer.NeoServer] = data.endTimestamp
        this.flush_info.neoserver_needflush = this.flush_info.neoserver_needflush + 1
    }

    public ForceFlushNeoServer()
    {
        this.flush_info.neoserver_needflush = this.flush_info.neoserver_needflush + 1
    }

    // 集市商店
    public SetNeoShopInfo(data:PB_SCMarketShopInfo){
        let info = {
            end_timestamp: data.endTimestamp,   
            next_free_refresh_timestamp:data.nextFreeRefreshTimestamp,
            next_auto_refresh_timestamp:data.nextAutoRefreshTimestamp,
            cur_shop_group:data.curShopGroup,
            shop_goods_seq:data.shopGoodsSeq,
            shop_buy_times:data.shopBuyTimes,
            random_cnts:data.randomCnts,
        }
        this.neo_shop_info = info

        this.end_timer[Mod.OpenServer.NeoShop] = data.endTimestamp
        this.flush_info.neoshop_needflush = this.flush_info.neoshop_needflush + 1
    }

    public ForceFlushNeoShop()
    {
        this.flush_info.neoshop_needflush = this.flush_info.neoshop_needflush + 1
    }

    public GetBoxOpenParam()
    {
        if(this.box_open_info == null){
            return {
                timer:0,
                box_list:[],
            }
        }
        let timer = this.box_open_info.end_timestamp
        let box_list = []
        let cfg = CfgServerBoxOpenData.reward
        for(var index in cfg){
            let order = this.box_open_info.receive_flag.toString(2).split("").reverse().map(Number)[cfg[index].type]
            let info = {
                type:cfg[index].type,
                type_box_num:cfg[index].type_box_num,
                type_num:cfg[index].type_num,
                // reward_item:Item.Create({item_id:cfg[index].reward_item.item_id,num:cfg[index].reward_item.num},{is_num : true}) ,
                reward_item:cfg[index].reward_item,


                is_get:order==1,
                cur_num:cfg[index].type_box_num == 1 ?  this.box_open_info.open_box_num : this.box_open_info.box_level,

                order:(order == null) ? 0 : order,
            }

            box_list.push(info)
        }

        box_list.sort((a, b) => a.order == b.order ? a.type - b.type  : a.order - b.order )
        return {
            timer:timer,
            box_list:box_list,
        }
    }

    public GetNeoServerParam()
    {
        let timer =this.neo_server_info.end_timestamp
        let server_list = []
        let cfg = CfgNeoServerData.reward
        let level = RoleData.Inst().GetRoleLevel()
        for(var index in cfg){
            if(level >=cfg[index].level_min && level <= cfg[index].level_max){
                let rewards = cfg[index].reward_item
                let rewars_list = []
                for(var r_index in rewards){
                    let cell = Item.Create({item_id:rewards[r_index].item_id,num:rewards[r_index].num},{is_num : true})
                    rewars_list.push(cell)
                }
                let last_time = cfg[index].buy_times - this.neo_server_info.buy_times[cfg[index].seq]
                let info = {
                    type:cfg[index].type,
                    seq:cfg[index].seq,
                    name_box:cfg[index].name_box,
                    price_type:cfg[index].price_type,
                    limit_type:cfg[index].limit_type,
                    buy_times:cfg[index].buy_times,
                    buy_money:cfg[index].buy_money,
                    rewars_list:rewars_list,

                    buyed_times:this.neo_server_info.buy_times[cfg[index].seq],

                    is_direct:cfg[index].price_type ==3,
                    order:(last_time > 0) ? 1 : 0,

                }
                server_list.push(info)
            }
        }

        server_list.sort((a, b) => a.order == b.order ? a.type - b.type : b.order - a.order )

        return {
            timer:timer,
            server_list:server_list,
        }
    }

    public GetSevenParam(){
        let seven_list = []
        let config = CfgSevenDaysData.reward
        for(var index in config){
            let is_done = this.seven_days_info.receive_flag.toString(2).split("").reverse().map(Number)[config[index].login_days]==1
            let info = {
                is_done:is_done,
                item:Item.Create({itemId:config[index].reward_item.item_id,num:config[index].reward_item.num}, { is_num: true, is_click: true }),
                days:config[index].login_days,
                seq:config[index].seq,
                is_can:!is_done && this.seven_days_info.days>=config[index].login_days,
            }
            seven_list.push(info)
        }
        return {
            timer:this.seven_days_info.end_timestamp,
            seven_list:seven_list,
        }
    }

    public TryGetSevenRewards(){
        let param = this.GetSevenParam()
        let send_flag = true
        let flag_pass = 0
        //LogError("?sssss",param.seven_list)
        for (var index in param.seven_list){
            let oper = param.seven_list[index]
            if(oper.is_done){
                flag_pass = flag_pass + 1
            }
            
            if(!oper.is_done && oper.days <= this.seven_days_info.days)
            {
                send_flag = false
                OpenServerCtrl.Inst().SendCSSevenDaySignReq(SEVEN_DAY_REQ_TYPE.RECEIVE,oper.days)
                break
            }
        }
        if(send_flag){
            PublicPopupCtrl.Inst().Center(flag_pass == 7 ? Language.OpenServer.SevensDaysDaysEndError :Language.OpenServer.SevensDaysDaysError);  
        }
    }

    public GetNeoShopParam(){
        let shop_list = []
        let config = CfgNeoShopData.item_group
        let group = this.neo_shop_info.cur_shop_group
        let show_items = this.neo_shop_info.shop_goods_seq
        let show_times = this.neo_shop_info.shop_buy_times
        let limit = 0
        
        for(var index in CfgNeoShopData.shop_configuration)
        {
            if(this.neo_shop_info.cur_shop_group == CfgNeoShopData.shop_configuration[index].item_group){
                limit = limit + 1
            }
        }
        let total = 0
        for(var index in show_items){
            let cfg = null
            for(var c_index in config){
                if(config[c_index].seq == show_items[index] && config[c_index].group_id == group){
                    cfg = config[c_index]
                }
            }
            if(cfg != null)
            {
                let buy_param = {
                    item_id:cfg.price_type == 3 ? 0 : (cfg.price_type == 1 ? CommonId.Diamond : CommonId.Gold),
                    need_num:cfg.price
                }
                let item_cell = Item.Create({itemId:cfg.item.item_id,num:cfg.item.num}, { is_num: true, is_click: true })
                let info = {
                    seq:Number(index),
                    is_effect:show_times[index] < cfg.limit_convert_count,
                    buyed_times:show_times[index],
                    is_offprice:cfg.discount < 10,
                    item:item_cell,
                    buy_param:buy_param,
                    is_long_name:item_cell.Name().length > 4,
                    offprice:cfg.discount,
                    price_type:cfg.price_type,
                }
                if(total < limit){
                    shop_list.push(info)
                    total = total + 1
                }
                
            }
        }

        let day_flush_time = CfgNeoShopData.other[0].daily_refresh_times - this.neo_shop_info.random_cnts
        return {
            timer:this.neo_shop_info.end_timestamp,
            flush_timer:this.neo_shop_info.next_free_refresh_timestamp,
            shop_list:shop_list,
            day_flush_max:CfgNeoShopData.other[0].daily_refresh_times,
            day_flush_show:day_flush_time >= 0 ? day_flush_time  : 0 ,
            flush_need_item_id:CfgNeoShopData.other[0].manual_price_type == 1 ? CommonId.Diamond : CommonId.Gold,
            flush_need_num:CfgNeoShopData.other[0].manual_price,
        }
    }

    public CheckOpenShopDayFlushTimeDone()
    {
        return CfgNeoShopData.other[0].daily_refresh_times - this.neo_shop_info.random_cnts <= 0
    }

    public GetOpenServerBase(){
        let fix_list = []
        for(var index in OpenServerBase){
            let info = {
                index:Number(index),
                name:OpenServerBase[index].name,
                icon:OpenServerBase[index].icon,
                show_red:this.GetOpenServerRed(Number(index)),
            }
            fix_list.push(info)
        }
        return fix_list
    }

    public GetOpenServerRed(index:number){
        if(index == 0){
            for(let i = 1 ; i < 8 ;i++){
                let is_done = this.seven_days_info.receive_flag.toString(2).split("").reverse().map(Number)[i]==1
                if( !is_done && i <= this.seven_days_info.days){
                    return 1
                }
            }
        }
        if(index == 1){
            let param = this.GetBoxOpenParam()
            for(var c_index in param.box_list){
                let oper = param.box_list[c_index]
                if(!oper.is_get && oper.cur_num >= oper.type_num)
                {
                    return 1
                }
            }
        }
        return 0
    }

    public GetRedNum()
    {
        let red_num = 0
        
        if(!this.GetOpenServerIsOpen())
        {
            return red_num
        }

        for(var index in OpenServerBase){
            if(this.GetOpenServerRed(Number(index)) == 1){
                red_num = red_num + 1
            }
        }
        return red_num > 0 ? 1:0
    }

    public GetOpenServerIsOpen()
    {
        for(var keyname in Mod.OpenServer){
            if(keyname != "View"){
                let open_t = FunOpen.Inst().GetFunIsOpen(Number(Mod.OpenServer[keyname]));
                if(open_t.is_open){
                    return this.end_timer[Mod.OpenServer[keyname]] > TimeCtrl.Inst().ServerTime
                }
            }
        }
        return false
    }
}
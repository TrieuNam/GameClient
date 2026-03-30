import { LogError } from 'core/Debugger';
import { color, _decorator } from 'cc';
import * as fgui from "fairygui-cc";
import { DataBase } from "../../data/DataBase";
import { CreateSMD, smartdata } from "data/SmartData";
import { TimeCtrl } from "modules/time/TimeCtrl";
import { Language } from 'modules/common/Language';
import { CfgDuoBaoData } from 'config/CfgDuobao';
import { BagData } from 'modules/bag/BagData';
import { TextHelper } from '../../helpers/TextHelper';
import { COLORSTR, QualityColorOLStr, QualityColorStr } from 'modules/common/ColorEnum';
import { Item } from 'modules/bag/ItemData';
import { DataHelper } from '../../helpers/DataHelper';
import { FunOpen } from 'modules/guide/FunOpen';
import { Mod } from 'modules/common/ModuleDefine';

// export enum MOUNR_RET_TYPE{
//     LEVEL_UP = 0, // 升级 P1:id p2:level
//     GRADE_UP = 1, // 升阶 P1:id p2:grade
//     EXPLORE = 2,  // 探索 p1:id p2:time
//     SET_APP = 3,  // 设置幻化 p1:id
// }

class DuoBaoFlushInfo {
    @smartdata 
    needflush:number;
}

export class LoopMineData extends DataBase{
    public flush_info: DuoBaoFlushInfo;
    private duobao_info: any;
    private duobao_item_info: any;
    private duobao_record: any;
    private draw_mark:any
    private draw_mark_times:number
    private view:any
    private mark_parm:any
    private jump_play:any
    constructor() {
        super();
        this.createSmartData();

        this.duobao_info = []
        this.duobao_item_info = []
        this.duobao_record = []
        this.jump_play = false
    }

    private createSmartData() {
        this.flush_info = CreateSMD(DuoBaoFlushInfo);
        this.flush_info.needflush = 0
    }

    public SetSCDuoBaoInfo(data: PB_SCDuoBaoInfo){
        this.duobao_info = []
        for(var index in data.dataList){
            this.duobao_info.push(data.dataList[Number(index)])
        }
        this.flush_info.needflush = this.flush_info.needflush + 1
    }
    public SetSCDuoBaoItemInfo(data: PB_SCDuoBaoItemInfo){
        this.duobao_item_info[data.duobaoType] = data.itemList

        this.flush_info.needflush = this.flush_info.needflush + 1
    }
    public SetSCDuoBaoRecordInfo(data: PB_SCDuoBaoRecordInfo){
        this.duobao_record[data.duobaoType] = data.recordList

        this.flush_info.needflush = this.flush_info.needflush + 1
    }

    public SetJumpPlay(flag:boolean){
        this.jump_play = flag
    }
    public GetJumpPlay(){
        return this.jump_play
    }

    public GetLuckProgress(type:number){
        var cfg = CfgDuoBaoData.jifen_jiangli
        let net_info = this.duobao_info[type]
        let fix_list = []
        for(var index in cfg){
            if(cfg[index].duobao_type == type){
                let got_flag = false
                if(net_info!=null)
                {
                    got_flag = net_info.fetchFlag.toString(2).split("").reverse().map(Number)[cfg[index].level]==1
                }
                let info = {
                    level:cfg[index].level,
                    integral:cfg[index].integral,
                    item:cfg[index].win[0],
                    got_flag:got_flag,
                }

                fix_list.push(info)
            }
        }

        fix_list.sort((a ,b ) => a.integral - b.integral)

        

        return {
            prog_list:fix_list,
            prog_num:net_info.integral,
            p_max:fix_list[fix_list.length-1].integral,
            p_value:net_info.integral,
            free_refresh_num:net_info.freeRefreshNum,
            free_refresh_time:net_info.freeRefreshTime,
        }
    }

    public GetItemParam(type:number,curNum?:number)
    {
        let CurNum = curNum? curNum:10;
        let item_id = type == 0 ? CfgDuoBaoData.other[0].chuji_id : CfgDuoBaoData.other[0].gaoji_id
        let num = BagData.Inst().getItemNum(item_id)
        let flag_one = num >= 1
        let flag_ten = num >= CurNum
        let ten_str = TextHelper.ColorStr(num + "/" + CurNum,flag_ten ? COLORSTR.Green3 :  COLORSTR.Red5)
        let one_str = TextHelper.ColorStr(num + "/1",flag_one ? COLORSTR.Green3 :  COLORSTR.Red5)
        return {
            item_id:item_id,
            num:num,
            ten_str:ten_str,
            one_str:one_str,
            flag_ten:flag_ten,
            flag_one:flag_one,
        }
    }

    public GetRecordList(type:number){
        let net_info = this.duobao_record[type]

        let fix_list = []
        for(var index in net_info){
            var co = Item.GetConfig(net_info[index].itemId);
            let color = Item.GetColor(net_info[index].itemId);
            let str = TextHelper.Format(Language.LoopMine.RecordCell,
                TextHelper.ColorStr(DataHelper.BytesToString(net_info[index].name),COLORSTR.Blue2),
                TextHelper.ColorStr(co.name,QualityColorOLStr[color]))
            
            let info = {
                rec_str:str,
                order:Number(index),
            }
            fix_list.push(info)
        }

        fix_list.sort((a, b) => b.order - a.order);

        return fix_list
    }

    public SetLoopMark(type:number,time:number) {
        this.draw_mark = this.duobao_item_info[type]
        this.draw_mark_times = time
    }
    public ClearLoopMark(){ 
        this.draw_mark = null 
        this.draw_mark_times = null
    }
    public IsLoopMark(){ return this.draw_mark == null }

    public SetLoopMineView(view:any){ this.view = view }
    public GetLoopMineView(){ return this.view }

    public GetLoopParam(type:number){
        let flag = this.IsLoopMark()

        let change_list = []
        let play_list = []
        
        if(!flag){
            for(var index in this.duobao_item_info[type]){
                // LogError("chekc!!",index,this.duobao_item_info[type][index].getNum,this.draw_mark[index].getNum)
                let checker = this.duobao_item_info[type][index]
                let marker = this.draw_mark[index]
                if(checker.getNum != marker.getNum || (checker.getNum == 0 && marker.getNum > 0))
                {
                    change_list.push(index) 
                }
            }
            
            // LogError("?ASFD h",change_list)
            // 根据标记生成演出
            if(this.draw_mark_times == 1){
                // for (let j = 0; j < 1; j++) {
                //     for (let i = 0; i < 8; i++) {
                //         for (let times = 0; times < 10; times++) {
                //             play_list.push(i)
                //         }
                //     }
                // }

                for (let j = 0; j < 4; j++) {
                    for (let i = 0; i < 8; i++) {
                        for (let times = 0; times < 3; times++) {
                            play_list.push(i)
                        }
                    }
                }

                for (let j = 0; j < 1; j++) {
                    for (let i = 0; i < 8; i++) {
                        for (let z = 0; z < 8; z++) {
                            play_list.push(i)
                        }
                    }
                }

                for (let i = 0; i < Number(change_list[0]) + 1; i++) {
                    for (let j = 0; j < 16; j++) {
                        play_list.push(i)
                    }
                }
            }
            else
            {
                for (let j = 0; j < 4; j++) {
                    for (let i = 0; i < 8; i++) {
                        for (let times = 0; times < 3; times++) {
                            play_list.push(i)
                        }
                    }
                }

                for (let j = 0; j < 1; j++) {
                    for (let i = 0; i < 8; i++) {
                        for (let z = 0; z < 8; z++) {
                            play_list.push(i)
                        }
                    }
                }
                
                for(let j = 0;j<change_list.length;j++){
                    for(let i = 0;i<16;i++){
                        play_list.push(change_list[j])
                    }}
            }
        }

        let item_list = []
        for(var index in this.duobao_item_info[type]){
            let base = this.duobao_item_info[type][index]
            let cfg = null

            for(var c_index in CfgDuoBaoData.duobao ){
                if(CfgDuoBaoData.duobao[c_index].index == base.index){
                    cfg = CfgDuoBaoData.duobao[c_index]
                    break
                }
            }
            
            let info = {
                item:cfg.win[0],
                last_time:cfg.acquire_num - base.getNum,
            }
            item_list.push(info)
        }
        return {
            show_type:type,
            play_list:play_list,
            itemlist:item_list,
        }
    }

    public WithDrawTime(type:number){
        for(var index in this.duobao_item_info[type]){
            let base = this.duobao_item_info[type][index]
            let cfg = null

            for(var c_index in CfgDuoBaoData.duobao ){
                if(CfgDuoBaoData.duobao[c_index].index == base.index){
                    cfg = CfgDuoBaoData.duobao[c_index]
                    break
                }
            }

            if((cfg.acquire_num - base.getNum) > 0){

                return true
            }
        }
        return false
    }

    public MarkItemNotice(param:any){ this.mark_parm = param }
    public GetMarkItemNotice(){ return this.mark_parm }
    public ClearItemNotice(){ this.mark_parm = null }

    public GetRedNum()
    {
        let is_open = FunOpen.Inst().GetFunIsOpen(Mod.LoopMine.View).is_open;
        if(!is_open){
            return 0
        }

        if(this.duobao_info.length == 0)
        {
            return 0
        }
        
        let param_1 = this.GetItemParam(0)
        if(param_1.flag_one){ 
            return 1 
        }

        let param_2 = this.GetItemParam(1)
        if(param_2.flag_one){ 
            return 1 
        }

        let prog_param_1 = LoopMineData.Inst().GetLuckProgress(0)
        let list_1 = prog_param_1.prog_list
        for(var index in list_1)
        {
            if(!list_1[index].got_flag && prog_param_1.prog_num >= list_1[index].integral){
                return 1
            }
        }
        // let prog_param_2 = LoopMineData.Inst().GetLuckProgress(1)
        // let list_2 = prog_param_2.prog_list
        // for(var index in list_2)
        // {
        //     if(!list_2[index].got_flag && prog_param_2.prog_num >= list_2[index].integral){
        //         return 1
        //     }
        // }

        return 0
    }
}